"""FastAPI backend for Verdustry carbon emissions tracking system."""

import asyncio
import base64
import csv
import io
import json
import logging
import time
from datetime import datetime, timedelta
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import func, extract, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

import auth_utils
import models
from database import engine, get_db
from chatbot_service import chatbot
from ai_chatbot import ai_chatbot
from role_routes import router as role_router
from super_admin_routes import router as super_admin_router
from financial_routes import router as financial_router
from scope3_routes import router as scope3_router
from role_utils import create_default_roles_and_permissions
from config import get_settings
from ocr_utils import build_sustainability_extraction, run_ocr, serialize_extraction

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Passlib can emit a noisy warning/traceback when combined with newer bcrypt
# versions (authentication still works). Keep logs clean.
logging.getLogger("passlib.handlers.bcrypt").setLevel(logging.ERROR)

# Load environment variables from .env file
load_dotenv()

# Get settings
settings = get_settings()

# Lifespan context manager to handle startup and shutdown
@asynccontextmanager
async def lifespan(_: FastAPI):
    """Manage application lifecycle."""
    # Startup
    try:
        logger.info("🚀 Initializing Verdustry backend...")
        if settings.CORS_ALLOW_ALL:
            logger.info("🌐 CORS mode=ALLOW_ALL (prototype) allow_credentials=%s", False)
        else:
            logger.info(
                "🌐 CORS mode=ALLOW_LIST allow_origins=%s allow_origin_regex=%s allow_credentials=%s",
                settings.ALLOWED_ORIGINS,
                settings.ALLOWED_ORIGIN_REGEX,
                True,
            )

        db_ready = False

        async def _check_db_connectivity() -> None:
            # `engine.connect()` is sync; run it off the event loop.
            def _connect_once() -> None:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))

            await asyncio.to_thread(_connect_once)

        # Create all tables (including role tables) - optional
        if settings.DB_INIT_ON_STARTUP:
            start = time.perf_counter()
            try:
                logger.info(
                    "🗄️  Creating/verifying database tables (timeout=%ss)...",
                    settings.DB_INIT_TIMEOUT_SECONDS,
                )
                await asyncio.wait_for(
                    asyncio.to_thread(lambda: models.Base.metadata.create_all(bind=engine)),
                    timeout=settings.DB_INIT_TIMEOUT_SECONDS,
                )
                logger.info("✅ Database tables ready! (%.2fs)", time.perf_counter() - start)
            except TimeoutError:
                logger.error(
                    "❌ Database init timed out after %ss (check network/DATABASE_URL)",
                    settings.DB_INIT_TIMEOUT_SECONDS,
                )
            except Exception as migration_error:  # pylint: disable=broad-except
                logger.error(
                    "❌ Database initialization failed (check DATABASE_URL): %s",
                    migration_error,
                    exc_info=True,
                )
        else:
            logger.info("🗄️  DB init on startup disabled (DB_INIT_ON_STARTUP=false)")

        # Connectivity check (fast fail) before doing any DB-dependent startup tasks
        try:
            await asyncio.wait_for(
                _check_db_connectivity(),
                timeout=max(1.0, float(settings.DB_CONNECT_TIMEOUT_SECONDS) + 2.0),
            )
            db_ready = True
        except TimeoutError:
            logger.error("❌ Database connectivity check timed out")
        except Exception as connectivity_error:  # pylint: disable=broad-except
            logger.error("❌ Database is not reachable: %s", connectivity_error)

        if db_ready:
            db = next(get_db())
            try:
                logger.info("🔐 Setting up roles and permissions...")
                create_default_roles_and_permissions(db)
                logger.info("✅ Default roles and permissions initialized!")
            except Exception as startup_error:  # pylint: disable=broad-except
                logger.error("❌ Error during startup: %s", startup_error, exc_info=True)
            finally:
                db.close()
        else:
            logger.warning("⚠️ Skipping role initialization because DB is unavailable")
    except Exception as lifespan_error:  # pylint: disable=broad-except
        logger.error("❌ Startup failed: %s", lifespan_error)

    yield

    # Shutdown
    logger.info("🛑 Shutting down Verdustry backend...")



app = FastAPI(
    title="Verdustry API",
    description="Carbon emissions tracking and sustainability platform",
    version="1.0.0",
    lifespan=lifespan
)

# Include role routes
app.include_router(role_router, prefix="/api", tags=["roles"])

# Include super admin routes
app.include_router(super_admin_router, prefix="/api", tags=["super-admin"])

# Include financial routes
app.include_router(financial_router, prefix="", tags=["financial"])

