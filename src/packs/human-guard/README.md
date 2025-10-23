# Human-In-The-Loop Guard Pack

A lightweight pattern to let agents write code while **you remain the safety anchor**.

## What’s inside
- `scripts/apply_edit_pack.sh` — validates, redacts, and applies edits from a local inbox (default `Lab7-proof-edits/`), commits the result.
- `scripts/edits_whitelist.txt` — regex paths allowed to be applied.
- `scripts/pre-push.hook` + `scripts/install_hooks.sh` — secret scanner that blocks pushes with obvious secrets.
- `.github/workflows/human-ok-gate.yml` — CI check that fails a PR unless:
  - `HUMAN_OK.md` exists with a line like `Reviewed by MK on 2025-10-15`, **or**
  - the PR has the label `human-ok`.

## Quick start
1. Add to repo and commit. Add `Lab7-proof-edits/` to `.gitignore`.
2. Run once to install the pre-push hook:
   ```bash
   bash scripts/install_hooks.sh
   ```
3. Workflow:
   - Drop my ZIP packs into `Lab7-proof-edits/`
   - Review locally, then run:
     ```bash
     bash scripts/apply_edit_pack.sh
     git push
     ```
   - (Optional) open a PR; the **human-ok gate** will require either the label or a line in `HUMAN_OK.md`.

## Env toggles
- `EDIT_DIR` — default `Lab7-proof-edits`
- `WHITELIST_FILE` — custom regex list (default `scripts/edits_whitelist.txt`)
- `REQUIRE_HUMAN` — default `true` (set `false` to bypass, **not recommended**)
- `HUMAN_TOKEN_FILE` — default `HUMAN_OK.md`

## Notes
- The whitelist prevents accidental writes to risky paths. Tune it as your repos evolve.
- The pre-push hook is a **local guard**; CI still runs secret scanning in GitHub.
- Pair this with your **Auto-Merge Pulse** or your Cursor agent for a safe, rhythmic workflow.
