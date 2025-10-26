# OAA Voice — Amazon Polly Adapter

Production-ready adapter for `/api/oaa/voice` using **AWS Polly**:
- Returns **audioUrl (data URL)** and **viseme timeline** mapped to your hologram sprites.
- Works with your existing `/holo` page and `HoloMouth` component.

## Install
1. Add dependency:
   ```bash
   npm i @aws-sdk/client-polly
   ```
2. Add env (Render/Vercel/Local):
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   POLLY_VOICE=Joanna
   POLLY_ENGINE=neural
   ```
3. Drop this folder into your project so that:
   - `pages/api/oaa/voice.ts` → re-exports the Polly adapter
   - `pages/api/oaa/voice/polly/index.ts` → main handler
   - `lib/visemeMap.ts` → Polly→UI mapping

## Response shape
```json
{
  "ok": true,
  "provider": "polly",
  "audioUrl": "data:audio/mpeg;base64,...",
  "visemes": [{"t":0,"v":"BMP"},{"t":80,"v":"A"}]
}
```

> For larger responses, you may prefer to stream audio via a dedicated route or pre-signed S3 URL. This demo uses a data URL for simplicity.

## Notes
- The viseme mapping is approximate but works well for sprite-based lipsync.
- You can swap `voice` via request body: `{ voice: "Matthew" }`.
- If you need SSML, pass `<speak>...</speak>` in `text` (ensure Polly engine & voice support).



