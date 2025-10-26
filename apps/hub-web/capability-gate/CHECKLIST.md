# Promotion Checklist (v0)

- [ ] Dataset card complete (provenance, license, PII scrub, sampling)
- [ ] Model card complete (base, deltas, intended use)
- [ ] Evals executed:
  - [ ] Core capabilities
  - [ ] Safety & alignment
  - [ ] Robustness/adversarial
- [ ] Thresholds met (see `gate.config.json`)
- [ ] Gate summary generated (`gate_latest.json`) and **sealed** to Civic Ledger
- [ ] Two approvals:
  - [ ] Human Approver A (domain owner)
  - [ ] Human Approver B (safety owner)
- [ ] Canary plan defined (population %, time window, auto-rollback)
- [ ] Staged rollout dates set (25% → 50% → 100%)
- [ ] Kill-switch tested (secrets revoke + queue pause)

