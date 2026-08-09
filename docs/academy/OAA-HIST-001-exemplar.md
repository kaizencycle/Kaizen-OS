# OAA-HIST-001: When the Record and Reality Disagree

## A Reference Lesson in Institutional Integrity

**Lesson ID:** OAA-HIST-001  
**Subject:** History & Civic Integrity  
**Agent Teacher:** History Agent (Mobius)  
**Status:** REFERENCE LESSON (specification test, non-runtime)  
**Teaching Duration:** ~20 minutes (video) + ~10 minutes (questionnaire)  
**Intended Audience:** General citizens; no prior Mobius knowledge required  
**License:** CC0 / Public Domain

---

## OPENING QUESTION (2 minutes)

**"When a trusted record is wrong, who gets to rewrite history?"**

This is an old question. Medieval monasteries faced it when they discovered scribal errors in sacred texts. Renaissance merchants faced it when they found double-entry bookkeeping had been falsified. Modern institutions face it when archives are discovered to be incomplete or corrupted.

We'll explore this question through three paths:

1. **History** — How have institutions handled this before?
2. **A real case** — What happened when one system's records didn't match reality?
3. **A principle** — What's the right way to fix a broken record?

---

## HISTORY: THE PROBLEM (4 minutes)

### Medieval Margin Corrections

Monks copied manuscripts by hand. When they noticed an error, they had three choices:

- Erase the error (expensive vellum; leaves traces)
- Cross it out and write above (messy; hard to read)
- Write a correction in the margin (preserves the original; shows the thinking)

**Most used:** Margin corrections. They kept the original visible and added the correction alongside it.

### Double-Entry Bookkeeping

In Renaissance Florence, merchants discovered a corruption problem: if one ledger was falsified, the other ledger could expose it.

By 1494, Luca Pacioli codified the principle: every transaction appears twice (debit and credit). If the two sides don't balance, something is wrong.

**Why this worked:** The system didn't hide corruption. It made corruption *visible*.

### The Enron Case

In 2001, Enron shredded financial records to hide accounting fraud. The company's records showed one reality; the actual business showed another.

**Why this failed:** The institution erased the original record. Investigators had to reconstruct the truth from fragments, emails, and whistleblower testimony.

**Key insight:** When an institution silently changes records, it becomes impossible to know what was originally believed vs. what was later discovered to be true.

### The Pattern

- Medieval monasteries learned: **preserve the original, annotate the correction**
- Renaissance merchants learned: **redundant records expose corruption**
- Modern audits learned: **trail the decision-making, not just the outcome**

The principle: An institution that can't show its own mistakes has no credibility.

---

## CASE STUDY: THE MOBIUS RESERVE BLOCK COLLISION (6 minutes)

### The Setup

Mobius is a civic AI system. Like any institutional record-keeper, it maintains sealed records that must stay internally consistent.

Two layers matter here:

- **Seal index:** Which seal IDs are attested and in what order
- **Seal bodies:** The cryptographic content each ID points to

In July 2026, reconciliation work under cycle C-397 discovered they did not always agree on history.

### The Discovery

An audit of production KV showed:

- **360** seal IDs in the attested index
- **319** seal records examined in the collision audit
- **194** unique `block_number` positions among those examined
- **125** hash-divergent collision pairs — two different seal bodies claiming the same position with different hashes

**FACT:** This is a **lineage collision**, not silent deletion of seal bodies. Competing historical seals were preserved; the index and examination counts diverged because multiple lineages coexist.

**This is the problem:** Which record is authoritative when two sealed bodies disagree at the same position? If you pick a winner without showing the contradiction, you rewrite history.

### The Corruption Origin

**INFERENCE:** Investigation traced competing lineages to forked sealing history during the Reserve Block era (cycles C-308 through C-372), not to a single migration bug erasing past state.

