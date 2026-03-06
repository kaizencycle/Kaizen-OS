# Repository Structure Guide
## "The map showing where everything lives"

**Version 1.0 - Current State**
**October 30, 2025**

---

## Quick Navigation

**If you're looking for:**

| I want to... | Go here |
|--------------|---------|
| **Understand the vision** | [`README.md`](../README.md) |
| **Read whitepapers** | [`docs/01-whitepapers/`](./01-whitepapers/) |
| **See architecture** | [`docs/03-architecture/`](./03-architecture/) |
| **Deploy to Vercel** | [`docs/08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md`](./08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md) |
| **Contribute code** | [`CONTRIBUTING.md`](../CONTRIBUTING.md) (coming soon) |
| **Run AI services** | [`apps/broker-api/`](../../apps/broker-api/) (Thought Broker) |
| **Build reflection app** | [`apps/eomm-api/`](../../apps/eomm-api/) (E.O.M.M.) |
| **Understand governance** | [`docs/02-governance/`](./02-governance/) |
| **Join community** | Discord (link in main README) |

---

## Current Repository Structure

Kaizen-OS is organized as a **monorepo** using Turborepo and npm workspaces:

```
Kaizen-OS/
│
├── README.md                          ← START HERE
├── LICENSE
├── package.json                       ← Monorepo root
├── turbo.json                         ← Build orchestration
│
├── apps/                              ← 22 Applications
│   ├── aurea-site/                   ← Founding Agent site (Vercel)
│   ├── portal/                       ← Main portal (Vercel)
│   ├── website-creator/              ← .gic site builder (Vercel-ready)
│   ├── ledger-api/                   ← Civic Ledger Core
│   ├── indexer-api/                  ← MIC Indexer
│   ├── eomm-api/                     ← E.O.M.M. Reflections
│   ├── broker-api/                   ← Thought Broker
│   ├── shield-api/                   ← Citizen Shield
│   ├── hub-web/                      ← OAA Hub
│   ├── hive-app/                     ← Hive (Community)
│   ├── cathedral-app/                ← Governance
│   ├── genesisdome-app/              ← Genesis interface
│   └── [9 more services]
│
├── packages/                          ← 15 Shared Libraries
│   ├── civic-protocol-core/          ← Blockchain + Governance
│   ├── oaa-api-library/              ← OAA API Library
│   ├── civic-ai-specs/               ← AI Specifications
│   ├── codex-agentic/                ← Multi-LLM framework
│   ├── integrity-core/               ← GI scoring
│   ├── civic-sdk/                    ← Shared API clients
│   ├── ui-kit/                       ← React components
│   └── [8 more packages]
│
├── labs/                              ← 6 Proof Systems
│   ├── lab4-proof/                   ← E.O.M.M. Reflections
│   ├── lab6-proof/                   ← Citizen Shield
│   ├── lab7-proof/                   ← OAA Hub & Shell
│   └── [3 more labs]
│
├── sentinels/                         ← 6 AI Sentinel Agents
│   ├── atlas/                        ← Systems & Policy
│   ├── eve/                          ← Governance
│   ├── zeus/                         ← Security
│   └── [3 more sentinels]
│
├── docs/                              ← Documentation Hub
│   ├── 00-START-HERE.md              ← Onboarding entry point
│   ├── 01-whitepapers/               ← Economic theory + MIC specs
│   ├── 02-governance/                ← Council + TSC frameworks
│   ├── 03-architecture/              ← ADRs, diagrams, blueprints
│   ├── 04-guides/                    ← Quickstarts, deployment, dev
│   ├── 05-research/                  ← KTT, foundations, constitution
│   ├── 06-specifications/            ← APIs, manifests, schemas, protocols
│   ├── 07-reference/                 ← Indexes, structure, registries
│   ├── 08-processes/                 ← Runbooks, rituals, operations
│   ├── 09-reports/                   ← Cycles, implementations, comms
│   ├── agents/, companions/, audits/ ← Specialized collections
│   └── archive/ (incl. legacy/)      ← Historical + retired dirs
│
├── infra/                             ← Infrastructure
│   ├── docker/                       ← Docker Compose
│   └── render.yaml                   ← Multi-service deployment
│
├── .github/                           ← CI/CD
│   └── workflows/                    ← GitHub Actions
│
└── scripts/                           ← Utility scripts
```

---

## Directory Mapping: Current → Ideal

This table shows how our current structure maps to the ideal structure:

