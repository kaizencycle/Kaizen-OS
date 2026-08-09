# Academy Protocol v0.1

## OAA Floor 3 – Teaching, Assessment, and Learner Readiness

**Status:** Specification (pre-runtime)  
**Scope:** Constitutional framework for Academy instances  
**Phase Gate:** OAA Phase D (Authority/Hub completion required before runtime)  
**Principles:** Constitutional, fail-closed, comprehension-not-compliance  
**License:** CC0 / Public Domain

---

## 1. ACADEMY AS FLOOR 3

The OAA (Open Attestation Authority) defines three operational floors:

```
Floor 1: Authority
  └─ Attest / Witness / Seal
     (cryptographic primitives, Lab7)

Floor 2: Hub
  └─ Inference / Routing / Budgets
     (decision logic, resource allocation)

Floor 3: Academy
  └─ Lesson / Teaching / Assessment / Challenge / Learner Record
     (education & readiness gatekeeping)
```

Academy is not an application layered *on top* of OAA. It is the third floor of OAA itself.

**Constitutional binding:**

- Academy attestations are sealed through Floor 1 (Authority)
- Academy decisions respect Floor 2 routing and budgets (Hub)
- Academy is not complete until both preceding floors are operationally complete

See [OAA Charter](../OAA_CHARTER.md) §1 for canonical Floor definitions and §5 for Phase D gating.

---

## 2. ACADEMY INSTANCE STRUCTURE

A valid Academy instance consists of:

```yaml
lesson_id:
  format: OAA-{SUBJECT}-{SEQUENCE}
  example: OAA-HIST-001

metadata:
  title: Human-readable lesson title
  subject: Category (History, Economics, Current-Events, Social-Studies)
  phase_gate_satisfied: Boolean (Authority + Hub complete?)
  status: REFERENCE_LESSON | DRAFT | ACTIVE | ARCHIVED | QUARANTINED

constitutional_binding:
  protocol_version: "0.1"
  agent_teacher_contract: Reference to AGENT_TEACHER_CONTRACT.md
  assessment_protocol: Reference to ASSESSMENT_PROTOCOL.md
  fail_closed_rules: See section 4

teaching_cycle:
  agents_involved: [List of agent teacher IDs]
  intended_learners: [Audience description]
  learning_outcomes: [Comprehension goals, not ideology]

evidence_layer:
  sources: [Links to primary sources: commits, EPICON intents, ledgers]
  epicon_refs: [EPICON intent blocks cited or proven]
  proof_of_integrity: [Cryptographic seal from Lab7 / Authority floor]

assessment_layer:
  protocol: See ASSESSMENT_PROTOCOL.md
  questionnaire_id: Reference to sealed questionnaire
  readiness_gates: [Comprehension thresholds]
  grading_rubric: Reference to rubric (reasoning-based, not ideological)

learner_record:
  attestation_model: [Seal from Floor 1]
  privacy_model: [Learner data minimization rules]
  challenge_window: [Period during which learner can dispute assessment]
```

---

## 3. TEACHING CYCLE

Academy teaching cycles follow a structured progression:

### 3.1 Opening Question

Pose a timeless civic question that does not presume a Mobius answer.

**Example (OAA-HIST-001):**

> "When a trusted record is wrong, who gets to rewrite history?"

This is answerable *before* a learner has ever heard of Mobius.

### 3.2 Historical Context

Teach the *problem*, not the *solution*.

- Medieval ledgers with margin corrections
- Double-entry bookkeeping as an anti-corruption innovation
- Institutional records that were later found to be false
- The cost of erasure vs. the cost of visible contradiction

**Pedagogical stance:** Show the problem is old and difficult.

### 3.3 Case Study

Apply the principle to a *specific, verifiable incident*.

For OAA-HIST-001: the C-397 Reserve Block lineage collision (125 hash-divergent pairs among examined seals).

**Non-negotiable:** The case study must be:

- Real (not hypothetical)
- Documented (traceable to git commits, EPICON, ledger evidence)
- Examinable (learner can verify claims by reading witness JSON or running `git show`)
- Neutral on *how* Mobius solved it (case study shows *what* broke, not why the fix was right)

### 3.4 Constitutional Principle

Extract the principle from the case study.

**Example:**

> "Never repair evidence by pretending the contradiction never happened."

This principle is *derivable* from the case study. A learner who understands the case study should be able to articulate it without being told.

### 3.5 Operationalization

Show how the principle is *actually enforced* in a real system.

For OAA-HIST-001: EPICON's record structure:

- Original state
- Contradiction discovered
- Investigation documented
- Correction applied
- Provenance chain maintained

**Pedagogical stance:** "Here is what real integrity looks like when implemented."

### 3.6 Assessment Gate

Pose the comprehension challenge (see [ASSESSMENT_PROTOCOL.md](./ASSESSMENT_PROTOCOL.md)).

Learners must prove they understand:

- Why the original problem is dangerous
- How to distinguish correction from erasure
- What evidence justifies a record change
- How a system enforces the principle

---

## 4. FAIL-CLOSED BEHAVIOR

Academy instances must fail safely if rules are violated.

### 4.1 Attestation Rejection

If a learner attestation violates the protocol, the Floor 1 seal is rejected.

**Trigger cases:**

- Assessment was ideological, not comprehension-based
- Agent teacher violated the pedagogical contract
- Evidence links are false or unverifiable
- Learner challenge was not honored

**Response:** Attestation marked STALE or QUARANTINED; audit trail logged; human review required before restoration.

### 4.2 Lesson Quarantine

If an Academy lesson is found to violate protocol:

