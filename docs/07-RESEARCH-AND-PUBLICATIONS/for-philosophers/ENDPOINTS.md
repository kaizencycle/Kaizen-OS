# Ethics Cathedral — API Endpoints

**Version**: C-151  
**Cathedral**: FOR-PHILOSOPHERS  
**Base URL**: `https://terminal.mobius-substrate.com/philosophy`

---

## Overview

The Ethics Cathedral provides access to sentinel deliberations, virtue metrics, ethical decision archives, and governance simulations for philosophical research and ethical analysis.

**Full API Specification**: [endpoints.json](./endpoints.json)

---

## Endpoints

### 1. Sentinel Deliberations

**Endpoint**: `GET /deliberations.json`

**Description**: Live sentinel deliberation logs with reasoning traces showing how multi-agent consensus is reached on ethical decisions.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/philosophy/deliberations.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "deliberations": [
    {
      "id": "delib-001",
      "topic": "Proposal: Increase cathedral multiplier for FOR-GOVERNMENTS",
      "sentinels": [
        {
          "id": "ATLAS",
          "position": "support",
          "reasoning": "Compliance overhead justifies 2.0× multiplier",
          "virtue_tags": ["prudence", "justice"]
        },
        {
          "id": "EVE",
          "position": "support",
          "reasoning": "Fair compensation for regulatory burden",
          "virtue_tags": ["justice", "temperance"]
        }
      ],
      "consensus": "support",
      "outcome": "approved"
    }
  ]
}
```

**Use Cases**:
- Multi-agent ethics research
- Consensus mechanism studies
- Reasoning trace analysis
- Ethical decision-making research

---

### 2. Virtue Metrics

**Endpoint**: `GET /virtues.json`

**Description**: Real-time virtue accord compliance scores showing how well the system adheres to Aristotelian virtues (integrity, temperance, justice, prudence, courage).

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/philosophy/virtues.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "virtues": {
    "integrity": {
      "score": 0.97,
      "measure": "MII ≥ 0.95",
      "status": "compliant"
    },
    "temperance": {
      "score": 0.92,
      "measure": "Cycle limits respected",
      "status": "compliant"
    },
    "justice": {
      "score": 0.89,
      "measure": "Fair MIC distribution",
      "status": "compliant"
    },
    "prudence": {
      "score": 0.94,
      "measure": "Long-term thinking",
      "status": "compliant"
    },
    "courage": {
      "score": 0.88,
      "measure": "Dissent protocols active",
      "status": "compliant"
    }
  },
  "overall_compliance": 0.92
}
```

**Use Cases**:
- Virtue ethics research
- Compliance monitoring
- Ethical framework validation
- System health assessment

---

### 3. Ethical Decision Archive

**Endpoint**: `GET /decisions.json`

**Description**: Historical archive of ethical decisions made by the sentinel council with full reasoning traces and outcomes.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/philosophy/decisions.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "decisions": [
    {
      "id": "decision-001",
      "date": "2025-11-15",
      "topic": "Emergency protocol activation",
      "frameworks_applied": ["aristotelian", "kantian"],
      "sentinels_involved": ["ATLAS", "EVE", "JADE"],
      "reasoning": "Activated emergency protocol based on integrity threshold breach",
      "outcome": "Protocol activated, system stabilized",
      "lessons_learned": "Improved early warning thresholds"
    }
  ]
}
```

**Use Cases**:
- Ethical decision history
- Case study research
- Pattern analysis
- Framework validation

---

### 4. Governance Simulation

**Endpoint**: `WebSocket /simulation`

**Description**: Interactive governance ethics simulation allowing real-time exploration of ethical decision-making scenarios.

**Format**: WebSocket (JSON messages)

**Connection**:
```javascript
const ws = new WebSocket('wss://terminal.mobius-substrate.com/philosophy/simulation');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'start_simulation',
    scenario: 'cathedral_multiplier_proposal'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Simulation update:', data);
};
```

**Message Format**:
```json
{
  "type": "simulation_update",
  "scenario": "cathedral_multiplier_proposal",
  "sentinels": [...],
  "current_state": {...},
  "next_actions": [...]
}
```

**Use Cases**:
- Interactive ethics education
- Scenario exploration
- Decision tree analysis
- Teaching tool

---

### 5. Drift Analysis

**Endpoint**: `GET /drift-analysis.json`

**Description**: Value drift detection and analysis showing how system values evolve over time and whether they remain aligned with original principles.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/philosophy/drift-analysis.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "drift_score": 0.03,
  "status": "stable",
  "analysis": {
    "virtue_alignment": 0.97,
    "principle_adherence": 0.95,
    "charter_compliance": 0.98
  },
  "trends": [
    {
      "metric": "integrity_focus",
      "baseline": 0.95,
      "current": 0.97,
      "drift": 0.02,
      "direction": "improving"
    }
  ],
  "alerts": []
}
```

**Use Cases**:
- Value drift research
- Alignment studies
- Long-term stability analysis
- Safety monitoring

---

## Philosophical Frameworks

### Aristotelian Virtue Ethics

**Virtues**:
- Integrity — Truth through verification (MII ≥ 0.95)
- Temperance — Bounded deliberation (cycle limits)
- Justice — Fair resource allocation (MIC distribution)
- Prudence — Long-term thinking (guardian succession)
- Courage — Speaking difficult truths (dissent protocols)

### Rawlsian Justice

**Principles**:
- Veil of Ignorance — Protocol design without role knowledge
- Difference Principle — Benefits to least advantaged first
- Equal Liberty — Universal access to integrity systems

**Application**: Protocol design without role knowledge

### Kantian Ethics

**Imperatives**:
- Universalizability — Rules must apply universally
- Humanity as End — Never treat humans as mere means

**Implementation**: Rule-based sentinel ethics

---

## Research Questions

The Ethics Cathedral explores fundamental questions:

1. **Can a repository possess arete (excellence)?**
   - How do we measure excellence in code?
   - What does virtue mean for AI systems?

2. **Who governs when code governs itself?**
   - Multi-agent democracy
   - Sentinel consensus mechanisms

3. **Does MIC create meritocratic aristocracy?**
   - Fairness in reward distribution
   - Access and opportunity

4. **Is C-151 fair to future cycles?**
   - Intergenerational justice
   - Long-term sustainability

---

## Rate Limits

| Tier | Limit | Description |
|------|-------|-------------|
| **Anonymous** | 100 requests/day | Public access without authentication |
| **Academic** | 1,000 requests/day | Requires academic email verification |
| **Institutional** | 10,000 requests/day | Requires partnership agreement |

### Requesting Academic Access

1. Email `philosophy@mobius.systems` with:
   - Academic affiliation
   - Research purpose
   - Expected usage volume
2. Receive API key via email
3. Include `Authorization: Bearer <api_key>` header

---

## Contact & Support

- **Philosophical Inquiry**: philosophy@mobius.systems
- **Seminar Schedule**: Thursdays 16:00 UTC (Discord)
- **Essay Submissions**: Submit PR to `philosophy/essays/`

---

## Related Documentation

- [Ethics Cathedral Overview](./README.md)
- [Ethical Foundations](./ETHICAL-FOUNDATIONS/)
- [Governance Philosophy](./GOVERNANCE-PHILOSOPHY/)
- [Recursive Ethics](./RECURSIVE-ETHICS/)
- [Complete API Specification](./endpoints.json)

---

**Mobius Systems Foundation** • Cycle C-151 • Ethics Cathedral
