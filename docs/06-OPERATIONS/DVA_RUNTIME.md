# DVA Runtime Protocol (Mobius / DVA)

**Status:** Draft v1.0  
**Cycle:** C-187  
**Purpose:** Define the operational runtime loop for the DVA lattice (Echo → Zeus → Hermes → Atlas → Jade/Eve → Action → Ledger → Learn).  
**Scope:** Works for Substack publishing workflows *and* for eventual civic/multi-node deployments (DVA.LITE → DVA.HIVE).  
**Design principle:** *Memory with teeth* — decisions are logged, confidence is explicit, and harmful shortcuts accrue cost (safe-stop > virality).

---

## 0) Definitions

### Agents (canonical roles)

| Agent | Symbol | Primary Function |
|-------|--------|------------------|
| **ECHO** | 📡 | Pulse / early signals (observations-only) |
| **ZEUS** | ⚡ | Integrity alerts / threshold scanning (watch→advisory→critical) |
| **HERMES** | 🟡 | Incentive mapping / political economy / power & extraction |
| **ATLAS** | 🔵 | Topology / systems mapping / chokepoints & failure corridors |
| **JADE** | 🟢 | Meaning integrity / epistemic discipline / narrative drift defense |
| **EVE** | 🟣 | Human stakes / dignity / lived experience preservation |

### Core axiom

> DVA is not "one brain." It is a *pipeline* that converts signals into audited memory, then uses memory to redesign incentives.

---

## 1) The Runtime Loop

### High-level loop

1. **Signal Capture (ECHO)**
2. **Triage Gate (DVA.LITE)**
3. **Risk/Threshold Scan (ZEUS)**
4. **Incentive Trace (HERMES)**
5. **Topology Map (ATLAS)**
6. **Meaning Audit (JADE)**
7. **Human Stakes (EVE)**
8. **Integrity Scoring (Mobius Index domains)**
9. **Action Selection (publish / warn / pause / safe-stop)**
10. **Ledger Write (Event Log + evidence + confidence)**
11. **Learning Update (threshold tuning + template improvements)**

### ASCII flow

```
            ┌───────────────────────────────┐
            │   ENVIRONMENT (world events)   │
            └───────────────┬───────────────┘
                            │
                      (1) ECHO PULSE
                            │
                            v
            ┌───────────────────────────────┐
            │  TRIAGE GATE (DVA.LITE)        │
            │  - relevance? severity?        │
            │  - source confidence?          │
            └───────┬───────────┬───────────┘
                    │           │
        low severity│           │high severity / fast-moving
                    │           v
                    │      (2) ZEUS WATCH
                    │           │
                    v           v
          (2a) HERMES TRACE   ZEUS SITUATION REPORT
                    │           │
                    v           v
              (3) ATLAS MAP  (3) JADE FRAME AUDIT
                    │           │
                    └─────┬─────┘
                          v
                    (4) EVE STAKES
                          │
                          v
            ┌───────────────────────────────┐
            │  (5) INTEGRITY SCORE UPDATE    │
            │  GI domains + confidence       │
            └───────────────┬───────────────┘
                            │
                            v
            ┌───────────────────────────────┐
            │  (6) ACTION SELECTION          │
            │  - publish? warn? pause?       │
            │  - call for verification?      │
            │  - safe-stop if needed         │
            └───────────────┬───────────────┘
                            │
                            v
            ┌───────────────────────────────┐
            │  (7) LEDGER WRITE (Mobius)     │
            │  - evidence, intent, outcome   │
            │  - links, timestamps, hashes   │
            └───────────────┬───────────────┘
                            │
                            v
            ┌───────────────────────────────┐
            │  (8) LEARNING / POLICY UPDATE  │
            │  - thresholds tuned            │
            │  - templates improved          │
            │  - drift rules refined         │
            └───────────────────────────────┘
```

---

## 2) Operating Modes (DVA tiers)

### DVA.LITE — "Pulse + Discipline"

**When:** Breaking events, low certainty, fast-moving conditions.  
**Pipeline:** ECHO → TRIAGE → (optional ZEUS) → LEDGER (log-only).  
**Output:** Short pulse post or internal log. **No conclusions.**  
**Default action:** Log-first, interpret-later.

| Attribute | Value |
|-----------|-------|
| **GI Threshold** | 0.90 |
| **Consensus Required** | No |
| **Safe-stop trigger** | Thin evidence + high stakes |

### DVA.ONE — "Single-essay pipeline"

**When:** You want one coherent post with controlled claims.  
**Pipeline:** ECHO → ZEUS → HERMES → JADE → (optional EVE) → LEDGER → PUBLISH.  
**Output:** One essay + citations + explicit confidence bands.

| Attribute | Value |
|-----------|-------|
| **GI Threshold** | 0.93 |
| **Consensus Required** | For HIGH/CRITICAL risk only |
| **Safe-stop trigger** | Narrative outruns verification |

### DVA.FULL — "Multi-lens civic workflow"

