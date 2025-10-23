# app/auth.py
from dataclasses import dataclass
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
import base64
import hmac
import hashlib
import os
import time
import sys

# Create the main auth router
router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory app registry (swap for DB/Redis in production)
APPS: dict[str, dict[str, str]] = {}      # app_id -> {"secret": <base64>}

# Token blacklist for soft logout
TOKEN_BLACKLIST: set[str] = set()

# -------- helpers --------
def b64(b: bytes) -> str: 
    return base64.b64encode(b).decode()

def b64d(s: str) -> bytes: 
    return base64.b64decode(s.encode())

def hmac_sha256(key: bytes, msg: bytes) -> bytes: 
    return hmac.new(key, msg, hashlib.sha256).digest()

def make_token(app_id: str, secret_b: bytes, ttl: int = 3600) -> tuple[str, int]:
    """Return (token, exp). token = base64(app_id|exp|sig_b64), sig = HMAC(secret, app_id|exp)"""
    exp = int(time.time()) + int(ttl)
    payload = f"{app_id}|{exp}".encode()
    sig_b64 = b64(hmac_sha256(secret_b, payload))
    token = b64(payload + b"|" + sig_b64.encode())
    return token, exp

def parse_token(token: str) -> tuple[str, int, str]:
    """Decode token -> (app_id, exp, sig_b64). Raises ValueError if malformed."""
    raw = b64d(token).decode()
    parts = raw.split("|")
    if len(parts) != 3:
        raise ValueError("malformed token")
    app_id, exp_str, sig_b64 = parts
    return app_id, int(exp_str), sig_b64

def verify_token(token: str) -> bool:
    """Utility verifier (handy for your admin endpoints)."""
    if token in TOKEN_BLACKLIST:
        return False
    try:
        app_id, exp, sig_b64 = parse_token(token)
    except Exception:
        return False
    if time.time() > exp:
        return False
    meta = APPS.get(app_id)
    if not meta:
        return False
    secret_b = b64d(meta["secret"])
    payload = f"{app_id}|{exp}".encode()
    expected = b64(hmac_sha256(secret_b, payload))
    return hmac.compare_digest(sig_b64, expected)

# -------- models --------
@dataclass
class AdminContext:
    app_id: str
    exp: int  # epoch seconds

class RegisterApp(BaseModel):
    app_id: str

class IssueToken(BaseModel):
    app_id: str
    nonce: str              # random base64 string from client
    signature: str          # base64(HMAC(secret, nonce))
    ttl: int | None = 3600  # seconds (optional)

class RotateSecret(BaseModel):
    app_id: str
    proof: str              # base64(HMAC(old_secret, "rotate"))

# -------- dependency --------
def admin_required(
    request: Request,
    authorization: str = Header(None)
) -> AdminContext:
    """
    Dependency to secure admin routes.
    Logs every attempt and returns (app_id, exp) context.
    Expects: Authorization: Bearer <token>
    """
    if not authorization or not authorization.startswith("Bearer "):
        print(f"[ADMIN_AUTH][FAIL] Missing token for {request.url}", file=sys.stderr)
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()

    if not verify_token(token):
        print(f"[ADMIN_AUTH][FAIL] Invalid/expired token for {request.url}", file=sys.stderr)
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    app_id, exp, _sig = parse_token(token)
    print(f"[ADMIN_AUTH][OK] app_id={app_id} exp={exp} url={request.url}", file=sys.stderr)
    return AdminContext(app_id=app_id, exp=exp)

# -------- auth endpoints --------
@router.get("/status")
def status(authorization: str = Header(None)):
    """
    Mirror /auth/introspect but live under /admin.
    Lets the Founder Console check token validity & expiry
    without touching /auth/* endpoints.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"ok": False, "reason": "missing bearer"}

    token = authorization.split(" ", 1)[1].strip()

    try:
        app_id, exp, sig_b64 = parse_token(token)
    except Exception:
        return {"ok": False, "reason": "malformed"}

    now = int(time.time())
    if now > exp:
        return {"ok": False, "reason": "expired"}

    meta = APPS.get(app_id)
    if not meta:
        return {"ok": False, "reason": "unknown app_id"}

    secret_b = b64d(meta["secret"])
    payload = f"{app_id}|{exp}".encode()
    expected = base64.b64encode(hmac_sha256(secret_b, payload)).decode()
    if not hmac.compare_digest(sig_b64, expected):
        return {"ok": False, "reason": "bad signature"}

    exp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(exp))
    return {
        "ok": True,
        "admin": app_id,
        "exp_epoch": exp,
        "exp_iso": exp_iso,
        "expires_in_seconds": max(0, exp - now)
    }

@router.post("/register_app")
def register_app(req: RegisterApp):
    """Register an app and mint a base64 secret (dev/prod: keep in DB/secret store)."""
    app_id = req.app_id.strip()
    if not app_id:
        raise HTTPException(400, detail="app_id required")
    # 32 bytes, base64-encoded
    secret = b64(os.urandom(32))
    APPS[app_id] = {"secret": secret}
    return {"app_id": app_id, "secret": secret}

@router.post("/issue_token")
def issue_token(req: IssueToken):
    """Issue a signed token that your Founder Console can verify."""
    meta = APPS.get(req.app_id)
    if not meta:
        raise HTTPException(400, detail="App not registered")

    secret_b = b64d(meta["secret"])

    # verify client proves knowledge of secret (HMAC over nonce)
    expected = b64(hmac_sha256(secret_b, req.nonce.encode()))
    if not hmac.compare_digest(expected, req.signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    token, exp = make_token(req.app_id, secret_b, req.ttl or 3600)
    return {"token": token, "exp": exp}

@router.post("/introspect")
def introspect(authorization: str = Header(None)):
    """
    Introspect a token and return the same shape as /admin/ping.
    Works for UI reuse: {ok, admin, exp_epoch, exp_iso, expires_in_seconds}
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"ok": False, "reason": "missing bearer"}

    token = authorization.split(" ", 1)[1].strip()

    try:
        app_id, exp, sig_b64 = parse_token(token)
    except Exception:
        return {"ok": False, "reason": "malformed"}

    now = int(time.time())
    if now > exp:
        return {"ok": False, "reason": "expired"}

    meta = APPS.get(app_id)
    if not meta:
        return {"ok": False, "reason": "unknown app_id"}

    secret_b = b64d(meta["secret"])
    payload = f"{app_id}|{exp}".encode()
    expected = b64(hmac_sha256(secret_b, payload))
    if not hmac.compare_digest(sig_b64, expected):
        return {"ok": False, "reason": "bad signature"}

    # Success → match /admin/ping shape
    exp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(exp))
    return {
        "ok": True,
        "admin": app_id,
        "exp_epoch": exp,
        "exp_iso": exp_iso,
        "expires_in_seconds": max(0, exp - now)
    }

