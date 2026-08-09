---
epicon_id: EPICON_C-399_DOCS_academy-protocol-v1_v1
title: "C-399: Academy Protocol v0.1 — OAA Floor 3 specification"
author_name: "Michael Judan"
cycle: "C-399"
tier: "EP-3"
scope:
  domain: "governance"
  system: "oaa-academy"
  environment: "specification"
epicon_type: "spec"
status: "draft"
related_epicons:
  - "C-373"
  - "C-375"
tags: ["c399", "academy", "oaa", "floor-3", "assessment"]
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-08-09T16:00:00Z"
updated_at: "2026-08-09T16:00:00Z"
version: 1
summary: "Specification-only package formalizing OAA Floor 3 (Academy) teaching, assessment, and agent teacher obligations."
---

# EPICON_C-399_ACADEMY_PROTOCOL_v1

- **Layer:** SUBSTRATE → governance → oaa-academy
- **Author:** Michael Judan (+ ATLAS handoff)
- **Date:** 2026-08-09
- **Status:** draft (awaiting ZEUS review + human merge)

---

## Summary

Formalize OAA Floor 3 (Academy) as a constitutional specification with three protocol documents and one reference lesson exemplar. This is specification-only: no runtime, no new service, no learner records beyond the reference exemplar test.

---

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

This EPICON invokes **founder–custodian standing** only to publish Academy specification documentation under OAA Floor 3. No production KV mutation, ledger repair, seal canon promotion, or runtime deployment authority is exercised.

### Scope Constraints

This authority is narrowly scoped to:

- publishing Academy protocol specifications (`docs/academy/`)
- filing EPICON C-399 intent and witness artifacts
- establishing pre-runtime pedagogical boundary conditions

It does **not** authorize production system changes, learner record creation, Academy service deployment, or bypass of OAA Phase D gates.

### Temporality & Revocation

This authority is transitional, contestable, and non-transferable. It may be superseded by ratified governance or a successor EPICON.

### Sunset Condition

This C-399 authority expires for this specification when either:

1. the Academy Protocol v0.1 package is merged and canonized, or
2. a successor EPICON supersedes C-399.

---

## Intent publication

```intent
epicon_id: EPICON_C-399_DOCS_academy-protocol-v1_v1
ledger_id: kaizencycle
scope: docs
mode: normal
issued_at: 2026-08-09T16:00:00Z
expires_at: 2026-11-07T16:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, comprehension-not-compliance, witness-fidelity
  REASONING: OAA Charter already names Academy as Floor 3. This PR operationalizes teaching cycles, assessment without ideological capture, learner challenge windows, and fail-closed quarantine behavior before any runtime build.
  ANCHORS:
    - docs/OAA_CHARTER.md
    - docs/academy/ACADEMY_PROTOCOL.md
    - docs/academy/ASSESSMENT_PROTOCOL.md
    - docs/academy/AGENT_TEACHER_CONTRACT.md
    - docs/academy/OAA-HIST-001-exemplar.md
  BOUNDARIES: Specification and reference exemplar only. No Academy service, Browser Shell integration, or learner account systems. Runtime gated on OAA Phase D (Authority + Hub complete).
  COUNTERFACTUAL: If ZEUS finds ideological capture paths in rubric or questionnaire design, do not merge until amended. If OAA-HIST-001 evidence links fail verification, quarantine exemplar before merge.
counterfactuals:
  - If assessment gates can be satisfied only by ideological agreement, revise ASSESSMENT_PROTOCOL before merge
  - If exemplar contradicts verified C-397 witness evidence, correct OAA-HIST-001 before merge
  - If Phase D gates are false, merge spec only — no runtime queue items
```

---

## INTENT (I1–I6)

### I1: Outcome Sought

Formalize OAA Floor 3 (Academy) as a constitutional specification with:

1. **ACADEMY_PROTOCOL.md** — Valid Academy instance structure and fail-closed behavior
2. **ASSESSMENT_PROTOCOL.md** — Five-gate comprehension rubric with disagree-and-pass rule
3. **AGENT_TEACHER_CONTRACT.md** — Ten binding pedagogical obligations
4. **OAA-HIST-001-exemplar.md** — Reference lesson tested against all three protocols

### I2: Authority

- OAA Charter ([docs/OAA_CHARTER.md](../../OAA_CHARTER.md)) names Academy as Floor 3
- Witness Protocol (C-373) requires intent before consequential action
- This specification *enables* future Academy runtime but does not run anything

### I3: Constraint

- **Phase D Gating:** Academy build items do not enter cycles until Authority and Hub floors are complete
- **Specification-only:** No runtime, no new service, no lesson instances beyond reference exemplar
- **Comprehension rule:** "Understanding is attestable. Agreement is not."
- Every assessment question must trace to auditable evidence

### I4: Evidence Required

- OAA Charter Floor 3 definition
- Reference lesson tested against proposed protocol
- Grading rubric verified to distinguish comprehension from ideological agreement
- Constitutional alignment with EPICON, Witness Protocol, and Goodhart Resistance doctrine

### I5: Fail-Closed Behavior

- Protocol violations trigger QUARANTINED lessons and STALE attestations
- Ideological grading triggers automatic agent removal pending human approval
- Learner challenges invoke ZEUS review and human merge gate

### I6: Rollback

- Specification is documentation only — rollback is document retraction, no data loss
- Reference exemplar is non-runtime — no learner records to unwind
- Future runtime changes require new PR with separate intent block

---

## CLAIMS (Witness Protocol)

| Claim | Verdict | Evidence |
|-------|---------|----------|
| OAA Charter names Academy as Floor 3 | VERIFIED | `docs/OAA_CHARTER.md` §1 |
| Reference lesson sound against protocol | TABLED | `docs/academy/OAA-HIST-001-exemplar.md` — awaiting ZEUS review |
| Assessment distinguishes comprehension from agreement | TABLED | `docs/academy/ASSESSMENT_PROTOCOL.md` §3.3 disagree-and-pass |
| Protocol aligns with EPICON I1–I6 | TABLED | This document + ACADEMY_PROTOCOL §8 |

---

## RISK & MITIGATION

| Risk | Mitigation |
|------|------------|
| Protocol too prescriptive for future runtimes | Spec is a floor, not a ceiling |
| Assessment drifts toward ideology | Constitutional rule + automatic QUARANTINE on violation |
| Reference exemplar reveals protocol flaws | That is the purpose of a reference exemplar |
| Phase D gating unclear | Spec merge is safe; runtime remains gated in OAA Charter §5 |

---

## DELIVERABLES

| # | Item | Path |
|---|------|------|
| 1 | Academy Protocol | `docs/academy/ACADEMY_PROTOCOL.md` |
| 2 | Assessment Protocol | `docs/academy/ASSESSMENT_PROTOCOL.md` |
| 3 | Agent Teacher Contract | `docs/academy/AGENT_TEACHER_CONTRACT.md` |
| 4 | Reference exemplar | `docs/academy/OAA-HIST-001-exemplar.md` |
| 5 | ATLAS handoff summary | `docs/epicon/cycles/C-399/ATLAS_HANDOFF_SUMMARY.md` |

---

*"We heal as we walk." — Mobius Systems*
