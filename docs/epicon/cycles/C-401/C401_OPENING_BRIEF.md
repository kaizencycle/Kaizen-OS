# C-401 Opening Brief

**Cycle:** C-401  
**Phase:** Track R Lineage Reconciliation  
**Date:** 2026-08-12  
**Custodian decision:** **APPROVE Option A (revised)** — component-coherent hybrid  
**Status:** Collision triage complete · ZEUS + EVE attestation pending · KV promotion not executed

---

## Opening state (post C-400)

| Surface | State |
|---------|-------|
| `vault:seal:latest` | `seal-C-372-002` (repaired) |
| Indexed seals | 360 |
| Collision pairs | 125 (123 contested positions) |
| Lineage components | 4 (see C-397 step 1 audit) |
| Sealing | Suspended (`SEAL_INTEGRITY_GATE`) |
| Fountain | Locked (GI sustain 0/5) |
| Block 361 | Blocked pending lineage adjudication |

C-400 repaired the **pointer**. C-401 adjudicates the **lineage**.

---

## Custodian decision (Option A — revised after Codex P1)

**Strategy:** `component_coherent_hybrid`

Naive “promote earliest dropped at every block” breaks chain continuity at block 41→42 (`seal-C-308-042` has `orphan_prev`; see `RESERVE_BLOCK_RECONCILIATION.md` step 1). Revised strategy uses **two segments**:

| Segment | Blocks | Rule | Rationale |
|---------|--------|------|-----------|
| **A** | 1–33 | Promote **dropped** (original live) | Demote C-359–C-371 recovery fork |
| **B** | 42–131 | Promote **kept** (C-339–C-358 fork) | Preserve component-1 spine continuity with clean blocks 34–41 |

**Three-way blocks (1, 2):** `seal-C-332-001`, `seal-C-333-002` (Segment A originals).

**Clean blocks (no action):** 34–41, 132–194 (71 positions).

**Explicit non-claims:**

- Blocks 42–131 kept cycles are C-339–C-358 (not C-359–C-372 recovery tranche).
- **Single chain 1–194 is not claimed** in step 6 — open boundaries at **41→42** and **131→132** (clean 132–194 on component-4 only). Full canon resolves at Track R **step 8**.

---

## Gate sequence

| Step | Owner | Deliverable | Status |
|------|-------|-------------|--------|
| 4 | ATLAS | `C401_COLLISION_RESOLUTION_TABLE.json` | ✅ This PR |
| 5 | ZEUS + **EVE** + Custodian | Attestation on revised logic | ⏳ Pending |
| 6 | Operator | `C401_TRACK_R_PROMOTION_SOP.md` | ⏳ After step 5 |
| 7 | Automation | Post-repair audit + gate lift | ⏳ After step 6 |
| 8 | Track R | `canonical_reserve_blocks` resolution | ⏳ After step 7 |

---

## References

- C-397 witness: `docs/epicon/cycles/C-397/C397_RESERVE_BLOCK_COLLISION_WITNESS.json`
- Track R gate: `docs/epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md`
- Resolution table: `docs/epicon/cycles/C-401/C401_COLLISION_RESOLUTION_TABLE.json`

**Seal:** C-401–OPEN–001
