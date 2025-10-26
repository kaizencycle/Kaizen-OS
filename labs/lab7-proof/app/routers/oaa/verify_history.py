# app/routers/oaa/verify_history.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
import os, json, pathlib, hashlib, datetime, base64

try:
    import nacl.signing
    import nacl.exceptions
except ImportError:
    raise RuntimeError("PyNaCl is required. Add 'pynacl' to requirements.txt")

router = APIRouter()
KEYS_FILE = pathlib.Path("data/keys.json")

# ---------- Helpers ----------
def _now_iso() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"

def _load_key_history() -> List[Dict[str, Any]]:
    if not KEYS_FILE.exists():
        return []
    try:
        return json.loads(KEYS_FILE.read_text())
    except json.JSONDecodeError:
        return []

def _current_key() -> Dict[str, Any]:
    return {
        "kty": "OKP",
        "crv": "Ed25519",
        "kid": os.getenv("OAA_SIGNING_VERSION"),
        "x": os.getenv("OAA_ED25519_PUBLIC_B64"),
        "created": os.getenv("OAA_SIGNING_CREATED"),
        "issuer": os.getenv("OAA_ISSUER", "oaa.lab7")
    }

def _all_keys() -> List[Dict[str, Any]]:
    cur = _current_key()
    hist = _load_key_history()
    # Filter out empties and duplicates
    keys = []
    seen = set()
    for k in [cur] + hist:
        x = (k or {}).get("x") or ""
        if not x:
            continue
        sig = (k.get("kid") or "") + ":" + x
        if sig in seen:
            continue
        seen.add(sig)
        keys.append(k)
    return keys

def _b64_to_bytes(s: str) -> bytes:
    # allow raw or prefixed
    return base64.b64decode(s)

def _sig_to_bytes(sig: str) -> bytes:
    # supports "ed25519:..." or raw base64
    if sig.startswith("ed25519:"):
        sig = sig.split(":", 1)[1]
    return base64.b64decode(sig)

def _payload_bytes(payload: str) -> bytes:
    # Treat the string exactly as provided (no extra newline)
    return payload.encode("utf-8")

def _digest_payload(canon_json: Dict[str, Any]) -> str:
    # For reference: compute sha256 hex of canonical JSON if needed
    s = json.dumps(_sort_keys(canon_json), separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def _sort_keys(x: Any) -> Any:
    if isinstance(x, dict):
        return {k: _sort_keys(x[k]) for k in sorted(x)}
    if isinstance(x, list):
        return [_sort_keys(v) for v in x]
    return x

# ---------- Models ----------
class VerifyKeyHistoryBody(BaseModel):
    # One of the following must be provided:
    payload: Optional[str] = Field(
        default=None,
        description="Exact UTF-8 string that was signed (preferred)."
    )
    digest: Optional[str] = Field(
        default=None,
        description="If only a SHA-256 digest was signed, provide 'sha256:<hex>' or '<hex>'."
    )
    signature: str = Field(..., description="Signature as 'ed25519:<base64>' or base64 only.")

    # Optional reference metadata (not used in verification, included in response)
    meta: Optional[Dict[str, Any]] = None


# ---------- Route ----------
@router.post("/oaa/verify/key-history")
def verify_key_history(body: VerifyKeyHistoryBody):
    """
    Verifies a signature against the provided payload or digest,
    trying the current env key first, then archived keys in data/keys.json.

    Returns which key verified the signature.
    """
    # Resolve signed bytes
    if body.payload:
        msg = _payload_bytes(body.payload)
        signed_label = "payload"
    elif body.digest:
        hex_part = body.digest
        if hex_part.startswith("sha256:"):
            hex_part = hex_part.split(":", 1)[1]
        try:
            msg = bytes.fromhex(hex_part)
        except ValueError:
            raise HTTPException(status_code=400, detail="Bad digest format; need sha256 hex or 'sha256:<hex>'.")
        signed_label = "digest"
    else:
        raise HTTPException(status_code=400, detail="Provide either 'payload' or 'digest'.")

    sig = _sig_to_bytes(body.signature)

    attempted = []
    for idx, key in enumerate(_all_keys()):
        pub_b64 = key.get("x")
        kid = key.get("kid")
        created = key.get("created")
        issuer = key.get("issuer", "oaa.lab7")

        try:
            verify_key = nacl.signing.VerifyKey(_b64_to_bytes(pub_b64))
            verify_key.verify(msg, sig)  # raises if invalid
            # success
            return {
                "ok": True,
                "verified": True,
                "signed_over": signed_label,
                "signer": {
                    "issuer": issuer,
                    "kid": kid,
                    "public_key_b64": pub_b64,
                    "created": created,
                    "source": "current" if idx == 0 else "history",
                    "history_index": None if idx == 0 else idx - 1
                },
                "attempted": attempted,
                "ts": _now_iso(),
                "meta": body.meta or {}
            }
        except Exception as e:
            attempted.append({
                "kid": kid,
                "public_key_b64": pub_b64,
                "ok": False,
                "reason": str(e.__class__.__name__)
            })
            continue

    # none verified
    return {
        "ok": False,
        "verified": False,
        "reason": "signature_invalid_against_current_and_history",
        "attempted": attempted,
        "ts": _now_iso(),
        "meta": body.meta or {}
    }

