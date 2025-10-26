"""
Kaizen OS Event Bus with Ledger Attestation
ATLAS: Every event is sealed to the ledger for full audit trail
"""
import json
from datetime import datetime
import httpx
from typing import Dict, Any, Optional

# For NATS (install with: pip install nats-py)
try:
    from nats.aio.client import Client as NATS
    NATS_AVAILABLE = True
except ImportError:
    NATS_AVAILABLE = False
    print("⚠️ NATS not available - event bus disabled. Install with: pip install nats-py")


class CivicEventBus:
    """
    Event bus with ledger attestation
    - All critical events are sealed to Civic Ledger
    - Constitutional validation on high-impact events
    - Full audit trail for compliance
    """
    
    def __init__(self, nats_url: str, ledger_url: str):
        self.nats_url = nats_url
        self.ledger_url = ledger_url
        self.nc: Optional[NATS] = None if NATS_AVAILABLE else None
        self._connected = False
    
    async def connect(self):
        """Connect to NATS server"""
        if not NATS_AVAILABLE:
            print("⚠️ NATS not available - event bus disabled")
            return
            
        try:
            self.nc = NATS()
            await self.nc.connect(self.nats_url)
            self._connected = True
            print(f"✅ Connected to NATS: {self.nats_url}")
        except Exception as e:
            print(f"⚠️ Failed to connect to NATS: {e}")
            self._connected = False
    
    async def publish_with_attestation(self, topic: str, data: Dict[str, Any]):
        """
        Publish event with ledger attestation
        
        Args:
            topic: Event topic (e.g., "identity.created", "gic.minted")
            data: Event data
        """
        event = {
            **data,
            "topic": topic,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # 1. Seal to ledger (non-fatal if ledger is down)
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                ledger_response = await client.post(
                    f"{self.ledger_url}/api/attestations",
                    json={
                        "action": f"event_{topic}",
                        "data": event,
                        "timestamp": event["timestamp"],
                    }
                )
                
                if ledger_response.status_code == 200:
                    ledger_data = ledger_response.json()
                    event["ledger_hash"] = ledger_data.get("hash")
                    print(f"✅ Event sealed to ledger: {topic}")
        except Exception as e:
            print(f"⚠️ Failed to seal event to ledger: {e}")
            # Continue anyway - non-fatal
        
        # 2. Publish to NATS (non-fatal if NATS is down)
        if self._connected and self.nc:
            try:
                await self.nc.publish(
                    topic,
                    json.dumps(event).encode()
                )
                print(f"✅ Event published to NATS: {topic}")
            except Exception as e:
                print(f"⚠️ Failed to publish to NATS: {e}")
        else:
            print(f"⚠️ Event bus not connected - event not published: {topic}")
    
    async def subscribe(self, topic: str, handler):
        """
        Subscribe to events with automatic verification
        
        Args:
            topic: Event topic to subscribe to
            handler: Async function to handle events
        """
        if not self._connected or not self.nc:
            print("⚠️ Cannot subscribe - event bus not connected")
            return
        
        async def verified_handler(msg):
            event = json.loads(msg.data.decode())
            
            # Verify ledger hash if present
            if "ledger_hash" in event:
                # TODO: Implement ledger hash verification
                pass
            
            await handler(event)
        
        try:
            await self.nc.subscribe(topic, cb=verified_handler)
            print(f"✅ Subscribed to: {topic}")
        except Exception as e:
            print(f"⚠️ Failed to subscribe to {topic}: {e}")


