# Mobius-Substrate

**Integrity infrastructure for AI systems.**

Mobius-Substrate is a set of open-source tools that make integrity measurable, enforceable, and correctable in AI-governed systems. It provides intent accountability, integrity scoring, and multi-agent consensus — so AI systems can be held to their own stated values over time.

| Component | What It Does | Status |
|-----------|-------------|--------|
| **EPICON** | Records *why* decisions were made, not just what changed | Live |
| **MII** | Scores system integrity on a 0-1 scale, continuously | Live |
| **MIC** | Integrity credits: **reward accounting** runs continuously; **circulating issuance** is integrity-gated (GI sustain, Vault/Seal, quorum). See [MIC runtime docs](docs/04-TECHNICAL-ARCHITECTURE/mic/README.md). | Beta |
| **Sentinel Council** | AI agents that govern *the system*, not users | Live |
| **DVA** | Distributed agent orchestration with constitutional constraints | Beta |

---

## Quick Start

```bash
git clone https://github.com/kaizencycle/Mobius-Substrate.git
cd Mobius-Substrate
npm install

# Start the integrity ledger
cd services/civic-ledger
npm run dev

# Check the service is running
curl http://localhost:3000/health

# Query the integrity score
curl http://localhost:3000/gi
```

**Full quickstart:** [docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md](docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md)

---

## Start Here

New to the repo? Read in this order:

1. `README.md` (this file)
2. `CONTRIBUTING.md`
3. [`docs/00-START-HERE/DOCS.md`](docs/00-START-HERE/DOCS.md) — navigation hub
4. [`docs/00-START-HERE/REPO_DIGEST.md`](docs/00-START-HERE/REPO_DIGEST.md) — repository map
5. `docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md`

**Current system snapshot:** [docs/STATE_OF_THE_SUBSTRATE_C-338.md](docs/STATE_OF_THE_SUBSTRATE_C-338.md) — live cycle pointer is [`cycle.json`](cycle.json) (authoritative when docs disagree).

---

## Architecture

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

### Core Services

| Service | Port | Purpose |
|---------|------|---------|
| Civic Ledger | 3000 | Immutable attestation storage and integrity record |
| GI Aggregator | 3001 | Global Integrity score computation |
| MIC Indexer | 4002 | Integrity credit accounting |
| OAA Hub | 3004 | Human intent to system specs |
| Thought Broker | 4005 | Multi-LLM consensus engine |

---

## Repository Structure

```
Mobius-Substrate/
├── apps/              # Deployable applications (portal, broker, indexer, shield, gateway)
├── services/          # Backend services (civic-ledger, gi-aggregator, epoch-burn)
├── packages/          # Shared libraries (integrity-core, civic-sdk, oaa-memory)
├── sentinels/         # AI governance agents (ATLAS, ZEUS, EVE, JADE, AUREA, HERMES, ECHO, DAEDALUS)
├── docs/              # Technical documentation, architecture, operations
├── specs/             # Protocol specifications
├── tests/             # Test suites
├── scripts/           # Build and operations tooling
├── labs/              # Experimental proofs of concept
└── infra/             # Infrastructure and deployment configs
```

---

## What Problem Does This Solve?

AI systems drift from their stated values. This happens because:

1. **Intent is undocumented.** Git tells you *what* changed, not *why*.
2. **Integrity is unmeasured.** There's no continuous score for whether a system is living up to its own commitments.
3. **Governance is an afterthought.** Constraints get added after deployment, not built into the architecture.

Mobius-Substrate addresses all three by making integrity a first-class system property — something that's measured, enforced, and corrected at the infrastructure level.

---

## For Different Audiences

**Developers:** Start with the [Quick Start](#quick-start) above, then explore `services/civic-ledger/` and `packages/integrity-core/`.

**Researchers:** See [docs/07-RESEARCH-AND-PUBLICATIONS/for-academics/README.md](docs/07-RESEARCH-AND-PUBLICATIONS/for-academics/README.md) for academic context, or browse `docs/07-RESEARCH-AND-PUBLICATIONS/papers/` for published research on integrity-driven architecture.

**Governance / Policy:** See [docs/07-RESEARCH-AND-PUBLICATIONS/for-governments/README.md](docs/07-RESEARCH-AND-PUBLICATIONS/for-governments/README.md) for how Mobius applies to institutional AI governance.

**Contributors:** Read [CONTRIBUTING.md](CONTRIBUTING.md). PRs require an EPICON intent block — we dogfood our own accountability tools.

---

## Live Services

| Service | URL | Status |
|---------|-----|--------|
| School of Chambers | [mobius-substrate.com](https://mobius-substrate.com) | ✓ Live |
| Civic Terminal | [terminal.mobius-substrate.com](https://terminal.mobius-substrate.com) | ✓ Live |
| Handbook | [handbook.mobius-substrate.com](https://handbook.mobius-substrate.com) | ✓ Live |
| Integrity Ledger | [civic-protocol-core-ledger.onrender.com](https://civic-protocol-core-ledger.onrender.com) | ⚠ Degraded |
| Email | [michael@mobius-substrate.com](mailto:michael@mobius-substrate.com) | ✓ Live |

Legacy Vercel URLs remain reachable during transition; canonical surfaces use `mobius-substrate.com` (registered C-356, propagated C-357).

---

## Contributing

We welcome contributions. The system uses additive-only changes with integrity gates.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check [Good First Issues](https://github.com/kaizencycle/Mobius-Substrate/labels/good%20first%20issue)
3. Fork, branch, PR with EPICON intent block
4. CI runs integrity checks automatically

**Anti-nuke protection:** PRs with >5 file deletions are blocked. Force-push to `main` is disabled.

---

## License

AGPL-3.0 with Ethical Addendum — See [LICENSE](LICENSE) and [ETHICAL_ADDENDUM.md](ETHICAL_ADDENDUM.md)

---

## Links

| Resource | Link |
|----------|------|
| Website | [mobius-substrate.com](https://mobius-substrate.com) |
| Terminal | [terminal.mobius-substrate.com](https://terminal.mobius-substrate.com) |
| Handbook | [handbook.mobius-substrate.com](https://handbook.mobius-substrate.com) |
| GitHub | [github.com/kaizencycle/Mobius-Substrate](https://github.com/kaizencycle/Mobius-Substrate) |
| Substack | [kaizencycle.substack.com](https://kaizencycle.substack.com) |
| Email | [michael@mobius-substrate.com](mailto:michael@mobius-substrate.com) |
| Issues | [File an Issue](https://github.com/kaizencycle/Mobius-Substrate/issues) |

---

*Integrity infrastructure. Built slowly. Built with memory.*
