from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import requests


def _env_bool(name: str, default: bool = False) -> bool:
    v = (os.getenv(name) or "").strip().lower()
    if not v:
        return default
    return v in ("1", "true", "yes", "y", "on")


def gemini_extraction_enabled() -> bool:
    return _env_bool("GEMINI_EXTRACTION_ENABLED", default=False)


def _get_api_key() -> str:
    key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return key


def _get_model() -> str:
    return (os.getenv("GEMINI_MODEL") or "gemini-1.5-flash").strip()


def _clean_number(s: str) -> Optional[str]:
    if s is None:
        return None
    s = str(s).strip()
    if not s:
        return None
    s = s.replace(" ", "")
    s = s.replace(",", ".")
    s = re.sub(r"[^0-9.]+", "", s)
    if not s or s == ".":
        return None
    return s


def _normalize_rows(rows: Any, invoice_period: Optional[str]) -> List[Dict[str, Any]]:
    if not isinstance(rows, list):
        return []

    out: List[Dict[str, Any]] = []
    for r in rows:
        if not isinstance(r, dict):
            continue
        libelle = (r.get("libelle") or r.get("LIBELLE") or "").strip()
        cons = _clean_number(r.get("consommation") or r.get("CONSOMMATION"))
        montant = _clean_number(r.get("montant") or r.get("MONTANT"))
        periode = (r.get("periode") or r.get("PERIODE") or invoice_period)
        if isinstance(periode, str):
            periode = periode.strip() or None
        else:
            periode = invoice_period

        if not libelle and not cons and not montant:
            continue

        out.append(
            {
                "libelle": libelle or None,
                "consommation": cons,
                "montant": montant,
                "periode": periode,
            }
        )

    # Keep only rows that have at least a label
    out = [r for r in out if r.get("libelle")]
    return out


def _extract_json_from_text(text: str) -> Optional[Any]:
    text = text.strip()

    # If it is already JSON
    if text.startswith("[") or text.startswith("{"):
        try:
            return json.loads(text)
        except Exception:
            pass

    # Try fenced code blocks
    m = re.search(r"```(?:json)?\s*(\[.*?\]|\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            return None

    # Try best-effort: find first [...] block
    m = re.search(r"(\[.*\])", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            return None

    return None


def extract_consumption_rows_with_gemini(
    *,
    ocr_text: str,
    invoice_period: Optional[str] = None,
    timeout_s: int = 35,
) -> List[Dict[str, Any]]:
    """Use Gemini (post-OCR) to produce a valid consumption table.

    Returns rows in UI shape: {libelle, consommation, montant, periode}.
    """

    api_key = _get_api_key()
    model = _get_model()

    prompt = (
        "Tu es un extracteur de données de factures tunisiennes (STEG/SONEDE).\n"
        "À partir du TEXTE OCR ci-dessous, retourne UNIQUEMENT un JSON valide.\n"
        "Format attendu: une liste JSON de lignes: "
        "[{\"libelle\": string, \"consommation\": string|number|null, \"montant\": string|number|null, \"periode\": string|null}].\n"
        "Règles: \n"
        "- libelle: nom de la ligne (ex: ECLAIRAGE, FORCE MOTRICE, EAU POTABLE, ASSAINISSEMENT...).\n"
        "- consommation: nombre (kWh/m3) sans unité (ex: 78.688).\n"
        "- montant: nombre en DT sans devise (ex: 50.688).\n"
        "- periode: si trouvé (ex: '01/01/2026 au 31/01/2026'), sinon null.\n"
        "- Ignore les totaux globaux, taxes, timbres, pénalités, 'montant à payer' (sauf si c’est clairement une ligne du tableau).\n"
        "- Si tu ne trouves rien, retourne [] (liste vide).\n\n"
        "TEXTE OCR:\n"
        f"{ocr_text}"
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload: Dict[str, Any] = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 1024,
            "responseMimeType": "application/json",
        },
    }

    resp = requests.post(url, json=payload, timeout=timeout_s)
    if resp.status_code >= 400:
        raise RuntimeError(f"Gemini API error {resp.status_code}: {resp.text[:500]}")

    data = resp.json()
    # Typical response: candidates[0].content.parts[0].text
    text_out = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )

    parsed = _extract_json_from_text(text_out) or []
    rows = parsed
    if isinstance(parsed, dict) and "rows" in parsed:
        rows = parsed.get("rows")

    return _normalize_rows(rows, invoice_period)
