# Hello World - Mobius Systems MVP

**Get up and running with Mobius Systems in 5 minutes.**

This guide shows the absolute minimum needed to:
1. Start the platform
2. Make your first attestation
3. Check integrity (MII)
4. Talk to a Sentinel

---

## Prerequisites

```bash
# Required
node >= 18.0.0
npm or pnpm

# Optional (for Python labs)
python >= 3.11
```

---

## 1. Clone & Install (2 minutes)

```bash
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Mobius-Substrate

# Install dependencies
npm install

# Build core packages
npm run build
```

---

## 2. Start the Ledger (30 seconds)

The Civic Ledger is the backbone - it stores all attestations.

```bash
cd apps/ledger-api
npm run dev
```

Ledger runs at `http://localhost:3001`

---

## 3. Your First Attestation (1 minute)

Create a file `hello-mobius.js`:

```javascript
// hello-mobius.js
const crypto = require('crypto');

async function helloMobius() {
  const attestation = {
    event: "hello_world",
    agent: "developer",
    timestamp: new Date().toISOString(),
    data: {
      message: "Hello from Mobius Systems!",
      integrity_score: 1.0
    },
    hash: crypto.randomBytes(32).toString('hex')
  };

  const response = await fetch('http://localhost:3001/attest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attestation)
  });

  const result = await response.json();
  console.log('✅ Attestation recorded:', result);
  return result;
}

helloMobius().catch(console.error);
```

Run it:

```bash
node hello-mobius.js
```

You just made your first immutable attestation! 🎉

---

## 4. Check Your Integrity Score (30 seconds)

```bash
curl http://localhost:3001/mii
```

You should see:

```json
{
  "mii": 0.97,
  "status": "healthy",
  "threshold": 0.95
}
```

**MII ≥ 0.95 = system is healthy and can deploy**

---

## 5. Talk to a Sentinel (1 minute)

Start the Thought Broker (multi-LLM consensus):

```bash
cd apps/broker-api
npm run dev  # runs on :3003
```

Ask a question:

```javascript
// ask-sentinel.js
async function askSentinel() {
  const response = await fetch('http://localhost:3003/consensus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: "What is Mobius Systems?",
      agents: ["ATLAS", "AUREA"]  // Ask 2 sentinels
    })
  });

  const result = await response.json();
  console.log('🤖 Sentinel Response:', result);
}

askSentinel().catch(console.error);
```

You just got multi-LLM consensus! 🧠

---

## 6. Full Stack (Optional)

Want the complete experience?

```bash
# Terminal 1: Ledger
cd apps/ledger-api && npm run dev

# Terminal 2: Gateway
cd apps/gateway && npm run dev

# Terminal 3: Thought Broker
cd apps/broker-api && npm run dev

# Terminal 4: Portal (UI)
cd apps/portal && npm run dev
```

Visit `http://localhost:3000` for the visual interface.

---

## What You Just Did

✅ **Attestation** - Immutable record on Civic Ledger  
✅ **Integrity Check** - MII score verification  
✅ **Consensus** - Multi-agent deliberation  
✅ **Mobius Architecture** - Kernel + Sentinels + Ledger

---

## Next Steps

### Learn Core Concepts

```bash
# Read architecture overview
cat docs/03-architecture/technical/FOUNDING_AGENTS_SOVEREIGN_STACK.md

# Explore the Charter
cat FOUNDATION/CHARTER.md

# Check MII specification
cat docs/metrics/MII_SPEC_v0.1.md  # (to be created)
```

### Build Something Real

**1. Create a Monitored Service**

```javascript
// my-service.js
const { CivicSDK } = require('@civic/sdk');

const civic = new CivicSDK({
  ledgerUrl: 'http://localhost:3001'
});

async function doWork() {
  // Your business logic
  const result = await processData();
  
  // Attest the action
  await civic.attest({
    action: 'data_processed',
    mii: 0.98,  // Your integrity score
    metadata: { records: 100 }
  });
  
  return result;
}
```

**2. Add Integrity Gates**

```javascript
// Only deploy if MII ≥ 0.95
const mii = await civic.getMII();
if (mii < 0.95) {
  console.error('❌ MII below threshold, blocking deploy');
  process.exit(1);
}
console.log('✅ MII check passed, deploying...');
```

**3. Use Multi-Agent Consensus**

```javascript
// Get consensus from 3 LLMs before critical decision
const decision = await broker.consensus({
  prompt: "Should we approve this transaction?",
  agents: ["ATLAS", "AUREA", "EVE"],
  threshold: 0.8  // 80% agreement required
});

if (decision.consensus) {
  await executeTransaction();
}
```

---

## Project Templates

### Minimal Attestation Service

```
my-mobius-app/
├── package.json
├── src/
│   ├── index.js          # Main service
│   └── attestor.js       # Civic SDK wrapper
└── .env
    CIVIC_LEDGER_URL=http://localhost:3001
    MII_THRESHOLD=0.95
```

### Integrity-Gated API

