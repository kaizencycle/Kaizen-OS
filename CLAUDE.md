# Mobius Substrate Monorepo

**Current Cycle:** C-284
**Package Manager:** npm (standardized from pnpm in C-180)
**Build Tool:** Turborepo
**Node Version:** 20
**Live GI:** 0.74 (yellow mode)
**Live Vault:** 44.24 / 50 reserve units (sealed)
**MII Status:** ≥ 0.95 target

---

## What this repo is

The Mobius Substrate is **the constitutional and archival layer** of the Mobius
civic AI system. It is not the live runtime — that's the Terminal. It is not
the operator console — that's ATLAS-PAW. It is not the citizen entry — that's
the Browser Shell. The Substrate is where the protocol lives, where the archive
lives, where the covenants are written, and where long-running processes
(cycle synthesis, scheduled sentinels) are anchored.

One-line frame: **the Terminal is the heartbeat, the Substrate is the memory.**

---

## Current architecture (C-284)

```
                      ┌─────────────────────────┐
                      │   Mobius-Substrate      │  (this repo)
                      │   constitution +        │
                      │   journal archive       │
                      └───────────┬─────────────┘
                                  │  cold truth
                                  │  (daily archive cron)
                                  ▼
  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
  │  ATLAS-PAW   │◄──────►│  Terminal    │◄──────►│ Browser Shell│
  │  operator    │        │  gateway +   │        │  citizen     │
  │  console     │        │  hot truth   │        │  entry       │
  │              │  KV    │              │  KV    │              │
  └──────────────┘        └──────┬───────┘        └──────────────┘
                                 │
                         ┌───────┴────────┐
                         │  Upstash KV    │  working memory
                         │  hot state     │  (heartbeat, GI, vault,
                         │                │   tripwires, signals)
                         └────────────────┘
```

### Where things live

| Thing | Repo | Why there |
|---|---|---|
| Constitution, protocols, covenant text | `Mobius-Substrate` | Canonical immutable record |
| Archived agent journals | `Mobius-Substrate/journals/` | Cold truth, git-versioned |
| Live heartbeat, GI, tripwires, Vault state | Upstash KV via Terminal | Hot truth, 5-min-to-2h TTLs |
| Journal read/write API, snapshot aggregator | `mobius-civic-ai-terminal` | Gateway for agents and operator |
| Operator dashboard, personalized tripwires | `atlas-paw` | Mobile-first homebase |
| Citizen chat interface, lab bridges | `mobius-browser-shell` | Public entry point |

---

## Current protocols (canonical, start here)

All protocol docs now live under `docs/protocols/`:

1. **`vault-to-fountain-protocol.md`** (v1) — continuous reserve with single-threshold activation. Original doctrine, preserved for historical reference.
2. **`vault-v2-sealed-reserve.md`** (v2, C-284) — discrete 50-unit Seals with five-Sentinel attestation, hash chain, per-Seal Fountain emission. **Current active doctrine.**
3. **`agent-reporting-protocol.md`** (C-284) — how agents emit heartbeats, commit journals, and sign attestations via the Terminal gateway.
4. **`personalized-tripwires-protocol.md`** (C-284) — per-citizen tripwire definitions, source resolver registry, cron evaluator, quarantine rules. Seeded in ATLAS-PAW, will port to Browser Shell at Stage 2.

If you're new here, read them in that order.

---

## Repository structure

```
Mobius-Substrate/
├── docs/
│   ├── protocols/              # Active protocol specs (start here)
│   ├── 00-START-HERE/          # Onboarding hub
│   ├── 02-THEORETICAL-FOUNDATIONS/
│   ├── 03-GOVERNANCE-AND-POLICY/
│   ├── 04-TECHNICAL-ARCHITECTURE/
│   ├── 05-IMPLEMENTATION/
│   ├── 06-OPERATIONS/
│   ├── 07-RESEARCH-AND-PUBLICATIONS/
│   ├── 08-REFERENCE/
│   ├── 10-ARCHIVES/            # Legacy specs, historical whitepapers
│   └── STATE_OF_THE_SUBSTRATE_C-284.md  # Current system snapshot
│
├── journals/                   # Archived agent journal entries
│   ├── atlas/                  # per-agent dated JSON
│   ├── zeus/
│   ├── eve/
│   ├── jade/
│   ├── aurea/
│   ├── hermes/
│   ├── echo/
│   ├── daedalus/
│   └── cycles/                 # cycle-level summaries
│
├── sentinels/                  # Agent implementations
│   ├── atlas/                  # Strategic reasoning
│   ├── zeus/                   # Verification authority
│   ├── eve/                    # Ethics and civic risk
│   ├── jade/                   # Constitutional framing
│   ├── aurea/                  # Synthesis and posture
│   ├── hermes/                 # Routing and prioritization
│   ├── echo/                   # Event ingestion
│   └── daedalus/               # Infrastructure diagnostics
│
├── apps/                       # Services (Next.js, Express)
├── packages/                   # Shared libraries
├── specs/                      # Formal specs (MII, shards, ledger)
├── schemas/                    # JSON schema definitions
├── accords/                    # Inter-agent agreements
├── attestations/               # Signed attestation records
├── ledger/                     # Civic protocol ledger
├── mii/                        # MII calibration data
├── catalog/                    # Substrate catalog snapshots
├── configs/                    # Service configurations
├── .github/                    # PR templates, CI workflows
└── cycle.json                  # Current cycle pointer (this is authoritative)
```

