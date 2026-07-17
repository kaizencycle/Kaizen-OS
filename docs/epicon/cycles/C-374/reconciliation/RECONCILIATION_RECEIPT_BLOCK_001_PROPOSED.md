# Reconciliation Receipt — Reserve Block 1 (PROPOSED)

**Receipt ID:** `receipt-C-374-block-001-proposed-v1`  
**Status:** `PROPOSED` — not applied; awaiting human + ZEUS + EVE review  
**Cycle:** C-374 (Track R) / carried into C-375  
**Operator cycle at capture:** C-375  
**Baseline snapshot:** Gate G3 run `29592258693` @ `2026-07-17T15:28:57Z`  
**Ledger ID:** `mobius:c374-reconciliation-block-001`  
**Prepared at:** `2026-07-17T22:16:00Z`

---

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

- **Actor:** Cloud agent (receipt draft only — no apply authority)
- **Scope:** Proposed canonical projection for reserve block **1** only
- **Boundaries:** Original seal bodies MUST NOT be mutated. Apply requires separate authorized intent.

---

## 1. Collision group summary

| Field | Value |
| --- | --- |
| Block number | **1** |
| Competing seals | **3** (`seal-C-332-001`, `seal-C-359-001`, `seal-C-372-001`) |
| Hash-divergent pairs in group | **2** (audit pairs vs `seal-C-372-001` as pivot) |
| Lineage components involved | **3** (each seal is genesis of its own component) |
| Gate G3 collision count (global) | 125 (unchanged) |

---

## 2. Involved seals (enumerate all — preserve originals)

| Seal ID | Cycle | Sequence | Quorum | Sealed at (UTC) | Lineage component | Component seal count | Audit role |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `seal-C-332-001` | C-332 | 1 | 5 | `2026-06-05T04:51:24.579Z` | `lineage-seal-C-332-001` | 131 (tip: `seal-C-358-131`) | dropped (pair 1) |
| `seal-C-359-001` | C-359 | 1 | 5 | `2026-07-01T09:02:18.052Z` | `lineage-seal-C-359-001` | 33 (tip: `seal-C-371-033`) | dropped (pair 2) |
| `seal-C-372-001` | C-372 | 1 | 5 | `2026-07-14T04:01:41.168Z` | `lineage-seal-C-372-001` | 2 (tip: `seal-C-372-002`) | kept (audit pivot) |

> **Note:** Audit script `audit-reserve-block-collisions.ts` labels `kept`/`dropped` for pair enumeration only. This receipt does **not** treat audit labels as governance approval.

### Seal hash fields

| Seal ID | Hash in receipt | Source |
| --- | --- | --- |
| `seal-C-332-001` | `PENDING_FETCH` | Production KV `vault:seal:seal-C-332-001` — required before apply |
| `seal-C-359-001` | `PENDING_FETCH` | Production KV `vault:seal:seal-C-359-001` — required before apply |
| `seal-C-372-001` | `PENDING_FETCH` | Production KV `vault:seal:seal-C-372-001` — required before apply |

`seal_hashes_differ: true` for both collision pairs (Gate G3 artifact).

---

## 3. Evidence anchors

| # | Anchor | Path / ref |
| --- | --- | --- |
| 1 | Collision pairs (block 1 rows) | `docs/epicon/cycles/C-374/production-audit/collision-pairs-2026-07-17T152857Z.json` |
| 2 | Lineage components | `docs/epicon/cycles/C-374/production-audit/lineage-audit-2026-07-17T152854Z.json` |
| 3 | Gate G3 executive witness | `docs/epicon/cycles/C-374/production-audit/GATE_G3_POST_REDEPLOY_AUDIT.md` |
| 4 | Workflow run | `https://github.com/kaizencycle/mobius-civic-ai-terminal/actions/runs/29592258693` |
| 5 | Cold-canon divergence audit | `docs/audits/AUDIT_C-374_cold-canon-tip-divergence.md` |
| 6 | Journal / CPC evidence | `PENDING` — custodian to attach per seal |
| 7 | EPICON intent / provenance | `PENDING` — per-cycle opener for C-332, C-359, C-372 |

