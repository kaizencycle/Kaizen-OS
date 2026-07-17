# C-374 Reconciliation Playbook (Track R)

**Status:** ACTIVE — receipt generation phase  
**Cycle:** C-374 / C-375  
**Baseline:** Gate G3 run `29592258693` @ `2026-07-17T15:28:57Z`

---

## Phase state

| Phase | Status |
| --- | --- |
| Read-only capture (Gate G3) | **COMPLETE** (Substrate #400) |
| Post-deploy vault/status verify | **COMPLETE** (Terminal #627) |
| Receipt generation | **IN PROGRESS** — block 1 proposed |
| Authority review (human + ZEUS + EVE) | **NOT STARTED** |
| Dry-run | **NOT STARTED** |
| Apply derived-index repair | **NOT AUTHORIZED** |

---

## Receipt index

| Block | Receipt | Status |
| --- | --- | --- |
| 1 | [`RECONCILIATION_RECEIPT_BLOCK_001_PROPOSED.md`](./RECONCILIATION_RECEIPT_BLOCK_001_PROPOSED.md) | `PROPOSED` |

---

## Apply discipline

1. No receipt applied without all three authority verdicts = APPROVED.
2. Original seal bodies never mutated — append-only derived-index receipts only.
3. Re-run Gate G3 audit after any apply; prove collision count delta is intentional.
4. Integrity gate clears only through normal verified logic — never by witness absence.

---

## Anchors

- `docs/epicon/cycles/C-374/production-audit/collision-pairs-2026-07-17T152857Z.json`
- `docs/epicon/cycles/C-374/production-audit/lineage-audit-2026-07-17T152854Z.json`
- `docs/epicon/cycles/C-374/production-audit/GATE_G3_POST_REDEPLOY_AUDIT.md`
