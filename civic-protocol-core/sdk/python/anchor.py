#!/usr/bin/env python3
"""
Civic Anchor Helper - SDK for posting events to the Civic Ledger

This module provides a simple interface for Lab4 and Lab6 to post events
to the Civic Ledger API. It handles authentication, validation, and retry logic.
"""

import httpx
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import os

@dataclass
class AnchorConfig:
    """Configuration for the anchor helper"""
    ledger_api_base: str
    lab_source: str
    retry_attempts: int = 3
    retry_delay: float = 1.0
    timeout: float = 10.0

class CivicAnchor:
    """Helper class for anchoring events to the Civic Ledger"""
    
    def __init__(self, config: AnchorConfig):
        self.config = config
        self.client = httpx.Client(timeout=config.timeout)
    
    def anchor_event(self, event_type: str, civic_id: str, payload: Dict[str, Any],
                    token: str, signature: Optional[str] = None) -> Dict[str, Any]:
        """
        Anchor an event to the Civic Ledger
        
        Args:
            event_type: Type of event (e.g., 'reflection_created')
            civic_id: Civic ID of the user
            payload: Event payload data
            token: Authentication token
            signature: Optional signature for the event
            
        Returns:
            Response from the ledger API
        """
        for attempt in range(self.config.retry_attempts):
            try:
                response = self.client.post(
                    f"{self.config.ledger_api_base}/ledger/attest",
                    headers={"Authorization": f"Bearer {token}"},
                    json={
                        "event_type": event_type,
                        "civic_id": civic_id,
                        "lab_source": self.config.lab_source,
                        "payload": payload,
                        "signature": signature
                    }
                )
                response.raise_for_status()
                return response.json()
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise Exception(f"Authentication failed: {e.response.text}")
                elif e.response.status_code == 400:
                    raise Exception(f"Invalid event data: {e.response.text}")
                elif e.response.status_code >= 500:
                    # Server error, retry
                    if attempt < self.config.retry_attempts - 1:
                        time.sleep(self.config.retry_delay * (2 ** attempt))
                        continue
                    raise Exception(f"Server error: {e.response.text}")
                else:
                    raise Exception(f"HTTP error {e.response.status_code}: {e.response.text}")
                    
            except httpx.RequestError as e:
                # Network error, retry
                if attempt < self.config.retry_attempts - 1:
                    time.sleep(self.config.retry_delay * (2 ** attempt))
                    continue
                raise Exception(f"Network error: {str(e)}")
        
        raise Exception("Max retry attempts exceeded")
    
    def get_events(self, civic_id: Optional[str] = None, 
                  event_type: Optional[str] = None,
                  limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Get events from the ledger"""
        params = {"limit": limit, "offset": offset}
        if civic_id:
            params["civic_id"] = civic_id
        if event_type:
            params["event_type"] = event_type
        
        response = self.client.get(
            f"{self.config.ledger_api_base}/ledger/events",
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_identity(self, civic_id: str) -> Dict[str, Any]:
        """Get identity information from the ledger"""
        response = self.client.get(
            f"{self.config.ledger_api_base}/ledger/identity/{civic_id}"
        )
        response.raise_for_status()
        return response.json()
    
    def get_ledger_stats(self) -> Dict[str, Any]:
        """Get ledger statistics"""
        response = self.client.get(
            f"{self.config.ledger_api_base}/ledger/stats"
        )
        response.raise_for_status()
        return response.json()
    
    def close(self):
        """Close the HTTP client"""
        self.client.close()

# Factory functions for easy setup
def create_lab4_anchor(ledger_api_base: str = None) -> CivicAnchor:
    """Create an anchor helper for Lab4"""
    if not ledger_api_base:
        ledger_api_base = os.getenv("LEDGER_API_BASE", "http://localhost:8000")
    
    config = AnchorConfig(
        ledger_api_base=ledger_api_base,
        lab_source="lab4"
    )
    return CivicAnchor(config)

def create_lab6_anchor(ledger_api_base: str = None) -> CivicAnchor:
    """Create an anchor helper for Lab6"""
    if not ledger_api_base:
        ledger_api_base = os.getenv("LEDGER_API_BASE", "http://localhost:8000")
    
    config = AnchorConfig(
        ledger_api_base=ledger_api_base,
        lab_source="lab6"
    )
    return CivicAnchor(config)

# Convenience functions for common events
def anchor_reflection_created(anchor: CivicAnchor, civic_id: str, token: str,
                            title: str, content: str, visibility: str = "private",
                            tags: List[str] = None) -> Dict[str, Any]:
    """Anchor a reflection creation event"""
    payload = {
        "title": title,
        "content": content,
        "visibility": visibility,
        "tags": tags or []
    }
    return anchor.anchor_event("reflection_created", civic_id, payload, token)

def anchor_companion_created(anchor: CivicAnchor, civic_id: str, token: str,
                           companion_id: str, name: str, capabilities: List[str] = None) -> Dict[str, Any]:
    """Anchor a companion creation event"""
    payload = {
        "companion_id": companion_id,
        "name": name,
        "capabilities": capabilities or []
    }
    return anchor.anchor_event("companion_created", civic_id, payload, token)

def anchor_memory_created(anchor: CivicAnchor, civic_id: str, token: str,
                         memory_id: str, content: str, memory_type: str = "reflection") -> Dict[str, Any]:
    """Anchor a memory creation event"""
    payload = {
        "memory_id": memory_id,
        "content": content,
        "memory_type": memory_type
    }
    return anchor.anchor_event("memory_created", civic_id, payload, token)

def anchor_agora_vote(anchor: CivicAnchor, civic_id: str, token: str,
                     proposal_id: str, choice: str, weight: float) -> Dict[str, Any]:
    """Anchor an Agora vote event"""
    payload = {
        "proposal_id": proposal_id,
        "choice": choice,
        "weight": weight
    }
    return anchor.anchor_event("agora_vote_cast", civic_id, payload, token)

def anchor_shield_verification(anchor: CivicAnchor, civic_id: str, token: str,
                              verification_type: str, result: str, 
                              metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """Anchor a shield verification event"""
    payload = {
        "verification_type": verification_type,
        "result": result,
        "metadata": metadata or {}
    }
    return anchor.anchor_event("shield_verification", civic_id, payload, token)

def anchor_gic_transaction(anchor: CivicAnchor, civic_id: str, token: str,
                         tx_type: str, amount: int, from_civic_id: str = None,
                         to_civic_id: str = None) -> Dict[str, Any]:
    """Anchor a GIC transaction event"""
    payload = {
        "tx_type": tx_type,
        "amount": amount,
        "from_civic_id": from_civic_id,
        "to_civic_id": to_civic_id
    }
    return anchor.anchor_event(f"gic_{tx_type}", civic_id, payload, token)

# Example usage
if __name__ == "__main__":
    # Create anchor for Lab4
    anchor = create_lab4_anchor("http://localhost:8000")
    
    try:
        # Anchor a reflection creation
        result = anchor_reflection_created(
            anchor=anchor,
            civic_id="civic_test_001",
            token="test_token",
            title="Test Reflection",
            content="This is a test reflection",
            visibility="public",
            tags=["test", "demo"]
        )
        print(f"Reflection anchored: {result}")
        
        # Get events for this civic ID
        events = anchor.get_events(civic_id="civic_test_001")
        print(f"Events: {events}")
        
        # Get identity info
        identity = anchor.get_identity("civic_test_001")
        print(f"Identity: {identity}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        anchor.close()
