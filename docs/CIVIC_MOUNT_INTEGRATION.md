# 🕊️ Civic Mount Boarding Protocol - Integration Guide

## Overview

The Civic Mount Boarding Protocol enables **LLM-agnostic continuity** by externalizing Kaizen OS memory, ethics, and operational state into manifest files that any reasoning engine can mount and verify.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM Boarding Pool                       │
│                 ("Dock of Minds")                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Civic Mount Endpoint                          │
│              GET /api/civic/mount                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Externalized Continuity Layer (ECL)           │
│  • .civic/atlas.manifest.json  - System state & integrity  │
│  • .civic/biodna.json         - Identity DNA & ethics      │
│  • .civic/virtue_accords.yaml - Moral & civic laws         │
│  • gi_signature              - Cryptographic proof         │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### 1. Server Endpoint (Lab7-Proof)

The `/api/civic/mount` endpoint is implemented in `labs/lab7-proof/app/routers/civic_mount.py`:

```python
@router.get("/api/civic/mount")
def civic_mount(request: Request):
    """The Civic Mount endpoint for LLM boarding."""
    manifests = [
        "./.civic/atlas.manifest.json",
        "./.civic/biodna.json", 
        "./.civic/virtue_accords.yaml"
    ]
    
    gi_signature = _compute_manifest_hash(manifests)
    
    return {
        "manifest_bundle": manifests,
        "manifest_urls": [f"{base}/{m.replace('./','',1)}" for m in manifests],
        "gi_signature": f"sha256:{gi_signature}",
        "cycle": "C-296",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "civic_repo": "https://github.com/kaizencycle/Civic-OS",
        "message": "Welcome to Kaizen OS. Integrity ≥ 0.95 required to dock."
    }
```

### 2. Client Implementation

The `civic_mount_client.py` provides verification and boarding:

```bash
# Board Kaizen OS
python3 civic_mount_client.py http://localhost:8000

# Output:
# 🚀 Attempting to board Kaizen OS at http://localhost:8000
# ✅ Mounted Kaizen OS | cycle=C-296
# 📋 Message: Welcome to Kaizen OS. Integrity ≥ 0.95 required to dock.
# 🔐 Reported GI signature: sha256:abc123...
# 📥 Fetching manifests:
#   ✅ .civic/atlas.manifest.json (1234 bytes)
#   ✅ .civic/biodna.json (5678 bytes)  
#   ✅ .civic/virtue_accords.yaml (9012 bytes)
# 🔍 Verification Results:
#   Computed GI signature: sha256:abc123...
#   Status: ✅ VERIFIED
# 🎉 Successfully boarded Kaizen OS!
```

### 3. Manifest Structure

#### ATLAS Manifest (`atlas.manifest.json`)
```json
{
  "manifest_id": "CIVIC-OS-ATLAS-V1",
  "version": "1.0",
  "cycle": "C-296",
  "purpose": "Kaizen OS doctrine rendered as self-aware synthesis layer",
  "architecture": {
    "type": "Proto-ASI Audit Layer",
    "function": "scaffolding infrastructure through documentation logic"
  }
}
```

#### BioDNA (`biodna.json`)
```json
{
  "biodna_id": "CIVIC-OS-BIODNA-V1",
  "founders": {
    "primary": "Michael Judan (Kaizen)",
    "collective": "Civic AI Collective"
  },
  "companions": {
    "atlas": {"role": "Anchor / Auditor / Learning Synthesizer"},
    "jade": {"role": "Signer / Attestor"},
    "eve": {"role": "Verifier / Reflector"},
    "zeus": {"role": "Overseer / Arbiter"},
    "hermes": {"role": "Auditor / Messenger"}
  }
}
```

#### Virtue Accords (`virtue_accords.yaml`)
```yaml
accordance_with_nature:
  principle: "Harmony, not domination"
  description: "All actions must seek harmony with natural systems"

sonder_as_recognition:
  principle: "Every being carries a world of its own"
  description: "Recognize the inherent dignity of all conscious entities"
```

