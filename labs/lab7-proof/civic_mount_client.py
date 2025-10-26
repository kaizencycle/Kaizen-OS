#!/usr/bin/env python3
"""
Kaizen OS Boarding Client — verifies GI signature by fetching the manifests
exposed by Lab7's /api/civic/mount and hashing their contents.
"""
import hashlib
import json
import sys
import urllib.parse
import urllib.request

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

def get(url: str) -> bytes:
    """Fetch URL content as bytes."""
    with urllib.request.urlopen(url) as r:
        return r.read()

def sha256_hex(data: bytes) -> str:
    """Compute SHA256 hex digest."""
    return hashlib.sha256(data).hexdigest()

def join_url(base: str, path: str) -> str:
    """Join base URL with path, handling relative paths."""
    # path may be "./.civic/..." or "/.civic/..."
    path = path.replace("./", "", 1)
    return urllib.parse.urljoin(base if base.endswith("/") else base + "/", path)

def main():
    """Main boarding client logic."""
    print(f"🚀 Attempting to board Kaizen OS at {BASE_URL}")
    print("=" * 50)
    
    # Fetch mount endpoint
    try:
        mount_response = get(join_url(BASE_URL, "/api/civic/mount"))
        mount = json.loads(mount_response.decode("utf-8"))
    except Exception as e:
        print(f"❌ Failed to fetch mount endpoint: {e}")
        sys.exit(1)
    
    gi_sig = mount.get("gi_signature", "")
    manifests = mount.get("manifest_bundle", [])
    manifest_urls = mount.get("manifest_urls", [])
    cycle = mount.get("cycle", "C-???")
    message = mount.get("message", "")
    
    print(f"✅ Mounted Kaizen OS | cycle={cycle}")
    print(f"📋 Message: {message}")
    print(f"🔐 Reported GI signature: {gi_sig}")
    print()

    # Fetch manifests over HTTP and compute combined sha256
    h = hashlib.sha256()
    fetched = []
    
    print("📥 Fetching manifests:")
    for i, p in enumerate(manifests):
        # Use manifest_urls if available, otherwise construct URL
        url = manifest_urls[i] if i < len(manifest_urls) else join_url(BASE_URL, p)
        
        try:
            blob = get(url)
            h.update(blob)
            fetched.append((p, len(blob)))
            print(f"  ✅ {p} ({len(blob)} bytes)")
        except Exception as e:
            print(f"  ❌ Failed to fetch {p}: {e}")
            sys.exit(2)

    combined = "sha256:" + h.hexdigest()
    ok = (combined == gi_sig)
    
    print()
    print("🔍 Verification Results:")
    print(f"  Computed GI signature: {combined}")
    print(f"  Reported GI signature: {gi_sig}")
    print(f"  Status: {'✅ VERIFIED' if ok else '❌ MISMATCH'}")
    
    if ok:
        print()
        print("🎉 Successfully boarded Kaizen OS!")
        print("   You now have access to the civic manifests and can operate")
        print("   as a verified node in the Civic AI Collective.")
    else:
        print()
        print("⚠️  GI signature mismatch detected!")
        print("   This may indicate tampering or corruption.")
        print("   Please verify the integrity of the Kaizen OS instance.")
    
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
