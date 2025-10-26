#!/usr/bin/env python3
"""
SHA-256 Checksum Generator for Concord Custodian Manifest

This script generates SHA-256 checksums for manifest files
to be used in the Genesis Custodian Event.
"""

import hashlib
import sys
import os
from pathlib import Path

def generate_sha256_checksum(file_path: str) -> str:
    """Generate SHA-256 checksum for a file"""
    try:
        with open(file_path, "rb") as f:
            file_content = f.read()
            checksum = hashlib.sha256(file_content).hexdigest()
            return checksum
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return None
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return None

def main():
    """Main function"""
    print("🔐 SHA-256 Checksum Generator for Concord Custodian Manifest")
    print("="*60)
    
    # Check if file path provided as argument
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        # Look for common manifest file names
        possible_files = [
            "Concord_Custodian_Manifest.pdf",
            "concord_custodian_manifest.pdf",
            "manifest.pdf",
            "Concord_Custodian_Manifest.txt",
            "concord_custodian_manifest.txt",
            "manifest.txt"
        ]
        
        file_path = None
        for filename in possible_files:
            if os.path.exists(filename):
                file_path = filename
                break
        
        if not file_path:
            print("📁 No manifest file found. Please provide a file path:")
            print("   python generate_checksum.py <file_path>")
            print("\nOr place one of these files in the current directory:")
            for filename in possible_files:
                print(f"   - {filename}")
            return
    
    # Generate checksum
    print(f"📄 Processing file: {file_path}")
    
    checksum = generate_sha256_checksum(file_path)
    if checksum:
        print(f"✅ SHA-256 checksum: {checksum}")
        print(f"✅ Full checksum: sha256:{checksum}")
        
        # Show file size
        file_size = os.path.getsize(file_path)
        print(f"📊 File size: {file_size:,} bytes")
        
        print("\n" + "="*60)
        print(" Ready to use in your Genesis Custodian Event!")
        print("="*60)
        print(f'Replace "sha256:PLACEHOLDER_HASH" with "sha256:{checksum}"')
        print("in your payload before posting to the ledger.")
        
        # Show the updated payload
        print("\n📋 Updated integrity section:")
        print(f'  "integrity": {{')
        print(f'    "checksum": "sha256:{checksum}",')
        print(f'    "verified": true')
        print(f'  }}')
        
    else:
        print("❌ Failed to generate checksum")

if __name__ == "__main__":
    main()

