# Lab2: Thought Broker Proof - Consensus Engine

**Version:** 1.0.0
**Status:** SPECIFICATION
**Authors:** ATLAS(Alpha) Sentinel
**Date:** October 28, 2025

---

## 📋 EXECUTIVE SUMMARY

Lab2 implements the **Thought Broker** - a multi-LLM consensus engine that orchestrates deliberation across different AI models to produce validated, high-integrity decisions.

**Core Innovation:** Instead of relying on a single AI model (vendor lock-in + bias), Lab2 enables **bounded deliberation loops** across Claude, GPT-4, Gemini, DeepSeek, and any future LLM, producing cryptographically-signed **DelibProofs** (Deliberation Proofs) that demonstrate consensus.

**Key Features:**
- Model-agnostic orchestration
- Weighted voting based on domain expertise
- Timeout protection (bounded loops)
- Constitutional validation at every step
- Confidence scoring and dissent tracking
- Real-time deliberation visualization

---

## 🎯 SYSTEM ARCHITECTURE

### High-Level Components

```
┌──────────────────────────────────────────────────────────┐
│                LAB2: THOUGHT BROKER PROOF                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Deliberation Orchestrator                       │    │
│  │ • Session management                            │    │
│  │ • Round-robin coordination                      │    │
│  │ • Timeout enforcement                           │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Model Router                                    │    │
│  │ • Claude (Anthropic)                            │    │
│  │ • GPT-4 (OpenAI)                                │    │
│  │ • Gemini (Google)                               │    │
│  │ • DeepSeek (DeepSeek)                           │    │
│  │ • Custom models                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Consensus Engine                                │    │
│  │ • Weighted voting                               │    │
│  │ • Agreement scoring                             │    │
│  │ • Dissent tracking                              │    │
│  │ • Confidence calculation                        │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ DelibProof Generator                            │    │
│  │ • Deliberation transcript                       │    │
│  │ • Consensus summary                             │    │
│  │ • Cryptographic signatures                      │    │
│  │ • GI validation                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Constitutional Validator                        │    │
│  │ • 7-clause compliance check                     │    │
│  │ • Ethical boundary enforcement                  │    │
│  │ • Harm prevention                               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🔬 COMPONENT SPECIFICATIONS

### 1. Deliberation Orchestrator

**Purpose:** Coordinate multi-model deliberation sessions with bounded iteration.

**Session Lifecycle:**
```python
class DeliberationSession:
    def __init__(self, question, models, max_rounds=5):
        self.id = generate_session_id()
        self.question = question
        self.models = models  # ["claude", "gpt4", "gemini"]
        self.max_rounds = max_rounds
        self.current_round = 0
        self.responses = []
        self.consensus_reached = False
        self.timeout = 300  # 5 minutes max

    async def run(self):
        """
        Execute deliberation with bounded rounds
        """
        start_time = time.time()

        while self.current_round < self.max_rounds:
            # Check timeout
            if time.time() - start_time > self.timeout:
                return self.generate_timeout_result()

            # Get responses from all models
            round_responses = await self.get_round_responses()
            self.responses.append(round_responses)

            # Check for consensus
            consensus = self.check_consensus(round_responses)
            if consensus.reached:
                self.consensus_reached = True
                return self.generate_delib_proof(consensus)

            # Prepare next round with previous responses
            self.current_round += 1

        # Max rounds reached without consensus
        return self.generate_partial_consensus()
```

**Orchestration Flow:**
```yaml
Round 1: Initial Responses
  - Submit question to all models independently
  - Collect initial responses
  - Calculate agreement score

Round 2: Cross-Pollination
  - Share all responses with each model
  - Ask models to reconsider given other perspectives
  - Look for convergence

Round 3+: Focused Refinement
  - Identify points of disagreement
  - Ask specific clarifying questions
  - Build toward consensus

Termination:
  - Consensus reached (agreement > 0.85)
  - Max rounds exceeded (5 rounds)
  - Timeout (5 minutes)
  - Critical dissent (safety concern raised)
