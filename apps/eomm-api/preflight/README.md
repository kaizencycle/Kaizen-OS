# HIVE-PAW Preflight Proxy

A Python-based proxy server that validates and auto-fixes JSON requests before forwarding them to the main HIVE-PAW API.

## Features

### 🔧 Auto-Fix Capabilities
- **Single quotes → Double quotes**: `{'key': 'value'}` → `{"key": "value"}`
- **Trailing commas removal**: `{"key": "value",}` → `{"key": "value"}`
- **Missing meta fields**: Automatically adds `"meta": {}` if missing
- **Default time**: Sets `"time": "12:45:00"` for seed requests if omitted
- **JSON parsing**: Handles malformed JSON with helpful error messages

### ✅ Validation Rules
- **Date format**: Must match `YYYY-MM-DD` pattern (e.g., "2025-09-21")
- **Time format**: Must match `HH:MM:SS` pattern (e.g., "12:45:00")
- **Required fields**:
  - `/seed`: date, time, intent
  - `/sweep`: date, chamber, note
  - `/seal`: date, wins, blocks, tomorrow_intent
- **Optional fields**: meta (defaults to {})

## Quick Start

### 1. Install Dependencies
```bash
pip install fastapi uvicorn httpx pydantic
```

### 2. Start the Proxy
```bash
cd preflight
python proxy.py
```

The proxy will start on `http://127.0.0.1:8999` and forward requests to `http://127.0.0.1:8000`.

### 3. Use the Proxy
Instead of sending requests directly to the main API, send them to the proxy:

```bash
# Instead of: http://127.0.0.1:8000/seed
# Use: http://127.0.0.1:8999/seed

curl -X POST "http://127.0.0.1:8999/seed" \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-09-21", "time": "12:45:00", "intent": "test", "meta": {}}'
```

## Testing

### Test Auto-Fix Functionality
```bash
python test_proxy.py
```

This tests:
- Valid JSON (should work)
- Malformed JSON with single quotes (auto-fixed)
- Missing fields (auto-fixed with defaults)
- Trailing commas (auto-fixed)

### Test Validation Errors
```bash
python test_validation.py
```

This tests:
- Invalid date format (should return 422)
- Invalid time format (should return 422)
- Missing required fields (should return 422)

## Example Requests

### Valid Seed Request
```json
{
  "date": "2025-09-21",
  "time": "12:45:00",
  "intent": "iterate",
  "meta": {}
}
```

### Auto-Fixed Seed Request (single quotes)
```json
{'date': '2025-09-21', 'time': '12:45:00', 'intent': 'iterate', 'meta': {}}
```
↓ **Auto-fixed to:**
```json
{"date": "2025-09-21", "time": "12:45:00", "intent": "iterate", "meta": {}}
```

### Auto-Fixed Seed Request (missing time)
```json
{"date": "2025-09-21", "intent": "iterate", "meta": {}}
```
↓ **Auto-fixed to:**
```json
{"date": "2025-09-21", "time": "12:45:00", "intent": "iterate", "meta": {}}
```

## Error Responses

### Validation Error (422)
```json
{
  "error": "Validation failed",
  "endpoint": "/seed",
  "issues": [
    {
      "field": "date",
      "message": "String should match pattern '^\\d{4}-\\d{2}-\\d{2}$'",
      "input": "21-09-2025"
    }
  ]
}
```

### JSON Parse Error (422)
```json
{
  "detail": "JSON decode error",
  "hint": "Use double quotes for keys/values and remove trailing commas.",
  "example": {
    "date": "2025-09-21",
    "time": "12:45:00",
    "intent": "iterate",
    "meta": {}
  }
}
```

## Architecture

```
Client Request → Preflight Proxy (8999) → Main API (8000) → Response
                     ↓
                Auto-fix & Validate
```

The proxy:
1. Receives requests on port 8999
2. Auto-fixes common JSON issues
3. Validates against Pydantic schemas
4. Forwards valid requests to main API on port 8000
5. Returns responses to client

## Files

- `proxy.py` - Main proxy server
- `requirements.txt` - Python dependencies
- `test_proxy.py` - Test auto-fix functionality
- `test_validation.py` - Test validation errors
- `CURSOR_AGENT_PROMPT.md` - Cursor AI agent instructions
- `README.md` - This documentation

