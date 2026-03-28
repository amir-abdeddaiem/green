import argparse
import mimetypes
from pathlib import Path

from config import get_settings
from ocr_utils import build_sustainability_extraction, run_ocr


def main() -> int:
    parser = argparse.ArgumentParser(description="Local OCR smoke test (Tesseract)")
    parser.add_argument("file", help="Path to an image or PDF")
    args = parser.parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        raise SystemExit(f"File not found: {file_path}")

    content_type, _ = mimetypes.guess_type(str(file_path))

    # Some Windows setups don't map .webp correctly in mimetypes.
    if not content_type:
        ext = file_path.suffix.lower()
        if ext == ".pdf":
            content_type = "application/pdf"
        elif ext in (".png", ".webp", ".tif", ".tiff"):
            content_type = f"image/{ext.lstrip('.')}"
        elif ext in (".jpg", ".jpeg"):
            content_type = "image/jpeg"

    content_type = content_type or "application/octet-stream"

    settings = get_settings()

    data = file_path.read_bytes()

    text = run_ocr(
        file_bytes=data,
        content_type=content_type,
        lang=settings.TESSERACT_LANGUAGES,
        tesseract_cmd=settings.TESSERACT_CMD,
        pdf_max_pages=settings.OCR_PDF_MAX_PAGES,
    )

    extraction = build_sustainability_extraction(text)

    print("Detected language:", extraction.detected_language)
    print("Keywords:", extraction.keywords)
    print("Fields:", extraction.fields)
    print("Confidence:", extraction.confidence)
    print("\n--- Filtered text ---\n")
    print(extraction.filtered_text)

    if not extraction.filtered_text.strip():
        snippet = " ".join(text.split())
        print("\n(No sustainability keywords matched for this file.)")
        print("--- Raw OCR snippet (first 400 chars) ---\n")
        print(snippet[:400])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
