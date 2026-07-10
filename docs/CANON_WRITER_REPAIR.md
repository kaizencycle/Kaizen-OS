# Canon Writer Repair — mobius-bot-state-sync

**Status:** Blocked (P0) · Issues [#339](https://github.com/kaizencycle/Mobius-Substrate/issues/339), [#351](https://github.com/kaizencycle/Mobius-Substrate/issues/351)

## Root cause

Daily runs fail at the App token mint step:

```
Error: The 'client-id' input must be set to a non-empty string.
```

`MOBIUS_BOT_APP_ID` and/or `MOBIUS_BOT_PRIVATE_KEY` are missing or empty in repository secrets.

## Owner repair steps

1. Open **GitHub → kaizencycle/Mobius-Substrate → Settings → Secrets and variables → Actions**
2. Set or rotate:
   - `MOBIUS_BOT_APP_ID` — the Mobius GitHub App **Client ID** (not the numeric App ID from older docs)
   - `MOBIUS_BOT_PRIVATE_KEY` — PEM private key for the Mobius GitHub App
3. Confirm the App is installed on `Mobius-Substrate` with **Contents: Read and write** on allowed paths
4. **Actions → mobius-bot-state-sync → Run workflow** (manual dispatch)
5. Verify:
   - Run succeeds
   - `STATE/writer-health.json` shows `status: ok` and today's timestamp
   - `cycle.json` advances deterministically (do **not** hand-edit cycle number)

## What this PR changes (code only)

- Workflow uses `client-id` (replaces deprecated `app-id` input)
- Credential preflight with actionable error messages
- `STATE/writer-health.json` documents the confirmed failure mode

## After writer recovers

`cycle.json` will advance from C-360 to the arithmetic current cycle (C-368 as of 2026-07-10) over a single successful run — not eight manual commits.
