# C-401 Collision Pair Resolution Table

**Cycle:** C-401  
**Phase:** Track R Lineage Reconciliation (step 4)  
**Document seal:** C-401–COLLISION–RES–001  
**Custodian decision:** APPROVE Option A (`promote_original_seals`)  
**Prepared:** 2026-08-12  
**Machine-readable:** [`C401_COLLISION_RESOLUTION_TABLE.json`](./C401_COLLISION_RESOLUTION_TABLE.json)

---

## Summary

| Metric | Value |
|--------|------:|
| Source witness | C-397 `C397_RESERVE_BLOCK_COLLISION_WITNESS.json` |
| Collision pairs | 125 |
| Contested block positions | 123 |
| Three-way positions | 1, 2 |
| Clean positions | 71 |
| Re-attestation pattern match | 125/125 (100%) |
| Approval status | `pending_zeus_attestation` |

---

## Decision rule (Option A)

For each collision pair in the C-397 witness:

1. **Kept seal** (higher cycle, re-attestation recovery) → demote to **witness-only**
2. **Dropped seal** (earlier cycle, original live attestation) → promote to **canonical**
3. For three-way blocks, canonical is the **earliest** original among all candidates for that block

**Rationale:** Original live attestations predate the C-359–C-372 recovery tranche. Re-attestation preserved bodies but diverged lineage; earlier uncontaminated chain wins.

---

## Block-level canonical map (123 contested positions)

Each row is the single canonical seal per contested block. Full pair-level detail (125 rows) is in the JSON.

| Block | Canonical seal | Cycle | Sealed at (original) |
|------:|----------------|-------|----------------------|
| 1 | seal-C-332-001 | C-332 | 2026-06-05T04:51:24.579Z |
| 2 | seal-C-333-002 | C-333 | 2026-06-05T10:04:35.629Z |
| 3 | seal-C-333-003 | C-333 | 2026-06-05T15:50:53.934Z |
| 4–33 | seal-C-333/C-334/C-335/C-336/C-337/C-338-* | C-333–C-338 | See JSON `block_canonical` |
| 42–131 | seal-C-308/C-309/…/C-322-* | C-308–C-322 | See JSON `block_canonical` |

> **Note:** Blocks 34–41 and 132–194 are clean — no promotion required.

---

## Pair-level pattern (all 125)

Every pair follows:

```
kept_cycle ∈ {C-359 … C-372}  (re-attestation)
dropped_cycle ∈ {C-308 … C-338}  (original live)
candidate_canonical_seal = block_canonical[block_number].seal_id
decision_status = approved_pending_zeus
```

Example (block 42):

| Kept (witness) | Dropped → Canonical | Cycles |
|----------------|---------------------|--------|
| seal-C-339-042 | seal-C-308-042 | C-339 vs C-308 |

---

## Governance gates before KV promotion

- [ ] ZEUS attestation on resolution logic (`C401_ZEUS_ATTESTATION_REQUEST.md`)
- [ ] Custodian sign-off recorded (Option A — **done 2026-08-12**)
- [ ] EPICON ledger attestation filed
- [ ] Operator executes `C401_TRACK_R_PROMOTION_SOP.md` (C-373 guarded repair only)
- [ ] Post-repair audit: zero unresolved hash-divergent pairs

**No KV mutation from this document alone.**

---

## Witness statement

Generated programmatically from `C397_RESERVE_BLOCK_COLLISION_WITNESS.json`:

- ✓ 125 pairs ingested
- ✓ 123 block-level canonical choices derived (earliest original per block)
- ✓ 100% re-attestation pattern confirmed (`kept_cycle` > `dropped_cycle`)
- ✓ Three-way blocks 1–2 resolve to C-332/C-333 originals
- ✓ Custodian Option A applied

**License:** CC0 (Public Domain)
