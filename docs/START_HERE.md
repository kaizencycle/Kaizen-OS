# Start Here

Welcome to **Mobius-Substrate**.

Mobius-Substrate is a civic-technical monorepo that makes integrity measurable, enforceable, and correctable in AI-governed systems. It provides intent accountability (EPICON), integrity scoring (MII), integrity economics (MIC), multi-agent governance (Sentinel Council), and distributed orchestration (DVA).

---

## What to read first

### 5 minutes

1. `README.md` -- what the project does and how to run it
2. `CONTRIBUTING.md` -- how to work in the repo

### 15 minutes

1. `README.md`
2. `CONTRIBUTING.md`
3. `docs/START_HERE.md` (this file)
4. `docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md`

### 30 minutes

1. `README.md`
2. `docs/START_HERE.md`
3. `specs/` -- protocol and interface specifications
4. `services/` -- backend services
5. `packages/` -- shared libraries and integrity primitives
6. `sentinels/` -- AI governance agents

---

## Repository map

### Core runtime surfaces

| Directory | Purpose |
|-----------|---------|
| `apps/` | Deployable user-facing applications (portal, broker, indexer, shield, gateway) |
| `services/` | Backend services and APIs (civic-ledger, gi-aggregator, epoch-burn) |
| `packages/` | Shared libraries and SDKs (integrity-core, civic-sdk, oaa-memory) |

### Governance and system integrity

| Directory | Purpose |
|-----------|---------|
| `sentinels/` | AI governance agents and review surfaces (ATLAS, AUREA, EVE, JADE, HERMES) |
| `specs/` | Protocol and interface specifications |
| `schemas/` | Shared schemas and data contracts |
| `ledger/` | Attestation and memory-oriented records |

### Research and experimentation

| Directory | Purpose |
|-----------|---------|
| `labs/` | Experimental proofs, prototypes, and validation work |
| `examples/` | Reference patterns and demos |
| `pilots/` | Real-world pilot surfaces and trial integrations |

### Operations and infrastructure

| Directory | Purpose |
|-----------|---------|
| `infra/` | Deployment and infrastructure configuration |
| `scripts/` | Build automation and repo tooling |
| `tests/` | Validation and regression suites |
| `monitoring/` | Operational health and observability assets |
| `grafana/` | Dashboard configuration |

### Documentation and project memory

| Directory | Purpose |
|-----------|---------|
| `docs/` | Technical and architectural documentation |
| `journals/` | Cycle notes and internal recordkeeping |
| `catalog/` | Indexing and topology references |
| `attestations/` | Integrity and provenance artifacts |

---

## What is core vs experimental

### Core

The safest starting points for contributors:

- `README.md`
- `CONTRIBUTING.md`
- `services/` -- production backend services
- `packages/` -- shared libraries
- `specs/` -- protocol definitions
- `tests/` -- test suites

### Governance-sensitive

Changes here may require extra care, sign-off, or stricter review:

- `sentinels/`
- `ledger/`
- `schemas/`
- `.github/`
- `CODEOWNERS`

### Experimental

Expect change, iteration, and local conventions:

- `labs/`
- `examples/`
- `pilots/`

---

## Contributor path

### Fix docs

Start with `README.md`, `docs/`, and `CONTRIBUTING.md`.

### Work on backend or runtime

Start with `services/`, `packages/`, and `tests/`.

### Work on governance or integrity

Start with `sentinels/`, `specs/`, and `.github/`.

---

## Before opening a PR

Run:

```bash
npm run lint
npm run type-check
npm run build
npm run test --workspaces --if-present
npm run integrity:check
```

If your change is destructive, high-risk, or governance-sensitive, coordinate with maintainers and the owning Sentinel surface before merge.

---

## Architecture at a glance

```
HUMAN INTENT
    |
OAA HUB --> parses goals into specs
    |
THOUGHT BROKER --> multi-agent consensus (EPICON-3)
    |
MOBIUS LEDGER --> immutable integrity record (EPICON-2)
    |
INTEGRITY CORE --> validation & circuit breakers (EPICON-1)
    |
LIVE SERVICES
```

### Core services

| Service | Port | Purpose |
|---------|------|---------|
| Civic Ledger | 3000 | Immutable attestation storage and integrity record |
| GI Aggregator | 3001 | Global Integrity score computation |
| MIC Indexer | 4002 | Integrity credit accounting |
| OAA Hub | 3004 | Human intent to system specs |
| Thought Broker | 4005 | Multi-LLM consensus engine |

---

## Canonical naming

The canonical public repository name is **Mobius-Substrate**.

Legacy references to "Mobius Systems" or "Kaizen-OS" should be treated as historical context unless a specific file is intentionally archival.

---

## Merge philosophy

Mobius-Substrate is governed by a simple principle:

**Clarity is part of integrity.**

The best PRs make the system easier to reason about, not just larger.
