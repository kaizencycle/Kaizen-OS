# EPICON Philosophy

**Cycle:** C-363 · **Type:** Foundational reference (not implementation)

EPICON (Intent Protocol) is how Mobius answers **why** something changed — not only **what** changed. This page is philosophy and review discipline, not API docs.

---

## Every important action should answer

| Question | EPICON field / practice |
|----------|-------------------------|
| **Who acted?** | Actor, service account, or sentinel identity |
| **Why?** | Stated intent — values invoked, reasoning, boundaries |
| **What changed?** | Scope, files, endpoints, or state delta |
| **Was it autonomous?** | Human, agent, cron, or bot — label the mode |
| **Was it reviewed?** | Consensus label, sentinel review, or explicit waiver |
| **Can history replay it?** | Ledger event, reserve block, or journal entry with hash |

If a PR cannot answer these six questions in plain language, it is not ready to merge.

---

## Principles

1. **Intent before execution** — declare EPICON (or equivalent journal) before irreversible writes.
2. **No silent autonomy** — agents and crons identify themselves; no anonymous production mutations.
3. **Replay beats rhetoric** — a claim is weaker than a reproducible attestation chain.
4. **Boundaries are part of intent** — say what the change does *not* apply to.
5. **Vacation-safe work** — docs and copy passes are valid EPICON scope when runtime risk is zero.

---

## When EPICON is required

- Federation PRs touching integrity, ledger, vault, or sentinel roster
- New cron or write path on Terminal or CPC
- Constitutional changes on Substrate (`cycle.json`, license policy, quorum)

## When a lightweight note suffices

- Typo fixes, link repairs, screenshot updates (C-363 class)
- Browser Shell **public language** changes that do not alter routes or APIs

---

## Further reading

- [Canonical definitions](./CANONICAL_DEFINITIONS.md) — EPICON, Seal, Attestation
- [Five surfaces](./FIVE_SURFACES.md)
- Implementation: `epicon/` in Substrate, Terminal ingest routes (do not duplicate here)

*"We heal as we walk."*
