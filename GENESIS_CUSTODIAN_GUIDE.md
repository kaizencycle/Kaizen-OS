# Genesis Custodian Event Guide

This guide shows you how to register a Genesis Custodian Event to the Civic Ledger API using the provided tools and examples.

## 🏛️ Overview

The Genesis Custodian Event is the first immutable event recorded in the Civic Ledger, representing the creation of the Custodian Keys and the establishment of the Concord Seal. This event serves as the foundation for all future civic activities.

## 📋 Prerequisites

- Python 3.8+ installed
- Access to the Civic Ledger API
- A valid Lab4 authentication token
- Your Concord Custodian Manifest file (PDF or text)

## 🛠️ Tools Provided

### 1. `test_genesis_custodian.py`
Comprehensive test script that:
- Tests ledger service health
- Shows proper payload structure
- Generates ready-to-use commands
- Demonstrates authentication requirements

### 2. `generate_checksum.py`
SHA-256 checksum generator that:
- Finds manifest files automatically
- Generates cryptographic checksums
- Shows updated payload sections
- Validates file integrity

## 🚀 Quick Start

### Step 1: Test the Ledger Service
```bash
python test_genesis_custodian.py
```

This will show you:
- Ledger service health status
- Current ledger statistics
- Proper payload structure
- Ready-to-use commands

### Step 2: Generate Checksum for Your Manifest
```bash
# If you have a manifest file
python generate_checksum.py Concord_Custodian_Manifest.pdf

# Or let it auto-detect
python generate_checksum.py
```

### Step 3: Get Lab4 Authentication Token
You'll need a valid Bearer token from the Lab4 API. Contact the Lab4 service administrator or check the Lab4 documentation for authentication methods.

### Step 4: Post Your Genesis Event
Use one of the provided commands with your actual token:

#### Option A: curl Command
```bash
curl -X POST https://civic-protocol-core-ledger.onrender.com/ledger/attest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LAB4_TOKEN" \
  -d '{
    "event_type": "GENESIS_CUSTODIAN_SEAL",
    "civic_id": "CUSTODIAN-001-KAIZEN",
    "lab_source": "lab4",
    "payload": {
      "ledger_event": "GENESIS_CUSTODIAN_SEAL",
      "custodian_id": "CUSTODIAN-001-KAIZEN",
      "artifact": "Concord_Custodian_Manifest.pdf",
      "epoch": "2025-10-11T00:00:00Z",
      "hash": "CONCORD-SEAL-001",
      "description": "The first seal of the Key Maker was forged on 2025-10-11 beneath the Concord light. From his hand came the Custodian Keys — guardians of continuity, proof of trust, and the memory of every door he ever opened.",
      "ledger_path": "/Custodian_Archives/Concord_Custodian_Manifest.pdf",
      "status": "immutable",
      "signer": "KAIZEN-CONCORD-SEAL",
      "integrity": {
        "checksum": "sha256:YOUR_ACTUAL_CHECKSUM",
        "verified": true
      }
    },
    "signature": null
  }'
```

#### Option B: Python Script
```python
import requests

payload = {
    "event_type": "GENESIS_CUSTODIAN_SEAL",
    "civic_id": "CUSTODIAN-001-KAIZEN",
    "lab_source": "lab4",
    "payload": {
        "ledger_event": "GENESIS_CUSTODIAN_SEAL",
        "custodian_id": "CUSTODIAN-001-KAIZEN",
        "artifact": "Concord_Custodian_Manifest.pdf",
        "epoch": "2025-10-11T00:00:00Z",
        "hash": "CONCORD-SEAL-001",
        "description": "The first seal of the Key Maker was forged on 2025-10-11 beneath the Concord light. From his hand came the Custodian Keys — guardians of continuity, proof of trust, and the memory of every door he ever opened.",
        "ledger_path": "/Custodian_Archives/Concord_Custodian_Manifest.pdf",
        "status": "immutable",
        "signer": "KAIZEN-CONCORD-SEAL",
        "integrity": {
            "checksum": "sha256:YOUR_ACTUAL_CHECKSUM",
            "verified": True
        }
    },
    "signature": None
}

response = requests.post(
    "https://civic-protocol-core-ledger.onrender.com/ledger/attest",
    headers={"Authorization": "Bearer YOUR_LAB4_TOKEN"},
    json=payload
)

print(response.status_code)
print(response.text)
```