```
api-with-mii/
├── package.json
├── src/
│   ├── server.js         # Express/Fastify
│   ├── middleware/
│   │   └── mii-gate.js   # Block requests if MII < 0.95
│   └── routes/
│       └── protected.js  # Your endpoints
```

### Multi-Agent App

```
consensus-app/
├── package.json
├── src/
│   ├── index.js
│   ├── agents/
│   │   ├── atlas.js      # Anthropic
│   │   ├── aurea.js      # OpenAI
│   │   └── echo.js       # DeepSeek
│   └── consensus.js      # Vote aggregator
```

---

## Common Patterns

### Pattern 1: Attestation on Every Action

```javascript
class MobiusService {
  async doSomething(data) {
    const result = await this.process(data);
    
    // Always attest
    await civic.attest({
      action: 'process_complete',
      input_hash: hash(data),
      output_hash: hash(result),
      mii_local: this.calculateMII()
    });
    
    return result;
  }
}
```

### Pattern 2: Pre-Deploy MII Check

```javascript
// In your CI/CD pipeline
async function preDeploy() {
  const mii = await civic.getMII();
  const drift = await civic.getDrift();
  
  if (mii < 0.95 || drift > 0.05) {
    throw new Error('Integrity gate failed');
  }
  
  console.log('✅ Safe to deploy');
}
```

### Pattern 3: Consensus for Critical Ops

```javascript
async function criticalOperation(params) {
  // Get multi-agent consensus first
  const verdict = await broker.consensus({
    prompt: `Evaluate: ${JSON.stringify(params)}`,
    agents: ['ATLAS', 'AUREA', 'EVE'],
    mii_gate: 0.95
  });
  
  if (!verdict.approved) {
    throw new Error('Consensus rejected');
  }
  
  return executeOperation(params);
}
```

---

## SDK Quick Reference

```javascript
const { CivicSDK } = require('@civic/sdk');

const civic = new CivicSDK({
  ledgerUrl: 'http://localhost:3001',
  apiKey: process.env.CIVIC_API_KEY  // optional
});

// Attest an event
await civic.attest({ event, data, mii });

// Get current MII
const mii = await civic.getMII();

// Check drift
const drift = await civic.getDrift();

// Search attestations
const results = await civic.search({ agent: 'ATLAS' });
```

---

## Troubleshooting

### Ledger won't start
```bash
# Check if port 3001 is in use
lsof -i :3001  # or netstat -ano | findstr :3001 on Windows

# Try a different port
PORT=3002 npm run dev
```

### MII always shows 0
```bash
# Make sure you've made at least one attestation
curl http://localhost:3001/attestations

# Check if aggregator is running
curl http://localhost:3001/health
```

### Sentinel not responding
```bash
# Check API keys are set
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Restart broker with debug
DEBUG=* npm run dev
```

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────┐
│  Your App                                   │
│  └─ uses @civic/sdk                         │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Civic Ledger (Port 3001)                   │
│  └─ stores attestations                     │
│  └─ calculates MII                          │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Thought Broker (Port 3003)                 │
│  └─ routes to ATLAS, AUREA, EVE             │
│  └─ aggregates consensus                    │
└─────────────────────────────────────────────┘
```

---

## Key Concepts

| Term | Meaning | Example |
|------|---------|---------|
| **Attestation** | Immutable record of an event | "Deployed v1.2.3 at 2025-11-09" |
| **MII** | Mobius Integrity Index (0-1) | 0.97 = healthy |
| **Sentinel** | AI agent (ATLAS, AUREA, etc.) | ATLAS verifies integrity |
| **Consensus** | Multi-LLM agreement | 3 of 5 agents approve |
| **Drift** | System deviation over time | <0.05 = stable |

---

## What Makes Mobius Different?

✅ **Integrity-First**: MII gates every deployment  
✅ **Multi-Model**: Never locked to one LLM vendor  
✅ **Immutable Audit**: Every action is attested  
✅ **Self-Healing**: System monitors and corrects itself  
✅ **Open Governance**: Foundation-backed, vendor-neutral

---

## Resources

- **Main Docs**: [docs/04-guides/quickstart/START_HERE.md](START_HERE.md)
- **Architecture**: [docs/03-architecture/](../../03-architecture/)
- **Foundation**: [FOUNDATION/CHARTER.md](../../../FOUNDATION/CHARTER.md)
- **API Reference**: [examples/api-endpoints/](../../../examples/api-endpoints/)
- **Discord**: [Join the community](#)
- **RFCs**: [rfcs/](../../../rfcs/)

---

## Next Level

Want to go deeper?

1. **Deploy a Lab**: Try [lab1-civic-ledger](../../../labs/lab1-civic-ledger/)
2. **Build a Sentinel**: See [sentinels/](../../../sentinels/)
3. **Submit an RFC**: [FOUNDATION/PROCESS/RFC_PROCESS.md](../../../FOUNDATION/PROCESS/RFC_PROCESS.md)
4. **Join Foundation**: [FOUNDATION/README.md](../../../FOUNDATION/README.md)

---

**Welcome to Mobius Systems. We heal as we walk.** 🌀

