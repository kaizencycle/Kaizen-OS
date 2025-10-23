# Closed-Loop Safety Pack

Bootstraps guardrails so your autonomous loop (Cursor agent → auto-merge → API generation → Deploy → Ledger) runs **safely**.

## Contents
- `ops/policy.json` — what agents may touch/call; limits, breakers, protected paths.
- `gateway/` — Express gateway with **HMAC** verification for agent-originated traffic.
- `openapi.yaml` — sample contract for gateway endpoints.
- `scripts/check_openapi.sh` — lints & diffs OpenAPI on PRs (breaking-change guard).
- `.github/workflows/closed_loop_safety.yml` — runs contract tests on PR; canary probe on demand.
- `lib/webDataScout.ts` — provider wrapper with a simple **circuit breaker**.

## Quick Start
1. **Policy** — review and tune `ops/policy.json` (domains, paths, rates, breakers).
2. **Gateway** — `gateway/server.ts`; set `GATEWAY_HMAC_SECRET` in env and deploy behind Render/Node.
3. **Contracts** — add/extend `openapi.yaml` for endpoints you expose. Commit.
4. **CI** — commit `.github/workflows/closed_loop_safety.yml`; PRs touching `openapi.yaml` will lint & diff.
5. **Canary** — set repo secrets `STAGING_HEALTH_URL` and `STAGING_METRICS_URL`. Trigger workflow **Run**.
6. **Scout** — use `lib/webDataScout.ts` in Lab7; it trips a basic breaker when failures spike.

## Notes
- Pair with your **Human-In-The-Loop Guard Pack** and **Auto-Merge Pulse**.
- Place **Civic Ledger** & **GIC** under protected paths; enforce manual seals.
- Consider adding Sigstore/GPG signing for agent commits.
