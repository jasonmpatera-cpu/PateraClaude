#!/usr/bin/env python3
"""Generate the large custom infographics for the Healthy Living Guide."""
import os, math
from svg_helpers import polar, wedge_path, wrap_svg, text, multiline, rrect, circle, line, esc
from icon_lib import PALETTE as P

OUT = os.path.join(os.path.dirname(__file__), "..", "graphics", "infographics")
os.makedirs(OUT, exist_ok=True)

def save(name, svg):
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(svg)
    print("wrote", name)

# ---------------------------------------------------------------- 1. HEALTHY PLATE
def healthy_plate():
    W, H = 1000, 820
    cx, cy, r = 470, 360, 210
    body = []
    body.append(circle(cx, cy, r + 14, fill="#FFFFFF", stroke=P["line"], sw=3))
    quads = [
        (240, 360, P["green"], "VEGETABLES", "Fill half your plate", "Aim for color & variety"),
        (180, 240, "#8FD1AE", "FRUITS", "Whole fruit over juice", "1–2 servings per meal"),
        (0, 90, P["mid_blue"], "WHOLE GRAINS", "Choose 100% whole grain", "Brown rice, oats, quinoa"),
        (90, 180, P["deep_blue"], "PROTEIN", "Fish, poultry, beans, eggs", "Palm-sized portion"),
    ]
    for start, end, color, label, sub1, sub2 in quads:
        body.append(f'<path d="{wedge_path(cx, cy, r, start, end)}" fill="{color}" stroke="#FFFFFF" stroke-width="4"/>')
    body.append(circle(cx, cy, r, fill="none", stroke=P["ink"], sw=2))
    # plate rim highlight
    body.append(circle(cx, cy, r + 14, fill="none", stroke=P["slate"], sw=2))

    label_pos = [
        (300, "VEGETABLES", ["Fill half your plate", "Aim for color & variety"], P["green"]),
        (210, "FRUITS", ["Whole fruit", "over juice"], "#4CA97B"),
        (45, "WHOLE GRAINS", ["Brown rice, oats, quinoa,", "100% whole wheat"], P["mid_blue"]),
        (135, "PROTEIN", ["Fish, poultry, beans, eggs,", "tofu — palm-sized portion"], P["deep_blue"]),
    ]
    for ang, label, subs, color in label_pos:
        lx, ly = polar(cx, cy, r + 95, ang)
        anchor = "middle"
        if lx < cx - 20:
            anchor = "end"
        elif lx > cx + 20:
            anchor = "start"
        body.append(text(lx, ly, label, size=22, weight=800, color=color, anchor=anchor))
        body.append(multiline(lx, ly + 24, subs, size=15.5, weight=500, color=P["slate"], anchor=anchor, line_height=20))
        # leader line
        p1 = polar(cx, cy, r + 16, ang)
        p2 = polar(cx, cy, r + 60, ang)
        body.append(line(*p1, *p2, stroke=P["slate"], sw=1.5))

    # side notes: oils + water (placed well clear of the quadrant labels)
    body.append(circle(150, 745, 34, fill=P["light_green_tint"], stroke=P["teal"], sw=2.5))
    body.append(text(150, 753, "OIL", size=15, weight=800, color=P["teal"], anchor="middle"))
    body.append(text(210, 738, "Healthy oils", size=16, weight=700, color=P["ink"], anchor="start"))
    body.append(text(210, 758, "olive, avocado, canola", size=12.5, weight=500, color=P["slate"], anchor="start"))

    body.append(f'<path d="M818 725 L848 725 L842 770 A6 6 0 0 1 824 770 Z" fill="{P["light_blue_tint"]}" stroke="{P["mid_blue"]}" stroke-width="2.5"/>')
    body.append(text(800, 738, "Water first", size=16, weight=700, color=P["ink"], anchor="end"))
    body.append(text(800, 758, "skip sugary drinks", size=12.5, weight=500, color=P["slate"], anchor="end"))

    body.append(text(cx, 40, "THE HEALTHY PLATE", size=26, weight=800, color=P["deep_blue"], anchor="middle", spacing="0.5"))
    return wrap_svg(W, H, "\n".join(body))

