# Civic Ledger API - The Blockchain Kernel

The Civic Ledger API is the central immutable anchor service that all Civic Protocol components write to. Think of it as the "Bitcoin Core" for GIC (Governance Incentive Currency).

## Overview

Every reflection, shield action, companion event, and governance decision gets anchored here as an immutable event in the ledger. This creates a permanent, verifiable record of all civic activity.

## Architecture

```
Civic Ledger API
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI application
│   ├── ledger.py            # Core ledger functionality
│   └── verify.py            # Token and signature verification
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Core Concepts

### Ledger Events
- **Immutable**: Once added, events cannot be modified
- **Chained**: Each event references the previous event's hash
- **Verified**: All events are authenticated via Lab4/Lab6 tokens
- **Typed**: Different event types for different civic activities

### Event Types
- **Reflections**: `reflection_created`, `reflection_updated`, `reflection_deleted`
- **Companions**: `companion_created`, `companion_updated`
- **Memory**: `memory_created`, `memory_updated`
- **Governance**: `agora_vote_cast`, `governance_proposal`, `governance_execution`
- **Shield**: `shield_enrollment`, `shield_verification`, `citizen_attestation`
- **GIC**: `gic_minted`, `gic_burned`, `gic_transfer`, `gic_staked`
- **Cycles**: `day_cycle_seed`, `day_cycle_sweep`, `day_cycle_seal`, `day_cycle_ledger`

## API Endpoints

### Health Check
```http
GET /health
```

### Attest Event
```http
POST /ledger/attest
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_type": "reflection_created",
  "civic_id": "civic_001",
  "lab_source": "lab4",
  "payload": {
    "title": "My Reflection",
    "content": "This is my civic reflection"
  },
  "signature": "optional_signature"
}
```

### Get Events
```http
GET /ledger/events?civic_id=civic_001&event_type=reflection_created&limit=100&offset=0
```

### Get Identity
```http
GET /ledger/identity/civic_001
```

### Get Ledger Stats
```http
GET /ledger/stats
```

### Get Chain Info
```http
GET /ledger/chain
```

## Configuration

Set these environment variables:

```bash
# Lab4 API base URL (required)
LAB4_API_BASE=https://hive-api-2le8.onrender.com

# Lab6 API base URL (optional)
LAB6_API_BASE=https://your-lab6-api.com

# Ledger database path
LEDGER_DB_PATH=./data/ledger.db

# Enable signature verification
VERIFY_SIGNATURES=true
```

## Database Schema

### Events Table
```sql
CREATE TABLE events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    civic_id TEXT NOT NULL,
    lab_source TEXT NOT NULL,
    payload TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    event_hash TEXT NOT NULL,
    signature TEXT,
    block_height INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Identities Table
```sql
CREATE TABLE identities (
    civic_id TEXT PRIMARY KEY,
    lab_source TEXT NOT NULL,
    first_seen TEXT NOT NULL,
    last_seen TEXT NOT NULL,
    event_count INTEGER DEFAULT 0,
    balance_gic INTEGER DEFAULT 0
);
```

### GIC Transactions Table
```sql
CREATE TABLE gic_transactions (
    tx_id TEXT PRIMARY KEY,
    from_civic_id TEXT,
    to_civic_id TEXT,
    amount INTEGER NOT NULL,
    tx_type TEXT NOT NULL,
    event_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events (event_id)
);
```

## Usage Examples

### Python Client
```python
import httpx

# Attest a reflection event
response = httpx.post(
    "http://localhost:8000/ledger/attest",
    headers={"Authorization": "Bearer your_token"},
    json={
        "event_type": "reflection_created",
        "civic_id": "civic_001",
        "lab_source": "lab4",
        "payload": {
            "title": "My Reflection",
            "content": "This is my civic reflection"
        }
    }
)
print(response.json())
```

### JavaScript Client
```javascript
const response = await fetch('http://localhost:8000/ledger/attest', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event_type: 'reflection_created',
    civic_id: 'civic_001',
    lab_source: 'lab4',
    payload: {
      title: 'My Reflection',
      content: 'This is my civic reflection'
    }
  })
});
const result = await response.json();
console.log(result);
```

## Deployment

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export LAB4_API_BASE=https://hive-api-2le8.onrender.com
export LEDGER_DB_PATH=./data/ledger.db

# Run the service
python app/main.py
```

### Production Deployment

#### Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

#### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

#### Fly.io
1. Create `fly.toml` configuration
2. Set environment variables
3. Deploy with `fly deploy`

## Integration with Lab4 and Lab6

### Lab4 Integration
Lab4 should call the Ledger API after processing reflections:

```python
# In Lab4, after creating a reflection
ledger_response = httpx.post(
    f"{LEDGER_API_BASE}/ledger/attest",
    headers={"Authorization": f"Bearer {user_token}"},
    json={
        "event_type": "reflection_created",
        "civic_id": user_civic_id,
        "lab_source": "lab4",
        "payload": {
            "title": reflection.title,
            "content": reflection.content,
            "visibility": reflection.visibility
        }
    }
)
```

### Lab6 Integration
Lab6 should call the Ledger API after shield actions:

```python
# In Lab6, after shield verification
ledger_response = httpx.post(
    f"{LEDGER_API_BASE}/ledger/attest",
    headers={"Authorization": f"Bearer {user_token}"},
    json={
        "event_type": "shield_verification",
        "civic_id": user_civic_id,
        "lab_source": "lab6",
        "payload": {
            "verification_type": "reflection_rate_limit",
            "result": "verified"
        }
    }
)
```

## Security

- **Token Verification**: All events must be authenticated via Lab4/Lab6 tokens
- **Event Validation**: All events are validated before being added to the ledger
- **Signature Verification**: Optional signature verification for additional security
- **Immutable Storage**: Once added, events cannot be modified
- **Chain Integrity**: Each event references the previous event's hash

## Monitoring

The Ledger API provides several endpoints for monitoring:

- `/health` - Service health check
- `/ledger/stats` - Ledger statistics
- `/ledger/chain` - Chain information
- `/ledger/events` - Event querying

## Future Enhancements

- **Merkle Batching**: Group events into blocks for efficiency
- **Consensus**: Multiple ledger nodes with consensus
- **GIC Rules**: Enforce balance checks and transfer rules
- **Explorer UI**: Web interface for browsing the ledger
- **API Rate Limiting**: Protect against abuse
- **Event Filtering**: Advanced query capabilities

## Contributing

See the main Civic Protocol Core repository for contribution guidelines.

## License

MIT License - see the main repository for details.

