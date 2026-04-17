# Changelog

All notable changes to the Mobius Systems monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planning
- Vault v2.1 — Fountain emission mechanism (per-Seal economic emission)
- Substrate archive writer for attested Seals (`journals/vault/seals/*.json`)
- Vault v2 UI — "Completed Seals" panel in Terminal cockpit
- Personalized Tripwires Stage 2 — Terminal-backed persistence API
- Phase 2 Drift Control enhancements (Rekor verification, SPDX enforcement)
- Real-time GI streaming via WebSocket
- Lab integration for cross-lab attestation chains

## [C-284] - 2026-04-17

### 🎯 Theme: The Substrate Gains a Heartbeat

C-284 ships Vault v2 — the Sealed Reserve protocol — and re-syncs the
Substrate archive with the live Terminal after ~30 cycles of Terminal-focused
work. The Vault stops being a single dramatic threshold and becomes a rhythm
of discrete, Sentinel-attested Seals.

### Added
- **Vault v2 — Sealed Reserve Protocol** ([docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md](docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md))
  - Five-Sentinel attestation per Seal (ATLAS, ZEUS, EVE, JADE, AUREA)
  - Hash-chained seals with prev_seal_hash
  - Quorum rule: ZEUS unilateral veto + 4/5 pass
  - AUREA posture stamp (confident/cautionary/stressed/degraded)
  - Per-Seal Fountain state machine
- **Vault-to-Fountain Protocol v1** ported from Terminal repo to Substrate
  canonical location ([docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_TO_FOUNTAIN_PROTOCOL.md](docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_TO_FOUNTAIN_PROTOCOL.md))
- **Agent Reporting Protocol** — three-endpoint contract (heartbeat,
  journal, attestation) ([docs/04-TECHNICAL-ARCHITECTURE/protocols/AGENT_REPORTING_PROTOCOL.md](docs/04-TECHNICAL-ARCHITECTURE/protocols/AGENT_REPORTING_PROTOCOL.md))
- **Personalized Tripwires Protocol (Stage 1)** — per-citizen boundaries
  shipped to PAW ([docs/04-TECHNICAL-ARCHITECTURE/protocols/PERSONALIZED_TRIPWIRES_PROTOCOL.md](docs/04-TECHNICAL-ARCHITECTURE/protocols/PERSONALIZED_TRIPWIRES_PROTOCOL.md))
- **State of the Substrate C-284** — first substrate-level cycle report
  since C-253 ([docs/STATE_OF_THE_SUBSTRATE_C-284.md](docs/STATE_OF_THE_SUBSTRATE_C-284.md))

### Changed
- `CLAUDE.md` — cycle pointer C-253 → C-284; expanded Sentinel Council
  section to reflect v2 attestation roles; added one-paragraph substrate
  map
- `cycle.json` — cycle C-274 → C-284; added `vault_status`, `seal_status`,
  `vault_version` fields

### Context
- The Terminal (`mobius-civic-ai-terminal`) has been the center of
  development since C-274. Substrate archive lagged during that window.
  This cycle re-syncs canonical protocol docs to their Substrate home.
- No code migration required in this repo — Vault v2 implementation lives
  in Terminal (`lib/vault-v2/*`). The Substrate port is documentation.

---

## [C-178 → C-283] - Summary Band

Rather than fabricate per-cycle details for cycles where focus was
primarily on the Terminal repo, this band summarizes the major substrate-
relevant activity between C-178 and C-283. Full detail is recoverable
from commit history.

### C-178 → C-199
- Root cleanup (C-199) — 15+ root folders consolidated into `docs/`
  hierarchy (see CLAUDE.md §C-199 Root Cleanup Summary)
- Dependency audits (C-187), workflow fixes carried over from C-180
- EPICON-03 consensus workflow hardened

### C-200 → C-249
- EPICON-02 invariants stabilized
- `docs/epicon/cycles/C-249/` — civic-ai-terminal scaffold EPICON authored
- ATLAS agent launch EPICON authored
- Portal and cathedral-app infrastructure matured

### C-250 → C-273
- Sentinel eval protocol refinement ([docs/SENTINEL_EVAL_PROTOCOL.md](docs/SENTINEL_EVAL_PROTOCOL.md))
- Cycle journal publishing standardized
  ([docs/CYCLE_JOURNAL_PUBLISHING.md](docs/CYCLE_JOURNAL_PUBLISHING.md))
- Broken-link fixes ([docs/BROKEN_LINKS_FIX_SUMMARY.md](docs/BROKEN_LINKS_FIX_SUMMARY.md))