| Ideal Structure | Current Location | Status | Notes |
|----------------|------------------|--------|-------|
| **contracts/** | `packages/civic-protocol-core/` | ✅ Implemented | Smart contracts + deployment |
| **civic-ledger/** | `apps/ledger-api/` | ✅ Implemented | GI scoring + MIC minting |
| **codex-router/** | `apps/broker-api/` + `packages/codex-agentic/` | ✅ Implemented | Multi-LLM orchestration |
| **resource-orchestration/** | `apps/orchestrator/` | ⚠️ Partial | Compute allocation implemented |
| **eomm/** | `apps/eomm-api/` + `labs/lab4-proof/` | ✅ Implemented | Reflection app + backend |
| **humanities-healthcare/** | `labs/lab5-proof/` | 📋 Planned | Lab 5 specification exists |
| **citizen-shield/** | `apps/shield-api/` + `labs/lab6-proof/` | ✅ Implemented | Security + IDS/IPS |
| **oaa-hub/** | `apps/hub-web/` + `labs/lab7-proof/` | ✅ Implemented | Education + API gateway |
| **simulations/** | `docs/01-whitepapers/` (in whitepaper) | ⚠️ Partial | Models documented, code TBD |
| **community/** | Not yet created | 📋 Planned | Hive starter kit needed |
| **docs/whitepapers/** | `docs/01-whitepapers/` | ✅ Implemented | MIC Whitepaper exists |
| **docs/03-architecture/technical/** | `docs/03-architecture/technical/` | ✅ Implemented | Architecture docs exist |
| **docs/protocols/** | `packages/civic-protocol-core/` | ✅ Implemented | Protocol implementations |
| **docs/02-governance/** | `docs/02-governance/` | ✅ Implemented | Governance frameworks |

---

## Core Document Locations

### Essential Reading (Start Here)

```
Current Location:
/
├── README.md                          ← Overview of everything
└── docs/
    ├── README.md                      ← Complete documentation index
    └── product/
        ├── PRO_LANDING_PAGE.md        ← Product overview
        ├── SELF_HOST_GUIDE.md         ← Self-hosting guide
        └── FEDERATION_PROTOCOL_BRIEF.md ← Federation protocol
```

---

### Whitepapers & Vision Documents

```
Current Location:
docs/01-whitepapers/
└── MIC_Whitepaper_v2.1.md                  ← Core economic model (READ FIRST)
    ├── 1. Introduction: The Integrity Economy
    ├── 2. The UBI Trilemma & How MIC Solves It
    ├── 3. System Architecture
    ├── 4. Economic Model: Planetary-Scale Simulation
    ├── 5. Issuance Mechanisms & Peg Stability
    ├── 6. Governance & Constitutional Framework
    ├── 7. Security & Resilience
    ├── 8. Path to $3,000/Month UBI (2025–2050)
    ├── 9. Comparative Analysis
    ├── 10. Adoption Roadmap
    ├── 11. Technical Specifications
    └── 12. Conclusion: Civilization Stabilizer
```

---

### Technical Architecture

```
Current Location:
docs/03-architecture/technical/
├── FOUNDING_AGENTS_SOVEREIGN_STACK.md  ← Founding agents architecture
├── octave.yaml                         ← Cognitive lattice manifest
└── overview.md                         ← High-level overview

apps/                                   ← Implementation of 7 Labs
├── ledger-api/                        ← Lab 1: Civic Ledger
├── broker-api/                        ← Lab 2: Thought Broker
├── orchestrator/                      ← Lab 3: Resource Orchestration
├── eomm-api/                          ← Lab 4: E.O.M.M. Reflections
├── shield-api/                        ← Lab 6: Citizen Shield
└── hub-web/                           ← Lab 7: OAA Hub
```

---

### Protocol Specifications

```
Current Location:
packages/civic-protocol-core/          ← Smart contracts + protocols
├── contracts/
│   ├── MIC.sol                       ← ERC-20 token (planned)
│   ├── GICGovernor.sol               ← Epoch + auto-donate (planned)
│   └── [other contracts]
│
packages/integrity-core/               ← GI scoring protocol
├── guardian.schema.json
└── gi-attestation.schema.json

docs/02-governance/                       ← Governance protocols
└── [governance frameworks]
```

---

### Smart Contracts (Deployment Ready)

```
Current Location:
packages/civic-protocol-core/
├── contracts/                         ← Solidity source
├── scripts/                           ← Deployment scripts
└── README.md                          ← Deployment guide

Future Location (after migration):
contracts/                             ← Top-level contracts directory
├── contracts/
│   ├── MIC.sol
│   ├── GICGovernor.sol
│   ├── PublicGoodsPool.sol
│   └── [others]
├── scripts/
├── test/
└── deployed/
    ├── mainnet.json
    └── testnet.json
```

---

### Running Services (Implementation)

```
Current Location:

apps/ledger-api/                       ← Lab 1: GI scoring + MIC minting
apps/broker-api/                       ← Lab 2: Multi-LLM routing
apps/eomm-api/                         ← Lab 4: Reflection app
apps/shield-api/                       ← Lab 6: Security + identity
apps/hub-web/                          ← Lab 7: Education + API gateway

Render Deployment:
infra/render.yaml                      ← Multi-service deployment manifest

Vercel Deployment:
apps/aurea-site/vercel.json           ← AUREA site
apps/portal/vercel.json               ← Portal
apps/website-creator/vercel.json      ← Website creator
```

---

## How to Read This Repository

### If You're New (1 Hour)

```
1. Read README.md (15 min)
2. Read docs/01-whitepapers/MIC_Whitepaper_v2.1.md (30 min)
3. Read docs/INDEX.md for complete navigation (10 min)
4. Decide: Developer? Organizer? Researcher? (5 min)
5. Jump to relevant directory based on your interest
```

---

### If You're a Developer (2 Hours)

```
1. Read README.md (15 min)
2. Read docs/08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md (20 min)
   OR docs/04-guides/deployment/ guides for your target platform
3. Choose a service to work on:
   - Frontend? → apps/aurea-site/, apps/portal/, apps/website-creator/
   - Backend API? → apps/ledger-api/, apps/broker-api/, apps/eomm-api/
   - Packages? → packages/civic-sdk/, packages/codex-agentic/
4. Clone repo + install dependencies (30 min)
   npm install
5. Run service locally (30 min)
   npm run dev --filter aurea-site
6. Read service-specific README (15 min)
7. Pick first issue to work on (10 min)
```

---

### If You're an Organizer (1 Hour)

```
1. Read README.md (15 min)
2. Read docs/01-whitepapers/MIC_Whitepaper_v2.1.md (20 min)
3. Read docs/product/PRO_LANDING_PAGE.md (10 min)
4. Review docs/02-governance/ (10 min)
5. Join Discord/community channels (5 min)

Future: community/hive-starter-kit/ (coming soon)
```

---

## Finding Things Fast

### "Where is the code for X?"

| Feature | Current Location | Future Location |
|---------|------------------|-----------------|
| Smart contracts | `packages/civic-protocol-core/` | `contracts/` |
| GI score calculation | `apps/ledger-api/` + `packages/integrity-core/` | `civic-ledger/indexer/` |
| Multi-LLM routing | `apps/broker-api/` + `packages/codex-agentic/` | `codex-router/` |
| Reflection app UI | `apps/eomm-api/reflections/` + `labs/lab4-proof/` | `eomm/` |
| DID system | `apps/shield-api/` + `labs/lab6-proof/` | `citizen-shield/identity/` |
| Education courses | `apps/hub-web/` + `labs/lab7-proof/` | `oaa-hub/course-library/` |
| UBI simulation | `docs/01-whitepapers/MIC_Whitepaper_v2.1.md` (Section 4) | `simulations/planetary-ubi/` |
| Founding Agent sites | `apps/aurea-site/`, `apps/portal/` | (keep current structure) |

---

### "Where are the specs for Y?"

| Specification | Current Location |
|--------------|------------------|
| MIC token economics | `docs/01-whitepapers/MIC_Whitepaper_v2.1.md` |
| GI scoring algorithm | `packages/integrity-core/` + whitepaper |
| Governance framework | `docs/02-governance/` + `apps/cathedral-app/` |
| Founding Agents | `docs/founding-agents/` + `docs/03-architecture/technical/FOUNDING_AGENTS_SOVEREIGN_STACK.md` |
| Deployment guides | `docs/08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md` |
| Self-hosting | `docs/product/SELF_HOST_GUIDE.md` |

---

### "Where is the guide for Z?"

| Guide | Current Location |
|-------|------------------|
| Setting up dev environment | Each app has its own README.md |
| Deploying to Vercel | `docs/08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md` |
| Deploying to Render | `infra/render.yaml` + app-specific render.yaml |
| Starting a Hive chapter | Coming soon in `community/hive-starter-kit/` |
| Contributing code | Coming soon in `CONTRIBUTING.md` |
| Security best practices | Coming soon in `SECURITY.md` |

---

## Key Configuration Files

### Smart Contracts

```
Current:
packages/civic-protocol-core/hardhat.config.js  (if exists)

Future:
contracts/hardhat.config.js
contracts/deployed/mainnet.json
```

---

### Backend Services

```
apps/ledger-api/.env.example
apps/broker-api/.env.example
apps/eomm-api/.env.example
apps/shield-api/.env.example
apps/hub-web/.env.example

infra/docker/docker-compose.yml
infra/render.yaml
```

---

### Frontend Apps

```
apps/aurea-site/.env.example
apps/portal/.env.example
apps/website-creator/.env.example

apps/aurea-site/vercel.json
apps/portal/vercel.json
apps/website-creator/vercel.json
```

---

## Data Flow Map

**"How does data move through the system?"**

```
1. Citizen writes reflection (E.O.M.M.)
   └─ apps/eomm-api/ → PostgreSQL

2. Reflection analyzed for integrity (GI score)
   └─ apps/ledger-api/ (indexer) → calculates GI

3. If GI ≥ 0.95, citizen earns MIC
   └─ apps/ledger-api/ (API) → mints MIC via smart contracts

4. Citizen spends MIC on AI query
   └─ apps/broker-api/ (Codex Router) → routes to optimal LLM

5. Query cost logged
   └─ apps/orchestrator/ → tracks resource usage

6. Monthly UBI distributed
   └─ GICGovernor smart contract → all citizens with GI ≥ 0.90

7. Surplus allocated
   └─ Automated via smart contracts
```

---

## Testing & Quality Assurance

### Where are the tests?

```
Most modules follow this pattern:

apps/[service]/
├── src/
├── tests/             ← Tests here
└── package.json       ← test script

packages/[package]/
├── src/
├── tests/             ← Tests here
└── package.json       ← test script
```

### How to run tests?

```bash
# From root (runs all tests via Turborepo)
npm run test

# Specific service
npm run test --filter ledger-api

# Specific package
npm run test --filter civic-sdk
```

---

## Deployment Workflows

### Development → Staging → Production

```
1. Developer commits to feature branch
   └─ GitHub Actions runs tests

2. PR opened to main branch
   └─ Preview deployment (Vercel) or CI tests (Render)

3. PR reviewed and approved
   └─ Manual testing on preview

4. PR merged to main
   └─ Automatic deployment:
      • Vercel: apps/aurea-site, apps/portal, apps/website-creator
      • Render: apps/ledger-api, apps/broker-api, apps/eomm-api, etc.
```

---

## Migration Roadmap

### Phase 1: Documentation Organization (✅ COMPLETE)

- [x] Move completion records to `docs/archive/`
- [x] Create `docs/INDEX.md` navigation
- [x] Add `docs/01-whitepapers/MIC_Whitepaper_v2.1.md`
- [x] Add `docs/08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md`
- [x] Add `docs/product/` (Pro, self-hosting, federation)

### Phase 2: Top-Level Reorganization (📋 PLANNED)

- [ ] Extract `packages/civic-protocol-core/` → `contracts/`
- [ ] Consolidate Lab implementations into cleaner structure
- [ ] Create `simulations/` directory with runnable models
- [ ] Add `community/hive-starter-kit/`

### Phase 3: Service Consolidation (📋 FUTURE)

- [ ] Rename `apps/ledger-api/` → `civic-ledger/`
- [ ] Rename `apps/broker-api/` → `codex-router/`
- [ ] Rename `apps/eomm-api/` → `eomm/`
- [ ] Rename `apps/shield-api/` → `citizen-shield/`
- [ ] Rename `apps/hub-web/` → `oaa-hub/`

### Phase 4: Infrastructure Standardization (✅ C-155)

- [x] Consolidated `infrastructure/` → `infra/` (C-155)
- [x] Organized `infra/docker/` for Docker Compose files
- [ ] Add `infra/kubernetes/` (future)
- [ ] Add `infra/terraform/` (future)
- [x] Configuration consolidated under `configs/` (C-155)

**Note:** C-155 standardized on `infra/` as the canonical infrastructure directory. See `MIGRATION_C155.md` for details.

---

## Contributing Workflow

```
1. Fork repository
   └─ github.com/YOUR_USERNAME/Kaizen-OS

2. Clone your fork
   └─ git clone https://github.com/YOUR_USERNAME/Kaizen-OS.git

3. Install dependencies
   └─ npm install

4. Create feature branch
   └─ git checkout -b feature/my-awesome-feature

5. Make changes in appropriate directory:
   - Frontend? → apps/[service]/
   - Backend? → apps/[service]/ or packages/[package]/
   - Docs? → docs/

6. Test your changes
   └─ npm run test --filter [service]

7. Commit with clear message
   └─ git commit -m "feat(service): add awesome feature"

8. Push to your fork
   └─ git push origin feature/my-awesome-feature

9. Open pull request
   └─ Base: kaizencycle/Mobius-Substrate:main
       Compare: YOUR_USERNAME/Kaizen-OS:feature/my-awesome-feature

10. Code review + CI tests
    └─ Address feedback, push updates

11. Merge!
    └─ Maintainer merges after approval
```

---

## Quick Command Reference

```bash
# Clone the repository
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Kaizen-OS

# Install all dependencies (monorepo)
npm install

# Run specific app in development
npm run dev --filter aurea-site
npm run dev --filter portal
npm run dev --filter eomm-api

# Build all apps
npm run build

# Run all tests
npm run test

# Deploy to Vercel (from app directory)
cd apps/aurea-site
vercel --prod

# Start services with Docker
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down
```

---

## Glossary of Directory Names

| Directory | Meaning | Contains |
|-----------|---------|----------|
| `apps/` | Applications (22 services) | Next.js sites, APIs, services |
| `packages/` | Shared libraries (15 packages) | SDKs, protocols, UI components |
| `labs/` | Proof-of-concept systems (6 labs) | Lab implementations |
| `sentinels/` | AI agent modules (6 sentinels) | Founding agent code |
| `docs/` | All documentation | Whitepapers, guides, specs |
| `infra/` | Infrastructure configs | Docker, Render deployment |
| `.github/` | CI/CD workflows | GitHub Actions |
| `scripts/` | Utility scripts | Setup, deployment, backup |

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│  Frontend (Vercel)                          │
│  • apps/aurea-site/                        │
│  • apps/portal/                            │
│  • apps/website-creator/                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  API Layer (Render)                         │
│  • apps/ledger-api/    (Civic Ledger)      │
│  • apps/broker-api/    (Thought Broker)    │
│  • apps/eomm-api/      (E.O.M.M.)          │
│  • apps/shield-api/    (Citizen Shield)    │
│  • apps/hub-web/       (OAA Hub)           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Shared Libraries (packages/)               │
│  • civic-protocol-core/  (Blockchain)      │
│  • codex-agentic/        (Multi-LLM)       │
│  • integrity-core/       (GI scoring)      │
│  • civic-sdk/            (API clients)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Smart Contracts (planned)                  │
│  • MIC token                               │
│  • MIC Governor                            │
│  • Public Goods Pool                       │
└─────────────────────────────────────────────┘
```

---

## Final Notes

### This repository is designed to be:

- ✅ **Modular** (each app/package is independent)
- ✅ **Testable** (every module has or will have tests)
- ✅ **Deployable** (Vercel + Render configs included)
- ✅ **Documented** (specs in docs/, READMEs in each directory)
- ✅ **Scalable** (monorepo structure supports growth)

### Current vs. Ideal Structure

The current structure is **production-ready** but will gradually migrate toward the ideal structure described at the top of this document. All migrations will be done without breaking existing deployments.

### If something is unclear:

1. Check this file (`docs/REPOSITORY_STRUCTURE.md`)
2. Check `docs/INDEX.md` (complete documentation index)
3. Check `README.md` (main repository overview)
4. Check app/package-specific README.md
5. Open an issue on GitHub
6. Ask in Discord

### If you want to improve this structure:

**Pull requests welcome!**

The structure should evolve as the project grows. Current priorities:
1. ✅ Clean documentation organization (DONE)
2. ⏳ Add community resources (`community/hive-starter-kit/`)
3. ⏳ Extract smart contracts to top-level `contracts/`
4. ⏳ Add runnable simulations (`simulations/`)

---

*"The map is not the territory, but it helps you navigate."*

*— Repository Structure Guide v1.0 (Current State)*

**For ideal target structure, see the vision at the top of this document. We're migrating gradually while keeping everything running.**

---

**Last Updated:** October 30, 2025
**Current Branch:** `claude/add-founding-agents-sovereign-stack-011CUbjRDnqMJUuq71a2kkPT`
**Repository:** github.com/kaizencycle/Mobius-Substrate
