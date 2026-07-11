# ATLAS Handoff — Fractal Learning, Integrity Perception, and Fountain Anti-Gaming

**Cycle:** C-369 · **Status:** PROPOSED  
**Type:** Canon + Protocol + Schema  
**Primary repository:** Mobius-Substrate  
**Human authority:** Michael / kaizencycle · **Witness:** ATLAS

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

## 1. Objective

Separate **learning rewards** from **constitutional integrity recognition**.

C-369 establishes:

- MFS — non-transferable skill and learning attestations
- Integrity Grade — user-requested portfolio review
- MIC — rare stewardship recognition, not a direct learning reward
- GI — federation attested perception, not objective reality
- GI95 — provisional Fountain eligibility, never automatic mint
- Reserve Blocks — sealed constitutional memory supporting recognition
- EVE sharding — proposal-only EPICON compression (parallel track; runtime after canon)

## 2. Failure mode prevented

```
Learn → farm badges → push GI → Fountain → MIC → wrap → speculate   ❌
```

```
Learn → demonstrate → MFS → portfolio → Integrity Grade → review → possible MIC → RB reference   ✅
```

## 3. Doctrine index

| Document | Topic |
|----------|-------|
| [MFS_CONSTITUTIONAL_DOCTRINE.md](../../04-TECHNICAL-ARCHITECTURE/integrity/MFS_CONSTITUTIONAL_DOCTRINE.md) | MFS evidence, non-transferable |
| [GI_PERCEPTION_DOCTRINE.md](../../04-TECHNICAL-ARCHITECTURE/integrity/GI_PERCEPTION_DOCTRINE.md) | GI as witness |
| [FOUNTAIN_ANTI_GAMING_DOCTRINE.md](../../04-TECHNICAL-ARCHITECTURE/integrity/FOUNTAIN_ANTI_GAMING_DOCTRINE.md) | Fountain states, GI95 |
| [GOODHART_RESISTANCE_DOCTRINE.md](../../04-TECHNICAL-ARCHITECTURE/integrity/GOODHART_RESISTANCE_DOCTRINE.md) | Witness principle, defenses |
| [INTEGRITY_GRADE_WORKFLOW.md](../../04-TECHNICAL-ARCHITECTURE/integrity/INTEGRITY_GRADE_WORKFLOW.md) | Request/review outcomes |
| [RESERVE_BLOCK_ATTRIBUTION.md](../../04-TECHNICAL-ARCHITECTURE/integrity/RESERVE_BLOCK_ATTRIBUTION.md) | Custodian, not owner |
| [HIGH_INTEGRITY_BASIN_MODEL.md](../../04-TECHNICAL-ARCHITECTURE/integrity/HIGH_INTEGRITY_BASIN_MODEL.md) | Shared burden |

EVE sharding (parallel): [EVE-SHARD-HANDOFF.md](./EVE-SHARD-HANDOFF.md)

## 4. Constitutional PR sequence (this track)

| # | Repo | What |
|---|------|------|
| 1 | Substrate | Canon + glossary (this handoff + doctrine) |
| 2 | Substrate | Six schemas + examples |
| 3 | browser-shell | Public Learn → MFS → portfolio copy (after PR1) |
| 4 | terminal | GI perception + Fountain status surface |
| 5 | terminal/CPC | Proposal-only Integrity Grade (no minting) |

**C-369 non-goals:** no MIC minting, no MFS transfer, no conversion ratio, no automatic grading, no GI math changes without separate PR.

## 5. Schemas (PR2)

`docs/06-specifications/schemas/`:

- `mfs.schema.json`
- `integrity-portfolio.schema.json`
- `integrity-grade-request.schema.json`
- `integrity-grade-result.schema.json`
- `fountain-state.schema.json`
- `gi-perception-manifest.schema.json`

## 6. Acceptance criteria

### Canon

- [ ] MFS non-transferable evidence; no arithmetic MFS→MIC
- [ ] MIC rare constitutional recognition
- [ ] GI attested perception; GI95 not auto-mint
- [ ] Fountain requires sustained adversarial review
- [ ] RB attribution ≠ archive ownership
- [ ] Basin doctrine prohibits burden dumping

### Anti-gaming

- [ ] No "increase GI" recipe in canon/UI copy
- [ ] Weight versioning visible; confidence degrades with coverage loss
- [ ] Goodhart defenses documented (§17)

### Human authority

- [ ] Human + ZEUS mandatory; no single-agent MIC; appeals append-only

## 7. EPICON intent

```intent
epicon_id: EPICON_C-369_CORE_mfs-fountain-integrity-perception_v1
ledger_id: kaizencycle
scope: specs
mode: normal
issued_at: 2026-07-11T00:00:00Z
expires_at: 2026-10-09T00:00:00Z
justification:
  VALUES INVOKED: integrity, stewardship, dignity, transparency, anti-capture, intergenerational continuity
  REASONING: Directly rewarding learning with MIC creates farming and Goodhart pressure on GI95.
    C-369 separates demonstrated capability (MFS) from constitutional recognition (MIC) and documents
    GI as attested perception with Fountain safeguards.
  ANCHORS:
    - MOBIUS.md
    - docs/00-START-HERE/CANONICAL_DEFINITIONS.md
    - docs/specs/EPICON_TIERING_SPEC_v0.1.md
    - docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md
    - docs/epicon/cycles/C-368/C-368-close.md
  BOUNDARIES: No MIC minting. No MFS transfer. No fixed MFS-to-MIC conversion. No automatic Fountain.
    No unilateral agent grading. No hidden GI math changes in C-369.
  COUNTERFACTUAL: If MFS creates farming, GI becomes a direct target, or Fountain eligibility is
    manufactured by visible input manipulation, pause runtime and quarantine for constitutional review.
counterfactuals:
  - Learning volume alone cannot create MIC recognition
  - GI95 requires SUSTAINED_GI95 not PROVISIONAL_GI95 alone
  - Runtime wallet/MIC issuance deferred until canon+schema merged
```

## 8. Closing statement

MFS proves capability. EPICON preserves intent. GI reflects perception. The Fountain tests durability. MIC recognizes stewardship. Reserve Blocks preserve memory.

*Kaizen: small steps, continuous improvements, follow the process. We heal as we walk.*
