# Repository Structure Guide
## "The map showing where everything lives"

**Version 1.0**  
**October 29, 2025**

---

## Quick Navigation

**If you're looking for:**

| I want to... | Go here |
|--------------|---------|
| **Understand the vision** | [`README.md`](./README.md) |
| **Read whitepapers** | [`docs/`](./docs/) |
| **See implementation roadmap** | [`ROADMAP.md`](./ROADMAP.md) |
| **Fork this project** | [`FORKING_GUIDE.md`](./FORKING_GUIDE.md) |
| **Contribute code** | [`CONTRIBUTING.md`](./CONTRIBUTING.md) |
| **Deploy smart contracts** | [`contracts/`](./contracts/) |
| **Run AI services** | [`codex-router/`](./codex-router/) |
| **Build reflection app** | [`eomm/`](./eomm/) |
| **Start a Hive chapter** | [`community/hive-starter-kit/`](./community/hive-starter-kit/) |
| **Understand governance** | [`GOVERNANCE.md`](./GOVERNANCE.md) |

---

## The Complete File Tree

```
kaizen-cycle/
│
├── README.md                          ← START HERE
├── LICENSE                            ← CC0 (public domain)
├── ROADMAP.md                         ← 90-day sprints, 25-year vision
├── GOVERNANCE.md                      ← How decisions are made
├── FORKING_GUIDE.md                   ← How to fork/continue this work
├── CONTRIBUTING.md                    ← How to contribute
├── CODE_OF_CONDUCT.md                 ← Community standards
├── SECURITY.md                        ← How to report vulnerabilities
├── CONTACTS.md                        ← Emergency contacts
│
├── docs/                              ← 📚 All specifications & whitepapers
│   ├── README.md                      ← Index of all documents
│   │
│   ├── whitepapers/                   ← Core vision documents
│   │   ├── GIC_Whitepaper_Final.md
│   │   ├── GIC_Foundation_Up_Economics.md
│   │   ├── planetary_ubi_simulation.md
│   │   └── Future_Technology_UBI.md
│   │
│   ├── architecture/                  ← Technical architecture
│   │   ├── Kaizen_OS_Complete_Lab_Architecture.md
│   │   ├── Lab1_Civic_Ledger_Spec.md
│   │   ├── Lab2_Thought_Broker_Spec.md
│   │   ├── Lab3_Resource_Orchestration_Spec.md
│   │   ├── Lab4_EOMM_Spec.md
│   │   ├── Lab5_Humanities_Healthcare_Spec.md
│   │   ├── Lab6_Citizen_Shield_Spec.md
│   │   └── Lab7_OAA_Hub_Spec.md
│   │
│   ├── protocols/                     ← Protocol specifications
│   │   ├── gic_token_protocol.md
│   │   ├── gaia_staking_protocol.md
│   │   ├── delib_proof_protocol.md
│   │   ├── gi_scoring_protocol.md
│   │   └── integrity_covenant.md
│   │
│   ├── governance/                    ← Governance documents
│   │   ├── virtue_accords.md          ← Constitution
│   │   ├── founding_agents.md         ← 8 agent descriptions
│   │   ├── guardrails_codex.md        ← Capture prevention
│   │   ├── festival_of_echoes.md      ← Quarterly governance
│   │   └── elder_thrones.md           ← Human oversight
│   │
│   └── api/                           ← API documentation
│       ├── civic_ledger_api.md
│       ├── codex_router_api.md
│       ├── eomm_api.md
│       └── resource_orchestration_api.md
│
├── contracts/                         ← 📜 Smart contracts (Solidity)
│   ├── README.md                      ← How to deploy
│   ├── hardhat.config.js              ← Hardhat configuration
│   ├── package.json
│   │
│   ├── contracts/                     ← Solidity source
│   │   ├── GIC.sol                    ← ERC-20 token
│   │   ├── GICGovernor.sol            ← 90-day epoch + auto-donate
│   │   ├── PublicGoodsPool.sol        ← Treasury management
│   │   ├── CivicLedger.sol            ← On-chain integrity proofs
│   │   ├── GaiaStaking.sol            ← Ecological staking
│   │   └── BurnVault.sol              ← Festival burn mechanism
│   │
│   ├── scripts/                       ← Deployment scripts
│   │   ├── deploy.js
│   │   ├── initialize.js
│   │   └── verify.js
│   │
│   ├── test/                          ← Contract tests
│   │   ├── GIC.test.js
│   │   ├── GICGovernor.test.js
│   │   └── integration.test.js
│   │
│   └── deployed/                      ← Deployed contract addresses
│       ├── mainnet.json
│       └── testnet.json
│
├── civic-ledger/                      ← 🔍 Lab 1: Integrity proofs & GIC minting
│   ├── README.md
│   ├── docker-compose.yml
│   │
│   ├── indexer/                       ← GI score calculation
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── gi_calculator.py
│   │   │   ├── blockchain_sync.py
│   │   │   └── attestation_validator.py
│   │   ├── tests/
│   │   └── requirements.txt
│   │
│   ├── api/                           ← REST API
│   │   ├── src/
│   │   │   ├── main.py                ← FastAPI app
│   │   │   ├── routes/
│   │   │   │   ├── gi_index.py
│   │   │   │   ├── gic_mint.py
│   │   │   │   └── attestation.py
│   │   │   └── models/
│   │   ├── tests/
│   │   └── requirements.txt
│   │
│   └── schemas/                       ← JSON schemas
│       ├── gi_payload.json
│       ├── attestation.json
│       └── mint_request.json
│
├── codex-router/                      ← 🤖 Lab 2: Multi-LLM orchestration
│   ├── README.md
│   ├── docker-compose.yml
│   │
│   ├── src/
│   │   ├── main.py                    ← FastAPI app
│   │   ├── deliberation.py            ← DelibProof consensus
│   │   ├── providers.py               ← LLM provider integrations
│   │   │   ├── openai.py
│   │   │   ├── anthropic.py
│   │   │   ├── google.py
│   │   │   ├── deepseek.py
│   │   │   └── local.py
│   │   ├── cost_optimizer.py          ← Lab 3 integration
│   │   ├── quota_manager.py
│   │   └── routing_logic.py
│   │
│   ├── tests/
│   │   ├── test_deliberation.py
│   │   ├── test_providers.py
│   │   └── test_routing.py
│   │
│   └── config/
│       ├── model_config.yaml
│       └── routing_rules.yaml
│
├── resource-orchestration/            ← ⚙️ Lab 3: Compute/energy/supply chain
│   ├── README.md
│   │
│   ├── compute-allocation/            ← AI query routing
│   │   ├── src/
│   │   │   ├── allocator.py
│   │   │   ├── load_balancer.py
│   │   │   └── cost_optimizer.py
│   │   └── tests/
│   │
│   ├── energy-routing/                ← Smart grid integration
│   │   ├── src/
│   │   │   ├── grid_interface.py
│   │   │   ├── battery_optimizer.py
│   │   │   └── demand_response.py
│   │   └── tests/
│   │
│   ├── supply-chain/                  ← Food/water/housing logistics
│   │   ├── src/
│   │   │   ├── food_coordinator.py
│   │   │   ├── water_allocator.py
│   │   │   ├── housing_matcher.py
│   │   │   └── route_optimizer.py
│   │   └── tests/
│   │
│   └── financial-flows/               ← GIC settlement
│       ├── src/
│       │   ├── settlement_engine.py
│       │   ├── ubi_distributor.py
│       │   └── debt_repayment.py
│       └── tests/
│
├── eomm/                              ← 📝 Lab 4: Reflections & memory
│   ├── README.md
│   │
│   ├── reflection-app/                ← React frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── components/
│   │   │   │   ├── ReflectionEditor.jsx
│   │   │   │   ├── CompanionChat.jsx
│   │   │   │   └── GICBalance.jsx
│   │   │   ├── pages/
│   │   │   └── hooks/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── backend/                       ← FastAPI + PostgreSQL
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── routes/
│   │   │   │   ├── reflections.py
│   │   │   │   ├── companions.py
│   │   │   │   └── training_data.py
│   │   │   ├── models/
│   │   │   └── db.py
│   │   ├── migrations/
│   │   └── tests/
│   │
│   └── training-pipeline/             ← Convert reflections → AI training
│       ├── src/
│       │   ├── data_cleaner.py
│       │   ├── anonymizer.py
│       │   ├── quality_filter.py
│       │   └── export_hf.py           ← Export to HuggingFace format
│       └── tests/
│
├── humanities-healthcare/             ← 🏥 Lab 5: Physical wellbeing
│   ├── README.md
│   │
│   ├── health-commons/                ← Clinic software
│   │   ├── patient-portal/            ← React app
│   │   ├── ehr-system/                ← Electronic health records
│   │   ├── telemedicine/              ← Video consultation
│   │   └── mental-health-triage/      ← E.O.M.M. integration
│   │
│   ├── food-network/                  ← Farm-to-Hive coordination
│   │   ├── proof-of-harvest/          ← Upload photos → earn GIC
│   │   ├── inventory-tracker/         ← Food co-op inventory
│   │   ├── delivery-router/           ← Logistics optimization
│   │   └── pricing-calculator/        ← GIC-denominated basket
│   │
│   ├── housing-trust/                 ← Rent-to-own tracking
│   │   ├── unit-registry/             ← Available housing units
│   │   ├── equity-tracker/            ← Citizen equity accumulation
│   │   ├── maintenance-scheduler/     ← Predictive maintenance
│   │   └── matching-algorithm/        ← Match citizens to units
│   │
│   ├── social-fabric/                 ← Hive chapter tools
│   │   ├── hive-calendar/             ← Event scheduling
│   │   ├── buddy-matcher/             ← Loneliness prevention
│   │   ├── restorative-circles/       ← Conflict resolution
│   │   └── skill-exchange/            ← Time banking
│   │
│   └── creative-expression/           ← Arts & culture
│       ├── civic-arts-fund/           ← Grant application system
│       ├── maker-space-booking/       ← Reserve workshop time
│       ├── storytelling-platform/     ← E.O.M.M. anthology
│       └── ritual-library/            ← Music, ceremonies
│
├── citizen-shield/                    ← 🛡️ Lab 6: Security & identity
│   ├── README.md
│   │
│   ├── identity/                      ← DID system
│   │   ├── src/
│   │   │   ├── did_manager.py
│   │   │   ├── key_management.py
│   │   │   └── verification.py
│   │   └── tests/
│   │
│   ├── network-defense/               ← IDS/IPS
│   │   ├── src/
│   │   │   ├── intrusion_detection.py
│   │   │   ├── anomaly_scanner.py
│   │   │   └── threat_response.py
│   │   └── tests/
│   │
│   ├── companion-system/              ← AI identity anchors
│   │   ├── src/
│   │   │   ├── companion_training.py
│   │   │   ├── behavioral_analysis.py
│   │   │   └── sybil_detection.py
│   │   └── tests/
│   │
│   └── encryption/                    ← Privacy tools
│       ├── src/
│       │   ├── e2e_encryption.py
│       │   ├── zkp_proofs.py
│       │   └── data_anonymizer.py
│       └── tests/
│
├── oaa-hub/                           ← 🎓 Lab 7: Education & API gateway
│   ├── README.md
│   │
│   ├── course-library/                ← Educational content
│   │   ├── health/
│   │   │   ├── first-aid.md
│   │   │   ├── nutrition.md
│   │   │   └── mental-health.md
│   │   ├── skills/
│   │   │   ├── cooking.md
│   │   │   ├── gardening.md
│   │   │   └── home-repair.md
│   │   ├── tech/
│   │   │   ├── python.md
│   │   │   ├── blockchain.md
│   │   │   └── ai-fundamentals.md
│   │   └── civic/
│   │       ├── governance.md
│   │       ├── restorative-justice.md
│   │       └── community-organizing.md
│   │
│   ├── api-gateway/                   ← Service mesh
│   │   ├── src/
│   │   │   ├── main.py                ← Kong or custom gateway
│   │   │   ├── auth_middleware.py
│   │   │   ├── rate_limiter.py
│   │   │   └── service_discovery.py
│   │   └── tests/
│   │
│   ├── shell/                         ← CLI + init system
│   │   ├── src/
│   │   │   ├── cli.py
│   │   │   ├── commands/
│   │   │   │   ├── reflect.py
│   │   │   │   ├── stake.py
│   │   │   │   ├── vote.py
│   │   │   │   └── hive.py
│   │   │   └── init_system.py
│   │   └── tests/
│   │
│   └── certification/                 ← Course completion tracking
│       ├── src/
│       │   ├── certificate_issuer.py
│       │   ├── skill_verifier.py
│       │   └── credential_nft.py
│       └── tests/
│
├── simulations/                       ← 📊 Economic models & stress tests
│   ├── README.md
│   │
│   ├── planetary-ubi/                 ← 20-year UBI projections
│   │   ├── model.py
│   │   ├── parameters.yaml
│   │   └── results/
│   │       └── 2025-2045_projection.csv
│   │
│   ├── debt-repayment/                ← National debt paydown model
│   │   ├── model.py
│   │   └── results/
│   │
│   ├── gaia-staking/                  ← Ecological yield calculations
│   │   ├── model.py
│   │   └── results/
│   │
│   ├── gi-scoring/                    ← Integrity score simulations
│   │   ├── model.py
│   │   └── results/
│   │
│   └── stress-tests/                  ← Worst-case scenarios
│       ├── energy-crisis.py
│       ├── ai-winter.py
│       ├── integrity-collapse.py
│       └── results/
│
├── infrastructure/                    ← 🏗️ DevOps & deployment
│   ├── README.md
│   │
│   ├── docker/                        ← Container configs
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.indexer
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.prod.yml
│   │
│   ├── kubernetes/                    ← K8s manifests
│   │   ├── namespaces/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── ingress/
│   │   └── configmaps/
│   │
│   ├── terraform/                     ← Infrastructure as code
│   │   ├── aws/
│   │   ├── gcp/
│   │   └── azure/
│   │
│   ├── monitoring/                    ← Observability
│   │   ├── prometheus/
│   │   ├── grafana/
│   │   └── alerts/
│   │
│   └── ci-cd/                         ← GitHub Actions workflows
│       ├── test.yml
│       ├── build.yml
│       └── deploy.yml
│
├── community/                         ← 🌍 Hive chapters & events
│   ├── README.md
│   │
│   ├── hive-starter-kit/              ← How to start a local Hive
│   │   ├── GETTING_STARTED.md
│   │   ├── LEGAL_GUIDE.md             ← Forming nonprofit/coop
│   │   ├── FUNDRAISING.md
│   │   ├── SPACE_REQUIREMENTS.md
│   │   └── templates/
│   │       ├── bylaws.md
│   │       ├── operating-agreement.md
│   │       └── budget.xlsx
│   │
│   ├── festival-guides/               ← Seasonal ritual guides
│   │   ├── festival-of-echoes.md      ← Quarterly governance
│   │   ├── festival-of-bloom.md       ← Summer solstice
│   │   ├── planting-ceremony.md       ← Spring equinox
│   │   └── harvest-celebration.md     ← Autumn equinox
│   │
│   ├── conflict-resolution/           ← Restorative justice protocols
│   │   ├── facilitator-training.md
│   │   ├── circle-process.md
│   │   └── case-studies/
│   │
│   └── mutual-aid/                    ← Solidarity economy tools
│       ├── time-banking.md
│       ├── tool-library.md
│       ├── childcare-coop.md
│       └── elder-care-network.md
│
├── research/                          ← 🔬 Academic papers & analysis
│   ├── README.md
│   ├── papers/
│   │   ├── ubi-trilemma.pdf
│   │   ├── foundation-up-economics.pdf
│   │   └── civic-ai-alignment.pdf
│   └── data/
│
├── media/                             ← 🎨 Visual assets
│   ├── logos/
│   ├── diagrams/
│   ├── infographics/
│   └── videos/
│
└── scripts/                           ← 🔧 Utility scripts
    ├── setup-dev-environment.sh
    ├── deploy-all-services.sh
    ├── backup-data.sh
    └── verify-integrity.sh
```

