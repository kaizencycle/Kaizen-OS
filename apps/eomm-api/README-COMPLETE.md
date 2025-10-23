# 🚀 HIVE-PAW API - Complete Implementation

A **Merkle-rooted ledger system** with **preflight proxy validation** and **auto-fix capabilities** for daily productivity tracking.

## 🏗️ **Architecture Overview**

```
Client Request → Preflight Proxy (8999) → Main API (8000) → Response
                     ↓
                Auto-fix & Validate
```

- **Main API**: `http://127.0.0.1:8000` - Core ledger functionality
- **Preflight Proxy**: `http://127.0.0.1:8999` - Validation and auto-fix layer
- **Data Storage**: `./data/` - JSON files with Merkle root integrity

## 🚀 **Quick Start**

### 1. Start Both Services

```bash
# Terminal 1: Main API
uvicorn app.main:app --reload --reload-dir app

# Terminal 2: Preflight Proxy
cd preflight
python proxy.py
```

### 2. Use the Preflight Proxy

**Always use port 8999 for requests** - it provides auto-fix and validation:

```bash
# Instead of: http://127.0.0.1:8000/seed
# Use: http://127.0.0.1:8999/seed
```

## 📝 **Copy-Ready Examples (2025-09-20)**

### **1. Seed**
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

### **2. Sweep**
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

### **3. Seal**
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

### **4. Get Ledger**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/ledger/2025-09-20' \
  -H 'accept: application/json'
```

## 🔧 **Auto-Fix Examples**

The preflight proxy automatically fixes common JSON mistakes:

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

### **PowerShell Script**
```powershell
# Run for today
.\heartbeat.ps1

# Run for specific date
.\heartbeat.ps1 -date 2025-09-20
```

### **Manual Check Commands**

#### **Step 1: Verify Ledger Integrity**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/verify/2025-09-20' \
  -H 'accept: application/json'
```

**Expected Response:**
```json
{
  "ok": true,
  "expected": "abc123...",
  "computed": "abc123...",
  "counts": {
    "seeds": 1,
    "sweeps": 2,
    "seals": 1
  }
}
```

#### **Step 2: Export Day Bundle**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/export/2025-09-20' \
  -H 'accept: application/json'
```

#### **Step 3: Check Available Days**
```bash
curl -X 'GET' \
  'http://127.0.0.1:8999/index' \
  -H 'accept: application/json'
```

## 🔒 **Integrity Features**

### **Merkle Root Verification**
- Each day's ledger contains a `day_root` computed from: `merkle_root([sha256(seed), *sha256(sweeps), sha256(seal)])`
- `/verify/{date}` recomputes and compares the root
- Returns 409 if there's a mismatch (tampering detected)

### **File Structure**
```
data/
├── 2025-09-20/
│   ├── 2025-09-20.seed.json
│   ├── 2025-09-20.echo.json    # Array of sweeps
│   ├── 2025-09-20.seal.json
│   └── 2025-09-20.ledger.json  # Contains day_root
```

### **Validation Rules**
- **Date format**: `YYYY-MM-DD` (e.g., "2025-09-20")
- **Time format**: `HH:MM:SS` (e.g., "09:00:00")
- **Required fields**:
  - `/seed`: date, time, intent
  - `/sweep`: date, chamber, note
  - `/seal`: date, wins, blocks, tomorrow_intent
- **Optional fields**: meta (defaults to {})

## 🧪 **Testing**

### **Run All Tests**
```bash
# Integrity tests
python -m pytest tests/test_integrity.py -v

# Preflight proxy tests
cd preflight
python test_proxy.py
python test_validation.py
python demo.py
```

### **PowerShell API Test**
```powershell
.\test-api.ps1 -Date 2025-09-20 -Sweeps 3
```

## 📁 **Project Structure**

```
lab4-proof/
├── app/
│   ├── main.py              # Main FastAPI application
│   ├── hashing.py           # Merkle root and SHA-256 functions
│   ├── storage.py           # File operations and ledger building
│   └── models.py            # Pydantic models
├── preflight/
│   ├── proxy.py             # Preflight proxy server
│   ├── test_proxy.py        # Auto-fix tests
│   ├── test_validation.py   # Validation tests
│   ├── demo.py              # Complete demonstration
│   └── README.md            # Proxy documentation
├── tests/
│   └── test_integrity.py    # Integrity and tampering tests
├── data/                    # JSON data files
├── backups/                 # Exported ledger bundles
├── heartbeat.ps1            # Daily heartbeat check
├── test-api.ps1             # PowerShell API test script
└── curl-examples-proxy.md   # Copy-ready curl examples
```

## 🎯 **Key Benefits**

### **For Developers**
- ✅ **Auto-fixes common JSON mistakes**
- ✅ **Clear validation error messages**
- ✅ **Zero impact on main API code**
- ✅ **Easy to test and debug**

### **For Data Integrity**
- ✅ **Merkle root verification**
- ✅ **Tamper detection**
- ✅ **Immutable daily records**
- ✅ **Export/restore capabilities**

### **For Daily Workflow**
- ✅ **Simple API endpoints**
- ✅ **Automated heartbeat checks**
- ✅ **PowerShell integration**
- ✅ **Comprehensive documentation**

## 🚨 **Error Handling**

### **Validation Errors (422)**
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

### **Integrity Mismatch (409)**
```json
{
  "ok": false,
  "expected": "abc123...",
  "computed": "def456...",
  "counts_in_ledger": {"seeds": 1, "sweeps": 2, "seals": 1},
  "counts_computed": {"seeds": 1, "sweeps": 3, "seals": 1}
}
```

## 🔄 **Automation**

### **Windows Task Scheduler**
1. Open Task Scheduler
2. Create Task → "Run heartbeat.ps1" at 11:59 PM daily
3. Action = run:
   ```
   powershell.exe -ExecutionPolicy Bypass -File "C:\Users\mikej\Desktop\lab4-proof\heartbeat.ps1"
   ```

### **Daily Workflow**
1. **Morning**: Create seed with daily intent
2. **Throughout day**: Add sweeps for completed tasks
3. **Evening**: Seal the day with wins/blocks/tomorrow intent
4. **Night**: Automated heartbeat check verifies and exports

## 🎉 **Ready to Use!**

Your HIVE-PAW API is now fully operational with:
- ✅ **Merkle-rooted integrity**
- ✅ **Preflight validation**
- ✅ **Auto-fix capabilities**
- ✅ **Comprehensive testing**
- ✅ **Daily automation**
- ✅ **Complete documentation**

**Start using it today!** 🚀
