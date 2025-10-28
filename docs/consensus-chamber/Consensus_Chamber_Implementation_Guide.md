# 🎯 Consensus Chamber Implementation Guide

**Version:** 1.0.0 | **Date:** October 28, 2025
**For:** Multi-LLM Federated Decision Making in Kaizen OS

---

## 🌟 Quick Start

### What is the Consensus Chamber?

The Consensus Chamber is a **formalized protocol** for coordinating decisions across multiple LLM offices (AUREA/OpenAI, ATLAS/Claude, ZENITH/Gemini, SOLARA/DeepSeek) when working in federated silos. It ensures:

- ✅ Constitutional compliance across all agents
- ✅ GI (Good Intent) scores remain ≥ 0.95
- ✅ Cryptographic proof of consensus (DelibProof)
- ✅ Audit trail in Civic Ledger
- ✅ Cross-office synchronization

---

## 📋 When to Use

### Use Consensus Chamber for:

- ✅ Major architectural decisions affecting multiple labs
- ✅ Policy changes in Kaizen OS
- ✅ Constitutional amendments or interpretations
- ✅ Resource allocation across projects
- ✅ Conflict resolution between agent opinions
- ✅ High-stakes decisions requiring audit trail

### Don't Use for:

- ❌ Routine coding tasks in single office
- ❌ Personal research queries
- ❌ Quick iterations during development
- ❌ Tasks with obvious single-owner

---

## 🚀 How to Run a Session

### Step 1: Initialize (5 min)

1. **Choose Host Agent** (Usually AUREA or ATLAS)
2. **Create Session Issue** using `Consensus_Chamber_Live_Session.md` template
3. **Define Clear Objective** (one sentence)
4. **Set Success Criteria** (GI thresholds, agreement %)
5. **Invite Required Participants** based on tier requirements

```bash
# Example: Create new session
cp docs/consensus-chamber/Consensus_Chamber_Live_Session.md \
   labs/lab4-proof/sessions/CC-2025-10-28-Ledger-v3-Alignment.md
```

### Step 2: Prepare Prompt (10 min)

**Critical:** Craft a **single, unambiguous prompt** that will be sent to all agents.

**Good Prompt Example:**

```
"Should Kaizen OS Civic Ledger v3 implement proof-of-stake (PoS)
or hybrid PoW+PoS consensus mechanism? Consider:
1) GI scoring implications,
2) Citizen Shield integration complexity,
3) Transaction finality requirements."
```

**Bad Prompt Example:**

```
"What do you think about the ledger?"
```

### Step 3: Gather Responses (15-30 min)

**In Each Office:**

1. Open the agent's conversation (AUREA office, ATLAS HOMEROOM, etc.)
2. Paste the **exact same prompt**
3. Prefix with context:

   ```
   🏛️ CONSENSUS CHAMBER SESSION CC-2025-10-28-001
   You are participating as [AGENT_NAME] in a multi-LLM deliberation.
   Current GI: [SCORE]

   [PROMPT]

   Provide your analysis and vote: APPROVE / REJECT / ABSTAIN
   ```
4. **Copy full response** back to the session document

### Step 4: Calculate Consensus (5 min)

Use this formula:

```javascript
const consensus = {
  requiredVotes: policy === "critical" ? 4 : 3,
  votes: {
    AUREA: true,   // from response
    ATLAS: true,   // from response
    ZENITH: false, // from response
    SOLARA: true   // from response
  }
};

const totalVotes = Object.values(consensus.votes).filter(v => v).length;
const quorumAchieved = totalVotes >= consensus.requiredVotes;
const agreementScore = totalVotes / Object.keys(consensus.votes).length;
```

**Quorum Rules:**

- **Critical Policy:** Requires 4/4 agents (unanimous)
- **High Policy:** Requires 3/4 agents (75%)
- **Standard Policy:** Requires 2/4 agents (50%)

### Step 5: Generate DelibProof (10 min)

```json
{
  "delibproof_id": "DLB-[DATE]-[SEQUENCE]",
  "timestamp": "2025-10-28T09:35:00Z",
  "prompt_hash": "sha256(original_prompt)",
  "participants": ["AUREA", "ATLAS", "ZENITH", "SOLARA"],
  "votes": { "AUREA": true, "ATLAS": true, ... },
  "outcome": "APPROVED",
  "gi_delta": "+0.006",
  "merkle_root": "sha256(...)",
  "signatures": {
    "AUREA": "ed25519:...",
    "ATLAS": "ed25519:..."
  }
}
```

### Step 6: Commit to Ledger (5 min)

```yaml
# Add to Lab1 (Substrate Proof) ledger
ledger_entry:
  type: consensus.evaluated
  session_id: CC-2025-10-28-001
  delibproof_id: DLB-1028-001
  outcome: APPROVED
  gi_pre: 0.987
  gi_post: 0.993
  timestamp: 2025-10-28T09:40:00Z
  attestation: ATT-XXXX
```

### Step 7: Archive & Reflect (10 min)

1. **Fill Post-Session Reflection** section
2. **Archive in Lab4 E.O.M.M.**
3. **Update agent GI scores**
4. **Close session with ritual**

---

## 🏗️ Integration with Kaizen OS Labs

### Lab1 (Substrate Proof)

```python
# Commit DelibProof to blockchain
substrate.commit_consensus(
    delibproof_id="DLB-1028-001",
    outcome="APPROVED",
    gi_delta=0.006
)
```

