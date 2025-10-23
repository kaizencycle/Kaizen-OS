from __future__ import annotations
from pathlib import Path
import json
import os
from typing import Dict, List, Tuple, Any, Optional

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def get_node_metadata() -> Dict[str, str]:
    """Get node identity metadata from environment variables."""
    return {
        "node_id": os.getenv("NODE_ID", "cursor"),
        "author": os.getenv("AUTHOR", "Cursor AI (Kaizen Node)"),
        "network_id": os.getenv("NETWORK_ID", "Kaizen-DVA"),
        "version": os.getenv("VERSION", "0.1.0"),
    }

def today_files(date_str: str) -> Dict[str, str]:
    """Return relative file names for a given date."""
    base = f"{date_str}"
    return {
        "seed":   f"{base}.seed.json",
        "echo":   f"{base}.echo.json",
        "seal":   f"{base}.seal.json",
        "ledger": f"{base}.ledger.json",
    }

def p(path_rel: str) -> Path:
    """Absolute path under DATA_DIR."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR / path_rel

def read_json(path_rel: str) -> Any:
    with open(p(path_rel), "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path_rel: str, obj: Any) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(p(path_rel), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

def load_day(date_str: str) -> Tuple[Optional[dict], List[dict], Optional[dict]]:
    """Load seed (dict or None), sweeps (list), seal (dict or None). Missing files => None/[]"""
    files = today_files(date_str)
    seed = read_json(files["seed"]) if p(files["seed"]).exists() else None
    sweeps = read_json(files["echo"]) if p(files["echo"]).exists() else []
    if isinstance(sweeps, dict):
        # tolerate old format accidentally saved as dict
        sweeps = [sweeps]
    seal = read_json(files["seal"]) if p(files["seal"]).exists() else None
    return seed, sweeps, seal

def build_ledger_obj(date_str: str, seed: dict, sweeps: List[dict], seal: dict) -> dict:
    from .hashing import sha256_json, merkle_root
    leaves = [sha256_json(seed)] + [sha256_json(s) for s in sweeps] + [sha256_json(seal)]
    root = merkle_root(leaves)
    files = today_files(date_str)
    return {
        "date": date_str,
        "day_root": root,
        "counts": {"seeds": 1 if seed else 0, "sweeps": len(sweeps), "seals": 1 if seal else 0},
        "links": {
            "seed": files["seed"],
            "echo": files["echo"],
            "seal": files["seal"],
            "ledger": files["ledger"],
        },
        "ts": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat().replace("+00:00", "Z"),
    }
