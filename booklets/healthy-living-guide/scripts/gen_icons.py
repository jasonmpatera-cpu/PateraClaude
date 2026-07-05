#!/usr/bin/env python3
"""Generate the icon set as standalone, editable SVG files.

Each icon is a circular badge (tinted background) containing a
hand-drawn line glyph in the brand accent color. Icons are produced
in two tone variants (blue, green) so they can be alternated for
visual rhythm across the booklet.
"""
import os
from icon_lib import ICONS, PALETTE

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "graphics", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

BADGE_TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="49" fill="{bg}"/>
  <g transform="translate(18,18) scale(2.6667)">
    {glyph}
  </g>
</svg>
'''

VARIANTS = {
    "blue": (PALETTE["light_blue_tint"], PALETTE["mid_blue"]),
    "green": (PALETTE["light_green_tint"], PALETTE["teal"]),
    "deep": (PALETTE["light_blue_tint"], PALETTE["deep_blue"]),
}

def render_glyph(name, color):
    raw = ICONS[name]
    return raw.replace("{s}", f'fill="none" stroke="{color}" stroke-width="1.8" '
                               f'stroke-linecap="round" stroke-linejoin="round"').replace("{c}", color)

def main():
    count = 0
    for name in ICONS:
        for variant, (bg, fg) in VARIANTS.items():
            glyph = render_glyph(name, fg)
            svg = BADGE_TEMPLATE.format(bg=bg, glyph=glyph)
            fname = f"{name}__{variant}.svg"
            with open(os.path.join(OUT_DIR, fname), "w") as f:
                f.write(svg)
            count += 1
    # Also write bare (no-badge) glyph-only versions, useful for inline placement
    bare_dir = os.path.join(OUT_DIR, "bare")
    os.makedirs(bare_dir, exist_ok=True)
    for name in ICONS:
        fg = PALETTE["deep_blue"]
        glyph = render_glyph(name, fg)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" '
               f'width="24" height="24">{glyph}</svg>\n')
        with open(os.path.join(bare_dir, f"{name}.svg"), "w") as f:
            f.write(svg)
        count += 1
    print(f"Wrote {count} icon files to {OUT_DIR}")
    print(f"Icons defined: {len(ICONS)}")

if __name__ == "__main__":
    main()
