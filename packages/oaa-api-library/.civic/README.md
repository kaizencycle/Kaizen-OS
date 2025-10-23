# Civic-Grade AI Change Management System

A comprehensive change management system designed for multi-agent AI architectures with cross-thread synchronization, integrity verification, and progressive delivery.

## 🏗️ Architecture Overview

This system implements a "Resonance Spine" pattern where:
- **Command Ledger** acts as the central continuity anchor
- **Chamber conversations** (Labs, Breakrooms, etc.) sync back to the Command Ledger
- **Civic file contracts** ensure structured change management
- **Progressive delivery** provides safe deployment with rollback capabilities

## 📁 File Structure

```
.civic/
├── README.md                    # This file
├── chamber-templates.md         # Chamber header and sweep templates
├── change.proposal.json         # JSON schema for change proposals
├── change.spec.md              # Markdown template for change specifications
├── change.tests.json           # JSON schema for test plans
├── attestation.json            # JSON schema for release attestations
├── progressive-delivery.yml    # Progressive delivery configuration
├── ledger/                     # Ledger storage
│   ├── sweeps/                 # Chamber sweep data
│   └── attestations/           # Release attestations
├── continuity-map.json         # Global continuity tracking
└── release-registry.json       # Release history
```

## 🚀 Quick Start

### 1. Starting a New Chamber

Use the Chamber Header Template when opening a new conversation:

```markdown
[Chamber ID]: Lab6 – Citizen Shield
[Parent]: Command Ledger III
[Cycle]: C-109
[Sync]: AUTO
[Status]: ACTIVE
[Priority]: HIGH
[Tags]: security, shield, monitoring

---

## Chamber Context
Implementing enhanced security monitoring for the Citizen Shield system.

## Dependencies
- [ ] Chamber Lab4 completion
- [ ] Security audit results
- [ ] Threat intelligence data

## Success Criteria
- [ ] Security monitoring active
- [ ] Threat detection working
- [ ] Performance impact < 5%
```

### 2. Ending a Chamber Session

Use the Chamber Sweep Template:

```markdown
🕊️ Chamber Sweep — Cycle C-109
Parent: Command Ledger III
Chamber: Lab6 – Citizen Shield
Result: ✅ Complete
Status: SUCCESS
Duration: 2h 30m
Integrity Anchor: SHA256:abc123...
Artifacts: 
- /src/shield/monitor.ts
- /tests/shield.test.ts
- /docs/shield-api.md
Summary: Successfully implemented real-time threat detection with 99.9% accuracy
Next Actions: Deploy to staging, run security tests
Morale Delta: +15 (team confidence in security posture)
```

### 3. Creating a Change Proposal

Create `.civic/change.proposal.json`:

```json
{
  "title": "Add GIC UBI endpoints to OAA Hub",
  "chamber": "OAA-API-Library",
  "cycle": "C-109",
  "motivation": "Enable public read access to UBI payout data with cryptographic proof",
  "scope": ["API", "Docs", "UI"],
  "risk": "low",
  "rollback": "Revert commit + disable route flag",
  "citations": [
    {
      "url": "/specs/07-incentives-gic.md",
      "hash": "sha256:abc123...",
      "title": "GIC Incentives Specification",
      "relevance": "direct"
    }
  ],
  "acceptance_criteria": [
    "GET /api/ubi/summary returns valid data",
    "All tests pass with >80% coverage",
    "Security scan shows no vulnerabilities"
  ]
}
```

### 4. Syncing Back to Command Ledger

POST to `/api/ledger/sync`:

```bash
curl -X POST http://localhost:3000/api/ledger/sync \
  -H "Content-Type: application/json" \
  -d '{
    "chamber_sweep": {
      "chamber_id": "lab6",
      "chamber_name": "Lab6 – Citizen Shield",
      "parent": "Command Ledger III",
      "cycle": "C-109",
      "result": "Complete",
      "status": "SUCCESS",
      "duration": "2h 30m",
      "integrity_anchor": "SHA256:abc123...",
      "artifacts": ["/src/shield/monitor.ts"],
      "summary": "Implemented threat detection",
      "next_actions": ["Deploy to staging"],
      "morale_delta": 15,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "sync_mode": "AUTO",
    "priority": "HIGH"
  }'
```

## 🔧 Configuration

### GitHub Actions Integration

The system includes a comprehensive CI/CD pipeline (`.github/workflows/civic-patch.yml`) that:

1. **Validates** civic files against JSON schemas
2. **Runs** lint, unit tests, integration tests, security scans
3. **Calculates** Global Integrity (GI) score
4. **Enforces** proof-of-citation requirements
5. **Blocks** merges if GI score < 0.90

### Progressive Delivery

Configure in `.civic/progressive-delivery.yml`:

