# Mock Civic Ledger

A tiny dev server that pretends to be the Civic Ledger. Use for local or preview.

## Endpoints
- `POST /seal` → `{ title?, slug?, companion, sha256 }` → `{ ok, proof, ts }`
- `GET /proofs?companion&sha256` → `{ ok, proof|null }`
- `GET /recent?companion?` → dev helper
- `GET /health`

## Run
```bash
cp .env.example .env
npm i
npm run dev
# => listening on PORT (default 4000)
```

## Deterministic proof

proof = sha256( lowercase(hex(sha256)) + '|' + LEDGER_SECRET )

---

## 🔗 Wiring to your Hub (local)

In **OAA-API-Library/.env** set:

LEDGER_BASE_URL=http://localhost:4000
LEDGER_ADMIN_TOKEN=dev-token   # not validated by mock (placeholder)

Your existing **auto-seal** and **feed** code will now talk to the mock server.

---

## 🧪 Quick curl tests

```bash
# 1) Health
curl -s http://localhost:4000/health

# 2) Seal a post
SHA="0x$(echo -n 'hello world' | sha256sum | cut -d' ' -f1)"
curl -s -X POST http://localhost:4000/seal \
  -H 'content-type: application/json' \
  -d '{"title":"Test","slug":"hello","companion":"jade","sha256":"'"$SHA"'"}'

# 3) Lookup proof
curl -s "http://localhost:4000/proofs?companion=jade&sha256=$SHA"
```

---

## 🧭 Render preview (optional)

Add this to your render.yaml (infra repo or hub root) to run the mock in a preview env:

```yaml
- type: web
  name: mock-ledger
  env: node
  rootDir: services/mock_ledger
  buildCommand: npm ci
  startCommand: npm run start
  plan: starter
  autoDeploy: true
  envVars:
    - key: LEDGER_SECRET
      generateValue: true
```

Then set LEDGER_BASE_URL for your oaa-hub preview to the mock's URL.

---

## ✅ Merge checklist
- Add folder to repo and commit on feature/mock-ledger
- npm i && npm run dev in services/mock_ledger
- Update OAA-API-Library/.env (LEDGER_BASE_URL=http://localhost:4000)
- Test:
  - /api/posts/seal → uses mock → returns proof
  - /api/companions/feed → can lookup proofs via mock
  - Auto-seal workflow: run locally or trigger in preview with mock URL

