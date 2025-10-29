# AUREA Site - Founding Agent (Integrity & Reasoning)

The first complete Founding Agent site for Kaizen OS. AUREA serves as the constitutional integrity anchor, providing reasoning and audit capabilities through the Codex-Agentic multi-LLM system.

## Features

- ✅ **Interactive Avatar Chat** - Engage with AUREA using multi-LLM consensus
- ✅ **Real-time GI Monitoring** - Live Governance Integrity score via SSE
- ✅ **Epoch Dashboard** - 90-day cycle tracking with mint/burn/donate
- ✅ **Attestation Records** - Immutable deliberation history on Civic Ledger
- ✅ **GIC Panel** - Mint, burn, and donate GIC tokens
- ✅ **DID Integration** - W3C DID documents at /.well-known/did.json
- ✅ **Sovereign Control** - Full Ed25519 root-key ownership

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** @kaizen/codex-agentic (multi-LLM routing)
- **Blockchain:** ethers.js v6
- **State:** Zustand
- **Icons:** Lucide React

## Quick Start

### 1. Install Dependencies

```bash
cd apps/aurea-site
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and configuration:

```bash
# Required for Codex-Agentic
OPENAI_API_KEY=sk-...
OLLAMA_URL=http://localhost:11434

# Required for GIC operations
RPC_URL=https://sepolia.infura.io/v3/...
AGENT_SIGNER_KEY=0x...
GIC_GOVERNOR_ADDRESS=0x...

# Optional but recommended
LEDGER_API_BASE=https://civic-protocol-core-ledger.onrender.com
LEDGER_API_KEY=...
OAA_WEBHOOK_AUREA=https://hive-api.onrender.com/oaa/learn/aurea
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Test Local LLM (Ollama)

Install and start Ollama:

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3.1:8b-instruct-q4_K_M

# Start server (runs on :11434 by default)
ollama serve
```

## Project Structure

```
aurea-site/
├── app/
│   ├── layout.tsx                   # Root layout with navigation
│   ├── page.tsx                     # Landing page
│   ├── avatar/page.tsx              # Interactive chat interface
│   ├── epoch/page.tsx               # Epoch dashboard
│   ├── attestations/page.tsx        # Ledger records
│   ├── api/
│   │   ├── codex/query/route.ts     # Codex-Agentic endpoint
│   │   ├── gi/stream/route.ts       # SSE GI stream
│   │   └── gic/
│   │       ├── mint/route.ts        # Epoch minting
│   │       └── burn/route.ts        # Token burning
│   └── .well-known/
│       ├── did.json/route.ts        # DID document
│       └── kaizen.json/route.ts     # Capabilities manifest
├── components/
│   ├── Navigation.tsx               # Top nav bar
│   ├── GiBadge.tsx                  # Real-time GI display
│   ├── SeasonClock.tsx              # Epoch countdown
│   └── GICPanel.tsx                 # Mint/burn/donate UI
├── lib/
│   └── utils.ts                     # Utility functions
└── public/                          # Static assets
```

## Key Endpoints

### Public Endpoints

- `GET /` - Landing page
- `GET /avatar` - Interactive chat interface
- `GET /epoch` - Epoch dashboard
- `GET /attestations` - Attestation records
- `GET /.well-known/did.json` - W3C DID document
- `GET /.well-known/kaizen.json` - Kaizen capabilities manifest

### API Endpoints

- `POST /api/codex/query` - Execute deliberation
- `GET /api/gi/stream` - Real-time GI metrics (SSE)
- `POST /api/gic/mint` - Mint GIC tokens (epoch-gated)
- `POST /api/gic/burn` - Burn GIC tokens

## Usage Examples

### Chat with AUREA

```bash
curl -X POST http://localhost:3000/api/codex/query \
  -H "Content-Type: application/json" \
  -d '{"input":"Explain the 90-day epoch cycle"}'
```

### Monitor GI in Real-Time

```javascript
const eventSource = new EventSource('/api/gi/stream');

eventSource.addEventListener('heartbeat', (e) => {
  const { gi, timestamp } = JSON.parse(e.data);
  console.log(`GI: ${gi} at ${timestamp}`);
});
```

### Mint GIC Tokens

```bash
curl -X POST http://localhost:3000/api/gic/mint \
  -H "Content-Type: application/json" \
  -d '{"agentId":"AUREA","amount":"50000"}'
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add OPENAI_API_KEY
vercel env add RPC_URL
# ... etc
```

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

## Configuration

### AUREA Agent Config

| Setting | Value |
|---------|-------|
| **Domain** | aurea.gic |
| **Focus** | Integrity & Reasoning |
| **Codex Route** | openai ↔ local |
| **Min Agreement** | 0.90 (90%) |
| **GI Target** | 0.99 |
| **GI Baseline** | 0.993 |
| **Epoch Mint Cap** | 100,000 GIC |
| **Donate-back** | 20% (2,000 bps) |

### Codex-Agentic Providers

AUREA uses two providers by default:
1. **OpenAI** (GPT-4o) - Cloud-based, high quality
2. **Local** (Ollama/Llama 3.1) - Self-hosted, sovereign

Requires ≥90% agreement between providers (DelibProof).

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Customization

### For Other Agents

To create sites for other founding agents (ATLAS, ZENITH, etc.):

1. Copy this directory: `cp -r aurea-site atlas-site`
2. Update `package.json` name: `"@kaizen/atlas-site"`
3. Update `next.config.js` env: `AGENT_ID: 'ATLAS'`
4. Update `.env.local` agent-specific vars
5. Customize colors in `tailwind.config.ts`
6. Update branding in `app/layout.tsx`

### Brand Colors

```typescript
// tailwind.config.ts
colors: {
  aurea: {
    gold: '#FFD700',        // Primary
    blue: '#1E3A8A',        // Secondary
  },
}
```

For ATLAS, use different colors (e.g., silver/cyan).

## Troubleshooting

### Ollama Connection Failed

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama && ollama serve
```

### Codex-Agentic Not Found

```bash
# From monorepo root
npm install

# Or install workspace dependency
cd apps/aurea-site
npm install @kaizen/codex-agentic
```

### GI Stream Not Connecting

- Check browser console for errors
- Verify `/api/gi/stream` returns `text/event-stream`
- Try disabling browser extensions (ad blockers)

## Security Notes

### Private Keys

⚠️ **NEVER commit private keys to git!**

```bash
# Add to .gitignore
.env.local
.env*.local
secrets/
```

### DID Signatures

Production sites should verify DID signatures:

```typescript
import { verifyDid } from '@kaizen/civic-sdk';

const signature = req.headers.authorization;
const valid = await verifyDid(signature, 'AUREA');
```

### Rate Limiting

Consider adding rate limiting for API endpoints:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
```

## Related Documentation

- [Founding Agents Sovereign Stack](../../docs/architecture/FOUNDING_AGENTS_SOVEREIGN_STACK.md)
- [Codex-Agentic Package](../../packages/codex-agentic/README.md)
- [GIC Smart Contracts](../../packages/gic-registry-contracts/)
- [API Endpoint Examples](../../examples/api-endpoints/README.md)

## Support

- **GitHub Issues:** [kaizencycle/Kaizen-OS/issues](https://github.com/kaizencycle/Kaizen-OS/issues)
- **Discord:** Kaizen OS Community
- **Docs:** [docs.kaizen.os](https://docs.kaizen.os)

## License

MIT

---

**AUREA.gic** · Constitutional Integrity & Reasoning · Founding Agent of Kaizen OS
