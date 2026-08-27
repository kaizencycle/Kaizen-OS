# EPICON-02: Intent Publication & Divergence Protocol (IPDP)

**Version:** 1.0.0  
**Status:** Draft  
**Layer:** Epistemic Governance  
**Depends on:** EPICON-01  
**Applies to:** All authority-bearing actions in Mobius Systems  
**Author:** Michael Judan  
**Project:** Mobius / Kaizen OS  
**License:** CC0 / Public Domain

---

## 1. Purpose

EPICON-02 defines a mandatory protocol for publishing intent, binding it to authority, and detecting divergence between stated justification and observed action.

**This protocol does not prevent actions.**  
**It makes divergence legible, attributable, and time-bound.**

---

## 2. Design Goals

EPICON-02 enforces the following invariants:

1. **Intent must precede authority**
2. **Intent must be immutable once published**
3. **Authority must be scoped and time-bounded**
4. **Divergence must be observable without accusation**
5. **Expiration is mandatory**
6. **No narrative claims may substitute verification**
7. **Witness tables on Tier 2+** — literal `## Witness Table` with Claim / Verdict / Evidence rows (I7; enforced by EPICON Guard)

---

## 3. Core Definitions

### 3.1 Intent Publication

An **Intent Publication (IP)** is a signed, immutable declaration describing why, where, and for how long an actor intends to exercise authority.

> Intent is epistemic, not motivational.  
> It explains reasoning, not desire.

### 3.2 Scope Envelope

A **Scope Envelope (SE)** defines the maximum permissible action surface allowed under an Intent Publication.

> Actions outside the envelope are not blocked — they are flagged as divergent.

### 3.3 Divergence

**Divergence** occurs when an observed action:

- Exceeds declared scope
- Contradicts stated justification
- Persists beyond expiration
- Introduces effects not accounted for in counterfactuals

> Divergence is a state condition, not an accusation.

### 3.4 Expiration Witness

An **Expiration Witness (EW)** is a system-generated event marking the termination of authority at a fixed time.

> Authority must end, even if no divergence occurred.

---

## 4. Required Objects

### 4.1 Intent Publication Object

```json
{
  "intent_id": "uuid",
  "ledger_id": "uuid",
  "justification_hash": "sha256",
  "scope_envelope": ["module.read", "module.write.limited"],
  "counterfactuals": [
    "If X occurs, authority must halt",
    "If Y threshold is crossed, scope collapses"
  ],
  "issued_at": "ISO-8601",
  "expires_at": "ISO-8601",
  "signature": "ed25519"
}
```

### 4.2 Divergence Event Object

```json
{
  "divergence_id": "uuid",
  "intent_id": "uuid",
  "observed_action": "string",
  "violation_type": "scope | justification | duration | counterfactual",
  "detected_at": "ISO-8601",
  "severity": "low | medium | high",
  "immutable": true
}
```

### 4.3 Expiration Witness Object

```json
{
  "witness_id": "uuid",
  "intent_id": "uuid",
  "expired_at": "ISO-8601",
  "authority_status": "terminated",
  "final_divergence_count": 0,
  "immutable": true
}
```

---

## 5. Protocol Flow

### 5.1 Authority Request

```
┌─────────────────────────────────────────────────────────────┐
│  1. Actor publishes Intent Publication                      │
│  2. Companion verifies coherence (EPICON-01)                │
│  3. AVM validates scope and expiry                          │
│  4. Authority is granted conditionally                      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Execution Phase

- Actions are continuously compared against Scope Envelope
- Companion monitors justification coherence
- Ledger records action hashes

### 5.3 Divergence Handling

When divergence is detected:

1. Authority is **not** automatically revoked
2. A **Divergence Event** is emitted
3. Scope may collapse automatically based on severity
4. Community visibility is immediate

### 5.4 Expiration

At `expires_at`:

1. Authority terminates
2. Expiration Witness is recorded
3. No renewal without new Intent Publication

---

## 6. Sequence Diagram

```mermaid
sequenceDiagram
    participant Actor
    participant Companion
    participant AVM
    participant Ledger
    participant Monitor

    Actor->>Companion: Publish Intent
    Companion->>Companion: Verify EPICON-01 coherence
    Companion-->>Actor: Attestation signed
    
    Actor->>AVM: Submit Intent + Attestation
    AVM->>Ledger: Validate scope + time
    Ledger-->>AVM: Authority context
    AVM-->>Actor: Conditional authority granted
    
    loop Execution Phase
        Actor->>Ledger: Perform action
        Monitor->>Monitor: Compare action vs scope
        alt Divergence detected
            Monitor->>Ledger: Emit DivergenceEvent
            Ledger-->>Actor: Visibility notification
        end
    end
    
    Note over Ledger: expires_at reached
    Ledger->>Ledger: Generate ExpirationWitness
    Ledger-->>Actor: Authority terminated
