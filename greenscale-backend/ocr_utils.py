"""OCR utilities (Tesseract) + sustainability-focused extraction.

Notes:
- Requires the Tesseract binary installed on the host OS.
- Arabic requires the 'ara' traineddata (e.g. tesseract-ocr-ara).
"""

from __future__ import annotations

import json
import re
import shutil
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

from carbon_utils import ActivityType, calculate_co2_from_activity


@dataclass(frozen=True)
class OcrResult:
    ocr_text: str
    filtered_text: str
    keywords: list[str]
    detected_language: str
    fields: dict[str, Any]
    confidence: int


def parse_tn_consumption_table(text: str) -> list[dict[str, Any]]:
    """Parse Tunisian utility invoice consumption rows from OCR text.

    Expected pattern resembles:
    LIBELLE  Nbre Mois  Consom.  Montant
    ECLAIRAGE 2 78.688 50.688
    GAZ-NATUREL 2 66.762 65.262

    Rules:
    - Only returns rows that clearly match the pattern.
    - Keeps numbers as written in OCR (string), does not invent missing values.
    """

    rows: list[dict[str, Any]] = []
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if not lines:
        return rows

    # Find header line index (tolerant: OCR may miss one token)
    header_idx: Optional[int] = None
    for i, ln in enumerate(lines):
        norm = _normalize_latin(ln)
        hits = 0
        if "libelle" in norm:
            hits += 1
        if ("consom" in norm) or ("consomm" in norm):
            hits += 1
        if "montant" in norm:
            hits += 1
        if hits >= 2:
            header_idx = i
            break

    if header_idx is None:
        return rows

    # Parse subsequent lines until we hit a footer/subtotal marker or next section.
    stop_markers = (
        "sous total",
        "soustotal",
        "total",
        "ttc",
        "services",
        "taxes",
        "solde",
        "montant a payer",
    )
    number = r"\d+(?:[\s.,]\d{3})*(?:[.,]\d+)?"
    # Some OCR outputs drop the months column; accept both patterns.
    row_re = re.compile(
        rf"^(?P<label>[A-ZÀ-ÿ0-9\-\s_/]+?)\s+(?:(?P<months>{number})\s+)?(?P<cons>{number})\s+(?P<amount>{number})\s*$"
    )

    for ln in lines[header_idx + 1 :]:
        norm = _normalize_latin(ln)
        if any(m in norm for m in stop_markers):
            break
        # Skip separator lines
        if set(ln) <= set("-_=* "):
            continue

        m = row_re.match(ln)
        if not m:
            continue

        libelle = m.group("label").strip()
        # Keep numeric strings exactly as written
        months = (m.group("months") or "").strip() or None
        cons = m.group("cons").strip()
        amount = m.group("amount").strip()

        rows.append(
            {
                "libelle": libelle,
                "consommation": cons,
                "montant": amount,
                "periode": None,
                "nbreMois": months,
            }
        )

    return rows


def _extract_invoice_period(text: str) -> Optional[str]:
    """Extract invoice period like: 'du 2021.07.26 au 2021.09.27'."""

    norm = " ".join(text.split())
    m = re.search(
        r"\bdu\s+([0-9]{4}[./-][0-9]{2}[./-][0-9]{2}|[0-9]{2}[./-][0-9]{2}[./-][0-9]{4})\s+au\s+([0-9]{4}[./-][0-9]{2}[./-][0-9]{2}|[0-9]{2}[./-][0-9]{2}[./-][0-9]{4})\b",
        norm,
        flags=re.IGNORECASE,
    )
    if not m:
        return None
    return f"du {m.group(1)} au {m.group(2)}"


def _extract_invoice_type(text: str, issuer: Optional[str], category: Optional[str]) -> Optional[str]:
    norm = _normalize_latin(text)
    if issuer and "steg" in _normalize_latin(issuer):
        if "gaz" in norm and ("electric" in norm or "electricite" in norm):
            return "STEG Électricité + Gaz"
        if "gaz" in norm:
            return "STEG Gaz"
        if "electric" in norm or "electricite" in norm:
            return "STEG Électricité"
        return "STEG"

    if category == "invoice":
        return "Facture"
    if category:
        return str(category)
    return None