# ---------------------------------------------------------------- 2 & 3. PYRAMIDS
def pyramid(title, apex_y, base_y, half_base, cx, tiers, footer_lines=None, W=1080, H=760):
    body = []
    n = len(tiers)
    body.append(text(cx, 44, title, size=25, weight=800, color=P["deep_blue"], anchor="middle"))
    step = (base_y - apex_y) / n
    for i, (color, lines_) in enumerate(tiers):
        y_top = apex_y + i * step
        y_bot = apex_y + (i + 1) * step
        w_top = half_base * (y_top - apex_y) / (base_y - apex_y)
        w_bot = half_base * (y_bot - apex_y) / (base_y - apex_y)
        pts = f"{cx-w_top:.1f},{y_top:.1f} {cx+w_top:.1f},{y_top:.1f} {cx+w_bot:.1f},{y_bot:.1f} {cx-w_bot:.1f},{y_bot:.1f}"
        body.append(f'<polygon points="{pts}" fill="{color}" stroke="#FFFFFF" stroke-width="3"/>')
        label_x = cx + w_bot + 36
        label_y_center = (y_top + y_bot) / 2
        text_color = P["ink"]
        heading = lines_[0]
        rest = lines_[1:]
        body.append(line(cx + w_bot, label_y_center, label_x - 10, label_y_center, stroke=P["slate"], sw=1.3))
        body.append(text(label_x, label_y_center - (4 if rest else -5), heading, size=15.5, weight=800, color=P["deep_blue"], anchor="start"))
        if rest:
            body.append(multiline(label_x, label_y_center + 14, rest, size=13, weight=500, color=P["slate"], anchor="start", line_height=16))
    if footer_lines:
        body.append(rrect(cx - half_base - 20, base_y + 26, 2*(half_base+20), 54, 10, fill=P["light_blue_tint"]))
        body.append(multiline(cx, base_y + 50, footer_lines, size=14, weight=700, color=P["deep_blue"], anchor="middle", line_height=20))
    return wrap_svg(W, H, "\n".join(body))

def mediterranean_pyramid():
    tiers = [
        ("#C97A1A", ["Red meat & sweets", "Less often, small portions"]),
        (P["mid_blue"], ["Poultry, eggs & dairy", "Moderate portions, weekly"]),
        (P["teal"], ["Fish & seafood", "At least twice a week"]),
        ("#4CA97B", ["Nuts, seeds & legumes", "Beans — enjoy daily"]),
        (P["green"], ["Vegetables & whole grains", "Fruits, olive oil, herbs — every meal"]),
    ]
    return pyramid("MEDITERRANEAN EATING PATTERN", 90, 620, 330, 420, tiers,
                    footer_lines=["Every day: stay physically active, share meals with others,",
                                  "and drink plenty of water"])

def exercise_pyramid():
    tiers = [
        (P["slate"], ["Limit", "Prolonged sitting & screen time"]),
        (P["teal"], ["Flexibility & mobility", "2–3 days per week"]),
        (P["mid_blue"], ["Strength training", "All major muscles, 2–3 days/week"]),
        ("#5FA8D3", ["Zone 2 cardio", "150–300 min/week, most days"]),
        (P["light_blue_tint"].replace("#E8F2FA","#BFE0F5"), ["Move more, sit less", "Every day — walk, take the stairs"]),
    ]
    return pyramid("WEEKLY EXERCISE PYRAMID", 90, 620, 330, 420, tiers,
                    footer_lines=["Any movement counts — start small and build the habit"])

