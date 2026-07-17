# EPICON — C-366 EPICON Tiering

**ID:** EPICON-C366-TIERING-001
**Cycle:** C-366 (2026-07-08)
**Actor:** Michael (kaizencycle), Custodian / Human-in-the-Loop
**Witnesses:** ATLAS (drafting)
**Consequence class:** Constitutional — graduated gate, additive
**Status:** proposed

---

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

Michael (kaizencycle) exercises **founder–custodian standing** to propose
EPICON tiering as constitutional gate semantics (C-366). Scope is limited to
the tiering specification, constitutional EPICON JSON schema, and glossary
entries listed below — not runtime gate middleware, policy registry
implementation, or changes to EPICON-Lite / DVA_RUNTIME.

---

## Intent

Canonize **graduated EPICON tiers** (EP-1, EP-2, EP-3) as a pre-execution
constitutional gate: the more consequential the action, the stronger the EPICON
requirement. If the required tier cannot be generated and validated, the action
must not execute.

**Core law:** Tier classification is policy-assigned, never self-assessed by
the acting agent. Unknown action types default to EP-3 (deny-by-default).

## Constitutional decisions (draft)

1. **Namespace:** EP-1/EP-2/EP-3 are EPICON consequence tiers — distinct from
   DVA agent tiers (T1/T2/T3) and EPICON-Lite discourse footers.
2. **Reconstructability ≠ reproducibility:** "Replay" is evidence replay
   (hash-chain verification), not bitwise model re-derivation.
3. **Failure matrix:** EP-3 always fails closed; EP-2 quarantines; EP-1 fails
   open with honest backfill marking.
4. **Operational / constitutional split:** organizations retain operational
   truth (may include PHI/PII); Mobius ledger holds constitutional commitments
   only.

## Scope

**Changed files (Mobius-Substrate):**

- `docs/specs/EPICON_TIERING_SPEC_v0.1.md` — constitutional tiering grammar
- `schemas/epicon_constitutional_v1.schema.json` — ledger commitment schema
- `docs/epicon/EPICON-C366-TIERING-001.md` — this document
- `journals/cycles/C-366.json` — cycle journal

**Canonical MEC citation example (optional field on constitutional EPICON):**

```
E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
```

## What this does NOT do

- Does not implement gate middleware, policy registry, or quarantine store
  (`code_enforced: false` — spec-first, same pattern as tokenomics)
- Does not change EPICON-Lite, DVA_RUNTIME, or MEC_SPEC (grammar referenced,
  not modified)
- Does not wire Terminal / HIVE / CPC runtime enforcement (follow-up)

## Seal (pending quorum)

```
EPICON-C366-TIERING-001
Type: CONSTITUTIONAL_DOCUMENT
Authorized by: Michael / kaizencycle
Witnesses: ATLAS (drafting); quorum pending — ATLAS, ZEUS, EVE, JADE, AUREA
Timestamp: C-366
```

*"We heal as we walk."*
