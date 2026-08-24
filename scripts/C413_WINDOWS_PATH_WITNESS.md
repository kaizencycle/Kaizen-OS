# C-413 — Remove Windows-invalid top-level `...` path

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1 — custodian-issued ATLAS bounded repository repair; no production authority.*

## Status

Repository repair. Removes an accidental empty top-level blob named `...` that breaks
conventional Windows checkout. No canon, cycle, GI, MIC, deployment, or production state
changes.

## Cause

Commit `45e9926b` introduced an empty top-level Git entry named `...`. Windows checkout
rejects this path (`invalid path '...'`) unless operators use sparse-checkout or
object-only workarounds.

## Repair

- Delete the tracked root entry `...` via normal Git history (no rewrite).
- Add checkout verification (`scripts/verify_windows_portable_checkout.sh`,
  `tests/test_windows_portable_paths.py`).

## Validation

```bash
git ls-tree --name-only HEAD | grep -Fx '...' && exit 1 || true
python3 -m unittest tests.test_windows_portable_paths
bash scripts/verify_windows_portable_checkout.sh
git diff --check
```

## Risk

Low. Single empty blob removal at repository root.

## Rollback

If merged as a merge commit:

```bash
git revert -m 1 <merge-commit-sha>
```

If merged as a squash commit:

```bash
git revert <squash-commit-sha>
```

Reintroduces the Windows checkout failure; do not rollback unless the blob is required
for a documented non-Windows-only workflow.

## EPICON intent

```intent
epicon_id: EPICON_C-413_INFRA_windows-invalid-path-removal_v1
ledger_id: mobius:kaizencycle
scope: ci, specs
mode: normal
issued_at: 2026-08-24T13:45:00Z
expires_at: 2026-11-22T13:45:00Z
justification: |
  VALUES INVOKED: integrity, safety, transparency, custodianship
  REASONING: An accidental top-level Git path named ... blocks conventional Windows checkout for Mobius-Substrate contributors and agents. Removing it restores cross-platform clone parity without rewriting history.
  ANCHORS:
    - scripts/verify_windows_portable_checkout.sh
    - scripts/C413_WINDOWS_PATH_WITNESS.md
    - tests/test_windows_portable_paths.py
  BOUNDARIES: Repository layout repair only. No canon, cycle pointer, GI, MIC, Vault, Reserve Block, Track R, Fountain, seal, or deployment changes.
  COUNTERFACTUAL: If Windows checkout still fails after removal, do not merge until the remaining invalid path is identified.
counterfactuals:
  - If top-level ... remains in HEAD, do not merge.
  - If fresh clone checkout is not clean, do not merge.
  - If unrelated repository cleanup is bundled, split the PR.
```
