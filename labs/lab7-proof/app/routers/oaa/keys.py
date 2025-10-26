# app/routers/oaa/keys.py
import base64, os, time, json
from typing import List, Dict
from pathlib import Path

def _kid_from_pub(b64_pub: str) -> str:
    # short key ID based on first 8 bytes
    raw = base64.b64decode(b64_pub)
    return "oaa-" + base64.urlsafe_b64encode(raw[:8]).decode("ascii").rstrip("=")

def current_key_entry() -> Dict:
    pub_b64 = os.getenv("OAA_ED25519_PUBLIC_B64", "")
    ver = os.getenv("OAA_SIGNING_VERSION", "oaa:ed25519:v1")
    if not pub_b64:
        return {}
    return {
        "kid": ver,
        "kty": "OKP",
        "crv": "Ed25519",
        "x": pub_b64,                 # base64 raw key (no PEM)
        "alg": "EdDSA",
        "use": "sig",
        "version": ver,
        "created": os.getenv("OAA_SIGNING_CREATED",""),
        "issuer": os.getenv("OAA_ISSUER","oaa.lab7"),
    }

def load_key_history() -> List[Dict]:
    """Load archived keys from data/keys.json"""
    keys_file = Path("data/keys.json")
    if not keys_file.exists():
        return []
    try:
        return json.loads(keys_file.read_text())
    except json.JSONDecodeError:
        return []

def legacy_keys() -> List[Dict]:
    # Load from data/keys.json instead of env vars
    return load_key_history()

def keyset() -> Dict:
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cur = current_key_entry()
    hist = load_key_history()
    
    # Combine current and history, ensuring no duplicates
    keys = []
    seen = set()
    
    # Add current key first
    if cur:
        keys.append(cur)
        seen.add(cur.get("x", ""))
    
    # Add historical keys
    for key in hist:
        key_x = key.get("x", "")
        if key_x and key_x not in seen:
            keys.append(key)
            seen.add(key_x)
    
    return {
        "issuer": os.getenv("OAA_ISSUER","oaa.lab7"),
        "updated": now,
        "keys": keys
    }

