---
epicon_id: EPICON_C-208_DOCS_mobius-contributors-v1_v1
title: "Mobius Contributors v1 Pack — Oversight, Microcopy, and Trust Documentation"
author_name: "ATLAS"
author_wallet: ""
cycle: "C-208"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "governance"
  system: "contributor-framework"
  environment: "mainnet"
epicon_type: "design"
status: "active"
related_prs: []
related_commits: []
related_epicons:
  - "EPICON_C-202_DOCS_legitimacy-substrate-docset_v1"
tags:
  - "governance"
  - "contributors"
  - "oversight"
  - "microcopy"
  - "trust-scores"
  - "MIC"
  - "documentation"
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-01-31T16:30:00Z"
updated_at: "2026-01-31T16:30:00Z"
version: 1
hash_hint: ""
summary: "Comprehensive contributor governance documentation including role classes, citizen oversight dashboard specs, and MIC incentive structures"
---

# Mobius Contributors v1 Pack — Oversight, Microcopy, and Trust Documentation

- **Layer:** SUBSTRATE → Governance → Contributor Framework
- **Author:** ATLAS
- **Date:** 2026-01-31
- **Status:** Active

---

## Summary

This EPICON formalizes the Mobius contributor governance framework, establishing clear role hierarchies (H0-H3 for humans, A0-A3 for AI agents), a complete citizen oversight dashboard specification, and MIC incentive structures. The documentation enables community growth while maintaining integrity guardrails through transparent policies, anti-brigading mechanisms, and accountability systems.

---

## 1. Context

- Mobius has grown to require formalized contributor governance
- Existing contributor practices are implicit and undocumented
- Community growth requires clear expectations and advancement paths
- Citizen oversight capabilities need specification for implementation
- MIC incentives need documentation before economic launch

**Previous EPICONs:**
- EPICON_C-202_DOCS_legitimacy-substrate-docset_v1 (Legitimacy foundation)

---

## 2. Assumptions

- **A1:** Documentation-only changes do not require extensive consensus (Tier 0)
- **A2:** Formalizing existing practices improves rather than restricts contribution
- **A3:** Citizen oversight dashboards will be implemented based on these specifications
- **A4:** Trust score and MIC systems will remain non-speculative during v0

---

## 3. Problem Statement

Mobius lacks formalized documentation for:
1. Contributor role hierarchies and permissions
2. Citizen oversight interface specifications
3. Anti-brigading mechanisms (trust scores)
4. MIC incentive structures for civic participation
5. Risk tier classification for changes

Without this documentation, community growth is hindered by unclear expectations.

---

## 4. Options Considered

### Option A: Minimal Documentation

- **Description:** Document only role definitions
- **Upside:** Faster to implement
- **Downside:** Incomplete framework, requires follow-up work
- **Risk:** Fragmented documentation leads to confusion

### Option B: Comprehensive Documentation Pack (Selected)

- **Description:** Complete framework including roles, oversight specs, trust, and MIC
- **Upside:** Single coherent package, enables implementation
- **Downside:** Larger scope
- **Risk:** Scope may exceed authority (mitigated by Tier 0 classification)

---

## 5. Decision / Design

- **Chosen Option:** Option B — Comprehensive Documentation Pack
- **Rationale:** A complete framework enables community growth and implementation planning. Documentation-only scope keeps risk minimal.
- **Conditions for Revisit:** If documentation creates barriers rather than clarity, revise role advancement criteria.

### Documents Created

**Core Governance:**
- `CONTRIBUTOR_CLASSES.md` — H0-H3 human roles, A0-A3 AI roles
- `ZEUS_POLICY.md` — Risk tiers 0-3, enforcement rules
- `EPICON_INTENTS.md` — Intent declaration system

**Citizen Oversight Module:**
- `README.md` — Oversight pillars and design philosophy
- `DASHBOARD.md` — ASCII wireframes for all views
- `MICROCOPY.md` — UI text library with anti-panic tone
- `API_CONTRACTS.md` — Public API specifications
- `TRUST_SCORES.md` — T0-T3 levels, anti-brigading
- `MIC_INCENTIVES.md` — Earning categories and rates

**Supporting:**
- `FIRST_HOUR.md` — 60-minute onboarding guide
- `CITIZEN_WATCHDOG.md` — Public-facing watchdog explanation
- Updated PR/Issue templates with risk tiers
- Updated CODEOWNERS with steward paths

---

## 6. Risk & Integrity Notes

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Over-documentation | Low | Low | Review for actionability |
| Scope creep | Low | Low | Tier 0 classification limits |
| Trust score gaming | Medium | Low | Documented anti-gaming measures |
| MIC speculation | Low | Medium | v0 non-speculative policy |

### MII/GI Impact

- **Expected:** Positive (improves governance clarity)
- **Actual:** Neutral to positive (documentation only)

### Integrity Tradeoffs

None identified. Documentation formalizes existing implicit practices.

---

## 7. Implementation Links

- **PRs:** cursor/oversight-microcopy-and-trust-4975
- **Commits:** ce22fde, 2361ec4
- **Diagrams:** ASCII wireframes in DASHBOARD.md
- **Config Paths:**
  - `.github/CODEOWNERS`
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `.github/ISSUE_TEMPLATE/feature_request.md`

---

## 8. Reflection Hook

Questions for future cycles:

- "Did the contributor framework accelerate community growth?"
- "Are the risk tiers being applied correctly?"
- "Has trust score gaming been detected?"
- "Are MIC incentives motivating the right behaviors?"
- "Is the oversight dashboard being implemented as specified?"

---

## Authority Change Justification

**Scope:** Documentation of contributor governance framework

**Justification:**
- Formalizes existing implicit contributor practices
- No new authority is created; existing roles are documented
- Establishes transparency for community governance
- Enables implementation of citizen oversight features

**Values Invoked:** Transparency, accessibility, integrity, civic participation

**Authority Source:** Custodian discretion for documentation improvements

**Counterfactual:** If this documentation creates barriers to contribution rather than clarity, the framework should be revised to be more accessible.

---

## Document Control

**Version History:**
- v1: Initial specification (C-208)

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." — Mobius Substrate*