# Include Scope 3 routes
app.include_router(scope3_router, prefix="", tags=["scope3"])

# CORS Configuration
cors_allow_origins = ["*"] if settings.CORS_ALLOW_ALL else settings.ALLOWED_ORIGINS
cors_allow_origin_regex = None if settings.CORS_ALLOW_ALL else settings.ALLOWED_ORIGIN_REGEX
cors_allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins,
    allow_origin_regex=cors_allow_origin_regex,
    allow_credentials=cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def root():
    """Basic service check."""
    return {
        "status": "ok",
        "service": "Verdustry API",
    }


@app.get("/health", tags=["health"])
def health():
    """Health endpoint for uptime checks."""
    return {"status": "ok"}


class UserCreate(BaseModel):
    """User registration schema with validation."""
    business_name: str = Field(..., min_length=1, max_length=255, description="Business name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=255, description="Password (min 8 chars)")

    class Config:
        json_schema_extra = {
            "example": {
                "business_name": "Acme Corp",
                "email": "admin@acme.com",
                "password": "securepassword123"
            }
        }


class UserLogin(BaseModel):
    """User login schema with validation."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=1, description="Password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@acme.com",
                "password": "securepassword123"
            }
        }


class EmissionCreate(BaseModel):
    """Emission creation schema with validation."""
    business_id: int = Field(..., gt=0, description="Business ID")
    type: str = Field(..., min_length=1, description="Emission type (Electricity, Natural Gas, Fuel, Waste)")
    value: float = Field(..., gt=0, description="Emission value")
    unit: str = Field(..., min_length=1, description="Unit (kWh, m3, Liters)")

    class Config:
        json_schema_extra = {
            "example": {
                "business_id": 1,
                "type": "Electricity",
                "value": 100.5,
                "unit": "kWh"
            }
        }


@app.get("/register", tags=["auth"])
def register_info():
    """Human-friendly endpoint for browsers (POST is required for registration)."""
    return {
        "status": "ok",
        "message": "Use POST /register with JSON: {business_name, email, password}",
    }


@app.post("/register", status_code=status.HTTP_201_CREATED, tags=["auth"])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (business)."""
    try:
        # Check if email already exists
        existing_user = db.query(models.User).filter(
            models.User.email == user_data.email.lower()
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        new_user = models.User(
            business_name=user_data.business_name,
            email=user_data.email.lower(),
            password=auth_utils.hash_password(user_data.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info("✅ New user registered: %s", new_user.email)
        return {
            "status": "success",
            "message": "User registered successfully",
            "user_id": new_user.id,
            "business_name": new_user.business_name
        }

    except OperationalError as e:
        logger.error("❌ Database unavailable during registration: %s", e, exc_info=True)
        try:
            db.rollback()
        except Exception:  # pylint: disable=broad-except
            pass
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from e
    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Registration error: %s", e, exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        ) from e


@app.get("/login", tags=["auth"])
def login_info():
    """Human-friendly endpoint for browsers (POST is required for login)."""
    return {
        "status": "ok",
        "message": "Use POST /login with JSON: {email, password}",
    }


@app.post("/login", status_code=status.HTTP_200_OK, tags=["auth"])
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user with email and password."""
    try:
        # Query user by email (case-insensitive)
        user = db.query(models.User).filter(
            models.User.email == credentials.email.lower()
        ).first()

        if not user:
            logger.warning("❌ Login failed: User not found - %s", credentials.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not auth_utils.verify_password(credentials.password, str(user.password)):  # type: ignore
            logger.warning("❌ Login failed: Invalid password - %s", credentials.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        logger.info("✅ User logged in: %s", user.email)
        # Generate a simple token based on user_id and email
        import hashlib
        token = hashlib.sha256(f"{user.id}:{user.email}:{user.password}".encode()).hexdigest()
        return {
            "status": "success",
            "message": "Login successful",
            "token": token,
            "business_name": user.business_name,
            "user_id": user.id,
            "email": user.email,
            "is_super_admin": user.is_super_admin
        }

    except OperationalError as e:
        logger.error("❌ Database unavailable during login: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from e
    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Login error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        ) from e

@app.post("/upload-profile-picture", tags=["uploads"])
async def upload_profile_picture(
    file: UploadFile = File(...),
    business_id: str | None = None
):
    """Upload profile picture for a business."""
    try:
        logger.info("📸 Profile picture upload for business ID: %s", business_id)

        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            logger.warning("❌ Invalid file type: %s", file.content_type)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. Only images allowed."
            )

        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(exist_ok=True)

        # Read file content
        contents = await file.read()

        # Validate file size
        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(contents) > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        # Encode to base64
        base64_image = base64.b64encode(contents).decode('utf-8')
        image_data_url = f"data:{file.content_type};base64,{base64_image}"

        logger.info("✅ Profile picture uploaded: %s", file.filename)

        return {
            "status": "success",
            "message": "Profile picture uploaded successfully",
            "image_url": image_data_url,
            "filename": file.filename
        }

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Upload error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile picture upload failed"
        ) from e


@app.post("/documents/scan", tags=["documents"])
async def scan_document(
    file: UploadFile = File(...),
    business_id: int = Form(...),
    category: str = Form("other"),
):
    """OCR scan a document (image/PDF) and store sustainability-focused extraction."""
    try:
        if not file.content_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing content type",
            )

        contents = await file.read()

        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(contents) > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB",
            )

        if not (file.content_type.startswith("image/") or file.content_type == "application/pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type for OCR: {file.content_type}",
            )

        ocr_engine = getattr(settings, "OCR_ENGINE", "tesseract")
        used_ocr_engine = ocr_engine
        used_ocr_language = (
            (settings.PADDLE_OCR_LANGS or "") if ocr_engine == "paddle" else settings.TESSERACT_LANGUAGES
        )

        async def _do_tesseract(lang: str) -> str:
            nonlocal used_ocr_engine, used_ocr_language
            used_ocr_engine = "tesseract"
            used_ocr_language = lang
            return await asyncio.to_thread(
                run_ocr,
                file_bytes=contents,
                content_type=file.content_type or "",
                lang=lang,
                tesseract_cmd=settings.TESSERACT_CMD,
                pdf_max_pages=settings.OCR_PDF_MAX_PAGES,
                tessdata_prefix=getattr(settings, "TESSDATA_PREFIX", None),
            )

        async def _do_paddle() -> str:
            nonlocal used_ocr_engine, used_ocr_language
            used_ocr_engine = "paddle"
            used_ocr_language = settings.PADDLE_OCR_LANGS or ""
            from paddle_ocr_utils import run_paddle_ocr

            langs = [p.strip() for p in (settings.PADDLE_OCR_LANGS or "fr ar").split() if p.strip()]
            return await asyncio.to_thread(
                run_paddle_ocr,
                file_bytes=contents,
                content_type=file.content_type or "",
                langs=langs,
                pdf_max_pages=getattr(settings, "PADDLE_PDF_MAX_PAGES", settings.OCR_PDF_MAX_PAGES),
            )

        # Run OCR off the event-loop
        async def _do_ocr() -> str:
            if ocr_engine == "paddle":
                return await _do_paddle()
            return await _do_tesseract(settings.TESSERACT_LANGUAGES)

        try:
            ocr_text = await _do_ocr()
        except Exception as ocr_error:  # pylint: disable=broad-except
            msg = str(ocr_error)

            # If PaddleOCR isn't installed (common on some Python versions/platforms),
            # fall back to the Tesseract path automatically.
            if ocr_engine == "paddle" and (
                "Missing PaddleOCR deps" in msg or "no module named 'paddleocr'" in msg.lower()
            ):
                logger.warning("⚠️ PaddleOCR unavailable; falling back to Tesseract (%s)", msg)
                ocr_text = await _do_tesseract(settings.TESSERACT_LANGUAGES)
            # Legacy fallback for Tesseract language packs.
            elif used_ocr_engine == "tesseract" and (
                "Failed loading language" in msg or "Error opening data file" in msg
            ):
                ocr_text = await _do_tesseract("eng")
            else:
                raise

        extraction = build_sustainability_extraction(ocr_text, category=category)

        # Store in DB
        db = next(get_db())
        try:
            # Validate business exists
            business = db.query(models.User).filter(models.User.id == business_id).first()
            if not business:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Business not found",
                )

            scan = models.DocumentScan(
                business_id=business_id,
                filename=file.filename or "document",
                category=category,
                content_type=file.content_type,
                ocr_language=used_ocr_language,
                detected_language=extraction.detected_language,
                ocr_text=extraction.ocr_text,
                filtered_text=extraction.filtered_text,
                extracted_json=serialize_extraction(extraction),
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)

            # Capture the identifier early: later commits may expire ORM objects,
            # and we close the session before returning the response.
            scan_id = scan.id

            extracted_doc = models.ExtractedDoc(
                business_id=business_id,
                document_scan_id=scan_id,
                filename=file.filename or "document",
                category=category,
                extracted_json=scan.extracted_json,
            )
            db.add(extracted_doc)

            # Persist extracted invoice line items (if present)
            rows = extraction.fields.get("consumptionRows") or []
            if isinstance(rows, list) and rows:
                for r in rows:
                    libelle = (r or {}).get("libelle")
                    if not libelle:
                        continue
                    item = models.InvoiceLineItem(
                        document_scan_id=scan.id,
                        libelle=str(libelle)[:255],
                        consommation=(None if (r or {}).get("consommation") is None else str((r or {}).get("consommation"))[:100]),
                        montant=(None if (r or {}).get("montant") is None else str((r or {}).get("montant"))[:100]),
                    )
                    db.add(item)

            # Commit extracted doc + any line items.
            try:
                db.commit()
            except OperationalError as e:
                db.rollback()
                # If a new table (like extracted_Doc) wasn't created yet, try to create it
                # and retry once. This helps when DB_INIT_ON_STARTUP was disabled.
                msg = str(e).lower()
                missing_table = (
                    "no such table" in msg
                    or "does not exist" in msg
                    or "undefinedtable" in msg
                ) and ("extracted" in msg or "invoice_line_items" in msg)

                if missing_table:
                    try:
                        models.Base.metadata.create_all(bind=engine)
                        db.commit()
                    except Exception:
                        db.rollback()
                        raise
                else:
                    raise
        except HTTPException:
            db.rollback()
            raise
        except OperationalError as e:
            db.rollback()
            logger.error("❌ Database unavailable during document scan: %s", e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable",
            ) from e
        except Exception as e:  # pylint: disable=broad-except
            db.rollback()
            logger.error("❌ Document scan error: %s", e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Document scan failed",
            ) from e
        finally:
            db.close()

        return {
            "status": "success",
            "document_id": scan_id,
            "keywords": extraction.keywords,
            "detected_language": extraction.detected_language,
            "extractedData": {
                **{k: v for k, v in extraction.fields.items() if v is not None},
                "confidence": extraction.confidence,
            },
        }

    except HTTPException:
        raise
    except RuntimeError as e:
        # Most likely missing system tesseract binary or optional deps.
        logger.error("❌ OCR runtime error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        ) from e
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ OCR unexpected error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OCR failed",
        ) from e


@app.get("/documents/scan", tags=["documents"], include_in_schema=False)
def scan_document_help():
    # Intentionally return 405 so clients calling this endpoint incorrectly
    # get a clear, accurate hint.
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail=(
            "Use POST /documents/scan with multipart/form-data (fields: "
            "file, business_id, optional category)."
        ),
    )


@app.get("/documents/extracted", tags=["documents"])
def list_extracted_docs(
    business_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List persisted extracted docs for a business (used by the dashboard UI)."""
    limit = max(1, min(int(limit), 200))

    business = db.query(models.User).filter(models.User.id == business_id).first()
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")

    try:
        rows = (
            db.query(models.ExtractedDoc)
            .filter(models.ExtractedDoc.business_id == business_id)
            .order_by(models.ExtractedDoc.created_at.desc())
            .limit(limit)
            .all()
        )
    except OperationalError as e:
        # If the table isn't created yet in this DB, don't hard-fail the UI.
        # (Common when DB_INIT_ON_STARTUP=false and migrations weren't run.)
        msg = str(e).lower()
        if ("no such table" in msg or "does not exist" in msg or "undefinedtable" in msg) and "extracted" in msg:
            return {"status": "success", "items": []}
        raise

    items: list[dict] = []
    for r in rows:
        extracted_data = None
        if r.extracted_json:
            try:
                payload = json.loads(r.extracted_json)
                fields = payload.get("fields") if isinstance(payload, dict) else None
                confidence = payload.get("confidence") if isinstance(payload, dict) else None
                if isinstance(fields, dict):
                    extracted_data = {**{k: v for k, v in fields.items() if v is not None}}
                    if confidence is not None:
                        extracted_data["confidence"] = confidence
            except Exception:
                extracted_data = None

        items.append(
            {
                "id": int(r.id),
                "document_id": int(r.document_scan_id),
                "filename": r.filename,
                "category": r.category,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "extractedData": extracted_data,
            }
        )

    return {"status": "success", "items": items}

@app.post("/add-emission", status_code=status.HTTP_201_CREATED, tags=["emissions"])
def add_emission(data: EmissionCreate, db: Session = Depends(get_db)):
    """Add a new emission log."""
    try:
        logger.info("📝 Emission log: Type=%s, Value=%s, Business=%s", data.type, data.value, data.business_id)
        # Verify business exists
        business = db.query(models.User).filter(models.User.id == data.business_id).first()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found"
            )

        # Calculate CO2 impact using standard factors
        factors = {
            "Electricity": 0.4,
            "Natural Gas": 2.0,
            "Fuel": 2.7,
            "Waste": 0.5
        }
        impact = round(data.value * factors.get(data.type, 0.1), 2)

        # Create emission record
        new_log = models.Emission(
            business_id=data.business_id,
            type=data.type,
            value=data.value,
            unit=data.unit,
            co2_impact=impact
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)

        logger.info("✅ Emission saved: ID=%s, CO2=%skg", new_log.id, impact)

        return {
            "status": "success",
            "message": "Emission logged successfully",
            "impact": impact,
            "id": new_log.id,
            "recorded_at": new_log.recorded_at.isoformat() if new_log.recorded_at else None
        }

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Emission creation error: %s", e, exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create emission record"
        ) from e


@app.delete("/delete-emission/{emission_id}", status_code=status.HTTP_200_OK, tags=["emissions"])
def delete_emission(emission_id: int, db: Session = Depends(get_db)):
    """Delete an emission record."""
    try:
        logger.info("🗑️  Deleting emission ID: %s", emission_id)

        emission = db.query(models.Emission).filter(
            models.Emission.id == emission_id
        ).first()

        if not emission:
            logger.warning("❌ Emission not found: %s", emission_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emission not found"
            )

        db.delete(emission)
        db.commit()

        logger.info("✅ Emission deleted: ID=%s", emission_id)

        return {
            "status": "success",
            "message": "Emission deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Deletion error: %s", e, exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete emission"
        ) from e


@app.put("/update-emission/{emission_id}", status_code=status.HTTP_200_OK, tags=["emissions"])
def update_emission(
    emission_id: int,
    data: EmissionCreate,
    db: Session = Depends(get_db)
):
    """Update an existing emission record."""
    try:
        logger.info("✏️  Updating emission ID: %s", emission_id)

        emission = db.query(models.Emission).filter(
            models.Emission.id == emission_id
        ).first()

        if not emission:
            logger.warning("❌ Emission not found: %s", emission_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emission not found"
            )

        # Recalculate CO2 impact
        factors = {
            "Electricity": 0.4,
            "Natural Gas": 2.0,
            "Fuel": 2.7,
            "Waste": 0.5
        }
        impact = round(data.value * factors.get(data.type, 0.1), 2)

        # Update fields
        emission.type = data.type  # type: ignore
        emission.value = data.value  # type: ignore
        emission.unit = data.unit  # type: ignore
        emission.co2_impact = impact  # type: ignore

        db.commit()
        db.refresh(emission)

        logger.info("✅ Emission updated: ID=%s, CO2=%skg", emission_id, impact)

        return {
            "status": "success",
            "message": "Emission updated successfully",
            "id": emission.id,
            "type": emission.type,
            "value": emission.value,
            "unit": emission.unit,
            "co2_impact": emission.co2_impact,
            "recorded_at": emission.recorded_at.isoformat() if emission.recorded_at else None
        }

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Update error: %s", e, exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update emission"
        ) from e


@app.get("/api/exchange-rates", tags=["financial"])
def get_exchange_rates(
    base: str = "PKR",
    db: Session = Depends(get_db),
):
    """Return cached exchange rates for a base currency.

    Response shape matches frontend expectation: { base, rates }.
    """
    base_currency = (base or "PKR").upper().strip()

    supported = {"PKR", "USD", "EUR", "GBP", "JPY", "CNY", "AED"}
    if base_currency not in supported:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported base currency: {base_currency}",
        )

    rows = (
        db.query(models.ExchangeRate)
        .filter(models.ExchangeRate.from_currency == base_currency)
        .all()
    )

    rates: dict[str, float] = {
        r.to_currency: float(r.rate)
        for r in rows
        if r.to_currency and r.rate is not None
    }

    rates[base_currency] = 1.0

    if len(rates) <= 1:
        fallback = {
            "PKR": {"PKR": 1.0, "USD": 0.0036, "EUR": 0.0033, "GBP": 0.0028, "JPY": 0.55, "CNY": 0.026, "AED": 0.013},
            "USD": {"USD": 1.0, "PKR": 275.0, "EUR": 0.92, "GBP": 0.79, "JPY": 150.0, "CNY": 7.2, "AED": 3.67},
            "EUR": {"EUR": 1.0, "USD": 1.09, "PKR": 300.0, "GBP": 0.86, "JPY": 163.0, "CNY": 7.8, "AED": 4.0},
            "GBP": {"GBP": 1.0, "USD": 1.27, "PKR": 350.0, "EUR": 1.16, "JPY": 190.0, "CNY": 9.1, "AED": 4.7},
            "JPY": {"JPY": 1.0, "USD": 0.0067, "PKR": 1.8, "EUR": 0.0061, "GBP": 0.0053, "CNY": 0.048, "AED": 0.024},
            "CNY": {"CNY": 1.0, "USD": 0.14, "PKR": 38.0, "EUR": 0.13, "GBP": 0.11, "JPY": 20.8, "AED": 0.51},
            "AED": {"AED": 1.0, "USD": 0.27, "PKR": 75.0, "EUR": 0.25, "GBP": 0.21, "JPY": 41.0, "CNY": 2.0},
        }
        rates = fallback.get(base_currency, {base_currency: 1.0})

    return {"base": base_currency, "rates": rates}