# ---------------------------------------------------------------- 4. ZONE 2 CHART
def zone2_chart():
    W, H = 980, 420
    body = []
    body.append(text(W/2, 40, "UNDERSTANDING YOUR EXERCISE ZONES", size=23, weight=800, color=P["deep_blue"], anchor="middle"))
    zones = [
        ("Zone 1", "50–60%", "Very light", "#CFE8F5"),
        ("Zone 2", "60–70%", "Light — easy pace", "#7FC4E8"),
        ("Zone 3", "70–80%", "Moderate", P["mid_blue"]),
        ("Zone 4", "80–90%", "Hard", P["deep_blue"]),
        ("Zone 5", "90–100%", "Maximum effort", "#0A2A40"),
    ]
    x0, y0, bw, bh = 60, 150, (W-120)/5, 90
    for i, (name, pct, desc, color) in enumerate(zones):
        x = x0 + i*bw
        body.append(f'<rect x="{x:.1f}" y="{y0}" width="{bw-6:.1f}" height="{bh}" fill="{color}"/>')
        txt_color = "#FFFFFF" if i >= 2 else P["ink"]
        body.append(text(x+bw/2-3, y0+34, name, size=17, weight=800, color=txt_color, anchor="middle"))
        body.append(text(x+bw/2-3, y0+58, pct, size=15, weight=700, color=txt_color, anchor="middle"))
        body.append(multiline(x+bw/2-3, y0+bh+22, [desc], size=13, weight=600, color=P["slate"], anchor="middle"))
    # Zone 2 callout
    z2x = x0 + bw*1 + (bw-6)/2 - 3
    body.append(f'<path d="M{z2x-70},{y0-20} h140 v-34 l-14,20 h-112 l-14,20 Z" fill="{P["light_blue_tint"]}" stroke="{P["mid_blue"]}" stroke-width="2"/>')
    body.append(multiline(z2x, y0-58, ["Zone 2 is your fat-burning,", "endurance-building sweet spot"], size=13.5, weight=700, color=P["deep_blue"], anchor="middle", line_height=17))
    body.append(rrect(60, 300, W-120, 70, 10, fill=P["light_green_tint"]))
    body.append(text(90, 328, "The Talk Test", size=15.5, weight=800, color=P["teal"], anchor="start"))
    body.append(multiline(90, 350, ["In Zone 2, you can comfortably hold a conversation but couldn't sing.", "If you're too breathless to talk, slow down."], size=13.5, weight=500, color=P["ink"], anchor="start", line_height=18))
    return wrap_svg(W, H, "\n".join(body))

# ---------------------------------------------------------------- 5. GROCERY CART
def grocery_cart():
    W, H = 900, 620
    body = []
    body.append(text(W/2, 42, "SHOP THE HEALTHY CART", size=23, weight=800, color=P["deep_blue"], anchor="middle"))
    cx = 450
    s = 11
    g = P["deep_blue"]
    cart = f'''
    <g transform="translate({cx-8.5*s},170) scale({s})" stroke="{g}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2.6 3.6 H5 L7.4 15.4 H18.2 L20.4 7.2 H6.4"/>
      <circle cx="9" cy="19.4" r="1.4"/>
      <circle cx="16.4" cy="19.4" r="1.4"/>
    </g>'''
    body.append(cart)
    callouts = [
        (150, 120, "PRODUCE", ["Fresh & frozen vegetables,", "fruit — fill your cart first"], P["green"]),
        (750, 120, "PROTEIN", ["Poultry, fish, eggs, beans,", "lentils, tofu, Greek yogurt"], P["deep_blue"]),
        (150, 470, "WHOLE GRAINS", ["Oats, brown rice, quinoa,", "100% whole-wheat bread"], P["teal"]),
        (750, 470, "HEALTHY FATS", ["Olive oil, nuts, seeds,", "avocado"], "#C97A1A"),
    ]
    anchors_from = [(cx-90,260),(cx+90,260),(cx-90,340),(cx+90,340)]
    for (lx, ly, label, subs, color), (fx, fy) in zip(callouts, anchors_from):
        body.append(line(fx, fy, lx + (60 if lx < cx else -60), ly + 30, stroke=P["line"], sw=2))
        anchor = "middle"
        body.append(rrect(lx-110, ly-34, 220, 92, 10, fill="#FFFFFF", stroke=color, sw=2))
        body.append(text(lx, ly-6, label, size=16.5, weight=800, color=color, anchor=anchor))
        body.append(multiline(lx, ly+16, subs, size=13, weight=500, color=P["ink"], anchor=anchor, line_height=17))
    return wrap_svg(W, H, "\n".join(body))

