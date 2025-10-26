# OAA Central Hub — Starter

This pack makes **OAA** the control center of your Labs.

## Files
- `oaa/hub.manifest.yaml` — registry of labs, tools, policy, logging
- `oaa/registry.ts` — lists labs & wraps tools (WebDataScout stub included)
- `oaa/hub.ts` — core plan/act functions with simple domain allowlist
- `oaa/server.ts` — Express server (optional, if not using Next.js)
- `pages/api/oaa/plan.ts`, `pages/api/oaa/act.ts` — Next.js API routes
- `components/OaaTab.tsx` — UI panel to trigger a plan & act, renders a live card
- `scripts/install_oaa_routes.sh` — quick installer (copies files into your repo)

## Usage
### Next.js / React
1) Copy files into your repo (or run `bash scripts/install_oaa_routes.sh .`).
2) Add `<OaaTab />` to your nav/tab page.
3) Provide a real `lib/webDataScout.ts` (from the Safety Pack) for live data.

### Standalone server
```bash
npm i express body-parser
ts-node oaa/server.ts
```

### Policy & Safety
- OAA enforces `ops/policy.json` allowlist for outbound URLs.
- Pair with **Closed-Loop Safety Pack** + **Human-In-Loop Guard Pack**.



