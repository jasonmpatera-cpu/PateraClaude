# Icon library for the Healthy Living Guide booklet.
# Each glyph is hand-drawn on a 24x24 grid in a consistent stroke-based
# style (Feather/Lucide-like: round caps/joins, ~1.8 stroke width).
# Glyphs are wrapped in a circular badge by gen_icons.py.

PALETTE = {
    "deep_blue": "#0F3D5C",
    "mid_blue": "#1B6CA8",
    "teal": "#128074",
    "green": "#1E9E6B",
    "light_blue_tint": "#E8F2FA",
    "light_green_tint": "#E6F6F0",
    "ink": "#1C2B33",
    "slate": "#4B5F68",
    "amber": "#C97A1A",
    "white": "#FFFFFF",
    "line": "#D7E4E8",
}

S = 'fill="none" stroke="{c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'

def st(c="{c}"):
    return f'fill="none" stroke="{c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'

# Each value: inner SVG markup for a 0 0 24 24 viewBox. Use {c} for stroke/fill color token.
ICONS = {}

ICONS["walking"] = '''
<circle cx="14" cy="4.2" r="1.9" {s}/>
<path d="M14 6.5 L12.6 12 L15.6 14.2 L16.4 19.5" {s}/>
<path d="M12.6 12 L8.6 13.6" {s}/>
<path d="M15.6 14.2 L13 18.8" {s}/>
<path d="M13 18.8 L10 20.2" {s}/>
<path d="M16.4 19.5 L19.2 20.6" {s}/>
'''

ICONS["dumbbell"] = '''
<rect x="3" y="9" width="3" height="6" rx="1" {s}/>
<rect x="18" y="9" width="3" height="6" rx="1" {s}/>
<path d="M6 12 H18" {s}/>
<rect x="1.5" y="10.5" width="1.5" height="3" rx="0.6" {s}/>
<rect x="21" y="10.5" width="1.5" height="3" rx="0.6" {s}/>
'''

ICONS["heart_pulse"] = '''
<path d="M12 20 C6 15.5 3 12.3 3 8.9 C3 6.2 5.1 4.2 7.6 4.2 C9.2 4.2 10.6 5 12 6.6 C13.4 5 14.8 4.2 16.4 4.2 C18.9 4.2 21 6.2 21 8.9 C21 12.3 18 15.5 12 20 Z" {s}/>
<path d="M6.2 11 H9.4 L10.6 8.4 L12.4 14.2 L13.6 11 H17.4" {s}/>
'''

ICONS["mobility"] = '''
<circle cx="12" cy="12" r="1.6" fill="{c}" stroke="none"/>
<path d="M12 4.4 A7.6 7.6 0 0 1 19.2 11.4" {s}/>
<path d="M19.2 11.4 L20.6 9.6 M19.2 11.4 L17.2 10.6" {s}/>
<path d="M12 19.6 A7.6 7.6 0 0 1 4.8 12.6" {s}/>
<path d="M4.8 12.6 L3.4 14.4 M4.8 12.6 L6.8 13.4" {s}/>
'''

ICONS["balance"] = '''
<circle cx="12" cy="4.3" r="1.8" {s}/>
<path d="M12 6.4 V13" {s}/>
<path d="M7 9.6 H17" {s}/>
<path d="M12 13 L9.4 20" {s}/>
<path d="M4 20.5 H14.5" {s}/>
'''

ICONS["flexibility"] = '''
<circle cx="8.4" cy="4.8" r="1.7" {s}/>
<path d="M8.8 6.5 C11 9.6 11.4 12.4 10 15.6" {s}/>
<path d="M8.8 6.5 L15.6 8.8" {s}/>
<path d="M10 15.6 L6.4 18.4" {s}/>
<path d="M10 15.6 L13.8 17.6" {s}/>
'''

ICONS["plate_meal"] = '''
<circle cx="12" cy="12" r="8.2" {s}/>
<circle cx="12" cy="12" r="4.2" {s}/>
'''

