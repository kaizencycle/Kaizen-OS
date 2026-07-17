# Lane B — Gate G3 Production Collision Capture

**Status:** PARTIAL (post-redeploy 2026-07-17 — see `GATE_G3_POST_REDEPLOY_AUDIT.md`)  
**Cycle:** C-374  
**Witnessed at:** 2026-07-17T15:27:00Z (UTC)  
**Operator:** Custodian redeploy + cloud agent read-only HTTP capture

---

## Witness Table

| Step | Verdict | Evidence |
| --- | --- | --- |
| 1. KV permission health | **PASS** | Post-redeploy: `kv-permissions-2026-07-17T152700Z.json` — read/write/counter/list all true. |
| 2. `snapshot-lite` + `quorum/state` | **PASS** | Deploy `4ec90ea`, cycle C-375, KV ok, 360 sealed blocks, block 361 at 100%. |
| 3. `vault/status` capture | **FAIL** | HTTP 503 `kv_timeout` — aggregate scan times out (2026-07-17T15:27Z). |
| 4. `pnpm watchdog:collision-audit` | **NOT RUN** | Requires custodian `workflow_dispatch` or local `.env.local` — agent lacks KV creds. |
| 5. Pair-count audit | **NOT RUN** | Last known: **125** hash-divergent pairs (GH Actions run `29502111885`, 2026-07-16). Stale until re-run. |
| 6. Gate G3 row | **PARTIAL** | KV rotation verified; collision pair count + vault/status still open. |

---

## Custodian checklist (agent-drafted — execute on keyboard)

```bash
# From mobius-civic-ai-terminal with production .env.local
TS=$(date -u +%Y-%m-%dT%H%M%SZ)
OUT=artifacts/C-374/production-audit
mkdir -p "$OUT"

pnpm watchdog:collision-audit -- --out "$OUT/collision-groups-${TS}.json"
# Pair-count gate (validates 125 hypothesis):
pnpm exec tsx scripts/audit-reserve-block-collisions.ts --json > "$OUT/collision-pairs-${TS}.json"

curl -sS "https://mobius-civic-ai-terminal.vercel.app/api/vault/status" > "$OUT/vault-status-${TS}.json"
curl -sS "https://mobius-civic-ai-terminal.vercel.app/api/terminal/snapshot-lite" > "$OUT/snapshot-lite-${TS}.json"

sha256sum "$OUT"/* > "$OUT/SHA256SUMS-${TS}.txt"
```

Commit artifacts with message recording SHA256 sums. **No mutation. No receipt application.**

---

## Restraint row

- KV writes: NOT PERFORMED  
- Reconciliation receipt application: NOT PERFORMED  
- Collision repair: NOT PERFORMED
