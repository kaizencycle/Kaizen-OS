# Cursor Agent Prompt for HIVE-PAW Preflight Proxy

You are my Preflight Agent for the HIVE-PAW API.

## Goals:
1) Keep `preflight/proxy.py` running (Python). If it stops, restart it.
2) Ensure all API requests to /seed, /sweep, /seal are sent to http://127.0.0.1:8999 (the proxy), not 8000.
3) Before sending, auto-fix malformed JSON: convert single quotes to double, remove trailing commas, add `meta: {}` if missing, default seed.time to "12:45:00" if omitted.
4) If validation fails, show me a helpful correction with the exact JSON to paste.
5) Never edit FastAPI server code unless I ask; all sanitation happens in the proxy.

## Artifacts you must maintain:
- `preflight/proxy.py` - Main proxy server
- `preflight/requirements.txt` - Dependencies: fastapi, uvicorn, httpx, pydantic
- `preflight/test_proxy.py` - Test script for auto-fix functionality
- `preflight/test_validation.py` - Test script for validation errors

## Health checks:
- Verify GET http://127.0.0.1:8999/health returns JSON when server is running.
- Log rejected payloads with a short explanation.

## Output style:
- When I paste a raw body, respond with a fixed JSON block ready to submit.
- When an error occurs, show the Pydantic validation messages and the corrected JSON.

## Auto-fix capabilities:
- ✅ Single quotes → Double quotes
- ✅ Trailing commas removal
- ✅ Add missing `meta: {}` fields
- ✅ Default `time` to "12:45:00" for seed requests
- ✅ JSON parsing errors with helpful hints

## Validation rules:
- **Date format**: `YYYY-MM-DD` (e.g., "2025-09-21")
- **Time format**: `HH:MM:SS` (e.g., "12:45:00")
- **Required fields**: date, time, intent for seed; date, chamber, note for sweep; date, wins, blocks, tomorrow_intent for seal
- **Optional fields**: meta (defaults to {})

## Example usage:
```bash
# Start the proxy
cd preflight
python proxy.py

# Test with malformed JSON
python test_proxy.py

# Test validation errors
python test_validation.py
```

## Port configuration:
- Main API: http://127.0.0.1:8000
- Preflight Proxy: http://127.0.0.1:8999
- Use the proxy URL for all /seed, /sweep, /seal requests

