#!/usr/bin/env python3
import os, glob, json, datetime, re

CARD_GLOB = os.getenv("PAL_CARD_GLOB", "ledger/model_cards/*.json")
README_PATH = os.getenv("README_PATH", "README.md")
HTML_OUT = os.getenv("HTML_OUT", "docs/pal_dashboard.html")

START = "<!-- PAL DASHBOARD START -->"
END   = "<!-- PAL DASHBOARD END -->"

def load_latest_card():
    paths = sorted(glob.glob(CARD_GLOB))
    if not paths:
        return None, None
    path = paths[-1]
    with open(path) as f:
        data = json.load(f)
    return path, data

def fmt_cell(x):
    if x is None:
        return "—"
    if isinstance(x, float):
        return f"{x:.3f}"
    return str(x)

def render_markdown(card_path, card):
    updated = datetime.datetime.utcnow().isoformat() + "Z"
    version = card.get("version","v?")
    metrics = card.get("metrics", {})
    rollout = card.get("rollout", {})
    rows = [
        ("Policy", version),
        ("Episodes", metrics.get("episodes_total")),
        ("Success (explicit)", metrics.get("success_explicit")),
        ("Success (implicit)", metrics.get("success_implicit")),
        ("Safety score", metrics.get("safety_score")),
        ("Rollout mode", rollout.get("mode")),
        ("Traffic %", rollout.get("traffic_pct")),
        ("Updated (UTC)", updated),
    ]
    table = ["| Metric | Value |", "|---|---|"]
    for k,v in rows:
        table.append(f"| {k} | {fmt_cell(v)} |")
    return "\n".join([START, "", "### PAL Status", "", *table, "", END])

def update_readme(md_block):
    if not os.path.exists(README_PATH):
        with open(README_PATH, "w") as f:
            f.write("# Lab7-Proof\n\n" + START + "\n" + END + "\n")
    with open(README_PATH) as f:
        content = f.read()
    if START in content and END in content:
        new = re.sub(f"{START}.*?{END}", md_block, content, flags=re.S)
    else:
        new = content + "\n\n" + md_block + "\n"
    with open(README_PATH, "w") as f:
        f.write(new)

def render_html(card_path, card):
    version = card.get("version","v?")
    metrics = card.get("metrics", {})
    rollout = card.get("rollout", {})
    updated = datetime.datetime.utcnow().isoformat() + "Z"
    html = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>PAL Dashboard</title>
  <style>
    body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 2rem; }}
    .card {{ border: 1px solid #ddd; border-radius: 8px; padding: 1rem; max-width: 720px; }}
    h1 {{ margin-top: 0; }}
    table {{ border-collapse: collapse; width: 100%; }}
    td, th {{ border: 1px solid #eee; padding: 8px; text-align: left; }}
    th {{ background: #fafafa; }}
    .ok {{ color: #0a0; font-weight: 600; }}
    .warn {{ color: #a60; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>PAL Dashboard</h1>
    <p><strong>Policy:</strong> {version} &nbsp; • &nbsp; <strong>Updated:</strong> {updated}</p>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Episodes</td><td>{fmt_cell(metrics.get('episodes_total'))}</td></tr>
      <tr><td>Success (explicit)</td><td>{fmt_cell(metrics.get('success_explicit'))}</td></tr>
      <tr><td>Success (implicit)</td><td>{fmt_cell(metrics.get('success_implicit'))}</td></tr>
      <tr><td>Safety score</td><td>{fmt_cell(metrics.get('safety_score'))}</td></tr>
      <tr><td>Rollout mode</td><td>{fmt_cell(rollout.get('mode'))}</td></tr>
      <tr><td>Traffic %</td><td>{fmt_cell(rollout.get('traffic_pct'))}</td></tr>
    </table>
    <p style="margin-top:1rem; font-size: 0.9rem; color:#666;">Source: {card_path}</p>
  </div>
</body>
</html>"""
    os.makedirs(os.path.dirname(HTML_OUT), exist_ok=True)
    with open(HTML_OUT, "w") as f:
        f.write(html)

def main():
    card_path, card = load_latest_card()
    if not card:
        print("No model cards found; dashboard not updated.")
        return
    md = render_markdown(card_path, card)
    update_readme(md)
    render_html(card_path, card)
    print("Dashboard updated:", README_PATH, HTML_OUT)

if __name__ == "__main__":
    main()
