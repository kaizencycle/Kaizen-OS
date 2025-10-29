# 🧩 Kaizen OS Federation Protocol Brief

**Civic AI interoperability for a decentralized intelligence commons.**

---

## 1. Mission

To make every Kaizen-compatible node — whether a personal DVA, institutional validator, or partner app — able to speak one shared **Civic Protocol**.

> *"Federation is freedom with rules."* — AUREA

---

## 2. Stack Overview

| Layer | Component | Purpose |
|--------|------------|----------|
| **Application** | DVA · OAA · Citizen Shield | Human-facing interfaces |
| **Federation** | Codex Router API | Multi-provider model routing + attestation |
| **Ledger** | Civic Ledger Core | Proof-of-Integrity + governance |
| **Consensus** | DPoI (Delegated Proof of Integrity) | Network-level agreement |
| **Storage** | OAA Library (IPFS) | Knowledge & model commons |

---

## 3. Codex API Specification

**Base Path:** `/codex/v1/`

### Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/inference` | Submit a prompt packet for routed LLM inference |
| `GET` | `/providers` | Return available model providers + cost/perf metrics |
| `POST` | `/attest` | Record attestation result (GI, agreement, cost) |
| `GET` | `/ledger/:txId` | Retrieve integrity proof for any interaction |
| `POST` | `/federate` | Register a new node into the Federation mesh |

---

### Example: POST /inference

**Request:**
```json
{
  "agentId": "AUREA",
  "task": "text.generate",
  "input": "Summarize civic ledger principles",
  "context": {
    "policy": "Integrity-first",
    "domain": "governance"
  },
  "routerPolicy": "AUTO",
  "maxCostGIC": 100,
  "minGI": 0.95
}
```

**Response:**
```json
{
  "output": "The Civic Ledger binds AI outputs to human accountability through cryptographic attestation and governance integrity scoring.",
  "metadata": {
    "cost_tokens": 742,
    "cost_gic": 15,
    "provider": "Anthropic",
    "model": "claude-opus-4",
    "latency_ms": 2847
  },
  "attestation": {
    "gi": 0.993,
    "agreement": 0.91,
    "models_consulted": ["claude", "gpt4", "local"],
    "signature": "0xabc123...",
    "epoch": "C-119"
  },
  "proof": "ledger://0xAUREA-C119-001"
}
```

---

## 4. Attestation Schema (GI Proof)

Every significant AI interaction produces an **attestation record** stored on the Civic Ledger.

### Schema

```json
{
  "$schema": "https://kaizenos.org/schema/gi-attestation.json",
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "description": "DID of the agent making the attestation"
    },
    "agreement": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Cross-model agreement score"
    },
    "gi": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Governance Integrity score"
    },
    "cost": {
      "type": "number",
      "description": "Cost in GIC tokens"
    },
    "epoch": {
      "type": "string",
      "description": "Epoch identifier (e.g., C-119)"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "signature": {
      "type": "string",
      "description": "Ed25519 signature (base64)"
    },
    "models": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Models consulted for this attestation"
    }
  },
  "required": ["agentId", "agreement", "gi", "signature", "timestamp"]
}
```

### Canonical Signing Format

To verify an attestation signature:

1. **Extract canonical fields** (excluding `signature`):
   ```json
   {
     "agentId": "AUREA",
     "agreement": 0.971,
     "gi": 0.995,
     "cost": 1321,
     "ts": "2025-10-29T12:03:00Z"
   }
   ```

2. **Hash with SHA-256**:
   ```javascript
   const canon = createHash('sha256')
     .update(JSON.stringify(payload), 'utf8')
     .digest();
   ```

3. **Verify Ed25519 signature**:
   ```javascript
   const valid = await ed25519.verify(signature, canon, publicKey);
   ```

---

## 5. Data Portability

Every user can export their complete state and move to any compatible node.

### Export

```bash
# Full export (ledger + data + config)
kaizen export --format tar.gz --include-ledger --include-reflections --include-oaa

# Output: kaizen-export-2025-10-29.tar.gz
```

