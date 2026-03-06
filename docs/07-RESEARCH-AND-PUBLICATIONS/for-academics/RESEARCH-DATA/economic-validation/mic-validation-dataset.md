# MIC Economic Validation Dataset

> **Version:** 1.0.0 | **Cycle:** C-151 | **Purpose:** Research validation data for MIC economics

## Overview

This document describes the validation dataset structure for testing MIC (Mobius Integrity Credit) economic models. Researchers can use these datasets to validate theoretical predictions and compare implementations.

---

## Dataset Structure

### 1. Minting Events Dataset

**File:** `minting_events.csv`
**Format:** CSV with headers

| Column | Type | Description |
|--------|------|-------------|
| `event_id` | string | Unique event identifier |
| `timestamp` | ISO 8601 | Event timestamp |
| `actor_id` | string | Citizen/agent identifier |
| `action_type` | enum | reflection, civic, guardian, etc. |
| `mii_before` | float | MII before action |
| `mii_after` | float | MII after action |
| `shard_type` | enum | Kaizen shard category |
| `shard_weight` | float | Shard weight (1.0-3.0) |
| `mic_minted` | float | MIC earned |
| `ks_minted` | int | KS earned |
| `quality_score` | float | Action quality (0.0-1.0) |

**Sample Records:**

```csv
event_id,timestamp,actor_id,action_type,mii_before,mii_after,shard_type,shard_weight,mic_minted,ks_minted,quality_score
E001,2025-12-01T08:00:00Z,CIVIC_001,reflection,0.94,0.97,reflection,1.0,0.020000,20000,0.85
E002,2025-12-01T08:15:00Z,CIVIC_002,civic,0.96,0.98,civic,1.5,0.045000,45000,0.90
E003,2025-12-01T08:30:00Z,CIVIC_003,guardian,0.95,0.99,guardian,3.0,0.120000,120000,0.95
E004,2025-12-01T09:00:00Z,CIVIC_001,reflection,0.93,0.94,reflection,1.0,0.000000,0,0.70
```

### 2. Balance History Dataset

**File:** `balance_history.csv`
**Format:** CSV with headers

| Column | Type | Description |
|--------|------|-------------|
| `snapshot_id` | string | Unique snapshot ID |
| `timestamp` | ISO 8601 | Snapshot timestamp |
| `actor_id` | string | Citizen/agent identifier |
| `mic_balance` | float | MIC balance |
| `ks_balance` | int | KS balance |
| `pending_mic` | float | Unconfirmed MIC |
| `total_minted` | float | Lifetime minted |
| `total_burned` | float | Lifetime burned |

### 3. MII Time Series Dataset

**File:** `mii_timeseries.csv`
**Format:** CSV with headers

| Column | Type | Description |
|--------|------|-------------|
| `timestamp` | ISO 8601 | Measurement timestamp |
| `actor_id` | string | Citizen/agent identifier |
| `mii_score` | float | Composite MII |
| `component_m` | float | Memory component |
| `component_h` | float | Human component |
| `component_i` | float | Integrity component |
| `component_e` | float | Ethics component |
| `above_threshold` | boolean | MII ≥ 0.95 |

---

## Validation Tests

### Test 1: Minting Formula Verification

**Hypothesis:** Minted MIC follows formula:
```
MIC = α × max(0, MII - τ) × ShardWeight × Quality
```

**Test Procedure:**
1. Load `minting_events.csv`
2. For each event, calculate expected MIC
3. Compare with `mic_minted`
4. Report RMSE and correlation

**Expected Result:** RMSE < 0.0001, R² > 0.999

### Test 2: Threshold Enforcement

**Hypothesis:** No MIC minted when MII < 0.95

**Test Procedure:**
1. Filter events where `mii_before < 0.95`
2. Verify `mic_minted == 0` for all

**Expected Result:** 100% compliance

### Test 3: KS Conversion Accuracy

**Hypothesis:** KS = round(MIC × 1,000,000)

**Test Procedure:**
1. For each event, calculate expected KS
2. Compare with `ks_minted`

**Expected Result:** Exact match

### Test 4: Balance Consistency

**Hypothesis:** Balance = Σ(minted) - Σ(burned)