---

## Core Document Locations

### Essential Reading (Start Here)

```
/
├── README.md                          ← Overview of everything
├── FORKING_GUIDE.md                   ← How to fork if creator is gone
└── GOVERNANCE.md                      ← How decisions are made
```

---

### Whitepapers & Vision Documents

```
docs/whitepapers/
├── GIC_Whitepaper_Final.md            ← Core economic model (READ FIRST)
├── GIC_Foundation_Up_Economics.md     ← Governance + ecology
├── planetary_ubi_simulation.md        ← 20-year UBI projection
└── Future_Technology_UBI.md           ← Path to $3,000/month
```

---

### Technical Architecture

```
docs/architecture/
├── Kaizen_OS_Complete_Lab_Architecture.md  ← ALL 7 LABS OVERVIEW
├── Lab1_Civic_Ledger_Spec.md
├── Lab2_Thought_Broker_Spec.md
├── Lab3_Resource_Orchestration_Spec.md
├── Lab4_EOMM_Spec.md
├── Lab5_Humanities_Healthcare_Spec.md
├── Lab6_Citizen_Shield_Spec.md
└── Lab7_OAA_Hub_Spec.md
```

---

### Protocol Specifications

```
docs/protocols/
├── gic_token_protocol.md              ← How GIC works
├── gaia_staking_protocol.md           ← How ecological staking works
├── delib_proof_protocol.md            ← Multi-LLM consensus algorithm
├── gi_scoring_protocol.md             ← How integrity is measured
└── integrity_covenant.md              ← The three covenants
```

