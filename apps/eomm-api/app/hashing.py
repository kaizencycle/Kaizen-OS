from __future__ import annotations
import hashlib
import json
from typing import Iterable, Any

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_json(obj: Any) -> str:
    blob = json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return sha256_bytes(blob)

def merkle_root(leaves: Iterable[str]) -> str:
    """
    Compute a simple pairwise Merkle root over hex digest leaves (strings).
    If no leaves => return sha256 of empty string.
    """
    layer = [x.lower() for x in leaves]
    if not layer:
        return sha256_bytes(b"")
    while len(layer) > 1:
        nxt = []
        it = iter(layer)
        for a in it:
            b = next(it, a)  # duplicate last if odd
            nxt.append(sha256_bytes((a + b).encode("utf-8")))
        layer = nxt
    return layer[0]