def _to_float(value: str) -> Optional[float]:
    try:
        cleaned = value.strip().replace(" ", "")
        # Handle French-style decimals: 123,45
        if cleaned.count(",") == 1 and cleaned.count(".") == 0:
            cleaned = cleaned.replace(",", ".")
        # Handle thousand separators: 1.234,56 or 1,234.56
        if cleaned.count(".") > 1 and "," in cleaned:
            cleaned = cleaned.replace(".", "").replace(",", ".")
        if cleaned.count(",") > 1 and "." in cleaned:
            cleaned = cleaned.replace(",", "")
        return float(cleaned)
    except Exception:
        return None


_NUM_UNIT_RE = re.compile(
    r"(?P<val>\d+(?:[\s.,]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(?P<unit>kwh|kw\s*h|m3|m³|l|litre|litres|liter|liters|km|kg)\b",
    re.IGNORECASE,
)


def _extract_activity_candidates(text: str) -> list[tuple[float, str]]:
    candidates: list[tuple[float, str]] = []
    for m in _NUM_UNIT_RE.finditer(text):
        val = _to_float(m.group("val"))
        if val is None:
            continue
        unit = m.group("unit").lower().replace(" ", "")
        if unit in ("kwh", "kwh"):
            candidates.append((val, "kWh"))
        elif unit in ("m3", "m³"):
            candidates.append((val, "m3"))
        elif unit in ("l", "litre", "litres", "liter", "liters"):
            candidates.append((val, "L"))
        elif unit == "km":
            candidates.append((val, "km"))
        elif unit == "kg":
            candidates.append((val, "kg"))
    return candidates


def _guess_issuer_and_activity_type(text: str, category: Optional[str] = None) -> tuple[Optional[str], Optional[ActivityType]]:
    t = _normalize_latin(text)
    cat = (category or "").lower().strip()

    issuer: Optional[str] = None
    activity_type: Optional[ActivityType] = None

    if "sonede" in t or "soci" in t and "eau" in t:
        issuer = "SONEDE"
        activity_type = "water_m3"
    if "steg" in t or "societe tunisienne de l'electricite" in t or "société tunisienne de l'électricité" in text.lower():
        issuer = "STEG"
        # STEG can be electricity or gas. Use hints.
        if "gaz" in t or "gpl" in t or "gas" in t:
            activity_type = "natural_gas_m3"
        else:
            activity_type = "electricity_kwh"

    # Category can override when user chooses it explicitly.
    if cat in ("invoice", "report", "company", "other"):
        # no override
        pass
    if cat in ("electricity", "energie", "energy"):
        activity_type = "electricity_kwh"
    if cat in ("gas", "gaz", "natural_gas"):
        activity_type = "natural_gas_m3"
    if cat in ("water", "eau"):
        activity_type = "water_m3"
    if cat in ("waste", "dechet", "déchet"):
        activity_type = "waste_kg"
    if cat in ("transport", "fuel", "carburant"):
        # We'll prefer liters if present, else km.
        activity_type = None

    if cat in ("transport", "fuel", "carburant") and ("diesel" in t or "gasoil" in t or "naft" in t):
        activity_type = "diesel_l"
    elif cat in ("transport", "fuel", "carburant") and ("essence" in t or "petrol" in t):
        activity_type = "petrol_l"

    return issuer, activity_type


_LATIN_KEYWORDS = [
    # General sustainability
    "sustainab", "sustainability", "durable", "durabilité", "environnement", "environment",
    "green", "ecologie", "écologie", "climat", "climate", "carbon", "carbone", "co2", "co₂",
    "ghg", "ges", "emission", "émission", "emissions", "émissions",
    # Energy
    "energie", "énergie", "energy", "electric", "électric", "electricity", "électricité",
    "kwh", "kw h", "kilowatt", "kilowattheure", "kilowatt-heure",
    # Water
    "eau", "water", "m3", "m³", "litre", "liter",
    # Gas / fuel
    "gaz", "gas", "gpl", "lpg", "diesel", "essence", "fuel",
    # Waste
    "waste", "déchet", "dechet", "recycl", "recyclage", "recycling", "compost",
]