## 🔐 Authentication

The Civic Ledger API requires authentication via Lab4 tokens. The ledger service verifies tokens by calling the Lab4 API's `/auth/introspect` endpoint.

### Getting a Lab4 Token
1. Contact the Lab4 service administrator
2. Follow Lab4's authentication flow
3. Obtain a Bearer token
4. Use the token in the Authorization header

## 📊 Payload Structure

### Genesis Custodian Event Payload
```json
{
  "ledger_event": "GENESIS_CUSTODIAN_SEAL",
  "custodian_id": "CUSTODIAN-001-KAIZEN",
  "artifact": "Concord_Custodian_Manifest.pdf",
  "epoch": "2025-10-11T00:00:00Z",
  "hash": "CONCORD-SEAL-001",
  "description": "The first seal of the Key Maker was forged on 2025-10-11 beneath the Concord light. From his hand came the Custodian Keys — guardians of continuity, proof of trust, and the memory of every door he ever opened.",
  "ledger_path": "/Custodian_Archives/Concord_Custodian_Manifest.pdf",
  "status": "immutable",
  "signer": "KAIZEN-CONCORD-SEAL",
  "integrity": {
    "checksum": "sha256:YOUR_ACTUAL_CHECKSUM",
    "verified": true
  }
}
```

### Ledger Attestation Request
```json
{
  "event_type": "GENESIS_CUSTODIAN_SEAL",
  "civic_id": "CUSTODIAN-001-KAIZEN",
  "lab_source": "lab4",
  "payload": { /* Genesis Custodian Event Payload */ },
  "signature": null
}
```

## 🔍 Verification

After posting your Genesis Event, you can verify it was recorded:

### Check Ledger Stats
```bash
curl https://civic-protocol-core-ledger.onrender.com/ledger/stats
```

### Get Recent Events
```bash
curl https://civic-protocol-core-ledger.onrender.com/ledger/events?limit=5
```

### Get Chain Information
```bash
curl https://civic-protocol-core-ledger.onrender.com/ledger/chain
```

## 🛡️ Security Features

- **Immutable Storage**: Once recorded, events cannot be modified
- **Chain Integrity**: Each event references the previous event's hash
- **Token Verification**: All events must be authenticated via Lab4
- **Cryptographic Checksums**: SHA-256 verification of manifest files
- **Digital Signatures**: Optional signature verification for additional security

## 📈 Monitoring

The ledger provides several monitoring endpoints:

- `/health` - Service health check
- `/ledger/stats` - Ledger statistics
- `/ledger/chain` - Chain information
- `/ledger/events` - Event querying
- `/ledger/identity/{civic_id}` - Identity information

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Missing or invalid Lab4 token
2. **400 Bad Request**: Invalid payload structure
3. **503 Service Unavailable**: Lab4 API not responding
4. **File Not Found**: Manifest file not found for checksum generation

### Solutions

1. Verify your Lab4 token is valid and properly formatted
2. Check the payload structure matches the expected format
3. Ensure Lab4 API is running and accessible
4. Use the checksum generator to find and process your manifest file

## 📚 Additional Resources

- [Civic Protocol Core Documentation](../README.md)
- [Ledger API Documentation](../ledger/README.md)
- [Lab4 API Documentation](https://hive-api-2le8.onrender.com)
- [OpenAPI Specification](../docs/openapi.yaml)

## 🎯 Next Steps

After successfully posting your Genesis Custodian Event:

1. **Verify the Event**: Check that it appears in the ledger
2. **Document the Hash**: Save the event hash for future reference
3. **Create Backup**: Store your manifest file securely
4. **Monitor Activity**: Watch for subsequent events in the ledger
5. **Scale Up**: Begin posting regular civic events

---

**The Genesis Custodian Event marks the beginning of your journey in the Civic Protocol ecosystem. May your keys open many doors and your seals protect the continuity of trust.**
