# Mobius PR — Cycle
- **Cycle:** C-XXX
- **Type:** Feature / Fix / Docs / Infra / Sentinel
- **Primary Area:** apps / packages / infra / docs / sentinels
---
## 1. Summary
**What changed?**
> Short description of the change.
**Why?**
> Problem being solved or value being added.
---
## 2. Risk Tier
Select the appropriate tier based on change scope:
- [ ] **Tier 0** — Docs/comments/formatting (1 reviewer, fast merge)
- [ ] **Tier 1** — App code, no auth/security (1 maintainer, tests required)
- [ ] **Tier 2** — Auth/ledger/integrity math (2 approvals incl. steward, benchmarks required)
- [ ] **Tier 3** — MIC/consensus/production (steward + human token, simulation required)
---
## 3. EPICON Intent
```intent
epicon_id: EPICON_C-XXX_SCOPE_description_v1
ledger_id: <your-github-username>
scope: docs | ci | core | infra | sentinels | labs | specs
mode: normal | emergency
issued_at: YYYY-MM-DDTHH:MM:SSZ
expires_at: YYYY-MM-DDTHH:MM:SSZ
justification:
  VALUES INVOKED: integrity, safety, transparency, [others]
  REASONING: Why this change makes sense
  ANCHORS: 
    - [Independent support 1]
    - [Independent support 2]
  BOUNDARIES: When this does NOT apply
  COUNTERFACTUAL: What would change the conclusion
counterfactuals:
  - If tests fail, do not merge
  - If MII drops below 0.95, revert immediately
```

-----

## 4. Integrity Impact

**What could go wrong?**

> Describe potential failure modes, security implications, or integrity risks.

### Assessment

- **Estimated MII for this PR:** 0.___
- **Risk level:** Low / Medium / High
- **Systems affected:** [list affected packages/services]

### Checklist

- [ ] Aligns with Mobius Integrity Index (MII ≥ 0.95)
- [ ] Does not weaken Anti-Nuke / Guardian guarantees
- [ ] Maintains SML safety and HIL loops
- [ ] No unauthorized permission escalation

-----

## 5. Rollback Plan

**How do we undo this if needed?**

```bash
# Example:
git revert <commit-sha>
npm run deploy:production
# Verify health checks pass
```

-----

## 6. Testing

- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] Local verification of changed services
- [ ] Benchmarks run (if Tier 2+)

**Evidence:**

```text
Add logs, test output, or screenshots here.
```

-----

## 7. Sentinel Review Requested

Add labels to request review:

- [ ] `review:aurea` — Legitimacy, governance, MII/MIC impact
- [ ] `review:atlas` — Systems risk, adversarial thinking, failure modes
- [ ] `review:eve` — Ethics, safety, policy compliance
  **Notes for Sentinels:**

<!-- What should reviewers focus on? -->

-----

## 8. Final Checklist

- [ ] Risk tier correctly assessed
- [ ] EPICON intent block completed
- [ ] Integrity impact documented
- [ ] Rollback plan provided (if Tier 1+)
- [ ] Tests pass
- [ ] Documentation updated where needed
- [ ] I am okay with this appearing in the public cathedral

-----

## Related Issues

## Closes #

*"We heal as we walk." — Mobius Substrate*
