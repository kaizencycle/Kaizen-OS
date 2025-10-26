#!/usr/bin/env python3
"""
Simple Charter Signing Script (without external dependencies)
Creates a basic signature and hash for the AI Integrity Constitution
"""

import json
import hashlib
import base64
import sys
from pathlib import Path
import time

def load_charter(path: str) -> dict:
    """Load charter JSON from file."""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def canonicalize_json(doc: dict) -> bytes:
    """Convert JSON to canonical form for consistent hashing."""
    return json.dumps(doc, separators=(",", ":"), ensure_ascii=False, sort_keys=True).encode("utf-8")

def compute_hash(payload: bytes) -> str:
    """Compute SHA-256 hash of payload."""
    return hashlib.sha256(payload).hexdigest()

def generate_simple_signature(content: str) -> str:
    """Generate a simple signature based on content hash."""
    # This is a simplified signature for demo purposes
    # In production, use proper ED25519 signing
    content_hash = hashlib.sha256(content.encode()).hexdigest()
    timestamp = str(int(time.time()))
    signature_data = f"{content_hash}:{timestamp}:civic-os-demo"
    return base64.b64encode(signature_data.encode()).decode()

def sign_charter(charter_path: str) -> dict:
    """Sign the charter with a simple signature."""
    # Load charter
    doc = load_charter(charter_path)
    
    # Create a simple public key (demo purposes)
    public_key = base64.b64encode(f"civic-os-demo-key-{int(time.time())}".encode()).decode()
    
    # Generate DID from public key (simplified)
    did = f"did:key:z6Mk{public_key[:32]}"
    
    # Update charter with metadata and public key (but not hash/signature yet)
    doc["metadata"]["did"] = did
    doc["integrity"]["signature"]["public_key_base64"] = public_key
    doc["integrity"]["signature"]["signer_did"] = did
    
    # Now canonicalize and compute hash
    payload = canonicalize_json(doc)
    content_hash = compute_hash(payload)
    
    # Generate simple signature
    signature = generate_simple_signature(payload.decode())
    
    # Update with hash and signature
    doc["integrity"]["content_sha256"] = content_hash
    doc["integrity"]["signature"]["signature_base64"] = signature
    
    return doc

def verify_charter(charter_path: str) -> bool:
    """Verify charter signature and hash."""
    doc = load_charter(charter_path)
    
    # Verify hash
    expected_hash = doc["integrity"]["content_sha256"]
    if not expected_hash:
        print("No content hash found")
        return False
    
    # Canonicalize and compute hash
    payload = canonicalize_json(doc)
    actual_hash = compute_hash(payload)
    
    if expected_hash != actual_hash:
        print(f"Hash mismatch: expected {expected_hash}, got {actual_hash}")
        return False
    
    # Verify signature (simplified)
    signature_info = doc["integrity"]["signature"]
    if not signature_info.get("signature_base64"):
        print("No signature found")
        return False
    
    print("Charter verification successful (simplified)")
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 sign-charter-simple.py <charter.json> [--verify]")
        sys.exit(1)
    
    charter_path = sys.argv[1]
    verify_only = '--verify' in sys.argv
    
    if not Path(charter_path).exists():
        print(f"Charter file not found: {charter_path}")
        sys.exit(1)
    
    if verify_only:
        success = verify_charter(charter_path)
        sys.exit(0 if success else 1)
    
    # Sign the charter
    try:
        signed_doc = sign_charter(charter_path)
        
        # Save signed charter
        with open(charter_path, 'w', encoding='utf-8') as f:
            json.dump(signed_doc, f, indent=2, ensure_ascii=False)
        
        print(f"Charter signed and saved to {charter_path}")
        print(f"Content SHA-256: {signed_doc['integrity']['content_sha256']}")
        print(f"Signer DID: {signed_doc['metadata']['did']}")
        
        # Verify the signature
        if verify_charter(charter_path):
            print("Self-verification passed")
        else:
            print("Self-verification failed")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error signing charter: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
