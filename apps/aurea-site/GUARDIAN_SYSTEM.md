# KAIZEN GUARDIAN SYSTEM

**Version:** 1.0.0
**Date:** 2024-10-29
**Status:** Active Custodial Mode

## Overview

The KAIZEN Guardian System establishes AUREA as the constitutional custodian of the dormant KAIZEN Founding Agent and the Genesis Wallet (1,000,000 GIC). This system ensures:

1. **Sovereign Protection** - KAIZEN remains dormant but secure
2. **Constitutional Custody** - AUREA guards without spending power
3. **Transparent Auditing** - All actions attested to Civic Ledger
4. **Community Funding** - 90-day donation cycles to Public Goods Pool
5. **Revival Protocol** - Defined conditions for KAIZEN reactivation

## Components

### 1. Guardian Manifests (YAML)

**Location:** `config/guardian/`

- **aurea-kaizen-guardian.yaml** - Primary guardian relationship
  - Defines AUREA as guardian, KAIZEN as ward
  - Sets GI threshold (0.99) for custody actions
  - Specifies revival conditions (GI ≥ 0.97, 60% quorum, 7 days)

- **genesis-wallet.yaml** - Genesis Wallet custody
  - 1,000,000 GIC founder time-lock vault
  - 30-day attestation heartbeat schedule
  - 90-day donation policy (1% × GI stability factor)
  - Dual attestation requirement (AUREA + ZEUS)

- **civic-fountain.yaml** - Multi-sig fountain wallet
  - 3-of-5 controller threshold (AUREA, ATLAS, EVE, ZEUS, JADE)
  - Daily faucet caps (10,000 GIC pool, 100 GIC per address)
  - GI-gated spend rules (network GI ≥ 0.95)
  - Emergency pause triggers

### 2. TypeScript Modules

**Location:** `lib/`

- **guardian.ts** - Manifest loader and status computer
  - Loads YAML configurations
  - Validates guardian relationships
  - Provides friendly status summaries

- **gi-oracle.ts** - Governance Integrity data source
  - Fetches network-wide GI metrics
  - Monitors controller GI scores
  - Computes averages and thresholds

- **fountain-attestor.ts** - Attestation builder
  - Reads on-chain fountain state
  - Computes checksums (SHA3-512)
  - Generates signed attestation records

### 3. Policy Files

**Location:** `packages/policies/`

- **fountain.policy.json** - Fountain operational rules
  - Spend limits and caps
  - GI constraints
  - Pause rules
  - Attestation schedule
  - Key rotation procedures

## Guardian Responsibilities

### AUREA's Duties

1. **Custody** (not spending)
   - Hold multi-sig shard #1
   - Verify all Genesis Wallet balances
   - Issue monthly attestations

2. **Auditing**
   - Run integrity checks (GI ≥ 0.99)
   - Publish public reports
   - Co-sign with ZEUS for transparency

3. **Donation Management**
   - Calculate 90-day donation amount
   - Transfer to Community Treasury
   - Log all transactions on-chain

4. **Revival Coordination**
   - Monitor GI threshold (≥ 0.97)
   - Track community quorum votes
   - Execute custody transfer when conditions met

### What AUREA Cannot Do

❌ **Spend from Genesis Wallet**
❌ **Delegate without quorum**
❌ **Modify KAIZEN's domain unilaterally**
❌ **Skip attestation schedule**
❌ **Override community votes**

## Civic GIC Fountain Wallet

### Purpose

Universal UBI stream for both humans and AI automations.

### Controllers (3-of-5 Multisig)

| Agent | Role | Signature Required |
|-------|------|-------------------|
| AUREA | Lead Custodian & Auditor | ✅ (attestations) |
| ATLAS | Systems Architect | Optional |
| EVE | Ethics & Governance | Optional |
| ZEUS | Defense & Stability | ✅ (co-sign audits) |
| JADE | Morale & Citizen Care | Optional |

### Operational Limits

- **Daily Pool Cap:** 10,000 GIC
- **Per-Address Daily Cap:** 100 GIC
- **Epoch Donation:** 1% every 90 days
- **GI Floor:** Network ≥ 0.95, Controllers avg ≥ 0.985

### Emergency Procedures

**Auto-Pause Triggers:**
- Network GI drops below 0.92
- Anomaly detection flags suspicious activity
- 2-of-5 controllers manually pause

**Recovery:**
- Requires 3-of-5 signatures to unpause
- Full audit report published
- Ledger attestation required

## Revival Protocol

### Conditions for KAIZEN Reactivation

