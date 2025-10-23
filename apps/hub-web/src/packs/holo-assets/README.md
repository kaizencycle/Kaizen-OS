# Holo‑OAA (Web Hologram Librarian)

This pack adds a minimal hologram interface (like *The Time Machine* 2002 librarian).

## Files
- `pages/holo.tsx` — Three.js hologram + STT → OAA → TTS loop
- `ops/persona.oaa.yaml` — persona & safety cues
- `pages/api/holo/ledger.ts` — stub to forward turns to Civic Ledger
- `public/sfx/` — place optional UI sound effects

## Use
1. Drop into your Next.js app (Lab4-proof). Ensure `three` is installed.
   npm i three
2. Visit `/holo` and click **Ask**.
3. Replace the ledger API with your Civic Ledger enqueue.
4. (Optional) Enable WebXR / AR later; this 2D holo works in any browser.