_AR_KEYWORDS = [
    "بيئة", "البيئة", "مستدام", "استدامة", "مناخ", "انبعاث", "انبعاثات",
    "كربون", "ثاني أكسيد الكربون", "غازات",
    "طاقة", "كهرباء", "كيلوواط", "ساعة", "كيلوواط ساعة",
    "ماء", "مياه", "متر مكعب", "م³", "م3",
    "غاز", "وقود",
    "نفايات", "تدوير", "إعادة تدوير",
]


def _strip_accents(value: str) -> str:
    return "".join(
        c
        for c in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(c)
    )


def _normalize_latin(value: str) -> str:
    value = value.lower()
    value = _strip_accents(value)
    # Normalize common unicode super/subscripts used in units (CO₂, m³)
    value = (
        value.replace("²", "2")
        .replace("₍", "(")
        .replace("₎", ")")
        .replace("₀", "0")
        .replace("₁", "1")
        .replace("₂", "2")
        .replace("₃", "3")
        .replace("₄", "4")
        .replace("₅", "5")
        .replace("₆", "6")
        .replace("₇", "7")
        .replace("₈", "8")
        .replace("₉", "9")
        .replace("³", "3")
    )
    value = re.sub(r"\s+", " ", value)
    return value


_AR_DIACRITICS_RE = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]")


def _normalize_arabic(value: str) -> str:
    value = _AR_DIACRITICS_RE.sub("", value)
    value = value.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    value = value.replace("ة", "ه").replace("ى", "ي")
    value = re.sub(r"\s+", " ", value)
    return value


def guess_language(text: str) -> str:
    # Very lightweight script detection.
    has_ar = any("\u0600" <= c <= "\u06FF" for c in text)
    has_latin = any("a" <= c.lower() <= "z" for c in text)
    if has_ar and has_latin:
        return "mixed"
    if has_ar:
        return "ar"
    if has_latin:
        return "latin"
    return "unknown"


def ensure_tesseract_available(tesseract_cmd: Optional[str] = None) -> str:
    """Ensure tesseract binary is available and return resolved command."""
    if tesseract_cmd:
        return tesseract_cmd

    resolved = shutil.which("tesseract")
    if resolved:
        return resolved

    # Common Windows install path (best-effort)
    common = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    if shutil.which(common) or _path_exists(common):
        return common

    raise RuntimeError(
        "Tesseract binary not found. Install Tesseract OCR and ensure 'tesseract' is in PATH, "
        "or set TESSERACT_CMD to the full path to tesseract.exe"
    )


def _path_exists(path: str) -> bool:
    try:
        import os

        return os.path.exists(path)
    except Exception:
        return False


def _image_bytes_to_text(
    image_bytes: bytes,
    *,
    lang: str,
    tesseract_cmd: Optional[str] = None,
    tessdata_prefix: Optional[str] = None,
) -> str:
    try:
        import pytesseract
        from PIL import Image, ImageOps
        from PIL.Image import Transpose
    except Exception as e:  # pylint: disable=broad-except
        raise RuntimeError(
            "Missing OCR python deps. Install pytesseract + pillow in backend environment."
        ) from e

    pytesseract.pytesseract.tesseract_cmd = ensure_tesseract_available(tesseract_cmd)
    if tessdata_prefix:
        import os

        os.environ["TESSDATA_PREFIX"] = tessdata_prefix

    import io

    with Image.open(io.BytesIO(image_bytes)) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        # Preprocess for invoices: increase contrast, convert to grayscale, upscale, and threshold.
        im = ImageOps.autocontrast(im)
        if im.mode == "RGB":
            im = im.convert("L")

        # Upscale small/medium images for better OCR on tables.
        # (Avoid huge memory usage on already large scans.)
        if im.width < 2000:
            scale = 2
            im = im.resize((im.width * scale, im.height * scale))

        # Light denoise
        try:
            from PIL import ImageFilter

            im = im.filter(ImageFilter.MedianFilter(size=3))
        except Exception:
            pass

        # Simple global threshold to emphasize table text.
        try:
            im = im.point(lambda p: 255 if p > 165 else 0)
        except Exception:
            pass

        # Try a couple of page segmentation modes; keep the longer output.
        # PSM 6: uniform block; PSM 4: columns; PSM 11: sparse text.
        configs = ["--psm 6", "--psm 4", "--psm 11"]
        best = ""
        for cfg in configs:
            out = pytesseract.image_to_string(im, lang=lang, config=cfg) or ""
            if len(out) > len(best):
                best = out
        return best