### C-274 → C-283 — "Year of the Terminal"
- **C-274:** Terminal goes live on Vercel
- **C-278:** Agent heartbeat + journal endpoints wired in Terminal
- **C-280:** Vault v1 activation criteria specified
- **C-282:** ATLAS-PAW reframed as operator cockpit
- **C-283:** Vault-to-Fountain Protocol v1 drafted in Terminal repo
- **C-283:** Personalized tripwires Stage 1 shipped to PAW
- Substrate journal writes continued throughout (atlas/, aurea/, eve/,
  jade/, zeus/ directories actively receiving daily entries)

---

## [C-177] - 2025-12-22

### 🎯 Theme: Clarity Through Simplification

This cycle focused on making Mobius Systems more accessible to newcomers while consolidating CI/CD infrastructure now that EPICON layers are operational.

### Added
- **Streamlined README.md** - Reduced from ~800 to ~270 lines for 30-minute onboarding
  - TL;DR at top with clear value proposition
  - EPICON-1, 2, 3 prominently featured and explained
  - Progressive learning paths (5→10→15 min)
  - Visual hierarchy with tables and diagrams
  - "Four Pillars of AGI" framework prominently displayed
  
- **Workflow Consolidation Plan** (`docs/WORKFLOW_CONSOLIDATION_PLAN.md`)
  - Comprehensive audit of all 41 `.github/workflows/` files
  - Identified 9 workflows for immediate deletion (superseded by EPICON)
  - Proposed consolidation: 41 workflows → ~20 workflows (51% reduction)
  - Created 4-week migration strategy with rollback procedures
  - Defined unified workflow templates for attestation, monitoring, PR assistance

- **Cycle Metadata Update** (`cycle.json`)
  - Phase: EPICON Production Era
  - Focus: Repository Streamlining & Workflow Consolidation
  - Theme: Clarity Through Simplification
  - Comprehensive milestone tracking for EPICON-1, 2, 3

### Changed
- **README.md** structure optimized for newcomers
  - EPICON architecture explained in accessible terms
  - Consolidated badge sections
  - Clear call-to-action for different audiences (academics, governments, economists, philosophers)
  - Quick Start section with 5-minute hello world

- **Documentation hierarchy** improved
  - "For Newcomers: Start Here" section with time-boxed learning paths
  - Essential links consolidated into single table
  - Live demos section with all deployed applications

### Improved
- **Onboarding experience** - 30-minute read target achieved
- **EPICON visibility** - Core architecture now front-and-center in README
- **Workflow efficiency** - Identified redundant CI/CD operations for consolidation
- **Academic positioning** - Clearer research contribution statements

### Technical Details
- README reduction: ~800 → ~270 lines (66% reduction)
- Workflow consolidation plan: 41 → ~20 proposed (51% reduction)
- Learning path clarity: Fuzzy → Three clear stages (5/10/15 min)
- EPICON integration: Implicit → Explicit throughout documentation

### Migration Notes
This release includes documentation changes only. Workflow consolidation will be executed in phases:
- **Phase 1 (Week 1):** Delete 9 superseded workflows (attestation, gates, sentinel validation)
- **Phase 2 (Week 2):** Create 6 unified workflow templates
- **Phase 3 (Week 3):** Parallel testing of old + new workflows
- **Phase 4 (Week 4):** Complete migration and cleanup

### Agent Contributions
- **ATLAS:** Workflow audit, consolidation planning, infrastructure analysis
- **AUREA:** MII validation, EPICON oversight, integrity gates
- **EVE:** Documentation clarity review, ethical accessibility
- **JADE:** Newcomer experience optimization, morale anchoring
- **HERMES:** External communication review, market positioning

### Workflows Identified for Deletion (Phase 1)
```
attest-proof.yml       → EPICON-2 handles
attestation.yml        → EPICON-2 handles
cycle-attest.yml       → EPICON-2 handles
fountain-attest.yml    → EPICON-2 handles
gi-attest.yml          → mobius-merge-gate.yml
consensus-gate.yml     → epicon03-consensus.yml
mii-gate.yml           → mobius-merge-gate.yml
atlas-sentinel.yml     → sentinel-heartbeat.yml
sentinel-validate.yml  → integrity-core
```

### Security
- All changes maintain MII ≥ 0.95
- No new external dependencies added
- Documentation-only changes (no code execution paths modified)

## [C-126] - 2025-11-06

