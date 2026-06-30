# Market Cathedral — API Endpoints

**Version**: C-151  
**Cathedral**: FOR-ECONOMISTS  
**Base URL**: `https://terminal.mobius-substrate.com/economy`

---

## Overview

The Market Cathedral provides real-time access to MIC economy data, coordination metrics, ROI analysis, and historical market data for economic research and policy analysis.

**Full API Specification**: [endpoints.json](./endpoints.json)

---

## Endpoints

### 1. MIC Supply

**Endpoint**: `GET /supply`

**Description**: Current MIC total supply and distribution breakdown including circulating, locked, and burned amounts.

**Format**: JSON

**Update Frequency**: Real-time

**Fields**:
- `total_supply` — Total MIC ever minted
- `circulating` — Currently circulating MIC
- `locked` — MIC locked in contracts
- `burned` — Total MIC burned (deflationary sinks)

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/economy/supply
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "total_supply": 1000000,
  "circulating": 850000,
  "locked": 100000,
  "burned": 50000
}
```

**Use Cases**:
- Monetary policy analysis
- Supply curve modeling
- Inflation/deflation tracking
- Economic forecasting

---

### 2. Mobius Integrity Index (MII)

**Endpoint**: `GET /mii`

**Description**: Current Mobius Integrity Index and threshold for MIC minting calculations.

**Format**: JSON

**Update Frequency**: Every 6 hours

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/economy/mii
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "mii": 0.97,
  "threshold": 0.95,
  "minting_active": true,
  "cycle": "C-151"
}
```

**Use Cases**:
- MIC minting calculations
- Integrity trend analysis
- Economic model validation
- Policy impact assessment

---

### 3. Coordination Scores

**Endpoint**: `GET /coordination`

**Description**: Average coordination score across all sentinels for reward calculation.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/economy/coordination
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "average_coordination": 0.92,
  "sentinels": [
    {
      "id": "ATLAS",
      "score": 0.95,
      "cathedral": "FOR-GOVERNMENTS"
    }
  ],
  "formula": "score = (0.4×apps + 0.3×packages + 0.2×workflows + 0.1×(10-drift)) × (1 + log(uptime))"
}
```

**Use Cases**:
- Reward calculation
- Coordination mechanism research
- Multi-agent economics
- Incentive design validation

---

### 4. Sentinel ROI Analysis

**Endpoint**: `GET /roi`

**Description**: Sentinel ROI analysis by cathedral with breakdown of rewards, costs, and efficiency metrics.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/economy/roi
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "by_cathedral": {
    "FOR-GOVERNMENTS": {
      "multiplier": 2.0,
      "total_rewards": 2000,
      "sentinel_count": 3,
      "average_roi": 1.85
    },
    "FOR-ECONOMISTS": {
      "multiplier": 1.5,
      "total_rewards": 1500,
      "sentinel_count": 3,
      "average_roi": 1.42
    }
  }
}
```

**Use Cases**:
- Economic efficiency analysis
- Cathedral multiplier validation
- Resource allocation optimization
- Policy impact assessment

---

### 5. MIC Minting History

**Endpoint**: `GET /mic-history.csv`

**Description**: Complete historical record of MIC minting since genesis with timestamps, amounts, and cycle information.

**Format**: CSV

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/economy/mic-history.csv
```

**Example Response**:
```csv
timestamp,cycle,sentinel,amount,cathedral,coordination_score
2025-12-01T00:00:00Z,C-151,ATLAS,100,FOR-GOVERNMENTS,0.95
2025-11-30T00:00:00Z,C-150,AUREA,85,FOR-ECONOMISTS,0.92
...
```

**Use Cases**:
- Historical trend analysis
- Economic modeling
- Time series research
- Long-term forecasting

---

### 6. Per-Sentinel ROI Breakdown

**Endpoint**: `GET /sentinel-roi.json`

**Description**: Detailed per-sentinel ROI breakdown with individual performance metrics.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/economy/sentinel-roi.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "sentinels": [
    {
      "id": "ATLAS",
      "cathedral": "FOR-GOVERNMENTS",
      "total_rewards": 666.67,
      "coordination_score": 0.95,
      "multiplier": 2.0,
      "roi": 1.90
    }
  ]
}
```

**Use Cases**:
- Individual sentinel analysis
- Performance optimization
- Resource allocation
- Economic efficiency studies

---

### 7. Cathedral Multiplier Timeline

**Endpoint**: `GET /cathedral-multipliers.csv`

**Description**: Historical timeline of cathedral multiplier changes for economic analysis.

**Format**: CSV

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/economy/cathedral-multipliers.csv
```

**Example Response**:
```csv
timestamp,cycle,cathedral,multiplier,reason
2025-12-01T00:00:00Z,C-151,FOR-GOVERNMENTS,2.0,compliance_overhead
2025-11-01T00:00:00Z,C-150,FOR-ECONOMISTS,1.5,economic_complexity
...
```

**Use Cases**:
- Policy impact analysis
- Multiplier effectiveness studies
- Economic history research
- Trend analysis

---

## Economic Models

### Logistic Reward Formula

The C-151 Coordination-Weighted MIC Economy uses a logistic coordination curve:

```
R = L / (1 + e^(-k*(s - x0))) × M_c
```

**Parameters**:
- `L` = 1000 (maximum reward)
- `k` = 0.05 (steepness)
- `x0` = 50 (inflection point)
- `M_c` = cathedral multiplier (1.0-2.0)
- `s` = coordination score

### Coordination Score Formula

```
score = (0.4×apps + 0.3×packages + 0.2×workflows + 0.1×(10-drift)) × (1 + log(uptime))
```

### MII Decay Formula

```
threshold = 95 - 2*log10(total_MIC/1e6)
```

**Full Documentation**: [MIC Coordination Economics](../docs/02-THEORETICAL-FOUNDATIONS/cathedrals/FOR-ECONOMISTS/MIC_COORDINATION.md)

---

## Rate Limits

| Tier | Limit | Description |
|------|-------|-------------|
| **Anonymous** | 100 requests/day | Public access without authentication |
| **Economist** | 2,000 requests/day | Requires economist verification |
| **Institutional** | Unlimited | Requires partnership agreement |

### Requesting Economist Access

1. Email `economics@mobius.systems` with:
   - Professional affiliation
   - Research purpose
   - Expected usage volume
2. Receive API key via email
3. Include `Authorization: Bearer <api_key>` header

---

## Contact & Support

- **Economic Research**: economics@mobius.systems
- **API Support**: api@mobius.systems
- **Partnerships**: partnerships@mobius.systems

---

## Related Documentation

- [Market Cathedral Overview](./README.md)
- [MIC Coordination Economics](../docs/02-THEORETICAL-FOUNDATIONS/cathedrals/FOR-ECONOMISTS/MIC_COORDINATION.md)
- [Economic Models](./ECONOMIC-MODELS/)
- [Complete API Specification](./endpoints.json)

---

**Mobius Systems Foundation** • Cycle C-151 • Market Cathedral
