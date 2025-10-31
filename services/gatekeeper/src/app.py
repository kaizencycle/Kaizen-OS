"""Gatekeeper FastAPI application - main entry point."""
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.types import ExecRequest, ExecResponse
from src.auth import verify_did_signature, mint_scoped_token
from src.gi_client import assert_gi_ok
from src.policies import allowed, risk_requires_consensus, get_action_risk
from src.detectors import looks_malicious
from src.sandbox import run_in_sandbox, validate_script_safety
from src.consensus import delibproof_consensus
from src.attestation import attest, attest_blocked
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Kaizen Gatekeeper",
    description="Security gatekeeper for agent tool calls",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def role_from_did(did: str) -> str:
    """
    Get actor role from DID.
    
    TODO: Implement DID registry lookup
    For now, returns default role based on DID prefix or pattern
    """
    # Example: Check DID for role indicators
    if "sentinel" in did.lower():
        return "sentinel"
    elif "founder" in did.lower():
        return "founder"
    elif "pro" in did.lower():
        return "pro"
    return "citizen"

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "gatekeeper"}

@app.post("/execute", response_model=ExecResponse)
async def execute(req: ExecRequest, request: Request):
    """
    Execute a privileged action through the gatekeeper.
    
    This endpoint enforces:
    1. DID signature verification
    2. GI floor check
    3. RBAC validation
    4. Injection detection
    5. DelibProof consensus for high-risk actions
    6. Sandboxed execution
    7. Attestation to ledger
    """
    try:
        # 1) Verify DID signature header
        sig_header = request.headers.get("x-did-sig", "")
        pub_header = request.headers.get("x-did-pub", "")
        
        if not sig_header or not pub_header:
            await attest_blocked(req.model_dump(), "Missing DID signature headers")
            raise HTTPException(status_code=401, detail="Missing DID signature headers")
        
        try:
            sig_bytes = bytes.fromhex(sig_header) if len(sig_header) == 128 else sig_header.encode()
            pub_bytes = bytes.fromhex(pub_header) if len(pub_header) == 128 else pub_header.encode()
        except Exception:
            sig_bytes = sig_header.encode()
            pub_bytes = pub_header.encode()
        
        payload_bytes = json.dumps(req.model_dump(), sort_keys=True).encode()
        
        if not verify_did_signature(payload_bytes, pub_bytes, sig_bytes):
            await attest_blocked(req.model_dump(), "Invalid DID signature")
            raise HTTPException(status_code=401, detail="Invalid DID signature")
        
        # 2) GI floor check
        try:
            await assert_gi_ok(req.actor_did)
        except ValueError as e:
            await attest_blocked(req.model_dump(), f"GI check failed: {str(e)}")
            raise HTTPException(status_code=403, detail=f"Integrity floor: {str(e)}")
        
        # 3) RBAC check
        role = role_from_did(req.actor_did)
        if not allowed(role, req.action):
            await attest_blocked(req.model_dump(), f"RBAC denied: {role} cannot {req.action}")
            raise HTTPException(status_code=403, detail=f"Not allowed for role: {role}")
        
        # 4) Heuristic detector
        if looks_malicious(req.payload):
            await attest_blocked(req.model_dump(), "Payload flagged by injection detector")
            raise HTTPException(status_code=403, detail="Payload flagged by injection detector")
        
        # 5) Validate script safety (for execute_script actions)
        if req.action == "execute_script":
            script = req.payload.get("script", "")
            is_safe, reason = validate_script_safety(script)
            if not is_safe:
                await attest_blocked(req.model_dump(), f"Script safety check failed: {reason}")
                raise HTTPException(status_code=403, detail=f"Script safety check failed: {reason}")
        
        # 6) High-risk actions require DelibProof consensus
        if risk_requires_consensus(req.risk):
            logger.info(f"High-risk action {req.action} requires consensus for {req.actor_did}")
            consensus_ok = await delibproof_consensus(req.model_dump())
            if not consensus_ok:
                await attest_blocked(req.model_dump(), "Sentinel consensus failed")
                raise HTTPException(status_code=403, detail="Consensus veto")
        
        # 7) Execute action
        if req.action == "execute_script":
            result = run_in_sandbox(req.payload.get("script", ""))
        elif req.action == "http_request":
            # TODO: Implement HTTP request broker
            result = {"rc": 0, "stdout": "HTTP request brokered (stub)", "stderr": ""}
        elif req.action == "db_query":
            # TODO: Implement DB query broker
            result = {"rc": 0, "stdout": "DB query brokered (stub)", "stderr": ""}
        elif req.action == "mint_gic":
            # TODO: Implement GIC minting broker
            result = {"rc": 0, "stdout": "GIC minting brokered (stub)", "stderr": ""}
        elif req.action == "write_file":
            # TODO: Implement file write broker
            result = {"rc": 0, "stdout": "File write brokered (stub)", "stderr": ""}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {req.action}")
        
        # 8) Attest to ledger
        tx_hash = await attest(req.model_dump(), result)
        
        # 9) Generate result preview
        preview = (result.get("stdout", "") or result.get("stderr", ""))[:240]
        
        logger.info(f"Action {req.action} executed successfully for {req.actor_did}, tx: {tx_hash}")
        
        return ExecResponse(
            status="ok",
            attestation_tx=tx_hash,
            result_preview=preview
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in execute: {str(e)}", exc_info=True)
        await attest_blocked(req.model_dump(), f"Internal error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/revoke")
async def revoke(request: Request):
    """
    Revoke tokens for a DID (admin endpoint).
    
    TODO: Implement token revocation logic
    """
    # This would integrate with KMS/token store to revoke tokens
    return {"status": "ok", "message": "Token revocation (stub)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
