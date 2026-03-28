"""Configuration management for Verdustry backend."""

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))


def normalize_database_url(database_url: str) -> str:
    """Normalize PostgreSQL URLs to use psycopg driver for SQLAlchemy."""
    if database_url.startswith("postgres://"):
        return re.sub(r"^postgres://", "postgresql+psycopg://", database_url, count=1)
    if database_url.startswith("postgresql://"):
        return re.sub(r"^postgresql://", "postgresql+psycopg://", database_url, count=1)
    return database_url


def parse_allowed_origins(raw_value: Optional[str], default_value: str) -> list[str]:
    """Parse ALLOWED_ORIGINS from env.

    Supports:
    - Comma-separated strings: "https://a.com,https://b.com"
    - JSON arrays: "[\"https://a.com\", \"https://b.com\"]"
    - Single origin: "https://a.com"
    """
    raw = (raw_value if raw_value is not None else default_value).strip()
    if not raw:
        raw = default_value

    def normalize_origin(value: str) -> str:
        origin = value.strip()
        if (origin.startswith('"') and origin.endswith('"')) or (
            origin.startswith("'") and origin.endswith("'")
        ):
            origin = origin[1:-1].strip()
        # Origins should not include a trailing slash
        origin = origin.rstrip("/")
        return origin

    if raw.startswith("["):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                normalized = [normalize_origin(str(item)) for item in parsed]
                return [item for item in normalized if item]
        except json.JSONDecodeError:
            pass

    parts = [normalize_origin(part) for part in raw.split(",")]
    return [part for part in parts if part]


def merge_allowed_origins(env_value: Optional[str], defaults: list[str]) -> list[str]:
    """Merge ALLOWED_ORIGINS env value with a safe default allow-list.

    Rationale: hosting platforms sometimes set ALLOWED_ORIGINS and accidentally
    omit the real frontend origin; merging keeps the app reachable while still
    allowing explicit overrides.
    """
    parsed = parse_allowed_origins(env_value, ",".join(defaults))
    # Preserve order: env first, then defaults; de-duplicate.
    merged: list[str] = []
    for origin in [*parsed, *defaults]:
        if origin and origin not in merged:
            merged.append(origin)
    return merged


class Settings:
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/Verdustry_db"
    )
    DATABASE_URL = normalize_database_url(DATABASE_URL)
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "false").lower() == "true"

    # Startup DB initialization behavior
    # When true, the app will attempt to create/verify tables on startup.
    DB_INIT_ON_STARTUP: bool = os.getenv("DB_INIT_ON_STARTUP", "true").lower() == "true"
    # Hard timeout for startup DB init (seconds). Prevents uvicorn from waiting forever.
    DB_INIT_TIMEOUT_SECONDS: float = float(os.getenv("DB_INIT_TIMEOUT_SECONDS", "30"))

    # Connection and statement timeouts (PostgreSQL only)
    DB_CONNECT_TIMEOUT_SECONDS: int = int(os.getenv("DB_CONNECT_TIMEOUT_SECONDS", "10"))
    # Server-side statement timeout (milliseconds). Applies to DDL during create_all.
    DB_STATEMENT_TIMEOUT_MS: int = int(os.getenv("DB_STATEMENT_TIMEOUT_MS", "15000"))

    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # CORS
    # Prototype/debug switch: allow any origin (NOT recommended for production)
    CORS_ALLOW_ALL: bool = os.getenv("CORS_ALLOW_ALL", "false").lower() == "true"

    _DEFAULT_ALLOWED_ORIGINS: list[str] = [
        "https://verdustry.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    ALLOWED_ORIGINS: list[str] = merge_allowed_origins(
        os.getenv("ALLOWED_ORIGINS"),
        _DEFAULT_ALLOWED_ORIGINS,
    )

    # Optional regex to match origins (useful for Vercel preview/prod domains)
    # Example: ^https://.*\\.vercel\\.app$
    ALLOWED_ORIGIN_REGEX: Optional[str] = os.getenv("ALLOWED_ORIGIN_REGEX")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "Verdustry-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Google APIs
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY")
    GOOGLE_CHAT_SPACE_ID: str = os.getenv(
        "GOOGLE_CHAT_SPACE_ID",
        "spaces/AAAAC3lJWXo"
    )
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")

    # Upload
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    # OCR (Tesseract)
    # Full path to tesseract binary if it's not in PATH (Windows often needs this)
    TESSERACT_CMD: Optional[str] = os.getenv("TESSERACT_CMD")
    # Where to find traineddata files (tessdata). If set, we propagate it to OCR calls.
    TESSDATA_PREFIX: Optional[str] = os.getenv("TESSDATA_PREFIX")
    # Languages for OCR. Arabic requires the 'ara' traineddata.
    TESSERACT_LANGUAGES: str = os.getenv("TESSERACT_LANGUAGES", "eng+fra+ara")
    # Limit rendered PDF pages for OCR to keep latency reasonable
    OCR_PDF_MAX_PAGES: int = int(os.getenv("OCR_PDF_MAX_PAGES", "2"))

    # OCR engine selection
    OCR_ENGINE: str = os.getenv("OCR_ENGINE", "tesseract").strip().lower()

    # PaddleOCR
    PADDLE_OCR_LANGS: str = os.getenv("PADDLE_OCR_LANGS", "fr ar")
    PADDLE_PDF_MAX_PAGES: int = int(os.getenv("PADDLE_PDF_MAX_PAGES", str(OCR_PDF_MAX_PAGES)))

    # Ollama (local) extraction
    OLLAMA_EXTRACTION_ENABLED: bool = os.getenv("OLLAMA_EXTRACTION_ENABLED", "false").strip().lower() in (
        "1",
        "true",
        "yes",
        "y",
        "on",
    )
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").strip()
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b-instruct").strip()

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
