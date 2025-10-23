from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from app.routers.oaa import router as oaa_router
from app.routers.health import router as health_router
from app.routers.health_auth import router as health_auth_router
from app.routers.health_redis import router as health_redis_router
from app.routers.oaa.verify_history import router as verify_history_router
from app.routers.oaa.keys_page import router as keys_page_router
from app.routers.oaa.echo_routes import router as echo_routes_router
from app.routers.quality_metrics import router as quality_metrics_router
from app.routers.civic_mount import router as civic_mount_router
import os

app = FastAPI(
    title="Lab7 – Open Attestation Authority (OAA)",
    description="Cryptographic attestation and verification engine for the Kaizen DVA ecosystem",
    version="1.0.1"
)

# Include routers
app.include_router(oaa_router)
app.include_router(health_router)
app.include_router(health_auth_router)
app.include_router(health_redis_router)
app.include_router(verify_history_router)
app.include_router(keys_page_router)
app.include_router(echo_routes_router)
app.include_router(quality_metrics_router)
app.include_router(civic_mount_router)

# Set admin token from environment
oaa_router.ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

# Health aliases for frontend compatibility
@app.get("/health")
@app.get("/healthz")
def health_root():
    return JSONResponse({"status": "ok", "service": "oaa", "version": app.version})

@app.get("/")
def root():
    return {
        "ok": True,
        "service": "Lab7-Proof OAA",
        "version": "1.0.1",
        "endpoints": {
            "keys": "/.well-known/oaa-keys.json",
            "verify": "/oaa/verify",
            "state": "/oaa/state/snapshot",
            "anchor": "/oaa/state/anchor",
            "health": "/health",
            "healthz": "/healthz",
            "health_auth": "/health/auth",
            "redis_health": "/_health/redis",
            "oaa_redis_health": "/oaa/_health/redis",
            "echo_ingest": "/oaa/echo/ingest",
            "quality_metrics": "/dev/quality",
            "civic_mount": "/api/civic/mount"
        }
    }

