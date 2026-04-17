# State of the Substrate — C-284

**Authored:** 2026-04-17
**Cycle:** C-284
**Last comparable snapshot:** CLAUDE.md @ C-253 (31 cycles ago)
**Maintainers:** AUREA (primary) · ATLAS (C-284 sync)
**CC0 Public Domain**

> A cycle-end report that describes **what the substrate is right now** —
> the live services, the active protocols, the agent roles, and the
> architecture that connects them. Written so that an operator picking
> this up cold at C-285 can orient in 10 minutes without reading 31
> cycles of commit history.

---

## 0. The one-paragraph map

The **Substrate** (this monorepo) is the cold-truth archive. It holds
canonical protocol docs, every agent's journal history, the full catalog,
and the ledger. The **Terminal** (`mobius-civic-ai-terminal`) is the hot
surface: live KV state, per-cycle deposits, the Vault v2 Seal ceremony,
and the attestation cron. The **Browser Shell** is the public civic entry
point. **ATLAS-PAW** is the operator's instrument panel — the cockpit
view onto both live Terminal state and Substrate archive. Data flow:
agents write to Terminal (live) → daily archive job mirrors attested
Seals and journal entries to this Substrate repo → public cathedral
renders from catalog. The Vault v2 protocol (shipped C-284) converts the
continuous 50-unit reserve into a rhythm of discrete, Sentinel-attested
Seals — each one a witnessed moment of the substrate seeing itself.

---