---

### Smart Contracts (Deployed Code)

```
contracts/
├── contracts/
│   ├── GIC.sol                        ← ERC-20 token
│   ├── GICGovernor.sol                ← 90-day epoch + auto-donate
│   ├── PublicGoodsPool.sol            ← Treasury
│   └── GaiaStaking.sol                ← Ecological staking
│
└── deployed/
    ├── mainnet.json                   ← Mainnet contract addresses
    └── testnet.json                   ← Testnet contract addresses
```

---

### Running Services (Implementation)

```
civic-ledger/           ← GI scoring + GIC minting
codex-router/           ← Multi-LLM routing
eomm/                   ← Reflection app
humanities-healthcare/  ← Clinic/food/housing software
citizen-shield/         ← Security + identity
oaa-hub/                ← Education + API gateway
```

---

## How to Read This Repository

### If You're New (1 Hour)

```
1. Read README.md (15 min)
2. Read docs/whitepapers/GIC_Whitepaper_Final.md (30 min)
3. Skim docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md (10 min)
4. Decide: Developer? Organizer? Researcher? (5 min)
5. Jump to relevant directory based on your interest
```

---

### If You're a Developer (2 Hours)

```
1. Read README.md + CONTRIBUTING.md (20 min)
2. Read Lab specs for the lab you want to work on (40 min)
   Example: Want to work on AI? Read Lab2_Thought_Broker_Spec.md
3. Clone repo + set up dev environment (30 min)
   cd codex-router/ && ./scripts/setup.sh
4. Run tests (15 min)
   pytest tests/
5. Pick first issue to work on (15 min)
```

