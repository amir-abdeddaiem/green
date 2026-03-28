from __future__ import annotations

import io
from functools import lru_cache
from typing import List, Optional


def _pdf_bytes_to_images(pdf_bytes: bytes, *, max_pages: int = 2) -> List[bytes]:
    try:
        import pypdfium2 as pdfium
    except Exception as e:  # pylint: disable=broad-except
        raise RuntimeError(
            "PDF OCR requires 'pypdfium2'. Install it or upload images instead."
        ) from e

    pdf = pdfium.PdfDocument(io.BytesIO(pdf_bytes))
    page_count = len(pdf)
    images: List[bytes] = []

    for i in range(min(page_count, max_pages)):
        page = pdf.get_page(i)
        pil_image = page.render(scale=2).to_pil()
        out = io.BytesIO()
        pil_image.save(out, format="PNG")
        images.append(out.getvalue())
        page.close()

    pdf.close()
    return images


def _normalize_paddle_lang(lang: str) -> str:
    # PaddleOCR language codes are not always ISO-639-1.
    # Support common aliases used in env/config.
    l = (lang or "").strip().lower()
    if l in ("ar", "ara"):
        return "arabic"
    if l in ("en", "eng"):
        return "en"
    return l


@lru_cache(maxsize=8)
def _paddleocr_instance(lang: str):
    # Lazy import to avoid heavy import cost for non-OCR paths.
    try:
        from paddleocr import PaddleOCR
    except Exception as e:  # pylint: disable=broad-except
        raise RuntimeError(
            "Failed to import PaddleOCR dependencies. "
            "Install paddleocr + paddlepaddle in backend environment. "
            f"Original error: {type(e).__name__}: {e}"
        ) from e

    # use_angle_cls improves rotated text; show_log off.
    normalized = _normalize_paddle_lang(lang)
    return PaddleOCR(use_angle_cls=True, lang=normalized, show_log=False)


def _iter_paddle_detections(result) -> list:
    """Yield detection items as [box, (text, score)] across possible result shapes."""
    if not result:
        return []

    def _looks_like_det(obj) -> bool:
        # det is typically: [ [ [x,y],... ], ("text", score) ]
        if not isinstance(obj, list) or len(obj) < 2:
            return False
        box, text_score = obj[0], obj[1]
        if not isinstance(box, list) or not box:
            return False
        if not isinstance(text_score, (list, tuple)) or not text_score:
            return False
        # Ensure this isn't a nested page/list: the first element should be text.
        if not isinstance(text_score[0], str):
            return False
        return True

    # Typical shapes:
    # - list[det] where det=[box, (text, score)]
    # - list[list[det]] for multi-page / batch (common: [page] for single image)
    if isinstance(result, list) and result:
        if _looks_like_det(result[0]):
            return result

        # list[list[det]]
        first = result[0]
        if isinstance(first, list) and first and _looks_like_det(first[0]):
            out: list = []
            for page in result:
                if isinstance(page, list):
                    out.extend([det for det in page if _looks_like_det(det)])
            return out

    return []


def _ocr_image_bytes(image_bytes: bytes, *, lang: str, min_confidence: float = 0.0) -> str:
    from PIL import Image, ImageOps

    ocr = _paddleocr_instance(lang)

    with Image.open(io.BytesIO(image_bytes)) as im:
        # Light preprocessing to help OCR on invoices/screenshots.
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        # Improve contrast; keep RGB for Paddle models.
        im = ImageOps.autocontrast(im)
        # Upscale small/medium inputs to help small table text.
        if im.width < 1400:
            scale = 2
            im = im.resize((im.width * scale, im.height * scale))

        # PaddleOCR accepts numpy arrays; convert via PIL->RGB->numpy
        import numpy as np

        if im.mode != "RGB":
            im = im.convert("RGB")
        arr = np.array(im)

    result = ocr.ocr(arr, cls=True)

    dets = _iter_paddle_detections(result)

    # Build (y, x, text) and sort/group into lines for more natural reading order.
    items: list[tuple[float, float, str]] = []
    for det in dets:
        if not isinstance(det, list) or len(det) < 2:
            continue
        box = det[0]
        text_score = det[1]
        if not isinstance(text_score, (list, tuple)) or not text_score:
            continue
        txt = text_score[0]
        score = None
        if len(text_score) >= 2:
            try:
                score = float(text_score[1])
            except Exception:
                score = None

        if score is not None and score < float(min_confidence or 0.0):
            continue
        if not (txt and str(txt).strip()):
            continue

        x_min = 0.0
        y_min = 0.0
        try:
            if isinstance(box, list) and box and isinstance(box[0], list):
                xs = [float(p[0]) for p in box if isinstance(p, list) and len(p) >= 2]
                ys = [float(p[1]) for p in box if isinstance(p, list) and len(p) >= 2]
                if xs:
                    x_min = min(xs)
                if ys:
                    y_min = min(ys)
        except Exception:
            pass

        items.append((y_min, x_min, str(txt).strip()))

    if not items:
        return ""

    items.sort(key=lambda t: (t[0], t[1]))

    # Group by y buckets (pixels). After our upscale, 18-24px is a reasonable line bucket.
    bucket_size = 22.0
    grouped: list[list[tuple[float, float, str]]] = []
    current: list[tuple[float, float, str]] = []
    current_bucket: Optional[int] = None
    for y, x, txt in items:
        b = int(y // bucket_size)
        if current_bucket is None or b == current_bucket:
            current.append((y, x, txt))
            current_bucket = b
        else:
            grouped.append(current)
            current = [(y, x, txt)]
            current_bucket = b
    if current:
        grouped.append(current)

    lines: List[str] = []
    for group in grouped:
        group_sorted = sorted(group, key=lambda t: t[1])
        line = " ".join([t[2] for t in group_sorted if t[2]]).strip()
        if line:
            lines.append(line)

    return "\n".join(lines).strip()


def run_paddle_ocr(
    *,
    file_bytes: bytes,
    content_type: str,
    langs: List[str],
    pdf_max_pages: int = 2,
    best_only: bool = False,
    min_confidence: float = 0.0,
) -> str:
    """Run PaddleOCR on images/PDFs.

    langs: list like ['fr', 'ar'].
    We run each language separately and concatenate (keeps models smaller).
    """

    if content_type == "application/pdf":
        pages = _pdf_bytes_to_images(file_bytes, max_pages=pdf_max_pages)
        texts: List[str] = []
        for img in pages:
            texts.append(run_paddle_ocr(file_bytes=img, content_type="image/png", langs=langs))
        return "\n\n".join([t for t in texts if t]).strip()

    if not content_type.startswith("image/"):
        raise RuntimeError(f"Unsupported content_type for OCR: {content_type}")

    outputs: List[str] = []
    norm_langs = [_normalize_paddle_lang(l) for l in (langs or []) if str(l).strip()]
    for lang in norm_langs:
        out = _ocr_image_bytes(file_bytes, lang=lang, min_confidence=min_confidence)
        if out:
            outputs.append(out)

    # Prefer the longer output. Optionally keep the second for recall.
    if not outputs:
        return ""
    outputs_sorted = sorted(outputs, key=len, reverse=True)
    best = outputs_sorted[0]
    if len(outputs_sorted) > 1:
        if best_only:
            return best.strip()
        # Append shorter output after best, separated.
        return (best + "\n" + outputs_sorted[1]).strip()
    return best