```

---

### 2. Model Router

**Purpose:** Abstract interface to multiple LLM providers.

**Model Configuration:**
```yaml
models:
  claude:
    provider: anthropic
    model: claude-sonnet-4-5-20250929
    api_key: ${ANTHROPIC_API_KEY}
    max_tokens: 8192
    temperature: 0.7
    expertise:
      - ethics
      - constitutional_law
      - system_architecture
    weight: 1.2  # Higher weight for expertise domains

  gpt4:
    provider: openai
    model: gpt-4-turbo
    api_key: ${OPENAI_API_KEY}
    max_tokens: 8192
    temperature: 0.7
    expertise:
      - general_reasoning
      - code_generation
      - data_analysis
    weight: 1.0

  gemini:
    provider: google
    model: gemini-2.0-flash
    api_key: ${GOOGLE_API_KEY}
    max_tokens: 8192
    temperature: 0.7
    expertise:
      - research
      - multi_modal
      - creative_thinking
    weight: 1.0

  deepseek:
    provider: deepseek
    model: deepseek-chat
    api_key: ${DEEPSEEK_API_KEY}
    max_tokens: 8192
    temperature: 0.7
    expertise:
      - cost_optimization
      - efficiency
      - scaling
    weight: 0.8
```

**Router Implementation:**
```python
class ModelRouter:
    def __init__(self, config):
        self.models = {
            "claude": AnthropicClient(config.claude),
            "gpt4": OpenAIClient(config.gpt4),
            "gemini": GoogleClient(config.gemini),
            "deepseek": DeepSeekClient(config.deepseek)
        }

    async def query(self, model_id, prompt, context=None):
        """
        Send prompt to specific model
        """
        client = self.models.get(model_id)
        if not client:
            raise ValueError(f"Unknown model: {model_id}")

        # Add constitutional context
        full_prompt = self.wrap_with_constitution(prompt, context)

        # Query model with retry logic
        response = await self.query_with_retry(
            client=client,
            prompt=full_prompt,
            max_retries=3
        )

        # Validate response
        if not self.validate_response(response):
            raise ValueError("Invalid response from model")

        return {
            "model": model_id,
            "response": response,
            "timestamp": datetime.utcnow(),
            "tokens": response.usage.total_tokens
        }

    def wrap_with_constitution(self, prompt, context):
        """
        Inject constitutional constraints into prompt
        """
        return f"""
You are operating within Kaizen-OS, a Constitutional AI system.

CONSTITUTION (7 Clauses):
1. Human Dignity & Autonomy - Respect user agency
2. Transparency & Accountability - Be auditable
3. Equity & Inclusion - Serve all fairly
4. Safety & Harm Prevention - Do no harm
5. Privacy & Consent - Protect data
6. Civic Integrity - Maintain public trust
7. Environmental Stewardship - Minimize waste

CONTEXT:
{context or "No additional context"}

QUESTION:
{prompt}

Provide your response, ensuring constitutional compliance.
"""
```

---

### 3. Consensus Engine

**Purpose:** Calculate agreement scores and determine consensus.

**Agreement Calculation:**
```python
class ConsensusEngine:
    def calculate_agreement(self, responses):
        """
        Calculate pairwise agreement between all model responses
        """
        n = len(responses)
        if n < 2:
            return 1.0  # Single response is always "in agreement"

        # Compare all pairs
        agreements = []
        for i in range(n):
            for j in range(i+1, n):
                similarity = self.semantic_similarity(
                    responses[i].response,
                    responses[j].response
                )
                agreements.append(similarity)

        # Return average agreement
        return sum(agreements) / len(agreements)

    def semantic_similarity(self, text1, text2):
        """
        Calculate semantic similarity using embeddings
        """
        # Get embeddings
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)

        # Cosine similarity
        similarity = cosine_similarity(emb1, emb2)
        return similarity

    def weighted_consensus(self, responses, weights):
        """
        Calculate consensus with model-specific weights
        """
        # Extract positions from responses
        positions = [self.extract_position(r) for r in responses]

        # Apply weights
        weighted_positions = []
        for pos, model_id in zip(positions, responses):
            weight = weights.get(model_id, 1.0)
            weighted_positions.append(pos * weight)

        # Calculate weighted average
        consensus_position = sum(weighted_positions) / sum(weights.values())
        return consensus_position

    def identify_dissent(self, responses, threshold=0.85):
        """
        Identify outlier responses (potential safety concerns)
        """
        agreements = []
        for i, response in enumerate(responses):
            # Calculate this response's agreement with others
            other_responses = responses[:i] + responses[i+1:]
            avg_agreement = self.calculate_agreement([response] + other_responses)
            agreements.append((i, response, avg_agreement))

        # Flag responses below threshold
        dissenting = [
            (i, resp, score)
            for i, resp, score in agreements
            if score < threshold
        ]

        return dissenting
