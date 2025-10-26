# Civic Stack — Outage-Resilient Starter (PWA + Edge + NATS)

This scaffold ships the core resilience patterns:
- Offline‑first PWA with **degraded mode** + queued writes
- Edge **/status.json** via Cloudflare Worker
- NATS for **delayed writes** + a replay worker
- Dual‑provider comms placeholders (SMS/Email)
- Simple health checks → auto‑fallback

## Quick start
### 0) Prereqs
- Node 18+, Docker, Cloudflare account (Workers), Optional: Twilio/Mailgun creds

### 1) Run NATS
```bash
docker compose -f services/nats/docker-compose.yml up -d
```

### 2) Web (Next.js PWA)
```bash
cd apps/web
npm i
npm run dev
```

### 3) Edge Worker
```bash
cd edge
npm i
npx wrangler dev
```

### 4) Replay Worker
```bash
cd services/replay
npm i
node replay-worker.js
```

## Drill
- Set `SIMULATE_DEGRADED=true` in `apps/web/.env.local` to force degraded mode.
- Queue writes, then start replay worker to drain when healthy.

