# 🌍 Health Sentinel — Pulse Node A (Lab7)

Role: monitor service health endpoints, run light scenario checks, and emit **verifiable pulse attestations** to the Civic Ledger / OAA.

## Pulse Cadence
- **Every 5 minutes** — Service health check
- **Alert threshold** — ≥2 services DOWN for 15+ minutes
- **Auto-attestation** — Optional posting to OAA and Civic Ledger

## Outputs
- `sentinel_logs/health_YYYY-MM-DD.jsonl` — newline JSON records
- `sentinel_logs/attestation_YYYYMMDDThhmmss.json` — sealed payloads
- Optional POST → OAA (`/oaa/ingest/snapshot`) and Civic Ledger

## Data Channels
- Lab4 (Reflections API)
- Lab6 (Citizen Shield)
- Lab7 (OAA)
- Civic Ledger Core
- GIC Indexer

## Attestation Design
- Minimal service health data; aggregated status only.
- Each pulse includes a `fingerprint_sha256` over the structured payload.

## Integration
- **OAA (Lab7):** receive + archive snapshots for reputation/traceability
- **Civic Ledger:** immutable proof of pulse issuance

## Usage

### Local Development
```bash
# One-shot run
python sentinel.py

# Continuous monitoring (every 5 minutes)
python sentinel.py loop
```

### Render Deployment
Create a **Background Worker** service:
- **Start command:** `python sentinel.py loop`
- **Environment variables:** Copy from `env.example`

### Cron Job
```bash
# Every 5 minutes
*/5 * * * * cd /path/to/lab7-proof && python sentinel.py >> sentinel_cron.log 2>&1
```

## Environment Variables
See `env.example` for full configuration options.

## Output Example
```
Health Sentinel Summary:
- Lab4: UP | latency=187.12 ms | err=None
- Lab6: UP | latency=201.85 ms | err=None
- CivicLedger: UP | latency=309.44 ms | err=None
- GICIndexer: UP | latency=254.70 ms | err=None
- Lab7: UP | latency=198.33 ms | err=None
Attestation fingerprint: 69f0...23ab
Attestation saved → sentinel_logs/attestation_20251013T115500.json
```

## Alerting
If ≥2 services are DOWN for ≥15 minutes:
```
[ALERT] 3 services DOWN for ≥15m: Lab4, GICIndexer, Lab7
```
(Optional webhook notification sent)

