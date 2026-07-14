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