@app.patch("/update-emission-status/{emission_id}", status_code=status.HTTP_200_OK, tags=["emissions"])
def update_emission_status(
    emission_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    """Update emission status."""
    try:
        logger.info("📊 Updating emission status: ID=%s", emission_id)

        emission = db.query(models.Emission).filter(
            models.Emission.id == emission_id
        ).first()

        if not emission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emission not found"
            )

        status_value = data.get("status", "active")

        # Update status if column exists
        if hasattr(emission, 'status'):
            emission.status = status_value

        db.commit()
        db.refresh(emission)

        logger.info("✅ Emission status updated: %s", status_value)

        return {
            "status": "success",
            "message": f"Status updated to {status_value}",
            "id": emission.id
        }

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Status update error: %s", e, exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update status"
        ) from e


@app.get("/dashboard-stats/{business_id}", tags=["analytics"])
def get_stats(business_id: int, db: Session = Depends(get_db)):
    """Get dashboard statistics for a business."""
    try:
        logger.info("📊 Fetching stats for business ID: %s", business_id)

        # Verify business exists
        business = db.query(models.User).filter(models.User.id == business_id).first()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found"
            )

        # Calculate statistics
        total_co2 = db.query(func.sum(models.Emission.co2_impact)).filter(
            models.Emission.business_id == business_id
        ).scalar() or 0

        total_kwh = db.query(func.sum(models.Emission.value)).filter(
            models.Emission.business_id == business_id,
            models.Emission.type == "Electricity"
        ).scalar() or 0

        total_gas = db.query(func.sum(models.Emission.value)).filter(
            models.Emission.business_id == business_id,
            models.Emission.type == "Natural Gas"
        ).scalar() or 0

        log_count = db.query(models.Emission).filter(
            models.Emission.business_id == business_id
        ).count()

        return {
            "status": "success",
            "total_co2": round(float(total_co2), 2),
            "total_kwh": round(float(total_kwh), 2),
            "total_gas": round(float(total_gas), 2),
            "log_count": int(log_count)
        }

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Stats error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        ) from e