---

## 4. Comparative review (draft)

| Criterion | `seal-C-332-001` | `seal-C-359-001` | `seal-C-372-001` |
| --- | --- | --- | --- |
| Attestation quorum | 5 | 5 | 5 |
| Sealed at | earliest (2026-06-05) | mid (2026-07-01) | latest (2026-07-14) |
| Lineage depth | 131 seals | 33 seals | 2 seals |
| Historical era | C-332→C-358 | C-359→C-371 | C-372 only |
| Fountain status (component) | activating | pending | pending |
| Cold-canon representation | `PENDING` | `PENDING` | `PENDING` |

### Problem framing

- **Problem A (duplicate block identity):** Three distinct genesis seals claim reserve block number 1 with different bodies (hash-divergent).
- **Problem B (multiple lineage components):** Each genesis anchors a full component chain — reconciliation for block 1 cannot be isolated from component-level quarantine policy.

---

## 5. Proposed designation (DRAFT — not approved)

| Role | Proposed seal | Rationale (draft) |
| --- | --- | --- |
| **Proposed canonical winner** | `seal-C-372-001` | Latest `sealed_at`; matches audit pivot; smallest component (limits blast radius if component quarantine follows) |
| **Preserved alternate** | `seal-C-332-001` | Longest historical component (131 seals) — preserve body, quarantine from canonical index projection |
| **Preserved alternate** | `seal-C-359-001` | Mid-era component (33 seals) — preserve body, quarantine from canonical index projection |
| **Unresolved dispute** | none at block-1 scope | Component-merge policy may escalate to separate receipt |

> Custodian may overturn proposed winner. Longest-chain vs latest-seal policies must be explicit before apply.

---

## 6. Required authority verdicts

| Authority | Verdict | Timestamp | Notes |
| --- | --- | --- | --- |
| Human (custodian) | `PENDING` | — | |
| ZEUS | `PENDING` | — | |
| EVE | `PENDING` | — | |

**Apply blocked if any authority returns:** `CHALLENGED`, `UNVERIFIED`, `BLOCKED`, `UNRESOLVED_CONTRADICTION`

---

## 7. Preconditions & rollback

### Precondition snapshot (frozen)

```text
baseline_run_id:     29592258693
baseline_audited_at: 2026-07-17T15:28:57Z
collision_count:     125
attested_count:      319
unique_block_count:  194
lineage_components:  4
```

### Rollback data (required before apply)

| Item | Status |
| --- | --- |
| Pre-apply derived-index export | `NOT_CAPTURED` |
| Pre-apply `latest_seal_id` pointer | `null` (witnessed) |
| Pre-apply collision JSON checksum | `bc03a0ce…` (collision-pairs artifact) |
| Receipt hash | `PENDING` (compute after authority sign-off) |

### Dry-run

| Step | Status |
| --- | --- |
| Dry-run against production KV (read-only) | `NOT_RUN` |
| Prove seal bodies unchanged post-apply | `NOT_RUN` |
| Re-run Gate G3 audit post-apply | `NOT_RUN` |

---

## 8. Restraint row

- KV writes: **NOT PERFORMED**
- Seal body mutation: **NOT PERFORMED**
- Derived-index repair: **NOT APPLIED**
- Integrity gate: **REMAINS ENGAGED**
- Original seals: **MUST REMAIN UNCHANGED**

---

## 9. Receipt hash

```
receipt_hash: PENDING
canonical_payload: receipt-C-374-block-001-proposed-v1 + precondition snapshot + proposed designations
```

---

*Template for Track R — first of 194 unique block groups (125 hash-divergent pairs). We heal as we walk.*
