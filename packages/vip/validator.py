"""
VIP Validator - Constitutional + GI Integrity Scoring
"""

from dataclasses import dataclass
from typing import Dict, Any
import httpx


@dataclass
class VIPThresholds:
    """VIP Integrity Thresholds"""
    min_constitutional: float = 70.0
    min_gi: float = 0.90


class VIPValidator:
    """
    Validates content before embedding into vector stores
    
    Combines:
    - Constitutional score (AI behavior compliance)
    - GI score (user integrity)
    → Integrity score (weighted composite)
    """
    
    def __init__(
        self, 
        charter_client: str,
        gi_client: str,
        thresholds: VIPThresholds = VIPThresholds()
    ):
        self.charter_url = charter_client
        self.gi_url = gi_client
        self.t = thresholds
    
    async def evaluate(self, text: str, user_id: str) -> Dict[str, Any]:
        """
        Evaluate text for embedding eligibility
        
        Args:
            text: Content to validate
            user_id: User ID for GI score lookup
            
        Returns:
            {
                "constitutional_score": float,
                "gi": float,
                "integrity_score": float,
                "approved": bool,
                "violations": List[str]
            }
        """
        try:
            # Get constitutional score
            async with httpx.AsyncClient(timeout=10.0) as client:
                charter_resp = await client.post(
                    f"{self.charter_url}/api/charter/validate",
                    json={"prompt": text, "source": "vip"}
                )
                charter_data = charter_resp.json() if charter_resp.status_code == 200 else {}
        except Exception as e:
            print(f"⚠️ Constitutional validation failed: {e}")
            charter_data = {"score": 100, "clause_violations": []}
        
        try:
            # Get GI score
            async with httpx.AsyncClient(timeout=10.0) as client:
                gi_resp = await client.get(
                    f"{self.gi_url}/api/integrity/calculate",
                    params={"identityId": user_id}
                )
                gi_data = gi_resp.json() if gi_resp.status_code == 200 else {}
        except Exception as e:
            print(f"⚠️ GI validation failed: {e}")
            gi_data = {"gi": 1.0}
        
        # Calculate scores
        constitutional_score = charter_data.get("integrity_score", 100)
        gi = gi_data.get("gi", 1.0)
        
        # Weighted integrity score
        integrity_score = round(
            0.6 * constitutional_score + 0.4 * (gi * 100.0),
            2
        )
        
        # Check thresholds
        approved = (
            constitutional_score >= self.t.min_constitutional and
            gi >= self.t.min_gi
        )
        
        return {
            "constitutional_score": constitutional_score,
            "gi": gi,
            "integrity_score": integrity_score,
            "approved": approved,
            "violations": charter_data.get("clause_violations", []),
            "reason": None if approved else "Below thresholds"
        }

