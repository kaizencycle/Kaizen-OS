# app/dual_writer_adapter.py
from __future__ import annotations
import os, json, hashlib, zipfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

LEDGER_PATH = Path(os.getenv("LEDGER_PATH", "data"))
ARCHIVE_PATH = Path(os.getenv("ARCHIVE_PATH", "archive"))

# --------- tiny utils ----------
def _canon(o: Any) -> str:
    return json.dumps(o, sort_keys=True, ensure_ascii=False, separators=(",", ":"))

def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def _mkdir(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)

def _utc_now() -> str:
    return datetime.utcnow().isoformat() + "Z"

def _zip_day_folder(date: str, base_dir: Path, archive_dir: Path) -> str:
    """Create ZIP archive of day folder, but only if Merkle root exists."""
    day_dir = base_dir / date
    # Check for root file in root directory (where it's actually created)
    root_file = base_dir / f"{date}.root.json"

    if not root_file.exists():
        raise FileNotFoundError(
            f"Merkle root missing: {root_file}. Cannot archive folder."
        )

    archive_dir.mkdir(parents=True, exist_ok=True)
    zip_path = archive_dir / f"{date}.zip"

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in day_dir.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(base_dir))  # keep folder structure

    return str(zip_path)

# --------- public: write both JSON + MD ----------
def write_bundle(
    *,
    date: str,
    name: str,                      # file stem, e.g. "smoke-test" | "sweep" | "custom"
    payload: Dict[str, Any],        # JSON object to persist
    md_lines: Optional[list[str]] = None,  # extra human notes for Markdown
    base_dir: Path = LEDGER_PATH,
    zip_after: bool = False,                 # auto-archive day folder
    archive_dir: Path = ARCHIVE_PATH         # where to put the zip
) -> Dict[str, Any]:
    """
    Writes:
      data/{DATE}/{name}.json
      data/{DATE}/{name}.md
    Optionally creates:
      archive/{DATE}.zip (if zip_after=True and Merkle root exists)
    Returns: paths + sha256 for both.
    """
    ts = _utc_now()
    day_dir = base_dir / date
    json_path = day_dir / f"{name}.json"
    md_path   = day_dir / f"{name}.md"

    # ensure canonical + stamp
    payload = {**payload, "date": date, "ts": ts, "type": payload.get("type", name)}
    json_text = _canon(payload)

    _mkdir(json_path)
    json_path.write_text(json_text, encoding="utf-8")
    json_sha = _sha256(json_text)

    # make a compact MD mirror
    md = [
        f"# {name.replace('-', ' ').title()}",
        f"**Date:** {date}  ",
        f"**Timestamp:** {ts}  ",
        "",
        "## Payload (summary)",
    ]
    # first-level summary (avoid huge dumps)
    for k, v in payload.items():
        if k in {"ts", "date"}:  # already shown above
            continue
        sample = v if isinstance(v, (str, int, float)) else ("(object)" if isinstance(v, dict) else "(array)")
        md.append(f"- **{k}:** {sample}")
    if md_lines:
        md += ["", "## Notes"] + [f"- {line}" for line in md_lines]

    md_text = "\n".join(md) + "\n"
    md_path.write_text(md_text, encoding="utf-8")
    md_sha = _sha256(md_text)

    out = {
        "json_file": str(json_path),
        "json_sha256": json_sha,
        "md_file": str(md_path),
        "md_sha256": md_sha,
        "ts": ts,
    }

    if zip_after:
        try:
            out["zip_file"] = _zip_day_folder(date, base_dir, archive_dir)
            out["archive_status"] = "sealed successfully"
        except FileNotFoundError as e:
            out["zip_error"] = str(e)
            out["archive_status"] = "skipped: Merkle root missing"

    return out