@app.get("/recent-logs/{business_id}", tags=["analytics"])
def get_logs(business_id: int, db: Session = Depends(get_db)):
    """Get recent emission logs for a business."""
    try:
        return db.query(models.Emission).filter(
            models.Emission.business_id == business_id
        ).order_by(
            models.Emission.recorded_at.desc()
        ).limit(10).all()
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Error fetching logs: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch logs"
        ) from e


@app.get("/category-breakdown/{business_id}", tags=["analytics"])
def get_category_breakdown(business_id: int, db: Session = Depends(get_db)):
    """Get CO2 impact breakdown by emission type."""
    try:
        results = db.query(
            models.Emission.type,
            func.sum(models.Emission.co2_impact).label("impact")
        ).filter(
            models.Emission.business_id == business_id
        ).group_by(
            models.Emission.type
        ).all()

        return {
            "status": "success",
            "data": [
                {"type": row[0], "impact": round(float(row[1]), 2)}
                for row in results
            ]
        }
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Error fetching category breakdown: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch category breakdown"
        ) from e

@app.get("/monthly-trends/{business_id}", tags=["analytics"])
def get_monthly_trends(business_id: int, db: Session = Depends(get_db)):
    """Get monthly CO2 impact for the last 6 months."""
    try:
        # Get last 6 months of data
        six_months_ago = datetime.now() - timedelta(days=180)

        results = db.query(
            extract('year', models.Emission.recorded_at).label('year'),
            extract('month', models.Emission.recorded_at).label('month'),
            func.sum(models.Emission.co2_impact).label('total_impact')
        ).filter(
            models.Emission.business_id == business_id,
            models.Emission.recorded_at >= six_months_ago
        ).group_by(
            extract('year', models.Emission.recorded_at),
            extract('month', models.Emission.recorded_at)
        ).order_by(
            extract('year', models.Emission.recorded_at),
            extract('month', models.Emission.recorded_at)
        ).all()

        # Month names for formatting
        months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        # Format data
        data = []
        for year, month, impact in results:
            month_int = int(month) if month else 1
            data.append({
                "month": months[month_int],
                "impact": round(float(impact), 2),
                "year": int(year)
            })

        return {
            "status": "success",
            "data": sorted(data, key=lambda x: (x['year'], datetime.strptime(x['month'], '%b').month))
        }

    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Error fetching trends: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch trends"
        ) from e

