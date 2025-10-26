"""
VIP Embedder Adapter - Validate, Embed, Attest
"""

import json
import hashlib
import time
from typing import Dict, Any, Optional
from .validator import VIPValidator


class VIPEmbedder:
    """
    Embeds content into vector stores with full integrity attestation
    
    Flow:
    1. Validate (constitutional + GI)
    2. Embed + upsert to vector DB
    3. Attest to Kaizen Ledger
    """
    
    def __init__(
        self,
        vecdb,
        ledger,
        validator: VIPValidator,
        namespace: str = "kaizen-os"
    ):
        self.vecdb = vecdb
        self.ledger = ledger
        self.validator = validator
        self.namespace = namespace
    
    def _hash(self, s: str) -> str:
        """Generate SHA-256 hash"""
        return hashlib.sha256(s.encode()).hexdigest()
    
    async def embed(
        self,
        text: str,
        meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Embed content with integrity validation
        
        Args:
            text: Content to embed
            meta: Metadata {source, user, companion, ...}
            
        Returns:
            {
                "accepted": bool,
                "doc_id": str,
                "ledger_hash": Optional[str],
                "verdict": Dict
            }
        """
        # 1. Validate integrity
        verdict = await self.validator.evaluate(text, meta.get("user", "unknown"))
        
        if not verdict["approved"]:
            return {
                "accepted": False,
                "verdict": verdict,
                "reason": f"Failed VIP thresholds: {verdict.get('reason')}"
            }
        
        # 2. Generate document ID
        doc_id = self._hash(f"{text}:{meta.get('source', '')}")
        
        # 3. Embed content (mock - integrate with actual vector DB)
        try:
            # vector = await self.vecdb.embed(text)
            # await self.vecdb.upsert(
            #     doc_id,
            #     vector,
            #     namespace=self.namespace,
            #     metadata={
            #         **meta,
            #         "vip": {
            #             "integrity_score": verdict["integrity_score"],
            #             "constitutional_score": verdict["constitutional_score"],
            #             "gi": verdict["gi"],
            #             "timestamp": int(time.time())
            #         }
            #     }
            # )
            pass
        except Exception as e:
            print(f"⚠️ Vector DB error (mock): {e}")
        
        # 4. Attest to ledger
        attestation = {
            "action": "vip.embed",
            "namespace": self.namespace,
            "doc_id": doc_id,
            "input_hash": self._hash(text),
            "metadata": meta,
            "scores": {
                "integrity": verdict["integrity_score"],
                "constitutional": verdict["constitutional_score"],
                "gi": verdict["gi"]
            },
            "timestamp": time.time()
        }
        
        try:
            ledger_resp = await self.ledger.attest(attestation)
            ledger_hash = ledger_resp.get("hash") if ledger_resp else None
        except Exception as e:
            print(f"⚠️ Ledger attestation failed: {e}")
            ledger_hash = None
        
        return {
            "accepted": True,
            "doc_id": doc_id,
            "ledger_hash": ledger_hash,
            "verdict": verdict,
            "namespace": self.namespace
        }

