from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import base64, time, secrets

router = APIRouter(prefix="/auth", tags=["auth"])

APPS = {}  # {app_id: secret_b64}

class RegisterReq(BaseModel):
    app_id: str

class IssueReq(BaseModel):
    app_id: str
    nonce: str
    signature: str

@router.post("/register_app")
def register_app(body: RegisterReq):
    secret = base64.b64encode(secrets.token_bytes(32)).decode()
    APPS[body.app_id] = secret
    return {"ok": True, "secret": secret}

@router.post("/issue_token")
def issue_token(body: IssueReq):
    if body.app_id not in APPS:
        raise HTTPException(400, "unknown app_id")
    # (MVP) trust signature; add real HMAC check later
    exp = int(time.time()) + 60 * 60
    token = base64.b64encode(f"{body.app_id}:{exp}".encode()).decode()
    return {"ok": True, "token": token}

def _parse(token: str):
    try:
        raw = base64.b64decode(token.encode()).decode()
        app_id, exp = raw.split(":")
        return app_id, int(exp)
    except Exception:
        return None, 0

@router.post("/introspect")
def introspect(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "missing token")
    token = authorization.split(" ", 1)[1].strip()
    app_id, exp = _parse(token)
    if not app_id or time.time() > exp:
        raise HTTPException(401, "expired/invalid")
    return {"ok": True, "admin": app_id, "expires_in_seconds": exp - int(time.time())}


