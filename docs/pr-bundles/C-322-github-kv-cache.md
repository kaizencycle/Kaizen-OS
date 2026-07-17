# C-322 · GitHub-Federated KV Cache

**Substrate PR:** `cursor/c322-github-kv-cache-de6f` on `Mobius-Substrate`  
**Terminal PR:** apply files from `docs/pr-bundles/mobius-civic-ai-terminal-c322/` to `mobius-civic-ai-terminal` (same branch name).

## Deploy order

1. **Merge Substrate first** — seeds `STATE/` on `main` so CDN reads work immediately.
2. **Vercel env** on Terminal:
   - `GH_CACHE_PAT` (or reuse `SUBSTRATE_GITHUB_TOKEN` with `contents:write` on Mobius-Substrate)
   - `GH_CACHE_OWNER=kaizencycle`
   - `GH_CACHE_REPO=Mobius-Substrate`
   - `GH_CACHE_BRANCH=main`
3. **Deploy Terminal** — copy/integration bundle below.

## Terminal file manifest

| Path in Terminal repo | Source in this bundle |
|----------------------|------------------------|
| `lib/github-cache.ts` | `docs/pr-bundles/mobius-civic-ai-terminal-c322/lib/github-cache.ts` |
| `lib/kv/store.ts` | `integrations/.../lib/kv/store.ts` |
| `lib/integrity/buildStatus.ts` | `integrations/.../lib/integrity/buildStatus.ts` |
| `app/api/cron/heartbeat/route.ts` | `integrations/.../app/api/cron/heartbeat/route.ts` |
| `app/api/cron/watchdog/route.ts` | `integrations/.../app/api/cron/watchdog/route.ts` |
| `app/api/cron/sweep/route.ts` | `integrations/.../app/api/cron/sweep/route.ts` |
| `app/api/cron/promote/route.ts` | `integrations/.../app/api/cron/promote/route.ts` |
| `app/api/terminal/shell/route.ts` | `integrations/.../app/api/terminal/shell/route.ts` |

## Invariant

No route outside heartbeat, gi-refresh, and micro-sweep may call `saveGIState()` on the read path.
`computeIntegrityPayload()` no longer writes GI when KV is cold — eliminates ~700 `gi:latest` writes/hr.

## Protocol

See `docs/protocols/github-federated-kv-cache.md`.
