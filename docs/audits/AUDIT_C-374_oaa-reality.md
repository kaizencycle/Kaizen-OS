# AUDIT C-374 — OAA Reality (Read-Only)

**Cycle:** C-374 (2026-07-16)  
**Auditor:** ATLAS (engineering lane A2)  
**Ledger ID:** `mobius:oaa:charter-and-audit-c374`  
**Governing protocol:** [`docs/WITNESS_PROTOCOL.md`](../WITNESS_PROTOCOL.md)  
**Constraint:** Read-only — no fixes, no refactors, no deploy changes

**Witnessed at:** 2026-07-16T13:44:20Z (UTC)  
**Repo SHAs at audit time:**

| Repo | `origin/main^{}` |
| --- | --- |
| OAA-API-Library | `f7fafeff77e7f0de7091ed9768a8bee1f57e6c2f` |
| Mobius-Substrate | `5b0bdc350d2f838ec7550397af7d07c395d03b02` |

---

## Witness Table

| Claim | Verdict | Evidence |
| --- | --- | --- |
| `oaa.onrender.com` serves a live Next.js frontend (HTTP 200) | TRUE | `curl -sSL -w "HTTP %{http_code}" https://oaa.onrender.com/` → `HTTP 200`; `<title>OAA Console - Open Attestation Authority</title>` |
| Live console metadata matches lab7 reflections-app, not OAA-API-Library README vocabulary | TRUE | Live description: `Open Attestation Authority - STEM Apprenticeship Engine with LLM Stack Interface` — byte-match to `labs/lab7-proof/frontend/reflections-app/app/layout.tsx` metadata at Substrate `5b0bdc3` |
| `oaa.onrender.com` API routes respond | FALSE | All probed paths return Next.js 404 HTML: `/api/oaa/memory`, `/api/oaa/kv/latest`, `/api/eve/clockout-enhanced`, `/api/dev/ledger/verify`, `/api/kv-bridge/health` — all HTTP 404 |
| `oaa-api-library.onrender.com` FastAPI backend is live | TRUE | `curl -sSL https://oaa-api-library.onrender.com/health` → `{"ok":true,"ts":1784209493.124416}` HTTP 200 |
| Live backend OpenAPI identifies as OAA-API-Library v0.4.0 | TRUE | `curl -sSL https://oaa-api-library.onrender.com/openapi.json` → `"title":"OAA-API-Library","version":"0.4.0"` — matches `app/main.py` line 63 in OAA-API-Library at `f7fafeff` |
| `render.yaml` in OAA-API-Library declares `oaa-hub` + `oaa-api-backend` services | TRUE | `OAA-API-Library/render.yaml` lines 4–40 name `oaa-api-backend` (python) and `oaa-hub` (node) |
| `oaa-hub.onrender.com` and `oaa-api-backend.onrender.com` are reachable | FALSE | Both return `Not Found` HTTP 404 as of audit |
| Live deploy uses a single OAA-API-Library `render.yaml` blueprint as-is | FALSE | Live URLs (`oaa.onrender.com`, `oaa-api-library.onrender.com`) do not match blueprint service names; split across at least two services with different names |
| Exact Render repo/branch/commit SHA for `oaa.onrender.com` | UNVERIFIED | Render MCP workspace not selected this cycle; metadata correlation to lab7 reflections-app is strong but not ref-verified to a deploy SHA |
| Exact Render repo/branch/commit SHA for `oaa-api-library.onrender.com` | PARTIAL | OpenAPI title/version matches OAA-API-Library `app/main.py`; deploy SHA not independently witnessed |
| Prisma schema defines User/Auth/MICWallet persistence | TRUE | `OAA-API-Library/prisma/schema.prisma` — PostgreSQL provider, `DATABASE_URL` env |
| Production uses Prisma/PostgreSQL for OAA memory | UNVERIFIED | No production DB connection witnessed; memory API on frontend deploy is 404 |
| `OAA_MEMORY.json` fileStore is load-bearing in production | FALSE | Frontend memory API 404; `fileStore.ts` writes to ephemeral local disk — anti-pattern per charter §4 |
| `lib/crypto/hmac.ts` uses timing-safe comparison | TRUE | `verifyHmac()` uses `crypto.timingSafeEqual` at `OAA-API-Library/lib/crypto/hmac.ts:16` |
| Eve clock-in/out ancestral pattern exists in repo | TRUE | `data/eomm/2025-10-18-C108-clockin.json` (intent tags); `pages/api/eve/clockout-enhanced.ts` (HMAC + seal + fileStore) |
| `capability-gate/` is a salvageable routing precursor | TRUE-gap | `risk_matrix.json` defines tier policy (low→critical) with freeze windows; eval scripts present; no runtime integration witnessed in production |
| Agent loop guard is ancestral anti-loop discipline | TRUE-gap | `dev/loop_guard.json`, `docs/systems/AGENT_LOOP_GUARD_SUMMARY.md` — 12-step max, 180s timeout, noop limit 3; not load-bearing in production (dev routes 404 on live console) |
| Virtue Accords (Cycle 0) defined in repo | TRUE | `oaa-central-hub/companion_site_starter/public/constitution/virtue_accords.md` — draft Cycle 0; also referenced in README line 10 |
| Virtue Accords license disposition decided | FALSE | Marked `(Draft)` in source; custodian licensing sitting still OPEN per handoff |
| OAA-API-Library README still says "Open Autonomous Academy" | TRUE | README line 3 at `f7fafeff` |
| Legacy README banner safe to add (no live console code change) | TRUE | Banner is README-only; live console untouched; frontend serves static shell with no dependent API routes on same host |
| Active downstream dependents on OAA-API-Library README alone | NOT APPLICABLE | README banner does not change API contracts |
| **Restraint: no Academy/Elder/Library implementation** | TRUE | Zero feature code added this cycle — docs and README banner only |
| **Restraint: no extraction PRs from OAA-API-Library** | TRUE | Inventory only; no code ported |
| **Restraint: no live console deploy/env changes** | TRUE | Read-only curl probes; no Render writes |

