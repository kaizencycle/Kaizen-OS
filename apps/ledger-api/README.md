# Civic Protocol Core

A sovereign blockchain for civilization state - where AI and citizens co-govern through verified civic activity.

## Overview

Civic Protocol Core implements a **Proof-of-Cycle (PoC)** consensus mechanism that rewards verified civic heartbeat rather than raw compute power. The protocol is purpose-built for civic memory, default-private with opt-in public participation, and AI-native with companions as first-class participants.

## Core Concepts

- **Cycle**: The fundamental primitive (Seed → Sweep → Seal → Ledger)
- **Reflections**: Private civic thoughts and insights (encrypted off-chain)
- **GIC**: Governance Incentive Currency for civic participation
- **Proof-of-Cycle**: Consensus based on verifiable civic activity
- **Shield**: Privacy-preserving layer for private reflections with zkRL
- **Agora**: Democratic governance system with quadratic voting

## Quick Start

### Option 1: Start All Services (Recommended)

```bash
# Start all services at once
python start-all-services.py
```

This will start:
- Civic Dev Node (port 5411)
- Shield (port 7000) 
- GIC-Indexer (port 8000)

### Option 2: Start Services Individually

```bash
# Terminal 1: Civic Dev Node
python sdk/python/devnode.py

# Terminal 2: Shield
cd lab6-proof
python app/main.py

# Terminal 3: GIC-Indexer
cd gic-indexer
python app/main.py
```

### Test the Integration

```bash
# Run the full integration test
python examples/full-integration-example.py
```

## SDK Usage

### Python SDK

```python
from sdk.python.client import CivicClient
c = CivicClient()
c.add_reflection("Cycle 0 Hello", "We heal as we walk.", ["hello","cycle0"])
print(c.list_reflections())
```

### JavaScript SDK

```javascript
import { CivicClient } from './sdk/js/index.js';
const c = new CivicClient('http://localhost:5411');
await c.addReflection({ title: 'Cycle 0 Hello', body: 'We heal as we walk.' });
console.log(await c.listReflections());
```

## Architecture

```
civic-protocol-core/
├── ledger/                     # The Blockchain Kernel (Civic Ledger API)
│   ├── app/
│   │   ├── main.py            # FastAPI ledger service
│   │   ├── ledger.py          # Core ledger functionality
│   │   └── verify.py          # Token and signature verification
│   ├── requirements.txt
│   └── README.md
├── lab4-proof/                 # Reflections / Agora API
│   ├── app/
│   │   ├── main.py            # Lab4 API service
│   │   ├── auth.py            # Authentication
│   │   ├── memory.py          # Memory management
│   │   ├── companions.py      # Companion AI
│   │   └── anchor.py          # Posts events to ../ledger
│   └── README.md
├── lab6-proof/                 # Citizen Shield API
│   ├── app/
│   │   ├── main.py            # Shield zkRL service
│   │   ├── auth.py            # Authentication
│   │   ├── admin.py           # Admin functions
│   │   ├── companions.py      # Companion management
│   │   └── anchor.py          # Posts events to ../ledger
│   ├── policy.yaml            # Virtue Accords v0
│   └── requirements.txt
├── consensus/                  # Quorum + ZEUS arbitration
│   └── proof_of_cycle.py      # PoC consensus implementation
├── governance/                 # Festivals, Agora contracts
│   └── agora.py               # Agora governance system
├── gic-indexer/               # GIC balance computation
│   ├── app/main.py            # FastAPI indexer service
│   ├── policy.yaml            # Policy configuration
│   ├── render.yaml            # Deployment config
│   └── requirements.txt
├── networking/                 # Civic Mesh plumbing (placeholder)
├── docs/
│   ├── openapi.yaml           # Civic Ledger API specification
│   ├── CIP-0001-template.md   # CIP template
│   └── CIP-0002-webhooks.md   # Sample CIP
├── sdk/
│   ├── python/
│   │   ├── devnode.py         # Enhanced dev node with anchoring
│   │   ├── client.py          # Python SDK
│   │   └── anchor.py          # Ledger anchoring helper
│   └── js/
│       └── index.js           # JavaScript SDK
├── registry/
│   └── hello-reflection.manifest.json
├── examples/
│   ├── hello-reflection-app/  # Example applications
│   └── full-integration-example.py  # Complete flow test
├── start-all-services.py      # Service orchestration
├── docker-compose.yml         # Container orchestration
├── Dockerfile                 # Container definition
└── docs/
    ├── CONTRIBUTING.md
    ├── CODE_OF_CONDUCT.md
    └── LICENSE
```

## Complete System Flow

### 1. Ledger API - The Blockchain Kernel
- **Central Event Store**: All civic activity anchored here
- **Immutable Events**: Chained, verified, and permanent
- **Token Verification**: Authenticated via Lab4/Lab6
- **Event Types**: Reflections, companions, governance, GIC transactions

### 2. Lab4-Proof - Reflections & Agora
- **Reflections**: Public and private civic thoughts
- **Companions**: AI companion management
- **Memory**: Persistent memory system
- **Agora**: Democratic governance and voting
- **Auto-Anchoring**: Every action posts to Ledger API

### 3. Lab6-Proof - Citizen Shield
- **zkRL Verification**: Zero-knowledge rate limiting
- **Shield Actions**: Privacy-preserving civic activities
- **Citizen Attestations**: Verified civic contributions
- **Auto-Anchoring**: Every action posts to Ledger API

### 4. GIC Economics & Indexing
- **Real-time Computation**: Balance calculation from ledger events
- **Activity Rewards**: GIC earned for civic participation
- **Staking System**: Governance participation incentives
- **Economic Policies**: Configurable reward schedules

### 5. Complete Integration
- **Frontend** → **Lab4/Lab6** → **Ledger API** → **GIC Indexer**
- **Immutable Record**: All civic activity permanently stored
- **Verifiable History**: Complete audit trail of civic participation
- **Economic Incentives**: GIC rewards for civic engagement

## Development Roadmap

### Phase 1: MVP (Current)
- [x] Starter kit with dev node
- [x] Python and JavaScript SDKs
- [x] OpenAPI specification
- [x] Example hello-reflection app

### Phase 2: Testnet
- [ ] GIC blockchain implementation
- [ ] Proof-of-Cycle consensus
- [ ] Shield integration with zkRL
- [ ] Custodian node setup

### Phase 3: Mainnet
- [ ] Public custodian nodes
- [ ] Slashing mechanisms
- [ ] Governance with quadratic voting
- [ ] Policy time-locks

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

See [LICENSE](LICENSE) for licensing information.
