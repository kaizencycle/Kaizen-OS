# oaa_echo_routes.py
from __future__ import annotations
import os, json, hashlib, time
from pathlib import Path
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Header, Response, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ---------- Config ----------
ECHO_LOG_DIR = Path(os.getenv("ECHO_LOG_DIR", "./echo_logs")).resolve()
OAA_BEARER   = os.getenv("OAA_BEARER", "")  # optional; if set, GET endpoints can require it

router = APIRouter(prefix="/echo", tags=["oaa-echo"])

# ---------- Security (optional) ----------
def require_bearer(authorization: Optional[str] = Header(default=None)):
    if not OAA_BEARER:
        return  # auth not required
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if token != OAA_BEARER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid bearer token")

# ---------- Models ----------
class EchoPulse(BaseModel):
    timestamp: str
    kind: str
    services: dict
    summary: dict
    global_health: Optional[dict] = None
    fingerprint_sha256: str

class EchoPulseIngest(BaseModel):
    source: str
    fingerprint: str
    payload: dict

# ---------- Utilities ----------
def _list_echo_files(limit: int = 50) -> List[Path]:
    if not ECHO_LOG_DIR.exists():
        return []
    files = [p for p in ECHO_LOG_DIR.glob("echo_*.json") if p.is_file()]
    files.sort()  # lexicographic sort works because filenames are timestamp-prefixed
    return files[-limit:]

def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))

def _fingerprint(obj: dict) -> str:
    s = json.dumps(obj, sort_keys=True)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

# ---------- Routes ----------
@router.get("/latest", response_model=EchoPulse)
def get_latest_echo_pulse(
    response: Response,
    if_none_match: Optional[str] = Header(default=None, convert_underscores=False),
    _: None = Depends(require_bearer)
):
    files = _list_echo_files(limit=1)
    if not files:
        raise HTTPException(status_code=404, detail="No echo pulses found")

    data = _read_json(files[-1])
    etag = f"W/\"{_fingerprint(data)}\""

    # Basic HTTP caching support
    if if_none_match and if_none_match == etag:
        response.status_code = status.HTTP_304_NOT_MODIFIED
        return JSONResponse(status_code=304, content=None, headers={"ETag": etag})

    # Attach ETag and a small cache hint
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=30"
    return data

@router.get("/list")
def list_echo_pulses(
    limit: int = 10,
    _: None = Depends(require_bearer)
):
    limit = max(1, min(limit, 100))
    files = _list_echo_files(limit=limit)
    items = []
    for p in files:
        try:
            data = _read_json(p)
            items.append({
                "file": p.name,
                "timestamp": data.get("timestamp"),
                "fingerprint_sha256": data.get("fingerprint_sha256"),
                "summary": data.get("summary", {}),
            })
        except Exception:
            # Skip unreadable entries
            continue
    return {"count": len(items), "items": items}

@router.get("/health")
def echo_api_health():
    # Lightweight route so your Sentinel can check this module specifically
    return {"status": "ok", "module": "oaa_echo_routes", "ts": int(time.time())}

