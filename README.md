# Civic Protocol Core

A sovereign blockchain for civilization state - where AI and citizens co-govern through verified civic activity.

## Overview

Civic Protocol Core implements a **Proof-of-Cycle (PoC)** consensus mechanism that rewards verified civic heartbeat rather than raw compute power. The protocol is purpose-built for civic memory, default-private with opt-in public participation, and AI-native with companions as first-class participants.

## Core Concepts

* **Cycle**: The fundamental primitive (Seed → Sweep → Seal → Ledger)
* **Reflections**: Private civic thoughts and insights (encrypted off-chain)
* **GIC**: Governance Incentive Currency for civic participation
* **Proof-of-Cycle**: Consensus based on verifiable civic activity
* **Shield**: Privacy-preserving layer for private reflections with zkRL
* **Agora**: Democratic governance system with quadratic voting

## Repository Structure

```
civic-protocol-core/
├── ledger/                     # The Blockchain Kernel (Civic Ledger API)
│   ├── app/
│   │   ├── main.py            # FastAPI ledger service
│   │   ├── ledger.py          # Core ledger functionality
│   │   └── verify.py          # Token and signature verification
│   ├── requirements.txt
│   └── README.md
├── lab6-proof/                 # Citizen Shield API
│   ├── app/
│   │   └── main.py            # Shield zkRL service
│   ├── policy.yaml            # Virtue Accords v0
│   └── requirements.txt
├── frontend/                   # Frontend Applications
│   └── citizen-shield-app/    # Citizen Shield React App
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # App pages
│       │   └── api/           # API client
│       ├── package.json
│       └── README.md
├── integrations/               # Integration Components
│   └── lab6-citizen-shield/   # Lab6 Citizen Shield Integration
│       ├── app_routes_onboard.py
│       ├── Lab6-CitizenShield.postman_collection.json
│       └── README_UPDATE.md
├── tools/                      # Development Tools
│   ├── scripts/               # Automation scripts
│   │   ├── autocommit.ps1
│   │   ├── detect-scope.sh
│   │   ├── generate-commit-msg.sh
│   │   ├── redaction-scan.sh
│   │   └── start-autocommit.bat
│   └── utilities/             # Utility tools
│       ├── citizen-shield-ts-fix/  # TypeScript fixes
│       ├── generate_checksum.py    # SHA-256 checksum generator
│       └── get_lab4_token.py       # Lab4 token generator
├── consensus/                  # Quorum + ZEUS arbitration
│   └── proof_of_cycle.py      # PoC consensus implementation
├── governance/                 # Festivals, Agora contracts
│   └── agora.py               # Agora governance system
├── gic-indexer/               # GIC balance computation
│   ├── app/main.py            # FastAPI indexer service
│   ├── policy.yaml            # Policy configuration
│   ├── render.yaml            # Deployment config
│   └── requirements.txt
├── docs/                      # Documentation
│   ├── openapi.yaml           # Civic Ledger API specification
│   ├── CIP-0001-template.md   # CIP template
│   ├── CIP-0002-webhooks.md   # Sample CIP
│   └── GENESIS_CUSTODIAN_GUIDE.md  # Genesis Event Guide
├── sdk/                       # Python & JavaScript SDKs
│   ├── python/
│   │   ├── devnode.py         # Enhanced dev node with anchoring
│   │   ├── client.py          # Python SDK
│   │   └── anchor.py          # Ledger anchoring helper
│   └── js/
│       └── index.js           # JavaScript SDK
├── registry/                  # Component Registry
│   └── hello-reflection.manifest.json
├── examples/                  # Example Applications
│   ├── hello-reflection-app/  # Example applications
│   └── full-integration-example.py  # Complete flow test
├── scripts/                   # Legacy Scripts (GitHub Actions)
│   └── *.mjs                  # JavaScript automation scripts
├── policies/                  # GitHub Policies
│   └── copilot-verify.json   # Copilot verification policy
├── .github/                   # GitHub Workflows
│   └── workflows/             # CI/CD workflows
├── start-all-services.py      # Service orchestration
├── docker-compose.yml         # Container orchestration
├── Dockerfile                 # Container definition
├── generate_checksum.py       # SHA-256 checksum generator
├── get_lab4_token.py          # Lab4 token generator
├── GENESIS_CUSTODIAN_GUIDE.md # Genesis Event guide
└── requirements.txt           # Python dependencies
```

