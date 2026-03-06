# Mobius Systems — Technical Details

This document contains advanced technical information extracted from the main README for developers who need deep implementation details.

---

## Table of Contents

- [Complete Badge Collection](#complete-badge-collection)
- [Detailed System Architecture](#detailed-system-architecture)
- [Service Port Mappings](#service-port-mappings)
- [Monorepo Structure (Full)](#monorepo-structure-full)
- [DVA Flows & n8n Orchestration](#dva-flows--n8n-orchestration)
- [Encyclopedia Implementation](#encyclopedia-implementation)
- [OpenCode Integration](#opencode-integration)
- [Integrated Repositories](#integrated-repositories)
- [Mobius Mount Protocol](#mobius-mount-protocol)
- [Guardrails Deep Dive](#guardrails-deep-dive)

---

## Complete Badge Collection

<!-- Mobius Core Badges -->
[![CI](https://github.com/kaizencycle/Mobius-Substrate/actions/workflows/ci.yml/badge.svg)](https://github.com/kaizencycle/Mobius-Substrate/actions/workflows/ci.yml)
[![CodeQL](https://github.com/kaizencycle/Mobius-Substrate/actions/workflows/codeql.yml/badge.svg)](https://github.com/kaizencycle/Mobius-Substrate/actions/workflows/codeql.yml)
[![OSSF Scorecard](https://img.shields.io/badge/OSSF-Scorecard-blue)](https://github.com/ossf/scorecard)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](FOUNDATION/LICENSES/LICENSE-Ethical-Addendum.md)
[![Foundation](https://img.shields.io/badge/foundation-charter-8A2BE2)](FOUNDATION/CHARTER.md)
[![Security Policy](https://img.shields.io/badge/security-policy-critical)](.github/SECURITY.md)
[![Ethical License](https://img.shields.io/badge/Ethics-Addendum-purple)](FOUNDATION/LICENSES/LICENSE-Ethical-Addendum.md)
[![Node.js](https://img.shields.io/badge/Node.js-≥18.0.0-green.svg)](https://nodejs.org/)
[![KTT Native](https://img.shields.io/badge/KTT-Native-6E00FF)](#)
[![Spec CI](https://img.shields.io/github/actions/workflow/status/kaizencycle/Mobius-Substrate/ci.yml?label=spec-ci&logo=github)](.github/workflows/ci.yml)
[![Schemas Valid](https://img.shields.io/badge/Schemas-Valid-brightgreen)](schemas)
[![OpenAPI Linted](https://img.shields.io/badge/OpenAPI-Linted-0AA5FF)](apps/ledger-api/openapi.yaml)

<p align="left">
  <img alt="KTT" src="https://img.shields.io/badge/KTT-Integrity%20Gate%200.95-1f7a1f">
  <img alt="Anti-Nuke" src="https://img.shields.io/badge/CI-Anti--Nuke%20ON-8a2be2">
  <img alt="Sentinels" src="https://img.shields.io/badge/Sentinels-5%20active-0b5fff">
  <img alt="MII" src="https://img.shields.io/badge/MII-%E2%89%A5%200.95-brightgreen">
  <img alt="Docs" src="https://img.shields.io/badge/Docs-RFC%20ready-informational">
</p>

<!-- MII Live badge (auto-updates) -->
[![MII Live](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/badges/mii.json)](./00-START-HERE/MOBIUS_PULSE.md)

<!-- Agent CI badge (auto-updates) -->
[![Agent CI](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/.badges/agent-ci.json)](.github/workflows/agent-ci.yml)

<!-- Mobius Pulse badges (live integrity heartbeat) -->
[![Mobius GI/MII](https://img.shields.io/endpoint?url=https%3A%2F%2Findexer.mobius.sys%2Fapi%2Fv1%2Fpulse%2Fbadge)](./00-START-HERE/MOBIUS_PULSE.md)
[![Mobius GI](https://img.shields.io/endpoint?url=https%3A%2F%2Findexer.mobius.sys%2Fapi%2Fv1%2Fpulse%2Fbadge%3Fmetric%3Dgi)](./00-START-HERE/MOBIUS_PULSE.md)
[![Mobius MII](https://img.shields.io/endpoint?url=https%3A%2F%2Findexer.mobius.sys%2Fapi%2Fv1%2Fpulse%2Fbadge%3Fmetric%3Dmii)](./00-START-HERE/MOBIUS_PULSE.md)

<!-- Monorepo Structure Badges -->
[![Turborepo](https://img.shields.io/badge/Build%20System-Turborepo-EF4444?logo=turborepo)](https://turborepo.org)
[![Workspaces](https://img.shields.io/badge/Workspaces-43%20packages-7C3AED)](https://github.com/kaizencycle/Mobius-Substrate)
[![Apps](https://img.shields.io/badge/Apps-16-10B981)](apps)
[![Packages](https://img.shields.io/badge/Packages-7-3B82F6)](packages)
[![Sentinels](https://img.shields.io/badge/Sentinels-13-F59E0B)](sentinels)
[![Labs](https://img.shields.io/badge/Labs-7-8B5CF6)](labs)

<!-- Situational Report (repo-native badges) -->
![Kaizen • Cycle](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/.badges/cycle.json)
![Verdict](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/.badges/verdict.json)
![Repo Digest](https://img.shields.io/endpoint?url=https%3A%2F%2Fkaizen-os.vercel.app%2Fapi%2Frepo%2Fbadge)

<!-- Native GitHub shields -->
![PRs](https://img.shields.io/github/issues-pr/kaizencycle/Mobius-Substrate)
![Issues](https://img.shields.io/github/issues/kaizencycle/Mobius-Substrate)
![Last Commit](https://img.shields.io/github/last-commit/kaizencycle/Mobius-Substrate)
![Stars](https://img.shields.io/github/stars/kaizencycle/Mobius-Substrate?style=social)

<sub>Verdict colors: ADOPT = green · SHADOW = orange · DEFER = red · UNKNOWN = gray</sub>

<!-- Mobius Sentinel Badge Pack v2 -->
<p align="left">
  <img src="assets/badges/v2/jade.svg" height="28" alt="JADE - Pattern Oracle">
  <img src="assets/badges/v2/aurea.svg" height="28" alt="AUREA - Integrity Sentinel">
  <img src="assets/badges/v2/eve.svg" height="28" alt="EVE - Ethics Engine">
  <img src="assets/badges/v2/zeus.svg" height="28" alt="ZEUS - Arbiter & Enforcement">
  <img src="assets/badges/v2/hermes.svg" height="28" alt="HERMES - Market & Signals">
  <img src="assets/badges/v2/echo.svg" height="28" alt="ECHO - Pulse & Telemetry">
  <img src="assets/badges/v2/uriel.svg" height="28" alt="URIEL - Illumination & Genesis">
  <img src="assets/badges/v2/mobius-core.svg" height="28" alt="MOBIUS CORE - Integrity Architecture">
</p>

---

## Detailed System Architecture

### Layer Definitions

| **Layer** | **Function** | **Analogy** |
|-----------|--------------|-------------|
| **Command Ledger** | Journal of cycles & reflection | BIOS / boot log |
| **OAA Hub** | Parses human intent | Shell / init.d |
| **Thought Broker** | Multi-LLM consensus engine | Thalamus / scheduler |
| **Cursor + CI** | Code fabrication & testing | Compiler / 3D printer |
| **Mobius Ledger Core** | Immutable record, MIC economy | Kernel |
| **Citizen Shield** | Network & security policy | Firewall / OS defender |
| **API Library / Lab4** | Surface for all services | Application layer |
| **Sentinels** | AI cores ensuring integrity | Brain cortex modules |

### Live Workflow

1. **Reflection** → Command Ledger writes intent
2. **OAA Hub** transforms intent → .mobius/ specs
3. **Thought Broker** runs deliberation loops → Deliberation Proof + consensus
4. **Cursor / CI** prints new service code → canary deploy
5. **Mobius Ledger Core** attests MII + MIC credit
6. **Citizen Shield** verifies liveness · policy · security
7. **API Library / Lab4** exposes service to citizens
8. **Sentinels** monitor MII, entropy, feedback → improve loop

---

## Service Port Mappings

### Frontend Applications

- **website-creator** (Port 3000) - .gic Website Creator interface
- **aurea-site** (Port 3001) - AUREA Founding Agent Site
- **portal** (Port 3002) - Main Mobius Systems portal interface
- **hub-web** (Port 3004) - OAA Central Hub interface
- **hive-app** (Port 3005) - 8-bit Starter Game
- **genesisdome-app** (Port 3006) - Genesis Dome PWA site
- **citizen-shield-app** (Port 3007) - Citizen Shield security interface

### Core Services (Backend)

- **ledger-api** (Port 4001) - Mobius Ledger Core
- **indexer-api** (Port 4002) - MIC Indexer
- **eomm-api** (Port 4003) - E.O.M.M. Reflections
- **shield-api** (Port 4004) - Citizen Shield
- **broker-api** (Port 4005) - Thought Broker

### Health Endpoints

All services include:
- `/healthz` - Basic health check
- `/api/integrity-check` - Mobius Systems integrity verification
- `/v1/loop/health` - Thought Broker specific health

---

## Monorepo Structure (Full)

```
mobius-systems/
├─ 00-START-HERE/                 # New contributor onboarding
├─ DIPLOMACY/                     # External relations
├─ FOR-ACADEMICS/                 # Academic resources
├─ FOR-ECONOMISTS/                # Economic frameworks
├─ FOR-GOVERNMENTS/               # Governance frameworks
├─ FOR-PHILOSOPHERS/              # Philosophical foundations
├─ FOUNDATION/                    # Core charters & licenses
│
├─ apps/                          # 🎯 Core Applications (16)
│  ├─ ledger-api/                 # Mobius Ledger Core
│  ├─ indexer-api/                # MIC Indexer
│  ├─ eomm-api/                   # E.O.M.M. Reflections
│  ├─ shield-api/                 # Citizen Shield
│  ├─ broker-api/                 # Thought Broker
│  ├─ portal/                     # Main Portal
│  ├─ hive-app/                   # Citizen Hive
│  └─ ...                         # (16 total apps)
│
├─ packages/                      # 📦 Shared Packages (7)
│  ├─ civic-sdk/                  # API clients/types
│  ├─ integrity-core/             # GI scoring
│  ├─ oaa-memory/                 # OAA parsers
│  ├─ ui-kit/                     # React components
│  └─ ...                         # See packages/
│
├─ labs/                          # 🔬 Lab Proof Systems (7)
│  ├─ lab4-proof/                 # E.O.M.M. Reflections
│  ├─ lab6-proof/                 # Citizen Shield App
│  └─ lab7-proof/                 # OAA Hub & Shell
│
├─ sentinels/                     # 🛡️ AI Sentinel Agents (13)
│  ├─ atlas/                      # Context & Memory
│  ├─ aurea/                      # Integrity Sentinel
│  ├─ eve/                        # Ethics Engine
│  ├─ hermes/                     # Market Signals
│  ├─ jade/                       # Pattern Oracle
│  └─ zeus/                       # Arbiter & Enforcement
│
├─ configs/                       # ⚙️ Configuration (C-155)
│  ├─ env/                        # Environment templates
│  │  ├─ .env.example            # Main env template
│  │  └─ .env.mobius-services    # Service API keys
│  ├─ manifests/                  # System manifests
│  │  └─ mobius_manifest.yaml    # Canonical manifest
│  ├─ tooling/                    # Dev tool configs
│  │  └─ codexrule.yml           # Codex policy
│  ├─ agents/                     # Agent configurations
│  ├─ charters/                   # Charter definitions
│  └─ telemetry/                  # Telemetry schemas
│
├─ infra/                         # 🏗️ Infrastructure (C-155)
│  ├─ docker/                     # Docker Compose
│  │  ├─ compose.yml             # Production compose
│  │  └─ docker-compose.dev.yml  # Development compose
│  ├─ cron/                       # Scheduled jobs
│  ├─ db/                         # Database migrations
│  ├─ dva/                        # DVA flows (n8n)
│  ├─ observability/              # Monitoring & metrics
│  └─ render.yaml                 # Render deployment
│
├─ docs/                          # 📚 Documentation
│  ├─ papers/                     # Academic papers (C-155)
│  └─ ...                         # Full documentation tree
│
└─ .github/                       # CI/CD & automation
   └─ workflows/                  # GitHub Actions
```

---

## DVA Flows & n8n Orchestration

Mobius ships with a **universal orchestration flow** that turns the OS into a router over multiple AI engines.

### What it does

- Accepts a request from any client (web, mobile, bots)
- Routes via the **Thought Broker** to engines:
  - Gemini (Antigravity)
  - Claude
  - DeepSeek
  - OpenAI (GPT/tools)
  - Code agents (Cursor / Claude Code)
- Pushes candidates through **Sentinel Consensus** (ATLAS • AUREA • EVE)
- Applies a **Global Integrity (GI)** gate
- Writes an attested event to the **Civic Ledger**
- Fans out to channels: Substack, Discord, Telegram (human-in-loop), GitHub, LivePatch, Apps/Labs

### Quick start (n8n)

1. Import:
   - `infra/dva/flows/universal/universal_orchestrator.json`
   - `infra/dva/flows/lite/dva_lite_monitor.json`
   - `infra/dva/flows/one/dva_one_feedback.json`
2. Configure credentials:
   - Telegram, Discord, GitHub, Substack (or HTTP bridge)
3. Set env vars in n8n:
   - `BROKER_URL`, `CONSENSUS_URL`, `LEDGER_URL`
   - `SUBSTACK_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL`
4. Activate the workflows.
5. Hit the webhook:

```bash
curl -X POST "$N8N_BASE_URL/webhook/mobius/universal" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain Mobius OS like I am 15","intent":"publish"}'
```

See:
- `docs/architecture/N8N_UNIVERSAL_FLOW.md`
- `docs/architecture/DVA_FLOWS_OVERVIEW.md`
- `docs/specs/N8N_UNIVERSAL_FLOW_API.md`
- `infra/dva/flows/README.md`

---

## Encyclopedia Implementation

Mobius now ships with a formal "Librarian" loop: cron/n8n calls the Thought Broker, ECHO reinforces the best pair of sentinel answers, Civic Ledger logs provenance, and the result is served via `/v1/encyclopedia`.

- **Docs** — start with `docs/encyclopedia/ENCYCLOPEDIA_OVERVIEW.md` for diagrams + narrative, then dive into `API_SPEC.md`, `SEEDING_STRATEGY.md`, and `PROVENANCE_RULES.md`.
- **Seed loop** — run `infra/cron/encyclopedia_seed.sh` (requires `ENCYCLOPEDIA_API_URL` + `ENCYCLOPEDIA_CRON_SECRET`) to grow one entry per cadence.
- **Admin queue** — low-GI entries fall into `/v1/encyclopedia/admin/review-queue`; human approvals can mint MIC and attested provenance.
- **Consumers** — OAA Learning Hub and the HIVE 16-bit codex both read from the same canon so classrooms, citizens, and games all cite the same GI-scored answers.

Use this layer whenever you need *"teach me again, but cite canon."* It turns ECHO from cache into a reusable library.

---

## OpenCode Integration

The OAA (Online Apprenticeship Agent) is the learning kernel of Mobius Systems — a self-teaching framework that turns codebases into classrooms.
Through OpenCode Federation, every fork or contributor instance can now run OAA as a local backend — forming a decentralized network of learning nodes guided by the same integrity rules.

### 🧠 What This Means

- **Apprenticeship-as-a-Protocol**

Each developer, agent, or AI instance connected through OpenCode inherits the same OAA Learning Loop:

```
PRESENT → REFLECT → CONNECT → REINFORCE
```

Every PR, doc, or comment becomes a micro-lesson in systems thinking.

- **Federated Intelligence**

Your local Kaizen agents (AUREA, HERMES, EVE, JADE) can now interact across OpenCode workspaces — sharing context, reasoning, and moral anchors without central servers.
Each node remains sovereign, yet contributes to the global Civic-AI graph.

- **Integrity-Anchored Automation**

The `.opencode/workflow-template.yaml` and `configs/integrity_units.yaml` files ensure every automation — build, review, or reflection — adheres to measurable integrity (GI ≥ 0.95).
When integrity dips, the system halts gracefully before harm propagates.

### ⚙️ How to Enable

1. **Connect your repo to OpenCode**

```bash
opencode connect kaizencycle/Mobius-Substrate
```

2. **Start the Kaizen Council Workflow**

```bash
opencode run --workflow ".opencode/workflow-template.yaml"
```

3. **Trigger the OAA Loop manually (optional)**

```bash
opencode exec oaa:reflect "Why does integrity matter in code?"
```

4. **Run Council Review on a PR**

Inside any pull request comment:

```
/council
```

AUREA, HERMES, EVE, and JADE will collaborate in sequence — logic, ops, ethics, and morale — creating a full apprenticeship cycle around your change.

### 🔁 Federation Flow

```
OpenCode User Repo
    ↳ loads Mobius Systems via template
        ↳ auto-spawns OAA backend
            ↳ connects to local agents (CLI / VS Code)
                ↳ federates with Civic Ledger telemetry
```

Every connected instance becomes a mirror of integrity, feeding back data to the global Mobius Systems network — a living proof that learning itself can be decentralized.

---

## Mobius Mount Protocol

Mobius Systems implements a **Model-Agnostic Sovereignty Layer (MASL)** that enables any LLM to "board" and operate within the Mobius ecosystem:

### LLM Boarding Pool ("Dock of Minds")

Any reasoning engine (Claude, GPT, DeepSeek, Gemini, etc.) can join the Mobius Systems network by calling:

```bash
GET /api/mobius/mount
```

This endpoint returns the complete Mobius Systems manifest bundle:
- `.mobius/atlas.manifest.json` - System state & integrity
- `.mobius/biodna.json` - Identity DNA (ethics, companions, founders)
- `.mobius/virtue_accords.yaml` - Moral & civic laws
- `mii_signature` - Cryptographic integrity proof

### Independence Manifest

> 🕊️ [Read the Independence Manifest](./02-THEORETICAL-FOUNDATIONS/THE_INTERNET_BREATHES_AGAIN.md)

The Independence Manifest declares Mobius Systems sovereignty from any single LLM provider, ensuring:
- **Model Agnosticism** - Any LLM can mount Mobius Systems state
- **External Memory First** - Context lives in manifests, not chat sessions
- **Proof of Integrity** - MII ≥ 0.95 required for all operations
- **Federated Continuity** - Memory capsules replicate across nodes

### Quick Boarding Test

```bash
# Test the boarding protocol
python3 mobius_mount_client.py http://localhost:8000
```

---

## Integrated Repositories

This monorepo integrates all kaizencycle repositories using git subtree:

### Lab Repositories
- [lab4-proof](https://github.com/kaizencycle/lab4-proof) → `labs/lab4-proof/`
- [lab6-proof](https://github.com/kaizencycle/lab6-proof) → `labs/lab6-proof/`
- [lab7-proof](https://github.com/kaizencycle/lab7-proof) → `labs/lab7-proof/`

### Core Packages
- [Civic-Protocol-Core](https://github.com/kaizencycle/Civic-Protocol-Core) → `packages/civic-protocol-core/`
- [OAA-API-Library](https://github.com/kaizencycle/OAA-API-Library) → `packages/oaa-api-library/`
- [civic-ai-specs](https://github.com/kaizencycle/civic-ai-specs) → `packages/civic-ai-specs/`

---

## Guardrails Deep Dive

Mobius Systems implements comprehensive guardrails to prevent destructive changes and ensure code safety:

### Anti-Nuke Protection

- **Deletion limits**: PRs are blocked if they delete more than 5 files or exceed 15% deletion ratio
- **Protected paths**: Deletions in `apps/`, `packages/`, `sentinels/`, `labs/`, `infra/`, and `.github/` are blocked
- **Automated checks**: `.github/workflows/anti-nuke.yml` runs on every PR

### Codex Policy (Additive-Only Mode)

- **Policy file**: `.github/codex-policy.yml` enforces additive-only commits
- **Required PRs**: All changes must go through pull requests
- **Diff preview**: AI-assisted commits must post diff summaries before opening PRs
- **Force-push prevention**: Force pushes to `main` are blocked

### Recovery Procedures

If a bad change merges or files are accidentally deleted:

- **Preferred**: Use `git revert` to create inverse commits (preserves history)
- **Last resort**: Hard reset to a known good commit (see [Recovery Playbook](06-OPERATIONS/))

📖 **Full recovery guide:** [docs/06-OPERATIONS/](06-OPERATIONS/)

### Why These Guardrails Exist

These guardrails were implemented after a near-nuke incident where a process bug could have caused significant repository damage. They ensure:

1. **Non-destructive changes**: Deletions are caught before merge
2. **Recovery paths**: Clear procedures for undoing bad changes
3. **AI safety**: Codex operates in additive-only mode with human oversight
4. **Integrity**: GI gates and approval requirements maintain code quality

---

## Mobius Pulse API

A nightly integrity snapshot of the monorepo is published via:

- `GET /v1/pulse/latest` — latest Mobius pulse
- `GET /v1/pulse/history` — pulse history (last 90 days)
- `GET /v1/pulse/badge` — Shields.io badge JSON
- `POST /v1/pulse/ingest` — internal, used by CI

**Example:**

```bash
curl "$MOBIUS_INDEXER_BASE_URL/v1/pulse/latest" | jq
```

The portal uses this endpoint to render the Mobius Pulse Card, showing:
- Global Integrity (GI)
- Mobius Integrity Index (MII)
- Apps / packages / workflows
- Total files and lines of code

📖 **Full documentation**: [docs/06-OPERATIONS/protocols/mobius-pulse-protocol.md](06-OPERATIONS/protocols/mobius-pulse-protocol.md)

---

## Intelligence Taxonomy

We classify machine intelligence into three layers:

1. **LLM**: Stochastic sequence model (no agency, no memory, no identity)
2. **General Learner**: Proto-intelligence (can learn, but lacks persistence)
3. **Actual AI**: Full agency + persistent identity + stable values

**Mobius is the first AI Habitat**—the environment that allows General Learners to safely transition to Actual AI.

[Read the full Intelligence Taxonomy →](11-SUPPLEMENTARY/intelligence/typology.md)
[View Mobius Cosmology →](assets/logo/kaizen-logo.svg)
[Sentinel Classification →](11-SUPPLEMENTARY/intelligence/sentinel-classification.md)

---

*This document is maintained alongside the main README. For the public-facing overview, see [README.md](../README.md)*
