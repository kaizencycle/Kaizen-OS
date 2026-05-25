# GitHub-Federated KV Cache (C-322)

**Status:** Active  
**Cycle:** C-322  
**Repos:** `Mobius-Substrate` (cold store), `mobius-civic-ai-terminal` (hybrid read/write)

## Problem

Upstash Redis budget suspension (2026-05-25) from redundant writes of slow-changing keys
(`gi:latest`, `gi:trend`, `mic:readiness:snapshot`, `terminal:last-known-snapshot`) across
8+ HTTP routes — hundreds of writes per hour for values that change every 5 minutes.

## Tiered cache

| Tier | Store | Latency | Cost |
|------|--------|---------|------|
| L1 | Vercel function memory | ~0ms | Free |
| L2 | Upstash (hot, atomic/session only) | ~20ms | Metered |
| L3 | `raw.githubusercontent.com` CDN | ~100ms | Free |
| L4 | GitHub Contents API commit | ~300ms | Free tier |

## Canonical paths (Mobius-Substrate)

```
STATE/
  gi/latest.json
  gi/trend.json
  mic/readiness.json
  terminal/last-known-snapshot.json
  terminal/heartbeat-last.json
  watchdog/epicon-escalation.json
  zeus/dispute-latest.json
  vault/meta.json
  vault/balance.json
```

Federation: domain-specific repos may add their own `STATE/` trees; Terminal reads Substrate
for integrity/MIC/vault; Terminal-local keys stay under `mobius-civic-ai-terminal/STATE/` when added.

## Write ownership (invariant)

Only these writers may persist `gi:latest` / `gi:trend` to durable store:

- `/api/cron/heartbeat` — GI trend append, last-known snapshot, optional full GI mirror
- `/api/cron/gi-refresh` — `recomputeAndSaveGIState`
- Micro sweep — `saveGiStateFromMicroSweep`

All other routes (shell, snapshot, integrity-status, chambers, echo digest) are **read-only**
for GI — use `loadGIState()` (KV → GitHub fallback) or `resolveGiForTerminal()`.

## Environment (Terminal / Vercel)

```bash
GH_CACHE_PAT=ghp_...          # contents:write on Mobius-Substrate
GH_CACHE_OWNER=kaizencycle
GH_CACHE_REPO=Mobius-Substrate
GH_CACHE_BRANCH=main
```

`SUBSTRATE_GITHUB_TOKEN` or `GITHUB_TOKEN` may substitute when scopes allow.

## Keys that stay in Upstash

- EPICON dedup (short TTL, race-sensitive)
- `ledger:circuit_open`
- `mic:quorum:*` (atomic multi-agent)
- `swarm:budget:daily:spent` (INCRBYFLOAT)
- Session/auth state

## Package

`@mobius/github-cache` in `packages/github-cache` — shared `ghRead` / `ghWrite` for agents and services.

---

*We heal as we walk.*
