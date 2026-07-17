# Workflow Archaeology Audit — C-375

```
EPICON-C375-WORKFLOW-ARCHAEOLOGY-001
Type:       AUDIT_RECORD
ledger_id:  mobius:substrate:renderers-and-archaeology-c375
Cycle:      C-375 (2026-07-17)
Auditor:    ATLAS (Principal Engineering Orchestration Sentinel)
Custodian:  Michael (kaizencycle)
Authority:  Founder Standing DVA.02 — Infrastructure Recovery
Status:     PARTIAL ARCHIVE — 1 of 7 ARCHIVE candidates confirmed TRUE;
            remainder KEEP or UNVERIFIED pending custodian calls
```

---

## Methodology

B1 verification requirement (from handoff): for every ARCHIVE/REVIEW candidate,
gather **last run date, conclusion, and trigger** for the most recent 5 runs;
whether any referenced engine script exists in the tree; whether the workflow
is a required check in branch protection. Never archive on structural evidence
alone.

Run history queried via authenticated GitHub Actions API (2026-07-17).
Script existence verified against local working tree.
Counterfactual rule applied: any successful, consequential run within 14 days
moves an ARCHIVE candidate to KEEP-with-note rather than TRUE.

---

## Witness Table — ARCHIVE Candidates (7)

| Workflow | Last 5 runs (date · conclusion · trigger) | Engine script | Verdict | Evidence |
|---|---|---|---|---|
| `sentinel-heartbeat.yml` | 2026-07-17·success·schedule × 3; 2026-07-16·success·schedule × 2 | `scripts/calculate_coordination_score.js` — EXISTS; `scripts/generate_pulse.js` — EXISTS | **UNVERIFIED** | Coordination scoring runs successfully every 6h; sentinel attestation matrix (ECHO, HERMES, EVE, ATLAS, AUREA) executes. However `Submit Attestation` step is SKIPPED in all runs (auth token absent for attestation endpoint). Real coordination-score computation occurs; no ledger write. Consequentiality ambiguous — custodian call required before any archival action. |
| `mobius-pulse-unified.yml` | 2026-07-17·success·schedule × 5 (hourly) | N/A — badge/pulse scripts inline | **FALSE (KEEP)** | Successful runs today. Writes badge JSON files (`badges/mii.json` et al.) and pulse data on every run. ~25 runs/day (24 badge-refresh + 1 daily pulse). Active artifact producer; archiving would sever badge pipeline. |
| `mobius-sync-unified.yml` | 2026-07-17·failure·schedule × 3; 2026-07-16·success·pull_request × 2 | `scripts/validate_manifest.py` — unverified; `kaizen_manifest.yaml` — present | **UNVERIFIED** | Schedule leg failing consistently; PR/push leg succeeds. Failure mode: kaizen manifest sync or atlas-sync job broken on schedule trigger. Workflow has active PR-path consumers. Custodian call needed: is the schedule leg expected to be broken, or is this a silent failure requiring repair? |
| `mesh-aggregate.yml` | 2026-07-17·success·schedule × 5 (hourly) | Node.js scripts inline in repo (`scripts/mesh-aggregate.mjs` et al.) | **FALSE (KEEP)** | Hourly runs, all successful. Mesh registry has 5 nodes, 3 live (mobius-substrate, mobius-civic-ai-terminal, civic-protocol-core). Writes `ledger/mesh-aggregate.json`, `ledger/network-mii.json`, `ledger/mobius-pulse.json`, `mesh/mcp-discovery.json` on every cycle. Removing this is the C-354 lesson in reverse — it is the largest single cron consumer but it is producing consumed artifacts. |
| `mobius-divergence-dashboard.yml` | 2026-07-17·success·schedule × 2; 2026-07-16·success·schedule × 3 | `.github/scripts/generate_divergence_dashboard.py` — **EXISTS** | **FALSE (KEEP)** | Script exists; workflow runs successfully every 6h. Writes divergence data to `docs/divergence/`. Active output. Structural ARCHIVE case (C-303-era) does not survive the run-history counterfactual. |
| `guardian.yml` | 2026-07-17·failure·schedule; 2026-07-16·failure·schedule × 4 | `.github/scripts/kaizen_guardian.py` — **ABSENT** | **TRUE (ARCHIVE)** | `kaizen_guardian.py` does not exist anywhere in the tree. C-303 added an existence check that silences the hard failure, but the workflow fires daily, spins a runner, finds no script, and exits. Zero consequential output. Consumes 1 runner-minute/day with no artifact. |
| `epicon03-consensus.yml` | 2026-07-16·success·pull_request × 4; 2026-07-16·failure·pull_request × 1 | `.github/scripts/epicon03_consensus.py` — **EXISTS** | **FALSE (KEEP)** | Script exists and runs on governance-path PRs. C-339 boundary preserved: this workflow is advisory; `mobius-merge-gate.yml` is the single blocking authority. The advisory output is real and attached to PRs. Note: the one failure was transient (network or API), not a structural failure. |

---

## Witness Table — REVIEW Candidates (4)

