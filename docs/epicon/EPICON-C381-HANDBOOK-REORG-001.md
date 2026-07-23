# EPICON-C381-HANDBOOK-REORG-001 — Handbook Canon/Archive Reorganization

## Authority Provenance

| Field | Value |
|-------|-------|
| **Custodian** | Michael Judan (kaizencycle) |
| **Standing** | Founder / handbook custodian |
| **Cycle** | C-381 |
| **Status** | OPEN — phased migration |

---

## Intent

Apply Witness Protocol (C-373) to the handbook documentation layer: **a document's claim to be "current" is a claim, not a verification.** Establish `mkdocs.yml` nav as the single structural source of truth; collapse index proliferation; automate journal nav generation; ship Docs Guard CI.

## Problem (witnessed)

| Source | Claimed current | Verdict |
|--------|-----------------|---------|
| `mkdocs.yml` nav | Cycle Journal capped at C-366 | Live but incomplete |
| `docs/README.md` | v3.0.0 taxonomy (2025-11-29) | STALE vs C-381 |
| `docs/INDEX.md` | C-288 | STALE by ~90 cycles |

## Phase 1 (this cycle) — shipped incrementally

- [x] Docs Guard scripts (`scripts/docs-guard.mjs`, `generate-handbook-index.mjs`, `sync-journal-nav.mjs`)
- [x] Generated `docs/INDEX.md` from `mkdocs.yml` nav
- [x] Thin `docs/README.md` landing (no hand-maintained taxonomy)
- [x] Journal nav markers + auto-sync from `docs/journals/C-*.md`
- [x] CI workflow `.github/workflows/docs-guard.yml` (warn-only)
- [x] Journal entries C-377–C-381 + live proof on State page

## Phase 2 (deferred — requires custodian sign-off)

- Freeze `00-META/` … `11-SUPPLEMENTARY/` into `archive/docs-v3.0.0-2025-11/`
- Stand up target tree (`canon/`, `architecture/`, `research/`, `journal/`, `state/`)
- Front-matter contract (`status`, `last_witnessed_cycle`) on all canon docs
- Promote Docs Guard strict mode (nav/reality + single-index hard-fail)

## Doctrine

- **CANON** — in live nav, actively maintained, witnessed within freshness window.
- **ARCHIVE** — frozen, dated, excluded from live nav, superseded-by pointer only.

## Open questions (custodian)

1. Staleness threshold: 20 cycles global vs tiered by doc class?
2. Archived tree: exclude from search or searchable with banner?
3. Cathedral pages: keep under `research/for-*` with tag-generated link lists?

---

*C-381 · "We heal as we walk."*
