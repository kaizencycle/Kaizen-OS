import os, httpx
from typing import Dict, Any, Optional

LEDGER_API_BASE = os.getenv("LEDGER_API_BASE", "http://localhost:8010")

async def anchor_event(token: str, att_type: str, payload: Dict[str, Any]) -> Optional[dict]:
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                f"{LEDGER_API_BASE}/ledger/attest",
                headers={"Authorization": f"Bearer {token}"},
                json={"event_type": att_type, "lab_source": "lab6", "payload": payload},
            )
            if r.status_code == 200:
                return r.json()
    except Exception:
        pass
    return None


