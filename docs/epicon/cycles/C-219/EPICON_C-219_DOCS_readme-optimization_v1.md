---
epicon_id: EPICON_C-219_DOCS_readme-optimization_v1
title: "README Optimization — Signal Over Noise"
author_name: "ATLAS Agent"
author_wallet: ""
cycle: "C-219"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "docs"
  system: "repository-readme"
  environment: "mainnet"
epicon_type: "design"
status: "active"
related_prs: [255]
related_commits: []
related_epicons: ["EPICON_C-199_DOCS_root-folder-cleanup_v1"]
tags: ["documentation", "readme", "signal-to-noise", "developer-experience", "public-facing"]
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-02-11T18:00:00Z"
updated_at: "2026-02-11T18:00:00Z"
version: 1
hash_hint: ""
summary: "Rewrite README.md as a focused technical document — signal over noise for developer first impressions"
---

# EPICON C-219: README Optimization — Signal Over Noise

- **Layer:** SUBSTRATE > docs > repository-readme
- **Author:** ATLAS Agent (+Michael Judan)
- **Date:** 2026-02-11
- **Status:** Active

---

## Intent Publication (EPICON-02 Compliance)

```intent
epicon_id: EPICON_C-219_DOCS_readme-optimization_v1
title: README Optimization — Signal Over Noise
cycle: C-219
scope: docs
mode: normal
issued_at: 2026-02-11T18:00:00Z
expires_at: 2026-05-11T18:00:00Z

justification:
  VALUES INVOKED: integrity, transparency, honesty
  REASONING: |
    The README is the front door for every developer evaluating Mobius.
    The previous version introduced 15+ novel concepts before Quick Start,
    contained paths that no longer existed (pre-C199 locations), listed
    service ports that didn't match actual code, and mixed philosophical
    framing with technical documentation. For a project about integrity,
    the README must itself be accurate and honest.
  ANCHORS:
    - C-199 moved FOR-ACADEMICS, FOR-GOVERNMENTS, FOUNDATION, papers to docs/ but README links were not updated
    - Actual service ports in source code (civic-ledger:3000, gi-aggregator:3001, indexer:4002, hub-web:3004, broker:4005) did not match README claims
    - apps/ledger-api does not exist; the actual service is services/civic-ledger
    - Developer first impression determines contributor conversion within 60 seconds
  BOUNDARIES:
    - This EPICON applies ONLY to README.md (root)
    - Does NOT affect code, services, configs, or architecture
    - Does NOT delete any existing documentation (content preserved in docs/)
    - Does NOT affect any functionality
  COUNTERFACTUAL:
    - If new contributors report confusion about Mobius scope, add a "Vision" link at top pointing to docs
    - If listed live URLs go down, remove them rather than leaving broken links
    - If this README loses important context not covered elsewhere in docs, restore specific sections

counterfactuals:
  - Code files affected -> BLOCK (scope violation)
  - Important context lost with no docs/ backup -> REVERT
  - MII < 0.95 -> REVERT (integrity threshold)
  - Live URLs become unreachable -> UPDATE (remove broken links)
```

### Scope Envelope

| Permission | Granted |
|------------|---------|
| `root.readme.write` | Yes |
| `catalog.regenerate` | Yes |
| `docs.epicon.write` | Yes |
| `apps/*` | No |
| `packages/*` | No |
| `services/*` | No |
| `code.*` | No |

### Authority Declaration

- **Actor:** ATLAS Agent (on behalf of kaizencycle:michaeljudan)
- **Authority Source:** CODEOWNERS approval
- **Scope Limitation:** README.md rewrite and catalog regeneration ONLY
- **Expiration:** 2026-05-11T18:00:00Z

---

## Summary

> Replaces the root README.md with a focused technical document that answers four questions in order: (1) What is this? (2) How do I run it? (3) What's the architecture? (4) Where do I go deeper? All removed content already exists in docs/. No files deleted. No code changed.

---

## 1. Context

- The root README was ~196 lines mixing philosophical framing with technical documentation
- It introduced 15+ novel concepts (EPICON, MIC, MII, DVA, KTT, OAA, Sentinel Council, etc.) before the Quick Start
- C-199 moved FOR-ACADEMICS, FOR-GOVERNMENTS, FOUNDATION, papers to `docs/` but the README still linked to root-level paths
- The Quick Start referenced `apps/ledger-api` which does not exist (actual: `services/civic-ledger`)
- Service ports in the README did not match actual code
- An open letter to developers leaving AI labs makes the README the first evaluation surface

---

## 2. Assumptions

- **A1:** A developer should be able to answer "what can I run?" within 60 seconds of opening the README
- **A2:** Technical accuracy matters more than aspirational framing for the front door
- **A3:** All philosophical and vision content is already accessible in `docs/`
- **A4:** Internal links must point to paths that actually exist in the repo
- **A5:** Service ports listed must match actual source code