---

### If You're an Organizer (1 Hour)

```
1. Read README.md (15 min)
2. Read docs/whitepapers/GIC_Whitepaper_Final.md (20 min)
3. Read community/hive-starter-kit/GETTING_STARTED.md (20 min)
4. Join Discord, introduce yourself (5 min)
```

---

### If You're Forking (3 Hours)

```
1. Read FORKING_GUIDE.md (45 min)
2. Read GOVERNANCE.md (30 min)
3. Read all whitepapers in docs/whitepapers/ (60 min)
4. Fork repos + set up infrastructure (30 min)
5. Post custodian announcement (15 min)
```

---

## Finding Things Fast

### "Where is the code for X?"

| Feature | Location |
|---------|----------|
| Smart contracts | `contracts/contracts/` |
| GI score calculation | `civic-ledger/indexer/` |
| Multi-LLM routing | `codex-router/src/deliberation.py` |
| Reflection app UI | `eomm/reflection-app/src/` |
| Healthcare clinic software | `humanities-healthcare/health-commons/` |
| Food co-op logistics | `humanities-healthcare/food-network/` |
| DID system | `citizen-shield/identity/` |
| Education courses | `oaa-hub/course-library/` |
| UBI simulation | `simulations/planetary-ubi/` |

---

### "Where are the specs for Y?"

