# 🏛️ Consensus Chamber

**Version:** 1.0.0 | **Status:** ✅ APPROVED (AUREA + ATLAS)
**Cycle:** C-118 | **Date:** October 28, 2025

---

## Overview

The **Consensus Chamber** is a formalized protocol for coordinating decisions across multiple LLM offices (AUREA/OpenAI, ATLAS/Claude, ZENITH/Gemini, SOLARA/DeepSeek) when working in federated silos.

### Key Features

- ✅ **Multi-LLM Coordination**: Democratic deliberation across AI providers
- ✅ **Constitutional Compliance**: GI scores ≥ 0.95 enforced
- ✅ **Cryptographic Proof**: DelibProofs with ED25519 signatures
- ✅ **Audit Trail**: All decisions recorded on Civic Ledger
- ✅ **Cross-Office Sync**: E.O.M.M. integration for memory continuity

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Consensus Chamber                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  AUREA   │  │  ATLAS   │  │  ZENITH  │  │  SOLARA  │   │
│  │(Critical)│  │(Critical)│  │  (High)  │  │  (High)  │   │
│  │ GI:0.991 │  │ GI:0.987 │  │ GI:0.983 │  │ GI:0.975 │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘         │
│                          │                                   │
│                          ▼                                   │
│              ┌───────────────────────┐                      │
│              │  Lab2: Thought Broker │                      │
│              │  Consensus Engine     │                      │
│              └───────────┬───────────┘                      │
│                          │                                   │
│                          ▼                                   │
│              ┌───────────────────────┐                      │
│              │  Lab1: Substrate Proof│                      │
│              │  Civic Ledger         │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Access the Consensus Chamber

```bash
# Start the portal
cd apps/portal
npm run dev

# Visit
http://localhost:3000/consensus
```

### 2. Environment Variables

```bash
# .env.local
KAIZEN_CURRENT_CYCLE=C-118
KAIZEN_GI_BASELINE=0.993
```

### 3. API Endpoints

```typescript
// Get current cycle info
GET /api/cycle/current
Response: { cycle: "C-118", gi: 0.993, room: "Consensus Chamber" }

// Update cycle (requires auth in production)
POST /api/cycle/current
Body: { cycle: "C-119", gi: 0.994 }
```

---

## Components

### 1. CycleTracker Component

Located: `apps/portal/components/CycleTracker.tsx`

**Usage:**

```tsx
import CycleTracker from '@/components/CycleTracker';

export default function MyPage() {
  return (
    <div>
      <CycleTracker />
      {/* Rest of page */}
    </div>
  );
}
```

**Features:**

- ✅ Live clock (updates every 15 seconds)
- ✅ Auto-fetches cycle from API
- ✅ Fallback to props if API unavailable
- ✅ Monospace formatting for terminal aesthetic

### 2. Consensus Chamber Page

Located: `apps/portal/app/consensus/page.tsx`

**Features:**

- 🏛️ Live cycle tracker
- 👥 Agent roster with GI scores
- 📊 Active sessions overview
- 🔗 Quick links to documentation

### 3. Ledger Integration

Located: `apps/portal/lib/consensus-ledger.ts`

**Usage:**

```typescript
import { openConsensusSession, closeConsensusSession } from '@/lib/consensus-ledger';

// Open a session (with duplicate guard)
const result = await openConsensusSession({
  cycle: 'C-118',
  room: 'Consensus Chamber',
  gi_baseline: 0.993,
  participants: ['AUREA', 'ATLAS', 'ZENITH']
});

if (result) {
  console.log('Session opened:', result.sessionId);
}

// Close a session
await closeConsensusSession({
  sessionId: result.sessionId,
  outcome: 'APPROVED',
  delibproof_id: 'DLB-1028-001',
  gi_delta: 0.006
});
```

**Features:**

- ✅ One-per-session guard (prevents duplicates)
- ✅ Automatic session ID generation
- ✅ Event emission to Civic Ledger (TODO: wire to Lab1)
- ✅ Active session tracking

---

## Templates

