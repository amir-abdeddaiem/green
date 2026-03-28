from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional

import requests


def _env_bool(name: str, default: bool = False) -> bool:
    v = (os.getenv(name) or "").strip().lower()
    if not v:
        return default
    return v in ("1", "true", "yes", "y", "on")


def ollama_extraction_enabled() -> bool:
    return _env_bool("OLLAMA_EXTRACTION_ENABLED", default=False)


def _get_base_url() -> str:
    return (os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").strip().rstrip("/")


def _get_model() -> str:
    return (os.getenv("OLLAMA_MODEL") or "qwen2.5:7b-instruct").strip()


def _clean_number(s: Any) -> Optional[str]:
    if s is None:
        return None
    s = str(s).strip()
    if not s:
        return None
    s = s.replace(" ", "").replace(",", ".")
    s = re.sub(r"[^0-9.]+", "", s)
    if not s or s == ".":
        return None
    return s


def _extract_json(text: str) -> Any:
    text = (text or "").strip()

    # Direct JSON
    if text.startswith("[") or text.startswith("{"):
        try:
            return json.loads(text)
        except Exception:
            pass

    # Fenced block
    m = re.search(r"```(?:json)?\s*(\[.*?\]|\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
    if m:
        return json.loads(m.group(1))

    # Best effort array
    m = re.search(r"(\[.*\])", text, re.DOTALL)
    if m:
        return json.loads(m.group(1))

    return []


def _normalize_rows(rows: Any, invoice_period: Optional[str]) -> List[Dict[str, Any]]:
    if isinstance(rows, dict) and "rows" in rows:
        rows = rows.get("rows")
    if not isinstance(rows, list):
        return []

    out: List[Dict[str, Any]] = []
    for r in rows:
        if not isinstance(r, dict):
            continue
        libelle = (r.get("libelle") or r.get("LIBELLE") or "").strip()
        consommation = _clean_number(r.get("consommation") or r.get("CONSOMMATION"))
        montant = _clean_number(r.get("montant") or r.get("MONTANT"))
        periode = r.get("periode") or r.get("PERIODE") or invoice_period
        if isinstance(periode, str):
            periode = periode.strip() or None
        else:
            periode = invoice_period

        if not libelle:
            continue
        out.append(
            {
                "libelle": libelle,
                "consommation": consommation,
                "montant": montant,
                "periode": periode,
            }
        )

    return out


def extract_consumption_rows_with_ollama(
    *,
    ocr_text: str,
    invoice_period: Optional[str] = None,
    timeout_s: int = 60,
) -> List[Dict[str, Any]]:
    """Call local Ollama to extract table rows from OCR text.

    Returns rows: {libelle, consommation, montant, periode}
    """

    base_url = _get_base_url()
    model = _get_model()

    system = (
        "You extract Tunisian utility invoice line items from noisy OCR. "
        "Return ONLY valid JSON. No prose."
    )

    user = (
        "From the OCR text, extract invoice line items as JSON array. "
        "Each row must be: {\"libelle\": string, \"consommation\": string|null, \"montant\": string|null, \"periode\": string|null}. "
        "Rules: libelle is required; consommation and montant must be numbers without units; "
        "ignore totals, taxes, fees, penalties, stamps, and payment slips; "
        "if no rows found, return [].\n\n"
        f"OCR TEXT:\n{ocr_text}"
    )

    payload: Dict[str, Any] = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "options": {
            "temperature": 0.0,
        },
    }

    resp = requests.post(f"{base_url}/api/chat", json=payload, timeout=timeout_s)
    if resp.status_code >= 400:
        raise RuntimeError(f"Ollama error {resp.status_code}: {resp.text[:500]}")

    data = resp.json()
    content = (data.get("message") or {}).get("content") or ""
    parsed = _extract_json(content)
    return _normalize_rows(parsed, invoice_period)


def _normalize_fields(payload: Any) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        return {}

    def _clean_str(v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        return s or None

    out: Dict[str, Any] = {}

    out["vendor"] = _clean_str(payload.get("vendor") or payload.get("issuer"))

    cat = _clean_str(payload.get("documentCategory") or payload.get("category"))
    if cat:
        cat = cat.lower().strip()
    out["documentCategory"] = cat

    out["date"] = _clean_str(payload.get("date"))
    out["invoicePeriod"] = _clean_str(payload.get("invoicePeriod") or payload.get("period"))

    total = payload.get("totalAmount")
    if isinstance(total, dict):
        amt = _clean_number(total.get("amount"))
        cur = _clean_str(total.get("currency"))
        out["totalAmount"] = {"amount": amt, "currency": cur}
    else:
        # Some models return totalAmount as string like "175.000 TND"
        out["totalAmount"] = _clean_str(total)

    activities_raw = payload.get("activities") or payload.get("activity") or []
    activities: List[Dict[str, Any]] = []
    if isinstance(activities_raw, dict):
        activities_raw = [activities_raw]
    if isinstance(activities_raw, list):
        for a in activities_raw:
            if not isinstance(a, dict):
                continue
            act_type = _clean_str(a.get("type") or a.get("activityType"))
            qty = _clean_number(a.get("quantity") or a.get("value") or a.get("qty"))
            unit = _clean_str(a.get("unit") or a.get("activityUnit"))
            amt = _clean_number(a.get("amount") or a.get("lineAmount"))
            cur = _clean_str(a.get("currency"))
            sign = _clean_str(a.get("sign"))
            if sign not in ("+", "-"):
                sign = None
            activities.append(
                {
                    "type": act_type,
                    "quantity": qty,
                    "unit": unit,
                    "amount": amt,
                    "currency": cur,
                    "sign": sign,
                }
            )
    out["activities"] = activities
    return out


def extract_environment_fields_with_ollama(
    *,
    ocr_text: str,
    timeout_s: int = 60,
) -> Dict[str, Any]:
    """Extract sustainability-relevant fields from OCR text using local Ollama.

    Returns a dict that can be merged into other extraction results.
    """

    base_url = _get_base_url()
    model = _get_model()

    system = (
        "You extract sustainability/emissions-related fields from noisy OCR text. "
        "Return ONLY valid JSON (no markdown, no prose)."
    )

    user = (
        "Extract the following fields from the OCR text as JSON with this schema:\n"
        "{\n"
        "  \"vendor\": string|null,\n"
        "  \"documentCategory\": one of [\"electricity\",\"gas\",\"water\",\"waste\",\"fuel\",\"transport\",\"invoice\",\"other\"] or null,\n"
        "  \"date\": ISO date YYYY-MM-DD or null,\n"
        "  \"invoicePeriod\": string|null (e.g. 'du 2021.07.26 au 2021.09.27'),\n"
        "  \"totalAmount\": {\"amount\": string|null, \"currency\": string|null} OR null,\n"
        "  \"activities\": [\n"
        "    {\n"
        "      \"type\": one of [\"electricity_kwh\",\"natural_gas_m3\",\"water_m3\",\"waste_kg\",\"diesel_l\",\"petrol_l\",\"transport_km\"] or null,\n"
        "      \"quantity\": string|null (number only, no units),\n"
        "      \"unit\": one of [\"kWh\",\"m3\",\"kg\",\"L\",\"km\"] or null,\n"
        "      \"amount\": string|null (number only),\n"
        "      \"currency\": string|null,\n"
        "      \"sign\": \"+\"|\"-\"|null\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Rules:\n"
        "- Do NOT invent values. Use null if unknown.\n"
        "- Keep numbers as strings, normalize decimal separators.\n"
        "- Prefer the main consumption quantity from the invoice/table.\n"
        "- Currency is usually TND/DT for Tunisia.\n\n"
        f"OCR TEXT:\n{ocr_text}"
    )

    payload: Dict[str, Any] = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "options": {
            "temperature": 0.0,
        },
    }

    resp = requests.post(f"{base_url}/api/chat", json=payload, timeout=timeout_s)
    if resp.status_code >= 400:
        raise RuntimeError(f"Ollama error {resp.status_code}: {resp.text[:500]}")

    data = resp.json()
    content = (data.get("message") or {}).get("content") or ""
    parsed = _extract_json(content)
    return _normalize_fields(parsed)
