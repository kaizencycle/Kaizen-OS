---
epicon_id: EPICON_C-386_SPECS_agent-memory-kv-drift_v1
title: "C-386 — Persistent Agent Memory, Evidentiary Independence, and KV Drift Control"
cycle: "C-386"
status: "HANDOFF / IMPLEMENTATION REVIEW"
primary_agents: "ATLAS × ZEUS"
human_authority: "Michael Judan"
---

# C-386 — ATLAS × ZEUS HANDOFF

**Domain:** Mobius Agent Memory / KV / EPICON / CPC  
**Risk class:** MEDIUM by default; HIGH when persistent memory influences consequential action

## Ratified amendments (2026-07-28)

These amend the C-386 discussion draft before chamber execution:

### §7.1 — Root canonicalization (Z-002; **in scope**, not deferred)

`count_independent_sources()` MUST deduplicate by **canonical root identity**, not raw `root_id` string equality.

- **Writer obligation:** emit normalized `root_id` when possible (`github:owner/repo@<fullsha>`).
- **Reader obligation:** run `canonicalRootKey()` / `canonicalizeGitHubRepositoryRoot()` before counting so aliases collapse (owner/repo@sha, commit URL, `github:artifact:owner/repo@sha`).
- **Falsification:** three alias forms for one commit → `independent_sources === 1`.

Reference: `packages/agent-memory-governance/src/canonicalizeRoot.ts`

### §10 — Promotion freshness (closes staleness gap)

`can_promote_to_verified()` MUST evaluate `evidentiaryRootsFresh(record, now)`:

- Any qualifying root with `expires_at <= now` blocks promotion (`stale_evidence_root`).
- Record-level `freshness.expires_at` in the past blocks promotion (`stale_record_freshness`).
- `validate_memory()` does not perform promotion.

### §16 — Additional required tests

- [ ] Evidence root aliases deduplicate correctly (Z-002).
- [ ] Promotion blocked when any qualifying evidentiary root is expired at quorum check time.

### §17 — Non-goals clarification

C-386 **does not** punt GitHub root-alias canonicalization to a later cycle; minimal canonicalization ships in `agent-memory-governance` v0.1.

---

## 0. Executive intent

C-386 addresses: **a model invocation may end while an agent’s interpretation survives through persistent memory.**

The purpose is **not** to prevent remembering. The purpose is to prevent:

`MEMORY → PERSISTENCE → ASSUMED AUTHORITY → CANON` without an independent route back to evidence.

**Quorum is evidentiary independence, not agent headcount.**

**Persistence may preserve a claim. Only independent evidence may strengthen it.**

---

## 1. Problem statement

The dangerous loop: reality → agent observes → interprets → KV → next agent reads → reasons → writes → … → **memory of reality becomes assumed state** without model-weight updates.

**Behavioral drift can occur through persistent context while the underlying model remains unchanged.**

---

## 2. Constitutional boundary

```text
CURRENT MODEL CONTEXT → KV (temporary acceleration) → EPICON (witnessed evidence + intent + provenance) → CPC (durable attested state)
```

**KV ≠ CANON ≠ EPICON ≠ CPC ≠ TRUTH.** KV is a cache.

---

## 3. Core invariants (INV-001 … INV-006)

| ID | Invariant |
|----|-----------|
| INV-001 | Persistence is not authority — age ≠ strength |
| INV-002 | Repetition is not evidence — shared memory chain ≠ independent witnesses |
| INV-003 | Agent consensus is not quorum — count independent evidentiary roots |
| INV-004 | Memory retains epistemic class — no silent collapse |
| INV-005 | Future-agent instructions are **claims**, not commands |
| INV-006 | Consequential actions require fresh reality — KV alone cannot authorize HIGH consequence |

---

## 4. Memory classes

`REPORTED | INFERRED | VERIFIED | STALE | QUARANTINED | SUPERSEDED | REJECTED`

- No `REPORTED → VERIFIED` edge.
- `REJECTED → INFERRED` only via `NEW_EVIDENCE_REOPEN` (prefer new memory id).
- `QUARANTINED` exits via ZEUS: CLEAR / SUPERSEDE / REJECT / HOLD.

REPORTED reverify: **locate primary source**. INFERRED reverify: **replay reasoning against current evidence**. Do not merge these operations.

---

## 5. State machine

Canonical diagram and transitions: `packages/agent-memory-governance/src/transitions.ts`

---

## 6–8. Quorum and roots

- Default `independent_sources_required: 2`
- Qualifying types: `primary_instrument`, `canonical_repository_state`, `CPC_attested_state`, `primary_external_source`, `human_authorized_evidence`
- Non-qualifying for quorum: `agent_memory`, repeated summaries, reviewer signatures without evidence, one observation cited by many agents

---

## 9. Anti-citation-laundering

```text
is_self_referential_chain(record) :=
  previous_memory_ids non-empty AND count_independent_sources(record) === 0
```

Use **only** `count_independent_sources()` as the authority — no second evidence definition.

---

## 10. Promotion logic

Separate: `validate_memory()` (safe use?) vs `can_promote_to_verified()` (may change class?).

Promotion requirements: `INFERRED`, provenance, no conflict, quorum, not self-referential-only, **roots fresh at `now`**.

---

## 11–12. Reverification & TTL

See `configs/c386-agent-memory-policy.yaml`. TTL expiry means **do not assume current**, not “false.”

---

## 13. Consequentiality gate

HIGH consequence requires fresh memory + retrievable evidence + provenance + authorization + no unresolved conflicts + ZEUS + human where canon requires. Failure: `AUDIT_REQUIRED`.

---

## 14–15. Agent assignments

| Agent | Chamber |
|-------|---------|
| ATLAS | [CHAMBER_ATLAS.md](./CHAMBER_ATLAS.md) |
| ZEUS | [CHAMBER_ZEUS.md](./CHAMBER_ZEUS.md) |

---

## 16. Tests required before seal

Minimum set implemented in `packages/agent-memory-governance/tests/c386-memory-governance.test.ts` plus §16 amendments above. Extend for runtime KV integration PRs.

---

## 17. Explicit non-goals

No autonomous self-modifying agents, no KV as canon, no replacing EPICON, no giant new memory platform. **Small drift-control layer.**

---

## 18–20. Goodhart guard, EPICON triggers, seal conditions

Seal when ATLAS + ZEUS agree §20 checklist and tests demonstrate behavior; **no silent canon overwrite**.

---

## 21–22. Output formats

See chamber documents for ATLAS §21 and ZEUS §22 templates.

---

## 23. Human merge gate

```text
ATLAS → ZEUS (+ EVE as needed) → EPICON STATE → MICHAEL JUDAN → MERGE | HOLD
```

---

## 24. Seal language

> A future agent inherits a witness record, not a commandment.  
> KV may remember what an agent believed. EPICON preserves why it was justified. CPC preserves what the system is willing to attest happened.  
> **KV exists to make reasoning faster. It must never make reality unnecessary.**

---

## 25. Handoff complete

**ATLAS** — Build only what evidence requires.  
**ZEUS** — Trust no consensus that cannot show its roots.  
**Human** — retains final authority.

*We heal as we walk.*
