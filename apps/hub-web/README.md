# OAA API Library - Integrity-First AI Governance Loop

The Open Autonomous Academy (OAA) Hub provides a comprehensive system for AI governance, companion management, and integrity tracking through cryptographic proofs and civic ledger integration.

## 🏛️ Core Architecture

- **Project**: Open Autonomous Academy (OAA) — integrity-first AI governance loop
- **Companions**: Jade (builder), Eve (reflection), Zeus (ops), Hermes (routing)
- **Civic Stack**: GIC (.gic domains), Civic Ledger (proofs), GIC Gateway, Virtue Accords (Cycle 0)
- **Ops Rhythm**: Clock-in/out cycles; Eve captures Wins / Blocks / TomorrowIntent
- **Infra**: Render (hub/gateway/worker/redis), BullMQ queue (`publishEvents`)

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your secrets and ledger URLs
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access dev tools**:
   - `/dev/memory` - View and append to OAA memory
   - `/dev/eve-loop` - Eve's daily cycle management
   - `/dev/context` - System context viewer
   - `/dev/ledger` - Ledger management
   - `/dev/queue` - Queue monitoring
   - `/dev/reports` - System reports

## 🔐 Security & Authentication

### HMAC Authentication
All write operations require HMAC-SHA256 signatures:

```bash
# Generate HMAC for memory operations
export MEMORY_HMAC_SECRET=your-secret
npm run hmac:note "Your memory note here"

# Generate HMAC for Eve operations
export EVE_HMAC_SECRET=your-secret
# Use the same pattern for Eve clock-in/out operations
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OAA_MEMORY_PATH` | Path to memory JSON file | `./OAA_MEMORY.json` |
| `MEMORY_HMAC_SECRET` | Secret for memory API writes | Required |
| `EVE_HMAC_SECRET` | Secret for Eve operations | Required |
| `LEDGER_BASE_URL` | Civic Ledger API URL | `http://localhost:4000` |
| `LEDGER_ADMIN_TOKEN` | Ledger authentication token | Required |
| `DEV_MODE` | Enable dev routes | `1` |

## 📚 API Endpoints

### Memory API (`/api/oaa/memory`)

- **GET**: Retrieve memory notes (supports `?q=` query filter)
- **POST**: Append new note (requires HMAC signature)

```bash
# Read memory
curl http://localhost:3000/api/oaa/memory

# Add note (requires HMAC)
curl -X POST http://localhost:3000/api/oaa/memory \
  -H 'content-type: application/json' \
  -H "x-hmac-sha256: <signature>" \
  -d '{"note":"Test note","tag":"dev"}'
```

### Eve Lifecycle API

#### Clock-In (`/api/eve/clockin`)
Starts a new work cycle with intent declaration.

```bash
curl -X POST http://localhost:3000/api/eve/clockin \
  -H 'content-type: application/json' \
  -H "x-hmac-sha256: <signature>" \
  -d '{
    "cycle": "C-108",
    "companion": "eve",
    "intent": ["stabilize queue", "publish citizen shield UI"],
    "meta": {"tz": "ET"}
  }'
```

#### Clock-Out (`/api/eve/clockout`)
Ends a work cycle with wins, blocks, and tomorrow's intent.

```bash
curl -X POST http://localhost:3000/api/eve/clockout \
  -H 'content-type: application/json' \
  -H "x-hmac-sha256: <signature>" \
  -d '{
    "cycle": "C-108",
    "companion": "eve",
    "wins": ["shipped sentinel suite", "green badge"],
    "blocks": ["queue instability"],
    "tomorrowIntent": ["finalize incident digest"],
    "meta": {"tz": "ET"}
  }'
```

### Ledger Verification (`/api/dev/ledger/verify`)
Verify cryptographic proofs against the Civic Ledger.

```bash
curl "http://localhost:3000/api/dev/ledger/verify?sha=0x<sha256>"
```

## 🧠 Memory System

The OAA Memory system provides durable, append-only storage for:

- **Companion notes**: Jade, Eve, Zeus, Hermes activities
- **Cycle logs**: Clock-in/out records with cryptographic proofs
- **Civic events**: GIC transactions, ledger seals, governance decisions
- **System state**: Queue status, infrastructure health, operational metrics

