# DelibProof Consensus Wrapper

Multi-agent consensus validation library for Kaizen OS.

## Purpose

DelibProof provides a standardized way to:
- Query multiple sentinels (LLM agents) for consensus
- Aggregate approval scores with configurable thresholds
- Perform quick static checks before consulting sentinels
- Support weighted consensus for different sentinel trust levels

## Usage

```python
from shared.delibproof import verdict, ask_all, quick_check

# Quick static check
result = quick_check(payload)
if result["ok"] is False:
    # Block immediately
    return False

# Query sentinels
approvals = await ask_all(sentinel_urls, case)
consensus = verdict(approvals, min_agree=0.90)

if consensus["ok"]:
    # Proceed with action
    pass
```

## Components

- `core.py` - Consensus calculation logic
- `adapters/sentinel_http.py` - HTTP client for sentinel endpoints
- `adapters/local_rules.py` - Static rule-based checks

## Integration

Import in Gatekeeper or any service requiring multi-agent validation:

```python
from shared.delibproof import consensus_threshold
from shared.delibproof.adapters.sentinel_http import ask_all

approvals = await ask_all(sentinel_urls, request_payload)
if consensus_threshold(approvals, threshold=0.90):
    # Consensus reached
    execute_action()
```
