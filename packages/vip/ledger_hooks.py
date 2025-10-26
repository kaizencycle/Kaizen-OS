"""
Ledger Hooks - Attest VIP records to Kaizen Ledger
"""

import httpx
from typing import Dict, Any


class LedgerHooks:
    """Minimal async client for Kaizen Ledger attestations"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
    
    async def attest(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Seal VIP record to Kaizen Ledger
        
        Args:
            payload: VIP record with metadata and scores
            
        Returns:
            {"hash": str, ...}
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/attestations",
                    json=payload
                )
                response.raise_for_status()
                return response.json()
        except httpx.RequestError as e:
            print(f"⚠️ Ledger connection failed: {e}")
            return {"hash": None, "error": str(e)}
        except httpx.HTTPStatusError as e:
            print(f"⚠️ Ledger returned error: {e}")
            return {"hash": None, "error": str(e.response.status_code)}