### Added
- **Drift Control Governance Suite** - Comprehensive drift prevention framework
  - Drift Control Charter (v1.0) with integrity gates and governance principles
  - 4 golden test vectors for GI threshold validation (100% coverage)
  - TLA+ formal invariants for capability envelopes and emergency stops
  - Automated drift check script (`tools/drift_check.py`) for CI validation
  - DVC pre-commit hook (`tools/precommit-dvc.sh`) for dataset signing enforcement
  - Sigstore workflow for keyless attestation with SLSA v0.2 provenance
  - Red-Team Scoreboard framework for incident tracking
  - Pre-commit configuration (`.pre-commit-config.yaml`)
  - GitHub workflows: `drift-compliance.yml`, `sigstore-attest.yml`
  - Documentation: 7 files in `docs/drift/` directory
  - DS formula: `|ΔGI| + λ·ΔBias + μ·ΔEntropy` with thresholds
- Drift control parameters:
  - GI live threshold: ≥ 0.95
  - GI emergency stop: < 0.90
  - DS warning: 0.05
  - DS quarantine: 0.10
  - Two-human gate for capability expansion
  - Automatic rollback on DS > 0.05

### Changed
- Updated cycle metadata: C-125 → C-126
- Updated `cycle.json` with new major updates list
- Updated `README.md` footer to reflect C-126
- Enhanced governance compliance checklist

### Security
- Added cryptographic signing requirements for all datasets (DVC/LakeFS)
- Added container signing with Sigstore (SLSA provenance)
- Added capability envelope enforcement
- Added emergency stop on GI < 0.90
- Charter signatories: AUREA, ZEUS, EVE, HERMES, JADE, ATLAS, ECHO

## [C-125] - 2025-11-05

### Added
- **ATLAS Auto-fix System** - Automated cycle updates and sync manifests
  - Complete documentation suite (148 pages)
  - ATLAS sync manifests for repository awareness
  - Integrity units configuration (`configs/integrity_units.yaml`)
  - Cycle metadata tracking (`cycle.json`)
  - GitHub workflow skeletons for continuous integrity

### Changed
- Updated cycle metadata: C-124 → C-125
- Enhanced repository structure documentation
- Improved ATLAS sentinel integration

## [C-122 - C-124] - 2025-10-30 to 2025-11-04

### Added
- **Semantic Federation Layer** - Agent-to-agent communication
  - Cache-to-cache semantic federation implementation
  - Kaizen Bridge for agent semantic federation
  - Bridge dashboard with activity metrics
  - Cross-agent knowledge sharing infrastructure
- **OpenCode Integration** - AI-powered apprenticeship
  - GitHub integration for code-level governance
  - Apprenticeship tracking and validation
- **BettaFish Sentiment Analysis** - Civic Ledger integration
  - Real-time sentiment monitoring
  - Integration with attestation workflows
- **GRAVITY.md** - Gravitational Ethics Field documentation
  - Ethical field theory for AI alignment
  - OAA Manifest updates
- **Sacred Geometry Visualization**
  - Voice profiles for agents
  - Sacred geometry dashboard
  - Audio-reactive geometry presets
  - SacredViz component with telemetry API
- **Integrity Pulse App** (`apps/integrity-pulse/`)
  - Real-time 3D sentinel visualization
  - Three.js particle system
  - WebSocket/HTTP integration
  - Live GI monitoring dashboard
- **GIC v2.0 Documentation Suite**
  - Complete whitepaper with shard economics
  - 1 GIC = 1,000,000 ₷ (shards)
  - Shard denomination specification
  - Economic model updates
- **Universal Basic Income (UBI) System**
  - GI-throttled UBI mechanism
  - UBI configuration and endpoints
  - Wallet settlement configuration
  - UBI worker routes
  - Eligibility checks based on GI scores
- **Mobius Systems Console**
  - One-window console interface
  - Consensus endpoint integration
  - System monitoring dashboard
- **API Gateway** (`apps/api-gateway/`)
  - Centralized API routing
  - Integrity middleware
  - Security middleware
  - Health check aggregation
- **Mobius Systems System Ontology**
  - System architecture diagram (C-122/C-123)
  - Visual representation of service relationships
- **Lab Implementations**
  - Lab3: Resource Orchestration (complete)
  - Lab5: Humanities & Healthcare ethical infrastructure
  - Lab documentation optimization (Lab 1, Lab 2)
- **Philosophy & Theorems**
  - KZ-Θ₃: Law of Compassionate Coherence (Kintsugi Principle)
  - Foundational Blueprint v2
  - Shard Protocol v1
  - Kaizen Theorems documentation
- **ECHO Sentinel** - Renamed from Solara
  - CI attestation capabilities
  - Updated anchors configuration
