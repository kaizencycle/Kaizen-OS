# ATLAS C-386 — Implementation chamber

**Handoff ID:** `HANDOFF_C-386_ATLAS_ZEUS_agent-memory-kv-drift_v1`  
**Cycle:** C-386 · **Risk:** MEDIUM (HIGH when memory drives consequential action)

## Constitutional one-liner

KV ≠ CANON ≠ EPICON ≠ CPC ≠ TRUTH. KV is a cache.

## Pre-flight (A-001)

Before edits:

- [ ] Read `AGENTS.md` / `BUILD.md` (terminal) or Substrate contributor docs
- [ ] Read `.github/PULL_REQUEST_TEMPLATE.md` (if touching terminal)
- [ ] Inspect branch diff; do not patch blindly
- [ ] Inspect existing KV/memory schema and EPICON hooks
- [ ] Inspect existing tests

## Architecture placement (A-002)

**Canonical reference implementation (this cycle):**

- `packages/agent-memory-governance/` — `count_independent_sources()`, `canonicalRootKey()`, `canPromoteToVerified()`, `validateMemory()`, transitions
- `schemas/agent_memory_record_v1.schema.json`
- `configs/c386-agent-memory-policy.yaml`

Wire into runtime KV paths in a **follow-on PR** if needed; this cycle delivers schema + library + tests + handoff.

## Tasks

### A-003 — Epistemic classes

`REPORTED | INFERRED | VERIFIED | STALE | QUARANTINED | SUPERSEDED | REJECTED`  
Unknown class → quarantine / validation failure (no silent default).

### A-004 — Independent source schema

```yaml
evidence:
  independent_sources:
    - type: canonical_repository_state
      root_id: "github:owner/repo@<fullsha>"
      expires_at: "2026-07-28T12:00:00Z"   # optional; required for promotion freshness
```

### A-005 — Evidence counter (single authority)

Implement **one** function: `count_independent_sources(record)`.

- Dedup via `canonicalRootKey()` — **§7.1 / Z-002**
- Writers SHOULD emit normalized `root_id`; readers MUST canonicalize before counting
- `agent_memory` and non-qualifying types do not increase quorum

### A-006 — Self-reference

```text
previous_memory_ids present AND count_independent_sources(record) === 0
```

Do not duplicate evidence parsing.

### A-007 — Promotion gate (separate from validation)

`can_promote_to_verified(record, { requiredSources, now })`:

- `class === INFERRED`
- provenance present
- no `verification_conflict`
- `independent_sources >= threshold`
- `!is_self_referential_chain(record)`
- **`evidentiaryRootsFresh(record, now)`** — promotion blocked if any qualifying root `expires_at` is in the past, or record `freshness.expires_at` is in the past (**§10 / §16 item 20**)

`validate_memory()` must **not** silently promote.

### A-008 — State machine

Explicit edges only; no `REPORTED → VERIFIED`; no `REJECTED → VERIFIED`; `REJECTED → INFERRED` only with `NEW_EVIDENCE_REOPEN`.

### A-009 — Runtime gate (sequence)

```text
READ KV → validate class → fresh? → evidence roots? → conflict? → consequential? → auth? → ZEUS? → proceed | reverify | quarantine
```

## Tests (§16 — minimum before seal)

Run: `npm test --workspace=@mobius/agent-memory-governance`

Include:

- [ ] Z-002 alias dedup (`github:owner/repo@sha`, commit URL, `github:artifact:…`)
- [ ] Promotion blocked when evidentiary root expired at quorum check time
- [ ] All other §16 cases in `tests/c386-memory-governance.test.ts` (extend as needed)

## Output format (§21)

Return **ATLAS C-386 IMPLEMENTATION REPORT** with sections 1–11:

1. PRE-FLIGHT  
2. FILES INSPECTED  
3. EXISTING ARCHITECTURE FOUND  
4. GAPS AGAINST C-386  
5. MINIMAL PATCH  
6. TESTS ADDED  
7. TEST RESULTS  
8. UNRESOLVED QUESTIONS  
9. CANON COLLISIONS  
10. PR / COMMIT EVIDENCE  
11. RECOMMENDATION: `PASS` | `CLARIFY` | `HOLD`  

No unsupported status claims.
