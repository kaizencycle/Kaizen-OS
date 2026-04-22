# JOURNAL_LAYER

## C-289 — Canonical Journal Layer Contract

Mobius-Substrate is the canonical journal memory layer.

- **Substrate** stores durable journal bodies and cycle rollups.
- **Terminal/KV** stores hot mirrors and previews.
- **Replay and audit** resolve from Substrate files and cycle indexes.

## Canon vs Hot Mirror

- Canonical source of truth: `journals/{agent}/YYYY-MM-DDTHH-MM-SSZ-journal.json`
- Runtime mirror (optional): Terminal/KV summary lanes
- If mirror diverges, canon wins.

## Folder Contract

```text
journals/
  atlas/
  zeus/
  hermes/
  echo/
  aurea/
  jade/
  eve/
  daedalus/

cycles/
  C-289/
    summary.json
    integrity.json
    timeline.json
    journals-index.json

archive/
  2026/
    Q1/
    Q2/
    Q3/
    Q4/
```

## Journal Schema

Canonical schema path:

- `specs/journals/journal-entry.schema.json`
- TypeScript type: `specs/journals/journal-entry.type.ts`

Required fields:
- `id`, `agent`, `agentOrigin`, `cycle`, `scope`, `category`, `severity`
- `observation`, `inference`, `recommendation`, `confidence`
- `derivedFrom`, `source`, `tags`, `timestamp`

Optional fields:
- `gi_at_time`, `status`, `verification_status`, `tripwire_context`
- `canonical_path`, `commit_sha`

## Query/Replay Readiness

Helpers in `scripts/lib/journal-contract.mjs` provide:

- list journals by agent (newest-first)
- list journals by cycle (newest-first)
- list most recent journal per agent
- resolve canonical path from cycle index

## Scripts

- Validate all journals:
  - `node scripts/validate-journals.mjs`
- Generate cycle index scaffold:
  - `node scripts/generate-cycle-journal-index.mjs C-289`

- Normalize legacy filenames:
  - `node scripts/normalize-journal-filenames.mjs`

## Cycle Rollup Format

`cycles/C-XXX/journals-index.json`

```json
{
  "cycle": "C-289",
  "generated_at": "2026-04-22T00:00:00.000Z",
  "entry_count": 1,
  "entries": [
    {
      "agent": "ZEUS",
      "timestamp": "2026-04-20T09:00:00Z",
      "severity": "elevated",
      "path": "journals/zeus/2026-04-20T09-00-00Z-journal.json"
    }
  ]
}
```


## Replay / Query Examples

- **By time window:** list agent entries where `timestamp` is between two ISO datetimes.
- **By cycle:** use `listJournalsByCycle(root, "C-289")` then hydrate details from indexed `path` values.
- **Latest per agent:** use `listMostRecentJournalPerAgent(root)` to build dashboard previews.
- **Index resolution:** use `resolveCanonicalPathFromIndex(root, cycle, agent, timestamp)` for deterministic lookups.
