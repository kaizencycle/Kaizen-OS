# Lab4 — Reflections (Onboarding)

Mobile-friendly onboarding app with **companions** (Jade/Hermes/Eve/Zeus), a working **chat**, and **XP→GIC** via the GIC Indexer.

## Quickstart
1) Copy `.env.example` → `.env.local` and fill values.  
2) `npm i` then `npm run dev` (Next.js).  
3) Type a reflection → you get a reply and **XP** is posted to the **GIC Indexer**.

## Endpoints (server)
- `POST /api/reflect` → { user, text, companion } → { reply, xpGranted }
- `POST /api/unlock` → { user, companion, costGIC } → burns GIC for companion unlock
- `POST /api/auth/login` → { handle } → creates session
- `GET /api/me` → returns current user handle

## Env
- `OPENAI_API_KEY` for LLM (uses `gpt-4o-mini` by default)
- `GIC_INDEXER_URL`, `GIC_INDEXER_KEY` to award XP on each reflection
- `NEXT_PUBLIC_GIC_INDEXER_URL` used by client to show live balances
- `SESSION_PASSWORD` for iron-session (32+ char secret)

## Notes
- Sidebar collapses on mobile.  
- XP rule (MVP): `min(50, max(5, floor(chars/10)))`. Tune later.
- Dynamic pages: `/companion`, `/forest`, `/consensus` use `"use client"` and `export const dynamic = "force-dynamic"` to avoid Next.js prerender errors on Render.
- Auth: API calls go through `authedFetchJSON()` which always sends the session cookie and (optionally) an `Authorization: Bearer <token>` if `localStorage.bearer_token` exists. Your iron-session login protects routes; Bearer is available for future API endpoints that require it.
- Companion unlock costs 10 GIC by default.
- Uses localStorage for MVP companion unlocks (server-side persistence coming later).

### Auth
This app uses a simple **passwordless handle login** with `iron-session`.  
Protected routes: `/companion/**`.  
Set `SESSION_PASSWORD` to a strong 32+ char secret.

### GIC-Gated unlocks
The drawer shows an **Unlock new companion** card.  
Threshold default: **10 GIC** (tweak in `Unlocker`).