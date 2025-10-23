# Cursor Agent Starter
Wires a Cursor background agent to convert files in `/edits` into small, tested PRs and auto-merge when CI is green.

## Use
1. Drop this pack into your repo root.
2. In Cursor, create a background task: every 30m, scan `/edits` and open PRs using `.cursor/rules.json`.
3. Protect `main` and require CI. Auto-merge will squash PRs labeled `agent:cursor` when `ci:green` is present.
4. Keep secrets out of the repo. Use Render/GitHub Secrets.