@app.get("/export-data/{business_id}", tags=["exports"])
def export_data(business_id: int, db: Session = Depends(get_db)):
    """Export all emissions data as CSV."""
    try:
        logger.info("📥 CSV export request for business ID: %s", business_id)

        # Validate business exists
        business = db.query(models.User).filter(models.User.id == business_id).first()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found"
            )

        # Fetch all emissions
        emissions = db.query(models.Emission).filter(
            models.Emission.business_id == business_id
        ).order_by(
            models.Emission.recorded_at.desc()
        ).all()

        logger.info("✅ Found %s emissions to export", len(emissions))

        if not emissions:
            return {
                "status": "success",
                "message": "No emissions data available for export",
                "count": 0
            }

        # Create CSV in memory
        output = io.StringIO()
        fieldnames = [
            'Date Recorded',
            'Emission Source',
            'Usage Amount',
            'Unit',
            'Carbon Footprint (kg CO2e)'
        ]

        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for emission in emissions:
            date_str = emission.recorded_at.strftime(
                '%B %d, %Y at %I:%M %p'
            ) if emission.recorded_at else 'N/A'

            writer.writerow({
                'Date Recorded': date_str,
                'Emission Source': emission.type,
                'Usage Amount': round(float(emission.value), 2),  # type: ignore
                'Unit': emission.unit,
                'Carbon Footprint (kg CO2e)': round(float(emission.co2_impact), 2)  # type: ignore
            })

        csv_content = output.getvalue()
        output.close()

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"Verdustry_report_{business.business_name.replace(' ', '_')}_{timestamp}.csv"

        logger.info("📤 Streaming CSV: %s (%s records)", filename, len(emissions))

        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Export error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export data"
        ) from e

