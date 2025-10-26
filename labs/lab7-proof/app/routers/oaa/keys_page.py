# app/routers/oaa/keys_page.py
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
import os, json, pathlib, datetime
from typing import Any, Dict, List

router = APIRouter()
templates = Jinja2Templates(directory="templates")
KEYS_FILE = pathlib.Path("data/keys.json")

def _now_iso() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"

def _load_history() -> List[Dict[str, Any]]:
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
        "issuer": os.getenv("OAA_ISSUER", "oaa.lab7"),
        "active": True,
    }

@router.get("/oaa/keys")
def oaa_keys_page(request: Request):
    cur = _current_key()
    hist = _load_history()
    # normalize history
    archived = []
    for i, k in enumerate(hist):
        kk = dict(k)
        kk.setdefault("issuer", cur["issuer"])
        kk["active"] = False
        kk["history_index"] = i  # 0 = most recent archived
        archived.append(kk)

    data = {
        "issuer": cur["issuer"],
        "updated": _now_iso(),
        "active_key": cur,
        "archived": archived,
        "count": 1 + len(archived),
        "json_history_url": "/oaa/keys/history",
        "well_known_url": "/.well-known/oaa-keys.json",
    }

    return templates.TemplateResponse("oaa_keys.html", {"request": request, "data": data})

