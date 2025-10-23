from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict

router = APIRouter(prefix="/wallet", tags=["wallet"])

# Temporary in-memory registry
_DB: Dict[str, dict] = {}

class WalletCreate(BaseModel):
    walletId: str
    owner: str
    type: str
    balance: float = 0.0
    status: str = "active"
    locked_until: str | None = None
    policy: dict | None = None

@router.post("/create")
def create_wallet(wallet: WalletCreate):
    if wallet.walletId in _DB:
        return {"ok": True, "wallet": _DB[wallet.walletId], "note": "already exists"}
    _DB[wallet.walletId] = wallet.model_dump()
    return {"ok": True, "wallet": _DB[wallet.walletId]}

@router.get("/{wallet_id}")
def get_wallet(wallet_id: str):
    if wallet_id not in _DB:
        raise HTTPException(status_code=404, detail="wallet not found")
    return _DB[wallet_id]