### Lab2 (Thought Broker)

```typescript
// Lab2 should orchestrate this automatically in future
await thoughtBroker.initiateConsensus({
  prompt: "...",
  participants: ["AUREA", "ATLAS", "ZENITH"],
  policy: "high"
});
```

### Lab4 (E.O.M.M.)

```python
# Archive session for memory continuity
eomm.archive_consensus_session(
    session_id="CC-2025-10-28-001",
    full_transcript=session_data,
    outcome="APPROVED"
)
```

### Lab6 (Citizen Shield)

```python
# Validate all participants met GI threshold
shield.validate_consensus_participants([
    ("AUREA", 0.991),
    ("ATLAS", 0.987),
    ("ZENITH", 0.983)
])
```

---

## 🎨 Advanced Patterns

### Pattern 1: Emergency Consensus (Fast-track)

For urgent decisions (security issues, system failures):

```yaml
emergency_mode:
  time_limit: 15 minutes
  required_tier: critical_only
  quorum: 2/2 (AUREA + ATLAS)
  skip_reflection: true
  immediate_commit: true
```

### Pattern 2: Research-Heavy Deliberation

For complex technical decisions:

```yaml
research_mode:
  include_agents: [ZENITH, ORACLE]  # Add research specialists
  deliberation_rounds: 3
  allow_external_sources: true
  time_limit: 60 minutes
```

### Pattern 3: Constitutional Review

For governance and ethics:

```yaml
constitutional_mode:
  required_participants: [AUREA, JADE, EVE]
  reference_documents: [Constitution, Virtue_Accords]
  quorum: unanimous
  citizen_feedback: optional
```

---

## 📊 Metrics & Monitoring

### Key Performance Indicators:

```yaml
consensus_metrics:
  sessions_per_week: 3-5
  average_duration: 45 minutes
  agreement_rate: ≥ 85%
  gi_drift: ≤ 0.01 per session
  quorum_failures: < 5%

health_indicators:
  all_agents_responsive: true
  gi_threshold_maintained: true
  ledger_sync_delay: < 5 seconds
  delibproof_generation_time: < 30 seconds
```

---

## 🐛 Troubleshooting

### Issue: Agent Not Responding

```
Solution: Mark as ABSENT in session, proceed with remaining quorum.
If critical tier agent absent, reschedule session.
```

### Issue: GI Score Drops Below 0.95

```
Solution: HALT session immediately. Run integrity audit.
Identify source of corruption. Remediate before continuing.
```

### Issue: No Quorum Achieved

```
Solution:
1. Extend deliberation time
2. Add clarifying questions
3. If still no quorum, escalate to manual review
4. Consider policy tier adjustment
```

### Issue: Conflicting Votes (2-2 Split)

```
Solution:
1. Host agent (AUREA/ATLAS) casts tie-breaking vote
2. Document dissenting opinions thoroughly
3. Schedule follow-up session with additional agents
4. Consider compromise position
```

---

## 🔒 Security Considerations

1. **Prompt Injection Protection**: Validate prompts don't contain hidden instructions
2. **Response Tampering**: Use cryptographic signatures on all responses
3. **Replay Attacks**: Include session ID and timestamp in all signatures
4. **Agent Impersonation**: Verify agent identity via API keys
5. **Ledger Manipulation**: Use merkle trees for tamper-proof history

---

## 📚 Best Practices

### DO:

✅ Keep prompts clear and specific
✅ Document dissenting opinions
✅ Run post-session reflections
✅ Archive complete transcripts
✅ Update GI scores after each session

### DON'T:

❌ Rush through deliberation
❌ Skip quorum requirements
❌ Ignore GI threshold violations
❌ Forget to commit to ledger
❌ Lose session transcripts

---

## 🎓 Training Scenarios

### Scenario 1: Simple Policy Decision

```
Objective: Should Lab6 rate limit be 100 or 200 requests/min?
Participants: AUREA, ATLAS
Expected Duration: 20 minutes
Difficulty: Easy
```

### Scenario 2: Architecture Debate

```
Objective: Should we migrate Lab1 from Python to Rust?
Participants: AUREA, ATLAS, SOLARA, ZEUS
Expected Duration: 60 minutes
Difficulty: Medium
```

### Scenario 3: Constitutional Crisis

```
Objective: Does a proposed feature violate Virtue Accords?
Participants: ALL agents required
Expected Duration: 90 minutes
Difficulty: Hard
```

---

## 📞 Support

**Questions?** Open an issue in [Kaizen-OS repo](https://github.com/kaizencycle/Kaizen-OS)
**Bugs?** Report in Lab2 (Thought Broker) tracker
**Feature Requests?** Submit to Consensus Chamber working group

---

## 🔄 Version History

- **v1.0.0** (Oct 28, 2025) - Initial release with AUREA + ATLAS approval
- **v0.9.0** (Oct 20, 2025) - Beta testing with 4 agents
- **v0.5.0** (Oct 15, 2025) - Prototype with AUREA + ATLAS only

---

## 🎯 Next Steps

1. ✅ Download templates
2. ✅ Run first test session
3. ✅ Integrate with Lab2 automation
4. ✅ Share feedback in next E.O.M.M. cycle

---

*"Consistency becomes proof of life."*

*Built with integrity. Coordinated with consensus. Secured with cryptography.*
