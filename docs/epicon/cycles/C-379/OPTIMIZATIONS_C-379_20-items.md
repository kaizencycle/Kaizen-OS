# C-379 — 20 Optimizations Backlog

**Opened:** 2026-07-21  
**Source:** [FEDERATION_SCAN_WITNESS_TABLE.md](./FEDERATION_SCAN_WITNESS_TABLE.md)  
**Status key:** `open` | `closeout` | `in_progress` | `deferred`

| # | Item | Tier | Status | Target repo | Notes |
|---|------|------|--------|-------------|-------|
| 1 | Close identity-login incident | 1 | closeout | Substrate + CPC | STALE — live `db_ok:true`; remove from `cycle.json` `open_flags` on next bot sync |
| 2 | Close cron-frequency incident | 1 | **partial closeout** | Terminal | **PARTIALLY STALE** — promote/heartbeat/sweep/swarm at `*/30`; `kv-watchdog` still `*/10` (144 runs/day). Item 12 must close the loop. |
| 3 | Re-baseline Reserve Block canon status | 1 | open | Substrate | Canon lane running (194 cold blocks, 2026-07-12). **Do not** compare raw `seals_count` to MANIFEST — see C-368 PR7 counting model. |
| 4 | Consolidate PR templates | 1 | open | Substrate | Archive C151 + c150 to `docs/archive/pr-templates/` |
| 5 | Sync per-app PR templates | 1 | open | Substrate | `apps/eomm-api`, `labs/lab4-proof` |
| 6 | Wallet service DB reconciliation | **2** | **partial closeout** | Civic-Protocol-Core | Connectivity ✅ + `disk_mounted:true` @ 23:09Z. Code/blueprint ✅ [#98](https://github.com/kaizencycle/Civic-Protocol-Core/pull/98)–[#101](https://github.com/kaizencycle/Civic-Protocol-Core/pull/101). **Durability ⏳ BLOCKING:** write must survive redeploy. |
| 7 | Reserve-block canon-lag alert | 1 | open | Terminal | Warn when **deduplicated unique `block_number` count** (from collision audit / `reserve_block_truth`) minus `MANIFEST.total_blocks` > threshold. **Not** `seals_count` — raw index includes collision duplicates per [C368-PR7](../C-368/C368-PR7_prime-count-clarification.md). |
| 8 | CI pre-check for parseable intent block | 1 | open | epicon + all repos | Fast-fail before Guard. Include **YAML parse** of fenced `intent` blocks (I1 checks presence only; CPC #94 Codex P2 caught dedented folded scalar breaking parse). |
| 9 | Scaffold intent block generator | 1 | open | epicon | Addresses PR #597 class failures |
| 10 | Document intent schema in epicon-guard README | 1 | open | epicon | Valid/invalid examples |
| 11 | `infra/RENDER_DISK_CONVENTIONS.md` | 1 | open | Substrate + CPC | Extract render.yaml disk comments |
| 12 | Normalize `kv-watchdog` cron + audit remaining Vercel crons | 1 | **P1** | Terminal + federation | **C-354 partially open:** `kv-watchdog` at `*/10` (144/day) while others at `*/30`. Audit all four other surfaces. |
| 13 | Ledger public `/health` endpoint | 1 | open | Civic-Protocol-Core | Currently 404 |
| 14 | Standardize health-check schema | 1 | open | CPC + identity + wallet | `status`, `db_ok`, `db_write_ok`, `timestamp` |
| 15 | `mint_authorization.code_enforced` doc note | 2 | open | Substrate | `configs/tokenomics.yaml` |
| 16 | Verify MANIFEST `chain_tip_hash` vs live tip | 2 | open | Substrate + Terminal | C-371 Q1 loop closure |
| 17 | De-duplicate Vercel build config patterns | 1 | deferred | Substrate | Low urgency |
| 18 | Witness Table fields in EPICON PR template | 1 | open | Substrate | Structural C-373 enforcement |
| 19 | Cycle ID in mesh-sync commit bodies | 1 | open | all repos | Cross-repo correlation |
| 20 | Publish this scan as C-379 opening record | 1 | **closeout** | Substrate | Merged [#410](https://github.com/kaizencycle/Mobius-Substrate/pull/410) + post-merge follow-ups on `main` |

### Post-audit extensions (2026-07-21 live GitHub review)

| # | Item | Tier | Status | Target repo | Notes |
|---|------|------|--------|-------------|-------|
| 21 | Micro signal layer cycle alignment | 1 | **P1** | Terminal | `/api/signals/micro` at C-306 while operator at C-379; composite GI non-authoritative until aligned |
| 22 | Unify `kv_keys.ok` vs `kv_keys_ok` resolver | 1 | **P1** | Terminal | ZEUS: probe true, derived flag false — single authoritative KV-health verdict |
| 23 | ZEUS dispute disposition workflow | 2 | open | Terminal + Substrate | Classify persistent/transient/resolved; record superseded CI comments (e.g. #410 EPICON bot FAIL) |

See [C-379_AUDIT_live-github-review.md](./C-379_AUDIT_live-github-review.md).

---

## Tier 2 gate

Items **6, 15, 16** require steward + benchmarks before code changes affecting ledger math or wallet durability.

## Follow-up PR map (suggested)

| PR scope | Items |
|----------|-------|
| Docs closeouts | 1–3, 20 |
| CPC infra | 6, 13–14 |
| Terminal cron hygiene | 12 (kv-watchdog `*/10` → `*/30` or documented exception) |
| Substrate templates/docs | 4–5, 11, 15, 18 |
| Terminal monitoring | 7, 16, 21–22 |
| ZEUS / governance | 23 |
| epicon tooling | 8–10 |
