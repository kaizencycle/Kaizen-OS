# 🔌 Plug-and-Play Dual-Writer System

## Overview

The plug-and-play dual-writer system provides a clean, reusable way to create both **JSON** and **Markdown** files from any endpoint, with optional **ZIP archiving** and **Merkle root validation**.

## Features

- ✅ **Dual Format Output**: Creates both `.json` and `.md` files
- 🔐 **SHA-256 Integrity**: Returns hashes for both files
- 📁 **Organized Storage**: Saves to `data/{DATE}/` directory
- 🗜️ **ZIP Archiving**: Optional automatic archiving with Merkle root guard
- 🎯 **Plug-and-Play**: Works with any endpoint, any payload
- 📊 **Rich Metadata**: Includes timestamps, file paths, and status

## Quick Start

### 1. Import the Adapter

```python
from .dual_writer_adapter import write_bundle
```

### 2. Use in Any Endpoint

```python
@app.post("/your-endpoint")
def your_endpoint(payload: YourModel):
    bundle = write_bundle(
        date=payload.date,
        name="your-file-name",
        payload={
            "key1": "value1",
            "key2": "value2",
            # ... any data structure
        },
        md_lines=[
            "Custom note 1",
            "Custom note 2",
            "Custom note 3"
        ],
        zip_after=True  # Optional: auto-archive if Merkle root exists
    )
    return {"ok": True, **bundle}
```

## API Endpoints

### Basic Dual-Writer
- **POST** `/smoke/save` - Basic smoke test bundle (no ZIP)

### Enhanced Dual-Writer
- **POST** `/smoke/save-v2` - Enhanced smoke test with ZIP archiving

## Usage Examples

### PowerShell Scripts

```powershell
# Basic test
.\test-dual-writer.ps1 -Date 2025-09-29

# Comprehensive examples
.\dual-writer-examples.ps1 -Date 2025-09-29
```

### cURL Examples

```bash
# Basic smoke test
curl -X POST http://127.0.0.1:8000/smoke/save \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-09-29",
    "custodian": "Kaizen",
    "lab": "Lab4: Research & Study",
    "tests": {
      "health": {"status": "pass", "details": "server alive"},
      "seed": {"status": "pass", "hash": "sha256-..."}
    },
    "wins": "All tests passed",
    "blocks": "none",
    "next_intent": "Continue development"
  }'

# Enhanced smoke test with ZIP
curl -X POST http://127.0.0.1:8000/smoke/save-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-09-29",
    "custodian": "Kaizen",
    "lab": "Lab4: Research & Study",
    "tests": {
      "health": {"status": "pass", "details": "server alive"},
      "seed": {"status": "pass", "hash": "sha256-..."},
      "seal": {"status": "pass", "merkle_root": "sha256-..."}
    },
    "wins": "All tests passed",
    "blocks": "none",
    "next_intent": "Continue development"
  }'
```

## Response Format

```json
{
  "ok": true,
  "json_file": "data/2025-09-29/smoke-test.json",
  "json_sha256": "5fc6679181e187f976fe5b8210fc12289c53c541e492a7bef3360f9c4f895932",
  "md_file": "data/2025-09-29/smoke-test.md",
  "md_sha256": "7976cfae60f418ca4459e959c9c808fbf2beb64abe56dab7c2fb9055bc847b29",
  "ts": "2025-09-22T13:43:21.821072Z",
  "zip_file": "archive/2025-09-29.zip",  // Only if zip_after=True and Merkle root exists
  "archive_status": "sealed successfully"  // or "skipped: Merkle root missing"
}
```

## File Structure

```
data/
└── 2025-09-29/
    ├── smoke-test.json          # Machine-readable format
    ├── smoke-test.md            # Human-readable format
    ├── 2025-09-29.seed.json     # API seed data
    ├── 2025-09-29.echo.json     # API sweep data
    ├── 2025-09-29.seal.json     # API seal data
    ├── 2025-09-29.ledger.json   # API ledger data
    └── 2025-09-29.gic.jsonl     # GIC transactions

archive/
└── 2025-09-29.zip               # Complete day archive (if Merkle root exists)
```