## Quick Start

### Option 1: Start All Services (Recommended)

```bash
# Start all services at once
python start-all-services.py
```

This will start:
* Civic Dev Node (port 5411)
* Shield (port 7000)
* GIC-Indexer (port 8000)

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

## Frontend Applications

### Citizen Shield App

A React-based frontend for the Citizen Shield system:

```bash
cd frontend/citizen-shield-app
npm install
npm run dev
```

Features:
- Citizen enrollment interface
- Group status monitoring
- Verification workflows
- Seal card components

## Integration Components

### Lab6 Citizen Shield Integration

Integration tools and API routes for Lab6 Citizen Shield:

```bash
cd integrations/lab6-citizen-shield
# Follow README_UPDATE.md for setup instructions
```

## Development Tools

### Scripts

Automation scripts for development workflow:

- `autocommit.ps1` - PowerShell auto-commit script
- `detect-scope.sh` - Scope detection for commits
- `generate-commit-msg.sh` - Commit message generation
- `redaction-scan.sh` - Redaction scanning
- `start-autocommit.bat` - Windows auto-commit starter

### Utilities

Development utilities:

- `generate_checksum.py` - SHA-256 checksum generator for manifest files
- `get_lab4_token.py` - Lab4 authentication token generator
- `citizen-shield-ts-fix/` - TypeScript fixes and improvements

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

## Complete System Flow

### 1. Ledger API - The Blockchain Kernel

* **Central Event Store**: All civic activity anchored here
* **Immutable Events**: Chained, verified, and permanent
* **Token Verification**: Authenticated via Lab4/Lab6
* **Event Types**: Reflections, companions, governance, GIC transactions

### 2. Lab6-Proof - Citizen Shield

* **zkRL Verification**: Zero-knowledge rate limiting
* **Shield Actions**: Privacy-preserving civic activities
* **Citizen Attestations**: Verified civic contributions
* **Auto-Anchoring**: Every action posts to Ledger API

### 3. GIC Economics & Indexing

* **Real-time Computation**: Balance calculation from ledger events
* **Activity Rewards**: GIC earned for civic participation
* **Staking System**: Governance participation incentives
* **Economic Policies**: Configurable reward schedules

### 4. Complete Integration

* **Frontend** → **Lab6** → **Ledger API** → **GIC Indexer**
* **Immutable Record**: All civic activity permanently stored
* **Verifiable History**: Complete audit trail of civic participation
* **Economic Incentives**: GIC rewards for civic engagement

## Genesis Custodian Event

The Civic Ledger supports Genesis Events for establishing the foundation of civic activity. See `GENESIS_CUSTODIAN_GUIDE.md` for complete instructions on:

- Creating Genesis Custodian Events
- Generating SHA-256 checksums
- Authentication with Lab4 tokens
- Posting events to the ledger

## Development Roadmap

### Phase 1: MVP (Current)

* Starter kit with dev node
* Python and JavaScript SDKs
* OpenAPI specification
* Example hello-reflection app
* Citizen Shield frontend
* Integration tools

### Phase 2: Testnet

* GIC blockchain implementation
* Proof-of-Cycle consensus
* Shield integration with zkRL
* Custodian node setup

### Phase 3: Mainnet

* Public custodian nodes
* Slashing mechanisms
* Governance with quadratic voting
* Policy time-locks

## Contributing

See CONTRIBUTING.md for development guidelines.

## License

See LICENSE for licensing information.

## About

Civic Protocol Core is a comprehensive blockchain platform for civic governance, combining AI companions, privacy-preserving verification, and democratic participation mechanisms.

### Resources

- [GitHub Repository](https://github.com/kaizencycle/Civic-Protocol-Core)
- [OpenAPI Documentation](docs/openapi.yaml)
- [Genesis Custodian Guide](GENESIS_CUSTODIAN_GUIDE.md)
- [CIP Templates](docs/)

### Contributors

* @kaizencycle **kaizencycle**
* @cursoragent **cursoragent** Cursor Agent