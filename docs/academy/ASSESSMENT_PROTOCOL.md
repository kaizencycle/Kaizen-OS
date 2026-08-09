# Assessment Protocol v0.1

## Questionnaire Design, Grading Rubric, and Readiness Gates

**Status:** Specification (pre-runtime)  
**Binding:** Constitutional (comprehension-not-compliance)  
**Principle:** Understanding is attestable. Agreement is not.  
**License:** CC0 / Public Domain

---

## 1. ASSESSMENT DESIGN CONSTRAINTS

### 1.1 Forbidden Patterns

**Do NOT ask:**

- "What does Mobius believe about X?" (ideology test)
- "Is the EPICON approach correct?" (agreement test)
- "True or false: The vault had 125 collision pairs." (memorization test)
- "Which is the best way to...?" (false choice test)
- Any multiple-choice question without a reasoning component

**Do NOT grade:**

- Ideological agreement with the lesson's conclusions
- Memorized facts (commit hashes, dates, numbers)
- Enthusiasm or engagement
- Matching expected phrasing

### 1.2 Required Patterns

**DO ask:**

- "Explain why X is dangerous and why the contradiction matters."
- "How would a system fail if it violated this principle?"
- "Distinguish between correction and erasure. Give an example."
- "If you disagreed with Mobius's approach, what would you do instead? Explain the tradeoff."
- "What evidence would justify changing an institutional record?"

**DO grade:**

- Internal consistency of reasoning
- Evidence awareness (do they cite sources?)
- Principle transfer (can they apply the principle to new scenarios?)
- Counterargument coherence (do they understand opposing views?)

---

## 2. QUESTIONNAIRE TEMPLATE

All Academy questionnaires must follow this structure:

### 2.1 Meta Block

```yaml
questionnaire_id: OAA-HIST-001-Q1
lesson_id: OAA-HIST-001
agent_teacher: History Agent (Mobius)
created_date: YYYY-MM-DD
protocol_version: "0.1"

pass_criteria:
  required_minimum: 3 of 5 comprehension gates
  ideology_filter: Disagreement with lesson conclusions does NOT cause failure
  reasoning_threshold: "Coherent explanation of reasoning required"
```

### 2.2 Comprehension Gates (5-question format)

Each gate tests a different aspect of understanding:

**Gate 1: Problem Recognition**

- What specific danger does the lesson identify?
- Why does this danger exist?
- (Not: memorize details; yes: recognize the fundamental problem)

**Gate 2: Distinction**

- How do you tell X from Y? (E.g., correction vs. erasure)
- What makes them different?
- (Not: pick the "right" choice; yes: articulate the distinction)

**Gate 3: Evidence Awareness**

- What evidence justifies action X?
- Where would you find that evidence?
- (Not: "trust authority"; yes: "here's what to check")

**Gate 4: Principle Transfer**

