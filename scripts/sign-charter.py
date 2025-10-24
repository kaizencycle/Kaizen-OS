#!/usr/bin/env python3
"""
Charter Signing Script for AI Integrity Constitution
Computes SHA-256 hash and ED25519 signature for charter documents.
"""

import json
import hashlib
import base64
import sys
from pathlib import Path
from nacl.signing import SigningKey, VerifyKey
from nacl.exceptions import BadSignatureError

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

def generate_keypair() -> tuple[SigningKey, VerifyKey]:
    """Generate new ED25519 keypair."""
    signing_key = SigningKey.generate()
    verify_key = signing_key.verify_key
    return signing_key, verify_key

def load_keypair_from_file(keyfile: str) -> tuple[SigningKey, VerifyKey]:
    """Load keypair from file (base64 encoded)."""
    with open(keyfile, 'rb') as f:
        key_data = f.read()
    signing_key = SigningKey(key_data)
    verify_key = signing_key.verify_key
    return signing_key, verify_key

def sign_charter(charter_path: str, keyfile: str = None) -> dict:
    """Sign the charter with ED25519 signature."""
    # Load charter
    doc = load_charter(charter_path)
    
    # Canonicalize for consistent hashing
    payload = canonicalize_json(doc)
    
    # Compute hash
    content_hash = compute_hash(payload)
    
    # Load or generate keypair
    if keyfile and Path(keyfile).exists():
        signing_key, verify_key = load_keypair_from_file(keyfile)
        print(f"Loaded keypair from {keyfile}")
    else:
        signing_key, verify_key = generate_keypair()
        print("Generated new keypair")
        if keyfile:
            with open(keyfile, 'wb') as f:
                f.write(signing_key.encode())
            print(f"Saved keypair to {keyfile}")
    
    # Sign the payload
    signature = signing_key.sign(payload).signature
    
    # Update charter with integrity fields
    doc["integrity"]["content_sha256"] = content_hash
    doc["integrity"]["signature"]["public_key_base64"] = base64.b64encode(bytes(verify_key)).decode()
    doc["integrity"]["signature"]["signature_base64"] = base64.b64encode(signature).decode()
    
    # Generate DID from public key (simplified)
    pubkey_b64 = base64.b64encode(bytes(verify_key)).decode()
    did = f"did:key:z6Mk{pubkey_b64[:32]}"
    doc["metadata"]["did"] = did
    doc["integrity"]["signature"]["signer_did"] = did
    
    return doc

def verify_charter(charter_path: str) -> bool:
    """Verify charter signature and hash."""
    doc = load_charter(charter_path)
    payload = canonicalize_json(doc)
    
    # Verify hash
    expected_hash = doc["integrity"]["content_sha256"]
    actual_hash = compute_hash(payload)
    
    if expected_hash != actual_hash:
        print(f"Hash mismatch: expected {expected_hash}, got {actual_hash}")
        return False
    
    # Verify signature
    try:
        pubkey_b64 = doc["integrity"]["signature"]["public_key_base64"]
        sig_b64 = doc["integrity"]["signature"]["signature_base64"]
        
        verify_key = VerifyKey(base64.b64decode(pubkey_b64))
        verify_key.verify(payload, base64.b64decode(sig_b64))
        
        print("Charter verification successful")
        return True
    except BadSignatureError:
        print("Signature verification failed")
        return False
    except Exception as e:
        print(f"Verification error: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python sign-charter.py <charter.json> [keyfile] [--verify]")
        sys.exit(1)
    
    charter_path = sys.argv[1]
    keyfile = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
    verify_only = '--verify' in sys.argv
    
    if not Path(charter_path).exists():
        print(f"Charter file not found: {charter_path}")
        sys.exit(1)
    
    if verify_only:
        success = verify_charter(charter_path)
        sys.exit(0 if success else 1)
    
    # Sign the charter
    try:
        signed_doc = sign_charter(charter_path, keyfile)
        
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