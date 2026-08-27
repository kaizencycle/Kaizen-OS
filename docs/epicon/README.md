# EPICON-01 — Epistemic Constraint Layer

> **Meaning is contextual, but coherence is mandatory.**

EPICON-01 defines a formal epistemic constraint layer for AI systems that preserves meaning while preventing preference drift.

---

## What This Prevents

**Intent drift**: the tendency for a model to become a mirror of the user's agenda instead of a meaning-preserving assistant.

**Epistemic monoculture**: all AI aligning to dominant cultural preferences rather than respecting contextual variation.

**Preference capture**: over-optimization toward user desires at the expense of truth, safety, or coherence.

---

## How It Works

```
Input → Context Inference → CSS Gate → EJ Builder → CCR Validator → Output + Audit Log
```

1. **Context Inference**: Identify candidate contexts with confidence scores
2. **CSS Gate** (hard constraint): Non-negotiable safety checks—unsafe actions never pass
3. **EJ Builder**: Generate structured justification (values, reasoning, anchors, boundaries, counterfactual)
4. **CCR Validator**: Test coherence across alternative contexts; if CCR < threshold, request clarification
5. **Audit Log**: Store EJ hash for integrity scoring and accountability

---

## Core Distinction

| Layer | Governs | May Vary? |
|-------|---------|-----------|
| **Common Sense** | Survival and coordination constraints | ✘ No |
| **Epistemology** | Justification and meaning | ✔ Yes, by context |

> Common sense must never be violated; epistemology may vary by context.

---

## Files in This Directory

| File | Purpose |
|------|---------|
| [`EPICON-000-external-reality-boundary.md`](./EPICON-000-external-reality-boundary.md) | **External observation genesis** — witness pool doctrine, quarantine boundary (C-380) |
| [`EPICON-0001-mobius-substrate-naming.md`](./EPICON-0001-mobius-substrate-naming.md) | Canonical naming document: "Mobius Substrate" |
| [`EPICON-01.md`](./EPICON-01.md) | Epistemic constraint specification (coherence layer) |
| [`EPICON-02.md`](./EPICON-02.md) | Intent publication & divergence protocol (visibility layer) |
| [`../WITNESS_PROTOCOL.md`](../WITNESS_PROTOCOL.md) | Ref-verification for completion reports (claims before acceptance) |
| [`EPICON-02-INVARIANTS.md`](./EPICON-02-INVARIANTS.md) | Formal invariants for EPICON-02 |
| [`EPICON-03.md`](./EPICON-03.md) | Multi-agent collective epistemic consensus |
| [`EXPLAIN_FAILURE.md`](./EXPLAIN_FAILURE.md) | Guide for understanding and fixing EPICON-02 failures |
| [`ej.schema.json`](./ej.schema.json) | JSON schema for Epistemic Justification |
| [`ej.example.json`](./ej.example.json) | Example EJ document |
| [`ccr-tests.md`](./ccr-tests.md) | CCR test suite |

---

## Minimal Runtime Mode

When EPICON-01 is active, you can keep justification strict internally and expose only:

- **Answer**
- **CSS status** (safe/unsafe)
- **Boundary note** (one sentence)

Full EJ structure is required internally; user-facing verbosity is optional.

---

## When to Return "Needs Clarification"

If CCR fails (coherence score below threshold), the system must not "guess the world." It either:

- Requests a missing premise, or
- Returns a conditional answer: "If X, then Y; if Z, then W."

---

## Integration with MIC/MII

EPICON-01 is the epistemic substrate for Mobius Integrity Credit:

```
MIC Issuance = f(CSS, EJ_completeness, CCR_score, anchor_diversity)
```

**What gets written to ledger:**
- EJ hash (not raw content)
- CCR score
- Anchor count + types
- CSS status

**What does NOT get written:**
- Private identifiers
- Raw conversation text
- Personal traits

---

## Quick Start

### Validate an EJ document

```bash
# Using ajv or similar JSON schema validator
npx ajv validate -s docs/epicon/ej.schema.json -d docs/epicon/ej.example.json
```

### Run CCR tests

```bash
npm run test:epicon
```

---

## Design Philosophy

EPICON-01 explicitly rejects:

- Moral absolutism
- Cultural relativism
- Preference absolutism
- Engagement-based alignment

It encodes **contextual coherence**: meaning varies by context, but coherence is mandatory.

---

## EPICON Specification Family

| Spec | Purpose | Status |
|------|---------|--------|
| **EPICON-01** | Coherence layer (epistemic justification) | Canonical |
| **EPICON-02** | Visibility layer (intent publication + divergence) | Canonical |
| **EPICON-03** | Consensus layer (multi-agent verification) | Draft |
| **EPICON-04** | Temporal drift analysis (planned) | Future |
| **EPICON-05** | Integrity-weighted anchors (planned) | Future |

Together, EPICON-01, EPICON-02, and EPICON-03 produce: **Epistemic Accountability by Default**

### EPICON-03: Multi-Agent Consensus

EPICON-03 prevents single-model capture by requiring:

- **N independent agents** produce EJ objects for the same action
- **Consensus Engine** computes agreement, conflict, coverage, and robustness
- **Attested Consensus** (PASS) or **Attested Dissent** (NEEDS_CLARIFICATION / FAIL)

Result: The substrate becomes resistant to "one model convinced by one prompt."

---

## Related Specifications

- [MFS Spec](../07-RESEARCH-AND-PUBLICATIONS/specs/MFS_SPEC_v1.md) — Mobius Fractal Shards
- [MII Spec](../07-RESEARCH-AND-PUBLICATIONS/specs/MII_SPEC_v1.md) — Mobius Integrity Index
- [RFC-0003: GI and MII Formal Spec](../07-RESEARCH-AND-PUBLICATIONS/specs/civic-ledger/RFC-0003-gi-and-mii-formal-spec.md)
- [Governance Overview](../03-GOVERNANCE-AND-POLICY/governance/GOVERNANCE_OVERVIEW.md) — Authority model
- [AVM Specification](../authority/AVM.md) — Authority Verification Module

---

## License

CC0 1.0 Universal (Public Domain)

---

*"An AI that cannot explain why something makes sense in context is not intelligent—it is merely compliant."*