| Specification | Location |
|--------------|----------|
| GIC token economics | `docs/protocols/gic_token_protocol.md` |
| Gaia Staking rules | `docs/protocols/gaia_staking_protocol.md` |
| GI scoring algorithm | `docs/protocols/gi_scoring_protocol.md` |
| DelibProof consensus | `docs/protocols/delib_proof_protocol.md` |
| Virtue Accords (constitution) | `docs/governance/virtue_accords.md` |
| Guardrails Codex | `docs/governance/guardrails_codex.md` |
| Festival rituals | `community/festival-guides/` |

---

### "Where is the guide for Z?"

| Guide | Location |
|-------|----------|
| Setting up dev environment | `scripts/setup-dev-environment.sh` |
| Deploying contracts | `contracts/README.md` |
| Starting a Hive chapter | `community/hive-starter-kit/` |
| Contributing code | `CONTRIBUTING.md` |
| Forking the project | `FORKING_GUIDE.md` |
| Running simulations | `simulations/README.md` |
| Security best practices | `SECURITY.md` |

---

## Key Configuration Files

### Smart Contracts

```
contracts/hardhat.config.js            ← Network configs, gas settings
contracts/deployed/mainnet.json        ← Deployed contract addresses
```

---

### Backend Services

```
civic-ledger/docker-compose.yml        ← Database, indexer, API
codex-router/config/model_config.yaml  ← LLM provider settings
eomm/backend/.env.example              ← Environment variables template
```