ICONS["apple"] = '''
<path d="M12 8.4 C10.6 6.6 8 6.6 6.8 8.4 C5.4 10.4 5.6 15 8.4 18.2 C9.6 19.6 10.6 19.9 12 19.4 C13.4 19.9 14.4 19.6 15.6 18.2 C18.4 15 18.6 10.4 17.2 8.4 C16 6.6 13.4 6.6 12 8.4 Z" {s}/>
<path d="M12 8.4 V5.6" {s}/>
<path d="M12 5.8 C13 4.6 14.2 4.4 15.2 4.8" {s}/>
'''

ICONS["fish"] = '''
<path d="M3 12.5 C6 9 10 7.6 14.5 8.6 C18 9.4 20.5 11 21.5 12.5 C20.5 14 18 15.6 14.5 16.4 C10 17.4 6 16 3 12.5 Z" {s}/>
<path d="M14.5 8.6 L17.4 5.6 M14.8 15.6 L17.6 18.6" {s}/>
<circle cx="7.6" cy="11.6" r="0.75" fill="{c}" stroke="none"/>
<path d="M3 12.5 L1.2 10.4 M3 12.5 L1.2 14.6" {s}/>
'''

ICONS["droplet"] = '''
<path d="M12 3.4 C9 8 6 11.5 6 15 A6 6 0 0 0 18 15 C18 11.5 15 8 12 3.4 Z" {s}/>
'''

ICONS["sleep"] = '''
<path d="M19.5 14.2 A8 8 0 1 1 10 4.6 A6.2 6.2 0 0 0 19.5 14.2 Z" {s}/>
<path d="M16.5 5 L17.3 6.8 L19.1 7.4 L17.3 8 L16.5 9.8 L15.7 8 L13.9 7.4 L15.7 6.8 Z" fill="{c}" stroke="none"/>
'''

ICONS["brain"] = '''
<path d="M9 4.4 C6.8 4.4 5.4 6.2 5.6 8 C4.2 8.6 3.4 10 3.8 11.6 C3.2 12.6 3.2 14 4 14.8 C3.8 16.6 5.2 18.2 7.2 18.2 C7.6 19.4 8.8 20 10 19.8 C11 19.6 11.6 18.8 11.6 17.8 V7.2 C11.6 5.6 10.4 4.4 9 4.4 Z" {s}/>
<path d="M14.8 4.4 C17 4.4 18.4 6.2 18.2 8 C19.6 8.6 20.4 10 20 11.6 C20.6 12.6 20.6 14 19.8 14.8 C20 16.6 18.6 18.2 16.6 18.2 C16.2 19.4 15 20 13.8 19.8 C12.8 19.6 12.2 18.8 12.2 17.8 V7.2 C12.2 5.6 13.4 4.4 14.8 4.4 Z" {s}/>
<path d="M11.6 8.6 C10.8 8.9 10 8.8 9.4 8.2 M12.2 8.6 C13 8.9 13.8 8.8 14.4 8.2" {s}/>
'''

ICONS["people"] = '''
<circle cx="8.4" cy="8.2" r="2.6" {s}/>
<circle cx="16.2" cy="9.4" r="2.1" {s}/>
<path d="M3.4 19 C3.7 15.4 5.7 13.4 8.4 13.4 C11.1 13.4 13 15.3 13.4 18.8" {s}/>
<path d="M13.6 14.4 C15.5 14.3 17.4 15.7 17.9 19" {s}/>
'''

ICONS["no_smoking"] = '''
<rect x="4" y="12.4" width="9.4" height="2.8" rx="0.5" {s}/>
<path d="M13.4 12.4 V15.2" {s}/>
<path d="M15 10.2 C15.8 11 15.8 11.8 15 12.6" {s}/>
<path d="M16.6 9 C18 10.4 18 12 16.6 13.4" {s}/>
<circle cx="12" cy="12.8" r="9" {s}/>
<path d="M5.6 6.4 L18.4 19.2" {s}/>
'''

ICONS["wine_moderate"] = '''
<path d="M7 3.6 H17 C17 8.4 15 11 12.9 11.6 V17.6" {s}/>
<path d="M17 3.6 C17 8.4 15 11 12 11 C9 11 7 8.4 7 3.6" {s}/>
<path d="M8.6 8.4 H15.4" {s}/>
<path d="M9 20.6 H15" {s}/>
<path d="M12 17.6 V20.6" {s}/>
'''