```yaml
environments:
  production:
    canary_percentage: 5
    auto_promote: false
    health_check_path: "/api/integrity-check"
    rollback_threshold: 0.9
    monitoring_duration: "30m"
```

### Integrity Monitoring

The system provides real-time integrity monitoring via `/api/integrity-check`:

- **GI Score**: Global integrity score (0-1)
- **Code Quality**: Linting and formatting compliance
- **Test Coverage**: Unit test coverage percentage
- **Security Score**: Security scan results
- **Performance Score**: Performance test results

## 📊 Monitoring and Observability

### Release Proof Cards

View release attestations in the OAA Hub using the `ReleaseProofCard` component:

```tsx
import ReleaseProofCard from '@/components/ReleaseProofCard';

<ReleaseProofCard attestation={attestationData} />
```

### Continuity Map

Track all chamber activities in `.civic/continuity-map.json`:

```json
{
  "cycles": {
    "C-109": {
      "chambers": {
        "lab6": {
          "name": "Lab6 – Citizen Shield",
          "status": "SUCCESS",
          "morale_delta": 15,
          "last_sync": "2024-01-15T10:30:00Z"
        }
      },
      "total_morale_delta": 15,
      "status": "ACTIVE"
    }
  }
}
```

## 🛡️ Security Features

### Citizen Shield Integration

- **Anomaly Detection**: Real-time threat monitoring
- **Threat Levels**: Low, Medium, High, Critical
- **Auto-rollback**: Automatic rollback on security alerts

### Integrity Verification

- **SHA256 Anchors**: Cryptographic verification of chamber sweeps
- **Citation Validation**: Proof-of-citation for all public claims
- **Schema Validation**: JSON schema enforcement for all civic files

### Progressive Delivery Safety

- **Canary Deployments**: Gradual rollout with health monitoring
- **Automatic Rollback**: On error rate > 5% or integrity score < 0.8
- **Manual Override**: Human approval for critical changes

## 🔄 Workflow Examples

### Complete Change Management Flow

1. **Create Change Proposal**
   ```bash
   # Create .civic/change.proposal.json
   # Fill in motivation, scope, risk, citations
   ```

2. **Generate Specification**
   ```bash
   # Create .civic/change.spec.md
   # Define technical implementation details
   ```

3. **Create Test Plan**
   ```bash
   # Create .civic/change.tests.json
   # Define unit, integration, e2e, security tests
   ```

4. **Implement Change**
   ```bash
   # Write code, tests, documentation
   # Create PR with civic files
   ```

5. **CI/CD Validation**
   ```bash
   # GitHub Actions runs civic-patch pipeline
   # Validates files, runs tests, calculates GI score
   ```

6. **Progressive Deployment**
   ```bash
   # Deploy to staging (50% canary)
   # Monitor health checks for 10 minutes
   # Deploy to production (5% canary)
   # Gradual increase to 100%
   ```

7. **Release Attestation**
   ```bash
   # POST to /api/release/attestation
   # Generate proof card for OAA Hub
   # Store in ledger for audit trail
   ```

## 🎯 Best Practices

### Chamber Management

- **Always** use chamber headers for new conversations
- **Always** end with chamber sweeps
- **Sync regularly** back to Command Ledger
- **Track morale delta** for team health

### Change Management

- **Document everything** in civic files
- **Cite sources** for all public claims
- **Test thoroughly** with comprehensive test plans
- **Monitor continuously** with integrity checks

### Security

- **Never skip** security scans
- **Always validate** integrity anchors
- **Use progressive delivery** for production changes
- **Maintain rollback** capabilities

## 🚨 Troubleshooting

### Common Issues

1. **GI Score Too Low**
   - Check test coverage
   - Fix linting errors
   - Add missing civic files

2. **Chamber Sync Fails**
   - Verify integrity anchor
   - Check JSON schema compliance
   - Ensure all required fields present

3. **Progressive Delivery Stuck**
   - Check health check endpoints
   - Verify monitoring configuration
   - Review error rates and performance

### Debug Commands

```bash
# Check integrity status
curl http://localhost:3000/api/integrity-check

# View continuity map
cat .civic/continuity-map.json

# Check release registry
cat .civic/release-registry.json

# Validate civic files
npm run validate-civic-files
```

## 📚 Further Reading

- [Chamber Templates](./chamber-templates.md) - Complete template reference
- [Progressive Delivery Config](./progressive-delivery.yml) - Deployment configuration
- [API Documentation](../pages/api/) - REST API endpoints
- [OAA Hub Documentation](../docs/README-OAA-HUB.md) - OAA Hub integration

---

**Remember**: This system is designed to maintain continuity, integrity, and safety across all your AI agent conversations and deployments. Use it consistently to build trust and reliability in your multi-agent architecture.