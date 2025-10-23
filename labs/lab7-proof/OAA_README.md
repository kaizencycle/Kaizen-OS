# OAA: Agents Neural Network

A comprehensive source validation, scoring, and attestation system for Lab7. This module provides:

- **Source Ingestion**: Pull and normalize API sources from URLs or inline payloads
- **Intelligent Scoring**: Multi-dimensional scoring (provenance, permission, freshness, quality, safety, reputation)
- **Policy Engine**: YAML-based rules for pass/deny/review decisions
- **Reputation System**: GIC-staked voting with cryptographic attestation
- **Ledger Integration**: Optional anchoring to Civic Ledger for tamper-evident records
- **Verification Tools**: Browser UI, TypeScript library, and CLI for attestation verification

## Quick Start

### 1. Install Dependencies

```bash
pip install -r services/orchestrator/requirements.txt
```

### 2. Generate Ed25519 Keys

```python
from nacl import signing
import base64
sk = signing.SigningKey.generate()
priv_b64 = base64.b64encode(sk.encode()).decode()
pub_b64 = base64.b64encode(sk.verify_key.encode()).decode()
print(f"OAA_ED25519_PRIVATE_B64={priv_b64}")
print(f"OAA_ED25519_PUBLIC_B64={pub_b64}")
```

### 3. Configure Environment

Copy `oaa.env.example` to `.env` and fill in your values:

```bash
cp oaa.env.example .env
```

### 4. Mount Router

Add to your main FastAPI app:

```python
from app.routers.oaa import router as oaa_router
app.include_router(oaa_router)

# Set admin token
oaa_router.ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
```

## API Endpoints

### Core OAA

- `POST /oaa/ingest/snapshot` - Ingest sources from URL or inline
- `POST /oaa/filter` - Score and apply policy to a single source
- `GET /oaa/sources` - List approved sources with scores
- `GET /.well-known/oaa-keys.json` - Public key registry

### Reputation & Attestation

- `POST /oaa/repute/vote` - Cast GIC-staked reputation vote
- `POST /oaa/verify` - Verify attestation signatures
- `GET /oaa/state/snapshot` - Get current state snapshot
- `POST /oaa/state/anchor` - Sign and anchor state to ledger

### Admin

- `POST /oaa/cron/daily` - Trigger daily state anchoring
- `GET /oaa/_health/redis` - Redis health check

## Example Usage

### Ingest Sources

```bash
curl -X POST "$API/oaa/ingest/snapshot" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{
    "origin":"seed",
    "sources":[
      {
        "id":"src:open-meteo",
        "name":"Open-Meteo",
        "domain":"open-meteo.com",
        "category":["weather"],
        "auth":"none",
        "license":"MIT",
        "endpoints":[{"path":"/forecast","method":"GET","schema":"ForecastV1"}],
        "meta":{"rate_limit":"100/min","reputation":"0.78"},
        "last_update":"2025-09-20T00:00:00Z",
        "tags":[]
      }
    ]
  }'
```

### Cast Reputation Vote

```bash
curl -X POST "$API/oaa/repute/vote" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id":"src:open-meteo",
    "voter_id":"citizen:kaizen",
    "stake_gic":25.0,
    "opinion":"up",
    "comment":"Open data, reliable."
  }'
```

### Verify Attestation

```bash
curl -X POST "$API/oaa/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "attestation": {
      "content": {...},
      "content_hash": "sha256:...",
      "signature": "ed25519:...",
      "public_key_b64": "..."
    }
  }'
```

## Verification Tools

### Browser UI

Open `verify.html` in your browser to verify attestations with a user-friendly interface.

### TypeScript Library

```typescript
import { verifyAttestation, fetchOAAKeyset } from './oaa-verify';

const result = verifyAttestation(attestation);
console.log(result); // { ok: true, recomputed_hash: "..." }
```

### CLI Tool

```bash
# Install
npm install
npm link

# Verify
oaa-verify attestation.json
oaa-verify attestation.json --keyset https://your-api.com
```

## Scoring Dimensions

- **Provenance** (20%): Domain, owner, endpoints presence
- **Permission** (15%): Open license compatibility
- **Freshness** (15%): Recency of last update
- **Quality** (20%): Schema docs, rate limits, uptime
- **Safety** (20%): Tag-based safety checks
- **Reputation** (10%): Community voting with GIC stakes

## Policy Rules

Configure in `app/routers/oaa/default_policy.yaml`:

```yaml
rules:
  - id: allow-open-licensed
    when: "license in {'MIT','APACHE-2.0','BSD-3-CLAUSE','CC-BY-4.0','CC0'}"
    effect: pass
  - id: block-pii-leak
    when: "has_pii_leak or ('pii' in meta and float(meta.get('pii','0')) > 0.2)"
    effect: deny
```

## Security Features

- **Ed25519 Signatures**: Cryptographically secure attestations
- **Key Rotation**: Support for multiple signing keys
- **Nonce Replay Defense**: Redis-based replay protection
- **Timestamp Windows**: Configurable freshness checks
- **Key Pinning**: Enforce known signers via well-known keyset

## Integration

### With Civic Ledger

Set `LEDGER_URL` environment variable to automatically anchor attestations:

```bash
LEDGER_URL=https://civic-protocol-core-ledger.onrender.com
```

### With Redis

For production nonce replay defense:

```bash
OAA_NONCE_REDIS_URL=redis://default:password@localhost:6379/0
```

## Development

### Running Tests

```bash
# Test ingestion
curl -X POST "http://localhost:8000/oaa/ingest/snapshot" \
  -H "x-admin-token: test" \
  -d '{"sources":[{"id":"test","name":"Test","domain":"test.com"}]}'

# Test verification
curl -X POST "http://localhost:8000/oaa/verify" \
  -d '{"attestation": {...}}'
```

### Key Management

1. Generate new keypair
2. Add old public key to `OAA_ED25519_PUBLIC_B64_LEGACY`
3. Update `OAA_ED25519_PRIVATE_B64` and `OAA_ED25519_PUBLIC_B64`
4. Deploy and test
5. Remove old key from legacy list after migration period

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Sources       │───▶│   OAA Scoring    │───▶│   Policy        │
│   (APIs, etc)   │    │   Engine         │    │   Engine        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Reputation    │◀───│   Ed25519        │───▶│   Civic         │
│   System        │    │   Attestation    │    │   Ledger        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

This OAA module provides a complete trust infrastructure for your AI agents, ensuring they only use verified, high-quality API sources while maintaining cryptographic proof of all decisions.