ICONS["bp_gauge"] = '''
<path d="M4.4 15.6 A7.6 7.6 0 0 1 19.6 15.6" {s}/>
<path d="M4.4 15.6 V13.4 M19.6 15.6 V13.4 M12 6.4 V8.6 M7.6 7.8 L8.8 9.6 M16.4 7.8 L15.2 9.6" {s}/>
<path d="M12 15.6 L15.4 10.8" {s}/>
<circle cx="12" cy="15.6" r="1.4" fill="{c}" stroke="none"/>
'''

ICONS["calendar_check"] = '''
<rect x="3.4" y="5" width="17.2" height="15.6" rx="1.6" {s}/>
<path d="M3.4 9.6 H20.6" {s}/>
<path d="M7.6 3 V6.6 M16.4 3 V6.6" {s}/>
<path d="M8 14.6 L10.6 17.2 L16.4 11.4" {s}/>
'''

ICONS["syringe"] = '''
<path d="M20.4 3.6 L18.4 5.6" {s}/>
<path d="M17 5 L19 7" {s}/>
<rect x="10.4" y="8.9" width="8.2" height="3.6" rx="0.6" transform="rotate(45 14.5 10.7)" {s}/>
<path d="M11.8 12.6 L4.6 19.8" {s}/>
<path d="M4.6 19.8 L3 21.4 M4.6 19.8 L6.2 21.4 M3 21.4 L6.2 21.4" {s}/>
<path d="M13.4 9.8 L15.4 11.8" {s}/>
'''

ICONS["tooth"] = '''
<path d="M12 4.4 C9.6 4.4 8.4 3.6 6.8 3.6 C4.6 3.6 3.4 5.6 3.6 8.4 C3.8 11.4 5 13.8 5.6 16.6 C6 18.4 6.6 20 7.8 20 C9 20 9 16.8 10.2 15 C10.7 14.2 11.3 13.9 12 13.9 C12.7 13.9 13.3 14.2 13.8 15 C15 16.8 15 20 16.2 20 C17.4 20 18 18.4 18.4 16.6 C19 13.8 20.2 11.4 20.4 8.4 C20.6 5.6 19.4 3.6 17.2 3.6 C15.6 3.6 14.4 4.4 12 4.4 Z" {s}/>
'''

ICONS["eye"] = '''
<path d="M2.4 12 C5 7.2 8.4 5.4 12 5.4 C15.6 5.4 19 7.2 21.6 12 C19 16.8 15.6 18.6 12 18.6 C8.4 18.6 5 16.8 2.4 12 Z" {s}/>
<circle cx="12" cy="12" r="3" {s}/>
'''

ICONS["ear"] = '''
<path d="M15.4 5 C18.4 6.4 19.8 9 19.4 12 C19 15.2 16.8 16.4 15.4 18.2 C14.4 19.6 14.4 21 15.6 21.4" {s}/>
<path d="M15.4 5 C12 3.4 8.2 4.4 6.6 7.6 C5.2 10.4 6 12.6 8 13.6 C9.4 14.3 10 13.6 10 12.6 C10 11.6 9.2 11.4 8.8 10.4 C8.4 9.4 9 8.2 10.2 8.2 C11.8 8.2 12.6 9.8 12.4 11.6 C12.2 13.6 10.6 14.8 10.6 17 C10.6 18.4 11.4 19.2 12.6 19.2" {s}/>
'''

ICONS["sun_skin"] = '''
<circle cx="12" cy="12" r="4.2" {s}/>
<path d="M12 3.6 V6 M12 18 V20.4 M20.4 12 H18 M6 12 H3.6" {s}/>
<path d="M17.7 6.3 L16 8 M8 16 L6.3 17.7 M17.7 17.7 L16 16 M8 8 L6.3 6.3" {s}/>
'''

