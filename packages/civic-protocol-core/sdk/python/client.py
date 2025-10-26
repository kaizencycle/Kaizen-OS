#!/usr/bin/env python3
"""
Civic Protocol Core - Python SDK

A Python client library for interacting with the Civic Ledger API.
Provides easy-to-use methods for managing reflections, attestations, and votes.
"""

import requests
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Reflection:
    """Represents a civic reflection"""
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
    """Represents a civic attestation"""
    att_id: str
    attester: str
    subject: str
    type: str
    content_hash: str
    created_at: str
    signature: str

@dataclass
class Vote:
    """Represents a governance vote"""
    vote_id: str
    proposal_id: str
    voter: str
    choice: str
    weight: float
    created_at: str
    signature: str

@dataclass
class Cycle:
    """Represents a civic cycle"""
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
    """Represents a GIC balance"""
    address: str
    balance: str
    vesting: str
    nonce: int
    last_updated: str

@dataclass
class EarnEvent:
    """Represents a GIC earning event"""
    event_id: str
    address: str
    amount: str
    reason: str
    cycle_id: str
    created_at: str

class CivicClient:
    """Client for interacting with the Civic Ledger API"""
    
    def __init__(self, base_url: str = "http://localhost:5411", api_key: Optional[str] = None):
        """
        Initialize the Civic client
        
        Args:
            base_url: Base URL of the Civic Ledger API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'X-API-Key': api_key})
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make an HTTP request to the API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
    
    def add_reflection(self, title: str, body: str, tags: List[str] = None, 
                      visibility: str = "private", companion_id: Optional[str] = None) -> Reflection:
        """
        Add a new reflection
        
        Args:
            title: Reflection title
            body: Reflection content
            tags: List of tags
            visibility: Visibility level (private/public)
            companion_id: Optional companion ID for AI-authored reflections
            
        Returns:
            Created reflection object
        """
        data = {
            "title": title,
            "body": body,
            "tags": tags or [],
            "visibility": visibility,
            "companion_id": companion_id
        }
        
        response = self._make_request('POST', '/reflections', json=data)
        return Reflection(**response)
    
    def list_reflections(self, author: Optional[str] = None, visibility: Optional[str] = None,
                        tags: Optional[List[str]] = None, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        List reflections with optional filtering
        
        Args:
            author: Filter by author citizen ID
            visibility: Filter by visibility level
            tags: Filter by tags
            limit: Maximum number of reflections to return
            offset: Number of reflections to skip
            
        Returns:
            Dictionary containing reflections list and metadata
        """
        params = {
            "limit": limit,
            "offset": offset
        }
        
        if author:
            params["author"] = author
        if visibility:
            params["visibility"] = visibility
        if tags:
            params["tags"] = ",".join(tags)
        
        response = self._make_request('GET', '/reflections', params=params)
        
        # Convert reflection dictionaries to Reflection objects
        reflections = [Reflection(**ref) for ref in response.get('reflections', [])]
        response['reflections'] = reflections
        
        return response
    
    def get_reflection(self, ref_id: str) -> Reflection:
        """
        Get a specific reflection by ID
        
        Args:
            ref_id: Reflection ID
            
        Returns:
            Reflection object
        """
        response = self._make_request('GET', f'/reflections/{ref_id}')
        return Reflection(**response)
    
    def add_attestation(self, subject: str, att_type: str, content_hash: str,
                       attester: Optional[str] = None, metadata: Optional[Dict] = None) -> Attestation:
        """
        Add a new attestation
        
        Args:
            subject: Citizen ID of the subject
            att_type: Type of attestation
            content_hash: Hash of content being attested
            attester: Citizen ID of the attester (defaults to current user)
            metadata: Additional attestation metadata
            
        Returns:
            Created attestation object
        """
        data = {
            "subject": subject,
            "type": att_type,
            "content_hash": content_hash,
            "attester": attester,
            "metadata": metadata
        }
        
        response = self._make_request('POST', '/attestations', json=data)
        return Attestation(**response)
    
    def list_attestations(self, attester: Optional[str] = None, subject: Optional[str] = None,
                         att_type: Optional[str] = None, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        List attestations with optional filtering
        
        Args:
            attester: Filter by attester citizen ID
            subject: Filter by subject citizen ID
            att_type: Filter by attestation type
            limit: Maximum number of attestations to return
            offset: Number of attestations to skip
            
        Returns:
            Dictionary containing attestations list and metadata
        """
        params = {
            "limit": limit,
            "offset": offset
        }
        
        if attester:
            params["attester"] = attester
        if subject:
            params["subject"] = subject
        if att_type:
            params["type"] = att_type
        
        response = self._make_request('GET', '/attestations', params=params)
        
        # Convert attestation dictionaries to Attestation objects
        attestations = [Attestation(**att) for att in response.get('attestations', [])]
        response['attestations'] = attestations
        
        return response
    
    def cast_vote(self, proposal_id: str, choice: str, voter: Optional[str] = None,
                 memo: Optional[str] = None) -> Vote:
        """
        Cast a vote in the Agora governance system
        
        Args:
            proposal_id: ID of the proposal
            choice: Vote choice (yes/no/abstain)
            voter: Citizen ID of the voter (defaults to current user)
            memo: Optional vote explanation
            
        Returns:
            Vote object
        """
        data = {
            "proposal_id": proposal_id,
            "choice": choice,
            "voter": voter,
            "memo": memo
        }
        
        response = self._make_request('POST', '/agora/votes', json=data)
        return Vote(**response)
    
    def list_votes(self, proposal_id: Optional[str] = None, voter: Optional[str] = None,
                  limit: int = 50) -> Dict[str, Any]:
        """
        List votes with optional filtering
        
        Args:
            proposal_id: Filter by proposal ID
            voter: Filter by voter citizen ID
            limit: Maximum number of votes to return
            
        Returns:
            Dictionary containing votes list and metadata
        """
        params = {"limit": limit}
        
        if proposal_id:
            params["proposal_id"] = proposal_id
        if voter:
            params["voter"] = voter
        
        response = self._make_request('GET', '/agora/votes', params=params)
        
        # Convert vote dictionaries to Vote objects
        votes = [Vote(**vote) for vote in response.get('votes', [])]
        response['votes'] = votes
        
        return response
    
    def list_cycles(self, date: Optional[str] = None, status: Optional[str] = None,
                   limit: int = 50) -> Dict[str, Any]:
        """
        List civic cycles with optional filtering
        
        Args:
            date: Filter by cycle date (YYYY-MM-DD)
            status: Filter by cycle status
            limit: Maximum number of cycles to return
            
        Returns:
            Dictionary containing cycles list and metadata
        """
        params = {"limit": limit}
        
        if date:
            params["date"] = date
        if status:
            params["status"] = status
        
        response = self._make_request('GET', '/cycles', params=params)
        
        # Convert cycle dictionaries to Cycle objects
        cycles = [Cycle(**cycle) for cycle in response.get('cycles', [])]
        response['cycles'] = cycles
        
        return response
    
    def get_balance(self, address: str) -> Balance:
        """
        Get GIC balance for an address
        
        Args:
            address: Citizen or companion address
            
        Returns:
            Balance object
        """
        response = self._make_request('GET', f'/balance/{address}')
        return Balance(**response)
    
    def get_earn_events(self, address: str, date: Optional[str] = None,
                       limit: int = 50) -> Dict[str, Any]:
        """
        Get GIC earning events for an address
        
        Args:
            address: Citizen or companion address
            date: Filter by date (YYYY-MM-DD)
            limit: Maximum number of events to return
            
        Returns:
            Dictionary containing earn events list and metadata
        """
        params = {"address": address, "limit": limit}
        
        if date:
            params["date"] = date
        
        response = self._make_request('GET', '/earn/events', params=params)
        
        # Convert event dictionaries to EarnEvent objects
        events = [EarnEvent(**event) for event in response.get('events', [])]
        response['events'] = events
        
        return response

# Convenience functions for quick usage
def create_client(base_url: str = "http://localhost:5411", api_key: Optional[str] = None) -> CivicClient:
    """Create a new Civic client instance"""
    return CivicClient(base_url, api_key)

def quick_reflection(title: str, body: str, tags: List[str] = None, 
                    visibility: str = "private") -> Reflection:
    """Quickly add a reflection using the default client"""
    client = create_client()
    return client.add_reflection(title, body, tags, visibility)

def quick_vote(proposal_id: str, choice: str) -> Vote:
    """Quickly cast a vote using the default client"""
    client = create_client()
    return client.cast_vote(proposal_id, choice)

# Example usage
if __name__ == "__main__":
    # Example usage of the Civic client
    client = CivicClient()
    
    # Add a reflection
    reflection = client.add_reflection(
        "Cycle 0 Hello",
        "We heal as we walk.",
        ["hello", "cycle0"],
        "public"
    )
    print(f"Created reflection: {reflection.ref_id}")
    
    # List reflections
    reflections = client.list_reflections(limit=10)
    print(f"Found {reflections['total']} reflections")
    
    # Get balance
    balance = client.get_balance("citizen_001")
    print(f"Balance: {balance.balance} GIC")

