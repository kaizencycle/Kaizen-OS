# ZEUS Policy Rules

ZEUS is the governance enforcement engine for Mobius. It automatically validates changes against policy rules, enforces risk-appropriate reviews, and triggers circuit breakers when integrity thresholds are breached.

---

## Core Principles

1. **Intent Before Action** — No significant change without declared justification
2. **Risk-Proportional Review** — Higher risk requires more scrutiny
3. **Automatic Enforcement** — Policy is code, not suggestion
4. **Fail-Safe Defaults** — When uncertain, block and escalate

---

## Hard Rules (Non-Negotiable)

These rules cannot be bypassed without emergency procedures:

### 1. Intent Declaration
- **Rule:** No production deployment without EPICON intent
- **Enforcement:** CI gate blocks merge without valid intent reference
- **Bypass:** Emergency mode only (requires post-merge audit)

### 2. Ledger Schema Protection
- **Rule:** No ledger schema change without steward approval
- **Enforcement:** CODEOWNERS + required reviews
- **Bypass:** None — always requires human steward

### 3. MIC Logic Protection
- **Rule:** No MIC mint/burn logic changes without simulation tests
- **Enforcement:** Test coverage gate + steward approval
- **Bypass:** None — always requires simulation + audit

### 4. Circuit Breaker
- **Rule:** Threshold breach triggers automatic pause
- **Enforcement:** GI gate workflow blocks on MII < 0.95
- **Bypass:** Requires manual override by steward with attestation

### 5. Audit Trail
- **Rule:** All significant actions produce ledger entries
- **Enforcement:** Automated logging + immutable storage
- **Bypass:** None — logging cannot be disabled

---

## Risk Tiers

### Tier 0 — Documentation / Formatting / Comments

**Characteristics:**
- No runtime behavior change
- No configuration change
- Cosmetic or clarification only

**Requirements:**
- 1 reviewer (any maintainer or co-reviewer)
- Fast merge allowed
- EPICON optional

**Examples:**
- README updates
- Code comments
- Typo fixes
- Formatting changes

---

### Tier 1 — Application Code (No Security/Auth)

**Characteristics:**
- Runtime behavior change
- No security surface change
- No authentication/authorization change

**Requirements:**
- 1 maintainer approval
- Tests required for new code
- EPICON recommended

**Examples:**
- New UI components
- Non-sensitive API endpoints
- Internal refactoring
- Feature additions (non-auth)

---

### Tier 2 — Auth / Ledger / Integrity Math

**Characteristics:**
- Security surface change
- Authentication/authorization logic
- Integrity calculation changes
- Ledger read/write operations

**Requirements:**
- 2 approvals (one must be steward)
- Benchmarks required
- Changelog entry required
- EPICON required

**Examples:**
- Login/logout flow changes
- Permission system updates
- MII formula adjustments
- Ledger query changes

---

### Tier 3 — MIC Mint/Burn / Consensus / Production Ops

**Characteristics:**
- Economic system changes
- Consensus mechanism updates
- Production infrastructure changes
- Irreversible operations

**Requirements:**
- Steward approval + human approval token
- Threat model link required
- Rollback plan required
- Simulation test required
- EPICON required with full justification

**Examples:**
- MIC issuance rule changes
- Sentinel voting weight changes
- Database migration (production)
- Deployment pipeline changes

---

## Enforcement Mechanisms

### 1. CI Gate Validation

```yaml
# Enforced by: .github/workflows/gi-gate.yml
# Triggers on: All PRs to main/develop
# Blocks if: MII < 0.95
```

### 2. CODEOWNERS Enforcement

Protected paths require specific team approval:

```
/packages/ledger-core/   @stewards
/packages/mic-core/      @stewards
/packages/epicon/        @stewards
/packages/zeus/          @stewards
/sentinels/              @stewards
```

### 3. Anti-Nuke Protection

```yaml
# Enforced by: .github/workflows/anti-nuke.yml
# Max deletions: 5 files
# Max deletion ratio: 15%
# Protected paths: apps/, packages/, labs/, sentinels/, docs/, infra/, .github/
```

### 4. EPICON Intent Validation

```yaml
# Enforced by: .github/workflows/epicon03-consensus.yml
# Required for: Tier 2+ changes
# Validates: Intent fields, risk assessment, approvals
```

---

## Threshold Configuration

| Metric | Default | Emergency | Description |
|--------|---------|-----------|-------------|
| MII Minimum | 0.95 | 0.90 | Minimum integrity index |
| GI Baseline | 0.993 | 0.95 | Global integrity target |
| Max Deletions | 5 | 10 | Files per PR |
| Deletion Ratio | 15% | 25% | Of total changes |
| Review Timeout | 72h | 24h | Before escalation |

---

## Emergency Procedures

When standard procedures cannot be followed:

### 1. Emergency EPICON

```yaml
mode: emergency
justification: [detailed security/safety reason]
post_merge_audit: required
rollback_plan: [specific steps]
```

### 2. Single Steward Override

- One steward may merge with post-merge review
- Must document reason in PR
- Post-mortem required within 72 hours
- Recorded in `docs/governance/emergencies/`

### 3. Circuit Breaker Override

- Requires attestation from steward
- Logged with timestamp and reason
- Subject to council review
- May trigger governance audit

---

## Violation Handling

### Automatic Responses

| Violation | Response |
|-----------|----------|
| MII < 0.95 | Block merge |
| Missing EPICON (Tier 2+) | Block merge |
| Unauthorized path change | Request CODEOWNERS review |
| Mass deletion | Block + notify stewards |
| Failed tests | Block merge |

### Manual Escalation

| Severity | Escalation Path |
|----------|-----------------|
| Low | Maintainer review |
| Medium | Steward notification |
| High | Council emergency session |
| Critical | Immediate safe-stop |

---

## Audit and Transparency

All ZEUS enforcement decisions are logged:

- Decision timestamp
- Rule triggered
- Action taken
- Override (if any)
- Approving authority

Logs are:
- Immutable
- Publicly accessible
- Retained indefinitely

---

## Governance Integration

ZEUS enforces policies defined by:
- Sentinel Council decisions
- RFC outcomes
- EPICON declarations
- Steward attestations

ZEUS does not:
- Create policy
- Override human authority
- Act without audit trail
- Modify its own rules

---

*ZEUS enforces policy automatically. Humans define policy deliberately.*

*"We heal as we walk." — Mobius Substrate*
