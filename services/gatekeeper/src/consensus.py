"""DelibProof consensus wrapper for multi-agent validation."""
import httpx
import os
from typing import Dict, List

# Sentinel endpoints for consensus
SENTINELS = [
    os.getenv("SENTINEL_AUREA_URL", "https://aurea.svc/assess"),
    os.getenv("SENTINEL_EVE_URL", "https://eve.svc/assess"),
    os.getenv("SENTINEL_ATLAS_URL", "https://atlas.svc/assess"),
    os.getenv("SENTINEL_ZEUS_URL", "https://zeus.svc/assess"),
]

async def delibproof_consensus(request_payload: dict, threshold: float = 0.90) -> bool:
    """
    Query sentinels for consensus on a high-risk action.
    
    Args:
        request_payload: The request payload to evaluate
        threshold: Minimum consensus threshold (default 0.90)
        
    Returns:
        True if consensus reached, False otherwise
    """
    votes: List[float] = []
    
    async with httpx.AsyncClient(timeout=4.0) as client:
        for url in SENTINELS:
            try:
                response = await client.post(
                    url,
                    json={"intent": "risk_eval", "payload": request_payload}
                )
                response.raise_for_status()
                data = response.json()
                votes.append(float(data.get("approval", 0.0)))
            except Exception:
                # On error, sentinel votes 0.0 (fail closed)
                votes.append(0.0)
    
    if not votes:
        return False
    
    # Consensus: fraction of votes >= 0.9 AND standard deviation is small
    approval_count = sum(1 for v in votes if v >= 0.9)
    agreement = approval_count / len(votes)
    
    # Calculate standard deviation
    if len(votes) > 1:
        mean_vote = sum(votes) / len(votes)
        variance = sum((v - mean_vote) ** 2 for v in votes) / len(votes)
        stddev = variance ** 0.5
        # Require agreement >= threshold AND low variance (sentinels agree)
        return agreement >= threshold and stddev < 0.15
    
    # Single vote must be >= threshold
    return agreement >= threshold

async def get_consensus_details(request_payload: dict) -> Dict:
    """
    Get detailed consensus results from all sentinels.
    
    Args:
        request_payload: The request payload to evaluate
        
    Returns:
        Dictionary with consensus details
    """
    votes: List[Dict] = []
    
    async with httpx.AsyncClient(timeout=4.0) as client:
        for i, url in enumerate(SENTINELS):
            try:
                response = await client.post(
                    url,
                    json={"intent": "risk_eval", "payload": request_payload}
                )
                response.raise_for_status()
                data = response.json()
                votes.append({
                    "sentinel": f"sentinel_{i}",
                    "url": url,
                    "approval": float(data.get("approval", 0.0)),
                    "reason": data.get("reason", ""),
                })
            except Exception as e:
                votes.append({
                    "sentinel": f"sentinel_{i}",
                    "url": url,
                    "approval": 0.0,
                    "reason": f"Error: {str(e)}",
                })
    
    return {
        "votes": votes,
        "consensus_reached": await delibproof_consensus(request_payload),
    }