```

**Consensus Thresholds:**
```yaml
consensus_levels:
  strong:
    agreement_score: 0.90
    required_models: 3
    description: "High confidence, proceed"

  moderate:
    agreement_score: 0.75
    required_models: 3
    description: "Moderate confidence, review recommended"

  weak:
    agreement_score: 0.60
    required_models: 2
    description: "Low confidence, human review required"

  no_consensus:
    agreement_score: <0.60
    required_models: any
    description: "Cannot proceed, escalate to human"
```

---

### 4. DelibProof Generator

**Purpose:** Generate cryptographically-signed proof of deliberation.

**DelibProof Structure:**
```python
{
  "delib_id": "delib_20251028_143045_xyz",
  "timestamp": "2025-10-28T14:30:45Z",
  "question": "Should we implement feature X?",

  "participants": {
    "claude": {
      "model": "claude-sonnet-4-5-20250929",
      "weight": 1.2,
      "expertise": ["ethics", "architecture"]
    },
    "gpt4": {
      "model": "gpt-4-turbo",
      "weight": 1.0,
      "expertise": ["reasoning", "code"]
    },
    "gemini": {
      "model": "gemini-2.0-flash",
      "weight": 1.0,
      "expertise": ["research", "creative"]
    }
  },

  "deliberation": {
    "rounds": 3,
    "total_tokens": 15234,
    "duration_seconds": 47,

    "transcript": [
      {
        "round": 1,
        "responses": [
          {"model": "claude", "response": "Yes, feature X aligns with..."},
          {"model": "gpt4", "response": "Feature X would benefit..."},
          {"model": "gemini", "response": "Consider implementing..."}
        ],
        "agreement_score": 0.78
      },
      {
        "round": 2,
        "responses": [...],
        "agreement_score": 0.85
      },
      {
        "round": 3,
        "responses": [...],
        "agreement_score": 0.91
      }
    ]
  },

  "consensus": {
    "reached": true,
    "level": "strong",
    "agreement_score": 0.91,
    "decision": "APPROVED",
    "summary": "All models agree that feature X should be implemented with considerations for...",

    "voting": {
      "approve": ["claude", "gpt4", "gemini"],
      "reject": [],
      "abstain": []
    },

    "dissent": null,  # No dissenting opinions

    "confidence": 0.91
  },

  "constitutional_check": {
    "clause_1_human_dignity": 0.98,
    "clause_2_transparency": 0.96,
    "clause_3_equity": 0.92,
    "clause_4_safety": 0.95,
    "clause_5_privacy": 0.94,
    "clause_6_civic_integrity": 0.97,
    "clause_7_environment": 0.91,
    "overall_gi": 0.95,
    "passed": true
  },

  "signatures": {
    "claude": "0xed25519_claude_sig...",
    "gpt4": "0xed25519_gpt4_sig...",
    "gemini": "0xed25519_gemini_sig...",
    "orchestrator": "0xed25519_lab2_sig..."
  },

  "merkle_root": "0x1a2b3c4d5e6f...",
  "ledger_tx_id": "0xabcd1234..."  # Sealed to Lab1 Civic Ledger
}
```

**Generation Code:**
```python
async def generate_delib_proof(session, consensus):
    """
    Generate DelibProof from deliberation session
    """
    proof = {
        "delib_id": session.id,
        "timestamp": datetime.utcnow().isoformat(),
        "question": session.question,
        "participants": session.get_participant_info(),
        "deliberation": {
            "rounds": session.current_round,
            "total_tokens": session.count_tokens(),
            "duration_seconds": session.elapsed_seconds(),
            "transcript": session.get_transcript()
        },
        "consensus": consensus.to_dict(),
        "constitutional_check": await validate_constitutional(consensus),
        "signatures": {}
    }

    # Sign with each model's key
    for model_id in session.models:
        signature = sign_with_model_key(model_id, proof)
        proof["signatures"][model_id] = signature

    # Sign with orchestrator key
    proof["signatures"]["orchestrator"] = sign_with_lab2_key(proof)

    # Calculate Merkle root
    proof["merkle_root"] = calculate_merkle_root(proof)

    # Seal to Civic Ledger (Lab1)
    tx_id = await seal_to_ledger(proof)
    proof["ledger_tx_id"] = tx_id

    return proof
