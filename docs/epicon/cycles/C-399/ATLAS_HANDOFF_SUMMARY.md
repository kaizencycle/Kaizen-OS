# ATLAS Handoff: Academy Protocol v0.1

**From:** Michael (Custodian) · **To:** ZEUS → Human merge gate  
**Cycle:** C-399 (2026-08-09)  
**Target repo:** kaizencycle/Mobius-Substrate  
**Provenance:** ATLAS completed specification-only Academy package for OAA Floor 3  
**License:** CC0 / Public Domain

---

## Handoff Status

**COMPLETE** — Ready for ZEUS adversarial review → Human merge decision

---

## Package Contents

| Document | Path |
|----------|------|
| EPICON Intent Block | `docs/epicon/cycles/C-399/EPICON_C-399_ACADEMY_PROTOCOL_v1.md` |
| Academy Protocol | `docs/academy/ACADEMY_PROTOCOL.md` |
| Assessment Protocol | `docs/academy/ASSESSMENT_PROTOCOL.md` |
| Agent Teacher Contract | `docs/academy/AGENT_TEACHER_CONTRACT.md` |
| Reference Exemplar | `docs/academy/OAA-HIST-001-exemplar.md` |

---

## Scope

### This PR DOES

- Define valid Academy lesson structure
- Define comprehension assessment without ideological capture
- Define binding agent teacher obligations
- Provide reference lesson (OAA-HIST-001) tested against protocols
- Establish fail-closed behavior (quarantine, challenge, removal)
- Publish intent via EPICON C-399

### This PR DOES NOT

- Build any running Academy service
- Create lesson instances beyond reference exemplar
- Build Browser Shell integration
- Create learner account systems
- Wire mobius-feed
- Deploy database or runtime

---

## ZEUS Adversarial Review Checklist

### Protocol Soundness

- [ ] Can "understanding ≠ agreement" be violated without quarantine?
- [ ] What if a lesson teaches false history? (Challenge window; STALE marking; re-assessment)
- [ ] Can an agent use weak gates to evade the rubric standard?

### Ideological Capture Resistance

- [ ] Can Gate 5 (Adversary Coherence) be phrased to make disagreement impossible?
- [ ] What if "evidence" is actually Mobius interpretation?
- [ ] Can a neutral-seeming lesson subtly favor one ideology?

### Learner Power

- [ ] Is 30 days enough to challenge?
- [ ] What if ZEUS review is slow?
- [ ] Can a passing learner still challenge the rubric?

### Agent Accountability

- [ ] What if an agent is removed then re-applies?
- [ ] If 2/4 agents are removed for ideology, what happens?
- [ ] Can agents coordinate to evade the contract?

---

## Human Merge Gate Checklist

- [ ] Constitutional alignment with existing Mobius canon
- [ ] OAA Charter Floor 3 consistency
- [ ] EPICON C-399 satisfies I1–I6
- [ ] Learners can truly challenge without retaliation
- [ ] Agent contract items are non-negotiable
- [ ] OAA-HIST-001 models all protocols with verified evidence links
- [ ] All spec documents are CC0 public domain

---

## Next Phases (Post-Merge)

| Phase | Content |
|-------|---------|
| A | Reference exemplar used for agent training; other agents draft lessons |
| B | OAA Phase D gate verification (Authority + Hub operational) |
| C | Runtime build (conditional): Academy service, Browser Shell Learn, Civic-Protocol-Core |
| D | First teaching cycle: deploy OAA-HIST-001, grade cohort, test challenge workflow |

---

## Handoff Completion Criteria

- [x] All four specification documents drafted
- [x] EPICON intent block C-399 published
- [ ] ZEUS adversarial review completed
- [ ] Reference exemplar tested against rubric
- [ ] Human merge gate decision made
- [ ] Merged to `docs/academy/`
- [ ] Peeled SHA verification at merge

---

## Evidence Corrections Applied (vs. draft handoff)

The reference exemplar was corrected before commit to match verified C-397 evidence:

- **Primary case study:** C-397 Reserve Block lineage collision (125 pairs, 319 examined, 360 indexed) — not a single migration triple-block bug
- **Secondary example:** `vault:seal:latest` pointer corruption from migrate-v1 (PR #648, commit `f38ff697`)
- **Timeline:** 2026 (not 2025)
- **Evidence paths:** Mobius-Substrate witness JSON and reconciliation doc (not placeholder links)

---

*"We heal as we walk." — Mobius Systems*