def _pdf_bytes_to_images(pdf_bytes: bytes, *, max_pages: int = 2) -> list[bytes]:
    """Render PDF pages to PNG bytes. Uses pypdfium2 (pure Python wheels).

    Raises RuntimeError if dependency isn't installed.
    """
    try:
        import pypdfium2 as pdfium
    except Exception as e:  # pylint: disable=broad-except
        raise RuntimeError(
            "PDF OCR requires 'pypdfium2'. Install it or upload images instead."
        ) from e

    import io

    pdf = pdfium.PdfDocument(io.BytesIO(pdf_bytes))
    page_count = len(pdf)
    images: list[bytes] = []

    for i in range(min(page_count, max_pages)):
        page = pdf.get_page(i)
        pil_image = page.render(scale=2).to_pil()
        out = io.BytesIO()
        pil_image.save(out, format="PNG")
        images.append(out.getvalue())
        page.close()

    pdf.close()
    return images


def run_ocr(
    *,
    file_bytes: bytes,
    content_type: str,
    lang: str,
    tesseract_cmd: Optional[str] = None,
    pdf_max_pages: int = 2,
    tessdata_prefix: Optional[str] = None,
) -> str:
    if content_type == "application/pdf":
        pages = _pdf_bytes_to_images(file_bytes, max_pages=pdf_max_pages)
        texts = [
            _image_bytes_to_text(
                img,
                lang=lang,
                tesseract_cmd=tesseract_cmd,
                tessdata_prefix=tessdata_prefix,
            )
            for img in pages
        ]
        return "\n\n".join(texts).strip()

    if content_type.startswith("image/"):
        return _image_bytes_to_text(
            file_bytes,
            lang=lang,
            tesseract_cmd=tesseract_cmd,
            tessdata_prefix=tessdata_prefix,
        ).strip()

    raise RuntimeError(f"Unsupported content_type for OCR: {content_type}")


def _find_keywords(text: str) -> list[str]:
    # Combine latin + arabic detection for best recall.
    detected = guess_language(text)

    found: list[str] = []

    norm_lat = _normalize_latin(text)
    for kw in _LATIN_KEYWORDS:
        kw_norm = _normalize_latin(kw)
        if kw_norm in norm_lat:
            found.append(kw)

    norm_ar = _normalize_arabic(text)
    for kw in _AR_KEYWORDS:
        kw_norm = _normalize_arabic(kw)
        if kw_norm and kw_norm in norm_ar:
            found.append(kw)

    # De-dupe, keep stable-ish order
    seen: set[str] = set()
    unique: list[str] = []
    for item in found:
        key = item.lower()
        if key not in seen:
            unique.append(item)
            seen.add(key)

    # If we detected latin only and found nothing, still try a few generic stems
    if detected in ("latin", "mixed") and not unique:
        for stem in ("kwh", "eau", "water", "gaz", "gas", "waste", "co2"):
            if stem in norm_lat:
                unique.append(stem)

    return unique


def _filter_lines(text: str, keywords: list[str]) -> str:
    if not text.strip() or not keywords:
        return ""

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    norm_lines = [(ln, _normalize_latin(ln), _normalize_arabic(ln)) for ln in lines]

    latin_keys = [_normalize_latin(k) for k in keywords]
    ar_keys = [_normalize_arabic(k) for k in keywords]

    kept: list[str] = []
    for raw, norm_lat, norm_ar in norm_lines:
        hit = False
        for k in latin_keys:
            if k and k in norm_lat:
                hit = True
                break
        if not hit:
            for k in ar_keys:
                if k and k in norm_ar:
                    hit = True
                    break
        if hit:
            kept.append(raw)

    # If nothing matched at line-level, keep a short snippet of full text.
    if not kept:
        return "\n".join(lines[:12])

    return "\n".join(kept[:40])


_AMOUNT_RE = re.compile(
    r"(?P<amount>\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?)\s*(?P<cur>TND|DT|USD|EUR|GBP|€|\$|د\.ت)",
    re.IGNORECASE,
)

_DATE_RE = re.compile(
    r"\b(?P<d>\d{1,2})[\/\-.](?P<m>\d{1,2})[\/\-.](?P<y>\d{2,4})\b"
)

