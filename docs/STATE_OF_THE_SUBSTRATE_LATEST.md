# State of the Substrate — Latest

**Cycle:** C-360  
**Updated:** 2026-07-02  
**GI:** ~0.90 · recovering (yellow)  
**Custodian:** Michael (kaizencycle)

> Stable entry point for README and handbook nav. Cycle-stamped snapshots (`STATE_OF_THE_SUBSTRATE_C-*.md`) are historical; this file tracks [`cycle.json`](../cycle.json).

---

## Dateline

**C-360 Federation Optimization Sweep** — constitutional consistency, integrity-surface repair, and operational hardening across five repos.

| Surface | URL |
|---------|-----|
| School of Chambers | [mobius-substrate.com](https://mobius-substrate.com) |
| Civic Terminal | [terminal.mobius-substrate.com](https://terminal.mobius-substrate.com) |
| Handbook | [handbook.mobius-substrate.com](https://handbook.mobius-substrate.com) |

---

## This cycle at a glance

- **PR-B (Substrate):** License policy (`configs/license-policy.yaml`), cycle pointer CI, sentinel roster 10 (URIEL + ZENITH)
- **Layer 1 writer:** `mobius-bot-state-sync` still failing — rotate `MOBIUS_BOT_APP_ID` / `MOBIUS_BOT_PRIVATE_KEY`
- **Substrate attest:** Identity service account live; Terminal Vercel creds + reattest drain pending
- **323 Reserve Blocks** sealed; Fountain LOCKED (GI below 0.95 sustain)

---

## Sentinel roster (10)

Governance agents: ATLAS, ZEUS, EVE, JADE, AUREA, HERMES, ECHO, DAEDALUS, **URIEL** (truth), **ZENITH** (shadow).

**Seal quorum (5):** ATLAS, ZEUS, EVE, JADE, AUREA — unchanged.

---

## Read next

1. [Cycle journal — C-360](./journals/C-360.md) — federation sweep (when published)
2. [Canon laws](./02-THEORETICAL-FOUNDATIONS/MOBIUS_CANON_LAWS.md)
3. [MOBIUS.md](./MOBIUS.md) — constitutional machine interface
4. [Prior snapshot C-338](./STATE_OF_THE_SUBSTRATE_C-338.md) — technical baseline

---

## Live proof

When CORS allows this origin, handbook pages fetch **snapshot-lite** from the Terminal for GI, mode, and lane freshness. Canonical Terminal: `https://terminal.mobius-substrate.com/api/terminal/snapshot-lite`.
