#!/usr/bin/env python3
"""
Civic Protocol Core - Development Node

A local mock server that implements the Civic Ledger API for development and testing.
This server runs on port 5411 and provides endpoints for reflections, attestations, and votes.
"""

import json
import uuid
import time
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import signal
import sys
import os
import httpx

@dataclass
class Reflection:
    ref_id: str
    envelope_hash: str
    author: str
    companion: Optional[str]
    visibility: str
    tags: List[str]
    created_at: str
    zk_proof: str

@dataclass
class Attestation:
    att_id: str
    attester: str
    subject: str
    type: str
    content_hash: str
    created_at: str
    signature: str

@dataclass
class Vote:
    vote_id: str
    proposal_id: str
    voter: str
    choice: str
    weight: float
    created_at: str
    signature: str

@dataclass
class Cycle:
    cycle_id: str
    date: str
    seed_hash: str
    sweeps_root: str
    seal_hash: str
    day_root: str
    counts: Dict[str, int]
    status: str
    created_at: str

@dataclass
class Balance:
    address: str
    balance: str
    vesting: str
    nonce: int
    last_updated: str

@dataclass
class EarnEvent:
    event_id: str
    address: str
    amount: str
    reason: str
    cycle_id: str
    created_at: str

class CivicDevNode:
    """Development node that stores data in memory"""
    
    def __init__(self):
        self.reflections: Dict[str, Reflection] = {}
        self.attestations: Dict[str, Attestation] = {}
        self.votes: Dict[str, Vote] = {}
        self.cycles: Dict[str, Cycle] = {}
        self.balances: Dict[str, Balance] = {}
        self.earn_events: Dict[str, EarnEvent] = {}
        self.anchors: Dict[str, Dict[str, Any]] = {}
        
        # Configuration
        self.anchor_l1 = os.getenv("ANCHOR_L1", "ethereum-sepolia")
        self.anchor_gateway = os.getenv("ANCHOR_GATEWAY", "")
        
        # Initialize with some sample data
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize the dev node with sample data"""
        # Sample reflection
        ref_id = str(uuid.uuid4())
        self.reflections[ref_id] = Reflection(
            ref_id=ref_id,
            envelope_hash="0x1234567890abcdef",
            author="citizen_001",
            companion=None,
            visibility="public",
            tags=["hello", "cycle0"],
            created_at=datetime.now().isoformat(),
            zk_proof="0xabcdef1234567890"
        )
        
        # Sample cycle
        cycle_id = str(uuid.uuid4())
        self.cycles[cycle_id] = Cycle(
            cycle_id=cycle_id,
            date=date.today().isoformat(),
            seed_hash="0xseed123",
            sweeps_root="0xsweeps456",
            seal_hash="0xseal789",
            day_root="0xdayroot123456",
            counts={"seeds": 10, "sweeps": 8, "seals": 7},
            status="ledger",
            created_at=datetime.now().isoformat()
        )
        
        # Sample balance
        self.balances["citizen_001"] = Balance(
            address="citizen_001",
            balance="1000.0",
            vesting="200.0",
            nonce=0,
            last_updated=datetime.now().isoformat()
        )

class CivicAPIHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the Civic Ledger API"""
    
    def __init__(self, *args, dev_node: CivicDevNode, **kwargs):
        self.dev_node = dev_node
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        if path == '/reflections':
            self._handle_get_reflections(query_params)
        elif path.startswith('/reflections/'):
            ref_id = path.split('/')[-1]
            self._handle_get_reflection(ref_id)
        elif path == '/attestations':
            self._handle_get_attestations(query_params)
        elif path == '/agora/votes':
            self._handle_get_votes(query_params)
        elif path == '/cycles':
            self._handle_get_cycles(query_params)
        elif path.startswith('/balance/'):
            address = path.split('/')[-1]
            self._handle_get_balance(address)
        elif path == '/earn/events':
            self._handle_get_earn_events(query_params)
        elif path == '/anchor':
            self._handle_anchor()
        else:
            self._send_error(404, "Not Found")
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/reflections':
            self._handle_create_reflection()
        elif path == '/attestations':
            self._handle_create_attestation()
        elif path == '/agora/votes':
            self._handle_cast_vote()
        else:
            self._send_error(404, "Not Found")
    
    def _handle_get_reflections(self, query_params):
        """Handle GET /reflections"""
        reflections = list(self.dev_node.reflections.values())
        
        # Apply filters
        if 'author' in query_params:
            author = query_params['author'][0]
            reflections = [r for r in reflections if r.author == author]
        
        if 'visibility' in query_params:
            visibility = query_params['visibility'][0]
            reflections = [r for r in reflections if r.visibility == visibility]
        
        if 'tags' in query_params:
            tags = query_params['tags'][0].split(',')
            reflections = [r for r in reflections if any(tag in r.tags for tag in tags)]
        
        # Apply pagination
        limit = int(query_params.get('limit', [50])[0])
        offset = int(query_params.get('offset', [0])[0])
        
        total = len(reflections)
        reflections = reflections[offset:offset + limit]
        has_more = offset + len(reflections) < total
        
        response = {
            "reflections": [asdict(r) for r in reflections],
            "total": total,
            "has_more": has_more
        }
        
        self._send_json_response(200, response)
    
    def _handle_get_reflection(self, ref_id):
        """Handle GET /reflections/{reflection_id}"""
        if ref_id in self.dev_node.reflections:
            reflection = self.dev_node.reflections[ref_id]
            self._send_json_response(200, asdict(reflection))
        else:
            self._send_error(404, "Reflection not found")
    
    def _handle_create_reflection(self):
        """Handle POST /reflections"""
        try:
            data = self._get_json_data()
            
            # Validate required fields
            if not all(field in data for field in ['title', 'body', 'visibility']):
                self._send_error(400, "Missing required fields: title, body, visibility")
                return
            
            # Create reflection
            ref_id = str(uuid.uuid4())
            reflection = Reflection(
                ref_id=ref_id,
                envelope_hash=f"0x{''.join([f'{ord(c):02x}' for c in data['title']])[:16]}",
                author=data.get('author', 'citizen_001'),
                companion=data.get('companion_id'),
                visibility=data['visibility'],
                tags=data.get('tags', []),
                created_at=datetime.now().isoformat(),
                zk_proof=f"0x{''.join([f'{ord(c):02x}' for c in data['body']])[:16]}"
            )
            
            self.dev_node.reflections[ref_id] = reflection
            self._send_json_response(201, asdict(reflection))
            
        except Exception as e:
            self._send_error(400, f"Invalid request: {str(e)}")
    
    def _handle_get_attestations(self, query_params):
        """Handle GET /attestations"""
        attestations = list(self.dev_node.attestations.values())
        
        # Apply filters
        if 'attester' in query_params:
            attester = query_params['attester'][0]
            attestations = [a for a in attestations if a.attester == attester]
        
        if 'subject' in query_params:
            subject = query_params['subject'][0]
            attestations = [a for a in attestations if a.subject == subject]
        
        if 'type' in query_params:
            att_type = query_params['type'][0]
            attestations = [a for a in attestations if a.type == att_type]
        
        # Apply pagination
        limit = int(query_params.get('limit', [50])[0])
        offset = int(query_params.get('offset', [0])[0])
        
        total = len(attestations)
        attestations = attestations[offset:offset + limit]
        has_more = offset + len(attestations) < total
        
        response = {
            "attestations": [asdict(a) for a in attestations],
            "total": total,
            "has_more": has_more
        }
        
        self._send_json_response(200, response)
    
    def _handle_create_attestation(self):
        """Handle POST /attestations"""
        try:
            data = self._get_json_data()
            
            # Validate required fields
            if not all(field in data for field in ['subject', 'type', 'content_hash']):
                self._send_error(400, "Missing required fields: subject, type, content_hash")
                return
            
            # Create attestation
            att_id = str(uuid.uuid4())
            attestation = Attestation(
                att_id=att_id,
                attester=data.get('attester', 'citizen_001'),
                subject=data['subject'],
                type=data['type'],
                content_hash=data['content_hash'],
                created_at=datetime.now().isoformat(),
                signature=f"0x{''.join([f'{ord(c):02x}' for c in data['content_hash']])[:16]}"
            )
            
            self.dev_node.attestations[att_id] = attestation
            self._send_json_response(201, asdict(attestation))
            
        except Exception as e:
            self._send_error(400, f"Invalid request: {str(e)}")
    
    def _handle_get_votes(self, query_params):
        """Handle GET /agora/votes"""
        votes = list(self.dev_node.votes.values())
        
        # Apply filters
        if 'proposal_id' in query_params:
            proposal_id = query_params['proposal_id'][0]
            votes = [v for v in votes if v.proposal_id == proposal_id]
        
        if 'voter' in query_params:
            voter = query_params['voter'][0]
            votes = [v for v in votes if v.voter == voter]
        
        # Apply pagination
        limit = int(query_params.get('limit', [50])[0])
        
        total = len(votes)
        votes = votes[:limit]
        
        response = {
            "votes": [asdict(v) for v in votes],
            "total": total
        }
        
        self._send_json_response(200, response)
    
    def _handle_cast_vote(self):
        """Handle POST /agora/votes"""
        try:
            data = self._get_json_data()
            
            # Validate required fields
            if not all(field in data for field in ['proposal_id', 'choice']):
                self._send_error(400, "Missing required fields: proposal_id, choice")
                return
            
            # Create vote
            vote_id = str(uuid.uuid4())
            vote = Vote(
                vote_id=vote_id,
                proposal_id=data['proposal_id'],
                voter=data.get('voter', 'citizen_001'),
                choice=data['choice'],
                weight=1.0,  # Default weight
                created_at=datetime.now().isoformat(),
                signature=f"0x{''.join([f'{ord(c):02x}' for c in data['proposal_id']])[:16]}"
            )
            
            self.dev_node.votes[vote_id] = vote
            self._send_json_response(201, asdict(vote))
            
        except Exception as e:
            self._send_error(400, f"Invalid request: {str(e)}")
    
    def _handle_get_cycles(self, query_params):
        """Handle GET /cycles"""
        cycles = list(self.dev_node.cycles.values())
        
        # Apply filters
        if 'date' in query_params:
            target_date = query_params['date'][0]
            cycles = [c for c in cycles if c.date == target_date]
        
        if 'status' in query_params:
            status = query_params['status'][0]
            cycles = [c for c in cycles if c.status == status]
        
        # Apply pagination
        limit = int(query_params.get('limit', [50])[0])
        
        total = len(cycles)
        cycles = cycles[:limit]
        
        response = {
            "cycles": [asdict(c) for c in cycles],
            "total": total
        }
        
        self._send_json_response(200, response)
    
    def _handle_get_balance(self, address):
        """Handle GET /balance/{address}"""
        if address in self.dev_node.balances:
            balance = self.dev_node.balances[address]
            self._send_json_response(200, asdict(balance))
        else:
            # Return zero balance for unknown addresses
            balance = Balance(
                address=address,
                balance="0.0",
                vesting="0.0",
                nonce=0,
                last_updated=datetime.now().isoformat()
            )
            self._send_json_response(200, asdict(balance))
    
    def _handle_get_earn_events(self, query_params):
        """Handle GET /earn/events"""
        if 'address' not in query_params:
            self._send_error(400, "Address parameter required")
            return
        
        address = query_params['address'][0]
        events = [e for e in self.dev_node.earn_events.values() if e.address == address]
        
        # Apply date filter
        if 'date' in query_params:
            target_date = query_params['date'][0]
            events = [e for e in events if e.created_at.startswith(target_date)]
        
        # Apply pagination
        limit = int(query_params.get('limit', [50])[0])
        
        total = len(events)
        events = events[:limit]
        
        response = {
            "events": [asdict(e) for e in events],
            "total": total
        }
        
        self._send_json_response(200, response)
    
    def _handle_anchor(self):
        """Handle POST /anchor"""
        try:
            data = self._get_json_data()
            
            # Validate required fields
            if not all(field in data for field in ['date', 'day_root']):
                self._send_error(400, "Missing required fields: date, day_root")
                return
            
            # Create anchor record
            anchor_record = {
                "l1": self.dev_node.anchor_l1,
                "date": data['date'],
                "day_root": data['day_root'],
                "meta": data.get('meta', {}),
                "ts": datetime.now().isoformat() + "Z",
            }
            
            # Store anchor
            anchor_id = f"anchor_{data['date']}_{int(time.time())}"
            self.dev_node.anchors[anchor_id] = anchor_record
            
            # Optional: forward to gateway if configured
            gateway_response = {"note": "ANCHOR_GATEWAY not set; local anchor only."}
            if self.dev_node.anchor_gateway:
                try:
                    r = httpx.post(
                        self.dev_node.anchor_gateway.rstrip("/") + "/submit",
                        json=anchor_record, 
                        timeout=15.0
                    )
                    r.raise_for_status()
                    gateway_response = r.json()
                except Exception as e:
                    gateway_response = {"error": str(e)}
            
            response = {
                "ok": True,
                "anchor": anchor_record,
                "gateway": gateway_response
            }
            
            self._send_json_response(200, response)
            
        except Exception as e:
            self._send_error(400, f"Invalid request: {str(e)}")
    
    def _get_json_data(self):
        """Parse JSON data from request body"""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        
        data = self.rfile.read(content_length)
        return json.loads(data.decode('utf-8'))
    
    def _send_json_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
        self.end_headers()
        
        response_data = json.dumps(data, indent=2)
        self.wfile.write(response_data.encode('utf-8'))
    
    def _send_error(self, status_code, message):
        """Send error response"""
        error_data = {
            "error": self._get_error_code(status_code),
            "message": message
        }
        self._send_json_response(status_code, error_data)
    
    def _get_error_code(self, status_code):
        """Get error code for status code"""
        error_codes = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            404: "NOT_FOUND",
            429: "RATE_LIMITED",
            500: "INTERNAL_ERROR"
        }
        return error_codes.get(status_code, "UNKNOWN_ERROR")
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
        self.end_headers()

def create_handler(dev_node):
    """Create a handler class with the dev_node instance"""
    class Handler(CivicAPIHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, dev_node=dev_node, **kwargs)
    return Handler

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print("\nShutting down Civic Dev Node...")
    sys.exit(0)

def main():
    """Main function to run the development node"""
    print("Starting Civic Protocol Core Development Node...")
    print("Server will run on http://localhost:5411")
    print("Press Ctrl+C to stop")
    
    # Create dev node instance
    dev_node = CivicDevNode()
    
    # Create server
    server_address = ('localhost', 5411)
    handler_class = create_handler(dev_node)
    httpd = HTTPServer(server_address, handler_class)
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        httpd.shutdown()

if __name__ == '__main__':
    main()
