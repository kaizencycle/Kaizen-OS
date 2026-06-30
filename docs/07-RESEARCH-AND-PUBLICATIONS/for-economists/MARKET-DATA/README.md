# 📊 Market Data

**Historical economic data and correlation analyses for the MIC economy.**

---

## Available Datasets

### MIC Economy Data

| Dataset | Format | Period | Records |
|---------|--------|--------|---------|
| [mic-minting-history.csv](mic-minting-history.csv) | CSV | C-100 to C-151 | 51 cycles |
| [sentinel-rewards.json](sentinel-rewards.json) | JSON | C-100 to C-151 | 255 records |
| [cathedral-distribution.csv](cathedral-distribution.csv) | CSV | C-140 to C-151 | 11 cycles |

### Correlation Data

| Dataset | Format | Period | Description |
|---------|--------|--------|-------------|
| [debt-entropy-correlation.csv](debt-entropy-correlation.csv) | CSV | 2008-2025 | 17 years, 12 countries |
| [interest-uncertainty.csv](interest-uncertainty.csv) | CSV | 2010-2025 | Central bank rate correlations |
| [order-debt-reduction.csv](order-debt-reduction.csv) | CSV | 2020-2025 | Pilot program results |

---

## Data Schema

### mic-minting-history.csv

| Column | Type | Description |
|--------|------|-------------|
| `cycle_id` | string | Cycle identifier (e.g., C-150) |
| `timestamp` | datetime | Minting timestamp |
| `sentinel_id` | string | Sentinel that earned reward |
| `cathedral` | string | Cathedral assignment |
| `coordination_score` | float | Score (0-100) |
| `base_reward` | float | Base MIC reward |
| `multiplier` | float | Cathedral multiplier |
| `final_reward` | float | Total MIC minted |

### debt-entropy-correlation.csv

| Column | Type | Description |
|--------|------|-------------|
| `date` | date | Observation date |
| `country` | string | ISO 3166-1 alpha-3 code |
| `national_debt_pct_gdp` | float | Debt as % of GDP |
| `entropy_index` | float | Calculated governance entropy |
| `interest_rate` | float | Central bank rate |
| `correlation_30d` | float | 30-day rolling correlation |

---

## Accessing Data

### Direct Download

```bash
# MIC History
curl https://terminal.mobius-substrate.com/economy/mic-history.csv > mic-history.csv

# Debt-Entropy Data
curl https://terminal.mobius-substrate.com/economy/debt-entropy.csv > debt-entropy.csv
```

### API Access

```javascript
// Get latest market data
const response = await fetch('https://terminal.mobius-substrate.com/economy/snapshot.json');
const data = await response.json();

console.log('MIC Supply:', data.mic_supply);
console.log('MII Score:', data.mii_score);
console.log('Coordination Avg:', data.coordination_average);
```

---

## Data Quality

- **Source**: Mobius Systems production ledger
- **Verification**: All data cryptographically attested
- **Update Frequency**: 6-hour snapshots
- **Retention**: Permanent (on-chain)

---

## Citation

```bibtex
@dataset{mobius2025market,
  title={Mobius Systems Market Data},
  author={Mobius Systems Foundation},
  year={2025},
  url={https://terminal.mobius-substrate.com/economy/},
  license={CC0 1.0}
}
```

---

**Cycle C-151 • Market Cathedral**
