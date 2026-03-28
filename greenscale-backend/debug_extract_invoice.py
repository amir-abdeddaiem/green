from __future__ import annotations

import json
import sys
from pathlib import Path

from ocr_utils import build_sustainability_extraction, run_ocr


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python debug_extract_invoice.py <path-to-invoice-image>")
        return 2

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"File not found: {path}")
        return 2

    file_bytes = path.read_bytes()
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        content_type = "application/pdf"
    elif suffix in (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"):
        content_type = f"image/{suffix.lstrip('.')}"
        if content_type == "image/jpg":
            content_type = "image/jpeg"
        if content_type == "image/tif":
            content_type = "image/tiff"
    else:
        content_type = "image/*"

    tessdata_prefix = str((Path(__file__).resolve().parent / "tessdata").resolve())
    text = run_ocr(
        file_bytes=file_bytes,
        content_type=content_type,
        lang="fra+ara",
        tessdata_prefix=tessdata_prefix,
    )
    print(f"OCR text length: {len(text)}")
    print("OCR head:")
    print(text[:800])
    print("\nOCR tail:")
    print(text[-800:])

    res = build_sustainability_extraction(text, category="electricity")
    fields = res.fields or {}

    print("\nExtracted fields summary:")
    summary = {
        "invoiceType": fields.get("invoiceType"),
        "invoicePeriod": fields.get("invoicePeriod"),
        "vendor": fields.get("vendor"),
        "totalAmount": fields.get("totalAmount"),
        "date": fields.get("date"),
        "activityType": fields.get("activityType"),
        "activityValue": fields.get("activityValue"),
        "activityUnit": fields.get("activityUnit"),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))

    rows = fields.get("consumptionRows")
    print("\nconsumptionRows:")
    print(json.dumps(rows, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
