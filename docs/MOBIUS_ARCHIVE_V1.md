# MOBIUS_ARCHIVE_V1

## Mobius Archive v1 — Canonical Memory Architecture

## 0. Purpose
Mobius Archive v1 defines how the system stores, verifies, and preserves long-term, attested system memory.

It separates:
- runtime state
- durable canonical records
- proof references
- long-term archival storage

## 1. Core Principles
- Record proofs, not people.
- Record events, not lives.
- Record what can be verified, not what can be observed.

Mobius is:
- **NOT** a surveillance system
- **NOT** a raw data recorder

Mobius is:
- a verifiable event archive
- a replayable system history
- a trust-indexed memory substrate

## 2. Layered Architecture

### L1 — Hot Runtime
- **Purpose:** real-time operator state
- **Store:** Upstash KV / cache
- **Retention:** short-term (minutes → days)
- **Contains:** current GI, mode, tripwire count, cycle, latest journal preview

### L2 — Durable Canon
- **Purpose:** full historical record
- **Store:** Mobius Substrate monorepo
- **Retention:** long-term (canonical)
- **Contains:** journals, heartbeats, verification reports, cycle summaries, incidents

### L3 — Proof Ledger
- **Purpose:** immutable attestation layer
- **Store:** EPICON / Civic Core
- **Retention:** permanent
- **Contains:** hashes, timestamps, commit SHAs, signatures, references

### L4 — Cold Archive
- **Purpose:** multi-year compressed storage
- **Store:** object storage / archive bundles
- **Retention:** multi-year
- **Contains:** compressed journals, rollups, yearly summaries, replay indexes

## 3. Folder Structure
```text
docs/
  catalog/
    heartbeats/
      atlas/
      zeus/

    journals/
      atlas/
      zeus/
      hermes/
      echo/
      aurea/
      jade/
      eve/

    cycles/
      C-XXX/
        summary.json
        integrity.json
        timeline.json
        incidents.json

    epicon/
      manifests/
      published/
      contested/

    reports/
      weekly/
      monthly/
      quarterly/

    archive/
      YYYY/
        Q1/
        Q2/
        Q3/
        Q4/
```

## 4. File Naming Convention
All files must follow:

`YYYY-MM-DDTHH-MM-SSZ-type.json`

Examples:
- `2026-04-20T09-00-00Z-journal.json`
- `2026-04-20T09-02-10Z-verification.json`
- `2026-04-20T09-05-00Z-heartbeat.json`

Cycle files:
- `C-286-summary.json`
- `C-286-integrity.json`

## 5. Journal Schema
```json
{
  "timestamp": "ISO",
  "agent": "ZEUS",
  "cycle": "C-XXX",
  "scope": "string",
  "category": "observation",
  "severity": "nominal|elevated",
  "observation": "string",
  "inference": "string",
  "recommendation": "string",
  "confidence": 0.0,
  "derivedFrom": [],
  "tags": []
}
```

## 6. Cycle Summary Schema
```json
{
  "cycle": "C-XXX",
  "start": "ISO",
  "end": "ISO",
  "gi_open": 0.0,
  "gi_close": 0.0,
  "mode": "green|yellow|red",
  "tripwires_opened": 0,
  "tripwires_resolved": 0,
  "epicon_confirmed": 0,
  "epicon_contested": 0,
  "summary": "string",
  "key_events": []
}
```

## 7. Ledger Reference Model
Ledger stores references, not full documents.

```json
{
  "event_type": "AGENT_JOURNAL_ENTRY",
  "timestamp": "ISO",
  "agent": "ZEUS",
  "cycle": "C-XXX",
  "file_path": "docs/catalog/journals/zeus/...",
  "commit_sha": "git_sha",
  "content_hash": "sha256:...",
  "summary": "string",
  "signature": "ed25519:..."
}
```

## 8. Write Flow
Signal → Attestation → KV write (hot state) → full journal written to Substrate → ledger records hash + reference → archive rollups generated.

## 9. Query Patterns
- Time-based: `show state at <timestamp>`
- Cycle-based: `show C-XXX summary`
- Agent-based: `show ZEUS journals for April 2026`
- Integrity-based: `show cycles where GI < threshold`
- Incident-based: `show tripwire events in range`

## 10. Compression Strategy
- **Daily:** full journals, full reports
- **Weekly:** digest + anomaly rollups
- **Monthly:** cycle compression + integrity trends
- **Yearly:** canonical bundle + replay index

## 11. Retention Rules
Keep forever:
- cycle summaries
- verification reports
- integrity states
- EPICON references

Compress after 90 days:
- verbose journals
- repeated heartbeats

Expire quickly (hot layer only):
- KV cache
- previews
- transient signals

## 12. Replay Model
- **Level 1 (Snapshot):** state at a moment
- **Level 2 (Timeline):** changes across time
- **Level 3 (Narrative):** explanation generated from verified data

## 13. System Identity
After sustained operation, Mobius becomes a continuously verified, replayable archive of system-relevant history.

It is not a recording of human lives.

## 14. Final Architecture
Terminal → KV (hot state) → Substrate (canon) → Ledger (proof) → Archive (long-term memory)

## 15. One-Line Definition
Mobius Archive is a layered system that separates runtime state, canonical memory, and cryptographic proof to create a verifiable, replayable history of meaningful events.