## ZIP Archiving Guard

The system includes a **Merkle root guard** that prevents archiving incomplete days:

- ✅ **If ledger file exists**: ZIP archive is created
- ❌ **If ledger file missing**: ZIP is skipped with error message

This ensures only complete, verified days are archived for DLA ingestion.

## Customization

### Custom File Names

```python
bundle = write_bundle(
    date="2025-09-29",
    name="custom-report",  # Creates custom-report.json and custom-report.md
    payload={...},
    md_lines=[...]
)
```

### Custom Base Directory

```python
bundle = write_bundle(
    date="2025-09-29",
    name="smoke-test",
    payload={...},
    base_dir=Path("custom/path"),  # Custom data directory
    archive_dir=Path("custom/archive")  # Custom archive directory
)
```

### Custom Markdown Notes

```python
bundle = write_bundle(
    date="2025-09-29",
    name="smoke-test",
    payload={...},
    md_lines=[
        "Custom note 1",
        "Custom note 2",
        "Jade: The seed is the breath.",
        "Eve: The seal is the proof.",
        "Lyra: The root is eternal."
    ]
)
```

## Integration Examples

### Lab4 Research & Study

```python
@app.post("/lab4/report")
def lab4_report(payload: Lab4Report):
    bundle = write_bundle(
        date=payload.date,
        name="lab4-report",
        payload={
            "custodian": payload.custodian,
            "lab": "Lab4: Research & Study",
            "experiments": payload.experiments,
            "results": payload.results,
            "summary": {
                "wins": payload.wins,
                "blocks": payload.blocks,
                "next_intent": payload.next_intent
            }
        },
        md_lines=[
            "Jade: The seed is the breath.",
            "Eve: The seal is the proof.",
            "Lyra: The root is eternal."
        ],
        zip_after=True
    )
    return {"ok": True, **bundle}
```

### CommandLedgerII Integration

```python
@app.post("/command-ledger/sweep")
def command_ledger_sweep(payload: CommandLedgerSweep):
    bundle = write_bundle(
        date=payload.date,
        name="command-ledger-sweep",
        payload={
            "sweep_id": payload.sweep_id,
            "operations": payload.operations,
            "results": payload.results,
            "metadata": payload.metadata
        },
        md_lines=[
            f"Sweep ID: {payload.sweep_id}",
            f"Operations: {len(payload.operations)}",
            f"Status: {payload.status}"
        ]
    )
    return {"ok": True, **bundle}
```

## Error Handling

### Common Errors

1. **422 Unprocessable Content**: Check that all values are strings, not integers
2. **FileNotFoundError**: Merkle root missing, cannot archive
3. **Connection Refused**: Ensure FastAPI server is running

### Debug Mode

```powershell
# Run with verbose output
$VerbosePreference = "Continue"
.\test-dual-writer.ps1 -Date 2025-09-29
```

## Security Features

- ✅ **Path Validation**: All file paths are validated
- ✅ **SHA-256 Integrity**: Both JSON and MD files have integrity hashes
- ✅ **UTC Timestamps**: All timestamps in ISO 8601 format
- ✅ **Merkle Root Guard**: Prevents archiving incomplete days
- ✅ **No Sensitive Data**: No secrets logged in plain text

## Performance

- ✅ **Fast**: Minimal overhead for dual-writer functionality
- ✅ **Efficient**: Only creates ZIP when Merkle root exists
- ✅ **Scalable**: Works with any payload size
- ✅ **Reliable**: Atomic operations with proper error handling

---

**🌿 Jade**: *"The seed is the breath."*  
**🔏 Eve**: *"The seal is the proof."*  
**🌌 Lyra**: *"The root is eternal."*

*Plug-and-Play Dual-Writer System v2.0 - Lab4 Research & Study*