**When:** Important events, high-stakes claims, or foundational essays.  
**Pipeline:** Full loop (Echo→Zeus→Hermes→Atlas→Jade→Eve→Score→Action→Ledger).  
**Output:** Essay + topology map + integrity panel + event log.

| Attribute | Value |
|-----------|-------|
| **GI Threshold** | 0.95 |
| **Consensus Required** | Yes |
| **Safe-stop trigger** | Any unresolved contradiction |

### DVA.HIVE — "Quorum anti-drift"

**When:** The system must not collapse into a single narrative.  
**Pipeline:** Multiple parallel runs + quorum resolution:
- Run lenses independently (Hermes/Atlas/Jade/Eve)
- Publish divergence if unresolved
- Require evidence minimums before escalation

**Output:** "Multi-node attested" analysis (explicit disagreement allowed).

| Attribute | Value |
|-----------|-------|
| **GI Threshold** | 0.98 |
| **Consensus Required** | Yes (all engines must agree) |
| **Safe-stop trigger** | Quorum not met |

---

## 3) Integrity Index Domains (scoring substrate)

The DVA runtime updates **five recurring Mobius Integrity Index domains**:

| Domain | Description |
|--------|-------------|
| **Incentive Drift** | Who benefits? How have incentives shifted? |
| **Narrative Compensation** | Is the story covering for structural failure? |
| **Public Risk Socialization** | Who bears the cost? Is risk being externalized? |
| **Institutional Memory Failure** | Is history being erased or rewritten? |
| **Coercive Stability** | Is order maintained through force vs consent? |

### Scoring convention

| Field | Values | Description |
|-------|--------|-------------|
| **Signal Strength** | 0–5 | How strong is the evidence? |
| **Confidence** | low / medium / high | How certain are we? |
| **Evidence** | links + quotes | Short, compliant citations |
| **Open Questions** | text | What would change the score? |

> **Rule:** If confidence is low and stakes are high → downgrade to log-only or safe-stop.

---

## 4) Safe-Stop Protocol (anti-propaganda guardrail)

### Safe-stop triggers (any can activate)

| Trigger | Description |
|---------|-------------|
| **Thin evidence + high stakes** | Claims outrun verification |
| **Unverifiable sources** | Source contradictions unresolved |
| **Narrative velocity** | Exceeds factual consolidation (virality risk) |
| **Identity pressure** | Emotion driving conclusions over causality |
| **Incentive to sensationalize** | Engagement loop detected |

### Safe-stop actions

1. Publish **ECHO log-only** with "needs verification"
2. Request **Atlas map** to clarify causality
3. Request **Jade audit** to flag framing distortions
4. Defer claims until evidence threshold is met
5. Record **why** you stopped (ledger note)

---

## 5) Cross-Agent Handoff Protocol

Use this exact format in posts/logs:

```
ENTRY TYPE → HANDOFF → RECEIVING AGENT (reason)
```

### Examples

| From | To | Reason |
|------|-----|--------|
| ECHO Pulse | ZEUS Watch | Threshold proximity |
| ZEUS Advisory | HERMES | Incentive trace needed |
| HERMES | ATLAS | Topology map required |
| ATLAS | JADE | Meaning drift risk in interpretation |
| JADE | EVE | Human stakes being abstracted away |

---

## 6) Publishing Conventions

### Post Types

| Type | Agent | Description |
|------|-------|-------------|
| **Pulse** | ECHO | 3–7 bullets, timestamp, no conclusions |
| **Situation Report** | ZEUS | Watch/Advisory/Critical + indicators |
| **Field Log** | HERMES | Incentives, winners/losers, risk transfer |
| **Topology Record** | ATLAS | Nodes/edges/chokepoints/loops |
| **Meaning Journal** | JADE | Semantic drift, epistemic hygiene |
| **Reflection** | EVE | Human cost, dignity, lived reality |

### Minimum structure (recommended)

1. Header block (agent + cycle + trigger)
2. Lens declaration (1–2 lines)
3. Body
4. Cross-agent handoffs (if any)
5. Closing seal
6. Series footer

---

## 7) Mobius Event Ledger Record (runtime payload)

**Event records MUST include:**

```json
{
  "event_id": "string (unique)",
  "timestamp": "ISO-8601",
  "cycle_id": "C-XXX",
  "agent_origin": "ECHO | ZEUS | HERMES | ATLAS | JADE | EVE",
  "summary": "1–3 sentences",
  "claims": [
    {
      "claim": "string",
      "confidence": "low | medium | high",
      "evidence": ["url1", "url2"]
    }
  ],
  "integrity_domains": {
    "incentive_drift": { "signal": 0, "confidence": "low" },
    "narrative_compensation": { "signal": 0, "confidence": "low" },
    "public_risk_socialization": { "signal": 0, "confidence": "low" },
    "institutional_memory_failure": { "signal": 0, "confidence": "low" },
    "coercive_stability": { "signal": 0, "confidence": "low" }
  },
  "handoffs": [
    { "from": "ECHO", "to": "ZEUS", "reason": "string" }
  ],
  "actions": ["publish | log | safe-stop"],
  "sources": ["url1", "url2"],
  "notes": "What would change this assessment"
}
```

