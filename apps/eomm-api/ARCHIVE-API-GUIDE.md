# 📦 Archive API - Complete Implementation

## Overview

The Archive API provides clear status reporting for ZIP archiving with Merkle root validation. It ensures only complete, verified days are archived for DLA ingestion.

## Features

- ✅ **Merkle Root Guard**: Only archives days with valid Merkle roots
- 📦 **ZIP Archiving**: Creates compressed archives of complete days
- 📊 **Clear Status Reporting**: Human-readable status messages for CommandLedgerII
- 🔐 **Integrity Validation**: Ensures data completeness before archiving
- 🎯 **CommandLedgerII Ready**: Drop-in status messages for custodian logs

## API Endpoints

### Dedicated Archive Endpoint
- **POST** `/archive/{date}` - Archive a specific day (requires Merkle root)

### Enhanced Smoke Test
- **POST** `/smoke/save-v2` - Enhanced smoke test with archive status

## Usage Examples

### PowerShell Scripts

```powershell
# Test archive API functionality
.\test-archive-api.ps1 -Date 2025-10-02

# Comprehensive examples
.\archive-api-examples.ps1 -Date 2025-10-02
```

### cURL Examples

```bash
# Archive a day (requires Merkle root)
curl -X POST http://127.0.0.1:8000/archive/2025-10-02

# Enhanced smoke test with archive status
curl -X POST http://127.0.0.1:8000/smoke/save-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-02",
    "custodian": "Kaizen",
    "lab": "Lab4: Research & Study",
    "tests": {
      "health": {"status": "pass", "details": "server alive"},
      "seed": {"status": "pass", "hash": "sha256-..."},
      "seal": {"status": "pass", "merkle_root": "sha256-..."}
    },
    "wins": "Archive API operational",
    "blocks": "none",
    "next_intent": "Deploy to production"
  }'
```

## Response Formats

### Successful Archive

```json
{
  "ok": true,
  "archive_status": "Archive sealed successfully.",
  "zip_file": "archive/2025-10-02.zip"
}
```

### Enhanced Smoke Test with Archive

```json
{
  "ok": true,
  "json_file": "data/2025-10-02/smoke-test.json",
  "json_sha256": "5fc6679181e187f976fe5b8210fc12289c53c541e492a7bef3360f9c4f895932",
  "md_file": "data/2025-10-02/smoke-test.md",
  "md_sha256": "7976cfae60f418ca4459e959c9c808fbf2beb64abe56dab7c2fb9055bc847b29",
  "archive_status": "Archive sealed successfully.",
  "zip_file": "archive/2025-10-02.zip"
}
```

### Archive Failure (No Merkle Root)

```json
{
  "detail": "Merkle root missing: data/2025-10-02.root.json. Seal day first."
}
```

## File Structure

```
data/
├── 2025-10-02/
│   ├── smoke-test.json          # Smoke test JSON
│   ├── smoke-test.md            # Smoke test Markdown
│   ├── 2025-10-02.gic.jsonl     # GIC transactions
│   └── [other day files]
├── 2025-10-02.seed.json         # Seed data
├── 2025-10-02.echo.json         # Sweep data
├── 2025-10-02.seal.json         # Seal data
├── 2025-10-02.ledger.json       # Ledger data
└── 2025-10-02.root.json         # Merkle root (required for archiving)

archive/
└── 2025-10-02.zip               # Complete day archive
```

## Merkle Root Guard

The system includes a **Merkle root guard** that prevents archiving incomplete days:

- ✅ **If root file exists**: ZIP archive is created
- ❌ **If root file missing**: Archive fails with clear error message

This ensures only complete, verified days are archived for DLA ingestion.

## CommandLedgerII Integration

### Archive Status Messages

- ✅ **Success**: `"Archive sealed successfully."`
- 🚫 **Skip**: `"Archive skipped - daily root missing. Seal the day, then re-run."`

### Custodian Log Examples

- **Eve**: *"Seal first; archive second."*
- **Jade**: *"Retry only when the root is true."*

