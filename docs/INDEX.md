# Mobius Systems Documentation Index

**Version:** 1.0.1  
**Cycle:** C-284

This index provides navigation to all key Mobius documentation.

---

## 🏛️ Governance & Authority

The canonical authority model for Mobius Systems.

| Document | Purpose |
|----------|---------|
| [Governance Overview](./03-GOVERNANCE-AND-POLICY/governance/GOVERNANCE_OVERVIEW.md) | Four invariants, on-chain analogy |
| [Consensus Authority Flow](./03-GOVERNANCE-AND-POLICY/governance/CONSENSUS_AUTH_FLOW.md) | 90-day consensus sequence |
| [Roleplay Sandbox Rule](./03-GOVERNANCE-AND-POLICY/governance/ROLEPLAY_SANDBOX_RULE.md) | Hard boundary enforcement |
| [AVM Specification](./authority/AVM.md) | Authority Verification Module |
| [Companion Attestation Schema](./authority/companion_attestation.schema.json) | JSON Schema for attestations |

---

## 📜 EPICON Specifications

Epistemic constraint layer for AI systems.

| Spec | Purpose | Status |
|------|---------|--------|
| [EPICON-01](./epicon/EPICON-01.md) | Epistemic Justification (CSS + EJ + CCR) | Canonical |
| [EPICON-02](./epicon/EPICON-02.md) | Intent Publication & Divergence Protocol | Canonical |
| [EPICON-02 Invariants](./epicon/EPICON-02-INVARIANTS.md) | Formal invariants (13 rules) | Canonical |
| [EJ Schema](./epicon/ej.schema.json) | JSON Schema for Epistemic Justification | Canonical |
| [EVE Daily Closing Seal (C-284)](./epicon/EPICON-C284-EVE-DAILY-SEAL.md) | End-of-day synthesis, daily seal artifacts, hash chain | Draft |

**EPICON Specification Family:**
- **EPICON-01:** Coherence layer (epistemic justification)
- **EPICON-02:** Visibility layer (intent publication + divergence)
- **EPICON-03:** Collective epistemic consensus (planned)
- **EPICON-04:** Temporal drift analysis (planned)

---

## 🔐 Security & Threat Models

| Document | Purpose |
|----------|---------|
| [Epistemic Attack Threat Model](./06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md) | 6 attack classes + mitigations |
| [Threat Model v0.1](./06-OPERATIONS/security/threat_model_v0.1.md) | General security threats |

---

## 📚 Conceptual Essays

| Essay | Purpose |
|-------|---------|
| [Mobius Is Blockchain for Intent](./public/mobius_blockchain_for_intent.md) | Conceptual foundation |
| [Why Mobius Works](./public/why_mobius_works.md) | System overview |
| [Mobius At a Glance](./public/mobius_at_a_glance.md) | Quick summary |

---

## 🤖 PR Bot Governance

The Mobius PR Bot enforces EPICON-02 on all pull requests.

### How It Works

1. **Intent Publication Required:** Every PR must include an EPICON-02 block
2. **Scope Enforcement:** Changed files must match declared scope
3. **Time-Bounded Authority:** Maximum 90-day window (72h for emergency)
4. **Intent Evolution:** Hash changes require explicit declaration
5. **Divergence Severity:** Scored as low/medium/high for triage
6. **Transparency Debt:** Emergency PRs auto-create follow-up issues

### Scope Labels

| Scope | Allowed Paths |
|-------|---------------|
| `docs` | `docs/`, `epicon/`, `README.md` |
| `ci` | `.github/`, `ci/`, `scripts/` |
| `core` | `src/`, `packages/`, `apps/`, `services/` |
| `infra` | `infra/`, `deploy/`, `docker/`, `monitoring/` |
| `sentinels` | `sentinels/` |
| `labs` | `labs/` |
| `specs` | `specs/`, `schemas/`, `configs/` |

### Emergency Mode

For urgent changes that can't wait for normal consensus:

```intent
mode: emergency
emergency_scope: core
issued_at: 2025-12-20T23:00:00Z
expires_at: 2025-12-21T23:00:00Z  # ≤72 hours
```

Emergency mode creates a **Transparency Debt** issue requiring post-facto justification within 24 hours.

---

## 📁 Directory Structure

```
docs/
├── authority/           # AVM, attestation schemas
├── epicon/              # EPICON specifications
├── public/              # Public-facing essays
├── 03-GOVERNANCE-AND-POLICY/
│   └── governance/      # Governance documents
├── 06-OPERATIONS/
│   └── security/        # Threat models
└── INDEX.md             # This file
```

---

## Handbook (interactive library)

| Document | Purpose |
|----------|---------|
| [Interactive library (Levels 1–3)](./11-SUPPLEMENTARY/handbook/interactive-library.md) | Live proof tiles, proof-chain UI, Next.js shell |
| [Proof tags authoring](./11-SUPPLEMENTARY/handbook/proof-tags-authoring.md) | How to embed `<mobius-proof>` in MkDocs |

---

## 🔗 Related Specifications

| Spec | Location |
|------|----------|
| MFS (Mobius Fractal Shards) | `docs/07-RESEARCH-AND-PUBLICATIONS/specs/MFS_SPEC_v1.md` |
| MII (Mobius Integrity Index) | `specs/mii_spec_v1.md` |
| GI/MII Formal Spec | `specs/civic-ledger/RFC-0003-gi-and-mii-formal-spec.md` |

---

## 🧭 Quick Links

- **Start Here:** [00-START-HERE/README.md](./00-START-HERE/README.md)
- **FAQ:** [00-START-HERE/FAQ.md](./00-START-HERE/FAQ.md)
- **Glossary:** [00-START-HERE/GLOSSARY.md](./00-START-HERE/GLOSSARY.md)
- **Charter:** [../FOUNDATION/CHARTER.md](../FOUNDATION/CHARTER.md)
- **Bylaws:** [../FOUNDATION/BYLAWS.md](../FOUNDATION/BYLAWS.md)

---

## Core Principles

> **Authority in Mobius is proven, scoped, time-bounded, and witnessed — never narrated.**

> **Mobius does not prevent divergence. It makes divergence undeniable.**

> **Transparency does not stop bad behavior. It removes the advantage of surprise.**

---

*"We heal as we walk."* — Mobius Systems
