# C-379 — 20 Optimizations Backlog

**Opened:** 2026-07-21  
**Source:** [FEDERATION_SCAN_WITNESS_TABLE.md](./FEDERATION_SCAN_WITNESS_TABLE.md)  
**Status key:** `open` | `closeout` | `in_progress` | `deferred`

| # | Item | Tier | Status | Target repo | Notes |
|---|------|------|--------|-------------|-------|
| 1 | Close identity-login incident | 1 | closeout | Substrate + CPC | STALE — live `db_ok:true`; remove from `cycle.json` `open_flags` on next bot sync |
| 2 | Close cron-frequency incident | 1 | closeout | Terminal | STALE — `*/30` normalized; document `kv-watchdog` `*/10` exception |
| 3 | Re-baseline Reserve Block canon status | 1 | open | Substrate | 194/360, ~166 lag — not dormant |
| 4 | Consolidate PR templates | 1 | open | Substrate | Archive C151 + c150 to `docs/archive/pr-templates/` |
| 5 | Sync per-app PR templates | 1 | open | Substrate | `apps/eomm-api`, `labs/lab4-proof` |
| 6 | Wallet service DB reconciliation | **2** | open | Civic-Protocol-Core | **Escalated** — Postgres DNS fail, not cold-start |
| 7 | Reserve-block canon-lag alert | 1 | open | Terminal | Warn when `seals_count - MANIFEST.total_blocks` > 50 |
| 8 | CI pre-check for parseable intent block | 1 | open | epicon + all repos | Fast-fail before Guard |
| 9 | Scaffold intent block generator | 1 | open | epicon | Addresses PR #597 class failures |
| 10 | Document intent schema in epicon-guard README | 1 | open | epicon | Valid/invalid examples |
| 11 | `infra/RENDER_DISK_CONVENTIONS.md` | 1 | open | Substrate + CPC | Extract render.yaml disk comments |
| 12 | Audit Vercel crons across all repos | 1 | open | federation | Terminal done; scan others |
| 13 | Ledger public `/health` endpoint | 1 | open | Civic-Protocol-Core | Currently 404 |
| 14 | Standardize health-check schema | 1 | open | CPC + identity + wallet | `status`, `db_ok`, `db_write_ok`, `timestamp` |
| 15 | `mint_authorization.code_enforced` doc note | 2 | open | Substrate | `configs/tokenomics.yaml` |
| 16 | Verify MANIFEST `chain_tip_hash` vs live tip | 2 | open | Substrate + Terminal | C-371 Q1 loop closure |
| 17 | De-duplicate Vercel build config patterns | 1 | deferred | Substrate | Low urgency |
| 18 | Witness Table fields in EPICON PR template | 1 | open | Substrate | Structural C-373 enforcement |
| 19 | Cycle ID in mesh-sync commit bodies | 1 | open | all repos | Cross-repo correlation |
| 20 | Publish this scan as C-379 opening record | 1 | **in_progress** | Substrate | This PR |

---

## Tier 2 gate

Items **6, 15, 16** require steward + benchmarks before code changes affecting ledger math or wallet durability.

## Follow-up PR map (suggested)

| PR scope | Items |
|----------|-------|
| Docs closeouts | 1–3, 20 |
| CPC infra | 6, 13–14 |
| Substrate templates/docs | 4–5, 11, 15, 18 |
| Terminal monitoring | 7, 16 |
| epicon tooling | 8–10 |