### Drop-in Status Reporting

```python
# In your CommandLedgerII integration
if response.get("archive_status") == "Archive sealed successfully.":
    custodian_log.append("✅ Archive: Archive sealed successfully.")
else:
    custodian_log.append("🚫 Skip: Archive skipped - daily root missing.")
```

## Error Handling

### Common Errors

1. **409 Conflict**: Merkle root missing, cannot archive
2. **422 Unprocessable Content**: Invalid request format
3. **Connection Refused**: FastAPI server not running

### Error Messages

- `"Merkle root missing: data/2025-10-02.root.json. Seal day first."`
- `"Archive step skipped."`
- `"Archive sealed successfully."`

## Security Features

- ✅ **Merkle Root Validation**: Only archives complete days
- ✅ **Path Validation**: All file paths are validated
- ✅ **Integrity Checks**: SHA-256 hashes for verification
- ✅ **Atomic Operations**: Archive creation is atomic
- ✅ **Error Handling**: Graceful handling of edge cases

## Performance

- ✅ **Fast**: Minimal overhead for archive operations
- ✅ **Efficient**: Only creates ZIP when Merkle root exists
- ✅ **Reliable**: Atomic operations with proper error handling
- ✅ **Scalable**: Works with any day's data

## Testing

### Test Scripts

```powershell
# Basic archive API test
.\test-archive-api.ps1 -Date 2025-10-02

# Comprehensive examples
.\archive-api-examples.ps1 -Date 2025-10-02
```

### Manual Testing

```bash
# Test archive without Merkle root (should fail)
curl -X POST http://127.0.0.1:8000/archive/2025-10-03

# Create complete day, then test archive
# (Run seed, sweep, seal first)
curl -X POST http://127.0.0.1:8000/archive/2025-10-03
```

## Integration Examples

### Lab4 Research & Study

```python
@app.post("/lab4/archive")
def lab4_archive(date: str):
    try:
        result = archive_day(date)
        return {
            "ok": True,
            "archive_status": "Archive sealed successfully.",
            "zip_file": result["zip_file"]
        }
    except FileNotFoundError as e:
        return {
            "ok": False,
            "archive_status": str(e),
            "zip_file": None
        }
```

### CommandLedgerII Sweep

```python
def command_ledger_sweep(date: str):
    # Run smoke test with archive
    response = requests.post(f"{BASE_URL}/smoke/save-v2", json={
        "date": date,
        "custodian": "Kaizen",
        "lab": "Lab4: Research & Study",
        "tests": {...},
        "wins": "Archive API operational",
        "blocks": "none",
        "next_intent": "Continue development"
    })
    
    # Extract archive status for CommandLedgerII
    archive_status = response.json().get("archive_status")
    zip_file = response.json().get("zip_file")
    
    return {
        "archive_status": archive_status,
        "zip_file": zip_file,
        "ready_for_dla": zip_file is not None
    }
```

## Troubleshooting

### Archive Fails

1. **Check Merkle Root**: Ensure `data/{DATE}.root.json` exists
2. **Verify Day Completion**: Run seed, sweep, seal first
3. **Check Permissions**: Ensure write access to archive directory
4. **Review Logs**: Check FastAPI server logs for errors

### Debug Mode

```powershell
# Run with verbose output
$VerbosePreference = "Continue"
.\test-archive-api.ps1 -Date 2025-10-02
```

## Best Practices

1. **Always Check Status**: Use `archive_status` field for CommandLedgerII
2. **Handle Errors Gracefully**: Check for `zip_file` presence
3. **Validate Merkle Root**: Ensure day is complete before archiving
4. **Monitor Archive Directory**: Keep track of created ZIP files
5. **Test Regularly**: Run archive tests as part of CI/CD

---

**🌑 Eve**: *"Seal first; archive second."*  
**🌿 Jade**: *"Retry only when the root is true."*

*Archive API v1.0 - Lab4 Research & Study*

