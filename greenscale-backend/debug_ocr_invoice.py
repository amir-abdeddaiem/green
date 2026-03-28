from __future__ import annotations

from pathlib import Path


def main() -> None:
    img = Path(r"..\greenscale-frontend\public\1672506299 (1).webp").resolve()
    if not img.exists():
        raise SystemExit(f"Image not found: {img}")

    from PIL import Image

    im = Image.open(img).convert("RGB")
    max_w = 1800
    if im.width > max_w:
        new_h = int(im.height * (max_w / im.width))
        im = im.resize((max_w, new_h))

    tmp = Path("_tmp_ocr_input.png").resolve()
    im.save(tmp)
    print("Saved tmp image:", tmp)
    print("Size:", im.size)

    from ocr_utils import build_sustainability_extraction, run_ocr

    text = run_ocr(str(tmp))
    print("OCR chars:", len(text))
    print("--- OCR HEAD ---")
    print(text[:2000])
    print("--- OCR TAIL ---")
    print(text[-1000:])

    extraction = build_sustainability_extraction(text, category="electricity")
    fields = extraction.get("fields", {})

    print("\nFields keys:", sorted(fields.keys()))
    rows = fields.get("consumptionRows", []) or []
    print("consumptionRows count:", len(rows))
    for row in rows[:50]:
        print(row)


if __name__ == "__main__":
    main()
