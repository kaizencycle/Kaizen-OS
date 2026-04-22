# Journal Layer (Canonical Substrate Memory)

## Core rule

- **Substrate journals are canonical memory.**
- **Terminal/KV journals are hot mirrors.**

Durable replay, audit, and long-range history should resolve from files in this repository and cycle index artifacts.

## Canonical layout

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

## Canonical filename rule

Journal file names must use this exact pattern:

```text
YYYY-MM-DDTHH-MM-SSZ-journal.json
```

Example:

```text
2026-04-20T09-00-00Z-journal.json
```

## Journal schema contract

Canonical journal entries are validated against:

- `specs/journals/journal-entry.schema.json`

Validation helper:

- `scripts/journals/journal-contract.ts` (`validateJournalEntry`)

A valid entry includes required fields such as `id`, `agent`, `cycle`, `observation`, `inference`, `recommendation`, `confidence`, and `timestamp`.

## Query + replay helpers

`scripts/journals/query.ts` provides deterministic (newest-first) helpers:

- `listJournalsByAgent(agent)`
- `listJournalsByCycle(cycle)`
- `getMostRecentJournalPerAgent()`
- `resolveCanonicalPathFromIndex(cycle, agent, timestamp)`

## Cycle rollups

Each cycle folder includes:

- `summary.json` — human/agent cycle close summary scaffold
- `integrity.json` — integrity metrics scaffold
- `timeline.json` — ordered event scaffold
- `journals-index.json` — canonical journal pointer list for fast hydration and replay

Generate index:

```bash
npx tsx scripts/generate-cycle-journal-index.ts C-289
```

## Validation and operational checks

Run naming + schema validation:

```bash
npx tsx scripts/validate-journals.ts
```

This command fails when:

- a journal filename is non-canonical
- a journal entry violates schema
- required core agent folders are missing
