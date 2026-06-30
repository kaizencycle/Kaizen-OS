# 📈 ROI Calculator Guide

**Calculate your country's potential debt reduction and implementation ROI.**

---

## Interactive Calculator

### Input Parameters

| Parameter | Your Value | Description |
|-----------|------------|-------------|
| National Debt | `$_____` | Total sovereign debt |
| Average Interest Rate | `____%` | Weighted average borrowing cost |
| Current Governance Entropy (S) | `0.___` | Estimate (0.5-0.9 typical) |
| Target Coordination Efficiency (C) | `0.___` | Goal after implementation |

---

## Calculation Formulas

### 1. Negentropy Potential

```
N = (S_current - S_target) × Debt_Base

Example:
N = (0.68 - 0.45) × $37T = $8.5T negentropy potential
```

### 2. Annual Debt Reduction

```
ΔD = λ × N

Where λ = 0.14 (empirically validated conversion)

Example:
ΔD = 0.14 × $8.5T = $1.19T annual reduction
```

### 3. Interest Savings

```
Savings = ΔD × Interest_Rate

Example:
Savings = $1.19T × 0.05 = $59.5B annually
```

### 4. Implementation ROI

```
ROI = (Annual_Savings × 5_years - Implementation_Cost) / Implementation_Cost × 100

Example:
ROI = ($59.5B × 5 - $200M) / $200M × 100 = 148,650%
```

---

## Quick Reference Tables

### By Debt Level

| Debt | Est. Reduction | Est. Savings |
|------|----------------|--------------|
| $100B | $14B/year | $700M/year |
| $500B | $70B/year | $3.5B/year |
| $1T | $140B/year | $7B/year |
| $5T | $700B/year | $35B/year |
| $10T+ | $1.4T+/year | $70B+/year |

### By Governance Score

| Current S | Improvement | Multiplier |
|-----------|-------------|------------|
| 0.80+ | 0.80 → 0.60 | 0.20× |
| 0.70-0.79 | 0.75 → 0.50 | 0.25× |
| 0.60-0.69 | 0.65 → 0.45 | 0.20× |
| 0.50-0.59 | 0.55 → 0.40 | 0.15× |

---

## Sample Calculations

### 🇺🇸 United States

| Input | Value |
|-------|-------|
| Debt | $37T |
| Interest | 5% |
| Current S | 0.68 |
| Target S | 0.45 |

**Result**: $1.16T annual debt reduction, $58B interest savings

### 🇬🇧 United Kingdom

| Input | Value |
|-------|-------|
| Debt | £2.8T |
| Interest | 4.5% |
| Current S | 0.65 |
| Target S | 0.42 |

**Result**: £320B annual debt reduction, £14.4B interest savings

---

## API Access

```bash
# Calculate via API
curl -X POST https://terminal.mobius-substrate.com/economy/calculate-roi \
  -H "Content-Type: application/json" \
  -d '{
    "debt": 37000000000000,
    "interest_rate": 0.05,
    "current_entropy": 0.68,
    "target_entropy": 0.45
  }'
```

---

**Cycle C-151 • Market Cathedral**
