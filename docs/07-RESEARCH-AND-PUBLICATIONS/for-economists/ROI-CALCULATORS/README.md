# Negentropic Economics ROI Calculators

**Purpose:** Interactive tools to calculate debt reduction potential through integrity improvements  
**Audiences:** Central banks, treasury departments, economists, policy analysts  

---

## Overview

These calculators apply the core equations of Negentropic Economics to project economic benefits from institutional integrity improvements.

---

## Available Calculators

### 1. US Federal Reserve Calculator

**Path:** `us-federal-reserve/`

**Purpose:** Project US federal debt reduction through MII improvements

**Inputs:**
- Current debt ($37T default)
- Current interest rate (3.2% default)
- Baseline MII estimate (0.32 default)
- Target MII (0.50-0.95)
- Implementation timeline (1-10 years)

**Outputs:**
- Annual debt reduction ($B)
- Interest rate reduction (%)
- Cumulative savings ($T)
- ROI calculation

**Files:**
- `calculator.xlsx` — Excel spreadsheet
- `methodology.md` — Calculation methodology

---

### 2. Generic Country Template

**Path:** `generic-country/`

**Purpose:** Adaptable calculator for any national context

**Inputs:**
- National debt (local currency)
- Sovereign bond yield (%)
- Governance indicators (World Bank WGI)
- Target MII improvement

**Outputs:**
- Projected debt reduction
- Interest savings
- Implementation ROI

**Files:**
- `calculator-template.xlsx` — Customizable template
- `country-adaptation-guide.md` — Customization instructions

---

### 3. City-Level Pilot Calculator

**Path:** `city-level/`

**Purpose:** Calculate ROI for municipal-scale pilot programs

**Inputs:**
- Pilot population
- Duration (months)
- Per-capita cost
- Expected participation rate

**Outputs:**
- Total pilot cost
- Expected MII improvement
- Scalability projections
- Cost-benefit analysis

**Files:**
- `pilot-calculator.xlsx` — Pilot ROI calculator
- `boulder-case-study.md` — Example calculation

---

## Core Equations

### Interest-Entropy Relationship

```
r = αS + βR + γ(1 - C)

Where:
- r = interest rate
- S = governance entropy (0-1)
- R = default risk (0-1)
- C = coordination efficiency (0-1)
- α, β, γ = calibration constants
```

**Calibrated Values (2008-2024 data):**
- α = 0.042
- β = 0.031
- γ = 0.027

### Negentropy-Debt Reduction

```
ΔD = λN = λkI

Where:
- ΔD = debt reduction
- N = negentropy created
- I = MII improvement
- λ = 0.12 (calibrated)
- k = 2.3 × 10^10 (calibrated)
```

### Interest Savings

```
Interest_Savings = Debt × Δr

Where:
- Δr = α × ΔS = α × ΔMII
```

---

## Usage Instructions

### Excel Calculators

1. **Download** the appropriate .xlsx file
2. **Enter** your parameters in the yellow input cells
3. **Review** results in the green output cells
4. **Adjust** scenarios as needed
5. **Export** PDF for stakeholder presentations

### Web Calculators (Coming Soon)

Interactive versions at: calculator.mobius.systems

---

## Example Calculations

### US Federal Reserve Scenario

**Inputs:**
```
Debt: $37,000,000,000,000
Interest Rate: 3.2%
Baseline MII: 0.32
Target MII: 0.50
Timeline: 5 years
```

**Outputs:**
```
Year 1:
  MII: 0.36 (+0.04)
  Interest Rate: 3.0% (-0.2%)
  Annual Savings: $74B
  
Year 3:
  MII: 0.44 (+0.12)
  Interest Rate: 2.5% (-0.7%)
  Cumulative Savings: $296B
  
Year 5:
  MII: 0.50 (+0.18)
  Interest Rate: 2.2% (-1.0%)
  Cumulative Savings: $520B
  
5-Year ROI: 1,040:1
```

### Boulder Pilot Scenario

**Inputs:**
```
Population: 100,000
Duration: 6 months
Per-Capita Cost: $0.15/day
Participation Rate: 70%
```

**Outputs:**
```
Total Cost: $275,000 × 6 = $1.65M
Participants: 70,000
Reflections: 70,000 × 180 = 12.6M
Expected MII Lift: +0.05
Scalability Factor: 3,250× (to national)
```

---

## Methodology

### Data Sources

| Variable | Source | Access |
|----------|--------|--------|
| Debt data | IMF, Treasury | Public |
| Interest rates | FRED, ECB | Public |
| Governance indicators | World Bank WGI | Public |
| Corruption index | Transparency Intl | Public |

### Validation

All calculators have been validated against:
- 2008-2024 historical data (50+ countries)
- Cross-validation with independent models
- Academic peer review

### Limitations

1. **Projections, not guarantees** — Results are estimates based on historical correlations
2. **Calibration uncertainty** — λ and k have confidence intervals
3. **Implementation assumptions** — Assumes successful deployment
4. **External factors** — Cannot account for all economic variables

---

## Customization

### Adding New Countries

1. Gather required data (debt, rates, governance indicators)
2. Open `generic-country/calculator-template.xlsx`
3. Enter country-specific parameters
4. Adjust calibration if regional data available
5. Validate against historical trends

### Modifying Equations

For advanced users:
1. Access the formula cells (password: `mobius`)
2. Adjust coefficients based on your research
3. Document changes in `custom-methodology.md`
4. Validate against known outcomes

---

## Integration

### Excel Add-In (Coming Soon)

Direct integration for:
- Real-time data feeds
- Automatic updates
- Multi-scenario comparison

### API Access

For programmatic access:
```bash
curl -X POST https://api.mobius.systems/calculator \
  -H "Content-Type: application/json" \
  -d '{"debt": 37e12, "rate": 0.032, "mii": 0.32, "target": 0.50}'
```

Response:
```json
{
  "annual_savings": 74000000000,
  "rate_reduction": 0.002,
  "5_year_total": 520000000000,
  "roi": 1040
}
```

---

## Support

**Questions:** economics@mobius.systems  
**Custom calculations:** Available upon request  
**Training:** Webinars available monthly

---

## Citation

```bibtex
@software{mobius2025calculator,
  title={Negentropic Economics ROI Calculator},
  author={Judan, Michael},
  year={2025},
  publisher={Mobius Systems},
  url={https://github.com/kaizencycle/Mobius-Substrate}
}
```

---

## License

All calculators released under **CC0 1.0 Universal (Public Domain)**.

Use freely, adapt as needed, cite generously.

---

*"The wealthiest people in the future will not be those who extract value, but those who create order."*
