---
epicon_id: EPICON_C-416_GOV_clear-stale-open-flags_v1
title: "C-416: clear one stale cycle.json open_flag (bot credential rotation) per Job #15 finding; Job #16's flag retained pending actual re-attestation"
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
scope: docs, ci, specs
mode: normal
issued_at: 2026-08-28T00:00:00Z
expires_at: 2026-11-20T00:00:00Z
justification: |
  VALUES INVOKED: integrity, operator truth, custodianship
  REASONING: cycle.json's open_flags array is not cycle-scoped (apply_cycle_writer_hygiene() only auto-clears flags matching ^c\d+-), so a flag set once persists forever unless a human or agent removes it explicitly — confirmed by grepping state_sync_cycle.py's is_cycle_scoped_open_flag(). C-416 governance review Job #15 (AUREA) found mobius-bot-app-credentials-rotation-required traces to issues #339/#351 (writer silent 10 days / cycle.json drifted 13 cycles, June-July 2026), both closed by merged PR #361 — today's C-416 sync ran and committed successfully, direct positive evidence MOBIUS_BOT_APP_ID/MOBIUS_BOT_PRIVATE_KEY are currently valid. That flag is removed here. Job #16 (DAEDALUS) investigated identity-vercel-creds-pending-reattest and found no reproducible active outage, but its own disposition was REATTESTATION_RUNBOOK_READY — a runbook to run, not evidence the pending re-attestation actually completed. A Codex review on the first version of this PR correctly caught that the initial diff removed both flags, conflating "no evidence of a live outage" with "the pending condition is resolved" for Job #16's flag specifically; that flag literally names a re-attestation that is still pending, and Job #16's own writeup says to clear it "only once the probe reports healthy," which was never run. This revision keeps identity-vercel-creds-pending-reattest in place and removes only the flag with positive resolution evidence (Job #15's).
  ANCHORS:
    - EPICON_C-416_GOV job-15-bot-credential-rotation (AUREA finding: FLAG_STALE)
    - EPICON_C-416_GOV job-16-vercel-identity-reattest (DAEDALUS finding: REATTESTATION_RUNBOOK_READY — runbook ready, not executed)
    - Full C-416 governance review: https://claude.ai/code/artifact/faa0ed8a-b227-4c5c-b118-f61699a7bf63 (#job15, #job16)
    - scripts/state_sync_cycle.py is_cycle_scoped_open_flag() / apply_cycle_writer_hygiene()
    - Mobius-Substrate PR #361 (merged) — closed issues #339, #351
    - Codex review on PR #444 (chatgpt-codex-connector), P2 finding: "Retain the flag until identity re-attestation completes"
  BOUNDARIES: Removes exactly one array entry (mobius-bot-app-credentials-rotation-required) from cycle.json's open_flags. Does not touch identity-vercel-creds-pending-reattest (retained — re-attestation not actually completed) or mic-wallet-render-crash-loop (MIC/wallet-related, off-limits per guardrail). Does not modify current_cycle, date, gi, gi_attested_this_cycle, mode, vault, kv, mesh, or agents fields. No credential rotation, no re-attestation, no secret access, no config or workflow file change.
  COUNTERFACTUAL: If the credential-rotation flag's underlying condition recurs (writer silent again), re-add it with a fresh dated note. identity-vercel-creds-pending-reattest should only be cleared once the Job #16 runbook's probe (probeIdentityAttestAuth()) actually reports healthy, per that job's own stop condition.
counterfactuals:
  - If tests or schema validation fail, do not merge
  - If the credential-rotation flag is later found to still be live, re-add it with current evidence
  - If cycle.json's current_cycle, date, or gi value is found mutated by this change, revert immediately
```

## Authority classes (not interchangeable)

| Class | Posture |
|-------|---------|
| Flag 1 — `mobius-bot-app-credentials-rotation-required` | Stale (Job #15, AUREA): incident closed via PR #361, credentials proven live by today's successful sync — **removed** |
| Flag 2 — `identity-vercel-creds-pending-reattest` | Not resolved (Job #16, DAEDALUS): only `REATTESTATION_RUNBOOK_READY` — the runbook exists but was not executed — **retained** |
| Flag 3 — `mic-wallet-render-crash-loop` | **Untouched** — MIC/wallet-related, off-limits per guardrail |
| Execution authority | **`execution_authorized=false`** — this is a documentation/config housekeeping change, not a credential or production action |

## Witness table

| Claim | Verdict | Evidence |
|-------|---------|----------|
| `open_flags` is cycle-scoped and self-clears | FALSE | `is_cycle_scoped_open_flag()` only matches `^c\d+-` prefixed flags; neither flag in this file matches |
| Credential-rotation flag's originating incident is closed | TRUE | Issues #339, #351 closed via merged PR #361 |
| Bot credentials are currently valid | TRUE | Today's C-416 `mobius-bot-state-sync` run committed successfully |
| Vercel identity re-attestation has actually completed | FALSE | Job #16's own disposition is `REATTESTATION_RUNBOOK_READY` — a runbook, not a completed action; no probe was run |
| `identity-vercel-creds-pending-reattest` correctly retained | TRUE | Flag names a pending action that remains pending; removing it would misrepresent operator state |
| `mic-wallet-render-crash-loop` touched | FALSE | Left in `open_flags` unchanged |
| `current_cycle` / `date` / `gi` mutated | FALSE | Only the `open_flags` array changed |
| Schema validation passes | TRUE | `jsonschema.Draft7Validator` against `schemas/cycle_state.schema.json` — valid |
| Existing test suite passes | TRUE | `python3 -m unittest tests.test_state_sync_cycle` — 21/21 |

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

Evidence-and-schema-proposal repair, executing Job #15's (AUREA) recommendation from the C-416 governance review. Job #16's (DAEDALUS) flag is deliberately retained after a Codex review correctly identified that this PR's first version removed it without the actual resolution evidence its own writeup required. AUREA scribe (`mobius-aurea-cursor`), runtime_id `cursor-aurea-daedalus-c416-flag-clear`. No production authority exercised; no credential, secret, or deployment action taken.

---

*"We heal as we walk." — Mobius Systems*
