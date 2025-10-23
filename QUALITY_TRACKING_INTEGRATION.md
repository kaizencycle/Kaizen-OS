# Quality Tracking Integration Guide

This document explains how to integrate the anti-slop quality tracking system into your OAA workflow.

## Overview

The quality tracking system implements the "AI slop" prevention strategy through:

1. **Provenance-by-default**: Every output is tracked with source attribution
2. **Memory hygiene**: Schema validation and quarantine for malformed data
3. **Human-in-the-loop**: Multi-agent cross-checks and Copilot verification
4. **Incentive alignment**: Quality gates tied to GIC rewards
5. **Retrieval grounding**: Beaconed objects with verifiable metadata

## Environment Setup

### OAA-API-Library (.env)

```bash
# Copy from .env.template.oaa-api-library
cp .env.template.oaa-api-library .env

# Required for quality tracking
QUALITY_METRICS_ENABLED=true
QUALITY_METRICS_RETENTION_DAYS=30
```

### Lab7-proof (OAA Hub) (.env.local)

```bash
# Copy from .env.template.lab7-proof
cp .env.template.lab7-proof .env.local

# Required for quality tracking
QUALITY_METRICS_ENABLED=true
```

## API Integration

### Recording Outputs

When your system produces outputs, record them for quality tracking:

```python
import requests
import json

def record_output(output_data, has_provenance=False, sources=None, is_duplicate=False):
    """Record an output for quality tracking."""
    payload = {
        "output_data": output_data,
        "has_provenance": has_provenance,
        "sources": sources or [],
        "is_duplicate": is_duplicate,
        "is_quarantined": False,
        "beacon_valid": True
    }
    
    response = requests.post(
        "https://oaa-api-library.onrender.com/dev/quality/record-output",
        json=payload
    )
    return response.json()

# Example usage
output = {
    "type": "reflection",
    "content": "User provided feedback on the system",
    "timestamp": "2025-01-14T10:00:00Z"
}

record_output(
    output_data=output,
    has_provenance=True,
    sources=["user_input", "system_logs"],
    is_duplicate=False
)
```

### Recording Copilot Overlap

Track how well Copilot suggestions align with actual changes:

```python
def record_copilot_overlap(pr_id, overlap_score):
    """Record Copilot overlap score for a PR."""
    payload = {
        "pr_id": pr_id,
        "overlap_score": overlap_score  # 0.0 to 1.0
    }
    
    response = requests.post(
        "https://oaa-api-library.onrender.com/dev/quality/record-copilot-overlap",
        json=payload
    )
    return response.json()

# Example: PR with 75% overlap
record_copilot_overlap("pr-123", 0.75)
```

### Recording Rollbacks

Track when outputs are rolled back due to quality issues:

```python
def record_rollback(reason, output_hash=None):
    """Record a rollback event."""
    payload = {
        "reason": reason,
        "output_hash": output_hash
    }
    
    response = requests.post(
        "https://oaa-api-library.onrender.com/dev/quality/record-rollback",
        json=payload
    )
    return response.json()

# Example: Rollback due to hallucination
record_rollback("hallucination_detected", "abc123...")
```

## Quality Metrics

### Current Metrics

Access current quality status:

```bash
curl https://oaa-api-library.onrender.com/dev/quality/
```

Response includes:
- **Health Score**: Overall quality (0.0 to 1.0)
- **Provenance Coverage**: % of outputs with source attribution
- **Hallucination Rate**: % of outputs without sources
- **Duplicate Ratio**: % of duplicate outputs
- **Beacon Validity**: % of valid beacon metadata
- **Copilot Overlap**: Average overlap with Copilot suggestions
- **Rollback Rate**: % of outputs that were rolled back

### Historical Metrics

Get historical data for trend analysis:

```bash
curl "https://oaa-api-library.onrender.com/dev/quality/historical?hours=24"
```

## Quality Dashboard