# ---------------------------------------------------------------- 6. NUTRITION LABEL
def nutrition_label():
    W, H = 980, 620
    body = []
    lx, ly, lw = 60, 40, 300
    body.append(text(lx+lw/2, 26, "", size=1))
    body.append(f'<rect x="{lx}" y="{ly}" width="{lw}" height="540" fill="#FFFFFF" stroke="{P["ink"]}" stroke-width="3"/>')
    y = ly + 34
    body.append(text(lx+14, y, "Nutrition Facts", size=27, weight=800, color=P["ink"]))
    y += 14
    body.append(line(lx+10, y, lx+lw-10, y, stroke=P["ink"], sw=1))
    y += 20
    body.append(text(lx+14, y, "8 servings per container", size=13, weight=500, color=P["ink"]))
    y += 20
    body.append(text(lx+14, y, "Serving size", size=15, weight=800, color=P["ink"]))
    body.append(text(lx+lw-14, y, "2/3 cup (55g)", size=15, weight=800, color=P["ink"], anchor="end"))
    y += 10
    body.append(f'<rect x="{lx}" y="{y}" width="{lw}" height="8" fill="{P["ink"]}"/>')
    y += 26
    body.append(text(lx+14, y, "Amount per serving", size=12, weight=600, color=P["ink"]))
    y += 30
    body.append(text(lx+14, y, "Calories", size=24, weight=800, color=P["ink"]))
    body.append(text(lx+lw-14, y, "230", size=28, weight=800, color=P["ink"], anchor="end"))
    y += 10
    body.append(f'<rect x="{lx}" y="{y}" width="{lw}" height="5" fill="{P["ink"]}"/>')
    y += 18
    body.append(text(lx+lw-14, y, "% Daily Value*", size=11, weight=800, color=P["ink"], anchor="end"))
    y += 8
    body.append(line(lx+10, y, lx+lw-10, y, stroke=P["ink"], sw=1))

    rows = [
        ("Total Fat 8g", "10%", 800), ("  Saturated Fat 1g", "5%", 500),
        ("  Trans Fat 0g", "", 500), ("Cholesterol 0mg", "0%", 800),
        ("Sodium 160mg", "7%", 800), ("Total Carbohydrate 37g", "13%", 800),
        ("  Dietary Fiber 4g", "14%", 700), ("  Total Sugars 12g", "", 500),
        ("    Includes 10g Added Sugars", "20%", 500), ("Protein 3g", "", 800),
    ]
    highlight_rows = {"Sodium 160mg", "  Dietary Fiber 4g", "    Includes 10g Added Sugars"}
    for label, pct, weight in rows:
        y += 20
        if label.strip() in [h.strip() for h in highlight_rows]:
            body.append(f'<rect x="{lx+2}" y="{y-14}" width="{lw-4}" height="19" fill="{P["light_blue_tint"]}"/>')
        body.append(text(lx+14, y, label, size=12.5, weight=weight, color=P["ink"]))
        if pct:
            body.append(text(lx+lw-14, y, pct, size=12.5, weight=700, color=P["ink"], anchor="end"))
        y += 6
        body.append(line(lx+10, y, lx+lw-10, y, stroke="#DDDDDD", sw=1))
    y += 16
    body.append(line(lx+10, y, lx+lw-10, y, stroke=P["ink"], sw=4))
    y += 18
    for m in ["Vitamin D 2mcg 10%", "Calcium 260mg 20%", "Iron 8mg 45%", "Potassium 240mg 6%"]:
        body.append(text(lx+14, y, m, size=11.5, weight=500, color=P["ink"]))
        y += 17

    callouts = [
        (ly+70, "Check the serving size first —", "all numbers on the label are per serving."),
        (ly+272, "% Daily Value shows how much", "one serving contributes to a full day (based on 2,000 calories)."),
        (ly+405, "Added sugars, sodium & saturated fat:", "choose foods with lower % Daily Value more often."),
        (ly+320, "Fiber: aim for 25–38g a day —", "look for 3g+ of fiber per serving."),
    ]
    cx0 = lx + lw + 60
    for cy, h1, h2 in callouts:
        body.append(line(lx+lw, cy, cx0-10, cy, stroke=P["mid_blue"], sw=1.5))
        body.append(circle(lx+lw, cy, 4, fill=P["mid_blue"]))
        body.append(text(cx0, cy-6, h1, size=14.5, weight=800, color=P["deep_blue"]))
        body.append(text(cx0, cy+14, h2, size=13, weight=500, color=P["ink"]))
    body.append(text(lx+lw/2, 22, "READ THE LABEL", size=20, weight=800, color=P["deep_blue"], anchor="middle"))
    return wrap_svg(W, H, "\n".join(body))

