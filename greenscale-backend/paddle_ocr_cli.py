from __future__ import annotations

import argparse
import mimetypes
import re
import sys
from pathlib import Path

from paddle_ocr_utils import run_paddle_ocr


def _guess_content_type(path: Path) -> str:
    ctype, _ = mimetypes.guess_type(str(path))
    if ctype:
        return ctype
    # Reasonable fallback
    if path.suffix.lower() == ".pdf":
        return "application/pdf"
    return "image/png"


def _clean_text(text: str) -> str:
    # Minimal, safe cleaning: normalize newlines + collapse whitespace.
    text = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    text = "\n".join([ln.strip() for ln in text.split("\n")])
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Simple PaddleOCR CLI: image/PDF -> plain text (no intelligent extraction).\n"
            "Example: python paddle_ocr_cli.py --file invoice.png --langs fr ar"
        )
    )
    parser.add_argument("--file", required=True, help="Path to image or PDF")
    parser.add_argument(
        "--langs",
        nargs="+",
        default=["fr", "ar"],
        help="PaddleOCR language models to try (space-separated), e.g. --langs fr ar",
    )
    parser.add_argument(
        "--pdf-max-pages",
        type=int,
        default=2,
        help="Max PDF pages to OCR (only if input is PDF)",
    )
    parser.add_argument(
        "--best-only",
        action="store_true",
        help="If multiple langs are provided, return only the best output (no concatenation)",
    )
    parser.add_argument(
        "--min-conf",
        type=float,
        default=0.55,
        help="Minimum confidence threshold (0-1). Higher removes more noise.",
    )
    parser.add_argument(
        "--content-type",
        default="",
        help="Override content type (e.g. image/png, application/pdf)",
    )
    parser.add_argument(
        "--out",
        default="",
        help="Optional output text file path (still prints to stdout)",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Do not print OCR text to stdout (use with --out)",
    )

    args = parser.parse_args(argv)

    file_path = Path(args.file)
    if not file_path.exists() or not file_path.is_file():
        print(f"ERROR: file not found: {file_path}", file=sys.stderr)
        return 2

    content_type = (args.content_type or "").strip() or _guess_content_type(file_path)

    try:
        file_bytes = file_path.read_bytes()
        text = run_paddle_ocr(
            file_bytes=file_bytes,
            content_type=content_type,
            langs=[str(l).strip() for l in (args.langs or []) if str(l).strip()],
            pdf_max_pages=args.pdf_max_pages,
            best_only=bool(args.best_only),
            min_confidence=float(args.min_conf or 0.0),
        )
        cleaned = _clean_text(text)
    except RuntimeError as e:
        print(f"OCR error: {e}", file=sys.stderr)
        print(
            "Hint: install optional deps with: pip install -r requirements-ocr-paddle.txt\n"
            "If install fails on Python 3.12, try Python 3.10/3.11, or use OCR_ENGINE=tesseract.",
            file=sys.stderr,
        )
        return 3

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(cleaned, encoding="utf-8")

    if not args.quiet:
        print(cleaned)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