---

## 1. Render deployment reality

### 1.1 Blueprint vs live

`OAA-API-Library/render.yaml` declares five service types:

- `oaa-api-backend` (Python/FastAPI)
- `oaa-hub` (Node/Next.js)
- `gic-gateway`
- `oaa-publish-worker`
- `civic-redis`

**Observed live services (curl, 2026-07-16):**

| URL | Status | Role |
| --- | --- | --- |
| https://oaa.onrender.com/ | 200 | Next.js OAA Console PWA shell |
| https://oaa-api-library.onrender.com/health | 200 | FastAPI backend (`OAA-API-Library` v0.4.0) |
| https://oaa-hub.onrender.com/ | 404 | Blueprint name not live |
| https://oaa-api-backend.onrender.com/health | 404 | Blueprint name not live |
| https://reflections-app.onrender.com/ | 200 | Different title: `Reflections AI Chat` |

**Disposition:** Live OAA is a **split deploy** — frontend console at `oaa.onrender.com` (lab7 reflections-app lineage) and Python API at `oaa-api-library.onrender.com`. The monorepo `render.yaml` blueprint does not map 1:1 to current live URLs.

### 1.2 Live backend endpoints (sample)

OpenAPI paths witnessed on `oaa-api-library.onrender.com`:

```
/health
/agents/register
/agents/query
/oaa/learn/submit
/api/tutor
/api/learning/modules
/api/learning/session/start
/api/learning/session/{session_id}/complete
/api/v1/wallet/balance
… (20 paths total)
```

No `/api/dev/ledger/verify` on live backend — that route exists only in the Next.js hub codebase (`pages/api/dev/ledger/`).

---

## 2. Persistence reality

| Store | Location | Production status |
| --- | --- | --- |
| File JSON memory | `OAA_MEMORY.json` + `src/lib/memory/fileStore.ts` | Not load-bearing on live frontend (API 404); ephemeral-disk anti-pattern |
| Prisma/PostgreSQL | `prisma/schema.prisma` | Schema present; `DATABASE_URL` binding in production UNVERIFIED |
| EOMM clock samples | `data/eomm/*.json` | Static seed data; ancestral pattern only |
| Redis | `render.yaml` → `civic-redis` | Declared in blueprint; live binding UNVERIFIED |

---

## 3. Subdirectory disposition

### 3.1 `capability-gate/`

Risk-tier matrix (`low` → `critical`) with freeze windows and `require_red_team` flags. Eval scripts (`run_evals.mjs`, `stage_rollout.mjs`) present. **Disposition:** ancestral Phase-3 Hub routing precursor — salvage policy scaffold, not runtime-integrated.

### 3.2 Agent loop guard

`dev/loop_guard.json` + `docs/systems/AGENT_LOOP_GUARD_SUMMARY.md`. Hard limits: 12 steps, 180s timeout, 3 noop repeats, 4-minute cooldown. **Disposition:** ancestral anti-loop discipline — salvage pattern for Hub guardrails; dev API routes not live on production console.

---

## 4. License reality

| License | Where | Status |
| --- | --- | --- |
| MIT | `OAA-API-Library/package.json` `"license": "MIT"` | Declared |
| Virtue Accords (Cycle 0) | `public/constitution/virtue_accords.md` | Draft — no SPDX identifier; custodian disposition OPEN |
| epicon AGPL question | Handoff open item | Custodian sitting required — out of scope this cycle |

---

## 5. Curl evidence log

```text
# 2026-07-16T13:44:20Z UTC
curl -sSL -w "root HTTP %{http_code}\n" https://oaa.onrender.com/
→ HTTP 200, title "OAA Console - Open Attestation Authority"

curl -sSL -w "memory HTTP %{http_code}\n" https://oaa.onrender.com/api/oaa/memory
→ HTTP 404 (Next.js not-found page)

curl -sSL https://oaa-api-library.onrender.com/health
→ {"ok":true,"ts":1784209493.124416} HTTP 200

curl -sSL https://oaa-api-library.onrender.com/openapi.json | jq '.info'
→ {"title":"OAA-API-Library","version":"0.4.0"}
```

---

## 6. Findings for C-375+

1. **Deploy lineage audit** — Render workspace access needed to witness exact repo/branch/SHA for `oaa.onrender.com` and `oaa-api-library.onrender.com`.
2. **Blueprint drift** — `render.yaml` service names do not match live URLs; reconcile or document intentional divergence.
3. **Split-stack integration** — Frontend has no API routes; backend is separate host — document `NEXT_PUBLIC_OAA_API_BASE` wiring or confirm intentional decoupling.
4. **Prisma production binding** — witness whether `DATABASE_URL` is set and migrations applied on live backend.
5. **Licensing sitting** — Virtue Accords + epicon AGPL in one custodian session.

---

## Dissent

None from auditor. Charter salvage table updated in `docs/OAA_CHARTER.md` §4 per counterfactual obligation.

---

*Report discloses; repo witnesses.*