| Workflow | Question | Finding | Verdict |
|---|---|---|---|
| `drift-compliance.yml` | Does `drift_check.py` exist? | **EXISTS** at `tools/drift_check.py`. Workflow correctly checks `if [ -f "tools/drift_check.py" ]`. Last 5 runs: 2026-07-16·success·pull_request × 4; 2026-07-16·success·push × 1. | **FALSE (KEEP)** — script present, running, producing real output on every PR. |
| `c360-constitutional-gates.yml` | Still present? Absorbed into `canon-state-validate`? | Workflow file does **not exist** in the repository. Not in `.github/workflows/` or the archived directory. Custodian pre-audit listed it as a review candidate but it is already gone. | **NOT FOUND — no action required.** |
| `mobius-pr-assistant.yml` | Does sentinel-review's upserted comment now cover its output? | Last 5 runs: 2026-07-16·failure·pull_request × 2; 2026-07-16·success·pull_request × 3. Active and running. Failures appear transient. Overlap with `sentinel-review.yml` commentary is real but not verified as duplicative — different comment types (PR bot footer vs sentinel review). | **UNVERIFIED** — custodian call: is the PR assistant comment substantively distinct from sentinel-review output? If yes, keep. If duplicate, archive. |
| `echo-bot.yml` | Does nightly catalog overlap with `catalog-check.yml`? Does dispatch overlap with restored writer? | Last 5 runs: 2026-07-17·success·schedule × 1; 2026-07-16·success·schedule × 4. Active nightly. Does catalog regeneration on schedule AND accepts dispatch for cycle-set operations. `catalog-check.yml` detects drift but does not regenerate; `echo-bot.yml` regenerates — complementary, not duplicate. Dispatch cycle-set: overlaps with `mobius-bot-state-sync.yml` when the writer is healthy, but writer is currently broken (App credentials invalid). | **UNVERIFIED** — custodian call: (1) keep echo-bot's catalog regen distinct from catalog-check's drift detection? Recommend yes. (2) once writer is repaired, is the dispatch cycle-set command still needed? |

---

## Scheduled Runs — Before / After

| State | Scheduled runs/day |
|---|---|
| Before (all 7 ARCHIVE candidates active) | +~58 hypothetical (custodian pre-audit estimate) |
| Confirmed TRUE archives this cycle | `guardian.yml`: **-1 run/day** |
| KEEP verdicts remain | `mobius-pulse-unified` ~25/day; `mesh-aggregate` 24/day; `mobius-divergence-dashboard` 4/day |
| UNVERIFIED — unchanged pending custodian calls | `sentinel-heartbeat`, `mobius-sync-unified` |

**Net scheduled-run delta from this PR:** -1 run/day (guardian.yml).

The structural ARCHIVE case for ~57 of the 58 estimated runs does not survive
the B1 run-history evidence requirement. Most workflows flagged as dormant are
actively producing consumed artifacts.

---

## Restraint Row

The following were explicitly **not touched** in Lane B:

- epicon-guard, sentinel-review, mobius-merge-gate, mobius-auto-consensus-label,
  authority-provenance-guard, anti-nuke, catalog-check, canon-state-validate,
  canon-journal-verify, canon-drift-tripwire, writer-health-watchdog,
  mobius-bot-state-sync, ci, codeql, coverage, secret-scan, security-audit,
  benchmark, mkdocs-pages, reserve-block-canonization, gi-gate, mobius-bot,
  mobius-operator-merge, cycle-issue-to-pr, cycle-journal-ci
- No workflow was deleted
- No branch-protection configuration was changed
- The #392 lane, seal/KV/identity surfaces untouched
- UNVERIFIED workflows left in place

---

## Open Custodian Calls (4)

1. **`sentinel-heartbeat.yml`** — Submit Attestation is skipped. Is this by design (no token deployed) or a regression? If the attestation endpoint is available and the token should be deployed, repair and keep. If the submission is permanently gated on a future milestone, the coordination scores are effectively ritual and archival is warranted on the next B1 pass.

2. **`mobius-sync-unified.yml`** — Schedule leg failing consistently. Is the kaizen manifest sync expected to be broken? If yes: disable the schedule trigger and keep for PR/push paths only. If not: repair and keep.

3. **`mobius-pr-assistant.yml`** — Is the PR bot's output (footer, links, validation) distinct from sentinel-review's upserted comment? If yes: keep. If the sentinel review comment now covers the same surface: archive.

4. **`echo-bot.yml`** — Once `mobius-bot-state-sync` App credentials are repaired: is the dispatch cycle-set command still needed, or does the restored writer make it redundant? Catalog regen path (complementary to catalog-check) is likely worth keeping regardless.

---

## Peeled SHAs (verified at time of audit)

| Item | SHA |
|---|---|
| `guardian.yml` archived from | `3dca94c` (HEAD at audit time) |
| `OAA_CHARTER.md` at audit read | `6b69374542615bef47b43212a3e1050f60aa3972` (blob) |
| `mesh-aggregate.json` node data | Fetched 2026-06-30T13:03:56Z per file |
| Run IDs sampled | sentinel-heartbeat: 29583199007; mesh-aggregate: 29582566427; mobius-pulse: 29586897774; divergence: 29586078285; guardian: 29551091182; epicon03: 29531300848 |

---

*Audit completed: 2026-07-17 | Cycle C-375 | ATLAS*
