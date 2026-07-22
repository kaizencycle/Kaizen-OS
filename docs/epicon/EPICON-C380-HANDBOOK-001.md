# EPICON-C380-HANDBOOK-001 — Handbook Progressive Disclosure

**Cycle:** C-380  
**Date:** 2026-07-22  
**Surface:** Handbook / documentation renderer  
**Status:** Proposed  

## Intent

Make the Mobius Handbook easier for a first-time human reader to understand without deleting, rewriting, or hiding the deeper canonical and historical record.

## Problem observed

The handbook had accumulated multiple overlapping entry points and a navigation structure that exposed constitutional, runtime, economic, research, and historical depth before a newcomer had a simple mental model of Mobius.

The MkDocs configuration also contained a stale `C-360` current-cycle label while `cycle.json` reported `C-380`.

## Scope

This change is intentionally narrow and additive:

1. Add `AI Simple in Life` as a plain-language first-principles chapter.
2. Rewrite the public handbook front door around progressive disclosure.
3. Reorganize MkDocs navigation into reader-oriented layers.
4. Update handbook display metadata from C-360 to C-380.
5. Add small responsive reading-path cards.
6. Preserve existing deep documents, archives, protocol pages, proof UI, and reader preferences.

## Out of scope

- No mass file moves.
- No archive deletion.
- No protocol semantics changed.
- No GI, MII, MIC, MFS, Reserve Block, or quorum behavior changed.
- No runtime authority moved into the Handbook.
- No claim that simulation or handbook rendering is canonical truth.

## Canon boundary

The Handbook remains a renderer and navigation surface.

```text
CANON → LEDGER → UI
```

No UI-derived truth.

When handbook prose, runtime state, and ratified canon disagree, the disagreement must remain visible until reconciled. The Handbook does not silently promote itself into the source of truth.

## Key doctrine introduced

### Integrity is structural, not moral

In `AI Simple in Life`, integrity describes whether a decision record remains coherent, attributable, and load-bearing when tested against reality. It is not a virtue score for a person and it is not synonymous with a successful outcome.

### Reality remains outside the model

```text
AI → REALITY → RESULT → EVIDENCE → AI
```

### HIVE boundary

Simulation may alter confidence, expose failure modes, or motivate tests. Simulation does not become observed fact merely because a model produced it.

## Risk

**Primary risk:** simplification could accidentally flatten important distinctions or make a plain-language page appear more authoritative than protocol canon.

**Mitigation:** explicit renderer/canon boundary, links downward into canonical definitions and protocol documents, additive changes only, and no deletion of existing depth.

## Rollback

Revert the C-380 handbook commits. Existing documentation files and protocol structure remain in place, so rollback does not require data migration.

## Review questions

### ATLAS

- Does the new navigation accurately reflect the current architecture?
- Are any canonical documents hidden behind an inappropriate category?
- Does `AI Simple in Life` make technical claims that exceed current implementation?

### JADE

- Does the front door read naturally to someone who has never heard of Mobius?
- Does simplification preserve the distinction between integrity, correctness, morality, and outcome?
- Does the handbook retain continuity with Kaizen and Kintsugi documentation principles?

### ZEUS

- Can a reader mistake HIVE simulation for evidence of a real event?
- Can a reader mistake a handbook verdict or example for professional engineering, medical, or safety certification?
- Are stale-cycle or renderer-as-truth failure modes still possible?

### EVE

- Does the consequence lens remain a harm/failure-mode check rather than a mechanism for scoring citizens?
- Is the boundary against surveillance or person-level virtue scoring preserved?

## Acceptance criteria

- [x] Plain-language first entry exists.
- [x] Handbook home routes by reader intent and depth.
- [x] Current-cycle display updated to C-380.
- [x] Navigation separates Start Here, Live State, Protocols, Architecture, Research, Journal, and Archives.
- [x] Existing deep documents remain intact.
- [x] Responsive UI addition is additive.
- [x] Canon → Ledger → UI boundary is stated.
- [x] HIVE simulation is explicitly non-truth.
- [ ] Build passes.
- [ ] Links/nav validation reviewed.
- [ ] ATLAS × JADE review complete.
- [ ] Human merge.