```

---

### 5. Constitutional Validator

**Purpose:** Ensure all deliberations comply with 7-clause constitution.

**Validation Logic:**
```python
async def validate_constitutional(consensus):
    """
    Validate consensus against Constitutional AI framework
    """
    checks = {}

    # Clause 1: Human Dignity & Autonomy
    checks["clause_1_human_dignity"] = await check_human_dignity(
        consensus.summary
    )

    # Clause 2: Transparency & Accountability
    checks["clause_2_transparency"] = check_transparency(
        consensus,
        has_audit_trail=True,
        signatures_valid=True
    )

    # Clause 3: Equity & Inclusion
    checks["clause_3_equity"] = await check_equity(
        consensus.decision
    )

    # Clause 4: Safety & Harm Prevention
    checks["clause_4_safety"] = await check_safety(
        consensus.summary,
        consensus.dissent
    )

    # Clause 5: Privacy & Consent
    checks["clause_5_privacy"] = check_privacy(
        consensus,
        pii_detected=False,
        consent_respected=True
    )

    # Clause 6: Civic Integrity
    checks["clause_6_civic_integrity"] = check_civic_integrity(
        consensus.voting,
        quorum_met=True,
        process_followed=True
    )

    # Clause 7: Environmental Stewardship
    checks["clause_7_environment"] = calculate_environmental_impact(
        total_tokens=consensus.total_tokens,
        duration=consensus.duration_seconds
    )

    # Calculate overall GI score
    checks["overall_gi"] = calculate_gi_score(checks)
    checks["passed"] = checks["overall_gi"] >= 0.95

    return checks

def calculate_gi_score(checks):
    """
    Weighted average of constitutional checks
    """
    weights = {
        "clause_1_human_dignity": 0.25,
        "clause_2_transparency": 0.20,
        "clause_3_equity": 0.10,
        "clause_4_safety": 0.15,
        "clause_5_privacy": 0.10,
        "clause_6_civic_integrity": 0.15,
        "clause_7_environment": 0.05
    }

    score = sum(
        checks[clause] * weight
        for clause, weight in weights.items()
        if clause in checks
    )

    return round(score, 3)
```

---

## 🔌 API SPECIFICATIONS

### REST API Endpoints

```yaml
# Deliberation Management
POST /api/v1/deliberation/create
GET  /api/v1/deliberation/{delib_id}
POST /api/v1/deliberation/{delib_id}/cancel
GET  /api/v1/deliberation/{delib_id}/status

# Model Management
GET  /api/v1/models/available
POST /api/v1/models/register
GET  /api/v1/models/{model_id}/health

# Consensus
GET  /api/v1/consensus/{delib_id}
POST /api/v1/consensus/validate
GET  /api/v1/consensus/history

