# MFS Constitutional Doctrine — Capability Evidence, Not Currency

**Version:** 0.1 · **Cycle:** C-369 · **Status:** PROPOSED  
**Companion:** [MFS_SPEC_v1.md](../../07-RESEARCH-AND-PUBLICATIONS/specs/MFS_SPEC_v1.md) (operational weights — subordinate to this doctrine for recognition paths)

## Canonical rule

A **Mobius Fractal Shard (MFS)** is a non-transferable attestation of demonstrated capability, learning, or contribution. It is **evidence** — not currency, collateral, or entitlement.

## What MFS may represent

- Course completion with verified assessment
- Demonstrated skill under replayable evidence
- Verified civic participation
- Successful simulations
- Teaching with attributable outcomes
- Emergency preparedness drills
- Systems analysis artifacts
- Ethical reasoning exercises
- Technical contribution with provenance

## What MFS must not be

- Bought, sold, transferred, exchanged, or staked
- Wrapped or fractionalized as MIC
- Converted by fixed arithmetic into MIC (`100 MFS = 1 MIC` is **forbidden**)
- Presented as automatic Fountain eligibility
- Used as proof of moral integrity by volume alone

## Public portfolio model

Users experience:

```
Learn → Practice → Prove → Receive Fractal Shards → Build Portfolio
```

Each visible badge must resolve to evidence (`mfs_id`, `evidence_hash`, `issuer`, `assessment_ref`). See `integrity-portfolio.schema.json`.

## Relationship to MIC

**Forbidden path:**

```
Learn → farm badges → push GI → Fountain → MIC → speculate
```

**Intended path:**

```
Learn → demonstrate capability → receive MFS → build provenance-backed portfolio
→ request Integrity Grade when eligible → independent review and replay
→ possible MIC recognition → sealed Reserve Block reference
```

MIC recognition requires portfolio diversity, demonstrated application, provenance, consistency, consequence, time, adversarial review, and quorum — not arithmetic accumulation of MFS.

## Revocation

MFS is `revocable: true`. Farming, duplicate evidence, or manufactured assessments may trigger quarantine or revocation without erasing the append-only audit trail.

## Compact form

**MFS proves capability. MFS does not mint MIC.**