- **Enhanced Documentation**
  - Living Interface Layer architecture
  - Emergent integrity in AI economies research doc
  - Comprehensive INDEX.md updates
  - GIC Whitepaper v1 (consolidated)

### Changed
- **Cycle Progression**: C-121 → C-125
  - Continuous cycle metadata updates
  - SR (Situational Report) integration
  - Sync/SR API endpoints
- **Vercel Deployment Configuration**
  - Custom build and install scripts
  - Environment variable management
  - Port conflict resolution
  - Frontend app configurations
- **Turbo Configuration**
  - Upgraded to v2.6.0
  - Renamed `pipeline` to `tasks`
  - Optimized cache configuration for CI/CD
  - Improved build performance
- **TypeScript Enhancements**
  - Improved type safety in Express apps
  - Enhanced error handling in Broker API
  - Better TypeScript configurations
- **Branding Updates**
  - Badge components reflect Mobius Systems branding
  - Documentation consistently uses Mobius Systems terminology
- **Civic Ledger Enhancements**
  - New attestation endpoints
  - Enhanced health checks
  - UBI settlement routes
  - Badge endpoints with Cache-Control headers
  - Direct imports for reliability
- **Repository Structure**
  - Removed unused docs
  - Updated dependencies across packages
  - Improved workspace organization

