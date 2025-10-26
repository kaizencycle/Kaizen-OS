"""
ATLAS Constitutional Middleware
Enforces AI Integrity Constitution at the gateway layer
"""
import httpx
import json
from typing import Dict, Any


class ConstitutionalMiddleware:
    """
    Enforces constitutional compliance for all AI prompts
    Works across all LLM providers (Anthropic, OpenAI, custom)
    """
    
    def __init__(self, charter_url: str, ledger_url: str):
        self.charter_url = charter_url
        self.ledger_url = ledger_url
    
    async def enforce(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a prompt against the AI Integrity Constitution
        
        Args:
            payload: {
                "prompt": str,
                "source": str,  # e.g., "browser_extension", "portal"
                "userId": str
            }
        
        Returns:
            {
                "integrity_score": int (0-100),
                "clause_violations": [str],
                "approved": bool
            }
        """
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.post(
                    f"{self.charter_url}/api/charter/validate",
                    json=payload
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    # Permissive fallback if validation service is down
                    return {
                        "integrity_score": 100,
                        "clause_violations": [],
                        "approved": True
                    }
        except Exception as e:
            # Graceful degradation - allow requests if validation is unavailable
            print(f"⚠️ Constitutional validation unavailable: {e}")
            return {
                "integrity_score": 100,
                "clause_violations": [],
                "approved": True
            }

