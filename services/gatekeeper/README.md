# Gatekeeper Service

Security gatekeeper for agent tool calls in Kaizen OS Citizen Shield (Lab 6).

## Purpose

Single choke-point for any agent → tool call. Enforces:
- DID signature verification
- GI (Global Integrity) floor checks (≥ 0.95)
- DelibProof consensus for high-risk actions
- Sandboxed execution
- RBAC (Role-Based Access Control)
- Injection detection
- Immutable attestations to Civic Ledger

## Architecture

```
Agent → Gatekeeper → [Auth + GI + RBAC + Consensus] → Sandbox → Attestation → Ledger
```

## Quick Start

```bash
# Install dependencies
pip install -e .

# Run locally
uvicorn src.app:app --host 0.0.0.0 --port 8080 --reload

# Or with Docker
docker-compose up
```

## Environment Variables

```bash
GI_FLOOR=0.95                    # Minimum GI score required
GI_INDEXER_URL=https://...        # GIC Indexer endpoint
LEDGER_URL=https://...            # Civic Ledger endpoint
SENTINEL_AUREA_URL=https://...    # Sentinel endpoints
SENTINEL_EVE_URL=https://...
SENTINEL_ATLAS_URL=https://...
SENTINEL_ZEUS_URL=https://...
```

## API Endpoints

- `POST /execute` - Execute a privileged action
- `GET /health` - Health check
- `POST /revoke` - Revoke tokens (admin)

## Testing

```bash
pytest tests/
```

## Security Notes

- Replace `**KMS_SIGNER**` in `auth.py` with actual KMS/HSM integration
- Use `nsjail` or `gVisor` for production sandboxing instead of basic `ulimit`
- Configure CORS origins appropriately for production
- Implement DID registry lookup in `role_from_did()`

## Integration

Point all agents (DVA, OAA, Reflections workers) to call Gatekeeper for:
- `execute_script` - Code execution
- `http_request` - Outbound HTTP
- `db_query` - Database queries
- `mint_gic` - GIC minting
- `write_file` - File system writes