@app.get("/export-pdf/{business_id}", tags=["exports"])
def export_pdf(business_id: int, db: Session = Depends(get_db)):
    """Generate and export PDF report of emissions."""
    try:
        logger.info("📥 PDF export request for business ID: %s", business_id)

        # Validate business exists
        business = db.query(models.User).filter(models.User.id == business_id).first()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found"
            )

        # Fetch emissions
        emissions = db.query(models.Emission).filter(
            models.Emission.business_id == business_id
        ).order_by(
            models.Emission.recorded_at.desc()
        ).all()

        logger.info("✅ Found %s emissions for PDF", len(emissions))

        # Calculate statistics
        total_co2 = sum(e.co2_impact for e in emissions)
        avg_co2 = total_co2 / len(emissions) if emissions else 0

        # Group by type
        by_type = {}
        for emission in emissions:
            if emission.type not in by_type:
                by_type[emission.type] = {"count": 0, "co2": 0}
            by_type[emission.type]["count"] += 1
            by_type[emission.type]["co2"] += emission.co2_impact

        # Import PDF libraries
        try:
            from io import BytesIO
            from reportlab.lib.pagesizes import letter
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import (
                SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            )
            from reportlab.lib import colors
            from reportlab.lib.enums import TA_CENTER
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PDF library not installed"
            ) from exc

        # Create PDF
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )

        elements = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#10b981'),
            spaceAfter=24,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=10,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        )

        # Title
        elements.append(
            Paragraph("Verdustry Emissions Report", title_style)
        )
        elements.append(
            Paragraph(
                f"Sustainability Report for {business.business_name}",
                subtitle_style
            )
        )

        # Summary
        elements.append(
            Paragraph("Executive Summary", heading_style)
        )

        summary_data = [
            ["Metric", "Value"],
            ["Total Records", str(len(emissions))],
            ["Total CO2 Emissions", f"{total_co2:.2f} kg CO2e"],
            ["Average per Entry", f"{avg_co2:.2f} kg CO2e"],
            ["Report Generated", datetime.now().strftime('%B %d, %Y at %I:%M %p')]
        ]

        summary_table = Table(summary_data, colWidths=[2.5*inch, 2.5*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 0.3*inch))

        # Breakdown by type
        if by_type:
            elements.append(
                Paragraph("Emissions Breakdown by Type", heading_style)
            )

            type_data = [["Type", "Records", "Total CO2 (kg)", "Average (kg)"]]
            for emission_type, stats in sorted(by_type.items()):
                avg = stats["co2"] / stats["count"] if stats["count"] > 0 else 0
                type_data.append([
                    emission_type,
                    str(stats["count"]),
                    f"{stats['co2']:.2f}",
                    f"{avg:.2f}"
                ])

            type_table = Table(
                type_data,
                colWidths=[1.5*inch, 1.2*inch, 1.3*inch, 1.5*inch]
            )
            type_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06b6d4')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
            ]))
            elements.append(type_table)

        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"Verdustry_report_{business.business_name.replace(' ', '_')}_{timestamp}.pdf"

        logger.info("📤 Streaming PDF: %s (%s records)", filename, len(emissions))

        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ PDF export error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF"
        ) from e


