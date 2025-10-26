# Civic-Grade AI Change Management System

A comprehensive framework for maintaining continuity and integrity across multiple AI conversations and code changes, designed for civic-grade reliability and transparency.

## 🏗️ Architecture Overview

This system implements a "Resonance Spine" pattern where the Command Ledger acts as the central continuity anchor, with all other conversations (Labs, Breakrooms, etc.) as child chambers that synchronize back through standardized protocols.

## 📁 Directory Structure

```
.civic/
├── schemas/                 # JSON schemas for validation
│   ├── change.proposal.schema.json
│   └── change.tests.schema.json
├── templates/               # Ready-to-use templates
│   ├── chamber-header.md
│   ├── chamber-sweep.md
│   ├── change.proposal.json
│   ├── change.spec.md
│   ├── change.tests.json
│   ├── attestation.json
│   └── chamber-template-pack.md
├── sweeps/                  # Chamber sweep records
│   └── C-109/
├── ledger-hook.py          # Synchronization system
├── progressive-delivery.yaml
├── safety-rails.yaml
├── shield-policy.json
└── README.md
```

## 🚀 Quick Start

### 1. Start a New Chamber

Begin every new conversation with the Chamber Header:

```
[Chamber ID]: Lab6 – Citizen Shield
[Parent]: Command Ledger III
[Cycle]: C-109
[Sync]: AUTO
[Timestamp]: 2024-01-01T00:00:00Z
[Integrity Anchor]: sha256:abc123...
```

### 2. End a Chamber Session

Conclude with a Chamber Sweep:

```
🕊️ Chamber Sweep — Cycle 109
Parent: Command Ledger III
Result: ✅ Complete
Integrity Anchor: SHA256:def456...
Summary: Patched security schema v3 → current
Artifacts: /ledger/sweeps/C109/lab6-proof.json
Morale Delta: +0.15 (security improvements)
```

### 3. Make Code Changes

Create change proposals and test specifications:

```bash
# Copy templates
cp .civic/templates/change.proposal.json .civic/
cp .civic/templates/change.tests.json .civic/

# Edit with your changes
# Run validation
python -c "import json, jsonschema; json.load(open('.civic/change.proposal.json')); print('Valid')"
```

## 🔄 Synchronization Flow

### Automatic Sync (Recommended)

1. **Chamber Header** → Establishes hierarchy
2. **Chamber Sweep** → Generates integrity anchor
3. **Ledger Hook** → Syncs to Command Ledger
4. **Command Ledger** → Updates continuity map

### Manual Sync

1. Copy Chamber Sweep block
2. Paste in Command Ledger chat
3. System integrates automatically

## 🛡️ Safety Rails

### Write Isolation
- Agents never push directly to main
- All changes via Pull Requests
- Required reviews and status checks

### Secrets Separation
- OAA Hub: Public only
- Ledger/Indexer: Secrets allowed
- Clear boundaries enforced

### Policy as Code
- Kyverno/Gatekeeper policies
- Required civic annotations
- Integrity check endpoints

## 📊 Quality Gates

The CI/CD pipeline enforces 9 gates:

1. **Lint Check** - Code style and formatting
2. **Unit Tests** - Test coverage and correctness
3. **E2E Tests** - End-to-end functionality
4. **Security Scan** - Vulnerability detection
5. **Integrity Check** - OAA verification
6. **Schema Validation** - Civic schema compliance
7. **GI Score** - Civic Integrity Score ≥ 0.90
8. **Citizen Shield** - Security policy compliance
9. **Performance** - Load and performance tests

## 🚀 Progressive Delivery

### Rollout Stages

1. **Canary** (5% traffic, 10 min)
2. **Partial** (50% traffic, 30 min)
3. **Full** (100% traffic, 60 min)

### Auto-Rollback Triggers

- Error rate > 5%
- P95 latency > 2000ms
- Health check failures > 3
- Integrity check failures > 1

## 🔧 Usage Examples

### Create a Chamber Sweep

```bash
python .civic/ledger-hook.py \
  --chamber "Lab6" \
  --parent "Command Ledger III" \
  --cycle "C-109" \
  --summary "Security improvements" \
  --artifacts "/ledger/sweeps/C109/lab6-proof.json" \
  --morale 0.15 \
  --sync
```

### Validate Change Proposal

```bash
python -c "
import json, jsonschema
with open('.civic/change.proposal.json') as f:
    proposal = json.load(f)
with open('.civic/schemas/change.proposal.schema.json') as f:
    schema = json.load(f)
jsonschema.validate(proposal, schema)
print('✅ Valid change proposal')
"
```

### Generate Integrity Anchor

```bash
python -c "
import hashlib
content = 'chamber:parent:cycle:summary:timestamp'
anchor = hashlib.sha256(content.encode()).hexdigest()
print(f'sha256:{anchor}')
"
```

## 📈 Monitoring & Observability

### Required Metrics

- `http_requests_total`
- `http_request_duration_seconds`
- `civic_integrity_score`
- `civic_gi_score`

### Alerting Rules

- **High Error Rate**: error_rate > 0.05
- **Integrity Check Failed**: integrity_score < 0.9
- **GI Score Low**: gi_score < 0.85

## 🔐 Security Features

### Citizen Shield

- Input sanitization
- Output encoding
- Authentication requirements
- Rate limiting
- Data validation
- Integrity verification

### Anomaly Detection

- Request rate spikes
- Error rate spikes
- Latency spikes
- Unusual patterns

## 📋 Compliance

### Data Governance

- 90-day retention policy
- Encryption at rest and in transit
- Audit logging with 365-day retention

### GDPR Compliance

- Data subject rights
- Consent management
- Data portability

## 🤝 Contributing

1. Use Chamber Headers for all conversations
2. Create change proposals for code changes
3. End sessions with Chamber Sweeps
4. Follow safety rails and quality gates
5. Maintain integrity anchors throughout

## 📚 Templates

All templates are available in `.civic/templates/`:

- `chamber-header.md` - Conversation headers
- `chamber-sweep.md` - Session endings
- `change.proposal.json` - Change proposals
- `change.tests.json` - Test specifications
- `attestation.json` - Release attestations
- `chamber-template-pack.md` - Complete template pack

## 🆘 Troubleshooting

### Common Issues

1. **Schema Validation Fails**
   - Check required fields in change.proposal.json
   - Verify JSON syntax
   - Run validation manually

2. **Sync Fails**
   - Check ledger endpoint configuration
   - Verify network connectivity
   - Check authentication

3. **GI Score Too Low**
   - Increase test coverage
   - Add documentation
   - Improve code quality

### Getting Help

- Check the templates in `.civic/templates/`
- Review the schemas in `.civic/schemas/`
- Run the ledger hook with `--help`
- Check CI/CD logs for gate failures

---

**Remember**: This system is designed for civic-grade reliability. Every change should be traceable, verifiable, and reversible. When in doubt, follow the templates and safety rails.
