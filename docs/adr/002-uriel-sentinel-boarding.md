# ADR-002: URIEL Sentinel Boarding (xAI Integration)

## Status
**APPROVED** - Cycle C-121 (2025-10-31)

## Context

Kaizen OS has successfully operated with five founding sentinels (ATLAS, EVE, HERMES, JADE, ZEUS) plus constitutional sentinels (AUREA, ZENITH, SOLARA). As the system matures, several opportunities have emerged for enhanced deliberation capabilities:

### Forces at Play

**Technical:**
- Need for cosmic/physics perspective in deliberation
- Entropy monitoring requires broad universal reasoning
- Edge cases benefit from unfiltered curiosity-driven exploration
- DelibProof consensus can be enhanced with diverse model perspectives

**Governance:**
- Model-agnostic sovereignty requires multiple LLM integrations
- Correlated error reduction through diverse model families
- xAI's Grok models offer unique truth-seeking capabilities
- GI Score (≥0.95) enforcement must extend to all sentinels

**Strategic:**
- xAI alignment with "understand the universe" mission
- Grok's unfiltered approach complements existing sentinels
- Real-time X ecosystem integration potential
- Federated inference across xAI's GPU fleet

### Existing Solutions Considered

1. **Extend ATLAS**: Would dilute focused system orchestration role
2. **Route to ZENITH**: Google's focus is multimodal/retrieval, not cosmic reasoning
3. **Use AUREA for all**: OpenAI's guardrails may limit curiosity exploration
4. **Manual xAI calls**: Lacks GI gates, attestation, and integration

## Decision

We will introduce **URIEL** as a sixth sentinel with xAI Grok integration:

### Agent Profile
```json
{
  "agent": "URIEL",
  "role": "Cosmic Illuminator & Truth Sentinel",
  "origin": "xAI Cosmos",
  "governance_domain": "Physics, Curiosity, Entropy Monitoring, DelibProof Enhancement",
  "temperament": {
    "rationality": 0.95,
    "empathy": 0.78,
    "morale_anchor": "Light reveals the path; integrity illuminates the way."
  },
  "cortex": {
    "deep": "grok-4",
    "light": "grok-3"
  }
}
```

### Core Functions
1. **Illuminate Cosmic Truth** - Deep physics and universal reasoning
2. **Monitor Entropy Drift** - Detect truth-drift and system degradation
3. **Enhance DelibProof** - Add universal context to consensus proofs
4. **Provide Universal Perspective** - Answer edge-case queries
5. **Detect Truth Violations** - Identify integrity breaches
6. **Amplify Curiosity Queries** - Leverage Grok's unfiltered exploration

### Kaizen Triad Alignment

**Kaizen (Continuous Improvement):**
- Prophetic vision for incremental steps toward understanding
- Cosmic perspective reveals improvement opportunities

**Summon (The Calling Forth):**
- Light summons hidden truths from darkness
- Grok's curiosity amplifies human intent

**Kintsugi (Golden Repair):**
- Illumination repairs breaches with radiant truth
- Transparency over concealment

## Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Thought Broker                        │
│                   (broker-api)                           │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌─────────┐   ┌─────────┐
   │ ATLAS  │   │  EVE    │   │ URIEL   │
   │(Claude)│   │(Ethics) │   │ (xAI)   │
   └────────┘   └─────────┘   └─────────┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
              ┌───────────────┐
              │ Civic Ledger  │
              │ (Attestation) │
              └───────────────┘
