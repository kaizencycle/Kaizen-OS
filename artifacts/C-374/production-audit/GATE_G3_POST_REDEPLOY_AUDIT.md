# Gate G3 — Post-Redeploy Production Audit

**Status:** PARTIAL — KV credentials verified; collision pair audit not re-run  
**Cycle:** C-374 (carried into C-375)  
**Witnessed at:** 2026-07-17T15:27:00Z (UTC)  
**Operator:** Cloud agent (read-only HTTP capture) + custodian redeploy  
**Deployed SHA:** `4ec90eaac24f62b4486daa8e28bf2764774f7c16` (Terminal PR #626 — C-373 collision evidence pack)

---

## Executive summary

The redeploy **fixed KV credential health** — `/api/health/kv-permissions` now reports full read/write/counter/list capability with zero errors. `snapshot-lite` and `quorum/state` respond normally.

Gate G3 is **not yet closed** because:

1. **Fresh collision pair audit** was not executed post-redeploy (requires Terminal GitHub Actions `workflow_dispatch` or local `.env.local` with production KV).
2. **`/api/vault/status` returns HTTP 503 `kv_timeout`** — full vault aggregate scan times out against production KV.

---

## Witness table

| Step | Verdict | Evidence |
| --- | --- | --- |
| 1. KV permission health (post-rotation) | **PASS** | `kv-permissions-2026-07-17T152700Z.json` — `ok: true`, read/write/counter/list all true, `errors: []` |
| 2. `snapshot-lite` capture | **PASS** | `snapshot-lite-2026-07-17T152700Z.json` — HTTP 200, `kv.ok: true`, latency 15ms, cycle C-375 |
| 3. `quorum/state` reserve block | **PASS** | `sealed_blocks: 360`, `in_progress_block: 361`, `in_progress_pct: 100`, `latest_seal_id: null` |
| 4. `vault/status` capture | **FAIL** | `vault-status-2026-07-17T152700Z.json` — HTTP 503, `reason: kv_timeout`, all aggregate fields null |
| 5. `pnpm watchdog:collision-audit` | **NOT RUN** | No production KV creds in agent env; `workflow_dispatch` returned HTTP 403 |
| 6. Pair-count audit (`audit-reserve-block-collisions.ts`) | **NOT RUN** | Same credential gap |
| 7. Diff vs C-373 pre-repair bundle | **PARTIAL** | See comparison table below |
| 8. Gate G3 row | **PARTIAL** | Improved from BLOCKED (KV health) but collision pair count unverified post-redeploy |

---

## Production surface comparison

| Field | C-373 pre-repair (2026-07-16T00:31Z) | Post-redeploy (2026-07-17T15:27Z) | Delta |
| --- | --- | --- | --- |
| Deploy SHA | `09f1cab` | `4ec90ea` | PR #626 merged |
| Operator cycle | C-373 | C-375 | Writer advanced |
| `seals_count` (vault/status) | 360 | *timeout* | Endpoint degraded |
| `sealed_blocks` (quorum) | 360 | 360 | Unchanged |
| `in_progress_block` | 361 @ 73% | 361 @ **100%** | Block full, not sealed |
| `latest_seal_id` | null | null | Unchanged — still missing |
| KV lane (snapshot-lite) | ok, 4ms | ok, 15ms | Healthy |
| KV permissions | not probed | **all ops pass** | Redeploy success |
| GI (snapshot-lite) | 0.71 yellow | 0.63 yellow | Slightly lower |
| Integrity freshness | nominal | **0.3 degraded** | Regression signal |

---

## Collision count baseline (stale — pre-redeploy)

Last successful **pair-count** audit via GitHub Actions:

| Field | Value |
| --- | --- |
| Workflow run | `29502111885` (2026-07-16T13:25:43Z) |
| `hash_divergent_collisions` | **125** |
| `multiple_lineages` | true (4 components) |
| Operator cycle at audit | C-374 |

**This figure must be re-captured post-redeploy** before Gate G3 can close. The 125 count is consistent with temporal KV growth (+6 from C-370's 119); it is not verified against today's KV state.

---

## Active production signals (not dismissed)

1. **`latest_seal_id: null`** with block 361 at 100% — candidate block ready but no latest seal pointer.
2. **`vault/status` kv_timeout** — likely full seal scan exceeds serverless timeout; investigate pagination or cached aggregate path.
3. **Integrity freshness 0.3** — GI suppression driver persists despite KV write health.
4. **Hash-divergent collisions** — last known 125 pairs; seal integrity gate may still be blocking new seal formation.

---

## Custodian next steps (to close Gate G3)

### A. Re-run collision audit (5 minutes)

From GitHub → `mobius-civic-ai-terminal` → Actions → **Audit Reserve Block Lineage** → **Run workflow**.

Download artifacts `collision-audit.json` + `lineage-audit.json`. Commit to:

```
artifacts/C-374/production-audit/collision-pairs-<TS>.json
artifacts/C-374/production-audit/collision-groups-<TS>.json
```

### B. Or run locally

```bash
# mobius-civic-ai-terminal/.env.local with production KV_REST_*
pnpm watchdog:collision-audit -- --out ../Mobius-Substrate/artifacts/C-374/production-audit/collision-groups-<TS>.json
pnpm exec tsx scripts/audit-reserve-block-collisions.ts --json > ../Mobius-Substrate/artifacts/C-374/production-audit/collision-pairs-<TS>.json
```

### C. Investigate vault/status timeout

After collision audit, check whether `vault/status` needs a performance fix or can be replaced by `quorum/state` + collision JSON for Gate G3 witness purposes.

---

## Artifact manifest

| File | SHA256 |
| --- | --- |
| See `SHA256SUMS-2026-07-17T152700Z.txt` | — |

---

## Restraint row

- KV writes: NOT PERFORMED  
- Reconciliation receipt application: NOT PERFORMED  
- Collision repair: NOT PERFORMED  
- Gate G3: NOT closed (partial witness only)
