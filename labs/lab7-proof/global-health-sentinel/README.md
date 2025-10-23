# 🌍 Global Health Sentinel — Pulse Node A (Lab7)

Role: ingest trusted public-health + climate-health signals, run light scenario checks, and emit **verifiable pulse attestations** to the Civic Ledger / OAA.

## Pulse Cadence
- **06:00 ET** — Global scan (surveillance snapshot)
- **12:00 ET** — Mid-day update (trend deltas)
- **18:00 ET** — Reflection digest (for Reflections App + archival)

## Outputs
- `logs/pulse_YYYY-MM-DD.jsonl` — newline JSON records
- `attestations/attestation_YYYYMMDDThhmmss.json` — sealed payloads
- Optional POST → OAA (`/oaa/ingest/snapshot`) and Civic Ledger

## Data Channels (examples; configure via .env)
- WHO / regional public-health bulletins
- CDC/Eurostat/OurWorldInData time-series
- Climate signals (heat/cold waves, air quality, wildfire smoke)
- Mobility / seasonality proxies (holidays, school terms)
- Local sentinel notes (freeform analyst annotations)

> ⚠️ Only ingest sources you are permitted to query; store paraphrased metrics & derived signals (not entire datasets) unless licensed.

## Attestation Design
- Minimal personally-identifiable content; aggregated, de-identified metrics only.
- Each pulse includes a `fingerprint_sha256` over the structured payload.

## Integration
- **Citizen Shield (Lab6):** policy gate for what is allowed to be attested
- **OAA (Lab7):** receive + archive snapshots for reputation/traceability
- **Civic Ledger:** immutable proof of pulse issuance
- **Reflections (Lab4):** daily digest for human review

## Validation & Security
- **JSON Schema validation** against `schema/pulse.schema.json`
- **Citizen Shield pre-check** for policy compliance
- **Safe failure** — denied pulses are logged but not attested

## Usage

### Local Development
```bash
# Setup
make setup

# Run tests
make test

# Generate pulse
make pulse

# Validate schema
make validate
```

### Render Deployment
Create **Cron Jobs** for each pulse time:
- **06:00 ET:** `python global-health-sentinel/pulse_sentinel.py`
- **12:00 ET:** `python global-health-sentinel/pulse_sentinel.py`
- **18:00 ET:** `python global-health-sentinel/pulse_sentinel.py`

## Environment Variables
See `env.example` for full configuration options.

## Echo Bridge Integration
The Echo Bridge unifies service health + global health pulses:
```bash
make echo  # Includes latest global health pulse
```

## Output Example
```
[Pulse] 2025-10-13T12:00:00Z  SHA256=7a8e...b2f1  saved=attestations/attestation_20251013T120000.json
→ OAA post: 200  → Ledger post: 201
```

## Denial Example
```
[DENY] Citizen Shield pre-check failed:
 - epidemic[2]: confidence 0.3 < 0.5
 - climate_health[5]: region 'XX' not allowed
```