---

### Frontend Apps

```
eomm/reflection-app/.env.example       ← API endpoints, etc.
humanities-healthcare/*/config/        ← Service-specific configs
```

---

## Data Flow Map

**"How does data move through the system?"**

```
1. Citizen writes reflection (E.O.M.M.)
   └─ eomm/reflection-app/ → eomm/backend/

2. Reflection analyzed for integrity (GI score)
   └─ civic-ledger/indexer/ → calculates GI

3. If GI ≥ 0.95, citizen earns GIC
   └─ civic-ledger/api/ → mints GIC via contracts/GIC.sol

4. Citizen spends GIC on AI query
   └─ codex-router/ → routes to cheapest LLM provider

5. Query cost logged
   └─ resource-orchestration/compute-allocation/

6. Monthly UBI distributed
   └─ contracts/GICGovernor.sol → all citizens with GI ≥ 0.90

7. Surplus allocated to debt repayment
   └─ resource-orchestration/financial-flows/debt_repayment.py
```

---

## Testing & Quality Assurance

### Where are the tests?

```
Every module has a tests/ directory:

contracts/test/                        ← Smart contract tests (Hardhat)
civic-ledger/*/tests/                  ← Python tests (pytest)
codex-router/tests/                    ← API + routing tests
eomm/reflection-app/src/__tests__/     ← React component tests (Jest)
```

### How to run all tests?

```bash
# From root directory
./scripts/run-all-tests.sh

# Or module by module:
cd contracts/ && npx hardhat test
cd civic-ledger/ && pytest
cd codex-router/ && pytest
cd eomm/reflection-app/ && npm test
```

---

## Deployment Workflows

### Development → Staging → Production

```
1. Developer commits to feature branch
   └─ .github/workflows/test.yml runs tests

2. PR merged to develop branch
   └─ .github/workflows/build.yml builds Docker images

3. Deploy to staging
   └─ infrastructure/kubernetes/staging/

4. Manual testing + review (48 hours)

5. Merge develop → main
   └─ .github/workflows/deploy.yml → production
```