- Apply the principle to a *new* scenario (not the lesson's case study)
- How would the principle help?
- What would break if you ignored it?
- (Not: regurgitate the lesson; yes: extend the reasoning)

**Gate 5: Adversary Coherence**

- If you disagreed with the lesson's approach, what would you do instead?
- What's the tradeoff?
- (Not: "agree with Mobius"; yes: "explain a coherent alternative")

---

## 3. GRADING RUBRIC

### 3.1 Rubric Scale

Each gate is graded on this scale:

| Score | Meaning | Example |
|-------|---------|---------|
| 0 | Incomprehensible | Answer is off-topic, unrelated, or indicates no understanding |
| 1 | Partial | Answer shows awareness but misses key distinction or reasoning |
| 2 | Coherent | Answer explains reasoning clearly; reasoning is internally consistent |
| 3 | Excellent | Answer is coherent AND shows evidence awareness or transfer |

### 3.2 Pass Threshold

**Passing score:** 3 of 5 gates score ≥2 (Coherent or Excellent)

A learner can fail 2 gates and still pass overall, as long as 3 gates demonstrate coherent reasoning.

### 3.3 Disagree-and-Pass Rule

**Exception:** If a learner's answer to Gate 5 (Adversary Coherence) is scored as 2 (Coherent) or 3 (Excellent), that learner passes *even if* other gates are weaker, provided:

1. The alternative approach is internally consistent
2. The learner articulates a real tradeoff (not a strawman)
3. The disagreement shows *understanding* of what they're disagreeing with

**Rationale:** A learner who can articulate a coherent alternative position has demonstrated deeper comprehension than one who simply agrees.

---

## 4. QUESTION DESIGN EXAMPLES

See [OAA-HIST-001-exemplar.md](./OAA-HIST-001-exemplar.md) § Assessment for gate-specific good/bad question pairs.

---

## 5. GRADING WORKFLOW

### 5.1 Manual Grading (Reference Exemplar)

For the reference lesson (OAA-HIST-001), grading is manual to test the rubric:

1. **Learner submits written response** (one response per gate, ~200 words each)
2. **Grader applies rubric** (score each gate 0–3)
3. **Grader writes feedback** (why the score, what reasoning was clear/missing)
4. **Appeal window** (learner can challenge the grade if process violated)
5. **Verdict recorded** (PASS or FAIL, with rubric scores and feedback)

### 5.2 Generated Assessment (Future Runtime)

Once Academy runtime is built, assessments may be generated programmatically with human override and appeal always available.

### 5.3 Override Rule

A human can always override an automated grading decision if they can show rubric misapplication, ambiguous questions, or misread reasoning. Overrides are logged in the audit trail.

---

## 6. READINESS GATES

After passing the questionnaire, a learner receives a **readiness attestation**:

```
Attestation ID: ATT-OAA-HIST-001-{LEARNER}-{DATE}
Status: VERIFIED
Claim: Learner demonstrated comprehension of OAA-HIST-001
Evidence:
  - Questionnaire score: N/5 gates (Pass)
  - Rubric applied: ASSESSMENT_PROTOCOL v0.1
  - Appeal window: 30 days
```

### 6.1 What This Attestation Enables

- Participate in governance discussions on the lesson topic (comprehension proven)
- Challenge future assessments that don't meet this standard (precedent)
- Request EPICON review of lessons that violate protocol (informed challenger)

### 6.2 What This Attestation Does NOT Enable

- Voting on decisions (separate readiness gate)
- Authority to seal records (separate gate)
- Claim to expertise (attestation proves comprehension, not mastery)

---

## 7. LEARNER CHALLENGE PROTOCOL

If a learner believes their assessment was unfair, they can file a challenge within 30 days of their verdict.

### 7.1 Challengeable Claims

- **Rubric violation:** Grader applied a forbidden pattern
- **Question violation:** Question violated the questionnaire template
- **Process violation:** Grade recorded incorrectly or feedback falsified
- **Evidence violation:** Evidence links in the lesson were false

### 7.2 Challenge Process

1. Learner files challenge (1–2 page explanation with evidence)
2. Challenge marked as EPICON Case (intent block created)
3. ZEUS review (independent agent audits the grading decision)
4. Human merge decision (original verdict upheld or overturned)
5. Precedent stored (if challenge succeeds, it informs future grading)

### 7.3 Successful Challenge Outcome

- Learner's attestation restored to PASS (if they were failed)
- Grader flagged for retraining
- Lesson may be quarantined if protocol violation was systematic
- Audit trail is public

---

## 8. SPECIAL CASES

### 8.1 Learner Disagrees Fundamentally

Fundamental disagreement ≠ lack of comprehension if the learner can articulate what they disagree with and why.

### 8.2 Learner Demands to Agree

"I fully agree with Mobius" is insufficient without explaining *why* — the reasoning must be demonstrated.

### 8.3 Learner Requests Alternative Lesson

Out of scope for grading. Curriculum design may evolve from feedback, but assessment is on the lesson offered.

---

## 9. CONSTITUTIONAL SAFEGUARD

**Rule:** If any Academy assessment violates "Understanding is attestable, Agreement is not," the assessment is automatically marked QUARANTINED.

**Procedure:**

1. Violation identified (via challenge, audit, or design review)
2. Assessment marked QUARANTINED (no new attempts)
3. Existing attestations marked for review
4. EPICON intent block filed
5. Protocol amendment or lesson correction required before restoration

---

## 10. REFERENCES

- **Academy Protocol:** [ACADEMY_PROTOCOL.md](./ACADEMY_PROTOCOL.md)
- **Agent Teacher Contract:** [AGENT_TEACHER_CONTRACT.md](./AGENT_TEACHER_CONTRACT.md)
- **Learner Challenge Window:** ACADEMY_PROTOCOL.md §5

---

**Document Status:** Specification (pre-runtime)  
**Constitutional Binding:** Yes (comprehension-not-compliance rule)  
**Testing:** OAA-HIST-001 reference exemplar
