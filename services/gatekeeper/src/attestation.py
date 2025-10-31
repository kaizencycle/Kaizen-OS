"""Attestation service for anchoring execution records to Civic Ledger."""
import hashlib
import httpx
import json
import os
from typing import Dict, Optional

LEDGER_URL = os.getenv("LEDGER_URL", "https://civic-protocol-core-ledger.onrender.com")

def hash_io(payload: dict, result: dict) -> str:
    """
    Generate SHA-256 hash of payload and result for attestation.
    
    Args:
        payload: Request payload
        result: Execution result
        
    Returns:
        Hexadecimal hash string
    """
    hasher = hashlib.sha256()
    
    # Sort keys for deterministic hashing
    payload_str = json.dumps(payload, sort_keys=True)
    result_str = json.dumps(result, sort_keys=True)
    
    hasher.update(payload_str.encode())
    hasher.update(result_str.encode())
    
    return hasher.hexdigest()

async def attest(payload: dict, result: dict) -> Optional[str]:
    """
    Attest execution record to Civic Ledger.
    
    Args:
        payload: Request payload
        result: Execution result
        
    Returns:
        Transaction hash if successful, None otherwise
    """
    digest = hash_io(payload, result)
    
    attestation_payload = {
        "digest": digest,
        "type": "gatekeeper.exec",
        "payload_hash": hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest(),
        "result_hash": hashlib.sha256(json.dumps(result, sort_keys=True).encode()).hexdigest(),
    }
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(
                f"{LEDGER_URL}/ledger/attest",
                json=attestation_payload
            )
            response.raise_for_status()
            data = response.json()
            return data.get("tx_hash")
    except Exception:
        # Log error but don't fail the request
        # In production, queue for retry
        return None

async def attest_blocked(payload: dict, reason: str) -> Optional[str]:
    """
    Attest a blocked request to ledger for audit trail.
    
    Args:
        payload: Request payload that was blocked
        reason: Reason for blocking
        
    Returns:
        Transaction hash if successful, None otherwise
    """
    block_record = {
        "digest": hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest(),
        "type": "gatekeeper.blocked",
        "reason": reason,
        "payload_preview": str(payload)[:500],  # Truncated preview
    }
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(
                f"{LEDGER_URL}/ledger/attest",
                json=block_record
            )
            response.raise_for_status()
            data = response.json()
            return data.get("tx_hash")
    except Exception:
        return None
