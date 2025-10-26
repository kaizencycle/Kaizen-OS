# app/admin.py
from fastapi import APIRouter, Depends
from app.auth import admin_required  # uses the Bearer token verifier

# Every route under /admin will require a valid token
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(admin_required)])

@router.get("/metrics")
def metrics():
    # TODO: return real metrics from your store
    return {
        "ok": True,
        "service": "hive-api",
        "uptime_s": 0,         # fill in
        "reflections_count": 0 # fill in
    }

@router.get("/agents")
def agents():
    # TODO: return real agents
    return {
        "ok": True,
        "agents": []
    }

@router.get("/config")
def config():
    # This can help the Founder Console know it’s unlocked
    return {
        "ok": True,
        "version": "0.1.0",
        "features": ["reflections", "agora", "attestations", "hooks", "auth"]
    }

