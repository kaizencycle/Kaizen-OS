from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/live")
def live():
    return {"status": "live"}

@router.get("/ready")
def ready():
    # add any dependency checks here later (db, ledger reachability, etc.)
    return {"status": "ready"}