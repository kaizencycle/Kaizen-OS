"""
Charter Verification Router for AI Integrity Constitution
Provides endpoints for charter verification, validation, and attestation.
"""

from fastapi import APIRouter, HTTPException, Header
from pathlib import Path
import json
import base64
import hashlib
from typing import Optional, Dict, Any
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError
import logging

log = logging.getLogger(__name__)

router = APIRouter(prefix="/charter", tags=["charter"])

# Charter file path (relative to workspace root)
CHARTER_PATH = Path("/workspace/config/charters/ai_integrity_constitution.v1.json")

def canonicalize_json(doc: dict) -> bytes:
    """Convert JSON to canonical form for consistent hashing."""
    return json.dumps(doc, separators=(",", ":"), ensure_ascii=False, sort_keys=True).encode("utf-8")

def compute_hash(payload: bytes) -> str:
    """Compute SHA-256 hash of payload."""
    return hashlib.sha256(payload).hexdigest()

@router.get("/current")
def get_current_charter():
    """Get the current AI Integrity Constitution charter."""
    try:
        if not CHARTER_PATH.exists():
            raise HTTPException(status_code=404, detail="Charter file not found")
        
        with open(CHARTER_PATH, 'r', encoding='utf-8') as f:
            charter = json.load(f)
        
        return {
            "ok": True,
            "charter": charter,
            "path": str(CHARTER_PATH)
        }
    except Exception as e:
        log.error(f"Error loading charter: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load charter: {str(e)}")

@router.get("/verify")
def verify_charter():
    """Verify charter signature and hash integrity."""
    try:
        if not CHARTER_PATH.exists():
            raise HTTPException(status_code=404, detail="Charter file not found")
        
        with open(CHARTER_PATH, 'r', encoding='utf-8') as f:
            doc = json.load(f)
        
        # Canonicalize for consistent hashing
        payload = canonicalize_json(doc)
        
        # Verify hash
        expected_hash = doc.get("integrity", {}).get("content_sha256")
        if not expected_hash:
            raise HTTPException(status_code=400, detail="No content hash found in charter")
        
        actual_hash = compute_hash(payload)
        if expected_hash != actual_hash:
            raise HTTPException(
                status_code=400, 
                detail=f"Hash mismatch: expected {expected_hash}, got {actual_hash}"
            )
        
        # Verify signature
        signature_info = doc.get("integrity", {}).get("signature", {})
        if not signature_info:
            raise HTTPException(status_code=400, detail="No signature found in charter")
        
        pubkey_b64 = signature_info.get("public_key_base64")
        sig_b64 = signature_info.get("signature_base64")
        
        if not pubkey_b64 or not sig_b64:
            raise HTTPException(status_code=400, detail="Incomplete signature information")
        
        try:
            verify_key = VerifyKey(base64.b64decode(pubkey_b64))
            verify_key.verify(payload, base64.b64decode(sig_b64))
        except BadSignatureError:
            raise HTTPException(status_code=400, detail="Signature verification failed")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Signature verification error: {str(e)}")
        
        return {
            "ok": True,
            "verified": True,
            "sha256": actual_hash,
            "signer_did": signature_info.get("signer_did"),
            "message": "Charter verification successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error verifying charter: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@router.get("/status")
def charter_status():
    """Get charter status including verification and attestation status."""
    try:
        if not CHARTER_PATH.exists():
            return {
                "ok": False,
                "status": "not_found",
                "message": "Charter file not found"
            }
        
        with open(CHARTER_PATH, 'r', encoding='utf-8') as f:
            doc = json.load(f)
        
        # Check if charter is signed
        integrity = doc.get("integrity", {})
        is_signed = bool(integrity.get("content_sha256") and integrity.get("signature", {}).get("signature_base64"))
        
        # Check attestation status
        attestation = doc.get("attestation", {})
        is_attested = attestation.get("status") == "attested"
        ledger_id = attestation.get("ledger_id")
        
        return {
            "ok": True,
            "status": "loaded",
            "signed": is_signed,
            "attested": is_attested,
            "ledger_id": ledger_id,
            "version": doc.get("version"),
            "title": doc.get("title"),
            "clauses_count": len(doc.get("clauses", [])),
            "governance": doc.get("governance", {}),
            "metadata": doc.get("metadata", {})
        }
        
    except Exception as e:
        log.error(f"Error getting charter status: {e}")
        return {
            "ok": False,
            "status": "error",
            "message": str(e)
        }

@router.post("/attest")
def attest_charter(x_admin_token: Optional[str] = Header(None)):
    """Attest the charter to the Civic Ledger (admin only)."""
    # This would integrate with your existing ledger API
    # For now, return a placeholder response
    return {
        "ok": True,
        "message": "Charter attestation endpoint - integrate with ledger API",
        "note": "This endpoint should create a ledger attestation for the charter"
    }

@router.get("/clauses")
def get_clauses():
    """Get all constitutional clauses."""
    try:
        if not CHARTER_PATH.exists():
            raise HTTPException(status_code=404, detail="Charter file not found")
        
        with open(CHARTER_PATH, 'r', encoding='utf-8') as f:
            doc = json.load(f)
        
        clauses = doc.get("clauses", [])
        return {
            "ok": True,
            "clauses": clauses,
            "count": len(clauses)
        }
        
    except Exception as e:
        log.error(f"Error loading clauses: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load clauses: {str(e)}")

@router.get("/clauses/{clause_id}")
def get_clause(clause_id: str):
    """Get a specific constitutional clause by ID."""
    try:
        if not CHARTER_PATH.exists():
            raise HTTPException(status_code=404, detail="Charter file not found")
        
        with open(CHARTER_PATH, 'r', encoding='utf-8') as f:
            doc = json.load(f)
        
        clauses = doc.get("clauses", [])
        clause = next((c for c in clauses if c.get("id") == clause_id), None)
        
        if not clause:
            raise HTTPException(status_code=404, detail=f"Clause {clause_id} not found")
        
        return {
            "ok": True,
            "clause": clause
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error loading clause {clause_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load clause: {str(e)}")

@router.get("/governance")
def get_governance():
    """Get governance rules and agent configuration."""
    try:
        if not CHARTER_PATH.exists():
            raise HTTPException(status_code=404, detail="Charter file not found")
        
        with open(CHARTER_PATH, 'r', encoding='utf-8') as f:
            doc = json.load(f)
        
        governance = doc.get("governance", {})
        return {
            "ok": True,
            "governance": governance
        }
        
    except Exception as e:
        log.error(f"Error loading governance: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load governance: {str(e)}")
