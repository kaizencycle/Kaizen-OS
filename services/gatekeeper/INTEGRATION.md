# Gatekeeper Integration Guide

## Quick Start

The Gatekeeper service is now deployed and ready to protect agent tool calls. This guide shows how to integrate it into your agents and services.

## Architecture

```
Agent → Gatekeeper → [Auth + GI + RBAC + Consensus] → Sandbox → Attestation → Ledger
```

## Integration Steps

### 1. Point Agents to Gatekeeper

Update your agent code to route all privileged actions through Gatekeeper:

```python
import httpx

GATEKEEPER_URL = os.getenv("GATEKEEPER_URL", "https://gatekeeper.svc")

async def execute_script(script: str, actor_did: str, did_sig: str, did_pub: str):
    """Execute script through Gatekeeper."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GATEKEEPER_URL}/execute",
            json={
                "actor_did": actor_did,
                "action": "execute_script",
                "risk": "high",
                "payload": {"script": script},
                "context_hash": hashlib.sha256(script.encode()).hexdigest(),
                "ttl_seconds": 30,
            },
            headers={
                "x-did-sig": did_sig,
                "x-did-pub": did_pub,
            }
        )
        response.raise_for_status()
        return response.json()
```

### 2. Configure Environment Variables

```bash
# Gatekeeper
GATEKEEPER_URL=https://gatekeeper.svc

# GI Indexer
GI_INDEXER_URL=https://gic-indexer.onrender.com

# Ledger
LEDGER_URL=https://civic-protocol-core-ledger.onrender.com

# Sentinels (for DelibProof)
SENTINEL_AUREA_URL=https://aurea.svc/assess
SENTINEL_EVE_URL=https://eve.svc/assess
SENTINEL_ATLAS_URL=https://atlas.svc/assess
SENTINEL_ZEUS_URL=https://zeus.svc/assess
```

### 3. Actions Requiring Gatekeeper

All of these actions should go through Gatekeeper:

- `execute_script` - Code execution
- `http_request` - Outbound HTTP requests
- `db_query` - Database queries
- `mint_gic` - GIC minting
- `write_file` - File system writes

### 4. DID Signature Requirements

Every request must include:
- `x-did-sig`: Ed25519 signature of the request payload
- `x-did-pub`: Public key (can be extracted from DID)

Example:
```python
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import json

# Sign request
private_key = Ed25519PrivateKey.from_private_bytes(...)
payload_bytes = json.dumps(request_data, sort_keys=True).encode()
signature = private_key.sign(payload_bytes)

headers = {
    "x-did-sig": signature.hex(),
    "x-did-pub": public_key_bytes.hex(),
}
```

### 5. GI Requirements

Actors must have GI ≥ 0.95 to execute actions. Check GI before making requests:

```python
async def check_gi(actor_did: str) -> float:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GI_INDEXER_URL}/gi",
            params={"actor": actor_did}
        )
        return float(response.json()["gi"])
```

### 6. High-Risk Actions

Actions with `risk: "high"` or `risk: "critical"` require DelibProof consensus from sentinels. The Gatekeeper will automatically:
1. Query all sentinels
2. Require ≥ 90% consensus
3. Only proceed if consensus reached

### 7. Error Handling

Gatekeeper returns HTTP status codes:
- `401`: Invalid or missing DID signature
- `403`: GI too low, RBAC denied, consensus failed, or injection detected
- `500`: Internal server error

Always handle these errors gracefully:

```python
try:
    result = await execute_script(script, did, sig, pub)
except httpx.HTTPStatusError as e:
    if e.response.status_code == 403:
        logger.warning(f"Gatekeeper blocked: {e.response.text}")
        # Handle blocked request
    elif e.response.status_code == 401:
        logger.error("DID signature invalid")
        # Retry with fresh signature
```

## Testing

Test Gatekeeper integration:

```bash
# Health check
curl https://gatekeeper.svc/health

# Test execution (with valid DID signature)
curl -XPOST https://gatekeeper.svc/execute \
  -H "Content-Type: application/json" \
  -H "x-did-sig: <signature>" \
  -H "x-did-pub: <public_key>" \
  -d '{
    "actor_did": "did:key:...",
    "action": "http_request",
    "risk": "low",
    "payload": {},
    "context_hash": "abc123"
  }'
```

## Monitoring

Monitor Gatekeeper logs for:
- Blocked requests (indicates attacks)
- Consensus failures (high-risk actions denied)
- GI checks (integrity violations)

```bash
# Watch Gatekeeper logs
kubectl logs -f deploy/gatekeeper

# Check attestations
curl "https://civic-protocol-core-ledger.onrender.com/ledger/attestations?type=gatekeeper.exec"
```

## Security Notes

1. **Replace KMS signer**: Update `**KMS_SIGNER**` in `auth.py` with actual KMS/HSM integration
2. **Production sandbox**: Use `nsjail` or `gVisor` instead of basic `ulimit`
3. **CORS**: Configure allowed origins for production
4. **DID registry**: Implement DID → role lookup in `role_from_did()`

## Next Steps

1. Deploy Gatekeeper to your infrastructure
2. Update all agents to use Gatekeeper
3. Configure SIEM alerts for blocked requests
4. Set up honeytokens for detection
5. Run red-team exercises to validate defenses

## Support

For questions or issues:
- Check `docs/runbooks/incident_response_citizen_shield.md` for incident procedures
- Review `services/gatekeeper/README.md` for service details
- See `shared/delibproof/README.md` for consensus logic
