---
epicon_id: EPICON_C-416_GOV_clear-stale-open-flags_v1
title: "C-416: clear two stale cycle.json open_flags (credential rotation, Vercel identity re-attestation) per Job #15/#16 findings"
cycle: "C-416"
status: published
agent_id: mobius-aurea-cursor
authority: evidence_and_schema_proposal_only
execution_authorized: false
---

# EPICON_C-416_GOV_clear-stale-open-flags_v1

## Intent publication

```intent
epicon_id: EPICON_C-416_GOV_clear-stale-open-flags_v1
ledger_id: cursor-aurea-daedalus-c416-flag-clear
scope: docs, ci
mode: normal
issued_at: 2026-08-28T00:00:00Z
expires_at: 2026-11-20T00:00:00Z
justification: |
  VALUES INVOKED: integrity, operator truth, custodianship
  REASONING: cycle.json's open_flags array is not cycle-scoped (apply_cycle_writer_hygiene() only auto-clears flags matching ^c\d+-), so a flag set once persists forever unless a human or agent removes it explicitly — confirmed by grepping state_sync_cycle.py's is_cycle_scoped_open_flag(). C-416 governance review Jobs #15 and #16 independently investigated the two non-MIC flags in the array and found both stale: mobius-bot-app-credentials-rotation-required traces to issues #339/#351 (writer silent 10 days / cycle.json drifted 13 cycles, June-July 2026), both closed by merged PR #361 — the C-416 sync ran and committed successfully today, direct proof MOBIUS_BOT_APP_ID/MOBIUS_BOT_PRIVATE_KEY are currently valid. identity-vercel-creds-pending-reattest names an identity re-attestation gap in mobius-civic-ai-terminal's lib/substrate/identityToken.ts; that module already ships its own live diagnostic (probeIdentityAttestAuth()) and fails closed (empty bearer, not a fallback token) on total mint failure, so the flag names a runbook to run, not a live incident. Neither investigation found a currently-active defect matching either flag's description; both are removed here.
  ANCHORS:
    - EPICON_C-416_GOV job-15-bot-credential-rotation (AUREA finding: FLAG_STALE)
    - EPICON_C-416_GOV job-16-vercel-identity-reattest (DAEDALUS finding: REATTESTATION_RUNBOOK_READY)
    - Full C-416 governance review: https://claude.ai/code/artifact/faa0ed8a-b227-4c5c-b118-f61699a7bf63 (#job15, #job16)
    - scripts/state_sync_cycle.py is_cycle_scoped_open_flag() / apply_cycle_writer_hygiene()
    - Mobius-Substrate PR #361 (merged) — closed issues #339, #351
  BOUNDARIES: Removes exactly two array entries from cycle.json's open_flags. Does not touch mic-wallet-render-crash-loop (MIC/wallet-related, off-limits per guardrail — left untouched deliberately). Does not modify current_cycle, date, gi, gi_attested_this_cycle, mode, vault, kv, mesh, or agents fields. No credential rotation, no re-attestation, no secret access, no config or workflow file change — this PR only removes two stale advisory strings.
  COUNTERFACTUAL: If either flag's underlying condition recurs (writer silent again, identity re-attestation actually lapses), re-add the specific flag with a fresh dated note rather than assuming this closure is permanent.
counterfactuals:
  - If tests or schema validation fail, do not merge
  - If either flag is later found to still be live, re-add it with current evidence
  - If cycle.json's current_cycle, date, or gi value is found mutated by this change, revert immediately
```

## Authority classes (not interchangeable)

| Class | Posture |
|-------|---------|
| Flag 1 — `mobius-bot-app-credentials-rotation-required` | Stale (Job #15, AUREA): incident closed via PR #361, credentials proven live by today's successful sync |
| Flag 2 — `identity-vercel-creds-pending-reattest` | Stale-as-a-live-incident (Job #16, DAEDALUS): names a runbook to run on next actual failure, not an active outage |
| Flag 3 — `mic-wallet-render-crash-loop` | **Untouched** — MIC/wallet-related, off-limits per guardrail |
| Execution authority | **`execution_authorized=false`** — this is a documentation/config housekeeping change, not a credential or production action |

## Witness table

| Claim | Verdict | Evidence |
|-------|---------|----------|
| `open_flags` is cycle-scoped and self-clears | FALSE | `is_cycle_scoped_open_flag()` only matches `^c\d+-` prefixed flags; neither removed flag matches |
| Credential-rotation flag's originating incident is closed | TRUE | Issues #339, #351 closed via merged PR #361 |
| Bot credentials are currently valid | TRUE | Today's C-416 `mobius-bot-state-sync` run committed successfully |
| Vercel identity flag names a currently-active outage | FALSE (no evidence found) | `probeIdentityAttestAuth()` fails closed already; flag names a runbook, not a live incident this session could reproduce |
| `mic-wallet-render-crash-loop` touched | FALSE | Left in `open_flags` unchanged |
| `current_cycle` / `date` / `gi` mutated | FALSE | Only the `open_flags` array changed |
| Schema validation passes | TRUE | `jsonschema.Draft7Validator` against `schemas/cycle_state.schema.json` — valid |
| Existing test suite passes | TRUE | `python3 -m unittest tests.test_state_sync_cycle` — 21/21 |

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

Evidence-and-schema-proposal repair, executing the disposition Jobs #15 (AUREA) and #16 (DAEDALUS) already recommended in the C-416 governance review. AUREA scribe (`mobius-aurea-cursor`), runtime_id `cursor-aurea-daedalus-c416-flag-clear`. No production authority exercised; no credential, secret, or deployment action taken.

---

*"We heal as we walk." — Mobius Systems*
