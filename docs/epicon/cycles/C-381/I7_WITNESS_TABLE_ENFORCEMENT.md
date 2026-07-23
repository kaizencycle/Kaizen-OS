# C-381 — I7 Witness Table Enforcement

**Tracking:** [#386](https://github.com/kaizencycle/Mobius-Substrate/issues/386)  
**Status:** Shipped (warn-only rollout)  
**Doctrine:** [WITNESS_PROTOCOL.md](../../WITNESS_PROTOCOL.md) (C-373)

## What shipped

- `checkWitnessTable()` in `.github/actions/epicon-guard/src/witness-table.mjs`
- EPICON Guard integration — fires on Tier **EP-2+** PRs only
- Default **`i7-mode: warn`** (dry-run); flip to `enforce` after custodian sign-off
- `docs/templates/ATLAS_HANDOFF_TEMPLATE.md` — literal `## Witness Table` skeleton
- EPICON-02 design goals updated (invariant 7)

## Required format (literal)

```markdown
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| <claim> | TRUE | <SHA / git command / URL> |
```

Verdicts: `TRUE`, `FALSE`, `STALE`, `TRUE-gap` (canonical per `docs/WITNESS_PROTOCOL.md` §verdicts).

Fenced code blocks are stripped before validation — an illustrative skeleton inside ` ```markdown ` cannot satisfy I7.

## Rollout

| Phase | Mode | Action |
|-------|------|--------|
| 1 (now) | `warn` | Surface I7 violations without blocking merge |
| 2 | `enforce` | Set `i7-mode: enforce` on EPICON Guard workflow |

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| I7 validator parses literal `## Witness Table` header | TRUE | tests/epicon-guard-witness-table.test.mjs |
| Tier 1 PRs exempt from I7 | TRUE | validate.mjs TIER_ORDER gate |
| All-STALE tables pass format with warning | TRUE | witness-table.mjs checkWitnessTable |

---

*"We heal as we walk."*