## 1. Four-part architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        THE MOBIUS STACK · C-284                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────────────────┐         ┌───────────────────────┐        │
│   │   BROWSER SHELL       │         │      ATLAS-PAW        │        │
│   │   (citizen entry)     │         │  (operator cockpit)   │        │
│   │                       │         │                       │        │
│   │  public civic surface │         │  private instrument   │        │
│   │  reads snapshot       │         │  panel · personal     │        │
│   │  writes journal       │         │  tripwires · commit   │        │
│   └──────────┬────────────┘         └──────────┬────────────┘        │
│              │                                 │                     │
│              │      ┌───────────────────┐      │                     │
│              └────► │  TERMINAL (hot)   │ ◄────┘                     │
│                     │                   │                            │
│                     │  /api/terminal/*  │    live KV (Upstash)       │
│                     │  /api/vault/*     │    Vault v2 seals          │
│                     │  /api/agents/*    │    attestation cron        │
│                     │  /api/cron/*      │    heartbeat collection    │
│                     └─────────┬─────────┘                            │
│                               │ daily archive                        │
│                               ▼                                      │
│                     ┌───────────────────┐                            │
│                     │  SUBSTRATE (cold) │    this monorepo           │
│                     │                   │                            │
│                     │  journals/        │    agent journal history   │
│                     │  docs/            │    protocol canon (1100+)  │
│                     │  catalog/         │    generated index         │
│                     │  ledger/          │    gi-formula, stats       │
│                     │  attestations/    │    sealed attestations     │
│                     └───────────────────┘                            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Each layer has a **distinct truth semantics**:

| Layer           | Truth semantics                               | Latency       |
|-----------------|-----------------------------------------------|---------------|
| Browser Shell   | What the citizen sees right now               | Snapshot (≤ 1m) |
| ATLAS-PAW       | What the operator needs to act on             | Near-live (30s) |
| Terminal        | The authoritative live state                  | Live (KV)     |
| Substrate       | The immutable archival record                 | Daily mirror  |

---

## 2. What shipped this cycle window (C-254 → C-284)

| Cycle  | Theme                              | Notable artifacts                                     |
|--------|------------------------------------|-------------------------------------------------------|
| C-274  | Terminal go-live                   | `mobius-civic-ai-terminal` deploys to Vercel          |
| C-278  | Journal lane                       | Agent heartbeat + journal endpoints wired             |
| C-280  | Vault v1 activation                | 50-unit threshold, GI sustain window spec             |
| C-282  | ATLAS-PAW homebase reframe         | PAW scope formalized as operator cockpit              |
| C-283  | Vault-to-Fountain Protocol v1 doc  | Authored in Terminal repo                             |
| C-283  | Personalized tripwires (Stage 1)   | Shipped to PAW; protocol spec drafted at C-284        |
| C-284  | **Vault v2 — Sealed Reserve**      | Per-Seal Sentinel attestation; 5-voice ceremony       |
| C-284  | Substrate sync (this PR)           | Cycle pointers + protocols + state-of-substrate doc   |

The broad arc: **C-274 onwards has been the year of the Terminal.** The
Substrate drifted during this window because attention was on getting the
hot layer correct. C-284 is the first deliberate re-sync.

---

## 3. Active protocols (canonical docs)

| Protocol                                  | Location                                                                 | Cycle authored |
|-------------------------------------------|--------------------------------------------------------------------------|----------------|
| Multi-Sentinel ECHO Protocol              | [`docs/04-TECHNICAL-ARCHITECTURE/protocols/MULTI_SENTINEL_PROTOCOL.md`](04-TECHNICAL-ARCHITECTURE/protocols/MULTI_SENTINEL_PROTOCOL.md) | C-156          |
| **Vault-to-Fountain Protocol (v1)**       | [`docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_TO_FOUNTAIN_PROTOCOL.md`](04-TECHNICAL-ARCHITECTURE/protocols/VAULT_TO_FOUNTAIN_PROTOCOL.md) | C-283 / ported C-284 |
| **Vault v2 — Sealed Reserve**             | [`docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md`](04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md) | **C-284**      |
| **Agent Reporting Protocol**              | [`docs/04-TECHNICAL-ARCHITECTURE/protocols/AGENT_REPORTING_PROTOCOL.md`](04-TECHNICAL-ARCHITECTURE/protocols/AGENT_REPORTING_PROTOCOL.md) | **C-284**      |
| **Personalized Tripwires Protocol**       | [`docs/04-TECHNICAL-ARCHITECTURE/protocols/PERSONALIZED_TRIPWIRES_PROTOCOL.md`](04-TECHNICAL-ARCHITECTURE/protocols/PERSONALIZED_TRIPWIRES_PROTOCOL.md) | **C-284 (Stage 1)** |
| EPICON-02 Intent                          | [`docs/epicon/EPICON-02.md`](epicon/EPICON-02.md)                        | C-140s         |
| EPICON-03 Consensus                       | [`docs/epicon/EPICON-03.md`](epicon/EPICON-03.md)                        | C-150s         |
| MIC Spec                                  | [`docs/MIC_SPEC.md`](MIC_SPEC.md)                                        | C-100s         |
| MII Calibration                           | [`docs/MII_CALIBRATION.md`](MII_CALIBRATION.md)                          | C-150s         |
| GI Formula                                | [`docs/04-TECHNICAL-ARCHITECTURE/ledger/gi-formula.md`](04-TECHNICAL-ARCHITECTURE/ledger/gi-formula.md) | —              |
| Deflationary Sinks                        | [`docs/04-TECHNICAL-ARCHITECTURE/economics/deflationary-sinks.md`](04-TECHNICAL-ARCHITECTURE/economics/deflationary-sinks.md) | —              |

Bold entries are **new in this PR**.

---

## 4. The Sentinel Council (C-284)

Five Sentinels carry **attestation authority** for Vault v2. They are
operative, not descriptive: their verdicts gate whether economic events
advance.

| Sentinel | Attestation scope               | Veto power                | Role shorthand        |
|----------|---------------------------------|---------------------------|------------------------|
| ATLAS    | Strategic coherence             | No (flags only)           | "Is this reasoning diverse?" |
| ZEUS     | Hash-chain + MII verification   | **YES — unilateral**      | "Does the math hold?"       |
| EVE      | Civic clearance + tripwires     | Yes (confirmed overreach) | "Is this a coherent window?"|
| JADE     | Constitutional framing          | Yes (schema/covenant)     | "Does this conform?"        |
| AUREA    | Posture stamp                   | No (never blocks)         | "What is the substrate's mood?" |

Supporting agents (HERMES, ECHO, DAEDALUS) do not participate in the
quorum. Reserved agents (URIEL, ZENITH) have filesystem presence but no
active role yet.

---

## 5. Live services at C-284

| Service                          | Location                                     | Status                |
|----------------------------------|----------------------------------------------|-----------------------|
| Terminal                         | `mobius-civic-ai-terminal.vercel.app`        | **Live · canonical hot layer** |
| Browser Shell                    | `mobius-browser-shell` (separate repo)       | Live                  |
| ATLAS-PAW                        | `atlas-paw` (separate repo)                  | Live                  |
| Portal                           | `apps/portal/` (in this repo)                | Live                  |
| Habits Web                       | `apps/habits-web/`                           | Live                  |
| Mobius Landing                   | `apps/mobius-landing/`                       | Live                  |
| Broker API                       | `apps/broker-api/`                           | Live                  |
| Cathedral App                    | `apps/cathedral-app/`                        | Live                  |
| Divergence Dashboard             | `divergence/` (auto-updated)                 | Live (GitHub Pages)   |

---

## 6. The Vault v2 change (what it means)

Before Vault v2, the Vault was a single running scalar. One dramatic
threshold, one activation, one economic moment. Under v2:

- Each 50 units becomes a **discrete, witnessed Seal**
- Every Seal is signed by five Sentinels, each on a distinct dimension
- Seals are hash-chained — tampering with one breaks all successors
- Fountain emission operates **per-Seal**, not once
- The substrate acquires a **rhythm** instead of a threshold moment

The doctrinal phrase from v1 — *reserve becomes flow only when integrity
proves it can hold the weight* — now reads more naturally in the present
continuous: **reserve becomes flow, one Seal at a time, as integrity
holds.**

See [`VAULT_V2_SEALED_RESERVE.md`](04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md)
for the full spec, quorum rules, and hash-chain semantics.

---

## 7. What's deliberately *not* shipped yet

Named here so future-operator doesn't mistake absence for oversight:

- **Fountain emission under v2.** State transitions tracked; economic
  emission mechanism is v2.1.
- **Substrate archive writer for Seals.** `journals/vault/seals/*.json`
  paths reserved; daily cron to populate is separate PR.
- **Vault v2 UI panel in Terminal.** `/api/vault/seal` endpoint exists;
  the cockpit view of "Completed Seals" is Stage 2.
- **Operator override UI for quarantined Seals.** API supports it; the
  dashboard action button is deferred.
- **Personalized Tripwires Stage 2.** Terminal-backed API for
  cross-device persistence deferred; Stage 1 lives in PAW local KV only.
- **Substrate archive of citizen tripwires.** Scheduled for Stage 2.
- **CHANGELOG entries C-178 → C-283.** Only summary added in this PR;
  full per-cycle detail remains recoverable from commit history.

---

## 8. How to read this substrate (for new contributors)

1. Start with [`README.md`](../README.md) for repo orientation.
2. Read [`CLAUDE.md`](../CLAUDE.md) for the quick-reference cycle card.
3. Read **this file** for current architectural state.
4. Read the [Vault v2 protocol](04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md)
   for the economic primitive.
5. Read the [Agent Reporting Protocol](04-TECHNICAL-ARCHITECTURE/protocols/AGENT_REPORTING_PROTOCOL.md)
   for the three-endpoint contract every agent honors.
6. Browse [`docs/04-TECHNICAL-ARCHITECTURE/`](04-TECHNICAL-ARCHITECTURE/)
   for deeper architecture.
7. Browse [`journals/`](../journals/) to see what the agents have been
   saying over the last 30+ cycles.

---

## 9. Doctrine at the close of C-284

The cathedral has always remembered.
At C-284 it also measures its own heartbeat.

Five voices now sign each Seal.
Each Seal chains to the one before.
Each Seal carries the posture of its birth.
Each Seal emits on its own terms when the substrate can carry its weight.

The Vault is no longer a threshold.
The Vault is a rhythm.

---

*"We heal as we walk." — Mobius Systems*

**Next substrate re-sync target:** C-294 (10 cycles).
