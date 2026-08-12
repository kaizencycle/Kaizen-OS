# C-401 Opening Brief

**Cycle:** C-401  
**Phase:** Track R Lineage Reconciliation  
**Date:** 2026-08-12  
**Custodian decision:** **APPROVE Option A** — promote original live seals to canonical  
**Status:** Collision triage complete · ZEUS attestation pending · KV promotion not executed

---

## Opening state (post C-400)

| Surface | State |
|---------|-------|
| `vault:seal:latest` | `seal-C-372-002` (repaired) |
| Indexed seals | 360 |
| Collision pairs | 125 (123 contested positions) |
| Sealing | Suspended (`SEAL_INTEGRITY_GATE`) |
| Fountain | Locked (GI sustain 0/5) |
| Block 361 | Blocked pending lineage adjudication |

C-400 repaired the **pointer**. C-401 adjudicates the **lineage**.

---

## Custodian decision (Option A)

**Strategy:** `promote_original_seals`

For each contested block, promote the **earliest original live attestation** (dropped seal in C-397 witness) to canonical. Demote re-attestation seals (kept; cycles C-359–C-372 and recovery tranches) to witness-only. Preserve all seal bodies — no deletion.

**Verified pattern:** 125/125 pairs have `kept_cycle` later than `dropped_cycle` (100% re-attestation match).

**Three-way blocks (1, 2):**

| Block | Canonical (proposed) | Witness-only |
|------:|----------------------|--------------|
| 1 | `seal-C-332-001` | `seal-C-359-001`, `seal-C-372-001` |
| 2 | `seal-C-333-002` | `seal-C-359-002`, `seal-C-372-002` |

**Clean blocks (no action):** 34–41, 132–194 (71 positions).

---

## Gate sequence

| Step | Owner | Deliverable | Status |
|------|-------|-------------|--------|
| 4 | ATLAS | `C401_COLLISION_RESOLUTION_TABLE.json` | ✅ This PR |
| 5 | ZEUS + Custodian | `C401_ZEUS_ATTESTATION_REQUEST.md` review | ⏳ Pending |
| 6 | Operator | `C401_TRACK_R_PROMOTION_SOP.md` execution | ⏳ After ZEUS |
| 7 | Automation | Post-repair audit + gate lift | ⏳ After step 6 |
| 8 | Track R | `canonical_reserve_blocks` resolution | ⏳ After step 7 |

---

## What unlocks after promotion

1. `SEAL_INTEGRITY_GATE` may lift after post-repair audit (Track R step 7)
2. Block 361 sealing can resume
3. GI reassessed on correct lineage
4. Fountain sustain watch (5 cycles at GI ≥ 0.95)

---

## References

- C-397 witness: `docs/epicon/cycles/C-397/C397_RESERVE_BLOCK_COLLISION_WITNESS.json`
- Track R gate: `docs/epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md`
- Resolution table: `docs/epicon/cycles/C-401/C401_COLLISION_RESOLUTION_TABLE.json`
- ZEUS request: `docs/epicon/cycles/C-401/C401_ZEUS_ATTESTATION_REQUEST.md`
- Promotion SOP: `docs/epicon/cycles/C-401/C401_TRACK_R_PROMOTION_SOP.md`

**Seal:** C-401–OPEN–001
