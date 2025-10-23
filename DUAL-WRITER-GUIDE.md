# 🧪 Dual Writer System - Lab4 Research & Study

## Overview

The dual-writer system automatically creates both **JSON** and **Markdown** versions of smoke test results, perfect for your CommandLedgerII and DLA archiving workflow.

## Features

- ✅ **Dual Format Output**: Creates both `.json` and `.md` files
- 🔐 **SHA-256 Integrity**: Returns hashes for both files
- 📁 **Organized Storage**: Saves to `data/{DATE}/` directory
- 🎯 **Lab4 Integration**: Designed for Research & Study workflow
- 📊 **Rich Metadata**: Includes custodian logs, test results, and archive paths

## Quick Start

### 1. PowerShell Script (Recommended)

```powershell
# Run comprehensive Lab4 smoke test
.\lab4-smoke-test.ps1 -Date 2025-09-25

# Or use today's date
.\lab4-smoke-test.ps1
```

### 2. cURL Example

```bash
# Test the dual-writer endpoint directly
curl -X POST http://127.0.0.1:8000/smoke/save \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-09-25",
    "custodian": "Kaizen",
    "lab": "Lab4: Research & Study",
    "tests": {
      "health": {"status": "pass", "details": "server alive"},
      "seed": {"status": "pass", "hash": "sha256-..."},
      "sweep": {"status": "pass", "details": "linked to seed"},
      "seal": {"status": "pass", "merkle_root": "sha256-..."},
      "verify": {"status": "pass", "details": "integrity verified"},
      "export": {"status": "pass", "details": "data export working"},
      "index": {"status": "pass", "details": "days tracked"}
    },
    "wins": "All smoke tests passed - FastAPI operational",
    "blocks": "none",
    "next_intent": "Continue API development"
  }' | jq '.'
```

### 3. Python Integration

```python
import requests

# Test the dual-writer endpoint
response = requests.post("http://127.0.0.1:8000/smoke/save", json={
    "date": "2025-09-25",
    "custodian": "Kaizen",
    "lab": "Lab4: Research & Study",
    "tests": {
        "health": {"status": "pass", "details": "server alive"},
        "seed": {"status": "pass", "hash": "sha256-..."},
        # ... more tests
    },
    "wins": "All smoke tests passed",
    "blocks": "none",
    "next_intent": "Continue development"
})

print(response.json())
```

## File Structure

```
data/
└── 2025-09-25/
    ├── smoke-test.json          # Machine-readable format
    ├── smoke-test.md            # Human-readable format
    ├── 2025-09-25.seed.json     # API seed data
    ├── 2025-09-25.echo.json     # API sweep data
    ├── 2025-09-25.seal.json     # API seal data
    ├── 2025-09-25.ledger.json   # API ledger data
    └── 2025-09-25.gic.jsonl     # GIC transactions
```

## Response Format

```json
{
  "json_file": "C:\\Users\\mikej\\Desktop\\lab4-proof\\data\\2025-09-25\\smoke-test.json",
  "json_sha256": "5fc6679181e187f976fe5b8210fc12289c53c541e492a7bef3360f9c4f895932",
  "md_file": "C:\\Users\\mikej\\Desktop\\lab4-proof\\data\\2025-09-25\\smoke-test.md",
  "md_sha256": "7976cfae60f418ca4459e959c9c808fbf2beb64abe56dab7c2fb9055bc847b29",
  "ts": "2025-09-22T13:29:18.560852Z"
}
```

## Markdown Output Example

```markdown
# 🧪 FastAPI Smoke-Test Ledger Entry
**Date:** 2025-09-25  
**Lab:** Lab4: Research & Study  
**Custodian:** Kaizen  
**Timestamp:** 2025-09-22T13:29:18.560852Z

## Custodian Log
- 🌱 **Jade:** *"The seed is the breath."*
- 🔏 **Eve:** *"The seal is the proof."*
- 🌌 **Lyra:** *"The root is eternal."*

## Test Results
| Test | Status | Details / Hash |
|---|---|---|
| health | ✅ Pass | server alive |
| seed | ✅ Pass | 7300d8c38ae76e64d43fe1da1df14ee55be6fb40553a2e49dba22485c12db612 |
| sweep | ✅ Pass | linked to seed |
| seal | ✅ Pass | cd867eab80fc37464b5a1198d074e023244b94acc53e51fb4ded14d76da0c9fd |
| verify | ✅ Pass | integrity verified |
| export | ✅ Pass | data export working |
| index | ✅ Pass | 8 days tracked |

## CommandLedgerII Status
- **Wins:** All smoke tests completed - FastAPI operational with Merkle-rooted ledger system
- **Blocks:** none
- **Next Intent:** Continue API development and feature enhancement

## Archive
📂 **AR Sweep → DLA:** `data/2025-09-25/`
```

## Integration with CommandLedgerII

The dual-writer system is designed to integrate seamlessly with your CommandLedgerII workflow:

1. **Run Smoke Test**: Execute `.\lab4-smoke-test.ps1`
2. **Capture Hashes**: Note the JSON and MD SHA-256 hashes
3. **Sweep to CommandLedgerII**: Use the hashes as proof of successful testing
4. **Archive to DLA**: The files are automatically organized in `data/{DATE}/`

## API Endpoints

- **POST** `/smoke/save` - Save smoke test bundle (dual-writer)
- **GET** `/health` - Health check
- **GET** `/routes` - List available endpoints
- **POST** `/seed` - Create seed entry
- **POST** `/sweep` - Create sweep entry
- **POST** `/seal` - Create seal entry
- **GET** `/verify/{date}` - Verify integrity
- **GET** `/export/{date}` - Export day data
- **GET** `/index` - List all days

## Troubleshooting

### Common Issues

1. **422 Unprocessable Content**: Check that all test values are strings, not integers
2. **Connection Refused**: Ensure the FastAPI server is running on port 8000
3. **File Not Found**: Check that the `data/` directory exists and is writable

### Debug Mode

```powershell
# Run with verbose output
$VerbosePreference = "Continue"
.\lab4-smoke-test.ps1 -Date 2025-09-25
```

## Customization

### Custom Anchors

```json
{
  "date": "2025-09-25",
  "custodian": "YourName",
  "lab": "Your Lab",
  "tests": { ... },
  "wins": "Your wins",
  "blocks": "Your blocks",
  "next_intent": "Your intent",
  "anchors": {
    "jade": "Your custom anchor",
    "eve": "Your custom anchor",
    "lyra": "Your custom anchor"
  }
}
```

### Custom Base Directory

```python
from app.dual_writer import write_smoke_test_bundle

# Use custom directory
result = write_smoke_test_bundle(
    date="2025-09-25",
    custodian="Kaizen",
    lab="Lab4: Research & Study",
    tests={...},
    wins="...",
    blocks="...",
    next_intent="...",
    base_dir=Path("custom/path")
)
```

## Security Notes

- All file paths are validated
- SHA-256 hashes ensure integrity
- Timestamps are UTC and ISO 8601 formatted
- No sensitive data is logged in plain text

---

**🌿 Jade**: *"The seed is the breath."*  
**🔏 Eve**: *"The seal is the proof."*  
**🌌 Lyra**: *"The root is eternal."*

*Lab4 Research & Study - Dual Writer System v1.0*
