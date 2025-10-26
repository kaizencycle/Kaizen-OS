# GIC Indexer API

Simple FastAPI service that indexes civic ledger events and exposes **GIC state**:
- `/supply` — total/circulating GIC, XP pool
- `/balances/{handle}` — XP, direct GIC, implied GIC (XP * ratio)
- `/events` — recent events
- `/scores/{handle}` — alias to balances (extendable)
- `/ingest/ledger` — POST events from the ledger (secured via `X-API-Key`)

## Run locally
```bash
cd civic-protocol-core/gic-indexer
python -m uvicorn app.main:app --reload
# open http://127.0.0.1:8000/docs
```

## Ingest examples
```bash
# XP award to user "michael"
curl -X POST http://127.0.0.1:8000/ingest/ledger \
  -H "Content-Type: application/json" -H "X-API-Key: $GIC_API_KEY" \
  -d '{"kind":"xp_award","amount":500,"unit":"XP","target":"michael","meta":{"source":"reflections"}}'

# Direct GIC grant
curl -X POST http://127.0.0.1:8000/ingest/ledger \
  -H "Content-Type: application/json" -H "X-API-Key: $GIC_API_KEY" \
  -d '{"kind":"grant","amount":5,"unit":"GIC","target":"michael","meta":{"program":"founders"}}'
```

## Query
```bash
curl http://127.0.0.1:8000/supply
curl http://127.0.0.1:8000/balances/michael
curl http://127.0.0.1:8000/events?limit=20
```

