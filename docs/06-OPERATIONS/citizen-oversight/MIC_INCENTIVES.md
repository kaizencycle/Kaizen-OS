# MIC Incentives for Citizen Oversight

How Mobius Integrity Credits (MIC) reward civic participation — making oversight sustainable, not volunteer burnout.

---

## Core Concept

> MIC is minted for **verified integrity work**.
> Not popularity. Not hype. Not volume.

MIC rewards:
- Accuracy over speed
- Patterns over incidents
- Documentation over drama
- Patience over outrage

---

## MIC Categories for Citizens

### 1. Civic MIC

**Purpose:** Reward oversight contributions

**Awarded for:**
- Validated anomaly reports
- Adopted pattern analyses
- Governance participation
- Historical documentation

**Properties:**
- Non-transferable in v0
- Used for governance voting weight
- Determines priority in flag review

---

### 2. Guard MIC

**Purpose:** Reward security and quality assurance

**Awarded for:**
- Security vulnerability reports
- Test coverage improvements
- Threat model contributions
- Incident response participation

---

### 3. Memory MIC

**Purpose:** Reward documentation and knowledge preservation

**Awarded for:**
- Historical annotations
- Process documentation
- Onboarding improvements
- Educational content

---

### 4. Build MIC

**Purpose:** Reward code contributions (for developer contributors)

**Awarded for:**
- Bug fixes with tests
- Performance improvements
- Feature implementations
- Infrastructure work

---

## Earning Rates

### Flag Submissions

| Outcome | MIC Award |
|---------|-----------|
| Validated accurate | +10 Civic MIC |
| Led to policy change | +25 Civic MIC |
| Led to threshold adjustment | +50 Civic MIC |
| Rejected (good faith) | 0 |
| Rejected (bad faith) | -20 Civic MIC |

### Pattern Analysis

| Outcome | MIC Award |
|---------|-----------|
| Pattern confirmed | +15 Civic MIC |
| Analysis adopted by stewards | +30 Civic MIC |
| Analysis cited in decision | +20 Civic MIC |
| Pattern not confirmed (good faith) | 0 |

### Governance Participation

| Action | MIC Award |
|--------|-----------|
| Vote cast in official process | +5 Civic MIC |
| Proposal submitted (accepted) | +25 Civic MIC |
| Steward review completed | +15 Civic MIC |
| Dispute resolution participation | +10 Civic MIC |

### Documentation

| Contribution | MIC Award |
|--------------|-----------|
| Historical annotation added | +3 Memory MIC |
| Annotation cited in decision | +10 Memory MIC |
| Process documentation update | +5 Memory MIC |
| Onboarding guide improvement | +10 Memory MIC |

---

## Trust Score Multipliers

MIC earnings are modified by trust level:

| Trust Level | Multiplier |
|-------------|------------|
| T0 (Observer) | 0x (no earnings) |
| T1 (Auditor) | 0.5x |
| T2 (Verified Auditor) | 1.0x |
| T3 (Steward) | 1.5x |

**Example:**
- T1 submits validated flag: 10 × 0.5 = **5 Civic MIC**
- T3 submits validated flag: 10 × 1.5 = **15 Civic MIC**

---

## Burn Mechanics

MIC is burned (removed) when integrity is violated.

### Automatic Burns

| Violation | MIC Burn |
|-----------|----------|
| Bad-faith flag submission | -20 Civic MIC |
| False pattern claim | -15 Civic MIC |
| Brigading participation | -100 Civic MIC |
| Policy bypass | -50 Civic MIC |
| Harassment | -100 Civic MIC |

### Manual Burns (Steward Decision)

| Violation | MIC Burn |
|-----------|----------|
| Repeated false submissions | -50 to -200 |
| Coordinated abuse | -200 to -500 |
| Evidence fabrication | Full balance |
| Security negligence | Case-by-case |

---

## Non-Speculative Policy (v0)

