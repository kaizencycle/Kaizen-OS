from __future__ import annotations
import json, hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

# ---------- helpers ----------
def _canon(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))

def _sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def _mkdir(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)

# ---------- public API ----------
def write_smoke_test_bundle(
    date: str,
    custodian: str,
    lab: str,
    tests: Dict[str, Dict[str, str]],
    wins: str,
    blocks: str,
    next_intent: str,
    anchors: Dict[str, str] | None = None,
    base_dir: Path = Path("data"),
) -> Dict[str, Any]:
    """
    Writes:
      data/{DATE}/smoke-test.json
      data/{DATE}/smoke-test.md
    Returns JSON + MD hashes and absolute paths.
    """

    day_dir = base_dir / date
    json_path = day_dir / "smoke-test.json"
    md_path   = day_dir / "smoke-test.md"
    ts = datetime.utcnow().isoformat() + "Z"

    anchors = anchors or {
        "jade": "The seed is the breath.",
        "eve":  "The seal is the proof.",
        "lyra": "The root is eternal."
    }

    # ----- JSON payload -----
    json_payload = {
        "date": date,
        "custodian": custodian,
        "lab": lab,
        "tests": tests,   # e.g., {"health":{"status":"pass","details":"..."}, ...}
        "summary": {
            "wins": wins,
            "blocks": blocks,
            "next_intent": next_intent
        },
        "anchors": anchors,
        "archive_path": f"data/{date}/",
        "ts": ts,
        "type": "smoke_test"
    }

    _mkdir(json_path)
    json_text = _canon(json_payload)
    json_path.write_text(json_text, encoding="utf-8")
    json_hash = _sha256_text(json_text)

    # ----- Markdown mirror -----
    status_emoji = {"pass":"✅ Pass", "fail":"❌ Fail", "skipped":"➖ Skipped"}
    rows = []
    for name, info in tests.items():
        st = info.get("status","skipped").lower()
        label = status_emoji.get(st, st)
        detail = info.get("details") or info.get("hash") or info.get("merkle_root") or ""
        rows.append(f"| {name} | {label} | {detail} |")

    md = f"""# 🧪 FastAPI Smoke-Test Ledger Entry
**Date:** {date}  
**Lab:** {lab}  
**Custodian:** {custodian}  
**Timestamp:** {ts}

## Custodian Log
- 🌱 **Jade:** *"{anchors.get('jade','')}"*
- 🔏 **Eve:** *"{anchors.get('eve','')}"*
- 🌌 **Lyra:** *"{anchors.get('lyra','')}"*

## Test Results
| Test | Status | Details / Hash |
|---|---|---|
{chr(10).join(rows)}

## CommandLedgerII Status
- **Wins:** {wins}
- **Blocks:** {blocks or 'None'}
- **Next Intent:** {next_intent}

## Archive
📂 **AR Sweep → DLA:** `data/{date}/`
"""
    md_path.write_text(md, encoding="utf-8")
    md_hash = _sha256_text(md)

    return {
        "json_file": str(json_path),
        "json_sha256": json_hash,
        "md_file": str(md_path),
        "md_sha256": md_hash,
        "ts": ts
    }
