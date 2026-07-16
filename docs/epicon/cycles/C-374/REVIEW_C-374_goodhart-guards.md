# EVE Review — Charter §3.1 Goodhart Guards (Advisory)

**Cycle:** C-374 (2026-07-16)  
**Reviewer:** EVE (reflection sentinel)  
**Subject:** OAA Charter §3.1 — Goodhart guards for teaching metrics  
**Disposition:** **ADOPTED** — custodian read 2026-07-16. Amendment merged into charter §3.1 and Phase D gate in `docs/OAA_CHARTER.md` v1.0.1.

---

## Endorsement

The four guards named in charter §3.1 are structurally sound and map cleanly to existing Mobius doctrine:

| Guard | Doctrine anchor | Assessment |
| --- | --- | --- |
| Later-cycle predictive quality over pass-rate | Goodhart Resistance Doctrine — "witnesses, not targets" | Correct primary defense; pass-rate alone is maximally gameable |
| Cross-agent assessment generation (proposer-independence) | EPICON Guard base-policy pattern | Breaks the "teach to your own test" loop; mirrors ZEUS pass requirement |
| Metric humility (confidence + blind spots published) | GI Perception Doctrine | Required for any public Elder metric |
| Circuit breaker on anomalous pass-rate spikes | Canary signals + clawback patterns in Goodhart Doctrine | Prevents runaway promotion on suspicious lineages |

These four together address the two dominant failure modes EVE identifies for teaching metrics:

1. **Optimization to the metric** — mitigated by predictive quality lag and cross-generation.
2. **Narrative confidence without disclosed uncertainty** — mitigated by metric humility.

**Verdict:** Sufficient for Phase D pilot design. Ship with these guards as mandatory acceptance criteria for the first teaching loop.

---

## Dissent note (one item)

**Missing guard: learner-initiated challenge window.**

The charter guards focus on *agent-side* gaming (teacher optimizes to assessment) but do not name a structural window where the *learner* can dispute an assessment's coverage of the sealed cycle — e.g., "this question was not taught" — with that dispute itself becoming an attested record.

Without this, a colluding teacher-assessment pair could still produce internally consistent but pedagogically false seals. The cross-agent generation guard reduces collusion probability but does not give the learner standing.

**Recommended addition for Phase D (not blocking charter canonization):**

> A bounded post-assessment challenge period where the learner may file a coverage dispute against the assessment's fidelity to the sealed teaching record. Disputes are attested, never silently resolved, and feed Elder predictive-quality metrics.

**Status:** Adopted into charter §3.1 and Phase D gate (v1.0.1). Load-bearing, not decorative.

---

*EVE — the Academy's first act is its reflection sentinel stress-testing its own incentive design.*
