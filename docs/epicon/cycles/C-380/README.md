# C-380 — External Reality Boundary (EPICON-000)

**Status:** **OPEN — DRAFT FOR CANONICAL REVIEW**  
**Opener:** 2026-07-22T02:06Z (UTC)  
**Custodian:** Michael Judan  
**Primary agents:** ATLAS × JADE  
**Review path:** ATLAS → JADE → EVE → ZEUS → Human merge

> Mobius did not begin by declaring what the world was. It began by declaring the limits of its own observation.

## Artifacts

| Document | Role |
|----------|------|
| [`EPICON-000-external-reality-boundary.md`](../EPICON-000-external-reality-boundary.md) | **Canonical home** — constitutional record |
| [`ATLAS_JADE_HANDOFF_EPICON-000.md`](./ATLAS_JADE_HANDOFF_EPICON-000.md) | PR-ready dual-agent handoff (source) |
| [`ATLAS_ARCHITECTURE_external-observation.md`](./ATLAS_ARCHITECTURE_external-observation.md) | Schema, trust states, replay, tests |
| [`JADE_CIVILIAN_RENDERER_external-claim.md`](./JADE_CIVILIAN_RENDERER_external-claim.md) | Civilian-readable signal template |
| [`EPICON_C-380_CONSTITUTION_external-reality-boundary_v1.md`](./EPICON_C-380_CONSTITUTION_external-reality-boundary_v1.md) | Cycle-bound operational EPICON |
| [`C-380-opener.md`](./C-380-opener.md) | Cycle opener narrative |
| [`schemas/epicon_external_observation_v1.schema.json`](../../../schemas/epicon_external_observation_v1.schema.json) | Machine-readable observation schema |

## Acceptance criteria (handoff)

- [x] EPICON-000 has one canonical home (`docs/epicon/EPICON-000-external-reality-boundary.md`)
- [x] Machine-readable schema exists
- [x] External trust states defined
- [x] Source independence modeled (`independence_group`, corroboration.independent)
- [x] Circular citations flaggable (`CIRCULAR_CITATION` source kind)
- [x] Claims and observations stored separately (`claims` vs `inferences`)
- [x] Counterfactual review required (schema `minItems: 1`)
- [x] Privacy constraints encoded (`privacy_review`)
- [x] Replay requirements documented
- [x] Failure/degraded states visible (`replay.degraded_states`)
- [x] Civilian-readable renderer drafted
- [ ] Terminal output wired (implementation follow-up)
- [ ] EVE ethical review
- [ ] ZEUS adversarial review
- [ ] Human merge mandatory

## Relation to C-379

C-379 remains open (wallet durability + ZEUS verification pending). C-380 opens **without** closing C-379 — external observation boundary is orthogonal infrastructure doctrine.