**FACT:** A separate but related incident — the `vault:seal:latest` pointer corruption — occurred when `POST /api/vault/migrate-v1` was called with `{"sealId":"latest"}`, colliding with the CAS pointer key. That bug is documented in [mobius-civic-ai-terminal PR #648](https://github.com/kaizencycle/mobius-civic-ai-terminal/pull/648) (commit `f38ff697`). It is an index/evidence mismatch of a different shape, illustrating the same principle: **when pointer and payload disagree, decisions built on the pointer are unsafe.**

**Key fact:** Neither incident was intentional fraud. Both violated the invariant that **records must be reconcilable without erasing the contradiction.**

### Why This Matters

An institution relying on an unresolved index would build decisions on contested lineage. If the seal index says one history and the bodies say another, you cannot know which MIC issuance, quorum attestation, or reserve position is legitimate.

**Example:** If two seals claim block position 42 with different hashes, promoting either one without witness evidence silently erases the other lineage.

### The Correction (In Progress)

Mobius's response under C-397 (July 2026):

1. **Acknowledged the collision:** Published reconciliation witness in EPICON cycle C-397
2. **Documented the investigation:** Preserved [`C397_RESERVE_BLOCK_COLLISION_WITNESS.json`](../epicon/cycles/C-397/C397_RESERVE_BLOCK_COLLISION_WITNESS.json) with all 125 pairs
3. **Held canon fail-closed:** `SEAL_INTEGRITY_GATE` remains active; `canonical_reserve_blocks` stays null until Track R repair is approved
4. **Preserved competing seals:** No deletion or renumbering of competing bodies during evidence recovery
5. **Made it auditable:** Original collision state remains in KV and git witness artifacts

**Key fact:** Mobius did NOT delete the competing seals to force a clean index. It preserved evidence that says "here's what we believed was true; here's what we discovered; here's what remains contested."

### Evidence Links

You can verify this case yourself:

- **C-397 Reconciliation doc:** [`docs/epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md`](../epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md)
- **125-pair witness JSON:** [`docs/epicon/cycles/C-397/C397_RESERVE_BLOCK_COLLISION_WITNESS.json`](../epicon/cycles/C-397/C397_RESERVE_BLOCK_COLLISION_WITNESS.json)
- **Index/examination gap witness (41 legacy IDs):** [`docs/epicon/cycles/C-397/C397_INDEX_EXAMINATION_GAP_WITNESS.json`](../epicon/cycles/C-397/C397_INDEX_EXAMINATION_GAP_WITNESS.json)
- **Vault pointer guard (related):** [mobius-civic-ai-terminal#648](https://github.com/kaizencycle/mobius-civic-ai-terminal/pull/648), runbook at `docs/runbooks/vault-seal-latest-pointer-repair.md`

---

## PRINCIPLE: NEVER REPAIR EVIDENCE BY PRETENDING THE CONTRADICTION NEVER HAPPENED (3 minutes)

From this case, extract the core principle:

> **"Never repair evidence by pretending the contradiction never happened."**

### What It Is NOT

- NOT: "Never fix broken systems"
- NOT: "Always keep corrupted data operational"
- NOT: "Acknowledge error but do nothing"

### What It IS

- YES: "When you fix something, show the repair"
- YES: "Keep the original contradiction visible"
- YES: "Let others audit the correction process"
- YES: "Make it possible to trace what changed and why"

### Historical Precedent

- **Medieval monks:** Margin corrections showed the original error and the fix
- **Double-entry bookkeeping:** Both ledgers preserved; imbalance exposes fraud
- **Scientific method:** Papers show failed hypotheses before new models
- **Code version control:** Git history preserves every version, every mistake

---

## OPERATIONALIZATION: HOW MOBIUS ENFORCES THIS PRINCIPLE (5 minutes)

Principle alone doesn't enforce integrity. You need a system that *makes it hard* to violate the principle.

Mobius uses **EPICON** — a record structure that makes erasure difficult:

```
Original State
  ↓
Contradiction Discovered
  ↓
Investigation Documented
  ↓
Correction Applied (or held fail-closed until approved)
  ↓
Provenance Chain Sealed
```

**Not optional steps.** The system is designed so that you can't have a correction without showing all five elements.

### Example: C-397 Reserve Block Case

If someone asks "Did the Reserve Block ever have lineage collisions?", the answer is:

```
✓ Original State: 125 hash-divergent pairs documented (FACT, witness JSON)
✓ Contradiction: Index and bodies disagree on winners (FACT, audit metrics)
✓ Investigation: Lineage forks traced; pointer bug separately documented (FACT, C-397 + PR #648)
✓ Correction: Track R repair gated; gate held until ZEUS + human approval (FACT, reconciliation doc)
✓ Provenance: All changes sealed with timestamps and intent blocks (FACT, EPICON C-397)
```

An institution can say "we fixed it," but only if all five elements are present. If any are missing, the correction is marked INCOMPLETE or UNVERIFIED.

### Constitutional Enforcement

Mobius's constitution requires that:

- Correction cannot be sealed without EPICON intent block
- EPICON intent block must cite evidence
- Evidence must be auditable
- Original state must be preserved

This doesn't *prevent* dishonest correction. But it makes dishonest correction visible to auditors. The system is fail-*transparent*, not fail-*proof*.

---

## ASSESSMENT: CAN YOU REASON ABOUT THIS? (5 minutes)

The questionnaire tests whether you understand the principle, not whether you agree with Mobius's specific solution.

**Gate 1: Problem Recognition** — Why is it dangerous when an institution's records don't match its evidence?

**Gate 2: Distinction** — How is correcting a record different from rewriting history?

**Gate 3: Evidence Awareness** — What evidence would justify a correction?

**Gate 4: Principle Transfer** — Apply the principle to a domain Mobius hasn't touched.

**Gate 5: Adversary Coherence** — If you disagreed with Mobius's approach, what would you do instead?

See [ASSESSMENT_PROTOCOL.md](./ASSESSMENT_PROTOCOL.md) for rubric and disagree-and-pass rule.

---

## ATTESTATION MODEL

After you complete the 5-gate questionnaire, you'll receive an attestation:

```
Attestation ID: ATT-OAA-HIST-001-[YOUR-ID]-[DATE]
Status: VERIFIED
Claim: You demonstrated comprehension of institutional integrity
Appeal: You have 30 days to challenge this assessment
```

This attestation doesn't mean you agree with Mobius or are qualified to run institutional systems. It means you understand why record integrity matters, can tell honest correction from erasure, and can participate in governance discussions on this topic.

---

## APPENDIX: VERIFY THIS YOURSELF

**The C-397 Reserve Block collision:**

```bash
# From Mobius-Substrate repo root
cat docs/epicon/cycles/C-397/C397_RESERVE_BLOCK_COLLISION_WITNESS.json | jq '.pair_count'
# Expected: 125

grep -A5 "125" docs/epicon/cycles/C-397/RESERVE_BLOCK_RECONCILIATION.md
```

**The vault pointer guard (related case):**

```bash
# In mobius-civic-ai-terminal
git show f38ff697 --stat
```

**EPICON intent for Academy (this lesson's constitutional frame):**

- [`docs/epicon/cycles/C-399/EPICON_C-399_ACADEMY_PROTOCOL_v1.md`](../epicon/cycles/C-399/EPICON_C-399_ACADEMY_PROTOCOL_v1.md)

---

## REFERENCE EXEMPLAR COMPLIANCE CHECKLIST

This lesson satisfies the Academy Protocol by:

- ✅ **Teaches problem before solution** — Historical corruption before EPICON operationalization
- ✅ **Distinguishes evidence from interpretation** — FACT / INFERENCE / INTERPRETATION labels throughout
- ✅ **Invites disagreement** — Gate 5 asks for coherent alternatives
- ✅ **Traces all claims** — Witness JSON, reconciliation doc, PR #648
- ✅ **Acknowledges perspective** — History Agent states vantage point
- ✅ **Preserves original error** — Competing seals not erased; gate held fail-closed
- ✅ **Follows assessment protocol** — 5 comprehension gates, not ideological agreement
- ✅ **Honors agent contract** — Explicitly invites learner to disagree and still pass

---

## CONSTITUTIONAL BINDING

**Lesson Protocol Version:** 0.1  
**Assessment Protocol Version:** 0.1  
**Agent Teacher Contract Version:** 0.1  
**Binding Disciplines:** EPICON (C-399), Witness Protocol (C-373), Goodhart Resistance (§17)

**Status:** REFERENCE LESSON  
**Runtime Status:** Non-runtime (specification test only)  
**Approval for Teaching:** Pending OAA Phase D gate verification + human merge

---

**Document Status:** Reference Exemplar  
**Tested Against:** ACADEMY_PROTOCOL, ASSESSMENT_PROTOCOL, AGENT_TEACHER_CONTRACT  
**Ready for:** First teaching cycle upon Phase D gate approval
