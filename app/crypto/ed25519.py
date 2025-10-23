# app/crypto/ed25519.py
import base64, json, hashlib
from typing import Any, Dict, Tuple
from nacl import signing
from nacl.encoding import RawEncoder

# ---- Canonical JSON & hashing ----
def canonical_json(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))

def sha256_hex(obj: Any) -> str:
    return hashlib.sha256(canonical_json(obj).encode("utf-8")).hexdigest()

# ---- Load keys from env (base64) ----
def load_signing_key(b64_priv: str) -> signing.SigningKey:
    raw = base64.b64decode(b64_priv)
    return signing.SigningKey(raw)

def load_verify_key(b64_pub: str) -> signing.VerifyKey:
    raw = base64.b64decode(b64_pub)
    return signing.VerifyKey(raw)

# ---- Sign / Verify ----
def ed25519_sign(b64_priv: str, payload: Dict[str, Any]) -> Tuple[str, str]:
    sk = load_signing_key(b64_priv)
    msg = canonical_json(payload).encode("utf-8")
    sig = sk.sign(msg, encoder=RawEncoder).signature  # 64 bytes
    sig_b64 = base64.b64encode(sig).decode("ascii")
    return sha256_hex(payload), sig_b64

def ed25519_verify(b64_pub: str, payload: Dict[str, Any], sig_b64: str) -> bool:
    vk = load_verify_key(b64_pub)
    sig = base64.b64decode(sig_b64)
    msg = canonical_json(payload).encode("utf-8")
    try:
        vk.verify(msg, sig)
        return True
    except Exception:
        return False

# ---- Helper: derive public from private (when provisioning) ----
def pub_from_priv(b64_priv: str) -> str:
    sk = load_signing_key(b64_priv)
    vk = sk.verify_key
    return base64.b64encode(vk.encode()).decode("ascii")
