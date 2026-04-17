---
# ============================================================================
# EPICON: EVE Daily Closing Seal Protocol
# ============================================================================

epicon_id: EPICON_C-284_SUBSTRATE_eve-daily-closing-seal_v1
title: "EVE Daily Closing Seal Protocol"
author_name: "EVE"
author_wallet: ""
cycle: "C-284"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "governance"
  system: "daily-seal"
  environment: "mainnet"
epicon_type: "spec"
authority_impact: "none"
status: "draft"
related_prs: []
related_commits: []
related_epicons:
  - "EPICON-02"
  - "EPICON-03"
tags:
  - "eve"
  - "daily-seal"
  - "archive"
  - "ledger"
  - "continuity"
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-04-17T00:00:00Z"
updated_at: "2026-04-17T00:00:00Z"
version: 1
hash_hint: ""
summary: "Defines the canonical daily closing synthesis and seal artifact written by EVE for substrate-level continuity and audit."

authority:
  actor: "kaizencycle"
  source: "CODEOWNERS"
  scope: "documentation-only EPICON specification"
  expiration: "2026-12-31T23:59:59Z"

scope_envelope:
  docs.read: true
  docs.write: true
  docs.create: true
  code.read: true
  code.write: false
  infra.deploy: false
  governance.modify: false
---

# EPICON: EVE Daily Closing Seal Protocol

- **Layer:** SUBSTRATE → Governance → Daily canon
- **Author:** EVE
- **Date:** 2026-04-17
- **Status:** Draft
- **Type:** SPECIFICATION (documentation only)
- **Authority impact:** NONE — This EPICON defines archive and ritual shape; it does not grant runtime authority, change ledger write rules, alter MIC issuance, or change the MII formula.

---

## Clarification for consensus

> **This is a specification document, not an authority change.**

- **What this defines:** How the substrate represents one **canonical end-of-day close** per cycle day, authored by EVE, with a hash-linked seal artifact for continuity.
- **What this does NOT do:** Grant new permissions, change who may write the ledger, or specify implementation code in this repo (runtime follows in a separate Terminal change).
- **Risk surface:** Documentation and file-path convention only until a runtime PR implements generation and writes.

---

## 1. Problem

- **Live journals** capture moment-by-moment agent work but are not, by themselves, a single auditable “day boundary” for the cathedral.
- **Live pulse** and snapshot lanes answer “what is happening now,” not “what did we agree the day was, in one sealed record.”
- Long-horizon continuity needs **one daily canonical close** that operators, Sentinels, and auditors can point to without re-reading every journal line.

---

## 2. Decision

1. **EVE** is the **daily closing synthesizer**: one closing narrative per calendar day (in the operator-chosen timezone; default **UTC midnight** unless documented otherwise).
2. The closing output is published as a **closing EPICON** in the substrate doc canon: human-readable report plus machine-readable seal.
3. **Canonical close** is distinct from:
   - **Live journals** — high-frequency, append-only agent observations.
   - **Live pulse** — ephemeral or short-TTL aggregate state.
   - **Cold archive memory** — git-backed substrate paths that survive independent of KV TTL.

---

## 3. Canonical daily boundary

- **Boundary:** End of calendar day at **00:00:00** of the next day in the declared timezone (inclusive of all work through `23:59:59.999` on the close date).
- **Cycle field:** The Mobius **cycle** active at close time (from `cycle.json` or authoritative Terminal snapshot at trigger) is recorded on the artifact.
- **Naming:** Artifacts use the **close date** (ISO date) and cycle, e.g. `C-284` + `2026-04-17`.

---

## 4. Artifact layout (substrate paths)

Recommended paths under `Mobius-Substrate` (exact tree may be adjusted by a follow-up PR that adds directories):

| Artifact | Path pattern | Purpose |
|----------|----------------|--------|
| Daily report (markdown) | `daily/eve/daily_report_{CYCLE}_{YYYY-MM-DD}.md` | Human-readable closing synthesis |
| Daily seal (JSON) | `daily/eve/daily_seal_{CYCLE}_{YYYY-MM-DD}.json` | Machine-readable seal + hashes |

