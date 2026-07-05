# Healthy Living Guide

**Nebraska Medicine Health Series — Book One**
*Your Everyday Blueprint for Living Longer and Feeling Better*
Author: Dr. Jason Patera, Family Medicine, Nebraska Medicine

A 12-page patient education booklet for adult primary care patients (ages 18–90, ~6th–8th
grade reading level), designed to be the primary health and wellness handout distributed in
clinic. Modern, minimalist design in a blue/green academic-medical-center style with custom
vector icons and infographics, callout boxes, checklists, and tables throughout.

## Deliverables

| File | Description |
|---|---|
| `build/Healthy-Living-Guide.pdf` | Print-ready PDF, US Letter, vector graphics + embedded fonts |
| `build/Healthy-Living-Guide.docx` | Editable Word version (real headings, tables, and embedded images) |
| `graphics/icons/` | 45 custom line icons × 3 color variants (135 SVGs), plus single-color "bare" versions |
| `graphics/infographics/` | 12 custom infographics (healthy plate, Mediterranean pyramid, exercise pyramid, Zone 2 chart, grocery cart, nutrition label, pantry, protein/fiber charts, weekly exercise calendar, weight-habit wheel, portion sizes) |
| `graphics/png/` | High-resolution PNG exports of every icon and infographic (icons at ~400–1200px, infographics at ~3000px wide) |
| `fonts/` | Inter (SIL OFL licensed) — the typeface used throughout |

## Sections

1. The 10 Habits That Matter Most
2. Eat Mostly Real Food
3. Build Better Meals
4. Healthy Snacks (20-item visual guide)
5. Exercise
6. Healthy Weight
7. Sleep, Stress & Connection
8. Preventive Health
9. Healthy Grocery Guide
10. Frequently Asked Questions
11. References & Guidelines

## Evidence basis

Content is written to be consistent with current guidance from USPSTF, AHA/ACC, ADA, ACSM,
the American Cancer Society, CDC, the Dietary Guidelines for Americans, the American Academy
of Sleep Medicine, and the U.S. Surgeon General's Advisory on Loneliness. See the booklet's
References page for the full list. This is patient education material, not a substitute for
individualized medical advice.

## Rebuilding from source

Everything is generated from source — no design tool files to maintain.

```
booklets/healthy-living-guide/
├── src/
│   ├── booklet.html        # All page content (cover, 10 sections, references)
│   └── style.css            # Design system: colors, type, layout, callouts, tables
├── scripts/
│   ├── icon_lib.py          # Hand-drawn icon glyph definitions (24x24 grid)
│   ├── gen_icons.py         # Wraps glyphs into color-badged SVG icon files
│   ├── svg_helpers.py       # SVG-generation math helpers (arcs, pyramids, bar charts)
│   ├── gen_infographics.py  # Generates the 12 large custom infographics
│   ├── render_png.py        # Rasterizes every SVG to high-res PNG (cairosvg)
│   ├── build_pdf.js         # Headless-Chromium print of booklet.html to PDF (Playwright)
│   ├── docx_helpers.py      # python-docx helpers (callout boxes, tables, checklists)
│   └── build_docx.py        # Builds the editable .docx from the same content
├── fonts/                   # Inter TTFs, embedded via @font-face and in the .docx
├── graphics/                # Generated SVG + PNG output (see Deliverables above)
└── build/                   # Final PDF and DOCX
```

To regenerate everything from scratch:

```bash
cd scripts
python3 gen_icons.py                              # -> graphics/icons/
python3 gen_infographics.py                       # -> graphics/infographics/
python3 render_png.py                             # -> graphics/png/
node build_pdf.js                                 # -> build/Healthy-Living-Guide.pdf
python3 build_docx.py                             # -> build/Healthy-Living-Guide.docx
```

Dependencies: `pip install cairosvg python-docx` and a Playwright-managed Chromium (or any
Chromium/Chrome binary — update the `executablePath` in `build_pdf.js`).

To edit content, change `src/booklet.html` and re-run `build_pdf.js`; to edit the Word
version's copy, edit `scripts/build_docx.py`. The two are independent renderers of the same
source content, not a shared template, so a content change should be applied in both places.

## Design system

- **Typeface:** Inter (400/500/600/700/800) — modern, highly legible, SIL Open Font License.
- **Palette:** deep blue `#0F3D5C`, mid blue `#1B6CA8`, teal `#128074`, green `#1E9E6B`, plus
  light blue/green tint backgrounds for callout boxes. Amber `#C97A1A` is used sparingly as a
  tertiary accent (e.g., "less often" pyramid tiers).
- **Icons:** consistent stroke-based line icons in circular tinted badges, alternating
  blue/green/deep-blue for visual rhythm.
- **Callouts:** blue-bordered "Did You Know?" boxes for facts, green-bordered "What To Do
  Tomorrow" / action boxes for behavior change — reinforcing the guide's tomorrow-focused,
  non-judgmental tone.