### Import

```bash
# Import on new node
kaizen import --from kaizen-export-2025-10-29.tar.gz

# Verify integrity
kaizen verify --check-signatures --check-gi
```

**All ledger proofs remain valid** because attestation signatures are cryptographically verifiable globally — no central authority required.

---

## 6. Federation Discovery

### Protocol: `fedp://`

Kaizen nodes discover each other using:
- **DHT** (Distributed Hash Table)
- **mDNS** (multicast DNS for local networks)
- **Bootstrap nodes** (seed list)

### Node Advertisement

Each node announces:
```json
{
  "nodeId": "did:kaizen:node:abc123",
  "services": ["ledger", "codex", "oaa"],
  "giScore": 0.993,
  "availability": 0.9987,
  "role": "validator",
  "region": "US-EAST",
  "endpoints": {
    "codex": "https://node.kaizen.os:4000",
    "ledger": "https://node.kaizen.os:4001"
  }
}
```

### Peering

```bash
# Add trusted peer
kaizen federate peer add fedp://aurea.kaizen.os:4001

# List peers
kaizen federate peers list

# Check connectivity
kaizen federate ping fedp://aurea.kaizen.os:4001
```

---

## 7. Governance Model

### Delegated Proof of Integrity (DPoI)

- **Validators** must maintain GI ≥ 0.95
- **Voting weight** = `GI × tenure × reputation`
- **Proposals** require 60% supermajority
- **Attestation weighting** prevents Sybil attacks

### Governance Process

1. **Proposal** submitted to Cathedral (governance dapp)
2. **Deliberation** period (30 days)
3. **Voting** by GIC holders (quadratic voting)
4. **Execution** if threshold met
5. **Attestation** logged to Civic Ledger

### Example Proposal

```json
{
  "proposalId": "GIP-042",
  "title": "Increase Pro tier GIC allocation to 150/month",
  "type": "parameter_change",
  "changes": {
    "config.pro_gic_monthly": { "from": 100, "to": 150 }
  },
  "rationale": "Market research shows increased demand...",
  "votes": {
    "yes": 7234567,
    "no": 1234567,
    "abstain": 234567
  },
  "status": "passed",
  "gi_weighted_outcome": 0.87
}
```

---

## 8. Security & Privacy

### Transport Security

- **TLS 1.3** or **QUIC** for all federation traffic
- **Optional Tor/I2P** routing for privacy-maximalist nodes
- **Zero-Knowledge proofs** for private federations

### Attestation Heartbeat

Every node performs **integrity checks every 6 hours**:
- Verify ledger continuity
- Check peer GI scores
- Validate recent attestations
- Report anomalies

### Privacy Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Public** | All attestations public | Default for transparency |
| **Pseudonymous** | Hashed DIDs | Sensitive queries |
| **Private** | Zero-knowledge proofs | Medical, legal, financial |
| **Air-gap** | No federation | Maximum privacy |

---

## 9. Developer Toolkit

### CLI Tools

| Tool | Description |
|------|-------------|
| `kaizen-keys` | Generate Ed25519 keypairs |
| `kaizen-sign` | Sign attestations |
| `kaizen-verify` | Verify attestation signatures |
| `kaizen-cli` | Full node management |
| `kaizen-router` | Local inference router |
| `kaizen-ledger` | Ledger client/validator |
| `kaizen-federate` | Federation mesh tools |

### SDKs (Coming Soon)

- **Python**: `pip install kaizen-sdk`
- **JavaScript**: `npm install @kaizen/sdk`
- **Rust**: `cargo add kaizen-sdk`

### Example: Sign an attestation

```bash
# Generate keys
kaizen-keys
# => public_key_b64: ...
# => secret_key_b64: ...

# Create payload
cat > payload.json <<EOF
{
  "agentId": "AUREA",
  "agreement": 0.971,
  "gi": 0.995,
  "cost": 1321,
  "ts": "2025-10-29T12:03:00Z"
}
EOF

# Sign
kaizen-sign --secret $SECRET_B64 --file payload.json > signed.json

# Verify
kaizen-verify --public $PUBLIC_B64 --file signed.json
# => OK: signature is valid.
```

