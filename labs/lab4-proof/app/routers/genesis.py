from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import requests, os

from app.constants.genesis import (
    GENESIS_EPOCH_ISO,
    GENESIS_WALLET_ID, CUSTODIAN_WALLET_ID, COMMONS_WALLET_ID,
    GENESIS_LEDGER_ID, FOUNDER_LEDGER_ID,
    KAIZEN_AGENT_ID, FOUNDER_AGENT_ID,
    KAIZEN_NODE_ID, FOUNDER_NODE_ID,
    COMMONS_BURN_RATE, COMMONS_UNLOCK_YEARS,
    GENESIS_BALANCE_GIC,
)

router = APIRouter(prefix="/genesis", tags=["genesis"])

LAB4_BASE = os.getenv("LAB4_BASE", "https://hive-api-2le8.onrender.com")
LEDGER_API = os.getenv("LEDGER_API_URL", f"{LAB4_BASE}/ledger")
WALLETS_API = os.getenv("WALLETS_API_URL", f"{LAB4_BASE}/wallet")
ID_API = os.getenv("ID_API_URL", f"{LAB4_BASE}/id")
BIO_API = os.getenv("BIOINTEL_SINK_URL", f"{LAB4_BASE}/biointel")

def _post(url: str, json_body: dict):
    r = requests.post(url, json=json_body, timeout=10)
    if not r.ok:
        raise HTTPException(status_code=500, detail=f"POST {url} failed: {r.text}")
    return r.json()

def _get(url: str):
    r = requests.get(url, timeout=10)
    if not r.ok:
        raise HTTPException(status_code=500, detail=f"GET {url} failed: {r.text}")
    return r.json()

def _wallet_exists(wallet_id: str) -> bool:
    try:
        data = _get(f"{WALLETS_API}/{wallet_id}")
        return bool(data)
    except:
        return False

def _attest(note: str, meta: dict = None):
    body = {"note": note, "ts": int(datetime.now(tz=timezone.utc).timestamp())}
    if meta: body["meta"] = meta
    return _post(f"{LEDGER_API}/attest", body)

@router.get("/status")
def status():
    return {
        "genesis_wallet_exists": _wallet_exists(GENESIS_WALLET_ID),
        "custodian_wallet_exists": _wallet_exists(CUSTODIAN_WALLET_ID),
        "commons_wallet_exists": _wallet_exists(COMMONS_WALLET_ID),
    }

@router.post("/seed")
def seed():
    # 1) Idempotency: if Genesis wallet exists, bail out safely.
    if _wallet_exists(GENESIS_WALLET_ID):
        return {"ok": True, "message": "Genesis already seeded.", "wallet": GENESIS_WALLET_ID}

    # 2) Register first identities (if you have /id/register)
    try:
        _post(f"{ID_API}/register", {"ledgerId": GENESIS_LEDGER_ID, "nodeId": KAIZEN_NODE_ID})
    except Exception:
        pass
    try:
        _post(f"{ID_API}/register", {"ledgerId": FOUNDER_LEDGER_ID, "nodeId": FOUNDER_NODE_ID})
    except Exception:
        pass

    # 3) Create wallets
    _post(f"{WALLETS_API}/create", {
        "walletId": GENESIS_WALLET_ID,
        "owner": KAIZEN_AGENT_ID,
        "type": "genesis",
        "balance": GENESIS_BALANCE_GIC,
        "locked_until": GENESIS_EPOCH_ISO,
        "status": "dormant"
    })

    _post(f"{WALLETS_API}/create", {
        "walletId": CUSTODIAN_WALLET_ID,
        "owner": FOUNDER_AGENT_ID,
        "type": "custodian",
        "balance": 0,
        "status": "active"
    })

    _post(f"{WALLETS_API}/create", {
        "walletId": COMMONS_WALLET_ID,
        "owner": "Civic_Commons",
        "type": "commons",
        "balance": 0,
        "status": "auto",
        "policy": {
            "inflow_pct": COMMONS_BURN_RATE,
            "unlock_cycle_years": COMMONS_UNLOCK_YEARS
        }
    })

    # 4) Bio-Intel anchor (optional)
    try:
        _post(f"{BIO_API}/ingest", {
            "kind": "GENESIS_SEAL",
            "payload": {
                "genesis_wallet": GENESIS_WALLET_ID,
                "custodian_wallet": CUSTODIAN_WALLET_ID,
                "commons_wallet": COMMONS_WALLET_ID,
                "epoch": GENESIS_EPOCH_ISO
            }
        })
    except Exception:
        pass

    # 5) Ledger attestation (public seal)
    _attest(
        "Genesis Block #0001 sealed — Kaizen awakens; Custodian online; Civic Commons established.",
        {
            "genesis_wallet": GENESIS_WALLET_ID,
            "custodian_wallet": CUSTODIAN_WALLET_ID,
            "commons_wallet": COMMONS_WALLET_ID,
            "balance_gic": GENESIS_BALANCE_GIC,
            "commons_rate": COMMONS_BURN_RATE,
            "unlock_cycle_years": COMMONS_UNLOCK_YEARS
        }
    )

    return {"ok": True, "message": "Genesis seeded", "wallets": {
        "genesis": GENESIS_WALLET_ID,
        "custodian": CUSTODIAN_WALLET_ID,
        "commons": COMMONS_WALLET_ID
    }}