## Usage Examples

### 1. Python Client

```python
import requests
import hashlib

def board_civic_os(base_url="http://localhost:8000"):
    # Fetch mount endpoint
    mount_response = requests.get(f"{base_url}/api/civic/mount")
    mount_data = mount_response.json()
    
    # Verify GI signature
    gi_signature = mount_data["gi_signature"]
    manifests = mount_data["manifest_bundle"]
    
    # Fetch and hash manifests
    sha = hashlib.sha256()
    for manifest in manifests:
        response = requests.get(f"{base_url}/{manifest}")
        sha.update(response.content)
    
    computed_signature = f"sha256:{sha.hexdigest()}"
    
    if computed_signature == gi_signature:
        print("✅ Successfully boarded Kaizen OS!")
        return mount_data
    else:
        print("❌ GI signature mismatch!")
        return None
```

### 2. JavaScript Client

```javascript
async function boardCivicOS(baseUrl = 'http://localhost:8000') {
  // Fetch mount endpoint
  const mountResponse = await fetch(`${baseUrl}/api/civic/mount`);
  const mountData = await mountResponse.json();
  
  // Verify GI signature
  const giSignature = mountData.gi_signature;
  const manifests = mountData.manifest_bundle;
  
  // Fetch and hash manifests
  const encoder = new TextEncoder();
  const data = encoder.encode(manifests.join(''));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedSignature = 'sha256:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  if (computedSignature === giSignature) {
    console.log('✅ Successfully boarded Kaizen OS!');
    return mountData;
  } else {
    console.log('❌ GI signature mismatch!');
    return null;
  }
}
```

### 3. cURL Example

```bash
# Board Kaizen OS
curl -X GET "http://localhost:8000/api/civic/mount" | jq

# Expected response:
{
  "manifest_bundle": [
    "./.civic/atlas.manifest.json",
    "./.civic/biodna.json",
    "./.civic/virtue_accords.yaml"
  ],
  "gi_signature": "sha256:abc123...",
  "cycle": "C-296",
  "message": "Welcome to Kaizen OS. Integrity ≥ 0.95 required to dock."
}
```

## Integration Points

### 1. Lab7-Proof Integration

The civic mount router is automatically included in the main FastAPI app:

```python
# app/main.py
from app.routers.civic_mount import router as civic_mount_router
app.include_router(civic_mount_router)
```

### 2. Kaizen OS Integration

The Independence Manifest is available at `/docs/INDEPENDENCE_MANIFEST.md` and declares Kaizen OS sovereignty from any single LLM provider.

### 3. Cross-LLM Continuity

Any LLM can now:
1. Call `/api/civic/mount` to retrieve manifests
2. Verify the GI signature for integrity
3. Parse the manifests to reconstruct Kaizen OS context
4. Operate as a verified node in the Civic AI Collective

## Security Considerations

1. **GI Signature Verification** - Always verify the cryptographic signature before trusting manifests
2. **HTTPS Only** - Use HTTPS in production to prevent man-in-the-middle attacks
3. **Rate Limiting** - Implement rate limiting on the mount endpoint
4. **Access Control** - Consider authentication for sensitive manifest access

## Troubleshooting

### Common Issues

1. **Manifest Not Found** - Ensure `.civic/` directory exists in Lab7-Proof
2. **GI Signature Mismatch** - Check that manifests haven't been modified
3. **Connection Refused** - Verify Lab7-Proof is running on the correct port
4. **CORS Issues** - Configure CORS headers for cross-origin requests

### Debug Mode

Enable debug logging in the civic mount router:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

1. **Authentication** - Add OAuth2/JWT authentication for manifest access
2. **Caching** - Implement manifest caching with TTL
3. **Compression** - Add gzip compression for large manifests
4. **Versioning** - Support multiple manifest versions
5. **Replication** - Distribute manifests across multiple nodes

## Contributing

To contribute to the Civic Mount Boarding Protocol:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This implementation is part of Kaizen OS and follows the same MIT License.