# ---------------------------------------------------------------- 7. HEALTHY PANTRY
def healthy_pantry():
    W, H = 980, 560
    body = []
    body.append(text(W/2, 40, "STOCK A HEALTHY PANTRY", size=23, weight=800, color=P["deep_blue"], anchor="middle"))
    shelves = [
        (150, "WHOLE GRAINS & LEGUMES", "Oats · brown rice · quinoa · whole-wheat pasta · lentils · beans", P["green"]),
        (300, "PANTRY STAPLES", "Olive oil · canned tomatoes · low-sodium broth · canned fish · vinegar", P["mid_blue"]),
        (450, "NUTS, SEEDS & FLAVOR", "Almonds · walnuts · chia · peanut butter · herbs & spices · garlic", "#C97A1A"),
    ]
    for y, title, items, color in shelves:
        body.append(line(80, y, 900, y, stroke=P["ink"], sw=5))
        body.append(line(80, y+4, 80, y-70, stroke=P["ink"], sw=5))
        body.append(line(900, y+4, 900, y-70, stroke=P["ink"], sw=5))
        jar_x = 110
        for j in range(9):
            jx = jar_x + j*88
            jh = 46 + (j % 3) * 10
            body.append(rrect(jx, y-jh-6, 46, jh, 8, fill=color, stroke="#FFFFFF", sw=2))
            body.append(rrect(jx+10, y-jh-14, 26, 10, 3, fill=P["ink"]))
        body.append(text(80, y+30, title, size=15.5, weight=800, color=color))
        body.append(text(80, y+50, items, size=12.5, weight=500, color=P["slate"]))
    return wrap_svg(W, H, "\n".join(body))

# ---------------------------------------------------------------- 8/9. BAR CHARTS
def bar_chart(title, unit_label, items, color, W=900, H=None, note=None):
    n = len(items)
    row_h = 46
    top = 90
    H = H or (top + n*row_h + 70)
    body = []
    body.append(text(W/2, 42, title, size=22, weight=800, color=P["deep_blue"], anchor="middle"))
    max_v = max(v for _, v, _ in items)
    chart_x = 300
    chart_w = W - chart_x - 120
    for i, (label, v, sub) in enumerate(items):
        y = top + i*row_h
        body.append(text(chart_x-16, y+18, label, size=14.5, weight=700, color=P["ink"], anchor="end"))
        if sub:
            body.append(text(chart_x-16, y+34, sub, size=11.5, weight=500, color=P["slate"], anchor="end"))
        bw = chart_w * v / max_v
        body.append(rrect(chart_x, y+2, chart_w, 22, 5, fill="#EEF3F5"))
        body.append(rrect(chart_x, y+2, bw, 22, 5, fill=color))
        body.append(text(chart_x+bw+10, y+18, f"{v}{unit_label}", size=13.5, weight=800, color=P["ink"], anchor="start"))
    if note:
        body.append(rrect(chart_x-240, top+n*row_h+14, W-(chart_x-240)-60, 46, 8, fill=P["light_green_tint"] if color==P["green"] else P["light_blue_tint"]))
        body.append(text(chart_x-240+16, top+n*row_h+42, note, size=13, weight=600, color=P["ink"]))
    return wrap_svg(W, H, "\n".join(body))