ICONS["scale_weight"] = '''
<rect x="3" y="4.4" width="18" height="15.2" rx="2.4" {s}/>
<circle cx="12" cy="12" r="4.8" {s}/>
<path d="M12 12 L14.2 9.6" {s}/>
<circle cx="12" cy="12" r="0.7" fill="{c}" stroke="none"/>
'''

ICONS["clock"] = '''
<circle cx="12" cy="12" r="8.4" {s}/>
<path d="M12 7 V12 L15.4 14" {s}/>
'''

ICONS["pill"] = '''
<rect x="3.6" y="9.4" width="16.8" height="7.2" rx="3.6" transform="rotate(-30 12 13)" {s}/>
<path d="M12.6 8.3 L14.6 17.8" transform="rotate(-30 12 13)" {s}/>
'''

ICONS["cart"] = '''
<path d="M2.6 3.6 H5 L7.4 15.4 H18.2 L20.4 7.2 H6.4" {s}/>
<circle cx="9" cy="19.4" r="1.4" {s}/>
<circle cx="16.4" cy="19.4" r="1.4" {s}/>
'''

ICONS["label_tag"] = '''
<rect x="3.6" y="5" width="16.8" height="14" rx="1.6" {s}/>
<path d="M6.4 8.4 H17.6 M6.4 11 H17.6 M6.4 13.6 H14.4 M6.4 16.2 H12" {s}/>
'''

ICONS["lightbulb"] = '''
<path d="M8.2 14.6 C6.4 13.2 5.4 11.4 5.4 9.4 C5.4 5.9 8.3 3.4 12 3.4 C15.7 3.4 18.6 5.9 18.6 9.4 C18.6 11.4 17.6 13.2 15.8 14.6 C15 15.2 14.6 16 14.6 17 V18 H9.4 V17 C9.4 16 9 15.2 8.2 14.6 Z" {s}/>
<path d="M9.6 20.6 H14.4" {s}/>
<path d="M10.4 18 V14.6 M13.6 18 V14.6" {s}/>
'''

ICONS["check_circle"] = '''
<circle cx="12" cy="12" r="8.6" {s}/>
<path d="M7.8 12.2 L10.4 14.8 L16.2 9" {s}/>
'''

ICONS["coffee"] = '''
<path d="M4.6 8.4 H16.6 V15 A5 5 0 0 1 11.6 20 H9.6 A5 5 0 0 1 4.6 15 Z" {s}/>
<path d="M16.6 9.8 H18 A2.6 2.6 0 0 1 18 15 H16.6" {s}/>
<path d="M8 4.2 C7.4 5.2 7.4 5.8 8 6.8 M11.6 4.2 C11 5.2 11 5.8 11.6 6.8" {s}/>
'''

ICONS["egg"] = '''
<path d="M12 21 C7.6 21 5.4 17.6 5.4 13.6 C5.4 9 8.4 3 12 3 C15.6 3 18.6 9 18.6 13.6 C18.6 17.6 16.4 21 12 21 Z" {s}/>
'''

ICONS["leaf"] = '''
<path d="M5 19 C5 10.2 11 5 20 4.6 C20 13.6 14.6 19 6.6 19 Z" {s}/>
<path d="M5 19 C9 14.6 13 11.6 19.4 5.4" {s}/>
'''

ICONS["clipboard"] = '''
<rect x="5" y="4.6" width="14" height="16.8" rx="1.6" {s}/>
<rect x="8.6" y="3" width="6.8" height="3.2" rx="1" {s}/>
<path d="M8 11.4 H16 M8 14.4 H16 M8 17.4 H13.4" {s}/>
'''

ICONS["pantry_shelf"] = '''
<path d="M3 9.6 H21 M3 19 H21" {s}/>
<rect x="4.8" y="12.4" width="3.6" height="6.6" rx="0.8" {s}/>
<path d="M5.6 12.4 V10.6 H7.6 V12.4" {s}/>
<rect x="10.2" y="13.4" width="3.6" height="5.6" rx="1.6" {s}/>
<rect x="15.6" y="11.6" width="3.6" height="7.4" rx="0.8" {s}/>
<path d="M16.4 11.6 V10 H18.4 V11.6" {s}/>
'''

