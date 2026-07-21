# Federation Scan — Witness Table

**Scan ID:** ATLAS→FEDERATION_C-379_scan_v1  
**Captured:** 2026-07-21T15:00Z (UTC)  
**Agent:** ATLAS (cloud agent, live curl + git HEAD + config read)  
**Doctrine:** C-373 Witness Table — report discloses, repo witnesses; STALE is a first-class verdict.

## Authority Provenance

Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1 — custodian-issued ATLAS federation scan; documentation and journal opener only.

---

## Repo sync (git HEAD @ origin/main)

| Repo | HEAD | Last commit (UTC) | Verdict |
|------|------|-------------------|---------|
| Mobius-Substrate | `81ad7290` | 2026-07-21 14:55 | TRUE — active |
| mobius-civic-ai-terminal | `83a3ef68` | 2026-07-21 14:54 (PR #632 merge) | TRUE — active |
| Civic-Protocol-Core | `ed88a96` | 2026-07-21 14:23 | TRUE — active |
| mobius-browser-shell | `7a6fdc2` | 2026-07-21 12:54 | TRUE — active |
| mobius-hive | `7f8ad8d1` | 2026-07-21 14:23 | TRUE — active |

---

## Domain probes

| Domain | HTTP | Verdict | Notes |
|--------|------|---------|-------|
| https://mobius-substrate.com/ | 308 | TRUE | Root redirect (expected) |
| https://epicon.mobius-substrate.com/ | 200 | TRUE | |
| https://terminal.mobius-substrate.com/ | 200 | TRUE | |
| https://handbook.mobius-substrate.com/ | 200 | TRUE | |

---

## Service health

| Service | URL | Response | Verdict |
|---------|-----|----------|---------|
| Identity | `GET mobius-identity-service.onrender.com/health` | `status:ok`, `db_ok:true`, `db_write_ok:true` @ 2026-07-21T15:00:54Z | **TRUE — fix holding** |
| Wallet | `GET mobius-mic-wallet-service.onrender.com/health` | `status:ok`, `db_ok:true`, `db_write_ok:true` @ 2026-07-21T22:29Z | **TRUE — fix holding** (item 6 closeout) |
| Ledger API | `GET civic-ledger-api.onrender.com/health` | HTTP 404 `Not Found` | **TRUE — no public /health** |
| Terminal vault | `GET terminal.mobius-substrate.com/api/vault/status` | `ok:true`, `seals_count:360` @ 2026-07-21T15:00Z | TRUE |

**Wallet correction vs prior hypothesis:** Live response is **not** a cold-start timeout — the service answered immediately with a Postgres hostname resolution failure. Item 6 escalates to **Tier 2 diagnostic** ([CPC ticket](https://github.com/kaizencycle/Civic-Protocol-Core/blob/main/docs/epicon/cycles/C-379/TICKET_item-6_wallet-db-dns-mismatch.md)).

**Dashboard-vs-YAML theory (unconfirmed):** `render.yaml` declares `DATABASE_URL` as `sqlite:////var/lib/mic-wallet/mic_wallet.db`, but runtime uses `psycopg` against `dpg-d7deg2f41pts73a0djvg-a` (Render Postgres DNS). No `dpg-` string in `mic-wallet/app/main.py` — `os.getenv("DATABASE_URL", _DEFAULT_SQLITE_URL)`. Likely dashboard override or expired Postgres instance (possible C-352 recurrence); **check Render dashboard before any fix.**

---

## Standing backlog vs live evidence

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Identity login broken (C-357/C-358) | **STALE** | `Civic-Protocol-Core/render.yaml` lines 86–96: `identity-data` disk + `DATABASE_URL sync:false`. Live `/health`: `db_ok:true`, `db_write_ok:true`. |
| Cron over-frequency (C-354 KV budget) | **PARTIALLY STALE** | `mobius-civic-ai-terminal/vercel.json`: promote/heartbeat/sweep/swarm at `*/30 * * * *`. **Still open:** `kv-watchdog` at `*/10 * * * *` (144 runs/day) — item 12 P1. |
| Wallet crash-loop (cycle.json `open_flags`) | **PARTIALLY STALE** | Service responds; failure mode is **DB misconfiguration**, not crash-loop. Flag should be renamed/re-scoped. |
| Reserve Block canonization dormant (C-368) | **PARTIALLY STALE** | `canon/reserve-blocks/MANIFEST.json`: 194 blocks, `generated_at` 2026-07-12, `chain_tip_hash` present. Lane is running, not dormant. **Lag verdict retracted:** raw `seals_count` 360 is seal-index cardinality (125 collision pairs live); `canonical_reserve_blocks` is `null` / `unresolved` — compare MANIFEST only to **deduplicated unique `block_number` count** ([C368-PR7](../C-368/C368-PR7_prime-count-clarification.md)). |
| PR template sprawl | **TRUE** | Root `PULL_REQUEST_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE_C151.md`, `PULL_REQUEST_TEMPLATE/c150_mobius_habits.md`, plus per-app templates in `apps/eomm-api`, `labs/lab4-proof`. |
| Intent block manual-only (C-370) | **TRUE** | Schema enforced at merge by `epicon-guard`; no pre-check scaffold before Guard runs. |
| `cycle.json` vault snapshot | **STALE** | File cites `seals_count:319`; live API 360. Auto-sync bot carry-forward UNVERIFIED. |

---

## Canon lag snapshot

> **Codex P1 correction (2026-07-21):** An earlier draft compared `seals_count` (360) to
> `MANIFEST.total_blocks` (194) and claimed ~166 block lag. That counting model is wrong.
> `seals_count` is raw seal-index cardinality including collision-era duplicates; cold canon
> counts unique `block_number` slots. See [C368-PR7_prime-count-clarification.md](../C-368/C368-PR7_prime-count-clarification.md).

| Field | Value | Notes |
|-------|-------|-------|
| MANIFEST `total_blocks` | 194 | Deduplicated cold canon (2026-07-12) |
| MANIFEST `generated_at` | 2026-07-12T18:50:08Z | |
| Live `seals_count` | 360 | **Raw index records** — not comparable to MANIFEST |
| Live `collision_pair_count` | 125 | `/api/vault/status` → `reserve_block_truth` |
| Live `canonical_reserve_blocks` | `null` | `canonical_count_status: unresolved` |
| Deduplicated hot unique count | **UNVERIFIED** | Run `audit-reserve-block-collisions.ts` → `unique_block_count`; do not infer from `seals_count` |
| Estimated lag (dedupe − MANIFEST) | **UNVERIFIED** | Requires hot unique count; 360 − 194 is **not** valid |
| `chain_tip_hash` | `sha256:2ccc5e41…` | Present in MANIFEST; item 16 verifies vs live tip |

---

## Restraint row (this scan)

- Did **not** mutate production KV
- Did **not** apply Track R reconciliation
- Did **not** re-litigate C-370/C-371 Q2/Q3 dual-quorum repair
- Did **not** declare wallet fixed — upgraded finding to config incident