### 1. Base Template

**File:** `Consensus_Chamber_Template.md`

**Use for:** Master reference, documentation

```bash
cp docs/consensus-chamber/Consensus_Chamber_Template.md \
   my-session.md
```

### 2. Live Session Template

**File:** `Consensus_Chamber_Live_Session.md`

**Use for:** Active deliberations, GitHub issues

**Features:**

- Collapsible response sections
- Labels and assignees
- Progress tracking
- Markdown-friendly

### 3. Implementation Guide

**File:** `Consensus_Chamber_Implementation_Guide.md`

**Use for:** Training new team members

**Includes:**

- Step-by-step walkthrough
- Lab integration examples
- Troubleshooting guide
- Best practices

---

## Integration with Labs

### Lab1 (Substrate Proof)

```python
# Commit DelibProof to blockchain
from labs.lab1_proof.src.civic_ledger import CivicLedger

ledger = CivicLedger()
ledger.submit_transaction({
    "type": "consensus.evaluated",
    "session_id": "CC-2025-10-28-001",
    "delibproof_id": "DLB-1028-001",
    "outcome": "APPROVED",
    "gi_delta": 0.006
})
```

### Lab2 (Thought Broker)

```python
# Orchestrate multi-LLM deliberation
from labs.lab2_proof.src.deliberation import DeliberationOrchestrator

orchestrator = DeliberationOrchestrator()
session = orchestrator.create_session(
    session_id="delib_001",
    question="Should we implement feature X?",
    context={"priority": "high"}
)
consensus = await orchestrator.run_session(session.session_id)
```

### Lab4 (E.O.M.M.)

```python
# Archive session for memory continuity
from labs.lab4_proof.src.eomm import EOMM

eomm = EOMM()
eomm.save_context(
    session_id="CC-2025-10-28-001",
    type="consensus",
    data=session_transcript
)
```

---

## Workflow Example

### Running a Consensus Session

**Step 1: Prepare**

```bash
# Copy template
cp docs/consensus-chamber/Consensus_Chamber_Live_Session.md \
   sessions/CC-2025-10-28-Lab3-RateLimit.md

# Edit metadata
vim sessions/CC-2025-10-28-Lab3-RateLimit.md
```

**Step 2: Issue Prompt**

In each LLM office (AUREA, ATLAS, ZENITH, SOLARA):

```
🏛️ CONSENSUS CHAMBER SESSION CC-2025-10-28-001
You are participating as ATLAS in a multi-LLM deliberation.
Current GI: 0.987

PROMPT:
Should Lab3 API Gateway rate limit be increased from 60 to 100 req/min?

Consider:
1. User experience impact
2. Server capacity
3. Constitutional implications (equity of access)

Vote: APPROVE / REJECT / ABSTAIN
```

**Step 3: Collect Responses**

Copy each agent's response back to the session document.

**Step 4: Calculate Consensus**

```javascript
const votes = {
  AUREA: true,   // APPROVE
  ATLAS: true,   // APPROVE
  ZENITH: false, // REJECT
  SOLARA: true   // APPROVE
};

const totalYes = 3;
const agreementScore = 3 / 4; // 75%
const quorumAchieved = totalYes >= 3; // ✅ YES
```

**Step 5: Generate DelibProof**

```python
from labs.lab2_proof.src.delib_proof import DelibProofGenerator

generator = DelibProofGenerator(attestation_engine)
proof = generator.generate_proof(
    delib_id="DLB-1028-001",
    question="Should Lab3 rate limit be increased?",
    context={},
    rounds=[round1],
    consensus=consensus_result,
    gi_score=0.96,
    constitutional_check={"clause_3_equity": True}
)

# Sign with all models
proof = generator.sign_proof_by_models(
    "DLB-1028-001",
    ["AUREA", "ATLAS", "ZENITH", "SOLARA"]
)

# Validator approval
proof = generator.sign_proof_by_validator(
    "DLB-1028-001",
    "atlas@civic.os"
)
```

**Step 6: Commit to Ledger**

