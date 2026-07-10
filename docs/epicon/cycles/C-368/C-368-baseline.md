# C-368 Baseline — Witnessed Pre-State
**Captured:** 2026-07-10T13:42–13:48Z · **Witness:** ATLAS · **Purpose:** evidence anchor for the six-PR acceptance run. Every claim below was measured, not recalled.

## Headline deltas since C-367 close

1. **Rollout is COMPLETE.** All six federation repos have `epicon-guard.yml` on `main` — the C-367 PRs merged. Tags `v1` and `v1.1` resolve on `kaizencycle/epicon`. The federation is gated.
2. **epicon-api revealed itself.** Root now returns `{"ok":true,"service":"epicon-github-webhook"}` — it is the **Guard App webhook host**. This resolves PR 4's open question and selects PR 5's deployment branch: **converge on epicon-api, do not create a new service.** `/health` still returns `ok:false "not found"` (route missing — the fix is adding the route, not repairing logic).
3. **The rebuilt site is live** at epicon.mobius-substrate.com (title verified). Pages source flip: done. PR 6's checklist rider is already satisfied.

## Per-PR pre-state

### PR 1 — OAA mint auth
| Check | Baseline (13:47Z) | Target |
|---|---|---|
| Root manifest `jwt_configured` | **field absent** (was `false` on 2026-07-09) | `true` |
| `/api/debug/test-openai` | **404** (was exposed 2026-07-09) | 404 in prod |
| Version drift | root `0.4.0` vs openapi `0.1.0` | matched |

⚠️ **Do not assume PR 1 is done.** The manifest *field* disappearing and debug returning 404 may mean Cursor's work is landing — or that surfaces were renamed. Acceptance requires the **behavioral** test: anonymous completion must 401 and mint nothing. The harness tests behavior, not manifest claims — per I6, narrative never substitutes verification.

### PR 2 — GII canon alignment
Live thresholds (13:47Z): `healthy 0.9 / warning 0.75 / critical 0.6 / circuit_breaker 0.6` — **unchanged, drift confirmed present**. GII 0.92, minting enabled, multiplier 1.0. Target: `breaker 0.85 / reward_floor 0.90 / mint_gate 0.95`.

### PR 3 — CC0 ratification
`LICENSE` line 1: "GNU AFFERO GENERAL PUBLIC LICENSE" · `package.json`: `@epicon-guard/epicon`, `AGPL-3.0` · **13 files** match `git grep -il agpl`. Target: zero.

### PR 4 — epicon-api truthful health
`GET /health` → `{"ok":false,"error":"not found"}` · `GET /` → `{"ok":true,"service":"epicon-github-webhook"}` (200, 45 bytes). Target: `/health` 200 `ok:true` + version; root manifest gains `role`, `version`, endpoint list; source repo documented.

### PR 5 — Guard App Phase 1
`apps/guard-app/` and `packages/guard-core/` **on main** (merged PR #14). Deployment target: **epicon-api service**. Live host still **transport-only** until `APP_ID` + `PRIVATE_KEY` set on Render — wire PR pending. I2 behavioral test (edit intent without version bump → check fails) is a manual acceptance step.

### PR 6 — duplicate repo
`mobius-civic-ai-terminal-main`: deprecation README **merged** ([#1](https://github.com/kaizencycle/mobius-civic-ai-terminal-main/pull/1), 2026-07-10). Uniqueness check: **1 orphan init commit** — canonical is strict superset. **Not yet archived** — owner action: `gh repo archive kaizencycle/mobius-civic-ai-terminal-main --yes`.

### PR 7 — Reserve Block cold canon prime
`Mobius-Substrate/canon/reserve-blocks/`: **only `.gitkeep`** (no `.dat`, no `MANIFEST.json`). Terminal attests **349 blocks sealed** (~17,450 MIC) in hot KV. C-357 lane armed on main (`verify-dat-chain.js`, `reserve-block-canonization.yml`) but **workflow never fired**. Exporter exists at `mobius-civic-ai-terminal/scripts/canonize-reserve-blocks.ts`. Target: four `.dat` files + MANIFEST, chain verify green, canon-event posted (secrets permitting).

## Standing environment facts
- OAA responds in <1s when warm; a 13:42Z probe returned HTTP 000 (transient or spin-down) — if Render free-tier sleep applies to OAA, the identity-service cold-start pattern (C-357) will affect PR 1's auth calls too; consider keep-warm or paid instance as a follow-up.
- Guard-on-main status: Substrate ✅ CPC ✅ Terminal ✅ Browser-Shell ✅ Hive ✅ OAA ✅.
- Required-status-check binding: **not yet verified** — recommend binding Substrate + CPC now, report-only elsewhere for one calibration week (per C-367 close).