def protein_comparison():
    items = [
        ("Chicken breast", 31, "3.5 oz, cooked"),
        ("Greek yogurt", 18, "3/4 cup, plain"),
        ("Salmon", 25, "3.5 oz, cooked"),
        ("Lentils", 18, "1 cup, cooked"),
        ("Cottage cheese", 21, "3/4 cup"),
        ("Eggs", 12, "2 large"),
        ("Tofu", 12, "3.5 oz, firm"),
    ]
    return bar_chart("PROTEIN AT A GLANCE", "g protein", items, P["mid_blue"],
                      note="Spread protein across meals — aim for a source at breakfast, lunch, and dinner.")

def fiber_foods():
    items = [
        ("Split peas", 16, "1 cup, cooked"),
        ("Lentils", 15, "1 cup, cooked"),
        ("Black beans", 15, "1 cup, cooked"),
        ("Raspberries", 8, "1 cup"),
        ("Avocado", 10, "1 whole"),
        ("Chia seeds", 10, "1 oz (2 tbsp)"),
        ("Pear", 6, "1 medium, with skin"),
        ("Broccoli", 5, "1 cup, cooked"),
    ]
    return bar_chart("FIBER AT A GLANCE", "g fiber", items, P["green"],
                      note="Most adults need 25–38g of fiber a day — only about 5% of Americans get enough.")

# ---------------------------------------------------------------- 10. WEEKLY EXERCISE CALENDAR
def weekly_calendar():
    W, H = 980, 420
    body = []
    body.append(text(W/2, 40, "A SAMPLE BALANCED WEEK", size=23, weight=800, color=P["deep_blue"], anchor="middle"))
    days = ["MON","TUE","WED","THU","FRI","SAT","SUN"]
    plan = [
        [("Strength", P["mid_blue"])],
        [("Zone 2 cardio", "#5FA8D3"), ("Walk", P["green"])],
        [("Mobility", P["teal"]), ("Walk", P["green"])],
        [("Strength", P["mid_blue"])],
        [("Zone 2 cardio", "#5FA8D3"), ("Walk", P["green"])],
        [("Active fun", P["green"])],
        [("Rest & stretch", P["slate"])],
    ]
    col_w = (W-120)/7
    x0, y0 = 60, 90
    for i, d in enumerate(days):
        x = x0 + i*col_w
        body.append(rrect(x, y0, col_w-10, 280, 10, fill="#F7FAFB", stroke=P["line"], sw=1.5))
        body.append(text(x+(col_w-10)/2, y0+30, d, size=14.5, weight=800, color=P["deep_blue"], anchor="middle"))
        cy = y0+56
        for label, color in plan[i]:
            body.append(rrect(x+10, cy, col_w-30, 46, 8, fill=color))
            tcolor = "#FFFFFF"
            words = label.split(" ")
            if len(words) > 1 and len(label) > 9:
                body.append(text(x+(col_w-10)/2, cy+20, words[0], size=12, weight=700, color=tcolor, anchor="middle"))
                body.append(text(x+(col_w-10)/2, cy+36, " ".join(words[1:]), size=12, weight=700, color=tcolor, anchor="middle"))
            else:
                body.append(text(x+(col_w-10)/2, cy+28, label, size=12.5, weight=700, color=tcolor, anchor="middle"))
            cy += 58
    body.append(text(W/2, 400, "Any order works — the goal is consistency across the week, not perfection on any single day.",
                      size=13, weight=500, color=P["slate"], anchor="middle"))
    return wrap_svg(W, H, "\n".join(body))

