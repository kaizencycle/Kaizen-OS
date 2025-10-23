#!/usr/bin/env python3
"""
Ledger Verification - Token and signature verification for the Civic Ledger

This module handles verification of tokens from Lab4 and Lab6, ensuring
that only authenticated and authorized events are added to the ledger.
"""

import httpx
from typing import Dict, Any, Optional
from fastapi import HTTPException
import os

class TokenVerifier:
    """Handles token verification with Lab4 and Lab6"""
    
    def __init__(self, lab4_base: str, lab6_base: str = ""):
        self.lab4_base = lab4_base
        self.lab6_base = lab6_base
    
    def verify_token(self, token: str, lab_source: str) -> Dict[str, Any]:
        """Verify token with the appropriate lab"""
        if lab_source == "lab4":
            api_base = self.lab4_base
        elif lab_source == "lab6":
            if not self.lab6_base:
                raise HTTPException(400, "Lab6 API base not configured")
            api_base = self.lab6_base
        else:
            raise HTTPException(400, f"Unknown lab source: {lab_source}")
        
        try:
            response = httpx.get(
                f"{api_base}/auth/introspect", 
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(401, f"Token verification failed: {e.response.status_code}")
        except httpx.RequestError as e:
            raise HTTPException(503, f"Lab service unavailable: {str(e)}")
        except Exception as e:
            raise HTTPException(401, f"Token verification failed: {str(e)}")
    
    def verify_civic_id(self, civic_id: str, lab_source: str) -> bool:
        """Verify that a civic_id is valid for the given lab source"""
        # This could be enhanced to check against a registry
        # For now, we just validate the format
        if not civic_id or not civic_id.startswith("civic_"):
            return False
        
        # Additional validation could be added here
        return True

class EventValidator:
    """Validates events before they are added to the ledger"""
    
    def __init__(self):
        self.valid_event_types = {
            # Lab4 events
            "reflection_created",
            "reflection_updated", 
            "reflection_deleted",
            "companion_created",
            "companion_updated",
            "memory_created",
            "memory_updated",
            "agora_vote_cast",
            "agora_proposal_created",
            
            # Lab6 events
            "shield_enrollment",
            "shield_verification",
            "citizen_attestation",
            "festival_participation",
            "governance_action",
            
            # GIC events
            "gic_minted",
            "gic_burned",
            "gic_transfer",
            "gic_staked",
            "gic_unstaked",
            
            # System events
            "day_cycle_seed",
            "day_cycle_sweep", 
            "day_cycle_seal",
            "day_cycle_ledger",
            "policy_update",
            "governance_proposal",
            "governance_execution"
        }
    
    def validate_event(self, event_type: str, payload: Dict[str, Any]) -> bool:
        """Validate an event before adding to ledger"""
        
        # Check event type
        if event_type not in self.valid_event_types:
            raise HTTPException(400, f"Invalid event type: {event_type}")
        
        # Validate payload structure
        if not isinstance(payload, dict):
            raise HTTPException(400, "Payload must be a dictionary")
        
        # Event-specific validation
        if event_type.startswith("reflection_"):
            return self._validate_reflection_event(payload)
        elif event_type.startswith("companion_"):
            return self._validate_companion_event(payload)
        elif event_type.startswith("gic_"):
            return self._validate_gic_event(payload)
        elif event_type.startswith("day_cycle_"):
            return self._validate_cycle_event(payload)
        elif event_type.startswith("governance_"):
            return self._validate_governance_event(payload)
        
        return True
    
    def _validate_reflection_event(self, payload: Dict[str, Any]) -> bool:
        """Validate reflection events"""
        required_fields = ["title", "content"]
        for field in required_fields:
            if field not in payload:
                raise HTTPException(400, f"Missing required field: {field}")
        
        if not isinstance(payload.get("title"), str) or len(payload["title"]) == 0:
            raise HTTPException(400, "Title must be a non-empty string")
        
        if not isinstance(payload.get("content"), str) or len(payload["content"]) == 0:
            raise HTTPException(400, "Content must be a non-empty string")
        
        return True
    
    def _validate_companion_event(self, payload: Dict[str, Any]) -> bool:
        """Validate companion events"""
        required_fields = ["companion_id", "name"]
        for field in required_fields:
            if field not in payload:
                raise HTTPException(400, f"Missing required field: {field}")
        
        return True
    
    def _validate_gic_event(self, payload: Dict[str, Any]) -> bool:
        """Validate GIC events"""
        if "amount" not in payload:
            raise HTTPException(400, "Missing required field: amount")
        
        amount = payload["amount"]
        if not isinstance(amount, (int, float)) or amount < 0:
            raise HTTPException(400, "Amount must be a non-negative number")
        
        return True
    
    def _validate_cycle_event(self, payload: Dict[str, Any]) -> bool:
        """Validate day cycle events"""
        required_fields = ["date", "cycle_type"]
        for field in required_fields:
            if field not in payload:
                raise HTTPException(400, f"Missing required field: {field}")
        
        return True
    
    def _validate_governance_event(self, payload: Dict[str, Any]) -> bool:
        """Validate governance events"""
        if "proposal_id" not in payload:
            raise HTTPException(400, "Missing required field: proposal_id")
        
        return True

class SignatureVerifier:
    """Handles signature verification for events"""
    
    def __init__(self):
        self.verify_signatures = os.getenv("VERIFY_SIGNATURES", "false").lower() == "true"
    
    def verify_event_signature(self, event_id: str, signature: str, 
                             civic_id: str, lab_source: str) -> bool:
        """Verify event signature"""
        if not self.verify_signatures:
            return True  # Skip verification if disabled
        
        if not signature:
            raise HTTPException(400, "Signature required for this event type")
        
        # In a real implementation, this would verify the signature
        # against the civic_id's public key
        # For now, we just check that it's not empty
        if len(signature) < 10:
            raise HTTPException(400, "Invalid signature format")
        
        return True

# Factory function to create verifiers
def create_verifiers() -> tuple[TokenVerifier, EventValidator, SignatureVerifier]:
    """Create verification components"""
    lab4_base = os.getenv("LAB4_API_BASE", "https://hive-api-2le8.onrender.com")
    lab6_base = os.getenv("LAB6_API_BASE", "")
    
    token_verifier = TokenVerifier(lab4_base, lab6_base)
    event_validator = EventValidator()
    signature_verifier = SignatureVerifier()
    
    return token_verifier, event_validator, signature_verifier

# Example usage
if __name__ == "__main__":
    # Test verification components
    token_verifier, event_validator, signature_verifier = create_verifiers()
    
    # Test event validation
    try:
        event_validator.validate_event("reflection_created", {
            "title": "Test Reflection",
            "content": "This is a test reflection"
        })
        print("✓ Event validation passed")
    except HTTPException as e:
        print(f"✗ Event validation failed: {e.detail}")
    
    # Test signature verification
    try:
        signature_verifier.verify_event_signature(
            "evt_123", "test_signature_123", "civic_001", "lab4"
        )
        print("✓ Signature verification passed")
    except HTTPException as e:
        print(f"✗ Signature verification failed: {e.detail}")
