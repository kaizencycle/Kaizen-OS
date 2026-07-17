# Lane B — Gate G3 Production Collision Capture

**Status:** CAPTURE COMPLETE (post-redeploy 2026-07-17 — see `GATE_G3_POST_REDEPLOY_AUDIT.md`)  
**Cycle:** C-374  
**Witnessed at:** 2026-07-17T15:27:00Z (HTTP) + 2026-07-17T15:28:57Z (collision audit)  
**Operator:** Custodian redeploy + GitHub Actions run `29592258693`

---

## Witness Table

| Step | Verdict | Evidence |
| --- | --- | --- |
| 1. KV permission health | **PASS** | Post-redeploy: `kv-permissions-2026-07-17T152700Z.json` — read/write/counter/list all true. |
| 2. `snapshot-lite` + `quorum/state` | **PASS** | Deploy `4ec90ea`, cycle C-375, KV ok, 360 sealed blocks, block 361 at 100%. |
| 3. `vault/status` capture | **FAIL** | HTTP 503 `kv_timeout` — aggregate scan times out (2026-07-17T15:27Z). |
| 4. Lineage audit | **PASS** | `lineage-audit-2026-07-17T152854Z.json` — 319 attested, 4 lineages, GH Actions `29592258693`. |
| 5. Pair-count audit | **PASS** | `collision-pairs-2026-07-17T152857Z.json` — **125** hash-divergent pairs, stable vs run `29502111885`. |
| 6. Gate G3 capture row | **COMPLETE** | All read-only witness steps done; reconciliation deferred. |

---

## Collision audit summary

```
Workflow:  Audit Reserve Block Lineage
Run ID:    29592258693
Audited:   2026-07-17T15:28:57Z
Cycle:     C-375

raw_attested_count:          319
unique_block_count:          194
collision_count:           125
hash_divergent_collisions:   125
multiple_lineages:           true (4 components)
link_issues:                 1 (orphan_prev: seal-C-308-042)
```

Pre-redeploy baseline (run `29502111885`, 2026-07-16): identical counts. KV rotation did not alter collision state.

---

## Custodian next steps (post-capture)

1. **Production reconciliation** — receipts, human + ZEUS + EVE approval, dry-run, apply repair (separate track).
2. **Investigate `vault/status` kv_timeout** — performance fix or accept `quorum/state` + collision JSON as witness substitute.
3. **Resolve block 361 / `latest_seal_id: null`** — seal formation vs collision gate.

---

## Restraint row

- KV writes: NOT PERFORMED  
- Reconciliation receipt application: NOT PERFORMED  
- Collision repair: NOT PERFORMED
