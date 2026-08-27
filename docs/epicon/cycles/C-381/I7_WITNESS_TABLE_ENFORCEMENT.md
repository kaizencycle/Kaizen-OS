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

## Verification preference (post-C-381)

When confirming a completion claim — an agent's, a custodian's, or a reviewer's — prefer sources in this order:

1. **Merge (or parent) commit SHA** — e.g. `d04817ff`, `2a403d6e`
2. **Blob or raw content at that SHA** — `raw.githubusercontent.com/.../<sha>/path` or `github.com/.../blob/<sha>/path`
3. **Local or CI executable check** — `git show <sha>:path`, `node --test ...`
4. **PR description / narrative report** — context only; treat as STALE until (1)–(3) agree with it

Rationale: the PR conversation page is a rendered UI that can serve stale or cached content even when the underlying ref has moved — this was observed directly in C-381 (PR #417's page returned a frozen pre-patch snapshot across four separate fetches, while a raw file fetch at the merge SHA returned current content immediately). A narrative "it's fixed" claim is a claim, not a verification, regardless of who or what makes it — the same principle I7 enforces for PR bodies applies one level up to how those PRs get confirmed afterward.

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| I7 validator parses literal `## Witness Table` header | TRUE | tests/epicon-guard-witness-table.test.mjs |
| Tier 1 PRs exempt from I7 | TRUE | validate.mjs TIER_ORDER gate |
| All-STALE tables pass format with warning | TRUE | witness-table.mjs checkWitnessTable |

---

*"We heal as we walk."*
