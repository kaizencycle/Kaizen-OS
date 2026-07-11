# C-369 Opener — EVE EPICON Sharding and Reserve Block Candidate Pipeline

**Cycle:** C-369 (2026-07-11) · **Drafted:** ATLAS · **Depends on:** C-368 close (verified)

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

- **Actor:** ATLAS (on behalf of kaizencycle)
- **Authority Source:** Cycle documentation — protocol and schema definition
- **Scope Limitation:** `docs/epicon/cycles/C-369/`, EVE protocol docs, shard schema
- **Expiration:** 2026-10-09T00:00:00Z

## Objective

Create a governed workflow in which EVE scans related EPICON records, identifies ethical and civic meaning, and compresses them into a **proposed** Reserve Block memory shard — without sealing, canonizing, or rewriting source records.

## PR sequence

| # | Repo | What | Tier |
|---|------|------|------|
| 1 | Mobius-Substrate | Doctrine, schema, cycle pack, C-368 example shard | EP-3 |
| 2 | Mobius-Substrate | `eve-shard-core` deterministic compiler + tests | EP-2 |
| 3 | mobius-civic-ai-terminal | Proposal/review API endpoints (no-seal enforcement) | EP-2/3 |
| 4 | CPC + Terminal | Ledger attestation + quorum integration | EP-3 |

**This opener covers PR 1 only.**

## Canonical rule

EVE may compress EPICONs into ethical memory shards. She may recommend sealing, but she may **never** declare canon alone.

## Files in this cycle pack

| File | Purpose |
|------|---------|
| `C-369-baseline.md` | Witnessed pre-state |
| `EVE-SHARD-HANDOFF.md` | Full ATLAS handoff (architecture, API, acceptance) |
| `examples/SHARD_C-368_EVE_001.yaml` | Example candidate for closed C-368 |
| `../04-TECHNICAL-ARCHITECTURE/epicon/EVE_SHARDING_PROTOCOL.md` | Protocol doctrine |
| `../04-TECHNICAL-ARCHITECTURE/epicon/EVE_SHARD_SELECTION_POLICY.md` | Inclusion/omission policy |
| `../../06-specifications/schemas/eve-reserve-shard.schema.json` | Versioned JSON schema |

## EPICON Intent (PR 1)

```intent
epicon_id: EPICON_C-369_CORE_eve-reserve-sharding_v1
ledger_id: kaizencycle
scope: specs
mode: normal
issued_at: 2026-07-11T00:00:00Z
expires_at: 2026-10-09T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability, memory, human responsibility
  REASONING: Mobius produces distributed EPICON records across repositories, agents,
    deployments, and ledgers. Permanent storage of every operational event creates noise;
    LLM-only summarization risks narrative drift. EVE should propose provenance-preserving
    ethical memory shards without unilateral seal authority.
  ANCHORS:
    - Mobius-Substrate/MOBIUS.md
    - Mobius-Substrate/docs/00-START-HERE/CANONICAL_DEFINITIONS.md
    - Mobius-Substrate/docs/epicon/cycles/C-368/C-368-close.md
    - Mobius-Substrate/docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md
  BOUNDARIES: Documentation and schema only in PR 1. EVE may propose shards only.
    No seal, no cold-canon write, no source EPICON mutation.
  COUNTERFACTUAL: If shard compression hides dissent or uncertainty, quarantine and
    regenerate from original EPICON set.
counterfactuals:
  - Runtime compiler deferred to PR 2 — docs-only PR 1 must not claim compiler exists
  - Example shard uses hold_for_evidence — not a seal claim
  - MEC may cite final seal but never replaces EPICON
```

## Preserve

Canon → Ledger → UI. MEC must never replace EPICON.
