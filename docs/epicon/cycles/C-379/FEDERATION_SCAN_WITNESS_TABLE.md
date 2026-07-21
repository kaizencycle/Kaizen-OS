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
| Wallet | `GET mobius-mic-wallet-service.onrender.com/health` | `status:degraded`, `db_ok:false`, DNS error on Postgres host `dpg-d7deg2f41pts73a0djvg-a` | **TRUE — degraded (not spin-down)** |
| Ledger API | `GET civic-ledger-api.onrender.com/health` | HTTP 404 `Not Found` | **TRUE — no public /health** |
| Terminal vault | `GET terminal.mobius-substrate.com/api/vault/status` | `ok:true`, `seals_count:360` @ 2026-07-21T15:00Z | TRUE |

**Wallet correction vs prior hypothesis:** Live response is **not** a cold-start timeout — the service answered immediately with a Postgres hostname resolution failure. Item 6 escalates from warm-ping doc-closeout to **Tier 2 incident** until `DATABASE_URL` is reconciled with disk/SQLite intent in `Civic-Protocol-Core/render.yaml`.

---

## Standing backlog vs live evidence

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Identity login broken (C-357/C-358) | **STALE** | `Civic-Protocol-Core/render.yaml` lines 86–96: `identity-data` disk + `DATABASE_URL sync:false`. Live `/health`: `db_ok:true`, `db_write_ok:true`. |
| Cron over-frequency (C-354 KV budget) | **STALE (mostly)** | `mobius-civic-ai-terminal/vercel.json`: promote/heartbeat/sweep/swarm at `*/30 * * * *`. **Exception:** `kv-watchdog` at `*/10 * * * *` (intentional higher frequency). |
| Wallet crash-loop (cycle.json `open_flags`) | **PARTIALLY STALE** | Service responds; failure mode is **DB misconfiguration**, not crash-loop. Flag should be renamed/re-scoped. |
| Reserve Block canonization dormant (C-368) | **PARTIALLY STALE** | `canon/reserve-blocks/MANIFEST.json`: 194 blocks, `generated_at` 2026-07-12, `chain_tip_hash` present. Live `seals_count` 360 → **~166 block lag**. |
| PR template sprawl | **TRUE** | Root `PULL_REQUEST_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE_C151.md`, `PULL_REQUEST_TEMPLATE/c150_mobius_habits.md`, plus per-app templates in `apps/eomm-api`, `labs/lab4-proof`. |
| Intent block manual-only (C-370) | **TRUE** | Schema enforced at merge by `epicon-guard`; no pre-check scaffold before Guard runs. |
| `cycle.json` vault snapshot | **STALE** | File cites `seals_count:319`; live API 360. Auto-sync bot carry-forward UNVERIFIED. |

---

## Canon lag snapshot

| Field | Value |
|-------|-------|
| MANIFEST `total_blocks` | 194 |
| MANIFEST `generated_at` | 2026-07-12T18:50:08Z |
| Live `seals_count` (Terminal) | 360 |
| Estimated lag | **166 blocks** |
| `chain_tip_hash` | `sha256:2ccc5e41…` (present) |

---

## Restraint row (this scan)

- Did **not** mutate production KV
- Did **not** apply Track R reconciliation
- Did **not** re-litigate C-370/C-371 Q2/Q3 dual-quorum repair
- Did **not** declare wallet fixed — upgraded finding to config incident
