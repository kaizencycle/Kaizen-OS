# Mobius Substrate — Documentation Portal

> **Intelligence moves. Integrity guides.**

This file is a thin orientation layer for the `docs/` tree in the repository. The **live handbook** is built from [`mkdocs.yml`](../mkdocs.yml) and published at [handbook.mobius-substrate.com](https://handbook.mobius-substrate.com).

**Do not treat this page as the folder taxonomy.** Navigation is defined only in `mkdocs.yml`. The generated index is [`INDEX.md`](./INDEX.md).

---

## Start here

| I am… | Go to |
|-------|-------|
| **New to Mobius** | [Handbook home](./00-START-HERE/README.md) → [AI Simple in Life](./00-START-HERE/AI_SIMPLE_IN_LIFE.md) |
| **Checking live state** | [State of the Substrate (latest)](./STATE_OF_THE_SUBSTRATE_LATEST.md) · [Terminal snapshot](https://terminal.mobius-substrate.com/api/terminal/snapshot-lite) |
| **Finding any handbook page** | [Generated INDEX](./INDEX.md) (from `mkdocs.yml` nav) |
| **Researcher** | [For academics](./07-RESEARCH-AND-PUBLICATIONS/for-academics/) |
| **Economist** | [For economists](./07-RESEARCH-AND-PUBLICATIONS/for-economists/) |
| **Philosopher** | [For philosophers](./07-RESEARCH-AND-PUBLICATIONS/for-philosophers/) |
| **Government** | [For governments](./07-RESEARCH-AND-PUBLICATIONS/for-governments/) |

---

## Canon vs archive

- **Canon** — pages in the live `mkdocs.yml` nav; actively maintained.
- **Archive** — `10-ARCHIVES/` and cycle-stamped `STATE_OF_THE_SUBSTRATE_C-*.md` snapshots; frozen historical record.

Only [`STATE_OF_THE_SUBSTRATE_LATEST.md`](./STATE_OF_THE_SUBSTRATE_LATEST.md) is presented as the current state pointer. Authoritative cycle: [`cycle.json`](../cycle.json).

---

## Maintainers

```bash
npm run docs:generate-index    # rebuild docs/INDEX.md from mkdocs nav
npm run docs:sync-journal-nav  # refresh Cycle Journal nav from docs/journals/C-*.md
npm run docs:guard             # witness checks (nav/reality, staleness, index drift)
```

See [`docs/epicon/EPICON-C381-HANDBOOK-REORG-001.md`](./epicon/EPICON-C381-HANDBOOK-REORG-001.md) for the C-381 reorganization spec.

---

*Cycle C-381 · "We heal as we walk."*
