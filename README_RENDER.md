# Render IaC — Kaizen OS (Attest API)

This repo is deployable on Render via **Blueprints** using `infra/render.yaml`.

## 1) One-time setup

1. In Render: **New → Blueprint** → pick this repo/branch (`main`).

2. Confirm the service `kaizen-attest` is detected.

3. Set secrets (recommended as **Environment Group**):

   - `PYTHON_VERSION=3.11.9`

   - (Optional) `ALLOWED_ORIGINS=https://kaizen-portal.vercel.app,https://*.vercel.app`

4. Click **Apply** to provision.

## 2) Service details

- **Service:** `kaizen-attest` (type: `web`, env: `python`)

- **Build:** `pip install -r apps/api_attest/requirements.txt`

- **Start:** `uvicorn apps.api_attest.main:app --host 0.0.0.0 --port $PORT`

- **Health check:** `/healthz`

- **Region:** `oregon` (adjust if closer to Vercel region)

## 3) Pull Request Previews (recommended)

Enable PR previews so each GitHub PR spins up an ephemeral API:

- In Render → Service → **Settings** → **Pull Request Previews** → **Enabled**

- Render injects `RENDER_EXTERNAL_URL` for each preview

- Your Vercel **Preview** env can target the PR preview API (see env matrix below)

## 4) CORS

Set strict origins via env:

- `ALLOWED_ORIGINS=https://kaizen-portal.vercel.app,https://kaizen-portal-git-*.vercel.app`

FastAPI snippet:

```py
from fastapi.middleware.cors import CORSMiddleware

origins = (os.getenv("ALLOWED_ORIGINS","*").split(","))

app.add_middleware(CORSMiddleware,
    allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"])
```

## 5) Scaling & autosuspend

- **Plan:** starter is fine; bump on load

- **Autosuspend:** enable after N minutes idle (keeps costs low)

- **Min/Max instances:** 1/3 to start

## 6) Rollbacks

- **Render → Service → Events** → pick the last good deploy → Rollback

- Keep render.yaml changes small to make rollbacks predictable

## 7) Verification

```bash
# health
curl -s https://<your-render>.onrender.com/healthz

# attest smoke (example)
curl -s -X POST https://<your-render>.onrender.com/attest \
  -H 'content-type: application/json' \
  -d '{"media_hash":"test","c2pa":false,"watermark_ok":false,"declared_synthetic":true}'
```

## 8) Secrets policy

Never commit secrets. Use:

- **Environment Groups** (Render) for shared values

- `.env.example` in repo for developer hints

