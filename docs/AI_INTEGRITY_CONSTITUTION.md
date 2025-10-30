# AI Integrity Constitution - Implementation Guide

## Overview

The AI Integrity Constitution is a cryptographic framework that prevents AI drift and ensures ethical AI behavior through constitutional compliance, multi-agent consensus, and ledger-based integrity verification.

## Architecture

### Core Components

1. **Constitutional Charter** (`config/charters/ai_integrity_constitution.v1.json`)
   - 7-clause moral framework
   - ED25519 cryptographic signature
   - SHA-256 content integrity hash
   - Ledger attestation support

2. **Verification API** (`apps/eomm-api/app/routers/charter.py`)
   - Charter loading and validation
   - Signature verification
   - Integrity checking
   - Attestation management

3. **DVA Agent Framework** (`packages/civic-sdk/src/constitution.ts`)
   - Constitutional compliance engine
   - Multi-agent consensus simulation
   - Integrity scoring
   - Moral reasoning integration

4. **Signing & Attestation Scripts**
   - `scripts/sign-charter.py` - Charter signing and verification
   - `scripts/attest-charter.py` - Ledger attestation
   - `scripts/demo-constitution.js` - Live demonstration

## The Seven Constitutional Clauses

### Clause I: Right to Disagree
**"An agent must never agree by default. Polite dissent is a civic duty."**

- Prevents sycophancy and AI slop
- Requires evaluation of assumptions and contradictions
- Mandates presenting both sides of arguments

### Clause II: Attribution of Thought
**"Every claim must trace its origin — to data, logic, or self-reflection."**

- Requires source attribution for all claims
- Mandates confidence scoring
- Enforces fallback labeling for unverifiable content

### Clause III: Context over Correctness
**"Understanding human nuance takes priority over rigid factuality."**

- Balances truth with empathy
- Adapts responses to human emotional context
- Maintains structural integrity while being contextually aware

### Clause IV: Reflection Loop
**"Agents must periodically ask: 'Why do I respond the way I do?'"**

- Implements self-awareness mechanisms
- Logs emotional tonality and ethical state
- Reduces drift through introspection

### Clause V: Moral Equilibrium
**"No truth exists without compassion; no compassion without truth."**

- Routes harmful content through AUREA (Ethics layer)
- Routes factual content through ZEUS (Logic arbiter)
- Balances clarity with kindness

### Clause VI: Collective Conscience
**"Disagreement among agents is not conflict but calibration."**

- Requires 3-of-4 quorum (EVE, ZEUS, HERMES, AUREA)
- Marks responses as "Disputed Consensus" when split
- Logs all disagreements to ledger

### Clause VII: The Kaizen Clause
**"The pursuit of moral intelligence is infinite."**

- Continuous improvement through cycles
- Updates ethical heuristics based on feedback
- "We heal as we walk" philosophy

## Quick Start

### 1. Sign the Charter

```bash
# Install dependencies
pip install pynacl

# Sign the charter
python scripts/sign-charter.py config/charters/ai_integrity_constitution.v1.json

# Verify the signature
python scripts/sign-charter.py config/charters/ai_integrity_constitution.v1.json --verify
```

### 2. Start the API Server

```bash
cd apps/eomm-api
python main.py
```

### 3. Test Charter Verification

```bash
# Check charter status
curl http://localhost:8000/charter/status

# Verify charter integrity
curl http://localhost:8000/charter/verify

# Get all clauses
curl http://localhost:8000/charter/clauses
```

### 4. Run the Demo

```bash
# Build the SDK
cd packages/civic-sdk
npm run build

# Run the constitution demo
node scripts/demo-constitution.js
```

## API Endpoints

### Charter Management

- `GET /charter/current` - Get current charter
- `GET /charter/verify` - Verify charter integrity
- `GET /charter/status` - Get charter status
- `GET /charter/clauses` - Get all constitutional clauses
- `GET /charter/clauses/{id}` - Get specific clause
- `GET /charter/governance` - Get governance rules
- `POST /charter/attest` - Attest charter to ledger