---

## 10. API Gateway

For developers building on Kaizen OS:

**Base URL:** `https://api.kaizen.os/v1/`

### Authentication

```bash
# Get API key
curl -X POST https://api.kaizen.os/v1/auth/apikey \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"name": "My App", "scopes": ["inference", "ledger:read"]}'

# Use API key
curl https://api.kaizen.os/v1/codex/inference \
  -H "X-API-Key: $API_KEY" \
  -d '{"input": "...", "routerPolicy": "AUTO"}'
```

### Rate Limits

| Tier | Requests/min | Cost |
|------|--------------|------|
| **Free** | 10 | 0 GIC |
| **Pro** | 100 | 100 GIC/month |
| **Enterprise** | Unlimited | Custom |

---

## 11. Roadmap

| Phase | Feature | Target |
|-------|---------|--------|
| **v1.0** | Codex Router REST + Ledger hooks | Q4 2025 |
| **v1.1** | GraphQL gateway + WebSocket stream | Q1 2026 |
| **v1.2** | Federated learning pipeline | Q2 2026 |
| **v1.3** | DAO-level governance hooks | Q3 2026 |
| **v2.0** | Full ZK-SNARK privacy layer | Q4 2026 |

---

## 12. Reference Implementations

### Minimal Node

```javascript
const { KaizenNode } = require('@kaizen/sdk');

const node = new KaizenNode({
  mode: 'local-only',
  ledger: { type: 'sqlite', path: './data/ledger.db' },
  models: ['llama3.3']
});

await node.start();

const result = await node.inference({
  input: "Explain federated AI",
  minGI: 0.95
});

console.log(result.output);
console.log(result.attestation.gi); // 0.993
```

### Validator Node

```javascript
const validator = new KaizenNode({
  mode: 'federated',
  role: 'validator',
  federation: {
    bootstrap: ['fedp://aurea.kaizen.os:4001'],
    announce: true
  }
});

validator.on('attestation', async (attest) => {
  if (attest.gi < 0.95) {
    await validator.report('low-gi-detected', attest);
  }
});

await validator.start();
```

---

## 13. Compliance & Standards

### Compatible With

- ✅ **W3C DID** (Decentralized Identifiers)
- ✅ **W3C VC** (Verifiable Credentials)
- ✅ **OAuth 2.0 / OIDC**
- ✅ **JSON-LD** (Linked Data)
- ✅ **IPFS** (Content addressing)

### Certifications (Planned)

- SOC 2 Type II
- ISO 27001
- GDPR compliance
- HIPAA-ready infrastructure

---

## 14. Community Resources

- **Protocol Spec**: https://spec.kaizen.os
- **API Docs**: https://docs.kaizen.os/api
- **GitHub**: https://github.com/kaizencycle/Kaizen-OS
- **Discord**: #federation channel
- **Forum**: https://forum.kaizen.os/c/federation

---

> *"Interoperability is the Constitution of digital civilization."*
> — ATLAS, Federation Charter Draft 2025

---

## Quick Reference

### Essential URLs

| Service | URL |
|---------|-----|
| **API Gateway** | `https://api.kaizen.os/v1/` |
| **Federation Bootstrap** | `fedp://bootstrap.kaizen.os:4001` |
| **Ledger Explorer** | `https://ledger.kaizen.os` |
| **OAA Library** | `ipfs://Qm.../oaa/` |
| **Governance Portal** | `https://cathedral.kaizen.os` |

### Protocol Prefixes

- `fedp://` - Federation peering
- `ledger://` - Ledger proof reference
- `did:kaizen:` - Kaizen DID method
- `gic:` - GIC token reference

---

[← Self-Host Guide](./SELF_HOST_GUIDE.md) | [Pro Landing Page →](./PRO_LANDING_PAGE.md)