During v0, MIC is explicitly **non-speculative**:

1. **No external trading** — MIC cannot be exchanged for currency
2. **No transferability** — MIC cannot be sent between accounts
3. **No marketplace** — No buying or selling
4. **Internal use only** — Governance weight and priority only

**Rationale:**
- Prevents gaming before system is stable
- Keeps focus on integrity, not profit
- Allows calibration before economic launch

---

## Vesting and Decay

### Earning Vesting

- Earned MIC is immediately available
- No vesting period in v0
- Future versions may add vesting for large awards

### MIC Decay

- Inactive accounts: MIC decays 5% per quarter after 6 months
- Active accounts: No decay
- Activity threshold: 1 governance action per quarter

---

## MIC Balance Display

### User Dashboard

```
┌─────────────────────────────────────────┐
│ Your MIC Balance                        │
├─────────────────────────────────────────┤
│ Civic MIC:   145                        │
│ Memory MIC:   23                        │
│ Guard MIC:     0                        │
│ Build MIC:     0                        │
│ ─────────────────────                   │
│ Total:       168 MIC                    │
│                                         │
│ Governance Weight: 1.68x                │
│ Flag Priority: Standard                 │
│                                         │
│ Recent:                                 │
│ • +10 Civic (validated flag, Jan 28)    │
│ • +15 Civic (governance vote, Jan 25)   │
│ • +3 Memory (annotation, Jan 20)        │
└─────────────────────────────────────────┘
```

---

## MIC Uses (v0)

### 1. Governance Voting Weight

MIC balance affects vote influence:

| MIC Balance | Vote Weight |
|-------------|-------------|
| 0-49 | 1.0x |
| 50-99 | 1.25x |
| 100-199 | 1.5x |
| 200-499 | 1.75x |
| 500+ | 2.0x |

**Note:** Human stewards always have final authority regardless of MIC.

### 2. Flag Priority

Higher MIC = faster flag review:

| MIC Balance | Review Queue |
|-------------|--------------|
| 0-49 | Standard (72h) |
| 50-99 | Priority (48h) |
| 100+ | High priority (24h) |

### 3. Feature Access (Future)

Reserved for future:
- Advanced analytics
- API rate limit increases
- Early access to new tools

---

## Anti-Gaming Measures

### Rate Limits

- Max 5 flags per day (prevents spam)
- Max 10 annotations per week (prevents flooding)
- Governance votes limited by active proposals

### Quality Requirements

- Flags require minimum detail
- Annotations require source reference
- Proposals require structured format

### Audit Trail

- All MIC transactions logged
- Public aggregate statistics
- Individual history visible to user

---

## Reporting

### System-Wide Statistics (Public)

- Total MIC in circulation
- MIC minted this period
- MIC burned this period
- Top earning activities

### Individual Statistics (Private)

- Personal earning history
- Category breakdown
- Ranking percentile (anonymous)

---

## Governance of MIC Rules

MIC policies are governed by:

| Change Type | Requirements |
|-------------|--------------|
| Rate adjustments | Steward majority vote |
| New categories | RFC + steward vote |
| Burn rules | RFC + 2/3 steward vote |
| Transferability | RFC + unanimous steward vote |

---

## Future Roadmap

### v1.0 (Planned)

- Limited transferability within ecosystem
- Staking for governance proposals
- Bonus multipliers for long-term holders

### v2.0 (Exploratory)

- Cross-system recognition
- External partnerships
- Economic modeling complete

---

## Philosophy

MIC exists to make civic participation sustainable.

Without incentives:
- Oversight becomes volunteer burnout
- Quality contributors leave
- Bad actors face no cost

With MIC:
- Accuracy is rewarded
- Participation has value
- Abuse has consequences
- Community grows

---

*"MIC rewards integrity work — not hype, not volume, not popularity."*

*We heal as we walk. — Mobius Substrate*
