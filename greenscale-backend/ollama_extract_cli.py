from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sys
import warnings
from pathlib import Path

# PaddleOCR optional installs can downgrade protobuf/urllib3 and trigger noisy warnings in requests.
# Apply filters BEFORE importing anything that imports `requests`.
warnings.filterwarnings(
    "ignore",
    message=r"urllib3 .* doesn't match a supported version!",
    category=Warning,
)
try:
    from requests import RequestsDependencyWarning  # type: ignore

    warnings.filterwarnings("ignore", category=RequestsDependencyWarning)
except Exception:
    pass


def _guess_content_type(path: Path) -> str:
    ctype, _ = mimetypes.guess_type(str(path))
    if ctype:
        return ctype
    if path.suffix.lower() == ".pdf":
        return "application/pdf"
    return "image/png"


def _read_ocr_text_from_input(
    path: Path,
    *,
    ocr_engine: str,
    paddle_langs: list[str],
    tesseract_lang: str,
    pdf_max_pages: int,
) -> str:
    ext = path.suffix.lower()
    if ext in (".txt", ".log", ".md"):
        return path.read_text(encoding="utf-8", errors="ignore")

    file_bytes = path.read_bytes()
    content_type = _guess_content_type(path)

    if ocr_engine == "paddle":
        from paddle_ocr_utils import run_paddle_ocr

        return run_paddle_ocr(
            file_bytes=file_bytes,
            content_type=content_type,
            langs=paddle_langs,
            pdf_max_pages=pdf_max_pages,
            best_only=True,
            min_confidence=0.65,
        )

    # default: tesseract
    from config import get_settings
    from ocr_utils import run_ocr

    settings = get_settings()
    return run_ocr(
        file_bytes=file_bytes,
        content_type=content_type,
        lang=tesseract_lang,
        tesseract_cmd=settings.TESSERACT_CMD,
        pdf_max_pages=pdf_max_pages,
        tessdata_prefix=getattr(settings, "TESSDATA_PREFIX", None),
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Local Ollama extraction CLI.\n"
            "Input can be: (1) OCR text file (.txt) OR (2) image/PDF, then OCR is run first.\n\n"
            "Examples:\n"
            "  python ollama_extract_cli.py --input _tmp_ocr_output_sorted_conf.txt\n"
            "  python ollama_extract_cli.py --input invoice.png --ocr-engine paddle --langs fr\n"
        )
    )
    parser.add_argument("--input", required=True, help="Path to .txt OCR text OR image/PDF")
    parser.add_argument(
        "--ocr-engine",
        choices=["tesseract", "paddle"],
        default=os.getenv("OCR_ENGINE", "tesseract").strip().lower() or "tesseract",
        help="OCR engine to use when input is an image/PDF",
    )
    parser.add_argument(
        "--langs",
        nargs="+",
        default=["fr"],
        help="PaddleOCR langs (use 'arabic' for Arabic), e.g. --langs fr arabic",
    )
    parser.add_argument(
        "--tess-lang",
        default=os.getenv("TESSERACT_LANGUAGES", "eng+fra+ara"),
        help="Tesseract language string, e.g. eng+fra+ara",
    )
    parser.add_argument(
        "--pdf-max-pages",
        type=int,
        default=int(os.getenv("OCR_PDF_MAX_PAGES", "2")),
        help="Max PDF pages to OCR",
    )
    parser.add_argument("--out", default="", help="Optional output JSON file")

    args = parser.parse_args(argv)

    in_path = Path(args.input)
    if not in_path.exists():
        print(f"ERROR: input not found: {in_path}", file=sys.stderr)
        return 2

    try:
        from ollama_extract import extract_environment_fields_with_ollama

        ocr_text = _read_ocr_text_from_input(
            in_path,
            ocr_engine=str(args.ocr_engine).strip().lower(),
            paddle_langs=[str(l).strip() for l in (args.langs or []) if str(l).strip()],
            tesseract_lang=str(args.tess_lang),
            pdf_max_pages=int(args.pdf_max_pages),
        )

        fields = extract_environment_fields_with_ollama(ocr_text=ocr_text)
        out_json = json.dumps(fields, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 3

    if args.out:
        Path(args.out).write_text(out_json, encoding="utf-8")

    print(out_json)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
