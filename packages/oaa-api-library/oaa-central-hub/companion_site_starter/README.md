# Companion Site Starter

Spin up a hosted home for each AI Companion (Next.js). Includes a hologram page and secure tool endpoints.

## Quickstart
```bash
npm i
npm run dev
# open http://localhost:3000
```

## Endpoints
- `GET /api/tools/status` → basic health
- `POST /api/tools/ping`   → echoes text (HMAC optional)

Include header `x-citizen-sig: <hex>` = HMAC-SHA256(body, GATEWAY_HMAC_SECRET).

## Env
Create `.env`:
```
COMPANION_NAME=Zeus
GATEWAY_HMAC_SECRET=change-me
```

## Deploy (Render)
1. Create a **Web Service** from this repo.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Add env vars above.

## Notes
- Hologram lives at `/holo` and uses browser STT/TTS for a quick demo.
- Swap in your real voice adapter (`/api/oaa/voice`) and Citizen Shield gateway when ready.

