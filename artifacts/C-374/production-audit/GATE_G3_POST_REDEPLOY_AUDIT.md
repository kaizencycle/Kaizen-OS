# Gate G3 — Post-Redeploy Production Audit

**Status:** CAPTURE COMPLETE — collision pair audit re-run post-redeploy; repair not started  
**Cycle:** C-374 (carried into C-375)  
**Witnessed at:** 2026-07-17T15:27:00Z (HTTP) + 2026-07-17T15:28:57Z (collision audit)  
**Operator:** Cloud agent (read-only HTTP capture) + custodian redeploy + GitHub Actions run `29592258693`  
**Deployed SHA:** `4ec90eaac24f62b4486daa8e28bf2764774f7c16` (Terminal PR #626 — C-373 collision evidence pack)

---

## Executive summary

The redeploy **fixed KV credential health** — `/api/health/kv-permissions` now reports full read/write/counter/list capability with zero errors. `snapshot-lite` and `quorum/state` respond normally.

**Gate G3 capture phase is complete.** Fresh collision and lineage audits were executed via GitHub Actions workflow **Audit Reserve Block Lineage** (run `29592258693`) against post-redeploy production KV. Results are **stable at 125 hash-divergent collision pairs** — identical to the pre-redeploy baseline (run `29502111885`, 2026-07-16). KV rotation did not change collision state (expected; no repair applied).

**Gate G3 is not fully closed** because:

1. **`/api/vault/status` returns HTTP 503 `kv_timeout`** — full vault aggregate scan times out against production KV.
2. **Production reconciliation/repair** remains a separate custodian track (not started).

---

## Witness table

| Step | Verdict | Evidence |
| --- | --- | --- |
| 1. KV permission health (post-rotation) | **PASS** | `kv-permissions-2026-07-17T152700Z.json` — `ok: true`, read/write/counter/list all true, `errors: []` |
| 2. `snapshot-lite` capture | **PASS** | `snapshot-lite-2026-07-17T152700Z.json` — HTTP 200, `kv.ok: true`, latency 15ms, cycle C-375 |
| 3. `quorum/state` reserve block | **PASS** | `sealed_blocks: 360`, `in_progress_block: 361`, `in_progress_pct: 100`, `latest_seal_id: null` |
| 4. `vault/status` capture | **FAIL** | `vault-status-2026-07-17T152700Z.json` — HTTP 503, `reason: kv_timeout`, all aggregate fields null |
| 5. Lineage audit (`audit-seal-hash-lineage.ts`) | **PASS** | `lineage-audit-2026-07-17T152854Z.json` — 319 attested, 4 lineages, 1 orphan_prev link issue |
| 6. Pair-count audit (`audit-reserve-block-collisions.ts`) | **PASS** | `collision-pairs-2026-07-17T152857Z.json` — **125** hash-divergent pairs, stable vs pre-redeploy |
| 7. Diff vs C-373 pre-repair bundle | **PASS** | Collision count unchanged (125); KV health improved |
| 8. Gate G3 capture row | **COMPLETE** | All read-only witness steps done; repair/reconciliation deferred |

---

## Fresh collision audit (post-redeploy)

| Field | Pre-redeploy (`29502111885`) | Post-redeploy (`29592258693`) | Delta |
| --- | --- | --- | --- |
| `audited_at` | 2026-07-16T13:25:43Z | 2026-07-17T15:28:57Z | +1 day |
| `operator_cycle` | C-374 | C-375 | Writer advanced |
| `raw_attested_count` | 319 | 319 | Unchanged |
| `unique_block_count` | 194 | 194 | Unchanged |
| `collision_count` | 125 | **125** | **Stable** |
| `hash_divergent_collisions` | 125 | **125** | **Stable** |
| `multiple_lineages` | true (4 components) | true (4 components) | Unchanged |
| `link_issues` | 1 (orphan_prev) | 1 (orphan_prev) | Unchanged |

**Interpretation:** The 125 hash-divergent pairs are a durable production state, not a transient artifact of stale credentials. Reconciliation remains P0 but is out of scope for this capture-only witness.

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
| Hash-divergent collisions | 125 (stale) | **125 (verified)** | Confirmed stable |

---

## Active production signals (not dismissed)

1. **`latest_seal_id: null`** with block 361 at 100% — candidate block ready but no latest seal pointer.
2. **`vault/status` kv_timeout** — likely full seal scan exceeds serverless timeout; investigate pagination or cached aggregate path.
3. **Integrity freshness 0.3** — GI suppression driver persists despite KV write health.
4. **Hash-divergent collisions (125 pairs)** — confirmed stable; seal integrity gate may still be blocking new seal formation until reconciliation.

---

## Custodian next steps (post-capture)

### A. Production reconciliation (separate track — NOT started)

Requires receipts, human + ZEUS + EVE approval, dry-run, then apply repair. See C-374 reconciliation playbook.

### B. Investigate vault/status timeout

Check whether `vault/status` needs a performance fix or can be replaced by `quorum/state` + collision JSON for ongoing witness purposes.

### C. Resolve block 361 / latest_seal_id

Block 361 at 100% with `latest_seal_id: null` — custodian decision on seal formation vs collision gate.

---

## Artifact manifest

| File | SHA256 |
| --- | --- |
| `integrity-status-2026-07-17T152700Z.json` | `8ef71bb94429b376bd88ec991fb6f1e29d560c542880a911d2c3cbe4bc16e5bd` |
| `kv-permissions-2026-07-17T152700Z.json` | `b03d06b248d9132f3ea7e1935b52df6a1982c1987e64dd9f9198d878fcd1505b` |
| `snapshot-lite-2026-07-17T152700Z.json` | `8fe76b2715ab11b37b04e7ff8c07fc100ef9f32841e0137d7660e827c0f226cb` |
| `vault-status-2026-07-17T152700Z.json` | `f5261982ebb5ddc3fb328a22b758bbaf9b5b80b4d8bcd4ab7c3b19c9e24b4352` |
| `lineage-audit-2026-07-17T152854Z.json` | `260c73b7bf744f4444fb69002245c9bd256b29fdedc9b39edd2a3ae362e7e1b7` |
| `collision-pairs-2026-07-17T152857Z.json` | `bc03a0ce3dfb849725164201043b50d6e4be6509431e1a707b0e21cd24295fbe` |

Workflow run: `https://github.com/kaizencycle/mobius-civic-ai-terminal/actions/runs/29592258693`

---

## Restraint row

- KV writes: NOT PERFORMED  
- Reconciliation receipt application: NOT PERFORMED  
- Collision repair: NOT PERFORMED  
- Gate G3 capture: **COMPLETE**  
- Gate G3 full close: **BLOCKED** on reconciliation + vault/status
