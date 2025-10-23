#!/usr/bin/env python3
"""
Lab7 OAA Key Rotation Script
Generates new Ed25519 keypair and archives the old one
"""

import os
import json
import base64
from pathlib import Path
from datetime import datetime
from nacl import signing

def generate_keypair():
    """Generate a new Ed25519 keypair"""
    sk = signing.SigningKey.generate()
    priv_b64 = base64.b64encode(sk.encode()).decode()
    pub_b64 = base64.b64encode(sk.verify_key.encode()).decode()
    return priv_b64, pub_b64

def archive_old_key():
    """Archive the current key before rotation"""
    archive_path = Path("data/keys.json")
    archive_path.parent.mkdir(exist_ok=True)
    
    # Load existing archive
    archive = []
    if archive_path.exists():
        try:
            archive = json.loads(archive_path.read_text())
        except json.JSONDecodeError:
            archive = []
    
    # Get current key from environment
    current_priv = os.getenv("OAA_ED25519_PRIVATE_B64")
    current_pub = os.getenv("OAA_ED25519_PUBLIC_B64")
    current_kid = os.getenv("OAA_SIGNING_VERSION", "oaa:ed25519:v1")
    current_created = os.getenv("OAA_SIGNING_CREATED", "")
    
    if current_pub:
        old_key = {
            "kty": "OKP",
            "crv": "Ed25519",
            "kid": current_kid,
            "x": current_pub,
            "created": current_created,
            "issuer": "oaa.lab7",
            "archived_at": datetime.utcnow().isoformat() + "Z"
        }
        archive.insert(0, old_key)  # Most recent first
        archive_path.write_text(json.dumps(archive, indent=2))
        print(f"[✓] Archived old key to {archive_path}")
    else:
        print("[!] No current key found in environment")

def write_new_keys(priv_b64, pub_b64):
    """Write new keys to .env.rotate file"""
    now = datetime.utcnow()
    kid = f"oaa:ed25519:v{now.strftime('%Y%m%d')}"
    created = now.isoformat() + "Z"
    
    env_content = f"""# Lab7 OAA Keys - Generated {now.isoformat()}
OAA_ED25519_PRIVATE_B64={priv_b64}
OAA_ED25519_PUBLIC_B64={pub_b64}
OAA_SIGNING_VERSION={kid}
OAA_SIGNING_CREATED={created}
OAA_ISSUER=oaa.lab7
OAA_VERIFY_PIN_KEYS=true
OAA_VERIFY_TS_WINDOW_MIN=10
OAA_VERIFY_REQUIRE_NONCE=false
LEDGER_URL=https://civic-protocol-core-ledger.onrender.com
"""
    
    env_file = Path(".env.rotate")
    env_file.write_text(env_content)
    print(f"[✓] New keys written to {env_file}")
    
    return kid, created

def main():
    """Main rotation process"""
    print("🔄 Starting Lab7 OAA key rotation...")
    
    # Archive current key
    archive_old_key()
    
    # Generate new keypair
    print("🔐 Generating new Ed25519 keypair...")
    priv_b64, pub_b64 = generate_keypair()
    
    # Write new keys
    kid, created = write_new_keys(priv_b64, pub_b64)
    
    print(f"✅ Key rotation complete!")
    print(f"   New Key ID: {kid}")
    print(f"   Created: {created}")
    print(f"   Private Key: {priv_b64[:20]}...")
    print(f"   Public Key: {pub_b64[:20]}...")
    
    print("\n📋 Next steps:")
    print("1. Update Render environment variables with new keys")
    print("2. Redeploy Lab7 service")
    print("3. Verify /.well-known/oaa-keys.json shows new key")
    print("4. Test attestation with new key")

if __name__ == "__main__":
    main()
