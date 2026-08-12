# C-401 Track R Promotion SOP

**Cycle:** C-401  
**Phase:** Track R step 6 (guarded KV promotion)  
**Document seal:** C-401–TRACKR–SOP–001  
**Prerequisites:** ZEUS ADOPT + custodian approval + EPICON ledger attestation  
**Operator:** Custodian only (live Upstash KV)

---

## Preconditions (fail closed)

Do **not** execute until all are true:

1. ✅ C-400 vault pointer repair complete (`vault:seal:latest` = bare seal id string)
2. ✅ `C401_COLLISION_RESOLUTION_TABLE.json` merged with `approval_status: zeus_adopted`
3. ✅ ZEUS attestation filed on PR / catalog
4. ✅ Fresh collision audit confirms pair count still 125 (Track R step 1 re-run if stale)
5. ✅ C-373 `collisionRepair` guard deployed on terminal `main`

---

## Promotion model

**Read:** `docs/epicon/cycles/C-401/C401_COLLISION_RESOLUTION_TABLE.json` → `block_canonical`

**For each contested block `N`:**

1. Load current canonical pointer for block N (if any)
2. Set canonical lineage to `block_canonical[N].seal_id`
3. Mark re-attestation seals as witness-only (no deletion — bodies preserved in KV)
4. Record receipt per block in promotion witness log

**Do not:**

- Delete competing seal records
- Renumber blocks
- Write outside C-373 guarded repair transaction
- Lift `SEAL_INTEGRITY_GATE` before post-repair audit (step 7)

---

## Execution path (preferred)

Use terminal guarded repair — **not** ad-hoc curl:

```bash
# Terminal repo — after ZEUS approval merged
# Invoke C-373 collision repair with resolution table path
# See: mobius-civic-ai-terminal/lib/watchdog/collisionRepair.ts
#      docs/epicon/cycles/C-373/OPERATOR_C-373_vault-kv-lineage-recovery.md
```

If manual verification needed before guard run:

```bash
# Verify resolution table digest
sha256sum docs/epicon/cycles/C-401/C401_COLLISION_RESOLUTION_TABLE.json

# Verify vault pointer still healthy
curl -sS "${TERMINAL_BASE}/api/vault/status" | jq '.latest_seal_id, .seals_count, .status'
```

---

## Post-promotion audit (Track R step 7)

1. Re-run **Audit Reserve Block Lineage** workflow on terminal
2. Confirm: `hash_divergent_pair_count = 0` for adjudicated set
3. Confirm: chain continuity from genesis through block 360
4. File witness: `C401-COLLISION-PROMOTION-WITNESS.md` (terminal repo)
5. Only then request `SEAL_INTEGRITY_GATE` lift

---

## Rollback

If promotion introduces divergence:

1. Stop further writes immediately
2. File incident witness with last good `vault:seal:latest` + block pointers
3. Do **not** attempt silent rollback — use C-373 pre-repair snapshot manifest if available
4. Escalate to custodian + ZEUS before retry

---

## References

- Resolution table: `C401_COLLISION_RESOLUTION_TABLE.json`
- Track R gate: `docs/epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md`
- C-373 operator doc: `mobius-civic-ai-terminal/docs/epicon/cycles/C-373/`
- C-400 vault repair: `mobius-civic-ai-terminal/docs/C-400-VAULT-SEAL-REPAIR-WITNESS.md`

**License:** CC0 (Public Domain)
