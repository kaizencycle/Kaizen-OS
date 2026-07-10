# C-368 · PR 5 — Guard App Phase 1 scaffold (I2 enforcement)
**Repo:** `kaizencycle/epicon` · **Branch:** `core/guard-app-phase1-c368` · **Tier:** EP-2 (new app code) · **Priority: 5 — the big one**

## 1. Summary

The stateless Action witnesses invariant **I2 (intent immutable once published)** via
`justification_hash` but cannot enforce it across `edited` events. Phase 1 is a Probot GitHub
App that adds state: it pins the hash at first validation and fails the check if the intent
block mutates without a version bump. Also brings Checks API output and `/epicon revalidate`.

## 2. Structure

```
apps/guard-app/
  package.json          # probot ^13, @octokit/*, shared guard-core
  app.yml               # permissions: checks:write, pull_requests:read/write, contents:read
                        # events: pull_request, issue_comment
  src/index.js          # webhook handlers
  src/immutability.js   # I2 logic
  README.md             # deploy + env (APP_ID, PRIVATE_KEY, WEBHOOK_SECRET)
packages/guard-core/    # REFACTOR: extract validation from src/validate.mjs
                        # so Action and App share one validator (no drift between them)
```

## 3. I2 enforcement logic (src/immutability.js)

On `pull_request.opened`: validate via guard-core; create Check Run
**"Intent Publication Gate"**; persist `{epicon_id, justification_hash}` in the check run's
`output.summary` (the check run IS the state store — no database in Phase 1).

On `pull_request.edited` / `synchronize`: recompute hash; fetch prior check run.
- Hash unchanged → revalidate normally.
- Hash changed AND `epicon_id` version bumped (`_v(N)` → `_v(N+1)`) → legal re-publication
  (EPICON-02 §7): new check run notes lineage `supersedes: <old hash>`.
- Hash changed WITHOUT version bump → **fail check: "I2 VIOLATION — intent mutated after
  publication. Re-publish with a version bump; the prior intent remains on record."**

On `issue_comment` `/epicon revalidate`: re-run validation, post result as comment + check.

## 4. Deployment

**Resolved (C-368 baseline, 2026-07-10):** `epicon-api` root returns
`{"ok":true,"service":"epicon-github-webhook"}` — it is the Guard App webhook host.
Deploy Phase 1 there (Probot as middleware on its Express server). **Do not create
a new `epicon-guard-app` service.**

Register the App at github.com/settings/apps → name **EPICON Guard**, webhook URL =
the epicon-api service URL, permissions per `app.yml`. Install on the six federation
repos. **This also begins PAT retirement:** installation tokens are scoped and
short-lived — the structural fix for the org-wide git-exit-128 CI failures.

## 5. Acceptance criteria

- Editing a PR body's intent block without a version bump → check fails with the I2 message.
- Editing WITH `_v2` bump → check passes, lineage recorded in check output.
- `/epicon revalidate` re-runs and reports.
- Action and App produce identical verdicts on identical PRs (shared guard-core).

## 6. EPICON Intent

```intent
epicon_id: EPICON_C-368_CORE_guard-app-phase1_v1
ledger_id: kaizencycle
scope: core
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability, safety
  REASONING: I2 is the only EPICON-02 invariant the stateless Action witnesses without
    enforcing; a published intent that can be silently rewritten is not yet
    immutable. The App closes that gap and begins PAT retirement via
    installation tokens.
  ANCHORS:
    - Mobius-Substrate/docs/epicon/EPICON-02.md (IPDP v1.0.0)
    - Mobius-Substrate/docs/specs/EPICON_TIERING_SPEC_v0.1.md (canonized PR #357)
  BOUNDARIES: Scaffold and I2 enforcement only. No ledger attestation (Phase 2), no
    dashboard, no CII. The Action remains the primary gate; the App augments.
  COUNTERFACTUAL: If check-run state proves too fragile as the hash store, Phase 1.1 adds a
    minimal KV — the invariant is the requirement, not the storage choice.
counterfactuals:
  - If Probot webhook latency exceeds 30s on cold starts, move to a paid Render instance or queue
  - If shared guard-core extraction breaks the Action, revert extraction and vendor the logic temporarily
  - If App permissions are rejected by org policy, run report-only until resolved
```
