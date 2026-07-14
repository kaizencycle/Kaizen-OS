---
epicon_id: EPICON_C-372_INFRA_journal-parcel-flush_v1
title: "Journal parcel flush lane — Substrate verifier + workflow"
cycle: "C-372"
tier: "EP-2"
---

# C-372 Substrate — Journal parcel cold canon

Verifier: `scripts/verify-parcel-chain.mjs`  
Workflow: `.github/workflows/canon-journal-verify.yml`  
Canon path: `canon/journal/C-{cycle}/parcel-{seq}.jsonl`

Single writer: `mobius-daedalus-writer` GitHub App (terminal holds `DAEDALUS_APP_KEY`).

See terminal repo: `docs/epicon/cycles/C-372/EPICON_C-372_INFRA_journal-parcel-flush_v1.md`

## EPICON-02 intent block (PR body)

```intent
epicon_id: EPICON_C-372_INFRA_journal-parcel-flush_v1
ledger_id: kaizencycle
scope: ci,specs
mode: normal
issued_at: 2026-07-14T17:00:00Z
expires_at: 2026-10-12T17:00:00Z
justification:
  VALUES INVOKED: integrity, custodianship, permanence, no-vendor-truth
  REASONING: Substrate verifier and CI gate for journal parcel cold canon. Offline clone → node script → verdict. PR workflow fails closed if Terminal seal endpoint unreachable when parcel files are present.
  ANCHORS:
    - docs/epicon/cycles/C-372/EPICON_C-372_INFRA_journal-parcel-flush_v1.md
    - scripts/verify-parcel-chain.mjs
    - .github/workflows/canon-journal-verify.yml
  BOUNDARIES: Reserve Block .dat lane unchanged. Branch protection for App-only writes is operator ruleset step. Genesis scaffold PRs skip seal attestation when no parcel files present.
  COUNTERFACTUAL: If Intent Publication Gate rejects this block, add COUNTERFACTUAL and use ci,specs scope per EPICON-02 before merge.
counterfactuals:
  - Corrupted footer hash rejected by workflow
  - Missing TERMINAL_API_BASE fails closed only when parcel files are in the PR
```
