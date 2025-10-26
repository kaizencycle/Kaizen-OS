# Citizen Shield — Lab6 App (Front-end)

A minimal React + Vite + TypeScript front-end for the **Lab6-proof (Citizen Shield)** API.

## ✨ Features
- **Onboarding (Twin Seals)**: Cycle‑0 Primer + Virtue Accords acceptance, posts to `/onboard` (if implemented) and saves locally as fallback.
- **Enroll**: POST `/enroll` to register a citizen/agent (name, citizenId, pubkey).
- **Zero‑Knowledge Verify**: POST `/zk/verify-reflection` with a reflection hash.
- **Group Status**: GET `/group/status`.

## 🚀 Quick Start

```bash
# 1) Install
npm install

# 2) Configure API base (optional; defaults to prod Render URL)
echo "VITE_LAB6_API=https://lab6-proof-api.onrender.com" > .env

# 3) Run
npm run dev
```

Open http://localhost:5173

## 🧭 Pages
- `/onboard` — Twin Seals acceptance (prevents drift; stores a local attestation if server endpoint not ready).
- `/enroll` — Register citizens/agents to the Shield.
- `/verify` — Verify reflection hashes with ZK endpoint.
- `/group` — View Shield group status.

## 🛡️ Notes
- The `/onboard` endpoint may not exist yet on your backend. The app will **store a local acceptance** and show a helpful message until you add it server-side.
- Set `VITE_LAB6_API` to point at staging/dev if needed.

