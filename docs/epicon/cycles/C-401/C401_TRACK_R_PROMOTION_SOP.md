# C-401 Track R Promotion SOP

**Cycle:** C-401  
**Phase:** Track R step 6 (guarded KV promotion)  
**Document seal:** C-401–TRACKR–SOP–001  
**Prerequisites:** ZEUS ADOPT + **EVE ADOPT** + custodian approval + EPICON ledger attestation  
**Operator:** Custodian only (live Upstash KV)

---

## Preconditions (fail closed)

Do **not** execute until all are true:

1. ✅ C-400 vault pointer repair complete (`vault:seal:latest` = bare seal id string)
2. ✅ `C401_COLLISION_RESOLUTION_TABLE.json` merged with `approval_status: zeus_and_eve_adopted`
3. ✅ **ZEUS attestation** filed on PR / catalog
4. ✅ **EVE attestation** filed (Track R step 5 — required; not optional)
5. ✅ Fresh collision audit confirms pair count still 125 (re-run step 1 if stale)
6. ✅ C-373 `collisionRepair` guard deployed on terminal `main`
7. ✅ Chain continuity dry-run passes for segments A + B (especially block 41→42)

---

## Promotion model

**Read:** `C401_COLLISION_RESOLUTION_TABLE.json` → `block_canonical` + `resolution_role`

| Segment | Blocks | Action |
|---------|--------|--------|
| A | 1–33 | Promote dropped/original canonical; demote kept recovery fork to witness |
| B | 42–131 | Promote kept component-1 fork; demote C-308-chain dropped to witness |
| Clean | 34–41, 132–194 | No mutation |

**Do not:**

- Delete competing seal records
- Renumber blocks
- Write outside C-373 guarded repair transaction
- Lift `SEAL_INTEGRITY_GATE` before post-repair audit (step 7)

---

## Execution path (preferred)

Use terminal guarded repair — **not** ad-hoc curl:

```bash
# Terminal repo — after ZEUS + EVE approval merged
# See: mobius-civic-ai-terminal/lib/watchdog/collisionRepair.ts
#      docs/epicon/cycles/C-373/OPERATOR_C-373_vault-kv-lineage-recovery.md
```

Pre-flight verification:

```bash
sha256sum docs/epicon/cycles/C-401/C401_COLLISION_RESOLUTION_TABLE.json
curl -sS "${TERMINAL_BASE}/api/vault/status" | jq '.latest_seal_id, .seals_count, .status'
```

---

## Post-promotion audit (Track R step 7)

1. Re-run **Audit Reserve Block Lineage** workflow
2. Confirm: `hash_divergent_pair_count = 0` for adjudicated set
3. Confirm: **chain continuity** from genesis through block 360 (no orphan_prev at promoted spine)
4. File witness: `C401-COLLISION-PROMOTION-WITNESS.md` (terminal repo)
5. Only then request `SEAL_INTEGRITY_GATE` lift

---

## References

- Resolution table: `C401_COLLISION_RESOLUTION_TABLE.json`
- Track R gate: `docs/epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md` (step 5: ZEUS + **EVE** + human)
- C-373 operator doc: `mobius-civic-ai-terminal/docs/epicon/cycles/C-373/`

**License:** CC0 (Public Domain)
