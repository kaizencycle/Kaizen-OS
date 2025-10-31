"""HTTP adapter for querying sentinel endpoints."""
import httpx
import os
from typing import Dict, List, Optional

DEFAULT_TIMEOUT = 4.0

async def ask(url: str, case: dict, timeout: float = DEFAULT_TIMEOUT) -> float:
    """
    Query a single sentinel endpoint for approval.
    
    Args:
        url: Sentinel endpoint URL
        case: Case payload to evaluate
        timeout: Request timeout in seconds
        
    Returns:
        Approval score (0.0 to 1.0), or 0.0 on error (fail closed)
    """
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=case)
            response.raise_for_status()
            data = response.json()
            approval = float(data.get("approval", 0.0))
            # Clamp to [0.0, 1.0]
            return max(0.0, min(1.0, approval))
    except Exception:
        # Fail closed: return 0.0 on any error
        return 0.0

async def ask_all(sentinel_urls: List[str], case: dict, timeout: float = DEFAULT_TIMEOUT) -> List[float]:
    """
    Query all sentinel endpoints and collect approvals.
    
    Args:
        sentinel_urls: List of sentinel endpoint URLs
        case: Case payload to evaluate
        timeout: Request timeout per endpoint
        
    Returns:
        List of approval scores (one per sentinel)
    """
    approvals = []
    for url in sentinel_urls:
        score = await ask(url, case, timeout)
        approvals.append(score)
    return approvals

async def ask_with_details(url: str, case: dict, timeout: float = DEFAULT_TIMEOUT) -> Dict:
    """
    Query sentinel endpoint and get detailed response.
    
    Args:
        url: Sentinel endpoint URL
        case: Case payload to evaluate
        timeout: Request timeout in seconds
        
    Returns:
        Dictionary with approval score and details:
        {
            "approval": float,
            "reason": str,
            "confidence": float,
            "sentinel": str,
        }
    """
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=case)
            response.raise_for_status()
            data = response.json()
            return {
                "approval": float(data.get("approval", 0.0)),
                "reason": data.get("reason", ""),
                "confidence": float(data.get("confidence", 0.0)),
                "sentinel": url,
            }
    except Exception as e:
        return {
            "approval": 0.0,
            "reason": f"Error: {str(e)}",
            "confidence": 0.0,
            "sentinel": url,
        }
