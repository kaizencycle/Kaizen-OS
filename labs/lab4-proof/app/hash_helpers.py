# app/hash_helpers.py
from __future__ import annotations
import json, hashlib
from pathlib import Path
from datetime import datetime
from typing import Iterable, List, Dict, Any, Optional

# ---------- Canonical JSON ----------
def canonical_json(obj: Any) -> str:
    # stable keys, no extra spaces, unicode kept
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode("utf-8"))

def sha256_json(obj: Any) -> str:
    return sha256_text(canonical_json(obj))

# ---------- Echo line hashing ----------
def hash_echo_line(line_text: str) -> Optional[str]:
    """
    Accepts a raw line from *.echo.jsonl.
    Returns attestation hash or None for blank/invalid lines.
    """
    line = line_text.strip()
    if not line:
        return None
    # ensure canonical form (reparse then re-dump)
    try:
        obj = json.loads(line)
    except json.JSONDecodeError:
        return None
    return sha256_json(obj)

def hash_echo_file(jsonl_path: Path) -> List[str]:
    if not jsonl_path.exists():
        return []
    hashes: List[str] = []
    with jsonl_path.open("r", encoding="utf-8") as f:
        for raw in f:
            h = hash_echo_line(raw)
            if h:
                hashes.append(h)
    return hashes

# ---------- Merkle (pairwise hex-concat then sha256) ----------
def merkle_once(hex_hashes: List[str]) -> List[str]:
    if not hex_hashes:
        return []
    if len(hex_hashes) == 1:
        return hex_hashes
    out: List[str] = []
    it = iter(hex_hashes)
    for a in it:
        try:
            b = next(it)
        except StopIteration:
            b = a  # duplicate last if odd count
        out.append(sha256_text(a + b))
    return out

def merkle_root(hex_hashes: List[str]) -> str:
    if not hex_hashes:
        # empty set root (define policy; here we hash the empty string)
        return sha256_text("")
    layer = hex_hashes[:]
    while len(layer) > 1:
        layer = merkle_once(layer)
    return layer[0]

# ---------- Day root builder ----------
def build_day_root(date_str: str, data_dir: Path) -> Dict[str, Any]:
    """
    Reads:
      data/{DATE}.seed.json
      data/{DATE}.echo.json
      data/{DATE}.seal.json
    Computes:
      Hseed, [Hecho...], Hseal, Hroot
    Writes:
      data/{DATE}.root.json
    """
    seed_p = data_dir / f"{date_str}.seed.json"
    echo_p = data_dir / f"{date_str}.echo.json"
    seal_p = data_dir / f"{date_str}.seal.json"
    root_p = data_dir / f"{date_str}.root.json"

    def read_json(path: Path) -> Any:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)

    if not seed_p.exists():
        raise FileNotFoundError(f"Missing seed file: {seed_p}")
    if not seal_p.exists():
        raise FileNotFoundError(f"Missing seal file: {seal_p}")

    seed_obj = read_json(seed_p)
    seal_obj = read_json(seal_p)

    Hseed = sha256_json(seed_obj)
    
    # Handle echo file (JSON array format)
    if echo_p.exists():
        echo_data = read_json(echo_p)
        if isinstance(echo_data, list):
            Hechos = [sha256_json(item) for item in echo_data]
        else:
            Hechos = [sha256_json(echo_data)]
    else:
        Hechos = []
    
    Hseal = sha256_json(seal_obj)

    inputs = {"seed": Hseed, "echo": Hechos, "seal": Hseal}
    Hroot = merkle_root([Hseed] + Hechos + [Hseal])

    root_obj = {
        "type": "day_root",
        "date": date_str,
        "inputs": inputs,
        "root": Hroot,
        "method": "pairwise-merkle-sha256(hex-concat)",
        "ts": datetime.utcnow().isoformat() + "Z",
    }

    root_p.parent.mkdir(parents=True, exist_ok=True)
    with root_p.open("w", encoding="utf-8") as f:
        json.dump(root_obj, f, ensure_ascii=False, indent=2)

    return root_obj