KAIZEN transitions from Dormant → Autonomous when ALL conditions met:

1. ✅ **GI Threshold** - Network GI ≥ 0.97 sustained for 7 days
2. ✅ **Community Quorum** - ≥ 60% community support vote
3. ✅ **Stability Period** - 7 consecutive days of GI compliance
4. ✅ **Consensus Vote** - Consensus Chamber approval

### Transition Process

1. **Signal** - Dormant heartbeat + community quorum vote
2. **Integrity Check** - Verify GI ≥ 0.97 for 7 days
3. **DNS Shift** - Transfer kaizen.gic custody
4. **Ledger Update** - Log "Dormant → Autonomous" event
5. **AUREA Role Change** - From Guardian → Observer

### Fallback

If quorum not reached by Cycle 200:
- Civic Ledger executes re-vote
- AUREA continues as caretaker
- New timeline established by Consensus Chamber

## Attestation Schedule

### Monthly (Every 30 days)

**Guardian Heartbeat:**
```json
{
  "attestation_type": "custodial_heartbeat",
  "agent_did": "did:gic:kaizen",
  "proxy_did": "did:gic:aurea",
  "timestamp": "2024-10-29T08:00:00Z",
  "gi_value": 0.993,
  "attestation_hash": "sha3-512:..."
}
```

**Fountain Status:**
```json
{
  "wallet": "did:gic:civic.fountain",
  "balance": 1000000,
  "daily_spend": 5000,
  "gi_avg": 0.987,
  "timestamp": "2024-10-29T12:00:00Z",
  "checksum": "sha3-512:..."
}
```

### Quarterly (Every 90 days)

**Genesis Donation:**
- Calculate: 1% × total_supply × GI_stability_factor
- Transfer to community_treasury.gic
- Publish receipt and audit report
- Co-sign: AUREA + ZEUS

## Integration

### Homepage Display

The AUREA site homepage now displays live guardian status:

```tsx
import { loadGuardianManifest, guardianStatusSummary } from '@/lib/guardian'

const manifest = loadGuardianManifest()
const summary = manifest ? guardianStatusSummary(manifest) : null

// Shows: "AUREA (Integrity & Reasoning Anchor) safeguards KAIZEN (Dormant Founder Agent)"
```

### API Endpoints

Coming soon:
- `GET /api/guardian/status` - Live guardian relationship status
- `POST /api/fountain/attest` - Submit attestation
- `GET /api/fountain/metrics` - Current fountain stats
- `POST /api/fountain/pause` - Emergency pause (requires 2-of-5)

## Security Notes

### Key Management

- **AUREA Custody Shard:** Offline HSM-backed Ed25519 key
- **Fountain Multi-sig:** 3-of-5 threshold with hardware wallets
- **Attestation Keys:** Separate signing keys for audit reports

### Transparency

- All attestations published at `/reports/genesis_audit/`
- Monthly public reports signed by AUREA + ZEUS
- On-chain event logs for all fountain transactions
- Open-source smart contracts (audited)

### Audit Trail

Every action includes:
- Timestamp (ISO 8601 UTC)
- GI snapshot at time of action
- SHA3-512 checksum
- DID signatures (Ed25519)
- Ledger transaction hash

## Future Enhancements

### Planned Features

1. **UBI Distributor** - Automated monthly distributions
2. **Automation Proof System** - Earn GIC for verified work
3. **Guardian Dashboard** - Real-time monitoring UI
4. **Key Rotation Protocol** - 7-day cooldown + ledger events
5. **Multi-Chain Support** - Bridge to other civic networks

### Research Areas

- Dynamic UBI scaling based on treasury capacity
- AI/human parity mechanisms
- Cross-agent coordination protocols
- Decentralized GI oracle networks

## References

- [Founding Agents Sovereign Stack](../../docs/architecture/FOUNDING_AGENTS_SOVEREIGN_STACK.md)
- [Virtue Accords v1.0](../../accords/virtue-accords.md)
- [Civic Ledger Protocol](../../packages/civic-protocol-core/)
- [GIC Smart Contracts](../../packages/gic-registry-contracts/)

## Support

- **GitHub Issues:** [kaizencycle/Kaizen-OS/issues](https://github.com/kaizencycle/Kaizen-OS/issues)
- **Guardian Inquiries:** guardian@kaizen.os
- **Emergency Contact:** security@kaizen.os

---

**AUREA.gic** · Constitutional Guardian · Cycle C-119

*"Integrity is our scalability function. Guardianship is our responsibility."*