---

## The five Sentinels (current roles)

As of Vault v2, the Sentinel Council operates rather than just describes. Each
Sentinel has explicit attestation authority over new Seals, plus ongoing
cycle-level oversight:

| Agent | Tier | Attestation scope | Other duties |
|---|---|---|---|
| **ATLAS** | Sentinel | Strategic coherence (diversity of reasoning) | Cycle observation, operator accountability |
| **ZEUS** | Sentinel | Verification authority (hash chain, math) | Verification of contested claims, unilateral veto on seals |
| **EVE** | Observer → Sentinel (active) | Ethical and civic clearance | Governance synthesis, narrative-overreach tripwires |
| **JADE** | Architect | Constitutional framing (schema + precedent) | Memory annotation, covenant routing |
| **AUREA** | Architect | Synthesis and posture (never rejects; stamps) | Strategic posture, long-arc patterns |
| **HERMES** | Steward | (no seal attestation) | Routing and prioritization |
| **ECHO** | Steward | (no seal attestation) | Event ingestion |
| **DAEDALUS** | Architect | (no seal attestation) | Infrastructure diagnostics |

Of eight named agents, **five are voting Sentinels on Seal attestation**:
ATLAS, ZEUS, EVE, JADE, AUREA. HERMES, ECHO, and DAEDALUS are operational
agents whose work the Sentinels witness but who do not themselves attest Seals.

---

## How agents report (short version)

Full doctrine: `docs/protocols/agent-reporting-protocol.md`.

- **Heartbeat**: `POST /api/agents/heartbeat` on the Terminal. Auth: `AGENT_SERVICE_TOKEN` bearer. Writes `HEARTBEAT:{agent}` to KV with 5-min TTL.
- **Journal commit**: `POST /api/agents/journal/commit`. Auth same. Writes to KV hot lane (LPUSH, cap 200). Appears in `/api/terminal/snapshot` journal lane. Mirrors to Substrate archive nightly.
- **Seal attestation**: `POST /api/vault/seal/attest`. Auth same + HMAC signature over `seal_hash || verdict || rationale`. Only for voting Sentinels. Idempotent.

Same protocol regardless of where the agent runs — Cursor Background Agent,
Render worker, PAW cron, Vercel cron, local laptop. The Terminal is the
single gateway.

---

## Current cycle context (C-284)

- **GI**: 0.74 (yellow mode, degraded)
- **Vault**: 44.24 / 50 reserve units, sealed; ~5.76 units from first Seal candidate formation
- **Active tripwires**: EVE narrative-cluster-spike elevated, freshness flags on signals lane
- **Fountain**: not yet active; will be per-Seal under v2 when GI sustains ≥ 0.95 for 5 cycles
- **Most recent seal**: none yet (v2 is C-284 spec; first Seal will mint when `in_progress_balance` crosses 50)

---

## For AI assistants reading this

Point of failure in the previous `CLAUDE.md`: it froze at C-253 and drifted 31
cycles behind reality. To prevent recurrence:

- **`cycle.json` is authoritative.** If this doc and `cycle.json` disagree, `cycle.json` wins.
- **Live state is authoritative over docs.** Always `curl /api/terminal/snapshot` before claiming anything about current GI, Vault, or tripwire state.
- **The `docs/protocols/` directory is authoritative over archived specs.** If an older spec in `docs/10-ARCHIVES/` says one thing and a protocol in `docs/protocols/` says another, the protocol wins.
- **If you're about to write documentation, write it once canonically.** Don't duplicate across `10-ARCHIVES`, `04-TECHNICAL-ARCHITECTURE`, and `docs/protocols` — one of these wins, and it's the one under `protocols/`.

---

## Package standardization (reminder)

- Package manager: **npm** (not pnpm)
- Install: `npm install`
- Build: `npm run build` (Turborepo)
- Test: `npm test`
- Type check: `npm run type-check`

Services using pnpm in `package.json` should be migrated. The Terminal repo
uses pnpm; the Substrate uses npm. They coexist fine.

---

**Maintained by:** Mobius Systems Core Team
**Last Updated:** C-284 (2026-04-17)
**Format:** this doc tracks live state, so "Last Updated" should be the literal
last-edited date, not an aspirational quarter.
