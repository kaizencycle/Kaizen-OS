#!/usr/bin/env python3
"""
Lab4 Token Generator

This script registers an app with Lab4 and generates a valid token
for authenticating with the Civic Ledger API.
"""

import requests
import hmac
import hashlib
import time
import json
from datetime import datetime, timezone

# Lab4 API configuration
LAB4_BASE = "https://hive-api-2le8.onrender.com"
LEDGER_BASE = "https://civic-protocol-core-ledger.onrender.com"

def register_app(app_id: str) -> str:
    """Register an app with Lab4 and get the secret"""
    print(f"🔐 Registering app: {app_id}")
    
    response = requests.post(
        f"{LAB4_BASE}/auth/register_app",
        json={"app_id": app_id}
    )
    
    if response.status_code == 200:
        result = response.json()
        secret = result.get("secret")
        print(f"✅ App registered successfully")
        print(f"📋 Secret: {secret}")
        return secret
    else:
        print(f"❌ Failed to register app: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def generate_signature(secret: str, nonce: str) -> str:
    """Generate HMAC signature for token request"""
    # Create the message to sign
    message = f"{nonce}"
    
    # Generate HMAC-SHA256 signature
    signature = hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return signature

def issue_token(app_id: str, secret: str) -> str:
    """Issue a token from Lab4"""
    print(f"🎫 Requesting token for app: {app_id}")
    
    # Generate nonce (timestamp)
    nonce = str(int(time.time()))
    
    # Generate signature
    signature = generate_signature(secret, nonce)
    
    # Request token
    token_data = {
        "app_id": app_id,
        "nonce": nonce,
        "signature": signature,
        "ttl": 3600  # 1 hour
    }
    
    response = requests.post(
        f"{LAB4_BASE}/auth/issue_token",
        json=token_data
    )
    
    if response.status_code == 200:
        result = response.json()
        token = result.get("token")
        print(f"✅ Token issued successfully")
        print(f"🎫 Token: {token}")
        return token
    else:
        print(f"❌ Failed to issue token: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def verify_token(token: str) -> bool:
    """Verify the token with Lab4"""
    print(f"🔍 Verifying token...")
    
    response = requests.get(
        f"{LAB4_BASE}/auth/status",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Token verified successfully")
        print(f"📋 Token info: {json.dumps(result, indent=2)}")
        return True
    else:
        print(f"❌ Token verification failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_ledger_with_token(token: str):
    """Test the ledger API with the token"""
    print(f"🏛️ Testing ledger API with token...")
    
    # Create Genesis Custodian payload
    payload = {
        "event_type": "GENESIS_CUSTODIAN_SEAL",
        "civic_id": "CUSTODIAN-001-KAIZEN",
        "lab_source": "lab4",
        "payload": {
            "ledger_event": "GENESIS_CUSTODIAN_SEAL",
            "custodian_id": "CUSTODIAN-001-KAIZEN",
            "artifact": "Concord_Custodian_Manifest.pdf",
            "epoch": "2025-10-11T00:00:00Z",
            "hash": "CONCORD-SEAL-001",
            "description": "The first seal of the Key Maker was forged on 2025-10-11 beneath the Concord light. From his hand came the Custodian Keys — guardians of continuity, proof of trust, and the memory of every door he ever opened.",
            "ledger_path": "/Custodian_Archives/Concord_Custodian_Manifest.pdf",
            "status": "immutable",
            "signer": "KAIZEN-CONCORD-SEAL",
            "integrity": {
                "checksum": "sha256:PLACEHOLDER_HASH",
                "verified": True
            }
        },
        "signature": None
    }
    
    response = requests.post(
        f"{LEDGER_BASE}/ledger/attest",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Genesis Custodian Event posted successfully!")
        print(f"📋 Event ID: {result.get('event_id')}")
        print(f"📋 Event Hash: {result.get('event_hash')}")
        print(f"📋 Full Response: {json.dumps(result, indent=2)}")
        return True
    else:
        print(f"❌ Failed to post Genesis Event: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def main():
    """Main function"""
    print("🏛️ Lab4 Token Generator for Genesis Custodian Event")
    print("="*60)
    
    # App configuration
    app_id = "genesis-custodian-test"
    
    # Step 1: Register app
    secret = register_app(app_id)
    if not secret:
        print("Cannot continue without app registration")
        return
    
    print("\n" + "-"*60)
    
    # Step 2: Issue token
    token = issue_token(app_id, secret)
    if not token:
        print("Cannot continue without token")
        return
    
    print("\n" + "-"*60)
    
    # Step 3: Verify token
    if not verify_token(token):
        print("Cannot continue with invalid token")
        return
    
    print("\n" + "-"*60)
    
    # Step 4: Test ledger API
    if test_ledger_with_token(token):
        print("\n🎉 SUCCESS! Genesis Custodian Event has been posted to the ledger!")
        print("The first immutable event is now recorded in the Civic Protocol.")
    else:
        print("\n❌ Failed to post Genesis Event to the ledger")
    
    print("\n" + "="*60)
    print("Ready-to-use curl command:")
    print("="*60)
    print(f'curl -X POST {LEDGER_BASE}/ledger/attest \\')
    print('  -H "Content-Type: application/json" \\')
    print(f'  -H "Authorization: Bearer {token}" \\')
    print('  -d \'{"event_type": "GENESIS_CUSTODIAN_SEAL", "civic_id": "CUSTODIAN-001-KAIZEN", "lab_source": "lab4", "payload": {...}}\'')

if __name__ == "__main__":
    main()