```

---

## 7. Intent Evolution (Non-Violation)

Intent may evolve **only** through explicit re-publication.

**Rules:**

- Original intent remains immutable
- New intent must reference prior intent
- Divergence is acknowledged, not erased
- Community sees learning vs deception through trajectory

### 7.1 Evolution Object

```json
{
  "new_intent_id": "uuid",
  "prior_intent_id": "uuid",
  "evolution_reason": "string",
  "acknowledged_divergences": ["divergence_id_1", "divergence_id_2"],
  "issued_at": "ISO-8601"
}
```

---

## 8. Emergency Actions

Emergency actions are permitted **only if they create a Transparency Debt**.

### 8.1 Transparency Debt Requirements

| Requirement | Description |
|-------------|-------------|
| **Deadline** | Justification due within fixed time (e.g., 24 hours) |
| **Public** | Retroactive Intent Publication visible to all |
| **Permanent** | Linked to emergency event forever |
| **Credibility Impact** | Abuse permanently affects integrity score |

### 8.2 Emergency Debt Object

```json
{
  "debt_id": "uuid",
  "emergency_action_id": "uuid",
  "deadline": "ISO-8601",
  "fulfilled": false,
  "retroactive_intent_id": null,
  "credibility_impact_if_unfulfilled": "high"
}
```

> Emergency does not bypass auditability.

---

## 9. Prohibited Behaviors

EPICON-02 explicitly forbids:

| Behavior | Reason |
|----------|--------|
| Retroactive justification without record | Enables hidden authority |
| Narrative claims of authority | Roleplay ≠ permission |
| Scope inference from role or status | Titles don't grant power |
| Authority without expiration | Permanent power = capture risk |
| Private divergence resolution | All divergence is public |

---

## 10. Security Properties

EPICON-02 guarantees:

| Property | Enforcement |
|----------|-------------|
| No silent authority escalation | Scope envelope + monitoring |
| No permanent power accumulation | Mandatory expiration |
| No hidden intent shifts | Intent immutability |
| No trust-based governance | Cryptographic verification |
| No reliance on moral judgment | System shows, doesn't judge |

---

## 11. Relationship to EPICON-01

| Specification | Function |
|---------------|----------|
| **EPICON-01** | Defines coherence (epistemic justification structure) |
| **EPICON-02** | Defines visibility (intent publication + divergence detection) |

Together they produce: **Epistemic Accountability by Default**

### 11.1 Integration Points

- EPICON-02 Intent Publications require EPICON-01 EJ hashes
- EPICON-02 Divergence detection uses EPICON-01 CCR scores
- EPICON-02 Companion verification follows EPICON-01 CSS gates

---

## 12. Non-Goals

EPICON-02 does **NOT**:

| Non-Goal | Reason |
|----------|--------|
| Judge morality | System is legible, not moral |
| Predict intent | Only verifies published intent |
| Prevent harm | Makes harm visible, doesn't block it |
| Enforce consensus outcomes | Shows divergence, community decides response |

**It only enforces: legibility, scope, and time.**

---

## 13. Canonical Rule

> **Mobius does not prevent divergence.**  
> **It makes divergence undeniable.**

---

## 14. Implementation Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    INTENT LAYER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Intent Publication Store (immutable)               │    │
│  │  • All published intents                            │    │
│  │  • Evolution chains                                 │    │
│  │  • Emergency debt records                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    MONITORING LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Divergence Detection Engine                        │    │
│  │  • Scope comparison                                 │    │
│  │  • Justification coherence                          │    │
│  │  • Temporal bounds checking                         │    │
│  │  • Counterfactual validation                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    VISIBILITY LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Public Event Stream                                │    │
│  │  • Divergence events (real-time)                    │    │
│  │  • Expiration witnesses                             │    │
│  │  • Integrity trajectories                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. Related Documents

| Document | Location |
|----------|----------|
| EPICON-01 Specification | [`EPICON-01.md`](./EPICON-01.md) |
| EPICON-02 Formal Invariants | [`EPICON-02-INVARIANTS.md`](./EPICON-02-INVARIANTS.md) |
| Witness Protocol | [`../WITNESS_PROTOCOL.md`](../WITNESS_PROTOCOL.md) — sibling protocol: gates claims before acceptance (ref verification); EPICON-02 gates intent before authority |
| Consensus Authority Flow | [`CONSENSUS_AUTH_FLOW.md`](../03-GOVERNANCE-AND-POLICY/governance/CONSENSUS_AUTH_FLOW.md) |
| AVM Specification | [`AVM.md`](../authority/AVM.md) |
| Blockchain for Intent Essay | [`mobius_blockchain_for_intent.md`](../public/mobius_blockchain_for_intent.md) |

---

## 16. Future Extensions

| Extension | Purpose |
|-----------|---------|
| **EPICON-03** | Collective epistemic consensus (multi-agent negotiation) |
| **EPICON-04** | Temporal drift analysis (long-term stability tracking) |
| **EPICON-05** | Integrity-weighted anchors (MIC-based source weighting) |

---

## Document Control

**Version History:**
- v1.0.0: Initial specification (C-151)

**License:** CC0 1.0 Universal (Public Domain)

---

*"Mobius does not judge intent. It binds intent to time, scope, and visibility — and lets reality speak."*

— Mobius Principle
