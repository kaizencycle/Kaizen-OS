# API Endpoints Examples

Example API endpoints for Founding Agent sites. These can be used in Next.js applications (Pages Router or App Router).

## Available Endpoints

### 1. Codex Query
**File:** `codex-query.ts`
**Route:** `POST /api/codex/query`

Execute a single agent deliberation using the Codex-Agentic system.

**Request:**
```json
{
  "agent": "AUREA",
  "input": "Explain the 90-day GIC epoch cycle",
  "maxTokens": 1000,
  "temperature": 0.7,
  "tags": ["governance", "education"]
}
```

**Response:**
```json
{
  "agreement": 0.95,
  "votes": [...],
  "winner": {
    "provider": "openai",
    "output": "..."
  },
  "traceId": "abc123",
  "giScore": 0.98,
  "timestamp": "2024-10-28T..."
}
```

### 2. Discourse Round
**File:** `discourse-round.ts`
**Route:** `POST /api/discourse/round`

Execute a council-wide deliberation across all active Founding Agents.

**Request:**
```json
{
  "input": "Should we raise the minimum agreement threshold to 0.92?"
}
```

**Response:**
```json
{
  "councilAgreement": 0.91,
  "giAvg": 0.97,
  "results": [...]
}
```

### 3. GI Stream
**File:** `gi-stream.ts`
**Route:** `GET /api/gi/stream`

Server-Sent Events (SSE) stream for real-time Governance Integrity metrics.

**Client Usage:**
```javascript
const eventSource = new EventSource('/api/gi/stream');

eventSource.addEventListener('heartbeat', (e) => {
  const { gi, timestamp } = JSON.parse(e.data);
  console.log(`GI: ${gi} at ${timestamp}`);
});
```

### 4. GIC Mint
**File:** `gic-mint.ts`
**Route:** `POST /api/gic/mint`

Mint GIC tokens for a Founding Agent's epoch.

**Request:**
```json
{
  "agentId": "AUREA",
  "amount": "50000"
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x..."
}
```

### 5. GIC Burn
**File:** `gic-burn.ts`
**Route:** `POST /api/gic/burn`

Burn GIC tokens for supply management.

**Request:**
```json
{
  "agentId": "AUREA",
  "amount": "5000"
}
```

## Installation

### 1. Install Dependencies

```bash
npm install @kaizen/codex-agentic ethers
```

### 2. Copy Files

Copy the endpoint files to your Next.js project:

```bash
# Pages Router
cp examples/api-endpoints/*.ts pages/api/

# Or App Router (Next.js 13+)
# Convert to route handlers and place in app/api/
```

### 3. Configure Environment

Create a `.env.local` file:

```bash
# Agent Identity
AGENT_ID=AUREA

# LLM Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...

# Local LLM
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct-q4_K_M

# Civic Ledger
LEDGER_API_BASE=https://civic-protocol-core-ledger.onrender.com
LEDGER_API_KEY=...

# OAA Hub
OAA_WEBHOOK_AUREA=https://hive-api.onrender.com/oaa/learn/aurea
OAA_CONSENT_AUREA=true

# Blockchain (for GIC endpoints)
RPC_URL=https://...
AGENT_SIGNER_KEY=0x...
GIC_GOVERNOR_ADDRESS=0x...

# System
CODEX_SYSTEM="Follow Virtue Accords. Prioritize integrity, privacy, safety."
```

## Security Notes

### DID Verification
The GIC mint/burn endpoints should verify the agent's DID signature:

```typescript
import { verifyDid } from '@kaizen/civic-sdk';

// In handler:
const didSignature = req.headers.authorization;
if (!didSignature) {
  return res.status(401).json({ error: 'Missing DID signature' });
}

const valid = await verifyDid(didSignature, agentId);
if (!valid) {
  return res.status(403).json({ error: 'Invalid DID signature' });
}
```

### Rate Limiting
Implement rate limiting for expensive operations:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
});

// Apply to discourse rounds (expensive)
export default limiter(handler);
```

### CORS
Configure CORS for cross-origin requests:

```typescript
// In Next.js API route:
res.setHeader('Access-Control-Allow-Origin', 'https://aurea.gic');
res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
```

## Testing

### cURL Examples

```bash
# Codex Query
curl -X POST http://localhost:3000/api/codex/query \
  -H "Content-Type: application/json" \
  -d '{"agent":"AUREA","input":"Explain GI"}'

# Discourse Round
curl -X POST http://localhost:3000/api/discourse/round \
  -H "Content-Type: application/json" \
  -d '{"input":"Should we raise thresholds?"}'

# GI Stream
curl http://localhost:3000/api/gi/stream

# GIC Mint
curl -X POST http://localhost:3000/api/gic/mint \
  -H "Content-Type: application/json" \
  -d '{"agentId":"AUREA","amount":"50000"}'
```

### Postman Collection
Import the Postman collection from `docs/postman/codex-federation.postman_collection.json`

## Deployment

### Vercel
```bash
vercel --prod
```

### Render
```bash
render deploy
```

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

## Related Documentation

- [Founding Agents Sovereign Stack](../../docs/architecture/FOUNDING_AGENTS_SOVEREIGN_STACK.md)
- [Codex-Agentic Package](../../packages/codex-agentic/README.md)
- [GIC Contracts](../../packages/gic-registry-contracts/)

## Support

For issues or questions:
- GitHub Issues: [kaizencycle/Kaizen-OS/issues](https://github.com/kaizencycle/Kaizen-OS/issues)
- Discord: Kaizen OS Community
