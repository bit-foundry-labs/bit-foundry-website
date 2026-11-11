"""Create reproducible, locally hosted, responsive WebP variants of the forge hero.

Usage:
    python scripts/optimize-forge-image.py

The source image is retained in assets/ for later editing and upscaling.
The website serves only these smaller derivatives.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "forge-hall-upscaled.png"
OUTPUTS = (
    ("forge-hall-desktop.webp", 3200, 86),
    ("forge-hall-mobile.webp", 1600, 82),
)

with Image.open(SOURCE) as image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    print(f"Original foundry image: {image.width} × {image.height}")
    for filename, max_width, quality in OUTPUTS:
        width = min(image.width, max_width)
        height = round(image.height * width / image.width)
        frame = image.resize((width, height), Image.Resampling.LANCZOS) if width < image.width else image.copy()
        destination = SOURCE.with_name(filename)
        frame.save(destination, "WEBP", quality=quality, method=6)
        print(f"{filename}: {width} × {height}, {destination.stat().st_size // 1024} KiB")