_CO2_RE = re.compile(
    r"(?P<val>\d+(?:[.,]\d+)?)\s*(?P<unit>kg|t|ton|tonne)?\s*(?:co2e|co2|co₂)\b",
    re.IGNORECASE,
)


def _first_amount(text: str) -> Optional[str]:
    m = _AMOUNT_RE.search(text)
    if not m:
        return None
    amount = m.group("amount").replace(" ", "")
    cur = m.group("cur").upper()
    if cur == "€":
        cur = "EUR"
    if cur == "$":
        cur = "USD"
    return f"{amount} {cur}"


def _first_date(text: str) -> Optional[str]:
    m = _DATE_RE.search(text)
    if not m:
        return None
    d = int(m.group("d"))
    mo = int(m.group("m"))
    y = int(m.group("y"))
    if y < 100:
        y += 2000
    try:
        return datetime(y, mo, d).date().isoformat()
    except Exception:
        return None


def _first_co2(text: str) -> Optional[str]:
    m = _CO2_RE.search(text)
    if not m:
        return None
    val = m.group("val").replace(",", ".")
    unit = (m.group("unit") or "kg").lower()
    if unit in ("t", "ton", "tonne"):
        return f"{val} t CO₂"
    return f"{val} kg CO₂"


def build_sustainability_extraction(text: str, *, category: Optional[str] = None) -> OcrResult:
    detected = guess_language(text)
    keywords = _find_keywords(text)
    filtered_text = _filter_lines(text, keywords)

    issuer, guessed_activity_type = _guess_issuer_and_activity_type(text, category)
    activity_candidates = _extract_activity_candidates(text)
    consumption_rows = parse_tn_consumption_table(text)
    invoice_period = _extract_invoice_period(text)
    invoice_type = _extract_invoice_type(text, issuer, category)

    # Fallback: if OCR misses the table structure/header, try a looser extractor
    # and map it into the UI's expected consumptionRows shape.
    if not consumption_rows:
        try:
            from extractor_v2 import extraire_donnees_environnementales, result_to_consumption_rows

            v2 = extraire_donnees_environnementales(text)
            v2_rows = result_to_consumption_rows(v2)
            if v2_rows:
                consumption_rows = v2_rows
                if not invoice_period and getattr(v2, "periode", None):
                    invoice_period = v2.periode
        except Exception:
            pass

    # Ollama (post-OCR) fallback: produce valid table rows from OCR text.
    # Disabled by default; enable with OLLAMA_EXTRACTION_ENABLED=true.
    if not consumption_rows:
        try:
            from ollama_extract import (
                extract_consumption_rows_with_ollama,
                ollama_extraction_enabled,
            )

            if ollama_extraction_enabled():
                ollama_rows = extract_consumption_rows_with_ollama(
                    ocr_text=text,
                    invoice_period=invoice_period,
                )
                if ollama_rows:
                    consumption_rows = ollama_rows
        except Exception:
            pass

    # pick best candidate depending on guessed activity type
    activity_value: Optional[float] = None
    activity_unit: Optional[str] = None
    activity_type: Optional[ActivityType] = guessed_activity_type

    def _pick(unit: str) -> Optional[tuple[float, str]]:
        for v, u in activity_candidates:
            if u == unit:
                return v, u
        return None

    if activity_type == "electricity_kwh":
        picked = _pick("kWh")
        if picked:
            activity_value, activity_unit = picked
    elif activity_type in ("natural_gas_m3", "water_m3"):
        picked = _pick("m3")
        if picked:
            activity_value, activity_unit = picked
    elif activity_type in ("diesel_l", "petrol_l"):
        picked = _pick("L")
        if picked:
            activity_value, activity_unit = picked
    elif activity_type == "transport_km":
        picked = _pick("km")
        if picked:
            activity_value, activity_unit = picked
    elif activity_type == "waste_kg":
        picked = _pick("kg")
        if picked:
            activity_value, activity_unit = picked

    # If category was transport/fuel and we don't know which, infer by units.
    if activity_type is None:
        if _pick("L"):
            # default to diesel for Tunisia fleet unless specified
            activity_type = "diesel_l"
            activity_value, activity_unit = _pick("L") or (None, None)
        elif _pick("km"):
            activity_type = "transport_km"
            activity_value, activity_unit = _pick("km") or (None, None)
        elif _pick("kg"):
            activity_type = "waste_kg"
            activity_value, activity_unit = _pick("kg") or (None, None)

    co2_kg: Optional[float] = None
    if activity_type and activity_value is not None:
        co2_kg = calculate_co2_from_activity(activity_type, activity_value)

    fields: dict[str, Any] = {
        "totalAmount": _first_amount(text),
        "date": _first_date(text),
        "vendor": issuer,
        # If the document already states CO2, keep it; else compute from activity.
        "co2Equivalent": _first_co2(text) or (f"{co2_kg} kg CO₂" if co2_kg is not None else None),
        "activityValue": activity_value,
        "activityUnit": activity_unit,
        "activityType": activity_type,
        "consumptionRows": consumption_rows if consumption_rows else None,
        "invoiceType": invoice_type,
        "invoicePeriod": invoice_period,
    }

    # Ollama enrichment: extract key fields (category/amount/date/period/quantity) from OCR text.
    # Disabled by default; enable with OLLAMA_EXTRACTION_ENABLED=true.
    try:
        from ollama_extract import (
            extract_environment_fields_with_ollama,
            ollama_extraction_enabled,
        )

        if ollama_extraction_enabled():
            enrich = extract_environment_fields_with_ollama(ocr_text=text)

            # Fill missing basics without overriding existing heuristics.
            if not fields.get("vendor") and enrich.get("vendor"):
                fields["vendor"] = enrich.get("vendor")
            if not fields.get("date") and enrich.get("date"):
                fields["date"] = enrich.get("date")
            if not fields.get("invoicePeriod") and enrich.get("invoicePeriod"):
                fields["invoicePeriod"] = enrich.get("invoicePeriod")

            if not fields.get("totalAmount") and enrich.get("totalAmount"):
                ta = enrich.get("totalAmount")
                if isinstance(ta, dict):
                    amt = ta.get("amount")
                    cur = (ta.get("currency") or "").upper().strip()
                    if amt and cur:
                        fields["totalAmount"] = f"{amt} {cur}"
                    elif amt:
                        fields["totalAmount"] = str(amt)
                elif isinstance(ta, str):
                    fields["totalAmount"] = ta

            acts = enrich.get("activities")
            if isinstance(acts, list) and acts:
                a0 = acts[0] if isinstance(acts[0], dict) else None
                if a0:
                    if not fields.get("activityType") and a0.get("type"):
                        fields["activityType"] = a0.get("type")
                    if not fields.get("activityValue") and a0.get("quantity"):
                        try:
                            fields["activityValue"] = float(str(a0.get("quantity")).replace(",", "."))
                        except Exception:
                            pass
                    if not fields.get("activityUnit") and a0.get("unit"):
                        fields["activityUnit"] = a0.get("unit")

            # Keep full enrichment for debugging/traceability.
            fields["ollama"] = enrich
    except Exception:
        pass

    if fields.get("consumptionRows") and invoice_period:
        for r in fields["consumptionRows"]:
            if not r.get("periode"):
                r["periode"] = invoice_period

    # Basic vendor heuristic: if issuer not detected, use first non-empty line.
    if not fields.get("vendor"):
        for ln in (l.strip() for l in text.splitlines()):
            if len(ln) >= 3:
                fields["vendor"] = ln[:80]
                break

    # Confidence heuristic based on signal
    confidence = 60
    if keywords:
        confidence += min(25, len(keywords) * 4)
    if fields.get("co2Equivalent"):
        confidence += 10
    if fields.get("activityValue"):
        confidence += 10
    if fields.get("totalAmount"):
        confidence += 5
    if fields.get("date"):
        confidence += 5
    confidence = max(10, min(98, confidence))

    return OcrResult(
        ocr_text=text,
        filtered_text=filtered_text,
        keywords=keywords,
        detected_language=detected,
        fields=fields,
        confidence=confidence,
    )


def serialize_extraction(result: OcrResult) -> str:
    payload = {
        "detected_language": result.detected_language,
        "keywords": result.keywords,
        "filtered_text": result.filtered_text,
        "fields": result.fields,
        "confidence": result.confidence,
    }
    return json.dumps(payload, ensure_ascii=False)
