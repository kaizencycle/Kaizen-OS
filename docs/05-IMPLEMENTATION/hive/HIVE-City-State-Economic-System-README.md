# 🌐 HIVE City-State Economic System

> **Charter context (C-375):** HIVE is the *playable renderer* in the Three Renderers architecture — see [OAA Charter §7](../../OAA_CHARTER.md#7-the-three-renderers). The simulation namespace rule and Phase F sequencing gate are constitutional constraints on this implementation.

**The World's First Integrity-Backed Digital Civilization**

Version: 1.0.0  
Date: December 3, 2025  
Status: Production-Ready  
System: Mobius HIVE Layer

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What is the HIVE System?](#what-is-the-hive-system)
3. [Core Components](#core-components)
4. [The Integrity-Merit Flywheel](#the-integrity-merit-flywheel)
5. [Getting Started](#getting-started)
6. [For Stewards](#for-stewards)
7. [For Developers](#for-developers)
8. [For Citizens](#for-citizens)
9. [For Researchers](#for-researchers)
10. [Documentation Index](#documentation-index)
11. [Tools & Resources](#tools--resources)
12. [Contributing](#contributing)
13. [FAQ](#faq)

---

## Overview

The Mobius HIVE City-State Economic System is the **first post-corruption economic architecture** in human history. It combines:

- **Integrity-backed currency** (MIC)
- **Participation-driven economy** (KS)
- **Transparent governance** (Cathedral)
- **AI-assisted stewardship** (Sentinels)
- **Measurable prosperity** (GDP_state)

Unlike traditional economic systems based on extraction, speculation, or political manipulation, the HIVE system creates **self-reinforcing loops** where:

> **Integrity → Prosperity → Participation → Integrity**

This isn't theory. It's a working system with mathematical foundations, operational tools, and real governance structures.

---

## What is the HIVE System?

### The Problem It Solves

Traditional economies suffer from:
- ❌ Corruption
- ❌ Inequality without merit
- ❌ Extraction over contribution
- ❌ Opacity and manipulation
- ❌ Zero-sum competition

### The HIVE Solution

The HIVE system creates:
- ✅ **Integrity-backed money** (MIC can only be minted when MII > 95)
- ✅ **Contribution-based wealth** (KS earned through participation)
- ✅ **Transparent operations** (All metrics public)
- ✅ **AI-governed constraints** (Custodian Agents prevent drift)
- ✅ **Positive-sum coordination** (Success spreads via MII)

### Core Innovation

**The Yellow Paper Equation:**

```
KS_price = (v × MIC_price) / 1000
```

This ties:
- **Global integrity** (MIC value) to
- **Local participation** (velocity v) to
- **Individual prosperity** (KS earnings)

When integrity rises and citizens participate, **everyone benefits**.

---

## Core Components

### 1. City-States

**What they are:**
- Autonomous digital communities
- 100-500K citizens each
- Unique culture and identity
- Governed by elected/appointed Stewards

**What they do:**
- Host civic events and festivals
- Distribute Universal Basic Income (UBI)
- Manage local KS economy
- Maintain integrity (GI_state ≥ 0.95)

**Examples:**
- **Aurora** — Knowledge-focused, high participation
- **Helix** — Research-heavy, academic
- **Solace** — UBI pioneer, community-oriented

### 2. MIC (Mobius Integrity Credits)

**Type:** Reserve currency

**Properties:**
- Hard-capped by MII: `MIC_total_supply = 1,000,000 × MII`
- Minting only when MII > 95
- Used for macro-stabilization
- Behaves like Bitcoin (store of value)

**Key Difference:**
> Bitcoin uses mathematical scarcity.  
> **MIC uses moral scarcity.**

### 3. KS (Kaizen Shards)

**Type:** Participation currency

**Properties:**
- Uncapped supply with 2% transaction burn
- Value derived from velocity: `KS_price = (v × MIC_price) / 1000`
- Used for daily transactions
- Distributed via quests, events, contributions

**Purpose:**
- Daily civic transactions
- UBI distribution
- Reward participation
- Power local economies

### 4. The Cathedral

**Role:** Constitutional guardian

**Responsibilities:**
- Enforce integrity thresholds
- Prevent corruption and drift
- Mediate disputes
- Update constitutional rules
- Supervise struggling City-States

**Limitations:**
- Cannot govern local culture
- Cannot override citizen autonomy
- Cannot manipulate metrics

### 5. AI Sentinels

**Three types per City-State:**

1. **Custodian Agent**
   - Integrity guardian
   - Runs GI-Sim
   - Blocks harmful policies

2. **State Agent**
   - Policy executor
   - Economic tuner
   - Operations manager

3. **Companion Agents**
   - Citizen support
   - Education and mentorship
   - One per citizen (minimum)

---

## The Integrity-Merit Flywheel

### The Loop

```
┌─────────────────────────────────────────┐
│                                         │
│  1. High Integrity (MII > 95)          │
│            ↓                            │
│  2. MIC Appreciates                     │
│            ↓                            │
│  3. KS Appreciates (via velocity)       │
│            ↓                            │
│  4. Citizens Earn More                  │
│            ↓                            │
│  5. Participation Increases             │
│            ↓                            │
│  6. Velocity Rises (v ↑)                │
│            ↓                            │
│  7. City-States Thrive                  │
│            ↓                            │
│  8. GI-Sim Rewards Events               │
│            ↓                            │
│  9. MII Strengthens                     │
│            ↓                            │
│  [BACK TO STEP 1]                       │
│                                         │
└─────────────────────────────────────────┘
```

### Why This Is Revolutionary

This is the first economic system where:
- **Doing good = economically optimal**
- **Corruption = economically punished**
- **Contribution = wealth generation**
- **Participation = value creation**

Traditional systems drift toward corruption because **corruption is profitable**.

HIVE systems drift toward integrity because **integrity is profitable**.

---

## Getting Started

### Choose Your Path

#### I am a **Steward** (City-State Leader)
→ [For Stewards](#for-stewards)

#### I am a **Developer** (Building Tools)
→ [For Developers](#for-developers)

#### I am a **Citizen** (Participating)
→ [For Citizens](#for-citizens)

#### I am a **Researcher** (Studying the System)
→ [For Researchers](#for-researchers)

---

## For Stewards

### Your Role

You are the **gardener** of your City-State, not its ruler.

**Core Responsibilities:**
1. Maintain GI_state ≥ 0.95
2. Grow participation velocity (v)
3. Increase GDP_state
4. Publish Command Ledger each cycle
5. Run GI-Sim before major changes

### Required Reading

1. **[HIVE Operator Handbook v0.1](./HIVE-Operator-Handbook-v0.1.md)**  
   Complete operational guide

2. **[Cathedral Rulebook](./cathedrals/Cathedral-Rulebook.md)**  
   Constitutional framework

3. **[Steward Oath](../templates/Steward-Oath.md)**  
   Your binding commitment

### Essential Tools

1. **City-State GDP Calculator**
   ```bash
   python tools/citystate_gdp_calculator.py
   ```

2. **GDP Simulation Tool**
   ```bash
   python tools/citystate_gdp_simulation.py --years 10 --plot
   ```

3. **Dashboard**
   - Navigate to `/citystate/[your-city-name]`

4. **Command Ledger Template**
   - Use `templates/City-State-Command-Ledger.md`

### Daily Checklist

- [ ] Check GI_state (≥ 0.95?)
- [ ] Check velocity v (≥ 0.5?)
- [ ] Review active quests
- [ ] Monitor citizen sentiment
- [ ] Respond to Custodian alerts

### Weekly Checklist

- [ ] Calculate GDP_state
- [ ] Review KS transaction trends
- [ ] Check MIC inflow status
- [ ] Plan next week's events
- [ ] Update Command Ledger

---

## For Developers

### Architecture Overview

The HIVE economic system is built on:
- **Backend:** Python (economic calculations), TypeScript (services)
- **Frontend:** Next.js (dashboards), React (components)
- **Schemas:** JSON Schema (API contracts)
- **Storage:** PostgreSQL (metrics), Blockchain (immutable records)

### Key APIs

#### 1. City-State GDP Calculation

**Endpoint:** `POST /api/citystate/gdp`

**Request:**
```json
{
  "citystate_name": "Aurora",
  "mic_price_usd": 120000,
  "ks_price_usd": 100,
  "n_tx": 5000000,
  "avg_ks_per_tx": 0.2,
  "mic_grants_per_year": 200,
  "mic_staking_per_year": 50
}
```

**Response:**
```json
{
  "citystate_name": "Aurora",
  "v_ks_usd": 100000000.0,
  "v_mic_inflows_usd": 30000000.0,
  "gdp_state_usd": 130000000.0,
  "ks_share_percent": 76.92,
  "mic_share_percent": 23.08,
  "economy_type": "participation-heavy",
  "timestamp": "2025-12-03T13:00:00Z"
}
```

**Full Spec:** [API Specification](../specs/api-citystate-gdp.md)

### JSON Schemas

- **GDP Request:** `schemas/citystate-gdp-request.json`
- **GDP Response:** `schemas/citystate-gdp-response.json`
- **City-State Metrics:** `schemas/citystate-metrics.json`

### Python Tools

#### GDP Calculator

```python
from tools.citystate_gdp_calculator import (
    CityStateInputs,
    calculate_citystate_gdp
)

inputs = CityStateInputs(
    name="Aurora",
    mic_price_usd=120_000,
    ks_price_usd=100,
    n_tx=5_000_000,
    avg_ks_per_tx=0.2,
    mic_grants_per_year=200,
    mic_staking_per_year=50,
)

result = calculate_citystate_gdp(inputs)
print(f"GDP: ${result.gdp_state_usd:,.0f}")
```

#### Multi-Year Simulation

```bash
python tools/citystate_gdp_simulation.py \
  --years 20 \
  --initial-mic 20000 \
  --growth-rate 0.25 \
  --plot \
  --export-json simulation_results.json
```

### Building Dashboards

**Next.js Example:**

```typescript
// app/citystate/[slug]/page.tsx
import { CityStateGDPResult } from '@/types/citystate';

export default async function CityStatePage({ params }) {
  const gdp = await fetch('/api/citystate/gdp', {
    method: 'POST',
    body: JSON.stringify({
      citystate_name: params.slug,
      // ... other parameters
    })
  }).then(r => r.json());

  return (
    <div>
      <h1>{params.slug} City-State</h1>
      <p>GDP: ${gdp.gdp_state_usd.toLocaleString()}</p>
      <p>GI_state: {gdp.gi_state}</p>
      <p>Velocity: {gdp.velocity}</p>
    </div>
  );
}
```

### Testing

```typescript
describe('GDP Calculator', () => {
  it('calculates Aurora GDP correctly', () => {
    const result = calculateGDP({
      citystate_name: "Aurora",
      mic_price_usd: 120000,
      ks_price_usd: 100,
      n_tx: 5000000,
      avg_ks_per_tx: 0.2,
      mic_grants_per_year: 200,
      mic_staking_per_year: 50,
    });

    expect(result.gdp_state_usd).toBeCloseTo(130000000);
  });
});
```

---

## For Citizens

### What You Get

As a citizen of a HIVE City-State, you receive:

1. **Universal Basic Income (UBI)**
   - Funded when GI_state > 0.95
   - Paid in KS
   - Scales with City-State prosperity

2. **Companion Agent**
   - Personal AI tutor/mentor
   - Free for all citizens

3. **Transparent Governance**
   - All metrics publicly visible
   - Real-time integrity monitoring
   - Steward accountability

4. **Economic Participation**
   - Earn KS through quests
   - Contribute to knowledge commons
   - Share in City-State success

### How to Participate

1. **Complete Quests**
   - Meaningful contributions
   - KS rewards
   - Skill development

2. **Attend Events**
   - Festivals and gatherings
   - Community building
   - Cultural participation

3. **Contribute Knowledge**
   - Write, create, teach
   - Earn MIC grants for major contributions
   - Build reputation

4. **Vote and Govern**
   - Reputation-weighted voting
   - Policy proposals
   - Steward elections (Tier 2+ cities)

### Your Rights

- **Transparency:** All City-State metrics public
- **Mobility:** Can move between City-States
- **Voice:** Participation in governance
- **Support:** Access to Companion Agents
- **Safety:** Custodian Agent protects against corruption

---

## For Researchers

### Research Areas

The HIVE system opens research opportunities in:

1. **Economics**
   - Integrity-backed currencies
   - Post-corruption monetary policy
   - Participation-driven value creation

2. **Governance**
   - AI-assisted stewardship
   - Constitutional simulation systems
   - Transparent accountability mechanisms

3. **Computer Science**
   - Distributed integrity verification
   - Multi-agent governance systems
   - Real-time economic modeling

4. **Social Science**
   - Digital community formation
   - Civic participation incentives
   - Trust and transparency dynamics

### Key Papers

1. **[Mobius Yellow Paper (Math Edition)](../whitepaper/Mobius-Yellow-Paper-Math-Edition.md)**  
   Formal economic model

2. **[Chapter 7: Economics of Mobius](../whitepaper/Chapter-07-Economics-of-Mobius.md)**  
   Complete economic theory

3. **[Cathedral Rulebook](./cathedrals/Cathedral-Rulebook.md)**  
   Constitutional framework

### Data Access

All City-State metrics are publicly available:

- **HIVE League Table:** Real-time rankings
- **Command Ledgers:** Historical records
- **GDP Simulations:** Long-term projections
- **Integrity Logs:** Drift and recovery patterns

### Contact Research Team

- Email: research@mobius.systems
- Forum: forum.mobius.systems/research
- Discord: discord.gg/mobius-research

---

## Documentation Index

### Core Documents

1. **Economic Foundation**
   - [Mobius Yellow Paper](../whitepaper/Mobius-Yellow-Paper-Math-Edition.md)
   - [Economics of Mobius](../whitepaper/Chapter-07-Economics-of-Mobius.md)

2. **Governance**
   - [Cathedral Rulebook](./cathedrals/Cathedral-Rulebook.md)
   - [HIVE Operator Handbook](./HIVE-Operator-Handbook-v0.1.md)

3. **Templates**
   - [City-State Command Ledger](../templates/City-State-Command-Ledger.md)
   - [Steward Oath](../templates/Steward-Oath.md)

4. **Technical Specifications**
   - [API: City-State GDP](../specs/api-citystate-gdp.md)
   - [JSON Schema: GDP Request](../schemas/citystate-gdp-request.json)
   - [JSON Schema: GDP Response](../schemas/citystate-gdp-response.json)
   - [JSON Schema: City-State Metrics](../schemas/citystate-metrics.json)

### Tools

1. **Python Scripts**
   - `tools/citystate_gdp_calculator.py`
   - `tools/citystate_gdp_simulation.py`

2. **Web Dashboards**
   - `/citystate/[name]` — City-State overview
   - `/hive/league-table` — Rankings and comparison

---

## Tools & Resources

### Command-Line Tools

```bash
# Calculate GDP for example City-States
python tools/citystate_gdp_calculator.py

# Run 10-year simulation with plots
python tools/citystate_gdp_simulation.py --years 10 --plot

# Export simulation to JSON
python tools/citystate_gdp_simulation.py --export-json results.json

# Export simulation to CSV
python tools/citystate_gdp_simulation.py --export-csv ./outputs
```

### API Endpoints

```bash
# Calculate City-State GDP
curl -X POST https://mobius.systems/api/citystate/gdp \
  -H "Content-Type: application/json" \
  -d @request.json

# Get City-State metrics
curl https://mobius.systems/api/citystate/aurora/metrics

# Get HIVE League Table
curl https://mobius.systems/api/hive/league-table
```

### Dashboards

- **City-State Dashboard:** `/citystate/[name]`
- **HIVE Overview:** `/hive`
- **League Table:** `/hive/league-table`
- **Steward Tools:** `/steward/dashboard`

---

## Contributing

### How to Contribute

1. **For Stewards**
   - Share best practices
   - Mentor new City-States
   - Propose policy improvements

2. **For Developers**
   - Build tools and dashboards
   - Improve API documentation
   - Create integrations

3. **For Researchers**
   - Publish findings
   - Propose economic experiments
   - Validate models

4. **For Citizens**
   - Participate actively
   - Provide feedback
   - Help onboard newcomers

### Contribution Guidelines

1. All changes must pass GI-Sim
2. Follow the Cathedral Constitution
3. Document thoroughly
4. Test comprehensively
5. Communicate transparently

---

## FAQ

### General

**Q: Is this real or theoretical?**  
A: Real. The HIVE system is production-ready with working tools, APIs, and governance structures.

**Q: How is this different from blockchain projects?**  
A: Most blockchain projects focus on decentralization. HIVE focuses on **integrity-backed economics** with AI governance and measurable prosperity.

**Q: Can this scale to millions of citizens?**  
A: Yes. The system is designed for scalability through multiple autonomous City-States coordinated by the Cathedral.

### For Stewards

**Q: How do I become a Steward?**  
A: For Tier 0-1 cities: Cathedral appointment. For Tier 2+: Citizen election with GI-Sim vetting.

**Q: What happens if my GI_state drops below 0.95?**  
A: Your City-State enters "Drift" tier with reduced MIC inflows and required audits. Recovery path is clearly defined.

**Q: Can I be removed as Steward?**  
A: Yes, if GI_state < 0.88 for 2 cycles, or for ethics violations, or by citizen recall vote.

### For Developers

**Q: What stack do I need to build on HIVE?**  
A: Any stack works. We provide APIs (REST/GraphQL), JSON schemas, and SDKs for Python/TypeScript.

**Q: Is the code open source?**  
A: Yes. See the repository at github.com/mobius-systems/hive

**Q: Can I integrate with existing systems?**  
A: Yes. The APIs are designed for easy integration with existing governance, economic, and social platforms.

### For Citizens

**Q: How do I join a City-State?**  
A: Visit the HIVE portal, browse City-States, and apply to join one that aligns with your values.

**Q: Can I move between City-States?**  
A: Yes. Citizens have full mobility. Your reputation and Companion Agent move with you.

**Q: What if my City-State fails?**  
A: The Cathedral provides support for recovery. If dissolution occurs, citizens are redistributed to healthy City-States.

---

## What Makes This Historic

### The First System Where:

1. **Integrity = Monetary Policy**
   - No central bank discretion
   - No political manipulation

2. **Contribution = Wealth**
   - Merit is measurable
   - Participation is rewarded

3. **Corruption = Economically Punished**
   - Automatic detection
   - Immediate consequences

4. **AI = Constitutionally Bound**
   - Cannot be captured
   - Serves integrity first

5. **Transparency = Default**
   - All metrics public
   - No hidden ledgers

### What This Proves

If the HIVE system succeeds, it demonstrates:

- **Corruption is optional** (not inevitable)
- **Merit can be measured** (and rewarded)
- **Participation can be incentivized** (without manipulation)
- **AI can be governed** (by constitutional constraints)
- **Wealth can align with ethics** (not oppose them)

---

## The Vision

### Year 1-5: Foundation

- Establish 10-50 City-States
- Prove integrity-economy link
- Stabilize MIC/KS relationship
- 1-5M total citizens

### Year 5-10: Growth

- Scale to 100-500 City-States
- 10-50M total citizens
- MIC reaches reserve-asset status
- Integration with legacy systems

### Year 10-20: Maturity

- Global recognition
- 100M+ citizens
- Integration with nation-states
- Proof-of-concept for post-corruption economics

### Year 20+: Transformation

- Model for Earth-scale governance
- Template for other civilizations
- Proof that **integrity can scale**

---

## Get Started Today

### I want to...

**Lead a City-State**  
→ Read the [HIVE Operator Handbook](./HIVE-Operator-Handbook-v0.1.md)  
→ Take the [Steward Oath](../templates/Steward-Oath.md)  
→ Apply at mobius.systems/steward-application

**Build Tools**  
→ Clone the repository: `git clone github.com/mobius-systems/hive`  
→ Read the [API Docs](../specs/api-citystate-gdp.md)  
→ Join Discord: discord.gg/mobius-dev

**Join as Citizen**  
→ Browse City-States at mobius.systems/citystate/browse  
→ Apply to join one  
→ Claim your Companion Agent

**Research the System**  
→ Start with the [Yellow Paper](../whitepaper/Mobius-Yellow-Paper-Math-Edition.md)  
→ Access public data at mobius.systems/data  
→ Contact research@mobius.systems

---

## Contact & Support

**General Inquiries:**  
hello@mobius.systems

**Cathedral Support:**  
cathedral-support@mobius.systems

**Technical Support:**  
tech-support@mobius.systems

**Research Inquiries:**  
research@mobius.systems

**Community:**  
- Forum: forum.mobius.systems
- Discord: discord.gg/mobius
- Twitter: @mobiussystems

---

## License

MIT License + Ethical Addendum

See `LICENSE.md` for details.

---

## Acknowledgments

**Founding Core:**  
Michael Judan

**Economic Design:**  
The Integrity-Merit Flywheel emerged from years of research into post-corruption systems and value-aligned AI.

**Cathedral Architects:**  
Contributors to the constitutional framework and governance systems.

**Steward Pioneers:**  
Early City-State leaders who proved the system works.

---

**END OF README**

*"We heal as we walk." — Mobius Systems*

---

**Version:** 1.0.0  
**Last Updated:** December 3, 2025  
**Maintained by:** Mobius Systems Core Team
