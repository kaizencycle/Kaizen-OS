# Mobius Gateway (C-285)

Express BFF for **BYOK inference**: register encrypted provider keys, route normalized inference to OpenAI-compatible APIs, emit telemetry for Terminal.

## Run locally

```bash
# from repo root
npm ci
npm run build --workspace=@mobius/inference-schema
npm run build --workspace=@mobius/provider-adapters
npm run build --workspace=@mobius/gateway
MOBIUS_GATEWAY_BEARER=dev-secret MOBIUS_GATEWAY_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") npm start --workspace=@mobius/gateway
```

Default port **4050**.

## Environment

| Variable | Purpose |
|----------|---------|
| `PORT` | Listen port (default 4050) |
| `MOBIUS_GATEWAY_BEARER` | If set, require `Authorization: Bearer …` on mutating routes |
| `MOBIUS_GATEWAY_ENCRYPTION_KEY` | 32-byte hex (64 chars) or 32-byte base64 for AES-256-GCM key storage |
| `MOBIUS_GATEWAY_SECRET` | Fallback KDF input if encryption key not set (dev only) |
| `MOBIUS_LOCAL_OPENAI_BASE` | e.g. `http://127.0.0.1:11434` for Ollama OpenAI compatibility |
| `MOBIUS_GATEWAY_CORS_ORIGIN` | Comma-separated allowed origins |
| `MOBIUS_GATEWAY_RATE_LIMIT` | Requests per minute per IP (default 120) |

## API

- `GET /health`
- `POST /v1/providers` — register provider (body includes `api_key` once; stored encrypted in-memory for dev)
- `POST /v1/providers/:providerId/test` — probe connection (minimal chat; body: `{ "mobius_user_id" }`)
- `GET /v1/providers?mobius_user_id=…` — list providers (key refs redacted)
- `POST /v1/inference` — normalized inference (`mobius_user_id`, optional `provider_id`, full `MobiusInferenceRequest`; enforces `budget.daily_request_cap` when set)
- `GET /v1/telemetry` — summary + recent events (when bearer enabled)

## Client

Use `@mobius/mobius-sdk` `MobiusClient` pointing at this gateway.
