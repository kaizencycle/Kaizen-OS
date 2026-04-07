# Mobius Journals

This directory contains structured journal entries for the Mobius integrity system.

## Directory Structure

```
journals/
├── atlas/ … echo/   # Per-agent journal roots (`.gitkeep` until first write)
├── cycles/           # Cycle Journal entries (C-XXX.json / C-XXX.md)
│   ├── C-193.json   # Source of truth (JSON)
│   ├── C-193.md     # Auto-rendered preview (Markdown)
│   └── .gitkeep
└── README.md
```

## Cycle Journals

Cycle Journals are lightweight, auditable records for tracking progress, integrity, and meaning.

### Key Concepts

- **Source of Truth:** `journals/cycles/C-XXX.json` (schema-validated)
- **Preview:** `journals/cycles/C-XXX.md` (auto-generated for Substack)
- **Pattern:** Agents propose → Mobius Bot commits (PR-based)

### Documentation

- [Cycle Journal Runtime](../docs/CYCLE_JOURNAL_RUNTIME.md) — Full specification
- [Cycle Journal Publishing](../docs/CYCLE_JOURNAL_PUBLISHING.md) — Publishing guide
- [Schema](../schemas/cycle_journal.schema.json) — JSON schema

### Commands

```bash
# Validate all cycle journal entries
npm run cycle:validate

# Render JSON to Markdown
npm run cycle:render

# Full validation + render
npm run cycle:check
```

### Agent Prompts

- [ATLAS Prompt](../prompts/cycle_journal/ATLAS.md) — Topology mapping
- [AUREA Prompt](../prompts/cycle_journal/AUREA.md) — Systems framing

---

*Mobius Systems — Continuous Integrity Architecture*  
*"We heal as we walk."*
