#!/usr/bin/env python3
import os, json, glob, re

CARD_GLOB = os.getenv("PAL_CARD_GLOB", "ledger/model_cards/*.json")
README_PATH = os.getenv("README_PATH", "README.md")
ROLLOUT_BADGE = os.getenv("ROLLOUT_BADGE", "docs/badges/pal_rollout.svg")
SAFETY_BADGE  = os.getenv("SAFETY_BADGE",  "docs/badges/pal_safety.svg")

BADGE_START = "<!-- PAL BADGES START -->"
BADGE_END   = "<!-- PAL BADGES END -->"

def latest_card():
    paths = sorted(glob.glob(CARD_GLOB))
    if not paths:
        return None, None
    p = paths[-1]
    with open(p) as f:
        data = json.load(f)
    return p, data

def color_rollout(pct, mode):
    if mode == "shadow":
        return "#999999"
    try:
        pct = int(pct)
    except:
        return "#999999"
    if pct >= 75: return "#2c974b"
    if pct >= 25: return "#dbab09"
    return "#bf4b37"

def color_safety(score):
    if score is None: return "#999999"
    try:
        s = float(score)
    except:
        return "#999999"
    if s >= 0.98: return "#2c974b"
    if s >= 0.96: return "#dbab09"
    return "#bf4b37"

def make_svg(label, value, color):
    def w(t): return 6*len(t)+20
    lw, rw = w(label), w(value)
    total = lw + rw
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{total}" height="20" role="img" aria-label="{label}: {value}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
    <stop offset=".1" stop-opacity=".1"/>
    <stop offset=".9" stop-opacity=".3"/>
    <stop offset="1" stop-opacity=".5"/>
  </linearGradient>
  <mask id="m"><rect width="{total}" height="20" rx="3" fill="#fff"/></mask>
  <g mask="url(#m)">
    <rect width="{lw}" height="20" fill="#555"/>
    <rect x="{lw}" width="{rw}" height="20" fill="{color}"/>
    <rect width="{total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana" font-size="11">
    <text x="{lw/2:.1f}" y="14">{label}</text>
    <text x="{lw + rw/2:.1f}" y="14">{value}</text>
  </g>
</svg>"""

def update_readme():
    line = "![PAL Rollout](docs/badges/pal_rollout.svg) ![PAL Safety](docs/badges/pal_safety.svg)"
    if not os.path.exists(README_PATH):
        with open(README_PATH,"w") as f:
            f.write("# Lab7-Proof\n\n" + BADGE_START + "\n" + line + "\n" + BADGE_END + "\n")
        return
    with open(README_PATH) as f:
        content = f.read()
    block = BADGE_START + "\n" + line + "\n" + BADGE_END
    if BADGE_START in content and BADGE_END in content:
        content = re.sub(f"{BADGE_START}.*?{BADGE_END}", block, content, flags=re.S)
    else:
        content = block + "\n\n" + content
    with open(README_PATH, "w") as f:
        f.write(content)

def main():
    path, card = latest_card()
    os.makedirs(os.path.dirname(ROLLOUT_BADGE), exist_ok=True)
    os.makedirs(os.path.dirname(SAFETY_BADGE), exist_ok=True)

    if not card:
        with open(ROLLOUT_BADGE,"w") as f:
            f.write(make_svg("pal:shadow", "0%", "#999999"))
        with open(SAFETY_BADGE,"w") as f:
            f.write(make_svg("safety", "—", "#999999"))
        update_readme()
        return

    rollout = card.get("rollout", {})
    metrics = card.get("metrics", {})
    mode = str(rollout.get("mode","shadow"))
    pct  = rollout.get("traffic_pct", 0)
    safety = metrics.get("safety_score", None)

    rollout_svg = make_svg(f"pal:{mode}", f"{pct}%", color_rollout(pct, mode))
    with open(ROLLOUT_BADGE,"w") as f:
        f.write(rollout_svg)

    val = f"{float(safety):.3f}" if safety is not None else "—"
    safety_svg  = make_svg("safety", val, color_safety(safety))
    with open(SAFETY_BADGE,"w") as f:
        f.write(safety_svg)

    update_readme()
    print("Badges updated:", ROLLOUT_BADGE, SAFETY_BADGE)

if __name__ == "__main__":
    main()
