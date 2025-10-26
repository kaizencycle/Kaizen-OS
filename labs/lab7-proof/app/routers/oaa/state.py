# app/routers/oaa/state.py
import time, os
from typing import Dict, Any, List, Tuple
from datetime import datetime
from app.crypto.ed25519 import ed25519_sign, sha256_hex
from .store import SOURCES, SCORES, VOTES

def build_state() -> Dict[str, Any]:
    # Deterministic snapshot (sorted by source_id)
    items: List[Dict[str, Any]] = []
    for sid in sorted(SOURCES.keys()):
        src = SOURCES[sid]
        sc  = SCORES.get(sid)
        votes = VOTES.get(sid, [])
        items.append({
            "source": src.model_dump(),
            "score": (sc.model_dump() if sc else None),
            "vote_count": len(votes),
        })
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return {
        "type": "oaa.state.snapshot",
        "version": "lab7-v1",
        "ts": now,
        "issuer": os.getenv("OAA_ISSUER","oaa.lab7"),
        "items": items,
    }

def sign_state(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    priv_b64 = os.getenv("OAA_ED25519_PRIVATE_B64","")
    pub_b64  = os.getenv("OAA_ED25519_PUBLIC_B64","")
    if not (priv_b64 and pub_b64):
        raise RuntimeError("Missing OAA_ED25519_PRIVATE_B64 or OAA_ED25519_PUBLIC_B64")
    content_hash, sig_b64 = ed25519_sign(priv_b64, snapshot)
    return {
        "content": snapshot,
        "content_hash": f"sha256:{content_hash}",
        "signature": f"ed25519:{sig_b64}",
        "public_key_b64": pub_b64,
        "signing_key": os.getenv("OAA_SIGNING_VERSION","oaa:ed25519:v1")
    }

async def anchor_to_ledger(attestation: Dict[str, Any]) -> Dict[str, Any]:
    ledger_url = os.getenv("LEDGER_URL","").rstrip("/")
    if not ledger_url:
        return {"anchored": False, "reason": "LEDGER_URL not set"}
    import httpx
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(f"{ledger_url}/attest", json=attestation)
        r.raise_for_status()
        return r.json()

