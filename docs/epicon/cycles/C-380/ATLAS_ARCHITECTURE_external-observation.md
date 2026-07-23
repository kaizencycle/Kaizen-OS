# ATLAS — External Observation Architecture (EPICON-000)

**Cycle:** C-380  
**Agent:** ATLAS  
**Status:** Draft  
**Parent:** [`EPICON-000-external-reality-boundary.md`](../../EPICON-000-external-reality-boundary.md)

---

## 1. Canon location decision

| Candidate | Verdict |
|-----------|---------|
| `docs/epicon/EPICON-000-*.md` | **SELECTED** — foundational constitutional doc (parallel to EPICON-0001 naming series) |
| `canon/` cold storage | Deferred until EVE + ZEUS + human merge |
| `epicon/` runtime package | Not duplicated — schema lives in `schemas/` |
| Extend EPICON-01 only | Insufficient — external boundary is visibility + provenance layer, not epistemic constraint alone |

---

## 2. Schema

**File:** `schemas/epicon_external_observation_v1.schema.json`

Distinct from `epicon_constitutional_v1.schema.json`:

| Schema | Holds |
|--------|-------|
| `epicon_constitutional_v1` | Ledger commitments, attestations, merkle roots (EP-2/EP-3) |
| `epicon_external_observation_v1` | Observation state, claims, provenance, replay (pre-canon) |

**Example:** `docs/epicon/examples/epicon-000-external-reality-boundary.example.json`

---

## 3. Trust-state machine

```
UNOBSERVED
    ↓ retrieval
UNTRUSTED (default public internet)
    ↓ provenance + artifact checks
PARTIALLY_ATTESTED
    ↓ independent corroboration
CORROBORATED ──→ CANON_ELIGIBLE (human review only)
    ↓ conflict detected
CONFLICTED (preserved, not averaged)
    ↓ policy / risk
QUARANTINED | AUDIT_REQUIRED
```

`CANON_ELIGIBLE` ≠ canonical. Promotion requires human authorization + Civic Ledger path.

---

## 4. Source independence

- Each `sources[]` entry has `independence_group` — collapse key for duplicate-origin detection.
- `corroboration.independent: true` requires distinct `independence_group` values.
- `CIRCULAR_CITATION` source kind flags A→B→A patterns in `provenance[]` graph.

### Proposed algorithms (implementation follow-up)

| Test | Method |
|------|--------|
| Circular citation | Directed graph cycle detection on `provenance` edges |
| Duplicate collapse | Group by `independence_group`; warn if >N outlets share one group |
| Source independence | Corroboration valid only when `independent: true` and groups differ |
| Misdated media | Artifact `authenticity: misdated` + timestamp conflict in `degraded_states` |

---

## 5. Replay contract

Every consequential verdict must be reproducible from `replay`:

| Field | Purpose |
|-------|---------|
| `retrieval_times` | When evidence was fetched |
| `source_identifiers` | URIs or stable IDs |
| `content_hashes` | SHA-256 where retention permitted |
| `extraction_method` | Parser, API, manual |
| `transformations` | Normalization steps |
| `agent_version` | Model + agent build |
| `tool_calls` | MCP/tool audit trail |
| `evidence_accepted` / `evidence_rejected` | Explicit inclusion/exclusion |
| `reviewer_decisions` | ATLAS/JADE/EVE/ZEUS/human |
| `degraded_states` | Operational failure visibility |

---

## 6. Failure states (degraded behavior)

| State | System behavior |
|-------|-----------------|
| `source_disappeared` | Retain hash + last-known metadata; verdict cannot upgrade |
| `page_changed` | Store both hashes if possible; flag `AUDIT_REQUIRED` |
| `timestamp_conflict` | Preserve both timestamps in `conflicts` |
| `artifact_not_retained` | `retention_status: hash_only` |
| `robots_txt_blocked` | Record block; do not bypass |
| `rate_limited` | Expose partial retrieval in `missing_evidence` |
| `media_unauthenticated` | `authenticity: unverified`; no canon path |
| `paywalled` | `retention_status: restricted` |
| `retrieval_incomplete` | Verdict capped at `CLARIFY` or `QUARANTINE` |

---

## 7. NO UI-DERIVED TRUTH enforcement

```
External claim → observation EPICON (this schema)
                      ↓ human + sentinel review
                 constitutional EPICON (epicon_constitutional_v1)
                      ↓
                 Civic Ledger
                      ↓
              Terminal / Browser Shell / HIVE (render only)
```

Renderers may display `QUARANTINE` / `CLARIFY` signals. They must not write back to canon without ledger path.

---

## 8. Test plan

**Implemented:** `tests/epicon-external-observation-schema.test.ts`

| Test case | Status |
|-----------|--------|
| EPICON-000 example validates against schema | ✅ |
| `counterfactuals` minItems enforced | ✅ |
| Trust states enum complete | ✅ |
| `CANON_ELIGIBLE` does not imply `verdict: PASS` | ✅ (policy test) |
| Circular citation kind exists | ✅ |
| Degraded states enum complete | ✅ |
| Claims cannot set `is_established_fact: true` | ✅ (const false) |
| Absence cannot set `implies_concealment: true` | ✅ (const false) |
| Conflict records require `preserved: true` | ✅ |

**Implementation follow-up (not in this PR):**

- Graph cycle detector for provenance
- Independence group collapse in agent runtime
- Terminal renderer component wiring
- Integration with EPICON Guard scope envelope for external-observation paths

---

*"We heal as we walk." — Mobius Systems*
