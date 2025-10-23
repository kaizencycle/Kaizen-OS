# Lab7-Proof /middleware/auth.py
# Secure API key verification + audit logging

import os
import datetime
from fastapi import Request, HTTPException

API_KEY = os.getenv("API_KEY")

# Identify known labs from headers (for logging)
KNOWN_LABS = {
    "lab4": "Reflections",
    "lab6": "Citizen Shield",
    "ledger": "Civic Protocol Core",
    "lab7": "Online Apprenticeship Agent",
}


async def verify_api_key(request: Request):
    """Verifies the x-api-key header and logs which Lab sent it."""
    key = request.headers.get("x-api-key")
    lab_id = request.headers.get("x-lab-id", "unknown").lower()

    # Basic validation
    if key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API key")

    # Timestamp + source logging
    timestamp = datetime.datetime.utcnow().isoformat()
    lab_name = KNOWN_LABS.get(lab_id, "Unknown Lab")

    print(f"[{timestamp}] ✅ Verified request from {lab_name} ({lab_id})")

    # Return lab name to routes if needed
    return {"ok": True, "lab": lab_name, "time": timestamp}
