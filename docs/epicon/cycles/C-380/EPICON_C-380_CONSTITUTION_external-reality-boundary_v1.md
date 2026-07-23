---
epicon_id: EPICON_C-380_CONSTITUTION_external-reality-boundary_v1
title: "C-380: External Reality Boundary — constitutional opener"
author_name: "Michael Judan"
cycle: "C-380"
tier: "SUBSTRATE"
scope:
  domain: "governance"
  system: "external-observation"
  environment: "testnet"
epicon_type: "spec"
status: "draft"
related_epicons:
  - "EPICON-000"
  - "EPICON-02"
tags: ["c380", "external-observation", "witness-pool", "quarantine"]
integrity_index_baseline: 0.95
risk_level: "medium"
created_at: "2026-07-22T02:06:00Z"
updated_at: "2026-07-22T02:06:00Z"
version: 1
summary: "Cycle-bound operational EPICON to file EPICON-000 external reality boundary doctrine."
---

# EPICON_C-380_CONSTITUTION_external-reality-boundary_v1

- **Layer:** SUBSTRATE → governance → external-observation
- **Author:** Michael Judan (+ ATLAS × JADE handoff)
- **Date:** 2026-07-22
- **Status:** draft

---

## Summary

File EPICON-000 as the constitutional record for first public-internet observation. Establish schema, trust states, replay contract, civilian renderer, and test plan. Human merge required before canon promotion.

---

## Intent publication

```intent
epicon_id: EPICON_C-380_CONSTITUTION_external-reality-boundary_v1
ledger_id: kaizencycle
scope: docs
mode: normal
issued_at: 2026-07-22T02:06:00Z
expires_at: 2026-10-20T02:06:00Z
justification:
  VALUES INVOKED: integrity, transparency, safety, witness-fidelity
  REASONING: First external observation requires constitutional boundary before event judgments. Network is witness pool not truth source.
  ANCHORS:
    - docs/epicon/EPICON-000-external-reality-boundary.md
    - schemas/epicon_external_observation_v1.schema.json
  BOUNDARIES: Doctrine and schema only; no autonomous crawling or canon promotion
  COUNTERFACTUAL: If schema cannot enforce claim/inference separation, do not merge implementation PRs
counterfactuals:
  - If EVE or ZEUS review fails, keep status draft
  - If Terminal renderer writes canon from UI, revert immediately
```

---

## Deliverables

| # | Item | Path |
|---|------|------|
| 1 | Constitutional record | `docs/epicon/EPICON-000-external-reality-boundary.md` |
| 2 | Observation schema | `schemas/epicon_external_observation_v1.schema.json` |
| 3 | Example instance | `docs/epicon/examples/epicon-000-external-reality-boundary.example.json` |
| 4 | ATLAS architecture | `docs/epicon/cycles/C-380/ATLAS_ARCHITECTURE_external-observation.md` |
| 5 | JADE renderer | `docs/epicon/cycles/C-380/JADE_CIVILIAN_RENDERER_external-claim.md` |
| 6 | Schema tests | `tests/epicon-external-observation-schema.test.ts` |

---

*"We heal as we walk." — Mobius Systems*
