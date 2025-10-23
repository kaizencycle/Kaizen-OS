# HIVE-PAW API Examples (Using Preflight Proxy)

These examples use the **preflight proxy** on port 8999, which provides auto-fix and validation features.

## 🚀 **Copy-Ready POST Examples for Today (2025-09-20)**

### **1. Seed (via Preflight Proxy)**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8999/seed' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2025-09-20",
    "time": "09:00:00",
    "intent": "iterate",
    "meta": {}
  }'
```

### **2. Sweep (via Preflight Proxy)**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8999/sweep' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2025-09-20",
    "chamber": "LAB4",
    "note": "first sweep",
    "meta": {}
  }'
```

### **3. Seal (via Preflight Proxy)**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8999/seal' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2025-09-20",
    "wins": "seed+sweep working",
    "blocks": "none",
    "tomorrow_intent": "polish",
    "meta": {}
  }'
```

### **4. Get Ledger (via Preflight Proxy)**

```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/ledger/2025-09-20' \
  -H 'accept: application/json'
```

## 🔍 **Auto-Fix Examples (Malformed JSON)**

The preflight proxy will automatically fix these common mistakes:

### **Single Quotes → Double Quotes**
```bash
# This malformed JSON:
curl -X 'POST' 'http://127.0.0.1:8999/seed' \
  -H 'Content-Type: application/json' \
  -d "{'date': '2025-09-20', 'time': '09:00:00', 'intent': 'iterate', 'meta': {}}"

# Gets auto-fixed to:
# {"date": "2025-09-20", "time": "09:00:00", "intent": "iterate", "meta": {}}
```

### **Trailing Commas**
```bash
# This malformed JSON:
curl -X 'POST' 'http://127.0.0.1:8999/sweep' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2025-09-20", "chamber": "LAB4", "note": "first sweep", "meta": {},}'

# Gets auto-fixed to:
# {"date": "2025-09-20", "chamber": "LAB4", "note": "first sweep", "meta": {}}
```

### **Missing Time (Auto-Default)**
```bash
# This JSON missing time:
curl -X 'POST' 'http://127.0.0.1:8999/seed' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2025-09-20", "intent": "iterate", "meta": {}}'

# Gets auto-fixed to:
# {"date": "2025-09-20", "time": "12:45:00", "intent": "iterate", "meta": {}}
```

## ✅ **Daily Ledger Heartbeat Check**

### **Step 1: Verify the Ledger**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/verify/2025-09-20' \
  -H 'accept: application/json'
```

**What you're looking for:**
- `"ok": true`
- `"expected"` hash matches `"computed"` hash
- `counts` shows the right numbers (at least seeds: 1, sweeps: >=1, seals: 1)

### **Step 2: Export the Day (backup/archive)**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/export/2025-09-20' \
  -H 'accept: application/json'
```

**What you're looking for:**
- A JSON bundle containing **all the files** (seed.json, echo.json, seal.json, ledger.json)
- This means your day can be replayed or restored at any time

### **Step 3: Check Latest Ledger**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/ledger/latest' \
  -H 'accept: application/json'
```

**What you're looking for:**
- The date should be today (2025-09-20)
- The counts match what you saw in verify
- Links point to the right files

## 🚨 **Validation Error Examples**

If you send invalid data, you'll get helpful error messages:

### **Invalid Date Format**
```bash
curl -X 'POST' 'http://127.0.0.1:8999/seed' \
  -H 'Content-Type: application/json' \
  -d '{"date": "20-09-2025", "time": "09:00:00", "intent": "iterate", "meta": {}}'
```

**Response (422):**
```json
{
  "error": "Validation failed",
  "endpoint": "/seed",
  "issues": [
    {
      "field": "date",
      "message": "String should match pattern '^\\d{4}-\\d{2}-\\d{2}$'",
      "input": "20-09-2025"
    }
  ]
}
```

### **Missing Required Field**
```bash
curl -X 'POST' 'http://127.0.0.1:8999/seed' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2025-09-20", "time": "09:00:00", "meta": {}}'
```

**Response (422):**
```json
{
  "error": "Validation failed",
  "endpoint": "/seed",
  "issues": [
    {
      "field": "intent",
      "message": "Field required",
      "input": {
        "date": "2025-09-20",
        "time": "09:00:00",
        "meta": {}
      }
    }
  ]
}
```

## 🔄 **PowerShell Heartbeat Script**

Use the included `heartbeat.ps1` script for automated daily checks:

```powershell
# Run for today
.\heartbeat.ps1

# Run for specific date
.\heartbeat.ps1 -date 2025-09-20
```

## 🎯 **Benefits of Using the Preflight Proxy**

- ✅ **Auto-fixes common JSON mistakes**
- ✅ **Validates data before it reaches your API**
- ✅ **Provides helpful error messages**
- ✅ **Maintains all integrity features**
- ✅ **Zero impact on your main API code**

**Port Configuration:**
- Main API: `http://127.0.0.1:8000`
- Preflight Proxy: `http://127.0.0.1:8999` ← **Use this for all requests**
