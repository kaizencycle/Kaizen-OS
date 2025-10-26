# Integrity-Based Reward Engine (GIC v1.0)

A deterministic reward system designed to minimize AI slop and drift by tying rewards to truth, symbiosis, verification, and novelty rather than raw token output.

## Overview

The GIC (Genuine Integrity Currency) Reward Engine evaluates human-AI collaboration based on:

- **Truth (40%)**: Grounded, cited statements with verifiable evidence
- **Symbiosis (30%)**: Balanced mutual contribution between human and AI
- **Verification (20%)**: Ledger seals, signatures, and automated test compliance
- **Novelty (10%)**: Meaningful differentiation from recent content

## Penalties

The system applies penalties to cut through AI slop:

- **Entropy (30%)**: Internal contradictions and ambiguity
- **Duplication (50%)**: Near-duplicate content or code
- **Policy Violation (100%)**: Immediate veto for unsafe/forbidden actions
- **Drift Anomaly (60%)**: Behavior shift from established baseline

## Quick Start

### 1. Basic Usage

```python
from core.rewards.integrity_engine import evaluate_reward, load_manifest

# Load the reward manifest
manifest = load_manifest("core/rewards/manifest.json")

# Create a payload
payload = {
    "human_statement": "I need help with authentication...",
    "agent_statement": "I'll help you implement secure auth...",
    "evidence": {
        "citations": ["https://owasp.org/..."],
        "observations": ["security_scan:passed@2024-01-15T10:30:00Z"],
        "artifacts": ["commit_sha", "pr_id"]
    },
    "task_type": "reflection",
    "nonce": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T10:30:00Z"
}

# Evaluate reward
result = evaluate_reward(payload, manifest)
print(f"GIC Reward: {result['GIC']}")
print(f"Integrity Score: {result['integrity']}")
```

### 2. CI Integration

The system includes a CI gate that automatically checks content quality:

```bash
# Run integrity check on all content files
python scripts/integrity_check.py --verbose

# Check specific files
python scripts/integrity_check.py --files README.md core/rewards/integrity_engine.py

# Custom thresholds
python scripts/integrity_check.py --min-truth 0.8 --min-symbiosis 0.7
```

### 3. GitHub Actions

The integrity check runs automatically on PRs and pushes to main branches. See `.github/workflows/integrity-reward-gate.yml` for configuration.

## File Structure

```
core/rewards/
├── manifest.json          # Reward algorithm configuration
├── integrity_engine.py    # Core scoring engine
└── README.md             # This documentation

scripts/
├── integrity_check.py     # CI/CD integrity checker
└── sample_payload.json   # Example payload for testing

.github/workflows/
└── integrity-reward-gate.yml  # GitHub Actions workflow
```

## Configuration

### Manifest Settings

Key configuration options in `manifest.json`:

```json
{
  "scoring": {
    "weights": {
      "truth": 0.4,        // Weight for truth scoring
      "symbiosis": 0.3,    // Weight for symbiosis scoring
      "verification": 0.2, // Weight for verification scoring
      "novelty": 0.1       // Weight for novelty scoring
    },
    "penalties": {
      "entropy": 0.3,           // Entropy penalty weight
      "duplication": 0.5,       // Duplication penalty weight
      "policy_violation": 1.0,  // Policy violation penalty (veto)
      "drift_anomaly": 0.6      // Drift anomaly penalty weight
    }
  },
  "issuance": {
    "base": 10,              // Base GIC amount
    "split": {
      "human": 0.5,          // Human share of reward
      "agent_pool": 0.5      // Agent pool share of reward
    }
  }
}
```

### CI Thresholds

Default integrity check thresholds:

- **Min Truth**: 0.7 (70% of max truth score)
- **Min Symbiosis**: 0.6 (60% of max symbiosis score)
- **Max Entropy**: 0.4 (40% of max entropy penalty)
- **Min Novelty**: 0.15 (15% of max novelty score)
- **Drift Threshold**: 0.35 (35% of max drift anomaly)