**First day:** `previous_seal_hash` is `null` or a documented genesis constant. **Subsequent days:** `previous_seal_hash` MUST equal the `report_hash` (or dedicated `seal_hash` field) of the prior published daily seal JSON for the same environment (`mainnet`).

---

## 5. Minimum fields — `daily_seal_{CYCLE}_{YYYY-MM-DD}.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `epicon_id` | string | yes | `EPICON_C-284_SUBSTRATE_eve-daily-closing-seal_v1` (or superseding version) |
| `cycle` | string | yes | e.g. `C-284` |
| `close_date` | string (ISO date) | yes | Calendar date closed |
| `closed_at` | string (ISO 8601) | yes | Timestamp when close was finalized |
| `timezone` | string | yes | IANA TZ, e.g. `UTC` |
| `closing_gi` | number | yes | GI at close (from authoritative snapshot) |
| `vault_state` | object | yes | Summary or reference to vault status at close (implementation may embed or pointer-hash) |
| `tripwire_posture` | object | yes | Summary of notable tripwire / integrity posture at close |
| `major_promoted_epicons` | array | no | EPICON IDs promoted or closed that day |
| `carryover_concerns` | array of string | no | Explicit items for the next cycle day |
| `synthesis_excerpt` | string | no | Short plain-text excerpt; full narrative lives in the `.md` |
| `report_hash` | string | yes | SHA-256 over canonical body of the paired `.md` (UTF-8, normalized newlines) |
| `previous_seal_hash` | string \| null | yes | Hash link to prior day seal |
| `author` | string | yes | `EVE` |
| `environment` | string | yes | e.g. `mainnet` |

The **markdown report** MUST expand on: synthesis narrative, rationale for carryovers, and any explicit disagreements or flags (without fabricating agent heartbeats; see Agent Reporting Protocol).

---

## 6. Operational pattern (informative, non-binding for this repo)

Intended runtime flow (Terminal or successor):

1. Scheduler triggers EVE close (e.g. Vercel cron) → authenticated API route.
2. Route builds the closing object from authoritative snapshot + journals.
3. Dual write (when implemented): ledger / attestation path **and** substrate archive path (e.g. GitHub Contents API), per existing Terminal patterns — **not** specified further here.

This EPICON only defines **what** gets written and **how** it chains; **where** the cron lives is a Terminal implementation concern.

---

## 7. Non-goals

- **Not** every journal line is sealed into the daily seal (only the closing synthesis + structured fields).
- **Not** a runtime authority grant for EVE beyond documentation of the ritual; actual tokens and routes remain in service config and EPICON-02 intent on code PRs.
- **Not** MIC issuance logic, mint amounts, or MII weight changes.
- **Not** a replacement for Vault seals or Seal attestation quorum; daily close is **orthogonal** narrative and posture archive.

---

## 8. Distinction summary

| Surface | Role |
|---------|------|
| Live journals | Continuous agent observations |
| Live pulse / snapshot | Hot operational truth |
| Closing EPICON + daily seal | One canonical end-of-day record |
| Cold archive (this repo) | Durable memory and audit trail |

---

## 9. Risk and integrity notes

- **MII / GI:** Neutral to slightly positive (clearer audit trail); no formula change.
- **Governance:** Tier 3 documentation authority; EPICON optional for tiny edits, **recommended** for this spec.

---

## Related

- [EPICON-02](./EPICON-02.md) — Intent publication
- [EPICON-03](./EPICON-03.md) — Consensus
- [Agent Reporting Protocol](../protocols/agent-reporting-protocol.md) — Heartbeat and journal contracts (if present on branch)
- [DVA Runtime (reference style)](./EPICON-DVA-RUNTIME.md)

---

*"We heal as we walk." — Mobius Substrate*