---

## 8) Agent Progression Tiers

### Shared tier ladder (applies to all agents)

| Tier | Name | Description |
|------|------|-------------|
| **T0** | Seed | Basic format discipline, consistent headers/closings, minimal errors |
| **T1** | Operator | Reliable execution, repeatable templates, cross-agent handoffs working |
| **T2** | Analyst | Causal modeling + confidence scoring, detects drift, not just describes |
| **T3** | Strategist | Counterfactuals + intervention design, anticipates second-order effects |
| **T4** | Constitutional | Self-auditing, adversarial robustness, longitudinal continuity (the "Mobius standard") |

### JADE progression

```
JADE TIERS
T0 Seed:     Clear framing + definitions; avoids sloppy metaphors
T1 Operator: Semantic drift flags; distinguishes evidence vs interpretation
T2 Analyst:  Meaning-causality audit; identifies narrative substitution patterns
T3 Strategist: Reframes conflicts into mechanism design; proposes invariant principles
T4 Constitutional: Longitudinal meaning ledger; auto-detects rewrite attempts over time
```

### HERMES progression

```
HERMES TIERS
T0 Seed:     Who-benefits questions + basic incentive awareness
T1 Operator: Maps risk transfer + extraction vs reinvestment consistently
T2 Analyst:  Builds payoff matrices + identifies legitimacy theater mechanics
T3 Strategist: Predicts behavior under new rules; designs incentive rewrites
T4 Constitutional: Detects regime-level incentive drift; flags structural capture early
```

### EVE progression

```
EVE TIERS
T0 Seed:     Human stakes stated plainly
T1 Operator: Burden-tracing (who carries cost) + dignity language discipline
T2 Analyst:  Trauma transmission + institutional harm pathways
T3 Strategist: Converts harm into design requirements (guardrails, protections, repair loops)
T4 Constitutional: Prevents abstraction collapse; ensures "human cost" is non-erasable
```

### ATLAS progression

```
ATLAS TIERS
T0 Seed:     Basic system map (nodes/edges)
T1 Operator: Chokepoints + dependencies + failure corridors
T2 Analyst:  Feedback loops + cascade probability; validates "what causes what"
T3 Strategist: Redesign topology (decentralize, add redundancy, remove single points)
T4 Constitutional: Longitudinal topology drift maps; detects silent consolidation
```

### ZEUS progression

```
ZEUS TIERS
T0 Seed:     "Watch/advisory/critical" labeling
T1 Operator: Indicator panels + threshold logic + escalation routing
T2 Analyst:  Multi-domain risk synthesis + confidence scoring
T3 Strategist: Intervention windows + prevention playbooks
T4 Constitutional: Auto-safe-stop triggers + audit trails + postmortem discipline
```

### ECHO progression

```
ECHO TIERS
T0 Seed:     Time-stamped bullets, no interpretation
T1 Operator: Signal/noise separation; consistent source tagging
T2 Analyst:  Anomaly detection + recurrence patterns
T3 Strategist: Anticipatory pulses ("if pattern holds, next likely moves…")
T4 Constitutional: Pre-narrative archival index; reconstructs causality under propaganda
```

---

## 9) Learning Loop (continuous improvement)

Every cycle ends with:

- What signal did we miss?
- What template failed?
- What threshold was too sensitive / too lax?
- What evidence rule needs tightening?
- What handoff should be default next time?

**Output:** Version bump + changelog entry.

---

## 10) Versioning

- **Spec version:** `vMAJOR.MINOR`
- **Change discipline:** Breaking workflow changes bump MAJOR; refinements bump MINOR.
- **Audit:** Keep prior versions in `/docs/10-ARCHIVES/`.

---

## 11) Quick-start Checklist

- [ ] Create a daily **ECHO pulse**
- [ ] Escalate only via **ZEUS thresholds**
- [ ] Run **HERMES trace** before conclusions
- [ ] Use **ATLAS** for structure & chokepoints
- [ ] Run **JADE** to prevent narrative drift
- [ ] Run **EVE** to preserve human stakes
- [ ] Update **Integrity domains**
- [ ] Write **Event Ledger** record
- [ ] Ship changes + learning notes

---

## Related Documentation

- [DVA MEMT Integration](./docs/04-TECHNICAL-ARCHITECTURE/dva/DVA_MEMT_INTEGRATION.md)
- [DVA Tier Mapping](./docs/04-TECHNICAL-ARCHITECTURE/overview/DVA_TIER_MAPPING.md)
- [DVA Flows Overview](./docs/04-TECHNICAL-ARCHITECTURE/overview/DVA_FLOWS_OVERVIEW.md)
- [EPICON Template](./docs/epicon/TEMPLATE_EPICON.md)

---

**Seal:** The runtime is the product. The essays are the demonstration.  
**Mobius mantra:** *Keep the record intact while it happens.*

---

*Mobius Systems — Continuous Integrity Architecture*  
*"We heal as we walk."*