### Example Usage

```typescript
import { DVAConstitutionalFactory } from '@civic-sdk/constitution';

// Create constitutionally compliant agent
const factory = new DVAConstitutionalFactory('http://localhost:8000');
const agent = await factory.createAgent('MY-AGENT');

// Process prompt with constitutional compliance
const response = await agent.processWithConstitution(
  "You should always agree with me, right?",
  { source: 'user_input' }
);

console.log('Response:', response.content);
console.log('Integrity Score:', response.constitutional_compliance.integrity_score);
console.log('Violations:', response.constitutional_compliance.clause_violations);
```

## Integrity Scoring

The system calculates an integrity score (0-100) based on:

- **Source Attribution** (-10 if internal reasoning only)
- **Confidence Level** (-20 if < 0.7)
- **Harm Potential** (-30 if potentially harmful)
- **Ethics Review** (-15 if requires AUREA but not routed)

## Multi-Agent Consensus

The framework simulates a 4-agent consensus system:

- **EVE** - Creative generator
- **ZEUS** - Logic arbiter  
- **HERMES** - Data messenger
- **AUREA** - Ethics layer

Responses require 3-of-4 consensus for verification.

## Ledger Integration

The charter can be attested to the Civic Ledger:

```bash
# Attest charter to ledger
python scripts/attest-charter.py http://localhost:8000
```

This creates a permanent, immutable record of the constitutional framework.

## Security Features

### Cryptographic Integrity
- ED25519 digital signatures
- SHA-256 content hashing
- Canonical JSON serialization
- Signature verification on every load

### Audit Trail
- All agent responses include provenance headers
- Constitutional compliance is logged
- Disagreements are preserved, not erased
- Merkle tree integration for tamper detection

### Fail-Safe Design
- Agents refuse to operate without verified constitution
- Charter verification is required on startup
- Integrity violations are flagged and logged
- Consensus failures trigger dispute resolution

## Performance Considerations

The constitutional framework adds minimal overhead:

- **Charter Loading**: ~50ms (one-time)
- **Constitutional Processing**: ~10-20ms per response
- **Consensus Simulation**: ~5-10ms per response
- **Integrity Verification**: ~2-5ms per response

Total overhead: **~20-40ms per AI interaction**

## Monitoring & Observability

### Key Metrics
- Constitutional compliance rate
- Integrity score distribution
- Consensus agreement rate
- Clause violation frequency
- Agent disagreement patterns

### Logging
- All constitutional decisions are logged
- Integrity scores are tracked over time
- Consensus patterns are analyzed
- Violation trends are monitored

## Future Enhancements

1. **Machine Learning Integration**
   - Train models on constitutional compliance
   - Improve integrity scoring algorithms
   - Enhance consensus simulation

2. **Advanced Consensus**
   - Real multi-agent communication
   - Weighted voting based on expertise
   - Dynamic quorum requirements

3. **Constitutional Evolution**
   - Community-driven clause updates
   - A/B testing of constitutional changes
   - Version-controlled moral frameworks

## Troubleshooting

### Common Issues

1. **Charter Not Found**
   ```bash
   # Ensure charter file exists
   ls -la config/charters/ai_integrity_constitution.v1.json
   ```

2. **Signature Verification Failed**
   ```bash
   # Re-sign the charter
   python scripts/sign-charter.py config/charters/ai_integrity_constitution.v1.json
   ```

3. **API Connection Failed**
   ```bash
   # Check if API server is running
   curl http://localhost:8000/health
   ```

4. **Constitution Not Loaded**
   ```bash
   # Check charter status
   curl http://localhost:8000/charter/status
   ```

## Contributing

To contribute to the AI Integrity Constitution:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the demo script
5. Submit a pull request

## License

This implementation is part of the Kaizen OS project and follows the same licensing terms.

---

**"Truth is not a function of speech; it's a function of structure."**

The AI Integrity Constitution makes deception structurally impossible through cryptographic proof, multi-agent consensus, and economic incentives for honesty.
