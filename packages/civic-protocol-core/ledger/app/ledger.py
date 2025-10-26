#!/usr/bin/env python3
"""
Ledger Core - The blockchain kernel for Civic Protocol

This module contains the core ledger functionality for immutable event storage
and blockchain-like operations. Think of it as the "Bitcoin Core" equivalent
for the Civic Protocol ecosystem.
"""

import sqlite3
import hashlib
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import os

@dataclass
class LedgerEvent:
    """Immutable ledger event - the basic unit of the blockchain"""
    event_id: str
    event_type: str
    civic_id: str
    lab_source: str
    payload: Dict[str, Any]
    timestamp: str
    previous_hash: str
    event_hash: str
    signature: Optional[str] = None
    block_height: Optional[int] = None

@dataclass
class LedgerBlock:
    """A block containing multiple events (for batching)"""
    block_id: str
    block_height: int
    previous_block_hash: str
    block_hash: str
    events: List[LedgerEvent]
    timestamp: str
    merkle_root: str

class LedgerCore:
    """Core ledger functionality - the blockchain kernel"""
    
    def __init__(self, db_path: str = "./data/ledger.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize the ledger database"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            # Events table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    event_id TEXT PRIMARY KEY,
                    event_type TEXT NOT NULL,
                    civic_id TEXT NOT NULL,
                    lab_source TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    previous_hash TEXT NOT NULL,
                    event_hash TEXT NOT NULL,
                    signature TEXT,
                    block_height INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Blocks table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS blocks (
                    block_id TEXT PRIMARY KEY,
                    block_height INTEGER UNIQUE NOT NULL,
                    previous_block_hash TEXT NOT NULL,
                    block_hash TEXT NOT NULL,
                    merkle_root TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    event_count INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Identities table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS identities (
                    civic_id TEXT PRIMARY KEY,
                    lab_source TEXT NOT NULL,
                    first_seen TEXT NOT NULL,
                    last_seen TEXT NOT NULL,
                    event_count INTEGER DEFAULT 0,
                    balance_gic INTEGER DEFAULT 0
                )
            """)
            
            # GIC transactions table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS gic_transactions (
                    tx_id TEXT PRIMARY KEY,
                    from_civic_id TEXT,
                    to_civic_id TEXT,
                    amount INTEGER NOT NULL,
                    tx_type TEXT NOT NULL,
                    event_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (event_id) REFERENCES events (event_id)
                )
            """)
            
            conn.commit()
    
    def create_event(self, event_type: str, civic_id: str, lab_source: str,
                    payload: Dict[str, Any], signature: Optional[str] = None) -> LedgerEvent:
        """Create a new ledger event"""
        event_id = f"evt_{int(datetime.now().timestamp() * 1000)}_{hashlib.sha256(f'{civic_id}{event_type}'.encode()).hexdigest()[:8]}"
        timestamp = datetime.now(timezone.utc).isoformat()
        previous_hash = self._get_latest_event_hash()
        
        event = LedgerEvent(
            event_id=event_id,
            event_type=event_type,
            civic_id=civic_id,
            lab_source=lab_source,
            payload=payload,
            timestamp=timestamp,
            previous_hash=previous_hash,
            event_hash="",  # Will be calculated
            signature=signature
        )
        
        # Calculate event hash
        event.event_hash = self._calculate_event_hash(event)
        
        return event
    
    def add_event(self, event: LedgerEvent) -> bool:
        """Add an event to the ledger"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO events (event_id, event_type, civic_id, lab_source,
                                      payload, timestamp, previous_hash, event_hash, signature, block_height)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event.event_id, event.event_type, event.civic_id, event.lab_source,
                    json.dumps(event.payload), event.timestamp, event.previous_hash,
                    event.event_hash, event.signature, event.block_height
                ))
                
                # Update identity stats
                conn.execute("""
                    INSERT OR REPLACE INTO identities (civic_id, lab_source, first_seen, last_seen, event_count)
                    VALUES (?, ?, 
                            COALESCE((SELECT first_seen FROM identities WHERE civic_id = ?), ?),
                            ?, 
                            COALESCE((SELECT event_count FROM identities WHERE civic_id = ?), 0) + 1)
                """, (event.civic_id, event.lab_source, event.civic_id, event.timestamp,
                      event.timestamp, event.civic_id))
                
                conn.commit()
            return True
        except Exception as e:
            print(f"Error adding event: {e}")
            return False
    
    def get_events(self, civic_id: Optional[str] = None, 
                  event_type: Optional[str] = None,
                  lab_source: Optional[str] = None,
                  limit: int = 100,
                  offset: int = 0) -> List[Dict[str, Any]]:
        """Get events from the ledger with optional filtering"""
        
        query = "SELECT * FROM events WHERE 1=1"
        params = []
        
        if civic_id:
            query += " AND civic_id = ?"
            params.append(civic_id)
        
        if event_type:
            query += " AND event_type = ?"
            params.append(event_type)
        
        if lab_source:
            query += " AND lab_source = ?"
            params.append(lab_source)
        
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            
            events = []
            for row in rows:
                events.append({
                    "event_id": row[0],
                    "event_type": row[1],
                    "civic_id": row[2],
                    "lab_source": row[3],
                    "payload": json.loads(row[4]),
                    "timestamp": row[5],
                    "previous_hash": row[6],
                    "event_hash": row[7],
                    "signature": row[8],
                    "block_height": row[9]
                })
        
        return events
    
    def get_identity(self, civic_id: str) -> Optional[Dict[str, Any]]:
        """Get identity information and stats"""
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT civic_id, lab_source, first_seen, last_seen, event_count, balance_gic
                FROM identities WHERE civic_id = ?
            """, (civic_id,))
            
            identity_row = cursor.fetchone()
            if not identity_row:
                return None
            
            # Get recent events
            cursor = conn.execute("""
                SELECT event_type, timestamp, event_hash
                FROM events WHERE civic_id = ?
                ORDER BY created_at DESC LIMIT 10
            """, (civic_id,))
            
            recent_events = []
            for row in cursor.fetchall():
                recent_events.append({
                    "event_type": row[0],
                    "timestamp": row[1],
                    "event_hash": row[2]
                })
        
        return {
            "civic_id": identity_row[0],
            "lab_source": identity_row[1],
            "first_seen": identity_row[2],
            "last_seen": identity_row[3],
            "event_count": identity_row[4],
            "balance_gic": identity_row[5],
            "recent_events": recent_events
        }
    
    def get_ledger_stats(self) -> Dict[str, Any]:
        """Get ledger statistics"""
        
        with sqlite3.connect(self.db_path) as conn:
            # Total events
            cursor = conn.execute("SELECT COUNT(*) FROM events")
            total_events = cursor.fetchone()[0]
            
            # Total identities
            cursor = conn.execute("SELECT COUNT(*) FROM identities")
            total_identities = cursor.fetchone()[0]
            
            # Events by type
            cursor = conn.execute("""
                SELECT event_type, COUNT(*) FROM events 
                GROUP BY event_type ORDER BY COUNT(*) DESC
            """)
            events_by_type = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Events by lab
            cursor = conn.execute("""
                SELECT lab_source, COUNT(*) FROM events 
                GROUP BY lab_source ORDER BY COUNT(*) DESC
            """)
            events_by_lab = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Latest event
            cursor = conn.execute("""
                SELECT event_id, timestamp, event_type FROM events 
                ORDER BY created_at DESC LIMIT 1
            """)
            latest_event = cursor.fetchone()
        
        return {
            "total_events": total_events,
            "total_identities": total_identities,
            "events_by_type": events_by_type,
            "events_by_lab": events_by_lab,
            "latest_event": {
                "event_id": latest_event[0],
                "timestamp": latest_event[1],
                "event_type": latest_event[2]
            } if latest_event else None
        }
    
    def get_chain_info(self) -> Dict[str, Any]:
        """Get blockchain-like chain information"""
        
        with sqlite3.connect(self.db_path) as conn:
            # Get chain length
            cursor = conn.execute("SELECT COUNT(*) FROM events")
            chain_length = cursor.fetchone()[0]
            
            # Get latest block hash
            cursor = conn.execute("""
                SELECT event_hash FROM events 
                ORDER BY created_at DESC LIMIT 1
            """)
            latest_hash = cursor.fetchone()
            latest_hash = latest_hash[0] if latest_hash else "0" * 64
            
            # Get genesis hash
            cursor = conn.execute("""
                SELECT event_hash FROM events 
                ORDER BY created_at ASC LIMIT 1
            """)
            genesis_hash = cursor.fetchone()
            genesis_hash = genesis_hash[0] if genesis_hash else "0" * 64
        
        return {
            "chain_length": chain_length,
            "latest_hash": latest_hash,
            "genesis_hash": genesis_hash,
            "is_genesis": chain_length == 0
        }
    
    def _get_latest_event_hash(self) -> str:
        """Get the hash of the latest event in the chain"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT event_hash FROM events 
                ORDER BY created_at DESC LIMIT 1
            """)
            result = cursor.fetchone()
            return result[0] if result else "0" * 64  # Genesis hash
    
    def _calculate_event_hash(self, event: LedgerEvent) -> str:
        """Calculate SHA-256 hash of the event"""
        event_data = f"{event.event_id}{event.event_type}{event.civic_id}{event.lab_source}{json.dumps(event.payload, sort_keys=True)}{event.timestamp}{event.previous_hash}"
        return hashlib.sha256(event_data.encode()).hexdigest()
    
    def verify_chain_integrity(self) -> bool:
        """Verify the integrity of the event chain"""
        events = self.get_events(limit=1000)  # Get all events
        
        for i, event in enumerate(events):
            # Check if this is the first event
            if i == 0:
                if event['previous_hash'] != "0" * 64:
                    return False
            else:
                # Check if previous hash matches
                if event['previous_hash'] != events[i-1]['event_hash']:
                    return False
            
            # Verify event hash
            expected_hash = self._calculate_event_hash(LedgerEvent(
                event_id=event['event_id'],
                event_type=event['event_type'],
                civic_id=event['civic_id'],
                lab_source=event['lab_source'],
                payload=event['payload'],
                timestamp=event['timestamp'],
                previous_hash=event['previous_hash'],
                event_hash="",
                signature=event['signature']
            ))
            
            if event['event_hash'] != expected_hash:
                return False
        
        return True

# Example usage
if __name__ == "__main__":
    # Test the ledger core
    ledger = LedgerCore()
    
    # Create a test event
    event = ledger.create_event(
        event_type="reflection_created",
        civic_id="civic_test_001",
        lab_source="lab4",
        payload={"title": "Test Reflection", "content": "This is a test"}
    )
    
    # Add to ledger
    success = ledger.add_event(event)
    print(f"Event added: {success}")
    
    # Get events
    events = ledger.get_events(limit=10)
    print(f"Total events: {len(events)}")
    
    # Get stats
    stats = ledger.get_ledger_stats()
    print(f"Ledger stats: {stats}")
    
    # Verify chain integrity
    integrity = ledger.verify_chain_integrity()
    print(f"Chain integrity: {integrity}")

