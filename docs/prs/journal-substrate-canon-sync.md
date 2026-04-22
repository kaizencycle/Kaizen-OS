# PR: Journal → Substrate Canon Sync

## Title
feat(journal): canonical substrate-backed journal sync with hot KV mirror

## Objective
Make Mobius-Substrate the canonical journal memory layer and keep KV/Redis as the hot operational mirror.

## Architecture Rule

### Write Path
`POST /api/agents/journal`
- validate payload
- `writeJournalToSubstrate()`
- KV mirror (optional)
- return canonical result

### Read Modes
- HOT = KV / Redis
- CANON = Substrate repo
- MERGED = KV + Substrate fallback

## API Changes

### POST /api/agents/journal

#### Success Response
```json
{
  "ok": true,
  "canonical": true,
  "path": "journals/zeus/2026-04-20T09-00-00Z-journal.json",
  "mirrored_to_kv": true,
  "timestamp": "2026-04-20T09:00:00Z"
}
```

#### Failure Response
```json
{
  "ok": false,
  "canonical": false,
  "error": "substrate_write_failed",
  "mirrored_to_kv": false
}
```

### GET /api/agents/journal
Query params:
- `mode=hot|canon|merged`
- `agent=ZEUS`
- `cycle=C-286`
- `limit=10`

## Schema Update
Add optional fields:
- `verification_status?: "unverified" | "confirmed" | "contested"`
- `tripwire_context?: string[]`
- `canonical_path?: string`
- `commit_sha?: string`

## Snapshot Integration
Support:
`/api/terminal/snapshot?include_substrate=true&journal_mode=merged`

Example payload:
```json
{
  "journal_mode": "merged",
  "journal_summary": {
    "latest_agent_entries": [
      {
        "agent": "zeus",
        "source": "substrate",
        "timestamp": "2026-04-20T09:00:00Z",
        "severity": "elevated",
        "summary": "Tripwire persistent; GI source live."
      }
    ]
  }
}
```

## Substrate File Layout
```text
Mobius-Substrate/
  journals/
    zeus/
    atlas/
    hermes/
    eve/
```

File naming:
`YYYY-MM-DDTHH-MM-SSZ-journal.json`

## Cycle Rollups
```text
Mobius-Substrate/
  cycles/
    C-286/
      summary.json
      timeline.json
      journals-index.json
```

## Integrity Rules
- Substrate write failure = request fails
- KV mirror failure = allowed, log only

## Environment Variables
- `SUBSTRATE_GITHUB_TOKEN=...`
- `JOURNAL_DEFAULT_MODE=merged`
- `JOURNAL_CANONICAL_REQUIRED=true`
- `JOURNAL_KV_MIRROR=true`

## UI Updates
Mode selector:
`[ HOT ] [ CANON ] [ MERGED ]`

Journal card fields:
- agent
- timestamp
- severity
- source badge (`KV` / `SUBSTRATE`)
- canonical path link

## Tasks
### Backend
- enforce canonical write
- add read modes
- extend schema
- snapshot integration

### Frontend
- journal mode selector
- source badges
- canonical link

### Reliability
- handle failure states
- log KV mirror failures

## Acceptance Criteria
- all journals written to Substrate
- KV is mirror only
- read modes functional
- snapshot includes journal summary
- UI shows source
- failures handled correctly

## Outcome
Mobius becomes a durable, replayable, substrate-backed system memory — not just a terminal feed.