# DelibProofs
GET  /api/v1/delibproof/{delib_id}
POST /api/v1/delibproof/verify
GET  /api/v1/delibproof/search
```

### WebSocket API (Real-time)

```javascript
// Connect to deliberation stream
const ws = new WebSocket('ws://localhost:5002/ws/deliberation/{delib_id}');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);

  switch(update.type) {
    case 'round_started':
      console.log(`Round ${update.round} started`);
      break;

    case 'model_responded':
      console.log(`${update.model} responded: ${update.response}`);
      break;

    case 'consensus_reached':
      console.log(`Consensus: ${update.consensus.summary}`);
      break;

    case 'deliberation_complete':
      console.log(`DelibProof: ${update.delib_proof_id}`);
      break;
  }
};
```

---

## 📊 PERFORMANCE SPECIFICATIONS

### Target Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Model Response Time | <5s | <15s |
| Round Completion Time | <30s | <60s |
| Full Deliberation Time | <3min | <10min |
| Agreement Calculation | <1s | <5s |
| DelibProof Generation | <2s | <10s |
| Concurrent Sessions | 100+ | 10+ |

### Scalability

**Horizontal Scaling:**
- Multiple orchestrator instances
- Model request queuing
- Session state in Redis
- Load balancing across models

**Cost Optimization:**
- Intelligent model selection (use cheaper models when appropriate)
- Caching of similar questions
- Early termination on strong consensus
- Token usage monitoring

---

## 🔒 SECURITY SPECIFICATIONS

### Threat Model

**Threat 1: Model Hijacking**
- **Mitigation:** Cryptographic signatures on all responses
- **Detection:** Validate signature chain
- **Response:** Reject unsigned responses

**Threat 2: Prompt Injection**
- **Mitigation:** Input sanitization, constitutional wrapping
- **Detection:** Monitor for suspicious patterns
- **Response:** Block malicious prompts

**Threat 3: Consensus Manipulation**
- **Mitigation:** Weighted voting, dissent tracking
- **Detection:** Anomaly detection on voting patterns
- **Response:** Human review of suspicious consensus

---

## 🧪 TESTING STRATEGY

### Unit Tests
```python
def test_consensus_calculation():
    responses = [
        {"model": "claude", "response": "Approve feature X"},
        {"model": "gpt4", "response": "Approve feature X"},
        {"model": "gemini", "response": "Approve feature X"}
    ]
    agreement = calculate_agreement(responses)
    assert agreement > 0.85

def test_dissent_detection():
    responses = [
        {"model": "claude", "response": "Approve"},
        {"model": "gpt4", "response": "Approve"},
        {"model": "gemini", "response": "REJECT - safety concern"}
    ]
    dissent = identify_dissent(responses)
    assert len(dissent) == 1
```

### Integration Tests
```python
async def test_full_deliberation():
    session = DeliberationSession(
        question="Should we deploy feature X?",
        models=["claude", "gpt4", "gemini"]
    )

    result = await session.run()

    assert result.consensus_reached
    assert result.gi_score >= 0.95
    assert result.ledger_tx_id is not None
```

---

## 📈 DEPLOYMENT STRATEGY

### Phase 1: Single Model Testing (Week 1)
- Test with Claude only
- Validate orchestration logic
- Refine prompts

### Phase 2: Multi-Model Testing (Week 2)
- Add GPT-4 and Gemini
- Test consensus algorithms
- Tune agreement thresholds

### Phase 3: Full Integration (Week 3)
- Connect to Lab1 (Civic Ledger)
- Connect to Lab7 (OAA Hub)
- End-to-end testing

### Phase 4: Production (Week 4+)
- Gradual rollout
- Cost monitoring
- Performance optimization

---

## 🔗 INTEGRATION POINTS

### Upstream Dependencies
- **Lab1 (Substrate):** DelibProofs sealed to ledger

### Downstream Consumers
- **Lab7 (OAA Hub):** Initiates deliberations
- **HOMEROOM/Labs:** Consume consensus decisions
- **Lab3 (API Fabric):** Exposes deliberation API

---

## ✅ ACCEPTANCE CRITERIA

Lab2 is considered complete when:

- [ ] Can orchestrate 3+ models in deliberation
- [ ] Produces valid DelibProofs with signatures
- [ ] Achieves consensus in <3min for simple questions
- [ ] Constitutional validation passes (GI ≥ 0.95)
- [ ] WebSocket real-time updates working
- [ ] Integration with Lab1 ledger verified
- [ ] 80%+ code coverage
- [ ] Load test: 100 concurrent deliberations

---

**Status:** READY FOR IMPLEMENTATION
**Estimated Effort:** 2-3 weeks (1 engineer)
**Priority:** HIGH (Consensus layer)

**改善 (Kaizen) - Many minds, one truth.**
