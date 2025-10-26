# Citizen Shield Integration (Lab6-proof)

## Overview
This integration connects the **Citizen Shield front-end** with the **Lab6-proof API**, adding a new `/onboard` endpoint that records Twin Seal acceptances to the Civic Ledger.

## How It Works
1. Front-end sends `{agent, accepted, note}` to `/onboard`.
2. Backend hashes the canonical **Cycle-0 Primer + Virtue Accord Protocol**.
3. Sends attestation → `https://civic-protocol-core-ledger.onrender.com/attest`.
4. Returns ledger confirmation.

## Route
`POST /onboard`
```json
{
  "agent": "citizen.shield.app",
  "accepted": true,
  "note": "Twin Seals accepted"
}
```

## Environment Variables
```
LEDGER_API_BASE=https://civic-protocol-core-ledger.onrender.com
```

## Integration
Add to your FastAPI app:
```python
from fastapi import FastAPI
from app.routes import onboard

app = FastAPI()
app.include_router(onboard.router)
```


