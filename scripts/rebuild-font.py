"""Rebuild Junicode with a shrunk descender and a new family name.

Reads src/assets/fonts/junicode/*.woff, writes src/assets/fonts/ants-juni/*.woff with:
- OS/2.sTypoDescender, hhea.descent, OS/2.usWinDescent set to DESCENT_RATIO of em
- fsSelection USE_TYPO_METRICS bit forced on (so browsers use the typo metrics)
- Font family renamed to NEW_FAMILY (OFL requires Reserved Font Name "Junicode"
  not appear in derivative names)

Run: /tmp/fontenv/bin/python scripts/rebuild-font.py
"""
from pathlib import Path

from fontTools.ttLib import TTFont

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
SRC_DIR = PROJECT_ROOT / "src" / "assets" / "fonts" / "junicode"
DST_DIR = PROJECT_ROOT / "src" / "assets" / "fonts" / "ants-juni"
NEW_FAMILY = "ANTS Juni"
NEW_POSTSCRIPT_FAMILY = "ANTSJuni"
DESCENT_RATIO = 0  # This is what I modified!

STYLES = {
    "Junicode.woff":            {"subfamily": "Regular",     "full_suffix": "",              "ps_suffix": "",             "out": "ANTSJuni.woff",             "weight": 400, "italic": False},
    "Junicode-Italic.woff":     {"subfamily": "Italic",      "full_suffix": " Italic",       "ps_suffix": "-Italic",      "out": "ANTSJuni-Italic.woff",      "weight": 400, "italic": True},
    "Junicode-Bold.woff":       {"subfamily": "Bold",        "full_suffix": " Bold",         "ps_suffix": "-Bold",        "out": "ANTSJuni-Bold.woff",        "weight": 700, "italic": False},
    "Junicode-BoldItalic.woff": {"subfamily": "Bold Italic", "full_suffix": " Bold Italic",  "ps_suffix": "-BoldItalic",  "out": "ANTSJuni-BoldItalic.woff",  "weight": 700, "italic": True},
}

RENAME_IDS = {1, 3, 4, 6, 16, 17, 18, 20, 21, 22}


def rebuild(src: Path, dst: Path, style: dict) -> None:
    font = TTFont(src)
    upm = font["head"].unitsPerEm
    new_descent = int(round(upm * DESCENT_RATIO))

    old_typo = font["OS/2"].sTypoDescender
    font["OS/2"].sTypoDescender = -new_descent
    font["OS/2"].usWinDescent = new_descent
    font["hhea"].descent = -new_descent

    font["OS/2"].usWeightClass = style["weight"]

    # fsSelection: clear REGULAR/ITALIC/BOLD (bits 6/0/5), then set the ones we want plus USE_TYPO_METRICS (bit 7).
    fs = font["OS/2"].fsSelection & ~((1 << 6) | (1 << 5) | (1 << 0))
    is_bold = style["weight"] >= 700
    if not is_bold and not style["italic"]:
        fs |= (1 << 6)
    if is_bold:
        fs |= (1 << 5)
    if style["italic"]:
        fs |= (1 << 0)
    fs |= (1 << 7)
    font["OS/2"].fsSelection = fs

    # macStyle: bit 0 = bold, bit 1 = italic.
    mac = 0
    if is_bold:
        mac |= (1 << 0)
    if style["italic"]:
        mac |= (1 << 1)
    font["head"].macStyle = mac

    full_name = f"{NEW_FAMILY}{style['full_suffix']}"
    ps_name = f"{NEW_POSTSCRIPT_FAMILY}{style['ps_suffix']}"

    name = font["name"]
    name.names = [n for n in name.names if n.nameID not in RENAME_IDS]
    for name_id, value in [(1, NEW_FAMILY), (2, style["subfamily"]), (4, full_name), (6, ps_name)]:
        name.setName(value, name_id, 3, 1, 0x409)
        name.setName(value, name_id, 1, 0, 0)

    dst.parent.mkdir(parents=True, exist_ok=True)
    font.save(dst)
    print(f"  {src.name:32} -> {dst.name:28} sTypoDescender {old_typo} -> {-new_descent} (upm={upm})")


def main() -> None:
    for src_name, style in STYLES.items():
        src = SRC_DIR / src_name
        dst = DST_DIR / style["out"]
        rebuild(src, dst, style)


if __name__ == "__main__":
    main()