```python
from labs.lab1_proof.src.civic_ledger import CivicLedger

ledger = CivicLedger()
tx_id = await ledger.submit_transaction({
    "type": "consensus.evaluated",
    "delibproof": proof.export_proof("DLB-1028-001")
})

# Seal proof to ledger
proof = generator.seal_to_ledger("DLB-1028-001", tx_id)
```

**Step 7: Archive & Reflect**

Update session document with:
- Final outcome
- Post-session reflection
- Lessons learned
- Next steps

---

## Security

### Authentication

**Production Requirements:**

```typescript
// API routes should verify JWT tokens
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization');
  const user = await verifyToken(token);

  if (!user || !user.permissions.includes('consensus.write')) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Process request...
}
```

### Cryptographic Signatures

All consensus decisions must be cryptographically signed:

1. **Model Signatures**: Each participating LLM signs the DelibProof
2. **Validator Signature**: Final approval from a validator (≥0.95 GI)
3. **Ledger Seal**: Merkle root committed to blockchain

### GI Score Validation

```python
# Reject any agent with GI < 0.95
MIN_GI_THRESHOLD = 0.95

def validate_participants(agents):
    for agent_id, gi_score in agents:
        if gi_score < MIN_GI_THRESHOLD:
            raise ValueError(f"Agent {agent_id} below GI threshold")
```

---

## Monitoring

### Metrics to Track

```yaml
consensus_metrics:
  sessions_per_week: 3-5
  average_duration: 45 minutes
  agreement_rate: ≥ 85%
  gi_drift: ≤ 0.01 per session
  quorum_failures: < 5%
```

### Health Checks

```bash
# Check if API is responding
curl http://localhost:3000/api/cycle/current

# Check active sessions
curl http://localhost:8000/api/v1/consensus/sessions
```

---

## Troubleshooting

### Issue: CycleTracker not updating

**Solution:**

1. Check API route is accessible: `curl http://localhost:3000/api/cycle/current`
2. Verify environment variables are set
3. Check browser console for errors
4. Ensure `autoFetch` prop is not set to `false`

### Issue: Session already active

**Solution:**

This is expected behavior (duplicate guard). Use `getActiveSessions()` to see active sessions, or wait for session to close.

### Issue: Ledger commit failing

**Solution:**

1. Verify Lab1 API is running: `curl http://localhost:8000/health`
2. Check authentication tokens
3. Validate GI scores are ≥ 0.95
4. Review Lab1 logs for errors

---

## Next Steps

### Phase 1: Manual Sessions ✅

- [x] Templates created
- [x] UI components built
- [x] Documentation complete

### Phase 2: Lab2 Automation (In Progress)

- [ ] Auto-prompt distribution
- [ ] Auto-response collection
- [ ] Auto-consensus calculation
- [ ] Auto-DelibProof generation

### Phase 3: Production Hardening

- [ ] Add authentication/authorization
- [ ] Integrate with Lab1 Civic Ledger API
- [ ] Add real-time WebSocket updates
- [ ] Build admin dashboard
- [ ] Add session analytics

---

## Contributing

### Adding New Agents

1. Update `apps/portal/app/consensus/page.tsx` with new agent
2. Update `Consensus_Chamber_Template.md` participants table
3. Generate keypair in Lab1 attestation engine
4. Update quorum rules if needed

### Modifying Templates

1. Edit template in `docs/consensus-chamber/`
2. Update version number
3. Commit with clear message
4. Notify team in next E.O.M.M. cycle

---

## Support

**Questions?** Open an issue in [Kaizen-OS repo](https://github.com/kaizencycle/Kaizen-OS)
**Bugs?** Report in Lab2 (Thought Broker) tracker
**Feature Requests?** Submit to Consensus Chamber working group

---

**Status:** ✅ Production Ready (Manual Mode)
**Approved By:** AUREA (0.991), ATLAS (0.987)
**Cycle:** C-118
**Date:** October 28, 2025

---

*"Consistency becomes proof of life."*

*Built with integrity. Coordinated with consensus. Secured with cryptography.*
