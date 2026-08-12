---
epicon_id: EPICON_C-401_DOCS_track-r-lineage_v1
title: "C-401: Track R collision resolution — promote originals to canonical"
cycle: "C-401"
status: draft
---

# EPICON_C-401_TRACK_R_LINEAGE_v1

## Intent publication

```intent
epicon_id: EPICON_C-401_DOCS_track-r-lineage_v1
ledger_id: kaizencycle
scope: docs
mode: normal
issued_at: 2026-08-12T02:11:00Z
expires_at: 2026-11-10T02:11:00Z
justification:
  VALUES INVOKED: integrity, witness-fidelity, lineage-fidelity, fail-closed canon
  REASONING: C-401 opens Track R step 4 after C-400 vault pointer repair. Custodian approved Option A — promote earliest original live seals for 123 contested positions. Artifacts enable ZEUS review and staged C-373 guarded promotion without KV mutation in this PR.
  ANCHORS:
    - docs/epicon/cycles/C-401/C401_COLLISION_RESOLUTION_TABLE.json
    - docs/epicon/cycles/C-397/C397_RESERVE_BLOCK_COLLISION_WITNESS.json
    - docs/epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md
    - mobius-civic-ai-terminal/docs/C-400-VAULT-SEAL-REPAIR-WITNESS.md
  BOUNDARIES: Documentation and resolution table only. No production KV mutation. Promotion requires ZEUS ADOPT + operator SOP execution.
  COUNTERFACTUAL: If fresh audit shows pair count ≠ 125, regenerate table before ZEUS review.
counterfactuals:
  - If ZEUS OVERTURNs strategy, quarantine table and reopen custodian Option B/C
  - If block_canonical choices contradict witness timestamps, fail merge
  - If scope expands to KV writes in this PR, republish intent with scope core
```

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

Documentation-only custodian action for C-401 Track R collision adjudication artifacts. Custodian Option A approval recorded 2026-08-12. No KV mutation authority exercised in this filing.

---

*"We heal as we walk." — Mobius Systems*
