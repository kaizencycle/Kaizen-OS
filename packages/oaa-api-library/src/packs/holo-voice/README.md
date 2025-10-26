# Holo‑OAA Voice & Lip‑Sync Pack

Adds:
- `/api/oaa/voice` — provider‑agnostic TTS stub returning **viseme timeline** + mock audio URL.
- Minimal **viseme sprites** (`public/visemes/*.svg`): A, E, O, U, BMP, FV, L, S, REST.
- `components/HoloMouth.tsx` — animates mouth by visemes while audio plays.
- Upgraded `pages/holo.tsx` to call `/api/oaa/voice` and animate lip‑sync.

## Wire a real TTS provider
Replace `/api/oaa/voice.ts` body with your provider:
- **Amazon Polly** → request `SpeechMark` (visemes/phonemes) + audio stream.
- **Azure/Cognitive** → `VisemeReceived` events in SSML/WebSocket.
- **ElevenLabs** → alignment/phoneme timestamps (if enabled per voice).

Return JSON like:
```json
{ "ok": true, "audioUrl": "/signed/tts/audio.wav", "visemes": [{"t":0,"v":"BMP"}, {"t":80,"v":"A"}, ...] }
```

## Install
1) Unzip into your **Lab4-proof** project.
2) `npm i three` (if not already).
3) Visit `/holo` and click **Ask**.

## Notes
- The mock audio endpoint returns a 1s silent WAV so the `<audio>` element can play while sprites animate.
- Map your provider’s phonemes → these visemes for best results.