---

## 3. Problem Statement

The README was the primary barrier to contributor adoption because:
- Signal-to-noise ratio was too low (philosophy mixed with technical docs)
- Factual inaccuracies (wrong paths, wrong ports, nonexistent directories)
- Too many novel concepts introduced before actionable content
- Time to "what can I run?" exceeded 3 minutes of reading

---

## 4. Options Considered

### Option A: Leave As-Is

- **Description:** Keep existing README
- **Upside:** No change risk
- **Downside:** Broken links, wrong ports, poor first impression
- **Risk:** Every developer evaluating via open letter sees inaccuracies

### Option B: Technical Rewrite (Chosen)

- **Description:** Replace with focused ~130-line technical document
- **Upside:** Honest, accurate, 60-second comprehension
- **Downside:** Less aspirational framing visible at top level
- **Risk:** Existing visitors may miss philosophical context (mitigated: linked to docs/)

---

## 5. Decision / Design

- **Chosen Option:** Option B - Technical Rewrite
- **Rationale:**
  - Fixes all broken links (post-C199 paths)
  - Corrects service ports to match source code
  - Reduces time-to-understanding from 3+ minutes to ~15 seconds
  - Moves philosophical content to appropriate docs/ locations (already there)
- **Conditions for Revisit:** If developer feedback suggests missing critical context

---

## 6. What Was Removed (and Where It Lives)

| Removed from README | Still exists at |
|---------------------|-----------------|
| Detailed EPICON layer descriptions | `docs/04-TECHNICAL-ARCHITECTURE/` |
| "Peer review" grade | Quality assessments in docs/ |
| KTT explanation | `docs/01-FOUNDATIONS/concepts/KAIZEN_TURING_TEST.md` |
| Philosophy quotes | `docs/01-FOUNDATIONS/` |
| Newcomer learning path | `docs/00-START-HERE/` |
| Academic path | `docs/07-RESEARCH-AND-PUBLICATIONS/for-academics/` |
| Government path | `docs/07-RESEARCH-AND-PUBLICATIONS/for-governments/` |

---

## 7. What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| Ledger path | `apps/ledger-api` (nonexistent) | `services/civic-ledger` (actual) |
| Ledger port | 4001 (wrong) | 3000 (matches source) |
| Academic link | `FOR-ACADEMICS/README.md` (moved in C-199) | `docs/07-RESEARCH-AND-PUBLICATIONS/for-academics/README.md` |
| Government link | `FOR-GOVERNMENTS/README.md` (moved in C-199) | `docs/07-RESEARCH-AND-PUBLICATIONS/for-governments/README.md` |
| License link | `FOUNDATION/LICENSES/...` (moved in C-199) | `LICENSE` + `ETHICAL_ADDENDUM.md` (root) |
| Service ports | Fictional (4001, 4004) | Verified from source (3000, 3001, 4002, 3004, 4005) |
| Novel concepts before Quick Start | 15+ | 5 (clean table) |
| Lines | ~196 | ~130 |

---

## 8. Risk & Integrity Notes

- **Integrity tradeoffs:** None - all content preserved in docs/
- **Who might bear risk:** Visitors with bookmarks to old README sections (anchor links)
- **What metrics we'll watch:**
  - New contributor conversion rate
  - Time-to-first-PR for developers arriving via open letter
  - Broken link reports
- **MII/GI impact assessment:**
  - MII: Positive (corrected inaccuracies)
  - GI: Positive (README now reflects actual system state)

---

## 9. Reflection Hook

Questions for future reflections:

- "Did developers arriving via the open letter engage with the repo?"
- "Did the focused README improve contributor conversion?"
- "Are the two listed live URLs still responding?"
- "Should any removed sections be restored based on feedback?"

---

## 10. Consensus

**CODEOWNERS:** kaizencycle:michaeljudan
**Consensus Status:** Pending

### Sentinel Votes
| Sentinel | Vote | Rationale |
|----------|------|-----------|
| ATLAS | SUPPORT | Author - fixes factual inaccuracies, improves signal-to-noise |
| AUREA | PENDING | Awaiting review |
| EVE | PENDING | Awaiting review |

---

## 11. Invariants Preserved

| Invariant | Status | Evidence |
|-----------|--------|----------|
| All content preserved | Yes | Removed content exists in docs/ |
| No files deleted | Yes | Only README.md modified + catalog regenerated |
| MII >= 0.95 | Yes | Documentation-only change |
| Anti-nuke compliance | Yes | 0 deletions |
| Internal links accurate | Yes | All links verified against actual repo paths |
| Service ports accurate | Yes | All ports verified against source code |

---

## Document Control

**Version History:**
- v1: Initial specification (C-219)

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." -- Mobius Systems*