### Memory Structure

```json
{
  "version": "v1",
  "updatedAt": "2025-10-17T00:00:00.000Z",
  "notes": [
    {
      "ts": 1697452800000,
      "note": "Companion sync: Jade/Eve alignment OK",
      "tag": "ops"
    }
  ],
  "companions": ["jade", "eve", "zeus", "hermes"],
  "repos": ["OAA-API-Library", "gic-gateway-service"],
  "queue": { "name": "publishEvents" },
  "ethics": { "accords": "Virtue Accords", "epoch": "Cycle 0" }
}
```

## 🔄 Eve's Daily Loop

Eve maintains the operational rhythm through structured daily cycles:

1. **Clock-In**: Declare daily intent and goals
2. **Work Cycle**: Execute planned activities
3. **Clock-Out**: Reflect on wins, blocks, and tomorrow's intent
4. **Seal**: Cryptographic proof stored in Civic Ledger
5. **Stub**: Next cycle automatically prepared

Each cycle generates:
- **Digest**: Human-readable summary
- **SHA256**: Cryptographic hash for verification
- **Proof**: Ledger seal with timestamp and verification URL

## 🛡️ Integrity Features

### Cryptographic Proofs
- All operations generate SHA256 hashes
- Hashes are sealed to the Civic Ledger
- Proofs can be verified independently
- Immutable audit trail maintained

### HMAC Security
- All write operations require HMAC-SHA256 signatures
- Timing-safe comparison prevents timing attacks
- Secrets never exposed client-side
- Separate secrets for different operations

### Dev Mode Protection
- Development routes require `DEV_MODE=1`
- Production-safe by default
- Clear separation of dev and prod functionality

## 🏗️ Development

### Project Structure

```
├── docs/
│   └── OAA_PREFACE.md          # Core context (always-in-context)
├── lib/
│   ├── crypto/
│   │   ├── hmac.ts            # HMAC validation
│   │   └── sha.ts             # SHA256 utilities
│   └── memory/
│       └── fileStore.ts       # Memory persistence
├── pages/
│   ├── api/
│   │   ├── oaa/memory/        # Memory API
│   │   ├── eve/               # Eve lifecycle
│   │   └── dev/ledger/        # Ledger verification
│   └── dev/                   # Development UI
├── components/
│   └── DevLayout.tsx          # Development layout
├── scripts/
│   └── hmacNote.mjs           # HMAC generation CLI
├── OAA_MEMORY.json            # Durable memory store
└── .cursor/rules.json         # Cursor context rules
```

### Adding New Features

1. **API Endpoints**: Add to `pages/api/`
2. **Dev UI**: Add to `pages/dev/`
3. **Memory Integration**: Use `lib/memory/fileStore.ts`
4. **Security**: Use `lib/crypto/` utilities
5. **Documentation**: Update this README

## 🔗 Integration

### Civic Ledger
- Seals all cycle proofs
- Provides verification endpoints
- Maintains immutable audit trail
- Supports both mock and production modes

### GIC Gateway
- Integrates with .gic domain system
- Manages citizen feeds and posts
- Handles reward distribution
- Maintains virtue accord compliance

### BullMQ Queue
- Processes `publishEvents` queue
- Handles async operations
- Provides monitoring endpoints
- Supports retry and error handling

## 📊 Monitoring

The system provides comprehensive monitoring through:

- **Sentinel Suite**: CI status and runtime vitals
- **Queue Monitoring**: BullMQ depth and failure rates
- **Memory Analytics**: Note patterns and companion activity
- **Ledger Verification**: Proof integrity and timestamps
- **Weekly Digests**: Automated system health reports

## 🤝 Contributing

1. Follow the integrity-first principle
2. All changes must be logged to memory
3. Use proper HMAC signatures for writes
4. Maintain cryptographic proof chains
5. Update documentation for new features

## 📄 License

This project operates under the Virtue Accords (Cycle 0) - see the Civic Ledger for full terms and governance framework.

---

**Remember**: Human-in-the-loop coding; proofs logged to Ledger; rewards via GIC for shared agreements.