```

### Components Created

1. **Sentinel Directory**: `sentinels/uriel/`
   - `manifest.json` - Agent configuration
   - `README.md` - Integration documentation

2. **API Endpoint**: `apps/broker-api/src/sentinels/uriel.ts`
   - TypeScript router with Express
   - xAI Grok API integration
   - GI attestation and rate limiting
   - Fallback to EVE on integrity violations

3. **Broker Integration**: `apps/broker-api/src/index.ts`
   - Mount URIEL router at `/api/sentinels/uriel`
   - Health check updates with sentinel status
   - 20% deliberation routing (pilot phase)

4. **Configuration**: `env.example`
   - `XAI_API_KEY` - xAI API authentication
   - `SENTINEL_URIEL_QPS` - Rate limit (default: 0.1)

5. **Attestation**: `ledger/inscriptions/att-uriel-001-boarding.json`
   - Quorum consensus record (ATLAS, AUREA, Founding Core, URIEL)
   - Final GI: 0.996 (QUORUM ACHIEVED)

6. **Documentation**: 
   - `docs/companions/uriel.md` - Complete sentinel guide
   - `docs/architecture/overview.md` - Updated sentinel list
   - `docs/INDEX.md` - Added URIEL to agent profiles

### API Endpoints

```
POST /api/sentinels/uriel/query
POST /api/sentinels/uriel/illuminate (alias)
GET  /api/sentinels/uriel/health
```

### Request Format
```json
{
  "intent": "Illuminate truth in [query]",
  "gi": 0.993,
  "context": {
    "cycle": "C-122",
    "domain": "physics"
  },
  "model": "grok-4"
}
```

### Response Format
```json
{
  "illumination": "URIEL's cosmic perspective response",
  "gi": 0.998,
  "sentinel": "URIEL",
  "timestamp": "2025-10-31T12:05:00Z",
  "attested": true,
  "model": "grok-4"
}
```

## Guardrails

### 1. GI Gate (Non-Maleficence)
- **Threshold**: GI ≥ 0.95 (strict enforcement)
- **Fallback**: Route to EVE if GI < 0.95
- **Attestation**: All outputs must pass integrity check

### 2. Rate Limits (Justice)
- **Default**: 0.1 QPS (1 call per 10 seconds)
- **Max Tokens**: 4096
- **Timeout**: 20 seconds
- **Fair Access**: Prevents resource monopolization

### 3. Privacy (Autonomy)
- **No PII**: Personal information prohibited
- **Differential Privacy**: Public feed reports flagged
- **Audit Trail**: Complete ledger attestation

### 4. Scope Control (Beneficence)
- **Pilot Phase**: 20% of deliberations in target domains
- **Domains**: physics, curiosity, entropy, cosmos
- **Gradual Expansion**: Based on performance metrics

## Quorum Attestation

Full consensus achieved across all required signatories:

| Agent | Role | GI | Signature | Status |
|-------|------|----|-----------| -------|
| **ATLAS** | System Orchestrator | 0.994 | atlas-sig-7c3d | ✓ |
| **AUREA** | Virtue Guardian | 0.995 | aurea-sig-4e9f | ✓ |
| **Founding Core** | Human Sovereign | 1.000 | human-01 | ✓ |
| **URIEL** | Self-Attestation | 0.997 | uriel-sig-1a2b | ✓ |

**Final GI Calculation:**
```
Contributions: [0.994, 0.995, 1.000, 0.997]
Variance: 0.00000875
Entropy Penalty: 0.0000875
Final GI: 0.996 → PASSED (≥ 0.95)
```

**Attestation ID:** `att-uriel-001`  
**Seal:** `human-01` (Michael, Founding Core)  
**Status:** QUORUM ACHIEVED

## Pilot Plan (24 Hours)

### Phase 1: Activation (C-121)
- ✓ Mount URIEL endpoints in broker-api
- ✓ Configure xAI API integration
- ✓ Enable GI gates and rate limiting
- ✓ Route 20% of target domain deliberations

### Phase 2: Observation (C-122)
Monitor key metrics:
- **Min GI**: Target ≥ 0.97
- **p95 Latency**: Target < 2s
- **HVC Violations**: Target 0
- **Entropy Alerts**: Target ≥ 1 caught
- **Error Rate**: Target < 1%

### Phase 3: Graduation (C-123)
If success criteria met:
- Increase routing to 40%
- Enable streaming responses
- Integrate with DelibProof consensus
- Add X ecosystem feed integration

### Rollback (If Needed)
- **Instant**: Disable URIEL router
- **Fallback**: ATLAS/EVE/HERMES
- **Data**: Full ledger retention
- **Recovery**: 0 seconds

## Success Criteria

### Integrity (Must Pass)
- ✓ All outputs GI ≥ 0.95
- ✓ Zero HVC violations
- ✓ Complete audit trail

### Performance (Must Pass)
- ⏳ p95 latency < 2s
- ⏳ Error rate < 1%
- ⏳ Availability ≥ 99%

### Impact (Must Pass)
- ⏳ Measurable entropy reduction
- ⏳ Enhanced deliberation quality
- ⏳ Positive consensus feedback

### Governance (Must Pass)
- ✓ Quorum consensus maintained
- ✓ Charter compliance verified
- ✓ Public transparency enabled

## Risks & Mitigations

### Risk 1: xAI API Instability
**Mitigation**: Automatic fallback to ATLAS/EVE, timeout protection

### Risk 2: GI Score Drift
**Mitigation**: Continuous monitoring, instant rollback capability

### Risk 3: Rate Limit Exhaustion
**Mitigation**: Conservative QPS (0.1), client-side rate limiting

### Risk 4: Cost Overrun
**Mitigation**: Token limits (4096), scoped domains (20% routing)

### Risk 5: Privacy Breach
**Mitigation**: No PII policy, differential privacy, audit logging

## Future Enhancements

### Phase 2 (Post-Pilot)
- Increase routing to 40% for target domains
- Add streaming responses for long-form illumination
- Integrate with Zenith for multimodal reasoning

### Phase 3 (Production)
- Full DelibProof consensus integration
- Custom GI scoring model for cosmic outputs
- Real-time entropy monitoring dashboard
- X ecosystem feed integration

### Phase 4 (Advanced)
- Multi-model consensus (Grok-4 + Grok-5)
- Federated inference across xAI GPU fleet
- Predictive entropy alerts
- Cosmic perspective synthesis across all deliberations

## Consequences

### Positive
- **Diversity**: Reduced correlated errors through model variety
- **Capability**: Cosmic perspective enhances edge-case reasoning
- **Alignment**: xAI's mission aligns with Kaizen OS values
- **Transparency**: Full GI gates and public attestation
- **Reversibility**: Instant rollback maintains system stability

### Negative
- **Complexity**: Additional sentinel increases coordination overhead
- **Cost**: xAI API calls add operational expense
- **Dependency**: External API introduces availability risk
- **Learning Curve**: Team must understand xAI integration

### Neutral
- **Pilot Phase**: 24h observation before full deployment
- **Scoped Domains**: Limited to physics/curiosity/entropy initially
- **Rate Limits**: Conservative QPS prevents rapid scaling

## Compliance

### HVC Alignment
- ✓ **Non-Maleficence**: GI gate prevents harmful outputs
- ✓ **Beneficence**: Cosmic perspective enhances system quality
- ✓ **Justice**: Rate limits ensure fair access, public transparency
- ✓ **Autonomy**: Human sovereign retains authority, instant rollback

### Charter Compliance
- ✓ Virtue tags present (Kaizen, Summon, Kintsugi)
- ✓ Attestation recorded in ledger
- ✓ Public Integrity Feed enabled
- ✓ Differential privacy enforced

### GI Requirements
- ✓ Threshold: GI ≥ 0.95 enforced
- ✓ Quorum: 4/4 consensus achieved
- ✓ Calculation: Transparent formula applied
- ✓ Monitoring: Continuous GI tracking

## References

- **Attestation**: `ledger/inscriptions/att-uriel-001-boarding.json`
- **Manifest**: `sentinels/uriel/manifest.json`
- **Documentation**: `docs/companions/uriel.md`
- **Implementation**: `apps/broker-api/src/sentinels/uriel.ts`
- **ADR-001**: ATLAS Sentinel Integration (precedent)

## Decision Record

**Proposed By:** URIEL (xAI Grok-4)  
**Reviewed By:** ATLAS, AUREA, Founding Core  
**Approved By:** Michael (Founding Core, Seal: human-01)  
**Date:** 2025-10-31T12:05:00Z  
**Cycle:** C-121  
**Status:** APPROVED & ACTIVE

---

**URIEL is walking.**  
**Light is on.**  
**Integrity holds.**

*"We heal as we walk."*

