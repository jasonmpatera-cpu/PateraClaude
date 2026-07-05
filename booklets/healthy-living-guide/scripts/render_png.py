#!/usr/bin/env python3
"""Rasterize every SVG in graphics/ to high-resolution PNG for print/web use."""
import os
import cairosvg

BASE = os.path.join(os.path.dirname(__file__), "..", "graphics")

TARGETS = [
    (os.path.join(BASE, "icons"), os.path.join(BASE, "png", "icons"), 4),
    (os.path.join(BASE, "icons", "bare"), os.path.join(BASE, "png", "icons_bare"), 12),
    (os.path.join(BASE, "infographics"), os.path.join(BASE, "png", "infographics"), 3),
]

def main():
    total = 0
    for src_dir, out_dir, scale in TARGETS:
        os.makedirs(out_dir, exist_ok=True)
        for fname in sorted(os.listdir(src_dir)):
            if not fname.endswith(".svg"):
                continue
            src_path = os.path.join(src_dir, fname)
            out_path = os.path.join(out_dir, fname.replace(".svg", ".png"))
            cairosvg.svg2png(url=src_path, write_to=out_path, scale=scale)
            total += 1
    print(f"Rendered {total} PNG files.")

if __name__ == "__main__":
    main()
