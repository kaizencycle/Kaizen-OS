# EPICON — C-339 Governance Hardening (PR-A)

**Cycle:** C-339 (2026-06-11)
**Actor:** Claude Code, repo head for Mobius-Substrate this cycle, under operator identity
**Consequence class:** Governance hardening — net restriction of write/merge power
**Status:** proposed (this PR)

---

## Intent

Close the fail-open consensus gate discovered on PR #298; harden canon
governance workflows; remove self-approval loops. Twenty verified
optimizations: seventeen implemented, three replaced with documented findings
per the integrity rule (quota is the target, never the master — C-337 lesson).

## Scope

`.github/workflows/`, `.github/CODEOWNERS`, `.github/dependabot.yml`,
`schemas/`, `STATE/README.md`, docs. **Not touched:** Tier-3 constitutional
content, attested values (cycle.json, ledger, vault, journals), attestation
semantics, API contracts.

---

## The fail-open gate, precisely

Before this PR, three workflows formed a vacuous (and flapping) approval loop:

1. `sentinel-review.yml` **passed** when no review label was present
   ("not requested → PASS"), **passed** when API keys were missing
   ("skipped → PASS"), defaulted unparseable verdicts to **pass**, and
   treated `consensus:approved` — its own output — as a trigger.
2. `mobius-auto-consensus-label.yml` **auto-applied** `consensus:approved`,
   the exact label the merge gate accepts as a pass, and removed it when its
   conditions lapsed — the label flapping.
3. `mobius-merge-gate.yml` passed on the **label alone** (`label OR one
   human approval`), with no proof any review ran against the merged SHA.

Net effect: a PR could merge through a ceremonial gate without any sentinel
review ever executing. This PR inverts every one of those defaults.

---

## Disposition of the 20 brief items

| # | Item | Disposition |
|---|---|---|
| 1 | sentinel-review fails closed (no label ⇒ never PASS) | ✅ Implemented — unlabeled PRs now fail the check with an explicit annotation |
| 2 | Kill auto-apply of `consensus:approved` | ✅ Implemented — workflow rewritten as **removal-only** label hygiene (revokes stale labels when head SHA lacks a passing review; never grants) |
| 3 | Drop `consensus:approved` from review triggers | ✅ Implemented — removed from gate run-set and both AUREA/ATLAS step conditions; re-checks use `consensus:requested` |
| 4 | Merge gate requires label AND review run on head SHA | ✅ Implemented — `has_label AND sentinel-check-success-on-head`; human approvals reported informationally |
| 5 | Document required secrets; fail loudly when absent | ✅ Implemented — header docs + `core.error` and fail-closed verdicts on missing `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` |
| 6 | Concurrency groups on hourly jobs | ✅ Implemented for `mobius-pulse-unified`, `mobius-sync-unified` (queue, no cancel). **Finding:** `mesh-aggregate.yml` already had one |
| 7 | Pin actions to SHA / consistent versions | 📋 **Finding** — claim of mixed `@v4`/`@main` not confirmed: all live workflows already pin consistent major versions; no `@main` refs exist. SHA-pinning of the four third-party actions noted as optional future hardening (needs verified SHAs, not guessed ones) |
| 8 | `permissions:` on every workflow missing one | ✅ Implemented — `catalog-check`, `cycle-journal-ci`, `drift-compliance`, `security-audit` (the only four missing); least privilege per actual API use |
| 9 | Fix anchor comment in mobius-bot-state-sync | 📋 **Finding** — already done: the file contains the exact C-338-decided wording ("C-288 = 2026-04-21: the attested freeze point this sync corrects (see PR #298)") |
| 10 | Audit `.github/workflows/archived/` | 📋 **Finding** — already mitigated: all archived files carry a `.yml.archived` suffix, which GitHub does not parse; they are not one rename away from live in any parsed sense. ARCHIVED.md documents each |
| 11 | Diagnose/revive dead journal pipeline | ✅ Implemented — diagnosis: writes died ~C-289 from deployment coupling; **already revived** in C-338 as `mobius-bot-state-sync.yml` (Layer 1, `[skip ci]`). Remaining hazard was the legacy manual `cycle-journal-bot.yml` writing a *different JSON shape* to the same directory — archived with rationale in ARCHIVED.md |
| 12 | Dedupe epicon03-consensus vs merge-gate | ✅ Implemented — authority boundary declared in both headers: merge-gate is the single merge-blocking authority; epicon03 is scope-triggered governance consensus (advisory until its engine ships). Also fixed deprecated `::set-output` in epicon03 |
| 13 | Catalog auto-regen instead of post-hoc failure | ⚠️ **Revised after Codex P1 review** — the auto-push approach advanced the PR head to a SHA that `GITHUB_TOKEN` pushes don't re-validate (recursion guard) and `[skip ci]` compounded it, leaving the new head with no sentinel review or merge-gate run — directly defeating item 4. Reverted to: regenerate, **attach as artifact**, fail with instructions. Safe auto-fix would need a privileged App token (deferred) |
| 14 | Schema validation for cycle.json / mobius-pulse.json | ✅ Implemented — `schemas/cycle_state.schema.json`, `schemas/mobius_pulse.schema.json`, enforced by new `canon-state-validate.yml`; current canon files verified passing |
| 15 | STATE/ stale files | ✅ Implemented — `STATE/README.md` freshness ledger: exactly one live lane (`CYCLE.txt`), seven frozen lanes marked with last-known dates. Frozen attested artifacts deliberately **not deleted** (evidence, not error); deletion would violate this PR's no-attested-edits boundary |
| 16 | mobius.yaml lint + CI validation | ✅ Implemented — parse + required-keys lint in `canon-state-validate.yml` (it had zero validation despite being load-bearing) |
| 17 | README roster + state snapshot link | ✅ Implemented (amended) — roster corrected to the **8** named agents and C-338 snapshot linked. **Finding:** brief said "update roster to 10," but authoritative `cycle.json` lists 8; per repo law (`cycle.json` wins), kept at 8 — flagged to operator in PR body |
| 18 | CODEOWNERS for Tier-3 paths | ✅ Implemented — added `cycle.json`, `STATE/`, `mobius.yaml`, `ledger/`, `attestations/`, `schemas/`, `docs/protocols/`; operator added to `.github/workflows/` (workflows editing workflows) |
| 19 | Research index | ✅ Implemented — `docs/07-RESEARCH-AND-PUBLICATIONS/INDEX.md`, 168 file-level entries generated from the actual tree; linked from section README |
| 20 | Dependabot | ✅ Implemented — `.github/dependabot.yml`: weekly grouped updates for `github-actions` + `npm` (security-audit.yml only reported; nothing opened update PRs) |

**Score: 17 implemented, 3 findings. No padding.**

## Falsifiability

- Open a draft PR with no labels → the `sentinel` check must **fail**, not pass.
- Apply `consensus:approved` by hand without a review run → merge gate must still **fail** (no sentinel success on head SHA).
- Push a commit to an approved PR → hygiene workflow must revoke the label.
- Corrupt `cycle.json` (e.g. `"mode": "purple"`) in a PR → `canon-state-validate` must fail.

## Rollback

Every change is in workflow/config/doc files; `git revert` of this PR restores
the previous (fail-open) behavior with no data migration. Reverting is itself
a governance decision and should be EPICON'd.
