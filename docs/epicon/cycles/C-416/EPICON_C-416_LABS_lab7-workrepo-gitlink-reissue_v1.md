---
epicon_id: EPICON_C-416_LABS_lab7-workrepo-gitlink-reissue_v1
title: "C-416: reissue of the C-372 lab7 workrepo gitlink fix (PR #385), rebased and republished"
cycle: "C-416"
status: published
agent_id: mobius-atlas-cursor
authority: reconciliation_reissue
execution_authorized: false
---

# EPICON_C-416_LABS_lab7-workrepo-gitlink-reissue_v1

## Intent publication

```intent
epicon_id: EPICON_C-416_LABS_lab7-workrepo-gitlink-reissue_v1
ledger_id: cursor-atlas-c416-lab7-collision
scope: labs, docs
mode: normal
issued_at: 2026-08-27T00:00:00Z
expires_at: 2026-11-20T00:00:00Z
justification: |
  VALUES INVOKED: integrity, transparency, custodianship
  REASONING: PR #385 (originally EPICON_C-372_LABS_lab7-workrepo-gitlink_v1, opened 2026-07-14) replaces the orphaned gitlink at labs/lab7-proof/workrepo (mode 160000, no .gitmodules entry) with a normal tracked directory. The fix itself was never wrong and nothing else has touched that path since — confirmed by Job #6 of the C-416 governance review: the gitlink is still present on main today, unchanged, and its removal does not collide with any other branch or PR. The original EPICON's intent window (issued_at 2026-07-14, expires_at 2026-07-21) lapsed seven weeks ago, and the branch was 44 cycles behind main (C-372 -> C-416). This EPICON reissues the same fix under a current, valid intent window after merging main into the branch, with no change to the underlying repair.
  ANCHORS:
    - Original PR #385 body and EPICON_C-372_LABS_lab7-workrepo-gitlink_v1 intent (superseded by this reissue)
    - labs/lab7-proof/tools/quorum_orchestrator.py (--workdir workrepo default) — unchanged, orchestrator behavior preserved
    - git ls-tree confirms labs/lab7-proof/workrepo is still a bare gitlink on main as of this reissue
    - C-416 governance review Job #6 disposition: CONTINUE_EXISTING_PR, no competing branch found
  BOUNDARIES: Repository layout repair only. Does not change quorum orchestrator logic, canon paths, journal parcel flush behavior, cycle.json, GI, MIC, Vault, Track R, Fountain, or any seal/deployment state.
  COUNTERFACTUAL: If a competing fix for the same path has since merged elsewhere, or if the lab7 quorum workflow fails due to the changed directory shape, halt and reassess rather than force this reissue through.
counterfactuals:
  - If lab7 quorum workflow fails due to missing workdir permissions after this change, revert and reassess directory layout
  - If the tracked scaffold directory is later found to need real submodule semantics, add a proper .gitmodules entry instead
```

## Authority classes (not interchangeable)

| Class | Posture |
|-------|---------|
| Original defect | Confirmed still present on main at time of reissue (Job #6, C-416 review) |
| Underlying repair | Unchanged from PR #385's original commit `ee843856` |
| Intent window | Reissued (original lapsed 2026-07-21); this EPICON's window is current |
| Execution authority | **`execution_authorized=false`** — repository layout repair only |

## Witness table

| Claim | Verdict | Evidence |
|-------|---------|----------|
| `labs/lab7-proof/workrepo` was still a gitlink on main before this reissue | TRUE | `git ls-tree HEAD labs/lab7-proof/workrepo` → `160000 commit …` |
| A competing fix or branch exists for the same path | FALSE | No other open PR or recent branch touches this path (C-416 Job #6) |
| The underlying fix changed from PR #385's original commit | FALSE | Same tree change: gitlink removed, `.gitkeep` added |
| `.gitmodules` entry required | FALSE | Path was never a real submodule; no `.gitmodules` file exists in this repo |
| Quorum orchestrator logic touched | FALSE | `labs/lab7-proof/tools/quorum_orchestrator.py` untouched |
| Production / cycle.json / GI / Vault mutated | FALSE | Labs scaffold only |

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

Reconciliation reissue only — no new decision made. ATLAS scribe (`mobius-atlas-cursor`), runtime_id `cursor-atlas-c416-lab7-collision`, per Job #6 of the C-416 governance review (`CONTINUE_EXISTING_PR`). Original fix authored under `EPICON_C-372_LABS_lab7-workrepo-gitlink_v1` (superseded).

---

*"We heal as we walk." — Mobius Systems*
