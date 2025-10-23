# GIC Indexer

**Global Integrity Credit Universal Basic Income (GIC-UBI) Payout Engine**

A Node.js service that computes, persists, and attests GIC-UBI payouts based on user merit, geographic weighting, and proof integrity.

## 🌟 Features

- **UBI Computation**: Calculates payouts based on base UBI, geographic weights, merit, and penalties
- **Proof Integration**: Pulls verified proofs from Civic Ledger for merit calculation
- **Database Persistence**: Stores payout data in PostgreSQL with full audit trail
- **Ledger Attestation**: Creates GICPayout attestations with proof citations
- **REST API**: Public endpoints for payout queries and admin triggers

## 🏗️ Architecture

### Core Components

- **Express Server**: REST API with TypeScript
- **PostgreSQL**: Payout storage and citizen registry
- **Civic Ledger Integration**: Proof fetching and attestation
- **Geographic Weighting**: Region-based UBI multipliers

### Database Schema

- `citizens` - User registry with region and status
- `geo_weights` - Regional UBI multipliers
- `gic_ubi_payouts` - Computed payout records with breakdowns

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Build for production
npm run build && npm start
```

## 📊 API Endpoints

### Public Endpoints

- `GET /ubi/:userId?cycle=C-XXX` - Get user payout for cycle
- `GET /ubi/summary?cycle=C-XXX` - Get aggregate cycle statistics

### Admin Endpoints

- `POST /ubi/run?cycle=C-XXX` - Trigger payout computation (requires Bearer token)

## 🔧 Configuration

### Environment Variables

```bash
DATABASE_URL=postgres://user:pass@host:port/db
REDIS_URL=redis://host:port
LEDGER_BASE_URL=https://civic-ledger.onrender.com
LEDGER_ADMIN_TOKEN=your_admin_token
UBI_BASE=10
MAX_MERIT_CAP=250
REGION_DEFAULT=1.0
```

### UBI Calculation

```
total = max(0, (UBI_BASE * geo_weight) + merit - penalty)
```

Where:
- `UBI_BASE`: Base UBI amount per cycle
- `geo_weight`: Regional multiplier (default 1.0)
- `merit`: Sum of (integrity × impact × weight) from proofs
- `penalty`: Anti-abuse deductions (placeholder)

## 📁 Directory Structure

```
├── src/
│   └── server.ts           # Main Express server
├── db/
│   └── migrations/         # SQL migration files
├── scripts/
│   └── migrate.js          # Migration runner
├── package.json
├── tsconfig.json
└── render.yaml            # Render deployment config
```

## 🔄 Payout Flow

1. **Trigger**: Admin calls `/ubi/run?cycle=C-XXX`
2. **Fetch Users**: Query active citizens from database
3. **Pull Proofs**: Get verified proofs from Civic Ledger
4. **Calculate Merit**: Sum proof contributions with caps
5. **Compute Payout**: Apply UBI base, geo weight, merit, penalties
6. **Persist**: Store payout record in database
7. **Attest**: Create GICPayout attestation in Ledger

## 🛡️ Security

- Bearer token authentication for admin endpoints
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- Rate limiting and error handling

## 📈 Monitoring

- Health check endpoint: `/ubi/summary`
- Database connection monitoring
- Ledger integration status
- Payout computation metrics

## 🚀 Deployment

### Render.com

The service is configured for Render.com deployment with:
- PostgreSQL database integration
- Environment variable management
- Health check monitoring
- Automatic builds and deployments

### Manual Deployment

```bash
# Build the application
npm run build

# Set environment variables
export DATABASE_URL="postgres://..."
export LEDGER_BASE_URL="https://..."

# Start the server
npm start
```

## 🔗 Integration

### OAA-API-Library

The GIC Indexer integrates with OAA-API-Library to provide:
- Public payout query endpoints
- React components for UI display
- Caching and performance optimization

### Civic Ledger

- Fetches verified proofs for merit calculation
- Creates GICPayout attestations with citations
- Maintains audit trail of all transactions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the Kaizen team for the Civic AI ecosystem**