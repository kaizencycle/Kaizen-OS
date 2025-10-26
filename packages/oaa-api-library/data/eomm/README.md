# E.O.M.M. (External Organic Memory Module) Data

This directory contains E.O.M.M. entries that are automatically synced to the Civic Ledger.

## Entry Format

Each entry is a JSON file with the following required fields:

```json
{
  "title": "Cycle C-108 Clock-In",
  "timestamp": "2025-10-18T07:58:00-04:00",
  "agent": "eve",
  "cycle": "C-108",
  "content": "Intent: merge beacon validation PRs; start Gate v0; sweep OAA→DVA.",
  "tags": ["clockin","intent"]
}
```

### Required Fields
- `title`: Human-readable title for the entry
- `timestamp`: ISO 8601 timestamp
- `agent`: Agent name (e.g., "eve", "adam")
- `cycle`: Cycle identifier (e.g., "C-108")
- `content`: The actual reflection or log content

### Optional Fields
- `tags`: Array of string tags for categorization
- `author`: Author name (defaults to "Michael Judan")
- `keywords`: Array of keywords for searchability

## File Naming Convention

Files are automatically named using the pattern:
`{timestamp}-{cycle}-{slugified-title}.json`

Example: `2025-10-18T075800-C-108-cycle-c-108-clock-in.json`

## Sync Process

1. **Validation**: Entries are validated against the schema
2. **Quarantine**: Invalid entries are moved to `_invalid/` directory
3. **Serialization**: Valid entries are wrapped in JSON-LD format
4. **Attestation**: Entries are posted to the Civic Ledger with integrity hashes
5. **Summary**: Sync results are logged in `_invalid/SUMMARY.json`

## API Endpoints

- `POST /api/eomm/validate` - Preflight validation
- `POST /api/eomm/ingest` - Write new entries

## Manual Sync

```bash
# Dry run
npm run eomm:sync:dry

# Real sync
npm run eomm:sync
```
