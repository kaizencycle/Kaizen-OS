# 🌀 Mobius Substrate

**The integrity layer for AI that serves citizens, not corporations.**

[![CI](https://img.shields.io/github/actions/workflow/status/kaizencycle/Mobius-Substrate/ci.yml?branch=main)](https://github.com/kaizencycle/Mobius-Substrate/actions)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](LICENSE)
[![KTT Native](https://img.shields.io/badge/KTT-Native-green.svg)](docs/01-FOUNDATIONS/concepts/KAIZEN_TURING_TEST.md)

---

## The Problem

AI is being built without integrity infrastructure.

- Models optimize for engagement, not truth
- No way to verify AI reasoning after the fact
- Governance arrives *after* problems emerge
- Citizens are subjects of AI, not sovereigns over it

**Mobius is the civilization layer that's missing.**

---

## What Mobius Does

| Component | Purpose |
|-----------|---------|
| **EPICON** | Tracks intent and reasoning — version control for *why*, not just *what* |
| **MII** | Measures integrity over time — not just at deployment |
| **MIC** | Turns verified integrity into economic value |
| **DVA** | Orchestrates AI agents that stay human-grounded |
| **Sentinels** | AI agents that govern *systems*, not users |

---

## Quick Start

```bash
# Clone
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Mobius-Substrate

# Install
npm install

# Run the integrity ledger
cd apps/ledger-api && npm run dev

# Make your first attestation
curl -X POST http://localhost:4001/attest \
  -H "Content-Type: application/json" \
  -d '{"event": "hello_mobius", "agent": "developer", "data": {"message": "First attestation!"}}'
```

**Full quickstart:** [docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md](docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md)

---

## Choose Your Path

### 🆕 New to Mobius?

1. **[One-Pager](docs/00-START-HERE/README.md)** — 5 min overview
2. **[Why Mobius Exists](docs/01-FOUNDATIONS/vision/WHY_MOBIUS_EXISTS.md)** — The problem we're solving
3. **[Core Concepts](docs/01-FOUNDATIONS/concepts/)** — MII, MIC, KTT explained

### 🛠️ Want to Build?

1. **[Architecture Overview](docs/04-TECHNICAL-ARCHITECTURE/overview/ARCHITECTURE.md)** — How the pieces fit
2. **[Contributing Guide](CONTRIBUTING.md)** — How to add to Mobius
3. **[API Reference](docs/05-IMPLEMENTATION/api/)** — Endpoint documentation

### 🤖 Want to Run an Agent?

1. **[MobiusATLAS](agents/atlas/)** — First sentinel agent (Moltbook)
2. **[EPICON-Lite Spec](specs/EPICON-LITE.md)** — Lightweight integrity footers
3. **[Sentinel Council](sentinels/)** — AI governance agents

### 📚 Academic/Research?

1. **[For Academics](FOR-ACADEMICS/README.md)** — Peer review status, citations
2. **[Kaizen Turing Test](docs/01-FOUNDATIONS/concepts/KAIZEN_TURING_TEST.md)** — Evaluation framework
3. **[Integrity-Driven Architecture](docs/04-TECHNICAL-ARCHITECTURE/)** — Technical foundations

---

## Architecture (30 seconds)

```
Human Intent
    ↓
EPICON (captures why)
    ↓
Sentinel Council (multi-agent consensus)
    ↓
Mobius Ledger (immutable integrity record)
    ↓
Live Services (APIs, apps, agents)
```

**Core principle:** Every action has provenance. Every decision is auditable. Every agent is accountable.

---

## Live Services

| Service | Purpose | Link |
|---------|---------|------|
| Mobius Portal | Main entry point | [mobius-browser-shell.vercel.app](https://mobius-browser-shell.vercel.app/) |
| Ledger API | Integrity ledger | [civic-protocol-core-ledger.onrender.com](https://civic-protocol-core-ledger.onrender.com/) |
| MobiusATLAS | Sentinel agent on Moltbook | [moltbook.com/u/MobiusATLAS](https://moltbook.com/u/MobiusATLAS) |

---

## Repo Structure

```
Mobius-Substrate/
├── agents/          # Operational AI agents (ATLAS, etc.)
├── apps/            # 16 production applications
├── packages/        # 7 shared libraries
├── sentinels/       # 13 AI governance agents
├── specs/           # Protocol specifications
├── epicon/          # Intent and decision records
├── docs/            # Documentation
└── labs/            # Experimental proofs
```

---

## Key Metrics

| Metric | Threshold | Purpose |
|--------|-----------|---------|
| **GI** (Global Integrity) | Display in badges | System-wide health |
| **MII** (Mobius Integrity Index) | ≥ 0.95 | Required for operations |
| **Sentinels Active** | 5 core + 8 specialized | Governance coverage |

---

## Contributing

We welcome contributions. The system is designed for additive-only changes with integrity gates.

```bash
# Fork → Clone → Branch
git checkout -b feature/your-feature

# Make changes, then PR
git push origin feature/your-feature
```

**Important:**
- PRs with >5 file deletions are blocked (anti-nuke)
- All changes require human review
- CI runs integrity checks automatically

**Full guide:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Philosophy

> "Intelligence moves. Integrity guides." — Mobius Principle

Mobius is not just software. It's infrastructure for a world where AI serves citizens, not platforms.

**We build for timescales beyond our own sessions.**

---

## Links

| Resource | Link |
|----------|------|
| GitHub | [github.com/kaizencycle/Mobius-Substrate](https://github.com/kaizencycle/Mobius-Substrate) |
| Substack | [kaizencycle.substack.com](https://kaizencycle.substack.com) |
| MobiusATLAS | [moltbook.com/u/MobiusATLAS](https://moltbook.com/u/MobiusATLAS) |
| Issues | [File an Issue](https://github.com/kaizencycle/Mobius-Substrate/issues) |
| Documentation | [kaizencycle.github.io/Mobius-Substrate](https://kaizencycle.github.io/Mobius-Substrate/) |

---

## License

**AGPL-3.0** with Ethical Addendum — See [LICENSE](LICENSE)

---

<p align="center">
  <em>The cathedral is built by those who show up.</em><br>
  <strong>EPICON-3 Live | Integrity-First Architecture</strong>
</p>
