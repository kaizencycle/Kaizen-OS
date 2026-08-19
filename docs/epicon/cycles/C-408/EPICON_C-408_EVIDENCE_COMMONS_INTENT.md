# C-408 Evidence Commons — EPICON Intent (v0.1)

---
epicon_id: EPICON_C-408_FEAT_evidence-commons-v01
title: "C-408: Evidence Commons packet and cache broker v0.1"
cycle: "C-408"
status: draft
---

## Intent publication

```intent
epicon_id: EPICON_C-408_FEAT_evidence-commons-v01
ledger_id: kaizencycle
scope: core
mode: normal
issued_at: 2026-08-19T00:00:00Z
expires_at: 2026-11-17T00:00:00Z
justification:
  VALUES INVOKED: provenance, fail-closed reuse, observation/interpretation separation, economic efficiency without self-verification
  REASONING: Agents must reuse fresh licensed evidence without duplicate acquisition. Evidence Packets are distinct from ECHO answer cache. v0.1 uses mock acquisition only.
  ANCHORS:
    - docs/protocols/evidence-commons/EVIDENCE_PACKET_PROTOCOL.md
    - apps/broker-api/src/services/evidence/
  BOUNDARIES: Broker protocol + in-memory/pg storage. No real x402. No CPC mutation. No echo_layer_entries changes.
  COUNTERFACTUAL: If semantic reuse bypasses acquisition, reject — exact hash only in v0.1.
counterfactuals:
  - Terminal renderer PR is separate (PR B)
  - CPC receipt anchoring deferred to PR C
```

## Behavioral invariant

An agent must not pay to rediscover what the network already knows. Multiple readers ≠ independent sources.

## Locked audit

- `integrityCache.ts` / `echo_layer_entries` untouched
- No production KV mutation
- No wallet / x402 settlement
- Single-flight documented as in-process only