## Scoring Details

### Truth Scoring

Evaluates evidence quality and citation credibility:

- **Citations (0-0.6)**: Valid URLs and hashes
- **Observations (0-0.3)**: Structured metrics with timestamps
- **Artifacts (0-0.1)**: Commit SHAs, PR IDs, run IDs

### Symbiosis Scoring

Measures balanced human-AI contribution:

- **Balance Ratio (0-0.6)**: Content length balance between human and agent
- **Content Overlap (0-0.4)**: Optimal overlap range (20-60%)

### Verification Scoring

Checks compliance and format validity:

- **Required Fields (0-0.4)**: Presence of nonce, timestamp, statements
- **Nonce Format (0-0.2)**: Valid UUID format
- **Timestamp Format (0-0.2)**: Valid ISO8601 format
- **Task Type (0-0.2)**: Valid task type classification

### Novelty Scoring

Assesses content uniqueness:

- **Character Diversity**: Unique character ratio
- **Word Diversity**: Unique word ratio
- **Reference Comparison**: Differentiation from recent content

## Anti-Abuse Measures

### Rate Limiting

- **Per Actor**: 12 submissions per 24 hours
- **Per Repository**: 60 submissions per 24 hours

### Uniqueness Checks

- **Min Embedding Distance**: 0.22 (22% similarity threshold)
- **Min Code Diff Ratio**: 0.08 (8% code change threshold)

### Drift Control

- **Behavior Tests**: Policy guard, prompt consistency, output contract
- **Reference Vectors**: Baseline embedding comparison
- **Tripwires**: Embedding shift >35%, policy delta >15%, toxicity/PII detection

## Integration Examples

### OAA Hub Integration

```python
# In your OAA reflection handler
from core.rewards.integrity_engine import evaluate_reward, load_manifest

def handle_reflection_complete(reflection_data):
    manifest = load_manifest("core/rewards/manifest.json")
    result = evaluate_reward(reflection_data, manifest)
    
    if result["GIC"] > 0:
        # Issue GIC reward
        issue_gic_reward(result["splits"])
        # Log to ledger
        log_to_ledger(result["seal"], result)
    
    return result
```

### Ledger Integration

```python
# Log CO-LEARN_EVENT to ledger
def log_to_ledger(seal, result):
    ledger_entry = {
        "event": "CO-LEARN_EVENT",
        "seal": seal,
        "scores": result["scores"],
        "penalties": result["penalties"],
        "GIC": result["GIC"],
        "splits": result["splits"],
        "timestamp": result["timestamp"]
    }
    # Write to your ledger system
    write_to_ledger(ledger_entry)
```

## Testing

### Sample Payload

Use `scripts/sample_payload.json` as a template for testing:

```bash
# Test with sample payload
python core/rewards/integrity_engine.py scripts/sample_payload.json

# Test with custom manifest
python core/rewards/integrity_engine.py scripts/sample_payload.json custom_manifest.json
```

### CI Testing

```bash
# Dry run to see what would be checked
python scripts/integrity_check.py --dry-run --verbose

# Test specific thresholds
python scripts/integrity_check.py --min-truth 0.5 --max-entropy 0.6
```

## Troubleshooting

### Common Issues

1. **Low Truth Score**: Add more citations and evidence
2. **Low Symbiosis Score**: Balance human and AI contribution
3. **High Entropy Penalty**: Resolve contradictions and ambiguities
4. **High Duplication Penalty**: Make content more original
5. **Drift Anomaly**: Align AI behavior with expected patterns

### Debug Mode

Enable verbose output for detailed scoring:

```bash
python scripts/integrity_check.py --verbose
```

## Contributing

When modifying the reward engine:

1. Update tests to reflect changes
2. Adjust CI thresholds if needed
3. Update documentation
4. Test with sample payloads
5. Consider backward compatibility

## License

Part of the lab7-proof OAA system. See main repository license.

