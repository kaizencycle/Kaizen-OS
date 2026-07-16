# Canon Writer Repair — mobius-bot-state-sync

**Status:** Blocked (P0) · C-373 recovery · Issues [#339](https://github.com/kaizencycle/Mobius-Substrate/issues/339), [#351](https://github.com/kaizencycle/Mobius-Substrate/issues/351), [#371](https://github.com/kaizencycle/Mobius-Substrate/issues/371)

**Verified:** 2026-07-16 — `cycle.json` at **C-360**; arithmetic expected **C-374** (14-cycle lag). `STATE/writer-health.json` last success **2026-06-30** (`C-358`), status `blocked`.

## Root cause

Daily runs fail at credential preflight (before checkout):

```
Error: MOBIUS_BOT_APP_ID is missing or empty.
```

`MOBIUS_BOT_APP_ID` and/or `MOBIUS_BOT_PRIVATE_KEY` are missing or empty in repository secrets.

Failed runs now stamp `STATE/writer-health.json` via the `record-failure` job (C-373) so drift is visible without manual edits.

## Owner repair steps

1. Open **GitHub → kaizencycle/Mobius-Substrate → Settings → Secrets and variables → Actions**
2. Set or rotate (use **repository** secrets on `Mobius-Substrate`, not Client secrets from the App page):
   - `MOBIUS_BOT_APP_ID` — the Mobius GitHub App **Client ID** (`Iv23...`, not numeric App ID `4317883`)
   - `MOBIUS_BOT_PRIVATE_KEY` — PEM from **Private keys → Generate** (the downloaded `.pem` file)

   **Critical:** PEM must keep its newlines. Pasting into the GitHub UI often collapses to one line → `Invalid keyData` / `wrong tag`.

   ```bash
   # Recommended — feeds the file directly, preserves newlines
   gh secret set MOBIUS_BOT_APP_ID --repo kaizencycle/Mobius-Substrate --body "Iv23lio1uMzL6P0htHOT"
   gh secret set MOBIUS_BOT_PRIVATE_KEY --repo kaizencycle/Mobius-Substrate < ~/Downloads/mobius-canon-writer.*.private-key.pem
   ```

   First line of the PEM must be `-----BEGIN RSA PRIVATE KEY-----` or `-----BEGIN PRIVATE KEY-----`.
   Literal `\n` separators in the secret are also accepted (normalized in workflow).
   Do **not** use **Client secrets** (short hex string) — that is a different credential.
3. Confirm the App is installed on `Mobius-Substrate` with **Contents: Read and write** on allowed paths
4. **Actions → mobius-bot-state-sync → Run workflow** (manual dispatch)
5. Verify:
   - Run succeeds (both `sync` and no `record-failure`)
   - `STATE/writer-health.json` shows `status: ok` and today's timestamp
   - `cycle.json` advances deterministically from C-360 to arithmetic current cycle in **one** run — do **not** hand-edit cycle number
6. Confirm the **next scheduled** run (04:10 UTC) succeeds without manual dispatch
7. Close issues #351 and #371 only after both manual and scheduled runs succeed

## What the C-373 PR changes (code only)

- `record-failure` job stamps `STATE/writer-health.json` on workflow failure (no `cycle.json` mutation)
- Credential preflight error messages reference this doc and open issues
- Does **not** set or rotate secrets — custodian action required

## After writer recovers

`cycle.json` will advance from C-360 to the arithmetic current cycle over a single successful run — not fourteen manual commits.

## Witness (C-373)

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Writer workflow definition present | TRUE | `.github/workflows/mobius-bot-state-sync.yml` on `main` |
| Credentials configured | FALSE | Scheduled runs fail at preflight (runs `29394134769`, `29311100571`, `29232449915`) |
| `cycle.json` current | FALSE | `cycle.json` → `C-360`, `last_updated` 2026-07-02 |
| Failure auto-recorded | PARTIAL | Merged after C-373 PR; pending first post-merge failed run |