**Immediate actions:**

1. Lesson marked QUARANTINED
2. All new learner attempts blocked
3. Existing attestations marked for review
4. Audit trail captures the violation

**Resolution path:**

- Investigation (EPICON intent block required)
- Correction (new PR with amended protocol)
- Restoration (only after human merge approval)

### 4.3 Agent Teacher Removal

If an agent teacher violates the contract:

**Immediate actions:**

1. Agent removed from active teaching roster
2. All lessons taught by agent marked STALE
3. Learner challenges window opened (learners can dispute assessments)
4. Audit trail documents the violation

**Resolution path:**

- Agent remediation required (new contract commitment)
- Human approval before re-activation

---

## 5. LEARNER CHALLENGE WINDOW

Every learner has a **challenge window** — a period during which they can dispute their assessment.

### 5.1 Challenge Conditions

A learner may challenge an assessment if they can demonstrate:

- Assessment violated ASSESSMENT_PROTOCOL.md
- Agent teacher violated AGENT_TEACHER_CONTRACT.md
- Grading rubric was applied inconsistently
- Evidence links in the lesson were false or misleading

### 5.2 Challenge Process

1. Learner files challenge with evidence
2. EPICON intent block created (I1–I6 required)
3. ZEUS adversarial review (independent agent reviews challenge)
4. Human decision (merge gate approves or rejects challenge)
5. Outcome: Attestation upheld, modified, or revoked

### 5.3 Precedent

Successful challenges become constitutional precedent for future lessons.

All Academy instances must account for prior challenges when designing assessments.

**Default challenge window:** 30 days from attestation issuance.

---

## 6. COMPREHENSION ≠ AGREEMENT

**Constitutional Rule:**

> "Understanding is attestable. Agreement is not."

### 6.1 What This Means

A learner may:

- Understand the lesson perfectly
- Disagree with Mobius's approach
- Explain why they disagree
- **Still pass the assessment**

### 6.2 Assessment Constraint

The questionnaire **must not** ask learners to affirm the lesson's conclusions. It must ask learners to:

- Explain the problem
- Distinguish contradictory approaches
- Apply the principle to new scenarios
- Predict failure modes if the principle is violated

### 6.3 Grading Rubric

The rubric **must** accept coherent disagreement as a passing response.

**Example passing response:**

> "I understand why Mobius uses an immutable EPICON chain. But I think institutional records should be silently correctable with human oversight. I can see the risks either way. [Evidence follows.]"

This learner *understands* the Mobius position and articulates an alternative. They pass.

**Example failing response:**

> "I don't know. Mobius probably got it right."

This learner has not demonstrated comprehension. They fail.

---

## 7. RUNTIME PHASE (Post-Specification)

Once this protocol is stable and OAA Phase D gates are satisfied, Academy runtime may implement:

- Teaching cycle execution (scheduling, agent coordination)
- Assessment administration (questionnaire delivery, grading)
- Learner record persistence (durable storage via Civic-Protocol-Core)
- Attestation sealing (Floor 1 cryptographic binding)
- Challenge processing (EPICON workflow integration)

**Runtime decisions include:**

- Which service owns the lesson store (OAA service or separate Academy service)
- UI rendering in Browser Shell (Learn module)
- mobius-feed integration (promotion of upcoming lessons)

This protocol does not prescribe those choices. It sets the *boundary conditions* they must respect.

---

## 8. APPENDIX: CONSTITUTIONAL ALIGNMENT

### Against Witness Protocol (C-373)

- Academy attestations are **Claims** (teaching occurred)
- Questionnaire responses are **Verdicts** (understanding demonstrated)
- Evidence is **Evidence** (lesson sources, agent logs, learner responses)
- Stale transitions are automatic (STALE if agent removed, lesson quarantined, etc.)

### Against EPICON (C-370+)

- Academy publishes intent before lessons run (pedagogical intent + assessment design)
- Academy actions are deny-by-default (lesson must satisfy protocol before running)
- Academy failures are fail-closed (quarantine, challenge window, human review required)
- Academy is constitution-enforced (protocol violations trigger EPICON rejection)

### Against Goodhart Resistance (§17)

- Academy does not optimize for engagement metrics
- Comprehension gates are reasoning-based, not click-through-based
- Disagreement is encouraged (no ideological capture)
- Metrics are auditable and override-able (challenges can revert assessments)

---

## 9. REFERENCES

- **OAA Charter:** [docs/OAA_CHARTER.md](../OAA_CHARTER.md)
- **Witness Protocol:** C-373 ([docs/WITNESS_PROTOCOL.md](../WITNESS_PROTOCOL.md))
- **EPICON:** C-370+ ([docs/epicon/](../epicon/))
- **C-399 Intent:** [docs/epicon/cycles/C-399/EPICON_C-399_ACADEMY_PROTOCOL_v1.md](../epicon/cycles/C-399/EPICON_C-399_ACADEMY_PROTOCOL_v1.md)
- **Assessment Protocol:** [docs/academy/ASSESSMENT_PROTOCOL.md](./ASSESSMENT_PROTOCOL.md)
- **Agent Teacher Contract:** [docs/academy/AGENT_TEACHER_CONTRACT.md](./AGENT_TEACHER_CONTRACT.md)
- **Reference Exemplar:** [docs/academy/OAA-HIST-001-exemplar.md](./OAA-HIST-001-exemplar.md)

---

**Document Status:** Specification (non-runtime)  
**Constitutional Binding:** Yes (EPICON tier EP-3 via C-399)  
**Gated on:** OAA Authority + Hub floor completion (Phase D)
