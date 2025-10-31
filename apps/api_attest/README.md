# Kaizen Attest API

FastAPI service for Truth Rail attestations—federated fact-checking with cryptographic provenance.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn main:app --host 0.0.0.0 --port 8082 --reload

# Or use monorepo script
npm run dev:attest
```

## API

### POST /attest

Attest media with provenance data.

**Request:**
```json
{
  "media_hash": "sha256-hex-string",
  "c2pa": true,
  "watermark_ok": true,
  "declared_synthetic": false,
  "creator_did": "did:key:z6Mk...",
  "osint_refs": [{"source": "ap-wire", "url": "https://...", "note": "event footage"}],
  "delib_votes": []
}
```

**Response:**
```json
{
  "type": "media.attestation/v1",
  "hash": "...",
  "c2pa": true,
  "watermark": "ok",
  "declared": false,
  "consensus": {
    "agreement": 0.75,
    "votes": 3,
    "label": "authentic",
    "rationale": ["heuristic: provenance present"]
  },
  "gi_effect": 0.008,
  "creator_did": "did:key:...",
  "timestamp": "2025-10-30T...Z",
  "osint_refs": []
}
```

### GET /healthz

Health check endpoint.

## Labels

- `authentic` — Proven provenance (C2PA/watermark present, not declared synthetic)
- `synthetic_declared` — Synthetic content with honest disclosure
- `synthetic_undeclared` — Synthetic content without disclosure
- `indeterminate` — Insufficient evidence

## GI Effect

The `gi_effect` field indicates the micro-delta for the creator's Global Integrity score:
- Positive for authentic or declared synthetic with provenance
- Negative for undeclared synthetic content

## Deployment

See `README_RENDER.md` at repo root for Render deployment instructions.