Access the visual dashboard at:
- **Development**: `http://localhost:3000/quality-dashboard`
- **Production**: `https://your-hub-domain.com/quality-dashboard`

The dashboard shows:
- Real-time quality metrics
- Target vs actual performance
- Anti-slop status indicators
- Historical trends

## Integration Points

### 1. E.O.M.M. Ingest

When ingesting reflections, record quality metrics:

```python
def ingest_reflection(reflection_data):
    # Process reflection
    processed = process_reflection(reflection_data)
    
    # Record for quality tracking
    record_output(
        output_data=processed,
        has_provenance=True,
        sources=["eomm_ingest", "user_reflection"],
        is_duplicate=check_duplicate(processed)
    )
    
    return processed
```

### 2. Beacon Validation

When validating beacons, track validity:

```python
def validate_beacon(beacon_data):
    is_valid = validate_beacon_schema(beacon_data)
    
    record_output(
        output_data=beacon_data,
        has_provenance=True,
        sources=["beacon_validation"],
        beacon_valid=is_valid
    )
    
    return is_valid
```

### 3. Copilot Verification

When verifying Copilot suggestions:

```python
def verify_copilot_suggestion(suggestion, actual_change):
    overlap = calculate_overlap(suggestion, actual_change)
    
    record_copilot_overlap(
        pr_id=actual_change.get("pr_id"),
        overlap_score=overlap
    )
    
    return overlap > 0.5  # Quality gate
```

## Quality Gates

### Soft Gates (Visibility)

Start with soft gates that show warnings but don't block:

```python
def check_quality_gates(output_data):
    issues = []
    
    if not output_data.get("sources"):
        issues.append("Missing provenance")
    
    if output_data.get("is_duplicate"):
        issues.append("Potential duplicate")
    
    if issues:
        logger.warning(f"Quality issues: {issues}")
        # Continue processing but flag
    
    return len(issues) == 0
```

### Hard Gates (Blocking)

Once stable, implement hard gates:

```python
def enforce_quality_gates(output_data):
    if not output_data.get("sources"):
        raise ValueError("Output blocked: Missing provenance")
    
    if output_data.get("is_duplicate"):
        raise ValueError("Output blocked: Duplicate detected")
    
    return True
```

## Monitoring and Alerts

### Health Check

Monitor system health:

```bash
curl https://oaa-api-library.onrender.com/dev/quality/health
```

### Prometheus Integration

Export metrics to Prometheus:

```python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
outputs_total = Counter('oaa_outputs_total', 'Total outputs processed')
provenance_coverage = Gauge('oaa_provenance_coverage', 'Provenance coverage ratio')
hallucination_rate = Gauge('oaa_hallucination_rate', 'Hallucination rate')

# Update metrics
def update_metrics(metrics_data):
    provenance_coverage.set(metrics_data['provenance_coverage'])
    hallucination_rate.set(metrics_data['hallucination_rate'])
```

## Best Practices

1. **Enable Early**: Turn on quality tracking from day one
2. **Start Soft**: Begin with visibility, then add hard gates
3. **Monitor Trends**: Watch for degradation over time
4. **Human Review**: Regularly review quarantined items
5. **Iterate**: Adjust targets based on system performance

## Troubleshooting

### Common Issues

1. **Metrics Not Updating**: Check `QUALITY_METRICS_ENABLED=true`
2. **Dashboard Not Loading**: Verify `NEXT_PUBLIC_OAA_BASE` is correct
3. **High Rollback Rate**: Review quality gates and thresholds
4. **Low Copilot Overlap**: Check PR verification process

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=DEBUG
export QUALITY_DEBUG=true
```

## Next Steps

1. Deploy the quality tracking system
2. Integrate with your existing workflows
3. Monitor metrics for 1-2 weeks
4. Adjust targets based on baseline
5. Implement hard gates once stable
6. Set up alerts for quality degradation