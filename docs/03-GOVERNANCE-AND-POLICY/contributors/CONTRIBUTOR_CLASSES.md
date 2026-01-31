# Mobius Contributor Classes

Mobius is civic infrastructure. Contributions are welcome, but integrity is mandatory.

This document defines the contributor class system that enables humans and AI agents to participate in Mobius development with appropriate permissions and accountability.

---

## Design Principles

The contributor system is:
- **Open enough** to grow a community
- **Guarded enough** to prevent drift and sabotage
- **Legible enough** to audit (EPICON + ZEUS)
- **Incentivized enough** to sustain (MIC)

---

## Human Contributors (H0–H3)

### H0 — Observer

**Access:** Read-only

**Capabilities:**
- Read documentation and source code
- Open issues and ask questions
- Participate in discussions
- No write access to repository

**Requirements:** None

---

### H1 — Contributor

**Access:** Fork + Pull Request

**Capabilities:**
- Submit pull requests
- Respond to review feedback
- Propose documentation changes
- Report bugs and suggest features

**Requirements:**
- Must pass CI + basic lint/tests
- Must follow contribution guidelines
- No direct merge permissions

---

### H2 — Maintainer

**Access:** Merge to develop + Review

**Capabilities:**
- Review and approve PRs
- Merge to `develop` branch
- Label issues and manage milestones
- Triage incoming contributions
- Request changes on PRs

**Requirements:**
- Demonstrated history of quality contributions
- Understanding of Mobius integrity principles
- Agreement to Code of Integrity

---

### H3 — Steward (Core)

**Access:** Merge to main + High-risk approvals

**Capabilities:**
- Merge to `main` branch
- Approve high-risk changes (security, ledger, MIC mint/burn, auth)
- Participate in governance decisions
- Sign governance attestations
- Access to emergency procedures

**Requirements:**
- Extended contribution history
- Deep understanding of Mobius architecture
- Signed Steward Attestation
- Subject to conflict-of-interest disclosure

---

## AI Contributors (Sentinel Class: A0–A3)

### A0 — Assistant

**Access:** Read-only + Suggestion

**Capabilities:**
- Suggest patches and fixes
- Draft documentation
- Write test cases
- Analyze code for issues

**Restrictions:**
- No tool execution by default
- Cannot open PRs directly
- Outputs are advisory only

---

### A1 — Co-Reviewer

**Access:** Read + Static Analysis

**Capabilities:**
- Run static analysis tools
- Review diffs for risks and style issues
- Write "Integrity Notes" on PRs
- Flag potential security concerns
- Summarize changes for human reviewers

**Restrictions:**
- Cannot approve or merge
- Cannot execute runtime tools
- All outputs require human review

---

### A2 — Implementer

**Access:** PR Creation + Scoped Tool Execution

**Capabilities:**
- Open PRs from assigned tasks
- Execute approved development tools
- Run tests and linters
- Create branches for assigned work

**Requirements:**
- Must declare EPICON intent for every PR
- Must pass ZEUS gates
- All PRs require human review
- Actions logged and auditable

---

### A3 — Operator (Restricted)

**Access:** Workflow Execution + Scoped Production Actions

**Capabilities:**
- Run approved deployment workflows
- Execute scheduled maintenance tasks
- Respond to automated alerts
- Trigger rollback procedures

**Requirements:**
- Requires human approval tokens for production actions
- Full audit trail required
- Cannot modify own permissions
- Subject to circuit breaker controls

---

## Permission Matrix

| Capability | H0 | H1 | H2 | H3 | A0 | A1 | A2 | A3 |
|------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Read code/docs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Open issues | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Submit PRs | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Review PRs | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Merge to develop | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Merge to main | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve high-risk | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Execute tools | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Production actions | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅* |

*Requires human approval token

---

## Advancement Criteria

### H1 → H2 (Contributor to Maintainer)
- 10+ merged PRs with quality reviews
- Demonstrated understanding of integrity principles
- Recommendation from existing maintainer
- No integrity violations

### H2 → H3 (Maintainer to Steward)
- 6+ months as active maintainer
- Demonstrated leadership in reviews
- Signed Steward Attestation
- Conflict-of-interest disclosure filed
- Unanimous approval from existing stewards

### A1 → A2 (Co-Reviewer to Implementer)
- Demonstrated accuracy in reviews
- No false positive/negative patterns
- Approved by steward council
- Tool permissions scoped and documented

### A2 → A3 (Implementer to Operator)
- Extensive audit trail of safe operations
- Emergency procedures understanding documented
- Human oversight protocols verified
- Circuit breaker integration confirmed

---

## Code of Integrity

All contributors agree to:

1. **No bypassing tests** — All changes must pass CI
2. **No silent behavior changes** — Document all changes
3. **No production actions without intent** — EPICON required
4. **No unauthorized permission escalation** — Request through proper channels
5. **Full disclosure of conflicts** — Report potential conflicts of interest

Violations result in:
- First offense: Warning and review
- Second offense: Permission reduction
- Third offense: Removal from contributor list

---

## Ledger Recording

All contributor actions are recorded:

- Permission changes
- Advancement decisions
- Integrity violations
- Attestation signings

Records are immutable and publicly auditable.

---

*"We heal as we walk." — Mobius Substrate*
