# Mobius Journals

This directory contains canonical, per-agent journal entries for the Mobius integrity system.

## Directory Structure

```text
journals/
├── atlas/ … daedalus/   # Canonical per-agent journals
└── README.md
```

Cycle rollups and replay scaffolding now live at repository root:

```text
cycles/
  C-XXX/
    summary.json
    integrity.json
    timeline.json
    journals-index.json
```

Cold archive scaffolding lives at:

```text
archive/YYYY/Q1..Q4/
```

## Canonical Journal File Naming

Journal files must follow:

`YYYY-MM-DDTHH-MM-SSZ-journal.json`

Example:

`2026-04-20T09-00-00Z-journal.json`

## Canonical Contract

- JSON schema: `specs/journals/journal-entry.schema.json`
- TypeScript type: `specs/journals/journal-entry.type.ts`
- Validation/query helpers: `scripts/lib/journal-contract.mjs`

## Commands

```bash
# Validate canonical filename + schema compliance
npm run journals:validate

# Generate cycle index and scaffold rollup files
node scripts/generate-cycle-journal-index.mjs C-289
```

## Related Docs

- [Journal Layer Architecture](../docs/architecture/JOURNAL_LAYER.md)
- [Cycle Journal Runtime (legacy flow)](../docs/CYCLE_JOURNAL_RUNTIME.md)
- [Cycle Journal Schema (legacy cycle record)](../schemas/cycle_journal.schema.json)
