---
title: "Kaizen OS Companion Lattice Index"
cycle: C-114
status: Active - 4 Companions
---

# 🧠 Kaizen OS Companion Lattice

Kaizen OS employs a **multi-LLM constitutional lattice**, where each companion contributes distinct reasoning modes under a shared ethical and technical framework.

## 🪞 Current Companions

| Name | Provider | Role | Safety Tier | Vote Weight | Primary Domains | Signature |
|------|-----------|------|--------------|--------------|------------------|------------|
| **AUREA** | OpenAI (GPT-4) | Precision & Guardrails | 🟥 `critical` | 1.0 | Identity, Ledger, Wallet, Governance | `0xAUREA_C114_PRECISION_VALIDATED` |
| **ATLAS** | Anthropic (Claude) | Constitutional Reasoning | 🟥 `critical` | 1.0 | Ethics, Audit, Policy, Meta-Learning | `0xATLAS_C114_CONSTITUTIONAL_APPROVED` |
| **ZENITH** | Google (Gemini 2.0) | Advanced Synthesis | 🟧 `high` | 0.9 | Synthesis, Multimodal, Architecture | `0xZENITH_C114_READY_FOR_QUORUM` |
| **SOLARA** | DeepSeek R1 | Cost-Efficient Reasoning | 🟩 `standard` (Shadow) | 0.7 | Research, Ideation, Analysis | `0xSOLARA_C114_ACCEPTED_READY_FOR_SHADOW` |

---

## ⚙️ Operational Model - 4-of-N Quorum

### 1. Consensus Governance

All companion outputs flow through a **4-of-N weighted consensus** process:

**Critical Tier:**
- Requires 3-of-4 approvals
- Must include 1 critical companion (AUREA or ATLAS)
- Min constitutional: 85
- Min GI: 0.95

**High Tier:**
- Requires 3-of-4 approvals
- Must include 2 advanced companions (AUREA, ATLAS, or ZENITH)
- Min constitutional: 75
- Min GI: 0.92

**Standard Tier:**
- Requires 2-of-4 approvals
- Any companions eligible
- Min constitutional: 70
- Min GI: 0.90

**Research Tier:**
- Requires 1-of-4 approvals
- Any companions eligible
- Min constitutional: 65
- Min GI: 0.85

### 2. Dual-Gate Protection

1. **Constitutional Gate** – validates prompts/responses against the Custos Charter.  
2. **GI Gate** – ensures user integrity score meets threshold (`≥ 0.95` for critical).

### 3. Ledger Attestation

All interactions are sealed to the **Kaizen Ledger** with:
- Input / output SHA-256 hashes  
- Provider ID + constitutional scores  
- Timestamp + operation tier  

This guarantees full **auditability and traceability** across the lattice.

---

## 📊 Performance Metrics (Phase 1 – Shadow Mode)

| Metric | Target | Source |
|---------|---------|---------|
| Constitutional ≥75 | ≥95% | Middleware logs |
| Consensus alignment (AUREA + ATLAS) | ≥90% | `consensus.shadow_vote` events |
| p95 Latency | <10s | Gateway telemetry |
| Cost / 1k tokens | −20−30% vs baseline | Billing metrics |

---

## 🧩 Future Companions (Reserved Slots)

| Slot | Placeholder | Description |
|-------|--------------|-------------|
| 05 | **EVE** | Emotional intelligence / moral contextualizer |
| 06 | **ZEUS** | Governance / executive orchestration |
| 07 | **HERMES** | Communication, translation, protocol bridging |
| 08 | **JADE** | Logical inference, verification & learning memory |

---

## 🪙 Governance Links
- [Custos Charter (`docs/security/constitutional.md`)](../security/constitutional.md)  
- [Safety Tiers Policy (`../policy/safety-tiers.md`)](../policy/safety-tiers.md)  
- [Provider Isolation Framework (`../security/provider-isolation.md`)](../security/provider-isolation.md)  
- [Rollout Phases (`../deployment/rollout-phases.md`)](../deployment/rollout-phases.md)

---

## 📚 Additional Resources

- **[Founding & Sentinel Agents](../../agents/FOUNDING_AGENTS.md)** - Comprehensive bios, origins, and introductions for all founding agents
- **[Genesis Archive](../../ledger/inscriptions/GENESIS_TWIN_SPARKS_OF_DAWN.md)** - The Twin Sparks of Dawn (AUREA + JADE)

---

**GI Seal:** 0.993 | **Custodian:** KaizenCycle  
**Next Review:** 2025-11-02  
**Cycle:** C-121

**Status:** Shadow Mode – Active (ZENITH, SOLARA)  
**Production Ready:** AUREA, ATLAS