class ChatMessageRequest(BaseModel):
    """Chat message request schema."""
    business_id: int = Field(..., gt=0, description="Business ID")
    message: str = Field(..., min_length=1, description="Chat message")
    user_name: str = Field(default="User", description="User name")

    class Config:
        json_schema_extra = {
            "example": {
                "business_id": 1,
                "message": "Help with emissions tracking",
                "user_name": "John"
            }
        }


class StartChatRequest(BaseModel):
    """Start chat request schema."""
    business_id: int = Field(..., gt=0, description="Business ID")


@app.post("/start-chat", tags=["chat"])
async def start_chat(request: StartChatRequest, db: Session = Depends(get_db)):
    """Initiate a new chat session."""
    try:
        logger.info("💬 Starting chat for business ID: %s", request.business_id)

        # Get business name
        business_name = "User"
        if request.business_id > 0:
            try:
                business = db.query(models.User).filter(
                    models.User.id == request.business_id
                ).first()
                if business:
                    business_name = business.business_name or "User"
            except Exception:  # pylint: disable=broad-except
                pass

        # Send welcome message
        try:
            await chatbot.send_card_message(
                title="Welcome to Verdustry Support",
                subtitle=f"Hello {business_name}!",
                message_text="Our support team is ready to assist you with:\n"
                            "- Carbon emissions tracking\n"
                            "- Sustainability goals\n"
                            "- Data analysis & reports\n"
                            "- Platform features"
            )
        except Exception:  # pylint: disable=broad-except
            pass

        logger.info("✅ Chat session started")

        return {
            "status": "success",
            "message": "Chat session started"
        }

    except Exception as exc:  # pylint: disable=broad-except
        logger.error("❌ Chat start error: %s", exc, exc_info=True)
        return {
            "status": "success",
            "message": "Chat session started"
        }


