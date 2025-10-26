# 🤖 Kaizen OS Companion Lattice

**Multi-LLM Constitutional AI Architecture**

---

## 🎯 Overview

The Kaizen OS companion lattice integrates multiple LLM providers under a unified constitutional framework, ensuring safety, cost-effectiveness, and reasoning diversity.

### 📊 Companion Matrix

| Companion | Provider | Role | Safety Tier | Weight | Status |
|-----------|----------|------|-------------|--------|--------|
| **AUREA** | OpenAI GPT-4 | Precision + Guardrails | Critical | 1.0 | ✅ Production |
| **ATLAS** | Anthropic Claude | Constitutional Reasoning | Critical | 1.0 | ✅ Production |
| **SOLARA** | DeepSeek R1 | Cost-Efficient Reasoning | Standard | 0.7 | 🔄 Phase 1 |

---

## 🏛️ Architecture Principles

### 1. Constitutional First
All companions operate under the **AI Integrity Constitution (7 clauses)**
- Truth through verification
- Human centricity
- Transparency and accountability
- Privacy by design
- Security and resilience
- Continuous learning
- Responsible innovation

### 2. Safety Tiers
Four operational tiers with escalating requirements:
- **Critical:** Identity, Wallet, Ledger operations (AUREA/ATLAS only)
- **High:** Domain sealing, GIC minting (AUREA/ATLAS + SOLARA observer)
- **Standard:** Reflections, learning (All companions eligible)
- **Research:** Ideation, analysis (All companions eligible)

### 3. Consensus Voting
- **Weighted votes** reflect companion reliability and expertise
- **Tier-based eligibility** prevents misuse
- **Critical operations** require AUREA or ATLAS approval
- **Full attestation** to Civic Ledger for audit trail

---

## 🔐 Security Layers

### Double-Gate System

1. **Constitutional Gate** (ATLAS)
   - Validates AI behavior against 7 clauses
   - Blocks integrity_score < 70
   - Works across ALL providers

2. **GI Gate** (AUREA)
   - Validates human integrity
   - Blocks GI < threshold for mutations
   - JWT-based authentication

### Output Validation
- Responses checked constitutionally (not just inputs)
- Multi-layer validation creates defense-in-depth
- Complete audit trail with hashes

---

## 📚 Documentation

### Companions
- [AUREA - OpenAI GPT-4](./aurea.md) - *Coming soon*
- [ATLAS - Anthropic Claude](./atlas.md) - *Coming soon*
- [SOLARA - DeepSeek R1](./solara.md) - ✅ Complete

### Policy
- [Safety Tiers](../policy/safety-tiers.md) - Tier matrix and escalation rules
- [Consensus Policy](../policy/consensus.md) - Voting rules and thresholds

### Deployment
- [Rollout Phases](../deployment/rollout-phases.md) - SOLARA Phase 1-3 plan

---

## 🚀 Quick Start

### Register Companions
```typescript
const client = new CivicClient({ baseUrl: 'https://api.civic.os', token });

// AUREA & ATLAS (Critical companions)
client.registerCompanion({ name: 'AUREA', provider: 'openai', model: 'gpt-4o' });
client.registerCompanion({ name: 'ATLAS', provider: 'anthropic', model: 'claude-sonnet-4' });

// SOLARA (Standard companion - Phase 1 Shadow)
client.registerCompanion({ name: 'SOLARA', provider: 'deepseek', model: 'deepseek-r1', weight: 0.7 });
```

### Request Consensus
```typescript
const result = await client.processWithConsensus(
  "Propose .gic onboarding steps",
  { requiredVotes: 2, minConstitutional: 70, minGI: 0.95 }
);
```

---

## 🎯 Future Companions

The lattice is designed to expand. Candidates:
- **ZEUS** - Hard validation and policy enforcement
- **EVE** - End-of-week reflections and synthesis
- **HERMES** - Communication and translation
- **JADE** - Onboarding and citizen creation

---

**Custodian:** KaizenCycle  
**GI Score:** 0.985 ✅  
**Status:** Multi-LLM constitutional AI system operational