# ---------------------------------------------------------------- 11. WEIGHT HABITS WHEEL
def weight_habits_wheel():
    W, H = 900, 900
    cx, cy = 450, 450
    body = []
    body.append(text(cx, 44, "SUSTAINABLE HABITS FOR A HEALTHY WEIGHT", size=22, weight=800, color=P["deep_blue"], anchor="middle"))
    body.append(circle(cx, cy, 110, fill=P["deep_blue"]))
    body.append(multiline(cx, cy-6, ["Small, steady", "changes —", "not quick fixes"], size=17, weight=800, color="#FFFFFF", anchor="middle", line_height=22))
    habits = [
        (0, "Protein at every meal", P["mid_blue"]),
        (51.4, "Fill half your plate\nwith vegetables", P["green"]),
        (102.8, "Walk after meals", P["teal"]),
        (154.2, "Prioritize 7–9 hours\nof sleep", "#5FA8D3"),
        (205.6, "Limit sugary\ndrinks & alcohol", "#C97A1A"),
        (257, "Plan ahead for\neating out", P["deep_blue"]),
        (308.4, "Manage stress", P["green"]),
    ]
    R = 330
    for ang, label, color in habits:
        px, py = polar(cx, cy, R, ang)
        ix, iy = polar(cx, cy, 190, ang)
        body.append(line(ix, iy, px, py, stroke=P["line"], sw=2))
        body.append(circle(px, py, 66, fill=color))
        lines_ = label.split("\n")
        n = len(lines_)
        starty = py - (n-1)*9 + 5
        for j, ln in enumerate(lines_):
            body.append(text(px, starty + j*18, ln, size=12.5, weight=700, color="#FFFFFF", anchor="middle"))
    return wrap_svg(W, H, "\n".join(body))

# ---------------------------------------------------------------- 12. PORTION SIZES
def portion_sizes():
    W, H = 980, 400
    body = []
    body.append(text(W/2, 40, "PORTION SIZES — NO SCALE NEEDED", size=22, weight=800, color=P["deep_blue"], anchor="middle"))
    cols = [
        ("PROTEIN", "Palm-sized", "3–4 oz cooked meat, poultry, or fish", P["deep_blue"], "palm"),
        ("VEGETABLES", "Fist-sized", "About 1 cup raw or cooked vegetables", P["green"], "fist"),
        ("CARBOHYDRATES", "Cupped hand", "1/2–1 cup rice, pasta, potato, or fruit", P["mid_blue"], "cup"),
        ("FATS & OILS", "Thumb-sized", "1–2 tablespoons oil, butter, or nut butter", "#C97A1A", "thumb"),
    ]
    col_w = (W-80)/4
    for i, (title, hand, desc, color, shape) in enumerate(cols):
        x = 40 + i*col_w + col_w/2
        body.append(circle(x, 150, 78, fill="#F7FAFB", stroke=color, sw=2.5))
        if shape == "palm":
            body.append(rrect(x-34, 130, 68, 54, 14, fill=color))
            for k in range(4):
                body.append(rrect(x-32+k*17, 96, 13, 40, 6, fill=color))
        elif shape == "fist":
            body.append(circle(x, 152, 40, fill=color))
        elif shape == "cup":
            body.append(f'<path d="M{x-42},140 Q{x},200 {x+42},140 L{x+34},130 Q{x},170 {x-34},130 Z" fill="{color}"/>')
        elif shape == "thumb":
            body.append(rrect(x-16, 150, 32, 46, 12, fill=color))
            body.append(circle(x, 138, 17, fill=color))
        body.append(text(x, 250, title, size=15, weight=800, color=color, anchor="middle"))
        body.append(text(x, 272, hand, size=13.5, weight=700, color=P["ink"], anchor="middle"))
        words = desc.split(" ")
        line1, line2 = " ".join(words[:len(words)//2+1]), " ".join(words[len(words)//2+1:])
        body.append(text(x, 294, line1, size=12, weight=500, color=P["slate"], anchor="middle"))
        body.append(text(x, 310, line2, size=12, weight=500, color=P["slate"], anchor="middle"))
    return wrap_svg(W, H, "\n".join(body))

if __name__ == "__main__":
    save("healthy_plate", healthy_plate())
    save("mediterranean_pyramid", mediterranean_pyramid())
    save("exercise_pyramid", exercise_pyramid())
    save("zone2_chart", zone2_chart())
    save("grocery_cart", grocery_cart())
    save("nutrition_label", nutrition_label())
    save("healthy_pantry", healthy_pantry())
    save("protein_comparison", protein_comparison())
    save("fiber_foods", fiber_foods())
    save("weekly_calendar", weekly_calendar())
    save("weight_habits_wheel", weight_habits_wheel())
    save("portion_sizes", portion_sizes())