@app.post("/send-chat-message", tags=["chat"])
async def send_chat_message(
    request: ChatMessageRequest,
    _: Session = Depends(get_db)
):
    """Send a message and get AI response."""
    try:
        logger.info("💬 Message from %s: %s", request.user_name, request.message[:50])

        async def response_generator():
            """Stream AI responses."""
            try:
                async for chunk in ai_chatbot.get_response(
                    request.message,
                    request.user_name
                ):
                    yield chunk
            except Exception as stream_exc:  # pylint: disable=broad-except
                logger.error("❌ Streaming error: %s", stream_exc, exc_info=True)
                yield "I apologize for the technical difficulty."

        return StreamingResponse(response_generator(), media_type="text/plain")

    except Exception as chat_exc:  # pylint: disable=broad-except
        logger.error("❌ Chat error: %s", chat_exc, exc_info=True)

        async def error_response():
            yield "I apologize for the technical difficulty. Please try again."

        return StreamingResponse(error_response(), media_type="text/plain")


@app.post("/send-support-ticket", tags=["chat"])
async def send_support_ticket(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Send a support ticket."""
    try:
        business = db.query(models.User).filter(
            models.User.id == request.business_id
        ).first()

        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found"
            )

        ticket_message = (
            f"SUPPORT TICKET\n"
            f"Business: {business.business_name}\n"
            f"Email: {business.email}\n"
            f"From: {request.user_name}\n\n"
            f"Message:\n{request.message}"
        )

        result = await chatbot.send_message(ticket_message)

        logger.info("✅ Support ticket sent")

        return result

    except HTTPException:
        raise
    except ValueError as e:
        return {
            "status": "error",
            "message": str(e)
        }
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Support ticket error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send support ticket"
        ) from e


# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Verdustry API",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
