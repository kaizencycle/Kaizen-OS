# Create a PR

Use this checklist when opening a PR in **Mobius-Substrate**.

---

## Base settings

### Labels

Add the labels that fit your PR:

- `infrastructure`
- `documentation`
- `performance`
- `consensus:approval:pass`

### Base branch

`main` unless your workflow explicitly targets another protected lane.

### Compare branch

Your working branch, following the naming convention in `CONTRIBUTING.md`:

- `feat/<scope>/<slug>`
- `fix/<scope>/<slug>`
- `docs/<slug>`
- `chore/<slug>`

---

## EPICON compliance checklist

### EPICON-02 Intent Block

- [ ] Intent block included in PR description
- [ ] EPICON ID assigned
- [ ] Cycle identified
- [ ] Scope defined
- [ ] Mode defined (normal / emergency / ceremonial)
- [ ] Issued timestamp added
- [ ] Expiry timestamp added

### Justification

- [ ] Values invoked
- [ ] Reasoning included
- [ ] Anchors listed
- [ ] Boundaries defined
- [ ] Counterfactual included

### EPICON-03 Multi-Agent Consensus

- [ ] Relevant agents named
- [ ] Appropriate approval label added

---

## Quality gates

Before requesting review, confirm:

- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes
- [ ] `npm run test --workspaces --if-present` passes
- [ ] `node scripts/mii/compute.js --threshold 0.95` passes
- [ ] Anti-nuke compliant (no unintended destructive changes)
- [ ] `spec-ci` green if touching schemas or OpenAPI files

---

## PR description template

Copy this into the PR body and fill it in:

```markdown
## EPICON-02 Intent Block

- **EPICON ID:** `EPICON_C-XXX_SCOPE_slug_v1`
- **Cycle:** `C-XXX`
- **Scope:** `<scope>`
- **Mode:** `normal`
- **Issued:** `YYYY-MM-DDTHH:MM:SS-05:00`
- **Expires:** `YYYY-MM-DDTHH:MM:SS-04:00`

## Intent

What does this PR do and why?

## Values Invoked

Which values does this change serve? (integrity, clarity, reliability, stewardship, etc.)

## Changes Included

1. Change one
2. Change two

## Boundaries

This PR does **not**:
- (list what is explicitly out of scope)

## Anchors

1. What existing state or decisions anchor this PR?

## Counterfactual

What happens if this PR is not merged?

## EPICON-03 Consensus Request

Target agents:
- ATLAS
- AUREA
- EVE
- HERMES
- JADE

Requested outcome:
- `consensus:approval:pass`

## Validation

What commands, tests, or checks were run?

## Risks

What should reviewers pay attention to?
```

---

## Sentinel sign-off reference

For governance-sensitive PRs, request sign-off from the relevant agents:

- **AUREA** -- logic and reasoning
- **EVE** -- ethics and policy
- **HERMES** -- operations
- **JADE** -- morale and user experience
- **ZEUS** -- arbiter (required for high-risk changes)
- **ATLAS** -- sentinel oversight
