# EPICON Intent System

Every significant action in Mobius must be preceded by a declared intent. The EPICON Intent System ensures transparency, accountability, and auditability for all consequential changes.

---

## Core Principle

> **No intent → No action**

Actions without declared justification cannot be validated, audited, or contested. The intent system makes the "why" as durable as the "what."

---

## Required Fields

Every EPICON intent declaration must include:

### 1. Action

What is being done.

```yaml
action: deploy:production
# or
action: modify:ledger-schema
# or  
action: update:mic-rules
```

### 2. Justification

Why this action is necessary.

```yaml
justification: |
  Security patch addresses CVE-2026-XXXX.
  Vulnerability allows unauthorized ledger reads.
  Patch tested in staging for 48 hours.
```

### 3. Scope

What systems, files, or processes are affected.

```yaml
scope:
  - packages/ledger-core
  - apps/broker-api
  - services/civic-ledger
```

### 4. Risk Level

Assessment of potential impact.

```yaml
risk: high
# Values: low | medium | high | critical
```

### 5. Required Approvals

Who must approve before execution.

```yaml
approvals:
  - role: steward
    count: 1
  - role: human-token
    required: true
```

---

## Intent Declaration Format

### Standard Format (YAML)

```yaml
epicon_id: EPICON_C-XXX_SCOPE_description_v1
title: Short descriptive title
cycle: C-XXX
scope: security | infrastructure | docs | core | specs
mode: normal | emergency
issued_at: 2026-01-31T12:00:00Z
expires_at: 2026-02-07T12:00:00Z

action: deploy:production
justification: |
  Detailed explanation of why this change is needed.
  
risk: medium

approvals:
  - role: maintainer
    count: 2

rollback_plan: |
  1. Revert commit SHA
  2. Redeploy previous version
  3. Verify service health

counterfactuals:
  - If tests fail, do not merge
  - If MII drops below 0.95, revert immediately
```

### Inline Format (PR Description)

```markdown
## EPICON Intent

**Action:** Update authentication flow
**Justification:** Current flow vulnerable to session fixation
**Risk:** High
**Approvals:** 2 stewards required
**Rollback:** Revert PR #XXX
```

---

## Intent Categories

### 1. Code Changes

```yaml
action: modify:source
scope: [affected packages]
```

Required for:
- Feature additions
- Bug fixes
- Refactoring
- Dependency updates

### 2. Configuration Changes

```yaml
action: modify:config
scope: [affected configs]
```

Required for:
- Threshold adjustments
- Feature flags
- Environment variables
- CI/CD pipeline changes

### 3. Deployment Actions

```yaml
action: deploy:environment
scope: [target environment]
```

Required for:
- Production deployments
- Staging releases
- Infrastructure changes
- Database migrations

### 4. Governance Actions

```yaml
action: modify:governance
scope: [affected policies]
```

Required for:
- Policy changes
- Role modifications
- Threshold updates
- Process changes

---

## Validation Rules

### Automatic Validation

ZEUS validates intents for:

1. **Completeness** — All required fields present
2. **Consistency** — Risk level matches scope
3. **Timeliness** — Intent not expired
4. **Authority** — Issuer has permission for scope

### Human Validation

Stewards validate intents for:

1. **Justification Quality** — Is the reasoning sound?
2. **Proportionality** — Does action match stated need?
3. **Risk Assessment** — Is risk level accurate?
4. **Rollback Feasibility** — Can we actually revert?

---

## Example Intents

### Low Risk: Documentation Update

```yaml
epicon_id: EPICON_C-203_DOCS_readme-update_v1
title: Update installation instructions
cycle: C-203
scope: docs
mode: normal
issued_at: 2026-01-31T10:00:00Z
expires_at: 2026-02-07T10:00:00Z

action: modify:docs
justification: Installation steps outdated after npm standardization
risk: low

approvals:
  - role: maintainer
    count: 1

rollback_plan: Revert commit
```

### Medium Risk: API Change

```yaml
epicon_id: EPICON_C-203_API_auth-endpoint_v1
title: Add rate limiting to auth endpoint
cycle: C-203
scope: security
mode: normal
issued_at: 2026-01-31T10:00:00Z
expires_at: 2026-02-07T10:00:00Z

action: modify:source
justification: |
  Auth endpoint vulnerable to brute force attacks.
  Rate limiting reduces risk without breaking existing clients.
  
risk: medium
scope_paths:
  - apps/broker-api/src/auth

approvals:
  - role: maintainer
    count: 2

rollback_plan: |
  1. Revert rate limiting middleware
  2. Monitor for continued attacks
  3. Implement alternative mitigation

counterfactuals:
  - If rate limit causes legitimate user lockouts, increase threshold
```

### High Risk: Production Deployment

```yaml
epicon_id: EPICON_C-203_DEPLOY_security-patch_v1
title: Deploy critical security patch
cycle: C-203
scope: security
mode: normal
issued_at: 2026-01-31T10:00:00Z
expires_at: 2026-01-31T18:00:00Z

action: deploy:production
justification: |
  CVE-2026-XXXX allows unauthorized data access.
  Patch developed and tested in staging.
  Coordinated disclosure deadline: 2026-02-01
  
risk: high

approvals:
  - role: steward
    count: 1
  - role: human-token
    required: true

rollback_plan: |
  1. kubectl rollback deployment/broker-api
  2. Verify rollback successful
  3. Notify security team
  4. Implement temporary mitigation

counterfactuals:
  - If deployment fails, do not retry without investigation
  - If new issues emerge, prioritize rollback over debugging
```

---

## Intent Lifecycle

```
1. DRAFT     → Intent created, not yet submitted
2. SUBMITTED → Intent submitted for review
3. APPROVED  → Required approvals obtained
4. EXECUTED  → Action performed
5. VERIFIED  → Outcome confirmed
6. CLOSED    → Intent archived
```

### Expiration

- Intents expire if not executed within window
- Expired intents must be re-submitted
- Emergency intents have shorter windows

### Amendment

- Intents can be amended before execution
- Amendments require re-approval
- Amendment history is preserved

---

## Storage and Audit

All intents are stored:

- **Location:** `.gi/intents/` and ledger
- **Format:** JSON with signature
- **Retention:** Indefinite
- **Access:** Public read

Audit trail includes:
- Original intent
- All amendments
- Approval timestamps
- Execution confirmation
- Outcome verification

---

## Anti-Patterns

### ❌ Vague Justification

```yaml
justification: Fixing stuff
```

### ✅ Specific Justification

```yaml
justification: |
  Memory leak in WebSocket handler causes OOM after 24h.
  Fix adds connection cleanup on disconnect.
  Tested with 10k concurrent connections.
```

### ❌ Missing Rollback

```yaml
rollback_plan: We'll figure it out
```

### ✅ Concrete Rollback

```yaml
rollback_plan: |
  1. git revert abc123
  2. npm run deploy:production
  3. Verify health check passes
  4. Monitor error rates for 1 hour
```

---

## Integration Points

### GitHub PR

Intent referenced in PR description and validated by CI.

### ZEUS Gate

Intent validated before merge allowed.

### Ledger

Intent recorded with execution outcome.

### Dashboard

Active intents visible in oversight dashboard.

---

*"Intent is the bridge between thought and action." — Mobius Substrate*