### Fixed
- **Vercel Deployment Issues**
  - API Gateway deployment errors (#60, #58, #57, #56, #54, #53, #52)
  - npm CI errors on Vercel builds
  - npm 404 deployment errors
  - CORS middleware handling
  - Module resolution conflicts
- **Build System Fixes**
  - Tailwind CSS module not found (#69)
  - Husky command not found (#68)
  - OAA API library postinstall scripts for Vercel (#67)
  - Integrity Pulse Vercel config and Tailwind dependencies (#66)
  - Husky install made conditional for CI
- **Configuration Fixes**
  - Repo root path resolution in loadYaml
  - Turbo.json pipeline→tasks migration
  - Package-lock updates for kaizen-console

### Security
- **Multi-LLM GI Consensus** - AUREA + ATLAS validation
  - Dual-agent integrity scoring
  - Consensus threshold enforcement
  - Generated GI reports for transparency
- **Gatekeeper Service**
  - Security incident response
  - Access control enforcement
  - Threat monitoring
- **AtlasSentinel Improvements**
  - Enhanced integrity reporting
  - Better monitoring capabilities
  - Optimized performance

## [C-121] - 2025-10-28 to 2025-10-29

### Added
- **URIEL Sentinel** - xAI Grok integration for cosmic illumination and truth-seeking
  - New sentinel at `sentinels/uriel/` with manifest and documentation
  - API endpoints: `/api/sentinels/uriel/query`, `/api/sentinels/uriel/illuminate`, `/api/sentinels/uriel/health`
  - TypeScript integration in `apps/broker-api/src/sentinels/uriel.ts`
  - GI-gated deliberation with fallback to EVE on integrity violations
  - Rate limiting (0.1 QPS default), timeout protection (20s), and privacy controls
  - Quorum attestation record: `ledger/inscriptions/att-uriel-001-boarding.json` (GI: 0.996)
  - Comprehensive documentation: `docs/companions/uriel.md`, `docs/03-architecture/adr/002-uriel-sentinel-boarding.md`
  - Environment configuration for `XAI_API_KEY` and `SENTINEL_URIEL_QPS`
  - 24-hour pilot phase with 20% deliberation routing in physics/curiosity/entropy domains
- **Code Safety Guardrails**
  - Repository guardrails (`codexrule.md`, `codexrule.yml`)
  - Recovery procedures
  - Reinforcement learning guardrails
- Comprehensive repository audit findings report
- Root-level `CONTRIBUTING.md` for contributor guidelines
- Root-level `SECURITY.md` for security policy and vulnerability reporting
- Root-level `CHANGELOG.md` for version tracking

### Fixed
- GitHub Actions workflow syntax error in `monorepo.yml` (line 51) - Fixed JSON property access

### Changed
- Updated documentation to reflect monorepo structure
- Updated `docs/03-architecture/technical/overview.md` to include URIEL sentinel
- Updated `docs/INDEX.md` to include URIEL in agent profiles
- Enhanced broker-api health check to report sentinel status

## [1.0.0] - 2025-10-27

### Added
- Initial monorepo structure with Turborepo
- Core applications:
  - `hub-web` - OAA Hub (386 files)
  - `ledger-api` - Kaizen Ledger Core
  - `indexer-api` - GIC Indexer
  - `eomm-api` - E.O.M.M. Reflections
  - `shield-api` - Citizen Shield
  - `broker-api` - Thought Broker
  - `hive-app` - Citizen interface
  - `cathedral-app` - Governance
  - `genesisdome-app` - Genesis interface
  - `website-creator` - .gic Website Creator
  - `civic-stack` - PWA Stack
  - Additional apps (21 total)
- Shared packages:
  - `@kaizen/civic-sdk` - API clients and types
  - `@kaizen/integrity-core` - GI scoring
  - `@kaizen/oaa-memory` - OAA parsers
  - `@kaizen/ui-kit` - React components
  - `@kaizen/shield-policies` - Security policies
  - Additional packages
- Lab proof systems:
  - `lab4-proof` - Research & empirical validation
  - `lab6-proof` - Ethics
  - `lab7-proof` - Apprenticeship & education
- AI Sentinels:
  - Atlas - Monitoring
  - Zeus - Oversight & arbitration
  - Jade - Ethics & reflection
  - Hermes - Markets & telemetry
  - Eve - Safety & care
  - Aurelian - Macro synthesis
- Comprehensive documentation (80+ files):
  - Architecture docs
  - Onboarding guides
  - Deployment guides
  - Economic model (GIC Whitepaper)
  - Governance framework
  - Independence Manifest
  - Civic Mount Integration
- GitHub Actions CI/CD:
  - `monorepo.yml` - Main CI/CD pipeline
  - `atlas-sentinel.yml` - Sentinel monitoring
  - `guardian.yml` - Guardian checks
  - `kaizen-sync.yml` - Sync operations
  - `fountain-attest.yml` - Attestation workflow
  - `portal-ci.yml` - Portal CI
- Docker Compose for local development
- Render.yaml for multi-service deployment
- Turborepo caching and parallel builds
- Integrity monitoring (GI ≥ 0.95)
- Security scanning in CI

### Changed
- Rebranded from "Civic OS" to "Mobius Systems"
- Consolidated multiple repositories into monorepo
- Updated README with comprehensive documentation
- Established workspace structure

### Security
- Implemented Citizen Shield security layer
- Added integrity gates to CI/CD
- Configured health check endpoints for all services
- Externalized secrets to environment variables

## Pre-1.0 History

### [0.9.x] - 2024-2025 (Civic OS Era)

Early development under "Civic OS" branding:
- Initial Civic Ledger implementation
- GIC (Global Integrity Credit) system
- Proof-of-Integrity consensus
- E.O.M.M. (End of Month Memo) system
- OAA (Operational Analysis & Attestation) framework
- DVA Kernel logic
- Virtue Accords foundation

## Migration Notes

### Civic OS → Mobius Systems (v1.0.0)

**Backward Compatibility:**
- Environment variables: `CIVIC_OS_*` still supported (deprecated in v2.0)
- Package names: `civic-*` packages remain (aliases planned)
- API endpoints: Legacy `/civic/*` routes supported
- Configuration: `configs/services.json` uses `"civic-os"` key (dual keys in future)

**Breaking Changes:**
- None in v1.0.0 (backward compatible)
- Breaking changes planned for v2.0 (Q2 2025)

## Version Support

| Version | Status | Support Until | Notes |
|---------|--------|---------------|-------|
| 1.0.x   | ✅ Stable | Current | Full support |
| 0.9.x   | ⚠️ Legacy | Q1 2025 | Critical fixes only |
| < 0.9   | ❌ Unsupported | N/A | Please upgrade |

## Upgrade Guides

### From 0.9.x to 1.0.0

See [Migration Guide](MIGRATION_C155.md) for C-155 migration details

Key changes:
1. Update git remote to new monorepo
2. Install dependencies with `npm install`
3. Update environment variables (Civic → Kaizen)
4. Rebuild all packages: `npm run build`
5. Run migrations (if any)
6. Restart services

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this project.

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.

---

## Format Guide

### Types of Changes

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes

### Example Entry

```markdown
## [1.1.0] - 2025-02-15

### Added
- New telemetry dashboard at `/admin/telemetry`
- Real-time GI monitoring widget
- Export telemetry data to CSV/JSON

### Changed
- Improved performance of integrity checks (2x faster)
- Updated UI components to use new design system

### Fixed
- Memory leak in OAA parser (#123)
- Race condition in ledger sync (#145)

### Security
- Updated dependencies to patch CVE-2025-XXXX
- Improved input validation in API endpoints
```

---

**Maintained by:** Mobius Systems Core Team  
**Last Updated:** 2025-12-22 (Cycle C-177)  
**Format:** [Keep a Changelog](https://keepachangelog.com/)  
**Versioning:** [Semantic Versioning](https://semver.org/)