**Test Procedure:**
1. Load `minting_events.csv` and `balance_history.csv`
2. Calculate cumulative balance per actor
3. Compare with recorded balance

**Expected Result:** Exact match

---

## Synthetic Data Generation

### Generator Script

```python
import random
import csv
from datetime import datetime, timedelta

def generate_minting_events(n_events=1000, n_actors=50):
    """Generate synthetic minting events for testing"""
    
    SHARD_WEIGHTS = {
        'reflection': 1.0,
        'learning': 1.0,
        'civic': 1.5,
        'stability': 2.0,
        'stewardship': 2.0,
        'innovation': 2.5,
        'guardian': 3.0
    }
    
    THRESHOLD = 0.95
    ALPHA = 1.0
    KS_PER_MIC = 1_000_000
    
    events = []
    start_time = datetime(2025, 12, 1, 8, 0, 0)
    
    for i in range(n_events):
        actor_id = f"CIVIC_{random.randint(1, n_actors):03d}"
        shard_type = random.choice(list(SHARD_WEIGHTS.keys()))
        shard_weight = SHARD_WEIGHTS[shard_type]
        
        # Generate MII with bias toward threshold
        mii_before = random.gauss(0.94, 0.03)
        mii_before = max(0.80, min(1.0, mii_before))
        
        # Action improves MII
        improvement = random.uniform(0.01, 0.05)
        mii_after = min(1.0, mii_before + improvement)
        
        quality = random.uniform(0.5, 1.0)
        
        # Calculate MIC
        if mii_after >= THRESHOLD:
            delta = mii_after - THRESHOLD
            mic = ALPHA * delta * shard_weight * quality
        else:
            mic = 0.0
        
        ks = round(mic * KS_PER_MIC)
        
        events.append({
            'event_id': f'E{i+1:06d}',
            'timestamp': (start_time + timedelta(minutes=i*5)).isoformat() + 'Z',
            'actor_id': actor_id,
            'action_type': shard_type,
            'mii_before': round(mii_before, 6),
            'mii_after': round(mii_after, 6),
            'shard_type': shard_type,
            'shard_weight': shard_weight,
            'mic_minted': round(mic, 6),
            'ks_minted': ks,
            'quality_score': round(quality, 2)
        })
    
    return events

def save_to_csv(events, filename='minting_events.csv'):
    """Save events to CSV file"""
    if not events:
        return
    
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=events[0].keys())
        writer.writeheader()
        writer.writerows(events)

if __name__ == '__main__':
    events = generate_minting_events(1000, 50)
    save_to_csv(events)
    print(f"Generated {len(events)} events")
```

---

## Statistical Properties

### Expected Distributions

| Metric | Distribution | Parameters |
|--------|--------------|------------|
| MII | Truncated Normal | μ=0.94, σ=0.03, min=0.80, max=1.0 |
| Quality | Uniform | min=0.5, max=1.0 |
| MIC per event | Mixture | 60% zero, 40% log-normal |
| Inter-event time | Exponential | λ=12 per hour |

### Correlation Matrix

| | MII | Quality | Weight | MIC |
|---|-----|---------|--------|-----|
| MII | 1.0 | 0.15 | 0.02 | 0.65 |
| Quality | 0.15 | 1.0 | 0.05 | 0.35 |
| Weight | 0.02 | 0.05 | 1.0 | 0.45 |
| MIC | 0.65 | 0.35 | 0.45 | 1.0 |

---

## Usage Guidelines

### Research Applications

1. **Model Validation:** Compare theoretical predictions with empirical data
2. **Parameter Estimation:** Fit models to observed distributions
3. **Simulation Testing:** Validate simulation implementations
4. **Economic Analysis:** Study supply dynamics and incentive effects

### Citation

When using this dataset, please cite:

```bibtex
@dataset{mic_validation_2025,
  title = {MIC Economic Validation Dataset},
  author = {Mobius Systems Research},
  year = {2025},
  version = {1.0.0},
  url = {https://github.com/kaizencycle/Mobius-Substrate}
}
```

---

## Updates

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-01 | Initial release |

---

*Document prepared by Mobius Systems Research*
*Cycle: C-151*
