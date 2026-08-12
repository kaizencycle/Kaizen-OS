# C-401 Collision Pair Resolution Table

**Cycle:** C-401  
**Phase:** Track R Lineage Reconciliation (step 4)  
**Document seal:** C-401–COLLISION–RES–001  
**Custodian decision:** APPROVE Option A revised (`component_coherent_hybrid`)  
**Machine-readable:** [`C401_COLLISION_RESOLUTION_TABLE.json`](./C401_COLLISION_RESOLUTION_TABLE.json)

---

## Summary

| Metric | Value |
|--------|------:|
| Collision pairs | 125 |
| Contested block positions | 123 |
| Three-way positions | 1, 2 |
| Clean positions | 71 |
| Strategy | `component_coherent_hybrid` |
| Approval status | `pending_zeus_and_eve_attestation` |

---

## Decision rule (revised Option A)

### Segment A — blocks 1–33 (33 positions)

Promote **dropped** seal (original live attestation). Demote kept seals from C-359–C-371 recovery fork.

Examples: block 1 → `seal-C-332-001`; block 3 → `seal-C-333-003`.

### Segment B — blocks 42–131 (90 positions)

Promote **kept** seal (C-339–C-358 component-1 fork). Do **not** promote C-308-chain dropped seals — `seal-C-308-042` is `orphan_prev` and breaks continuity with clean block 41.

Example: block 42 → `seal-C-339-042` (kept), not `seal-C-308-042` (dropped).

### Clean blocks — 34–41, 132–194

No promotion entries in `block_canonical`. Existing sole attestations stand.

---

## Lineage anchor (C-397 step 1)

| Component | Span | Notes |
|-----------|------|-------|
| 1 | C-332-001 → C-358-131 | Blocks 1–131 |
| 4 | C-308-042 → C-332-194 | Blocks 42–194; **orphan_prev at 42** |

**Open boundaries** (documented in JSON `lineage_anchors.boundary_risks`):

| Edge | Issue | Mitigation |
|------|-------|------------|
| 41→42 | C-308-042 `orphan_prev` if component-4 dropped promoted | Segment B promotes kept at block 42 |
| 131→132 | Segment B tip (`seal-C-358-131`, component-1) may not link to clean block 132 (component-4 only) | Document open; step 7 = segment-local audit; step 8 = full canon |

**Do not claim** single continuous chain 1–194 until Track R step 8. Clean blocks 132–194 remain on component-4 attestations unchanged.

---

## Honest pattern statistics

| Segment | Pairs | Rule | Kept cycle later than dropped |
|---------|------:|------|-------------------------------:|
| A (1–33) | 35 | Promote dropped | 35/35 |
| B (42–131) | 90 | Promote kept | 90/90 |

**Do not claim** “125/125 re-attestation tranche C-359–C-372.” Segment B kept cycles are C-339–C-358; promotion rationale is **chain continuity**, not recovery-tranche classification.

---

## Governance gates before KV promotion

- [ ] ZEUS attestation (`C401_ZEUS_ATTESTATION_REQUEST.md`)
- [ ] **EVE attestation** (Track R step 5 requirement)
- [ ] Custodian sign-off (Option A revised — **recorded 2026-08-12**)
- [ ] EPICON ledger attestation
- [ ] Operator executes `C401_TRACK_R_PROMOTION_SOP.md`
- [ ] Post-repair audit: **segment-local** continuity + zero hash-divergent pairs (full 1–194 canon = step 8)

## Witness timestamp fields (JSON)

Each collision row preserves both C-397 witness timestamps:

- `witness_kept_sealed_at` — kept seal time (always from witness)
- `witness_dropped_sealed_at` — dropped seal time (always from witness)
- `canonical_sealed_at` — promoted seal only (Segment A = dropped; Segment B = kept)

The deprecated `re_attest_sealed_at` field was removed to avoid Segment B collisions.

**No KV mutation from this document alone.**
