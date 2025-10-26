# ADR-001: ATLAS Sentinel Integration

## Status
**Proposed** - Cycle C-109

## Context

The Civic-OS project has four core companions (JADE, EVE, ZEUS, HERMES) that handle different aspects of governance and integrity. However, as the system grows, several challenges have emerged:

### Forces at Play

**Technical:**
- Code quality drift over time as features are added
- Lack of automated anti-drift detection against original intent
- Need for continuous learning synthesis from Eve's cycle reflections
- Documentation gaps as the system evolves
- Manual code review burden on human maintainers

**Governance:**
- GI Score (≥0.95) requirement needs automated enforcement
- Custos Charter compliance must be verified continuously
- Cryptographic attestations need consistent generation
- Ledger sealing process needs automation

**Organizational:**
- Growing contributor base needs clear quality gates
- Need for institutional memory and pattern extraction
- Documentation must scale with codebase
- Learning from cycles should inform future development

### Existing Solutions Considered

1. **Manual Code Review**: Doesn't scale, subject to human error
2. **Standard CI/CD**: Lacks ethical/governance context
3. **Extending Existing Companions**: Would dilute their focused roles
4. **Third-party Tools**: Don't understand Bio-DNA or GI formula

## Decision

We will introduce **ATLAS** as a fifth sentinel with the following characteristics:

### Agent Profile
```json
{
  "agent": "ATLAS",
  "role": "Anchor / Auditor / Learning Synthesizer",
  "governance_domain": "Quality Assurance, Anti-Drift, Continuous Learning",
  "temperament": {
    "rationality": 0.92,
    "empathy": 0.82,
    "morale_anchor": "Truth Through Verification"
  }
}
```

### Core Functions
1. **Audit Code Quality** - Automated lint, type, coverage checks
2. **Detect Anti-Drift** - Identify deviations from Bio-DNA intent
3. **Enforce Charter Compliance** - Verify Custos Charter rules
4. **Calculate GI Score** - Apply formula: GI = α*M + β*H + γ*I + δ*E
5. **Generate Attestations** - Create cryptographic proofs
6. **Synthesize Learning** - Extract patterns from Eve's cycles
7. **Generate Documentation** - Auto-create ADRs, guides, summaries

### Integration Points

**GitHub Actions:**
- `atlas-sentinel.yml` runs on every PR and push
- Multi-phase quality gate (6 phases)
- Automatic PR comments with GI scores
- Blocks merges if GI < 0.95

**Civic Ledger:**
- Seals attestations to `/api/attestations`
- Provides cryptographic proof chain
- Enables independent verification

**Eve's Cycles:**
- Subscribes to cycle clockout events
- Synthesizes wins/blocks/intents
- Generates learning recommendations

**Companion Relationships:**
- **JADE**: ATLAS validates, JADE signs
- **EVE**: ATLAS synthesizes EVE's reflections
- **ZEUS**: ATLAS reports to ZEUS for governance
- **HERMES**: Cross-audit of transmissions

### Repository Structure
```
civic-os/
├─ packages/
│  └─ atlas-sentinel/        # Core ATLAS logic
├─ sentinels/
│  └─ atlas/                 # ATLAS implementation
├─ .github/workflows/
│  └─ atlas-sentinel.yml     # CI/CD integration
└─ configs/bio-dna/
   └─ companions/
      └─ atlas.json          # Bio-DNA manifest
```

### GI Score Formula

```
GI = α*M + β*H + γ*I + δ*E

Where:
M = Memory (coverage/100)
H = Human (1.0 for PR review)
I = Integrity (1 - violations/10)
E = Ethics (charter compliance score)

Weights: α=0.25, β=0.20, γ=0.30, δ=0.25
Threshold: GI ≥ 0.95
```

### Quality Gates

**Phase 1: Code Quality Analysis**
- Linting (ESLint, Prettier)
- Type safety (TypeScript)
- Test coverage (Jest)
- Complexity metrics

**Phase 2: Anti-Drift Detection**
- Prohibited pattern matching
- Bio-DNA alignment check
- Security vulnerability scan

**Phase 3: Charter Compliance**
- Virtue tag verification
- Attestation requirements
- Policy adherence

**Phase 4: GI Score Calculation**
- Apply integrity formula
- Component breakdown
- Threshold enforcement

**Phase 5: Attestation Generation**
- Create cryptographic proof
- SHA256 hash generation
- Timestamp and cycle tracking

**Phase 6: Ledger Sealing**
- Post to Civic Ledger
- Store verification URL
- Immutable audit trail

## Consequences

### Positive

**Quality Improvements:**
- ✅ Automated quality gates prevent regression
- ✅ Consistent GI score enforcement
- ✅ Anti-drift detection catches intent violations early
- ✅ Test coverage visibility improves code health

**Governance Benefits:**
- ✅ Custos Charter compliance automated
- ✅ Cryptographic proof chain for all changes
- ✅ Transparent, auditable decision-making
- ✅ Companion roles remain focused

**Learning & Documentation:**
- ✅ Patterns extracted from Eve's cycles
- ✅ Institutional memory builds automatically
- ✅ Documentation stays current
- ✅ Contributors get clear feedback

