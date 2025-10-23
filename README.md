# 🧭 CIVIC OS — Kaizen Cycle Architecture

[![Civic OS Integrity Badge](https://img.shields.io/badge/CivicOS-Integrity%20≥%200.95-brightgreen)](https://civic-ledger.onrender.com)

> **Civic OS Overview — Kaizen Cycle Architecture**

```
                         ┌──────────────────────────────────┐
                         │   HUMAN INTENT / REFLECTION      │
                         │  (Command Ledger · E.O.M.M.)     │
                         └──────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              OAA HUB (Lab7)                              │
│   • parses human goals → JSON spec · tests · attestations                │
│   • acts as Civic OS shell / init system                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────┐     ┌──────────────────────────────┐
│     THOUGHT BROKER (API)     │◄───▶│     CURSOR / CI PIPELINE     │
│ bounded multi-agent loop →   │     │ builds PRs · runs tests ·    │
│ consensus spec · DelibProof  │     │ deploys canary releases      │
└──────────────────────────────┘     └──────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│           CIVIC LEDGER CORE / GIC INDEXER (Kernel)                        │
│   • Proof-of-Integrity ledger ("GI ≥ 0.95")                              │
│   • GIC UBI economy + attestation storage                               │
│   • Governance & version history layer                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│               CITIZEN SHIELD (Security / Network Perimeter)              │
│   • IDS/IPS + 2FA · sandbox · policy-as-code (Kyverno/Gatekeeper)       │
│   • Real-time GI liveness checks on every service                       │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│        API LAYER / SERVICE MESH (Lab4 → OAA API Library)                │
│   • public APIs & companion interfaces for Citizens · Agents            │
│   • functions as the "digital 3D printer" — renders ideas as code      │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                SENTINELS (Zeus · Jade · Eve · Hermes)                    │
│   • core AI agents = cortices of the system brain                       │
│   • self-healing autonomy via GI-gated feedback loops                   │
└──────────────────────────────────────────────────────────────────────────┘

                 ▲──────────────────── Civic Economy & Governance ───────────────────▲
                 │                                                                 │
                 │   Festival of Echoes · Citizen Oaths · GIC UBI · Policy Votes  │
                 └─────────────────────────────────────────────────────────────────┘
```

## 🔹 Quick Definition

| **Layer** | **Function** | **Analogy** |
|-----------|--------------|-------------|
| **Command Ledger** | Journal of cycles & reflection | BIOS / boot log |
| **OAA Hub** | Parses human intent | Shell / init.d |
| **Thought Broker** | Multi-LLM consensus engine | Thalamus / scheduler |
| **Cursor + CI** | Code fabrication & testing | Compiler / 3D printer |
| **Civic Ledger Core** | Immutable record, GIC economy | Kernel |
| **Citizen Shield** | Network & security policy | Firewall / OS defender |
| **API Library / Lab4** | Surface for all services | Application layer |
| **Sentinels** | AI cores ensuring integrity | Brain cortex modules |

## 🔹 Live Workflow

1. **Reflection** → Command Ledger writes intent
2. **OAA Hub** transforms intent → .civic/ specs
3. **Thought Broker** runs deliberation loops → Deliberation Proof + consensus
4. **Cursor / CI** prints new service code → canary deploy
5. **Civic Ledger Core** attests GI + GIC credit
6. **Citizen Shield** verifies liveness · policy · security
7. **API Library / Lab4** exposes service to citizens
8. **Sentinels** monitor GI, entropy, feedback → improve loop

## 🏗️ Monorepo Structure

```
civic-os/
├─ apps/                          # Core Applications
│  ├─ hub-web/                    # OAA Hub + .gic site maker (Next.js)
│  ├─ ledger-api/                 # Civic Ledger Core
│  ├─ indexer-api/                # GIC Indexer
│  ├─ eomm-api/                   # E.O.M.M. Reflections
│  ├─ shield-api/                 # Citizen Shield
│  ├─ broker-api/                 # Thought Broker
│  ├─ hive-app/                   # Hive (Citizen interface)
│  ├─ cathedral-app/              # Cathedral (Governance)
│  ├─ genesisdome-app/            # Genesis Dome
│  └─ api-gateway/                # API Gateway
├─ packages/                      # Shared Packages & Libraries
│  ├─ civic-sdk/                  # Shared API clients/types
│  ├─ integrity-core/             # GI scoring, /integrity-check helpers
│  ├─ oaa-memory/                 # .oaa parsers, schemas
│  ├─ ui-kit/                     # Shared React UI components
│  ├─ shield-policies/            # JSON schemas & request guards
│  ├─ atlas-sentinel/             # Atlas Sentinel monitoring
│  ├─ civic-protocol-core/        # ← INTEGRATED: Core blockchain protocols
│  ├─ oaa-api-library/            # ← INTEGRATED: OAA API library
│  └─ civic-ai-specs/             # ← INTEGRATED: AI specifications
├─ labs/                          # ← NEW: Lab Proof Systems
│  ├─ lab4-proof/                 # ← INTEGRATED: E.O.M.M. Reflections
│  ├─ lab6-proof/                 # ← INTEGRATED: Citizen Shield App
│  └─ lab7-proof/                 # ← INTEGRATED: OAA Hub & Shell
├─ sentinels/                     # AI Sentinel Agents
│  ├─ atlas/                      # Atlas Sentinel
│  ├─ eve/                        # Eve Sentinel
│  ├─ hermes/                     # Hermes Sentinel
│  ├─ jade/                       # Jade Sentinel
│  └─ zeus/                       # Zeus Sentinel
├─ configs/                       # Configuration Files
│  ├─ services.json               # Service manifest
│  └─ schemas/                    # JSON schemas
├─ infra/                         # Infrastructure
│  ├─ docker/                     # Docker Compose for local dev
│  └─ render.yaml                 # Multi-service deployment
└─ .github/workflows/             # CI/CD pipeline
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/kaizencycle/civic-os.git
cd civic-os

# Install dependencies
npm install

# Start all services locally
npm run compose:up

# Or start development servers
npm run dev
```

### Development

```bash
# Build all packages and apps
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run type-check

# Clean build artifacts
npm run clean
```

## 🔧 Services

### Core Services

- **hub-web** (Port 3000) - Main OAA Hub interface
- **ledger-api** (Port 4001) - Civic Ledger Core
- **indexer-api** (Port 4002) - GIC Indexer
- **eomm-api** (Port 4003) - E.O.M.M. Reflections
- **shield-api** (Port 4004) - Citizen Shield
- **broker-api** (Port 4005) - Thought Broker

### Citizen Interfaces

- **hive-app** (Port 3001) - Citizen collaboration tools
- **cathedral-app** (Port 3002) - Governance interface
- **genesisdome-app** (Port 3003) - Genesis interface

## 📦 Packages

### Core Packages
- **@civic/sdk** - Shared API clients and types
- **@civic/integrity-core** - GI scoring and integrity checks
- **@civic/oaa-memory** - OAA parsers and memory management
- **@civic/ui-kit** - Shared React components
- **@civic/shield-policies** - Security policies and guards
- **@civic/atlas-sentinel** - Atlas Sentinel monitoring

### Integrated Packages
- **@civic/protocol-core** - Core blockchain and governance protocols
- **@civic/oaa-api-library** - Comprehensive OAA API library
- **@civic/ai-specs** - AI specifications and standards

## 🔬 Labs

### Lab Proof Systems
- **@civic/lab4-proof** - E.O.M.M. Reflections API and Civic Ledger integration
- **@civic/lab6-proof** - Citizen Shield application (React/TypeScript)
- **@civic/lab7-proof** - OAA Hub and Civic OS shell/init system

## 🔄 CI/CD Pipeline

The monorepo uses Turborepo for efficient builds and GitHub Actions for CI/CD:

1. **Lint** - Code quality checks
2. **Type Check** - TypeScript validation
3. **Build** - Compile all packages and apps
4. **Test** - Run test suites
5. **Security** - Security vulnerability scans
6. **Integrity** - Civic OS integrity gates
7. **Deploy** - Deploy changed services to Render

## 🐳 Docker Development

```bash
# Start all services with Docker Compose
npm run compose:up

# Stop all services
npm run compose:down

# View logs
docker compose -f infra/docker/compose.yml logs -f
```

## 🌐 Deployment

Services are deployed to Render using the `infra/render.yaml` configuration. Each service is deployed independently based on changes detected in the CI pipeline.

## 📊 Integrity Monitoring

All services include integrity checks and health endpoints:

- `/healthz` - Basic health check
- `/api/integrity-check` - Civic OS integrity verification
- `/v1/loop/health` - Thought Broker specific health

## 🔐 Security

- **Citizen Shield** provides network security and policy enforcement
- **Integrity Core** ensures GI ≥ 0.95 across all services
- **Shield Policies** enforce rate limits and input validation
- **Real-time monitoring** of service health and security posture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Integrated Repositories

This monorepo integrates all kaizencycle repositories using git subtree:

### Lab Repositories
- [lab4-proof](https://github.com/kaizencycle/lab4-proof) → `labs/lab4-proof/`
- [lab6-proof](https://github.com/kaizencycle/lab6-proof) → `labs/lab6-proof/`
- [lab7-proof](https://github.com/kaizencycle/lab7-proof) → `labs/lab7-proof/`

### Core Packages
- [Civic-Protocol-Core](https://github.com/kaizencycle/Civic-Protocol-Core) → `packages/civic-protocol-core/`
- [OAA-API-Library](https://github.com/kaizencycle/OAA-API-Library) → `packages/oaa-api-library/`
- [civic-ai-specs](https://github.com/kaizencycle/civic-ai-specs) → `packages/civic-ai-specs/`

## 🔗 Links

- [Civic Ledger](https://civic-ledger.onrender.com)
- [Kaizen Cycle](https://github.com/kaizencycle)
- [Command Ledger III](https://github.com/kaizencycle/command-ledger-iii)

---

**Civic OS** - Where human intent meets digital reality through integrity, consensus, and continuous improvement.

*Cycle C-109 | Chamber ID: CivicOS-main-tree | Parent: Command Ledger III*
