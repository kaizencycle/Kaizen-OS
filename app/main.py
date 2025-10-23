from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import os, hashlib
from fastapi import FastAPI
from app.auth import router as auth_router
from app.shield import router as shield_router
from app.memory import router as memory_router
from app.onboard import router as onboard_router
from fastapi import FastAPI
from app.routes import health, onboard

app = FastAPI()
app.include_router(health.router)
app.include_router(onboard.router)

app = FastAPI(title="Lab6-proof — Citizen Shield")

app.include_router(auth_router)
app.include_router(shield_router)
app.include_router(memory_router)
app.include_router(onboard_router)

@app.get("/")
def root():
    return {"ok": True, "service": "lab6-proof"}

app = FastAPI(title="Citizen Shield", version="0.1.0")

# In-memory group + used nullifiers (replace with Redis/DB later)
GROUP_ROOT = hashlib.sha256(b"genesis").hexdigest()
GROUP_COMMITS = set()
USED_NULLIFIERS = {}  # key: epoch_id(str) -> set()

# policy knobs (sync with policy.yaml later)
REFLECTIONS_PER_DAY = 12

class EnrollPayload(BaseModel):
    id_commit: str  # hex string commitment (generated client-side)
    proof_of_human: Optional[str] = None  # placeholder for future checks

@app.post("/enroll")
def enroll(p: EnrollPayload):
    # super simple allow-all for now
    GROUP_COMMITS.add(p.id_commit.lower())
    # mock "root": hash of sorted commits
    root = hashlib.sha256(("\n".join(sorted(GROUP_COMMITS))).encode()).hexdigest()
    global GROUP_ROOT
    GROUP_ROOT = root
    return {"ok": True, "group_root": GROUP_ROOT, "count": len(GROUP_COMMITS)}

class ZkEnvelope(BaseModel):
    group_root: str
    epoch_id: str          # e.g., "2025-09-20"
    nullifier: str         # hex
    slot: int              # 0..N within the day for rate-limits
    proof: str             # mocked string for now

class ReflectionPayload(BaseModel):
    companion_id: str
    content: str
    visibility: str = "private"  # or "public"
    zk: ZkEnvelope
    meta: Optional[Dict[str, Any]] = None

def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()

@app.post("/zk/verify-reflection")
def verify_reflection(p: ReflectionPayload):
    # 1) verify group root matches our current root (mocked)
    if p.zk.group_root != GROUP_ROOT:
        raise HTTPException(400, "Invalid group root")

    # 2) mock proof check: accept any non-empty string for now
    if not p.zk.proof:
        raise HTTPException(400, "Missing proof")

    # 3) rate-limit using (epoch_id, slot) uniqueness
    epoch = p.zk.epoch_id or _today()
    USED_NULLIFIERS.setdefault(epoch, set())
    key = f"{p.zk.nullifier}:{p.zk.slot}"
    if key in USED_NULLIFIERS[epoch]:
        raise HTTPException(429, "Rate limit exceeded (duplicate slot)")
    # enforce slot range
    if not (0 <= p.zk.slot < REFLECTIONS_PER_DAY):
        raise HTTPException(429, "Rate limit exceeded (slot out of range)")

    USED_NULLIFIERS[epoch].add(key)

    # Pass-through record you'll forward to Lab4 /sweep:
    attested = {
        "type": "sweep",
        "date": _today(),
        "chamber": "Reflections",
        "note": "[private reflection]",
        "meta": {
            "visibility": p.visibility,
            "companion_id": p.companion_id,
            **(p.meta or {})
        },
        "ts": datetime.now(timezone.utc).isoformat(),
    }

    return {"ok": True, "attested": attested}

@app.get("/health")
def health():
    return {"ok": True, "group_root": GROUP_ROOT, "enrolled": len(GROUP_COMMITS)}

@app.get("/group/status")
def group_status():
    return {
        "group_root": GROUP_ROOT,
        "enrolled_count": len(GROUP_COMMITS),
        "reflections_per_day": REFLECTIONS_PER_DAY,
        "used_nullifiers": {k: len(v) for k, v in USED_NULLIFIERS.items()}
    }