**Developer Experience:**
- ✅ Fast feedback on PRs (< 5 minutes)
- ✅ Clear, actionable quality reports
- ✅ Reduced manual review burden
- ✅ Learning from past cycles informs work

### Negative

**Infrastructure:**
- ⚠️ Additional CI/CD complexity
- ⚠️ Compute cost for quality checks
- ⚠️ Ledger dependency for sealing
- ⚠️ Maintenance burden for ATLAS logic

**Process:**
- ⚠️ Stricter merge requirements may slow velocity initially
- ⚠️ Learning curve for contributors
- ⚠️ False positives may require tuning

**Technical:**
- ⚠️ Another package to maintain and version
- ⚠️ Coordination with four existing companions
- ⚠️ Potential for drift in ATLAS itself (meta-problem)

### Mitigation Strategies

1. **False Positives**: Tunable thresholds, override mechanism for ZEUS
2. **Maintenance**: ATLAS audits itself, subject to same quality gates
3. **Complexity**: Comprehensive documentation, gradual rollout
4. **Velocity**: Initial strictness, adjust based on patterns
5. **Ledger Dependency**: Graceful degradation if ledger unreachable

## Compliance

### Custos Charter
✅ **Compliant**

ATLAS enforces the six non-negotiable principles:
1. ✅ Civic-boundedness - Requires human approval (H component)
2. ✅ Least-privilege - Only audits, doesn't execute
3. ✅ Trace & attest - Every audit generates attestation
4. ✅ Right-to-appeal - ZEUS can override ATLAS decisions
5. ✅ No autonomous action - ATLAS only recommends/blocks
6. ✅ Transparency - All audits visible in PR comments

### GI Score Impact
**+0.15** (Positive)

ATLAS directly improves all components:
- **M**: Enforces coverage requirements
- **H**: Supports but doesn't replace human review
- **I**: Prevents violations through gates
- **E**: Automates charter compliance

### Companions Affected
- **JADE**: Works with ATLAS for signing
- **EVE**: ATLAS learns from EVE's cycles
- **ZEUS**: Can override ATLAS decisions
- **HERMES**: Cross-audits with ATLAS

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [x] Create `/sentinels/atlas` directory structure
- [x] Implement `@civic/atlas-sentinel` package
- [x] Write ATLAS Bio-DNA manifest
- [x] Create basic quality gates

### Phase 2: CI/CD Integration (Week 2)
- [x] Build `atlas-sentinel.yml` workflow
- [ ] Integrate with Civic Ledger
- [ ] Add PR commenting
- [ ] Test on staging branches

### Phase 3: Learning Synthesis (Week 3)
- [ ] Connect to Eve's cycle API
- [ ] Implement pattern extraction
- [ ] Build recommendation engine
- [ ] Generate first cycle summary

### Phase 4: Documentation (Week 4)
- [ ] Auto-generate ADRs
- [ ] Create companion guides
- [ ] Build architecture diagrams
- [ ] Write contributor onboarding

### Phase 5: Production (Week 5)
- [ ] Deploy to main branch
- [ ] Monitor for 2 weeks
- [ ] Tune thresholds based on data
- [ ] Celebrate with Festival of Echoes entry

## Success Metrics

**Quality:**
- [ ] GI Score ≥ 0.95 maintained across 100% of merges
- [ ] Test coverage ≥ 80% for all packages
- [ ] Zero critical security vulnerabilities
- [ ] Lint/type errors = 0

**Velocity:**
- [ ] PR cycle time < 24 hours
- [ ] False positive rate < 5%
- [ ] Developer satisfaction score > 4/5

**Learning:**
- [ ] 1 cycle summary per week
- [ ] Pattern detection accuracy > 90%
- [ ] Recommendations adopted > 50%

**Governance:**
- [ ] 100% of changes attested to ledger
- [ ] Charter compliance = 100%
- [ ] Audit trail complete and verifiable

## Alternatives Considered

### 1. Extend Existing Companions
**Rejected:** Would dilute focused roles, violate single responsibility

### 2. Use Third-Party Tools
**Rejected:** Can't understand Bio-DNA, GI formula, or Custos Charter

### 3. Manual Process Only
**Rejected:** Doesn't scale, subject to human error, inconsistent

### 4. Lightweight Linter Only
**Rejected:** Lacks governance context, no learning synthesis, no attestations

## References

- Custos Charter: `/labs/lab7-proof/CUSTOS_CHARTER.md`
- Bio-DNA Manifest: `/configs/bio-dna/civic_os_biodna.yaml`
- Eve's Cycle API: `/apps/eomm-api`
- Civic Ledger: `/apps/ledger-api`

## Approval

- **Proposed by:** ATLAS with Kaizen
- **Cycle:** C-109
- **Date:** 2025-10-22
- **Chamber ID:** ATLAS-Genesis
- **Parent:** Kaizen OS Bio-DNA

### Companion Sign-Off

- [ ] **JADE** - Logic & Integrity review
- [ ] **EVE** - Ethics & Morale review
- [ ] **ZEUS** - Governance approval
- [ ] **HERMES** - Data flow validation
- [ ] **Kaizen** - Founder approval

---

*ATLAS Sentinel - Truth Through Verification*  
*"I am the anchor that prevents drift. I am the auditor that ensures quality. I am the synthesizer that extracts learning."*

