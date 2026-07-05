import math

def polar(cx, cy, r, deg):
    rad = math.radians(deg - 90)
    return (cx + r * math.cos(rad), cy + r * math.sin(rad))

def wedge_path(cx, cy, r, start_deg, end_deg, r_inner=0):
    """Pie or donut wedge path, angles measured clockwise from 12 o'clock."""
    large = 1 if (end_deg - start_deg) % 360 > 180 else 0
    x1, y1 = polar(cx, cy, r, start_deg)
    x2, y2 = polar(cx, cy, r, end_deg)
    if r_inner <= 0:
        return (f"M{cx:.2f},{cy:.2f} L{x1:.2f},{y1:.2f} "
                f"A{r:.2f},{r:.2f} 0 {large} 1 {x2:.2f},{y2:.2f} Z")
    xi1, yi1 = polar(cx, cy, r_inner, start_deg)
    xi2, yi2 = polar(cx, cy, r_inner, end_deg)
    return (f"M{x1:.2f},{y1:.2f} A{r:.2f},{r:.2f} 0 {large} 1 {x2:.2f},{y2:.2f} "
            f"L{xi2:.2f},{yi2:.2f} A{r_inner:.2f},{r_inner:.2f} 0 {large} 0 {xi1:.2f},{yi1:.2f} Z")

def label_at(cx, cy, r, deg):
    return polar(cx, cy, r, deg)

def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def wrap_svg(width, height, body, font="Inter, Arial, sans-serif"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
            f'width="{width}" height="{height}" font-family="{font}">\n{body}\n</svg>\n')

def text(x, y, s, size=16, weight=600, color="#0F3D5C", anchor="start", italic=False, spacing=None):
    style_extra = ' font-style="italic"' if italic else ''
    ls = f' letter-spacing="{spacing}"' if spacing else ''
    return (f'<text x="{x:.2f}" y="{y:.2f}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}" text-anchor="{anchor}"{style_extra}{ls}>{esc(s)}</text>')

def multiline(x, y, lines, size=14, weight=500, color="#1C2B33", anchor="start", line_height=None, spacing_first=0):
    lh = line_height or size * 1.35
    out = []
    for i, ln in enumerate(lines):
        out.append(text(x, y + spacing_first + i * lh, ln, size=size, weight=weight, color=color, anchor=anchor))
    return "\n".join(out)

def rrect(x, y, w, h, rx, fill, stroke=None, sw=0):
    stroke_attr = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{rx}" fill="{fill}"{stroke_attr}/>'

def circle(cx, cy, r, fill="none", stroke=None, sw=0):
    stroke_attr = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fill}"{stroke_attr}/>'

def line(x1, y1, x2, y2, stroke, sw=1.5, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{stroke}" stroke-width="{sw}"{d}/>'
