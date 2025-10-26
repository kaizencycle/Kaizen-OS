#!/usr/bin/env python3
"""
Charter Attestation Script
Attests the AI Integrity Constitution to the Civic Ledger.
"""

import json
import requests
import sys
from pathlib import Path
from typing import Dict, Any, Optional

def load_charter() -> Dict[str, Any]:
    """Load the signed charter."""
    charter_path = Path("/workspace/config/charters/ai_integrity_constitution.v1.json")
    
    if not charter_path.exists():
        raise FileNotFoundError(f"Charter file not found: {charter_path}")
    
    with open(charter_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_attestation_payload(charter: Dict[str, Any]) -> Dict[str, Any]:
    """Create ledger attestation payload for the charter."""
    integrity = charter.get("integrity", {})
    metadata = charter.get("metadata", {})
    
    return {
        "type": "charter",
        "name": charter.get("title", "AI Integrity Constitution"),
        "version": charter.get("version", "1.0"),
        "hash_alg": integrity.get("hash_alg", "sha256"),
        "hash": integrity.get("content_sha256"),
        "uri": f"file://{charter.get('metadata', {}).get('repo', 'github.com/kaizencycle/Civic-OS')}/config/charters/ai_integrity_constitution.v1.json",
        "signer_did": integrity.get("signature", {}).get("signer_did"),
        "tags": ["charter", "integrity", "governance", "cycle0", "ai-constitution"],
        "metadata": {
            "clauses_count": len(charter.get("clauses", [])),
            "governance_quorum": charter.get("governance", {}).get("quorum"),
            "agents": charter.get("governance", {}).get("agents", []),
            "created_at": metadata.get("created_at"),
            "author": metadata.get("author")
        }
    }

def attest_to_ledger(payload: Dict[str, Any], ledger_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """Send attestation to the ledger API."""
    try:
        # Try the ledger attestation endpoint
        response = requests.post(
            f"{ledger_url}/ledger/attest",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "ok": False,
                "error": f"Ledger API error: {response.status_code}",
                "detail": response.text
            }
            
    except requests.exceptions.ConnectionError:
        return {
            "ok": False,
            "error": "Connection failed",
            "detail": f"Could not connect to ledger at {ledger_url}"
        }
    except Exception as e:
        return {
            "ok": False,
            "error": "Attestation failed",
            "detail": str(e)
        }

def update_charter_attestation(charter_path: Path, attestation_id: str):
    """Update charter with attestation information."""
    with open(charter_path, 'r', encoding='utf-8') as f:
        charter = json.load(f)
    
    charter["attestation"] = {
        "ledger_id": attestation_id,
        "status": "attested"
    }
    
    with open(charter_path, 'w', encoding='utf-8') as f:
        json.dump(charter, f, indent=2, ensure_ascii=False)

def main():
    if len(sys.argv) > 1:
        ledger_url = sys.argv[1]
    else:
        ledger_url = "http://localhost:8000"
    
    try:
        print("Loading AI Integrity Constitution...")
        charter = load_charter()
        
        print("Creating attestation payload...")
        payload = create_attestation_payload(charter)
        
        print(f"Attesting to ledger at {ledger_url}...")
        result = attest_to_ledger(payload, ledger_url)
        
        if result.get("ok"):
            attestation_id = result.get("attestation_id") or result.get("id")
            if attestation_id:
                print(f"✅ Charter attested successfully! ID: {attestation_id}")
                
                # Update charter with attestation info
                charter_path = Path("/workspace/config/charters/ai_integrity_constitution.v1.json")
                update_charter_attestation(charter_path, attestation_id)
                print("✅ Charter file updated with attestation info")
            else:
                print("⚠️  Attestation successful but no ID returned")
        else:
            print(f"❌ Attestation failed: {result.get('error', 'Unknown error')}")
            if result.get("detail"):
                print(f"   Detail: {result['detail']}")
            sys.exit(1)
            
    except FileNotFoundError as e:
        print(f"❌ {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
