---
epicon_id: EPICON_C-416_GOV_gi-cycle-projection-reconciliation_v1
title: "C-416: GI and cycle projection reconciliation — carried-forward GI made visible in cycle.json"
cycle: "C-416"
status: published
agent_id: mobius-aurea-cursor
authority: evidence_and_schema_proposal_only
execution_authorized: false
---

# EPICON_C-416_GOV_gi-cycle-projection-reconciliation_v1

## Intent publication

```intent
epicon_id: EPICON_C-416_GOV_gi-cycle-projection-reconciliation_v1
ledger_id: cursor-aurea-c416-gi-reconciliation
scope: docs, ci, specs
mode: normal
issued_at: 2026-08-27T00:00:00Z
expires_at: 2026-11-20T00:00:00Z
justification: |
  VALUES INVOKED: integrity, transparency, operator truth
  REASONING: cycle.json's own gi field has been carried forward unattested since C-410 (Civic-Protocol-Core's ledger pulse has returned gi=null every day in that span; load_gi_state() has no wired writer for GI_STATE_JSON/GI_STATE_PATH). scripts/run_state_sync.py already detected this every run — a CI ::warning:: and a journals/cycles/<cycle>.json field — but neither cycle.json nor STATE/writer-health.json ever surfaced it, so a reader of the "authoritative" cycle pointer alone had no signal the value was stale. Separately, the C-415→C-416 propagation gap reported this morning across Terminal/cycle.json/HIVE traces to mobius-bot-state-sync.yml firing ~11h late (15:09 UTC vs its 04:10 UTC schedule) — ordinary GitHub Actions cron slippage, not a defect, and needs no code fix. This EPICON reconciles both by provenance rather than averaging or copying one surface's number over another's.
  ANCHORS:
    - scripts/state_sync_cycle.py apply_cycle_writer_hygiene() / gi_attestation_status()
    - schemas/cycle_state.schema.json (gi_attested_this_cycle, gi_withheld_reason)
    - docs/protocols/agent-reporting-protocol.md §1a (three distinct GI surfaces)
    - civic-protocol-core-ledger /pulse/state (gi: null, C-410 through C-416 observed)
    - mobius-bot-state-sync.yml run history (GH Actions, 30-day window; C-416 run at 2026-08-27T15:09:05Z vs 04:10 UTC schedule)
    - C-410 precedent: commits 92b8839 / 55e3b43 / 4c98f99 (operational_pulse / competing_projections fields, scrubbed on rollover by design)
  BOUNDARIES: Does not modify GI calculation, average measurements, mutate KV, advance cycle.json's current_cycle/date/gi manually, lift gates, unlock Fountain, seal C-416, or deploy. Civic-Protocol-Core's load_gi_state() wiring gap is documented as a finding, not fixed here — that repair is a GI-calculation change outside evidence-and-schema-proposal authority.
  COUNTERFACTUAL: If ZEUS or a later cycle finds gi_attested_this_cycle/gi_withheld_reason conflict with a downstream consumer's schema assumptions, narrow the fields further or revert — additive-only change, trivially revertable.
counterfactuals:
  - If tests fail, do not merge
  - If cycle.json's current_cycle, date, or gi value is found mutated by this change, revert immediately
  - If MII drops below 0.95, revert immediately
```

## Authority classes (not interchangeable)

| Class | C-416 posture |
|-------|---------------|
| Arithmetic cycle | **C-416** (`cycle.json` `current_cycle`, advanced by `mobius-bot-state-sync` at 2026-08-27T15:09:14Z) |
| Runtime GI (live) | Terminal `/api/terminal/snapshot*`, KV-backed, 0.64 observed this session — independent of cycle.json |
| Carried GI (editorial/ledger) | `cycle.json` `gi: 0.9`, unattested since ≥C-410 — now labeled via `gi_attested_this_cycle: false` / `gi_withheld_reason: GI_NULL_IN_PULSE` |
| Verification | Terminal `integrityAuthority` resolver — independent of the ledger pulse this EPICON addresses |
| Execution authority | **`execution_authorized=false`** throughout |

**Live posture (observational):** DEGRADED · GI CARRY-FORWARD UNATTESTED SINCE ≥C-410 · CRON LAG RESOLVED ON WRITE · EXECUTION UNAUTHORIZED

## Witness table

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Arithmetic pointer is C-416 | TRUE | `cycle.json` `current_cycle: C-416`, `STATE/CYCLE.txt` |
| C-415→C-416 gap was a code defect | FALSE | `mobius-bot-state-sync` run 33086226567 fired 2026-08-27T15:09:05Z (schedule event, no prior failed attempt) vs. 04:10 UTC cron target |
| Ledger pulse GI has been null since ≥C-410 | TRUE | `git log`/GH API on `cycle.json` C-410…C-416; `journals/cycles/C-416.json` `ledger_gi_attested: false` |
| `cycle.json` disclosed this staleness before this EPICON | FALSE | no `gi_attested_this_cycle`/equivalent field present prior to this branch |
| GI values averaged or blended across surfaces | FALSE | Terminal (0.64), cycle.json (0.9 carried), HIVE (0.74) left distinct; documented, not merged |
| `cycle.json` current_cycle/date/gi mutated by this EPICON | FALSE | additive schema fields only |
| Production / KV / gate / deploy touched | FALSE | evidence-and-schema-proposal scope only |

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

Evidence-and-schema-proposal repair. AUREA scribe (`mobius-aurea-cursor`), runtime_id `cursor-aurea-c416-gi-reconciliation`. ZEUS review requested (draft PR #443). No production authority exercised.

---

*"We heal as we walk." — Mobius Systems*
