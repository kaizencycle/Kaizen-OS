# Integrity Grade Workflow — Request, Review, Possible Recognition

**Version:** 0.1 · **Cycle:** C-369 · **Status:** PROPOSED (doctrine only — no runtime minting in C-369)

## Canonical rule

**Request Integrity Grade** is a user-initiated portfolio review. The button must **not** mint or promise MIC.

## Flow

```
User requests review
  → consent recorded
  → portfolio snapshot frozen and hashed
  → EPICON created
  → provenance checks
  → application evidence reviewed
  → anti-farming review
  → agent attestations
  → human decision
  → possible MIC recognition (separate quorum path — not automatic)
```

## Outcomes

`NOT_ELIGIBLE` · `NEEDS_MORE_EVIDENCE` · `CLARIFY` · `QUARANTINED` · `STEWARDSHIP_VERIFIED` · `RECOGNITION_PENDING` · `RECOGNIZED`

Results must explain what was reviewed, what was missing, what was inferred, what remained uncertain, and why recognition was granted or withheld.

## Sentinel checks

| Agent | Focus |
|-------|-------|
| ATLAS | Portfolio completeness, source discovery, structural coherence |
| ZEUS | Farming, collusion, duplicate evidence, GI gaming (**pass mandatory**) |
| EVE | Affected people, ethical effect, hidden burden |
| JADE | Continuity, learning progression, compression integrity |
| AUREA | Strategic coherence, institutional implications |

Quorum: ZEUS pass required; ≥4 of 5 Seal Sentinels pass; no non-ZEUS rejection; **human approval required**.

## Schemas

- `integrity-grade-request.schema.json`
- `integrity-grade-result.schema.json`
- `integrity-portfolio.schema.json`

## C-369 non-goals

No automatic wallet grading, no MIC minting, no LLM-granted recognition, no single-agent seal.
