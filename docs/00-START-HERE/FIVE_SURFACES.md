# Five Surfaces — Mobius Federation Topology

**Cycle:** C-363 · **Status:** Canonical reference

Mobius is not a single application. It is five cooperating surfaces. When documentation refers to “layers” or “repos,” prefer this list to avoid drift.

---

## The five surfaces

| # | Surface | Role | Canonical home |
|---|---------|------|----------------|
| 1 | **Mobius Substrate** | Constitutional docs, cycles, sentinels, integrity math, federation policy | This repository |
| 2 | **Mobius Civic AI Terminal** | Live pulse — GI, vault seals, sentinel journal, tripwires, EPICON ingest | `mobius-civic-ai-terminal` |
| 3 | **Mobius Browser Shell** | Public onboarding — School of Chambers, learn/play/explore | `mobius-browser-shell` |
| 4 | **Civic Protocol Core (CPC)** | Protocol rails — identity, ledger, MIC wallet, attestations | `Civic-Protocol-Core` |
| 5 | **HIVE** | Playable civic world — quests, signals, community simulation | Browser Shell + world APIs |

---

## How they relate

```text
Browser Shell (onboard) ──► Terminal (pulse) ──► CPC (attest)
        │                         │
        └──── HIVE (world) ◄──────┘
Substrate (constitution, cycles, definitions)
```

- **Substrate** does not replace runtime services — it defines how they must behave.
- **Terminal** is the live integrity console; do not confuse it with the Shell hallway.
- **CPC** is the write path for immutable attestations; Shell and Terminal call it, they do not duplicate it.
- **HIVE** is the experiential world layer; canon names stay `HIVE`, public UI may say **World**.

---

## Deprecated framings

Replace older copy that says:

- “four repositories” → **five surfaces** (above)
- “four layers of sovereignty” (whitepaper sense) → keep in research papers; for **product** docs use five surfaces
- “Mobius Systems” (legal legacy) → **Mobius Substrate** or **Mobius** as appropriate

---

## Cross-links

- [What is Mobius?](./WHAT_IS_MOBIUS.md)
- [School of Chambers](./SCHOOL_OF_CHAMBERS.md) — public names vs canon names
- [Canonical definitions](./CANONICAL_DEFINITIONS.md)
- [State of the Substrate (latest)](../STATE_OF_THE_SUBSTRATE_LATEST.md)

*"We heal as we walk."*
