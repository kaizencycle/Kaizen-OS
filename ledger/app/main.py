#!/usr/bin/env python3
"""
Civic Ledger API - The Blockchain Kernel

This is the central immutable anchor service that all Civic Protocol
components write to. Think of it as the "Bitcoin Core" for GIC.

Every reflection, shield action, companion event, and governance decision
gets anchored here as an immutable event in the ledger.
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import sqlite3
import hashlib
import json
import os
import tempfile
import httpx
from dataclasses import dataclass, asdict

app = FastAPI(
    title="Civic Ledger API",
    description="The blockchain kernel for Civic Protocol - immutable event anchoring",
    version="0.1.0"
)

# Configuration - Use writable directories on Render
def get_data_dir():
    """Get a writable data directory for the current environment"""
    # Try various writable locations in order of preference
    possible_dirs = [
        os.getenv("LEDGER_DATA_DIR"),  # Custom env var
        "/tmp/ledger_data",            # Render temp directory
        "./data",                      # Local development
        tempfile.gettempdir() + "/ledger_data"  # System temp as fallback
    ]
    
    for dir_path in possible_dirs:
        if dir_path is None:
            continue
        try:
            os.makedirs(dir_path, exist_ok=True)
            # Test write permissions
            test_file = os.path.join(dir_path, "test_write")
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)
            return dir_path
        except (OSError, PermissionError):
            continue
    
    # If all else fails, use temp directory without subdirectory
    return tempfile.gettempdir()

DATA_DIR = get_data_dir()
LEDGER_DB_PATH = os.path.join(DATA_DIR, "ledger.db")

# API Configuration
LAB4_API_BASE = os.getenv("LAB4_API_BASE", "https://hive-api-2le8.onrender.com")
LAB6_API_BASE = os.getenv("LAB6_API_BASE", "")

print(f"Using data directory: {DATA_DIR}")
print(f"Database path: {LEDGER_DB_PATH}")

@dataclass
class LedgerEvent:
    """Immutable ledger event"""
    event_id: str
    event_type: str
    civic_id: str
    lab_source: str  # "lab4" or "lab6"
    payload: Dict[str, Any]
    timestamp: str
    previous_hash: str
    event_hash: str
    signature: Optional[str] = None

class AttestationRequest(BaseModel):
    """Request to attest an event to the ledger"""
    event_type: str
    civic_id: str
    lab_source: str
    payload: Dict[str, Any]
    signature: Optional[str] = None

class EventResponse(BaseModel):
    """Response for ledger events"""
    event_id: str
    event_type: str
    civic_id: str
    lab_source: str
    timestamp: str
    event_hash: str
    confirmed: bool

def get_db_connection():
    """Get database connection"""
    try:
        conn = sqlite3.connect(LEDGER_DB_PATH)
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS identities (
                civic_id TEXT PRIMARY KEY,
                lab_source TEXT NOT NULL,
                first_seen TEXT NOT NULL,
                last_seen TEXT NOT NULL,
                event_count INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(500, f"Database connection failed: {str(e)}")

def verify_token(token: str, lab_source: str) -> Dict[str, Any]:
    """Verify token with the appropriate lab"""
    if lab_source == "lab4":
        api_base = LAB4_API_BASE
    elif lab_source == "lab6":
        api_base = LAB6_API_BASE
    else:
        raise HTTPException(400, f"Unknown lab source: {lab_source}")
    
    if not api_base:
        raise HTTPException(400, f"No API base configured for {lab_source}")
    
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                f"{api_base}/auth/introspect", 
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(401, f"Token verification failed: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Token verification error: {str(e)}")

def get_latest_event_hash() -> str:
    """Get the hash of the latest event in the chain"""
    try:
        with get_db_connection() as conn:
            cursor = conn.execute("""
                SELECT event_hash FROM events 
                ORDER BY created_at DESC LIMIT 1
            """)
            result = cursor.fetchone()
            return result[0] if result else "0" * 64  # Genesis hash
    except Exception as e:
        print(f"Error getting latest hash: {e}")
        return "0" * 64

def calculate_event_hash(event: LedgerEvent) -> str:
    """Calculate SHA-256 hash of the event"""
    event_data = f"{event.event_id}{event.event_type}{event.civic_id}{event.lab_source}{json.dumps(event.payload, sort_keys=True)}{event.timestamp}{event.previous_hash}"
    return hashlib.sha256(event_data.encode()).hexdigest()

def create_ledger_event(event_type: str, civic_id: str, lab_source: str, 
                       payload: Dict[str, Any], signature: Optional[str] = None) -> LedgerEvent:
    """Create a new ledger event"""
    event_id = f"evt_{int(datetime.now().timestamp() * 1000)}_{hashlib.sha256(f'{civic_id}{event_type}'.encode()).hexdigest()[:8]}"
    timestamp = datetime.now(timezone.utc).isoformat()
    previous_hash = get_latest_event_hash()
    
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
    event.event_hash = calculate_event_hash(event)
    
    return event

@app.get("/") 
def root(): 
    return {
        "service": "civic-ledger-api",
        "docs": "/docs",
        "data_dir": DATA_DIR,
        "db_path": LEDGER_DB_PATH
    }

@app.get("/health")
def health():
    """Health check endpoint"""
    try:
        # Test database connection
        with get_db_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM events")
            event_count = cursor.fetchone()[0]
        
        return {
            "ok": True, 
            "service": "civic-ledger-api", 
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data_dir": DATA_DIR,
            "event_count": event_count,
            "db_accessible": True
        }
    except Exception as e:
        return {
            "ok": False,
            "service": "civic-ledger-api",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": str(e),
            "data_dir": DATA_DIR,
            "db_accessible": False
        }

@app.post("/ledger/attest")
def attest_event(request: AttestationRequest, 
                authorization: Optional[str] = Header(None)):
    """Attest an event to the immutable ledger"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid authorization header")
    
    token = authorization[7:]  # Remove "Bearer " prefix
    
    # Verify token with the appropriate lab
    try:
        token_data = verify_token(token, request.lab_source)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(401, f"Token verification failed: {str(e)}")
    
    # Create ledger event
    event = create_ledger_event(
        event_type=request.event_type,
        civic_id=request.civic_id,
        lab_source=request.lab_source,
        payload=request.payload,
        signature=request.signature
    )
    
    # Store in database
    try:
        with get_db_connection() as conn:
            conn.execute("""
                INSERT INTO events (event_id, event_type, civic_id, lab_source, 
                                  payload, timestamp, previous_hash, event_hash, signature)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.event_id, event.event_type, event.civic_id, event.lab_source,
                json.dumps(event.payload), event.timestamp, event.previous_hash,
                event.event_hash, event.signature
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
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")
    
    return EventResponse(
        event_id=event.event_id,
        event_type=event.event_type,
        civic_id=event.civic_id,
        lab_source=event.lab_source,
        timestamp=event.timestamp,
        event_hash=event.event_hash,
        confirmed=True
    )

@app.get("/ledger/events")
def get_events(civic_id: Optional[str] = None, 
               event_type: Optional[str] = None,
               lab_source: Optional[str] = None,
               limit: int = 100,
               offset: int = 0):
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
    
    try:
        with get_db_connection() as conn:
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
                    "signature": row[8]
                })
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")
    
    return {"events": events, "count": len(events)}

@app.get("/ledger/identity/{civic_id}")
def get_identity(civic_id: str):
    """Get identity information and stats"""
    
    try:
        with get_db_connection() as conn:
            # Get identity stats
            cursor = conn.execute("""
                SELECT civic_id, lab_source, first_seen, last_seen, event_count
                FROM identities WHERE civic_id = ?
            """, (civic_id,))
            
            identity_row = cursor.fetchone()
            if not identity_row:
                raise HTTPException(404, f"Identity {civic_id} not found")
            
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
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")
    
    return {
        "civic_id": identity_row[0],
        "lab_source": identity_row[1],
        "first_seen": identity_row[2],
        "last_seen": identity_row[3],
        "event_count": identity_row[4],
        "recent_events": recent_events
    }

@app.get("/ledger/stats")
def get_ledger_stats():
    """Get ledger statistics"""
    
    try:
        with get_db_connection() as conn:
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
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")
    
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

@app.get("/ledger/chain")
def get_chain_info():
    """Get blockchain-like chain information"""
    
    try:
        with get_db_connection() as conn:
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
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")
    
    return {
        "chain_length": chain_length,
        "latest_hash": latest_hash,
        "genesis_hash": genesis_hash,
        "is_genesis": chain_length == 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


