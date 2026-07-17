# Fountain Anti-Gaming Doctrine — GI95 as Provisional Review Gate

**Version:** 0.1 · **Cycle:** C-369 · **Status:** PROPOSED

## Canonical rule

**GI95** opens a **provisional review condition**. It does **not** automatically mint MIC, guarantee rewards, or expose a deterministic farming recipe.

## Fountain state machine

| State | Meaning |
|-------|---------|
| `DORMANT` | GI below eligibility range |
| `OBSERVING` | Monitoring without reward messaging |
| `APPROACHING` | GI high — no "push to 95" UI |
| `AUDIT_REQUIRED` | Weight freeze + adversarial review |
| `PROVISIONAL_GI95` | Crossed .95 — not yet eligible |
| `SUSTAINED_GI95` | Survived required cycle count |
| `REVIEW_WINDOW_OPEN` | Eligible wallets may request Integrity Grade |
| `QUARANTINED` | Manipulation or unresolved contradictions |
| `CLOSED` | Window ended or revoked |

See `fountain-state.schema.json`.

## GI95 survival requirements

Before `REVIEW_WINDOW_OPEN`, GI95 must survive:

- Sustained-cycle verification (not a point-in-time spike)
- Source-diversity checks
- Weight-history review
- Adversarial replay
- Holdout measurements where applicable
- Unresolved-quarantine disclosure
- Human and sentinel review

## UI constraints

**Forbidden:**

> "Complete these actions to push GI to 95."

**Allowed:**

> "The network's current attested integrity estimate is improving. Fountain eligibility requires sustained verification and independent audit."

## Transparency vs protection

**Public:** domains measured, weighting philosophy, source classes, agent roles, review rules, amendment history.

**Protected:** exact short-term weights, holdout signals, anti-gaming detector internals, audit timing, adversarial test composition — governed and auditable per [GOODHART_RESISTANCE_DOCTRINE.md](./GOODHART_RESISTANCE_DOCTRINE.md).

## No automatic MIC issuance (C-369)

C-369 establishes doctrine and schemas only. Runtime must not wire automatic MIC issuance, Fountain payouts, or wallet grading mint paths in this cycle.