@router.post("/logout/soft")
def soft_logout(authorization: str = Header(None)):
    """
    Soft logout: only invalidate this single token.
    Other tokens for the same app_id remain valid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"ok": False, "reason": "missing bearer token"}

    token = authorization.split(" ", 1)[1].strip()
    TOKEN_BLACKLIST.add(token)
    return {"ok": True, "message": "This token has been invalidated (soft logout)."}

@router.post("/rotate_secret")
def rotate_secret(req: RotateSecret):
    """Rotate an app's secret using HMAC(old_secret, 'rotate') proof."""
    meta = APPS.get(req.app_id)
    if not meta:
        raise HTTPException(400, detail="App not registered")
    old_secret_b = b64d(meta["secret"])
    expected = b64(hmac_sha256(old_secret_b, b"rotate"))
    if not hmac.compare_digest(expected, req.proof):
        raise HTTPException(401, detail="Invalid proof")
    new_secret = b64(os.urandom(32))
    APPS[req.app_id]["secret"] = new_secret
    return {"app_id": req.app_id, "secret": new_secret}

# (Optional) quick verifier route for debugging; remove if you don't want it public.
@router.post("/verify")
def verify(token: str):
    return {"ok": bool(verify_token(token))}

# -------- admin endpoints (separate router) --------
admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(admin_required)]
)

@admin_router.get("/ping")
def ping(ctx: AdminContext = Depends(admin_required)):
    now = int(datetime.now(tz=timezone.utc).timestamp())
    remaining_s = max(0, ctx.exp - now)
    return {
        "ok": True,
        "admin": ctx.app_id,
        "exp_epoch": ctx.exp,
        "exp_iso": datetime.fromtimestamp(ctx.exp, tz=timezone.utc).isoformat().replace("+00:00", "Z"),
        "expires_in_seconds": remaining_s,
        "message": f"Founder Console unlocked by {ctx.app_id}"
    }

@admin_router.get("/sessions")
def sessions(ctx: AdminContext = Depends(admin_required)):
    """
    List active sessions for the calling app_id.
    Shows all tokens minted for this app_id,
    and which ones are blacklisted (soft-logged out).
    """
    app_id = ctx.app_id
    meta = APPS.get(app_id)
    if not meta:
        return {"ok": False, "reason": "unknown app_id"}

    # Collect sessions for this app_id
    sessions = []
    now = int(time.time())

    # In this simple setup, we don't persist issued tokens.
    # So instead, show current secret + blacklist info.
    sessions.append({
        "secret_prefix": meta["secret"][:6] + "...",
        "tokens_blacklisted": [
            t for t in TOKEN_BLACKLIST
            if parse_token(t)[0] == app_id
        ],
        "tokens_active_note": "All tokens not in blacklist are considered active until expiry."
    })

    return {"ok": True, "app_id": app_id, "sessions": sessions}

@admin_router.post("/refresh")
def refresh_token(
    request: Request,
    authorization: str = Header(None),
    ttl: int | None = 3600
):
    """
    Refresh a valid token (extends exp). Requires a valid current token in:
      Authorization: Bearer <token>
    Returns: { token, exp }
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    old_token = authorization.split(" ", 1)[1].strip()

    # Validate the current token
    try:
        app_id, exp, _sig = parse_token(old_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Malformed token")

    if time.time() > exp:
        raise HTTPException(status_code=401, detail="Token expired")

    meta = APPS.get(app_id)
    if not meta:
        raise HTTPException(status_code=401, detail="Unknown app_id")

    secret_b = b64d(meta["secret"])

    # Recompute expected signature and verify (defense-in-depth)
    payload = f"{app_id}|{exp}".encode()
    expected = b64(hmac_sha256(secret_b, payload))
    _, _, sig_b64 = parse_token(old_token)
    if not hmac.compare_digest(expected, sig_b64):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    # Issue a new token with extended exp
    new_token, new_exp = make_token(app_id, secret_b, ttl or 3600)
    return {"token": new_token, "exp": new_exp}

@admin_router.post("/logout")
def logout(ctx: AdminContext = Depends(admin_required)):
    """
    Invalidate an app's session by removing its secret.
    All previously issued tokens will stop working.
    """
    if ctx.app_id in APPS:
        APPS.pop(ctx.app_id, None)
        return {
            "ok": True,
            "message": f"App '{ctx.app_id}' logged out, all tokens invalidated."
        }
    return {"ok": False, "reason": "not registered"}
