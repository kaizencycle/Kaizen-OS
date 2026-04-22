# Cycle Rollups

Each cycle folder stores deterministic rollup artifacts for replay and Terminal hydration.

Required files per cycle:

- `summary.json`
- `integrity.json`
- `timeline.json`
- `journals-index.json`

Generate `journals-index.json` with:

```bash
npx tsx scripts/generate-cycle-journal-index.ts C-289
```