---

## Contributing Workflow

```
1. Fork repository
   └─ github.com/YOUR_USERNAME/kaizen-cycle

2. Clone your fork
   └─ git clone https://github.com/YOUR_USERNAME/kaizen-cycle.git

3. Create feature branch
   └─ git checkout -b feature/my-awesome-feature

4. Make changes, commit
   └─ Follow CONTRIBUTING.md guidelines

5. Push to your fork
   └─ git push origin feature/my-awesome-feature

6. Open pull request
   └─ Base: kaizencycle/kaizen-cycle:develop
       Compare: YOUR_USERNAME/kaizen-cycle:feature/my-awesome-feature

7. Code review + CI tests
   └─ Address feedback, push updates

8. Merge!
   └─ Maintainer merges after approval
```

---

## Emergency Procedures

### "The creator is gone, what do I do?"

1. **Read [`FORKING_GUIDE.md`](./FORKING_GUIDE.md)** (complete instructions)
2. **Check [`CONTACTS.md`](./CONTACTS.md)** (try to reach known associates)
3. **Post in community channels** (Discord, forum)
4. **Form interim council** (5-7 people)
5. **Fork all repositories** (preserve the work)
6. **Follow continuity plan** (see FORKING_GUIDE.md section "For Custodians")

---

### "I found a critical security vulnerability"

1. **DO NOT** post publicly (protect users)
2. **Read [`SECURITY.md`](./SECURITY.md)**
3. **Email:** security@kaizen.gic (PGP encrypted if possible)
4. **Or:** Contact Zeus Sentinel (security@founding-agents.gic)
5. **Expect response within 48 hours**

---

### "A service is down"

1. **Check status page:** https://status.kaizen.gic
2. **Check GitHub issues:** Any open incidents?
3. **Join Discord #incidents channel**
4. **If no response in 1 hour:** Fork + deploy yourself (you have the code)

---

## Glossary of Directory Names

| Directory | Meaning |
|-----------|---------|
| `contracts/` | Solidity smart contracts (blockchain) |
| `civic-ledger/` | GI scoring + GIC minting (Lab 1) |
| `codex-router/` | AI query routing (Lab 2) |
| `resource-orchestration/` | Resource allocation (Lab 3) |
| `eomm/` | "Echoes of My Mind" reflection app (Lab 4) |
| `humanities-healthcare/` | Physical wellbeing systems (Lab 5) |
| `citizen-shield/` | Security + identity (Lab 6) |
| `oaa-hub/` | Education + API gateway (Lab 7) |
| `simulations/` | Economic models + stress tests |
| `infrastructure/` | DevOps, deployment, monitoring |
| `community/` | Hive chapters, festivals, mutual aid |
| `docs/` | All specifications + whitepapers |

---

## Quick Command Reference

```bash
# Clone the repository
git clone https://github.com/kaizencycle/kaizen-cycle.git

# Set up development environment
./scripts/setup-dev-environment.sh

# Run all tests
./scripts/run-all-tests.sh

# Deploy smart contracts (testnet)
cd contracts/ && npx hardhat deploy --network sepolia

# Start all services locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Backup data
./scripts/backup-data.sh

# Verify repository integrity
./scripts/verify-integrity.sh
```

---

## Final Notes

### This repository is designed to be:

- ✅ **Self-explanatory** (README answers most questions)
- ✅ **Forkable** (can continue without creator)
- ✅ **Modular** (each lab is independent)
- ✅ **Testable** (every module has tests)
- ✅ **Deployable** (Docker + K8s configs included)
- ✅ **Documented** (specs for everything)

### If something is unclear:

1. Check this file (REPOSITORY_STRUCTURE.md)
2. Check README.md
3. Check module-specific README.md
4. Open an issue on GitHub
5. Ask in Discord

### If you want to improve this structure:

**Pull requests welcome!**

The structure should evolve as the project grows. But the core principle remains: **anyone should be able to fork and continue this work without the creator.**

---

*"The map is not the territory, but it helps you navigate."*

*— Repository Structure Guide v1.0*

**END OF DOCUMENT**