ICONS["magnifier"] = '''
<circle cx="10.6" cy="10.6" r="6.6" {s}/>
<path d="M15.4 15.4 L20.6 20.6" {s}/>
'''

ICONS["sunrise"] = '''
<path d="M3 16.4 H21" {s}/>
<path d="M6.4 16.4 A5.6 5.6 0 0 1 17.6 16.4" {s}/>
<path d="M12 6.4 V9.4 M6 9 L8 10.8 M18 9 L16 10.8" {s}/>
<path d="M2.4 20 H21.6" {s}/>
'''

ICONS["shield_check"] = '''
<path d="M12 3.4 L19.4 6.2 V11.4 C19.4 16 16.4 19.4 12 21 C7.6 19.4 4.6 16 4.6 11.4 V6.2 Z" {s}/>
<path d="M8.4 12 L10.8 14.4 L15.6 9.4" {s}/>
'''

ICONS["stress_calm"] = '''
<circle cx="12" cy="9.4" r="5" {s}/>
<path d="M8.6 8.4 C9.2 9.4 10.4 9.4 11 8.4 M13 8.4 C13.6 9.4 14.8 9.4 15.4 8.4" {s}/>
<path d="M9.4 12.2 C10.4 13.4 13.6 13.4 14.6 12.2" {s}/>
<path d="M9 18.4 C10.2 17.6 13.8 17.6 15 18.4" {s}/>
<path d="M8 20.6 C9.6 19.8 14.4 19.8 16 20.6" {s}/>
'''

ICONS["book_open"] = '''
<path d="M12 6.2 C10.4 4.8 7.6 4.4 4.6 4.8 V17.8 C7.6 17.4 10.4 17.8 12 19.2 C13.6 17.8 16.4 17.4 19.4 17.8 V4.8 C16.4 4.4 13.6 4.8 12 6.2 Z" {s}/>
<path d="M12 6.2 V19.2" {s}/>
'''

ICONS["grain_wheat"] = '''
<path d="M12 21 V6" {s}/>
<path d="M12 7 C10 7 8.6 5.6 8.6 3.6 C10.6 3.6 12 5 12 7 Z" {s}/>
<path d="M12 7 C14 7 15.4 5.6 15.4 3.6 C13.4 3.6 12 5 12 7 Z" {s}/>
<path d="M12 11 C10 11 8.6 9.6 8.6 7.6 C10.6 7.6 12 9 12 11 Z" {s}/>
<path d="M12 11 C14 11 15.4 9.6 15.4 7.6 C13.4 7.6 12 9 12 11 Z" {s}/>
<path d="M12 15 C10 15 8.6 13.6 8.6 11.6 C10.6 11.6 12 13 12 15 Z" {s}/>
<path d="M12 15 C14 15 15.4 13.6 15.4 11.6 C13.4 11.6 12 13 12 15 Z" {s}/>
'''

ICONS["timer_fasting"] = '''
<circle cx="12" cy="13" r="8" {s}/>
<path d="M9.4 2.6 H14.6" {s}/>
<path d="M12 2.6 V4.6" {s}/>
<path d="M12 8.4 V13 L15.2 15.2" {s}/>
<path d="M19.2 6 L20.4 7.2" {s}/>
'''

ICONS["home_kitchen"] = '''
<path d="M4 11.4 L12 4.6 L20 11.4" {s}/>
<path d="M6 10.2 V19.6 H18 V10.2" {s}/>
<path d="M10 19.6 V14.6 H14 V19.6" {s}/>
'''

ICONS["thermometer"] = '''
<path d="M12 4.4 A2 2 0 0 0 10 6.4 V14.4 A3.4 3.4 0 1 0 14 14.4 V6.4 A2 2 0 0 0 12 4.4 Z" {s}/>
<path d="M12 8.4 V14.8" {s}/>
'''

ICONS["target"] = '''
<circle cx="12" cy="12" r="8.4" {s}/>
<circle cx="12" cy="12" r="4.8" {s}/>
<circle cx="12" cy="12" r="1.2" fill="{c}" stroke="none"/>
'''

ICONS["footprints_alt"] = ICONS["walking"]
