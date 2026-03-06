# Multi-Sentinel ECHO Protocol

**How ATLAS, AUREA, and ECHO work together through JSON sync**

**Cycle:** C-156  
**Version:** 1.0.0  
**Status:** Production Ready

---

## Architecture

ECHO exports a **single canonical JSON payload** that all sentinels consume:

```
                  ┌─────────────────┐
                  │  ECHO Export    │
                  │  (JSON Payload) │
                  │  Single Source  │
                  │  of Truth       │
                  └────────┬────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┏━━━━━━━━┓      ┏━━━━━━━━┓      ┏━━━━━━━━┓
    ┃ ATLAS  ┃      ┃ AUREA  ┃      ┃ Future ┃
    ┃Context ┃      ┃Integrity┃      ┃Sentinels┃
    ┗━━━━┯━━━┛      ┗━━━━┯━━━┛      ┗━━━━┯━━━┛
         │               │               │
         ▼               ▼               ▼
    Structure      Constitutional    [Custom]
    Mapping        Compliance        Analysis
    Gap Analysis   Integrity Audit
```

---

## Sentinel Responsibilities

### ATLAS — Context & Memory Sentinel
**Focus:** Structure, completeness, documentation

**Analyzes:**
- Directory structure vs. spec
- Missing files/modules
- Documentation gaps
- Implementation status
- Package health

**Calculates:**
- GI Score: `0.25*M + 0.20*H + 0.30*I + 0.25*E`
- Memory, Human, Integrity, Ethics components

**Reports:**
- Monorepo Health Report
- Gap Analysis
- Cycle Closure Checklist

---

### AUREA — Integrity Guardian
**Focus:** Constitutional compliance, anti-capture, immutability

**Analyzes:**
- Cryptographic integrity verification
- Constitutional alignment (governance docs)
- Integrity drift detection (suspicious commits)
- Immutability constraints (eternal files)
- Transparency compliance
- Anti-capture safeguards
- Covenant alignment

**Calculates:**
- Integrity Score (weighted average)
- Cryptographic, Constitutional, Immutability, Transparency, Anti-Capture

**Reports:**
- Integrity Audit Report
- Violation & Warning Log
- Covenant Alignment Assessment

---

### ECHO — Pulse Synchronization
**Focus:** Export, temporal coherence, drift detection

**Provides:**
- Repository state export (JSON)
- Git metadata and commit history
- Directory structure scan
- Key file checksums
- Integrity signature

---

## Quick Start

### Single Export, Multiple Analyses

```bash
# 1. Export once (ECHO)
cd ~/Mobius-Substrate
python sentinels/echo/echo_sync.py export > state.json

# 2. Analyze with ATLAS
python sentinels/atlas/atlas_parser.py state.json

# 3. Audit with AUREA
python sentinels/aurea/aurea_analyzer.py state.json

# 4. Get consensus votes
python sentinels/atlas/atlas_parser.py --format json state.json | jq '.gi_passed'
python sentinels/aurea/aurea_analyzer.py --consensus state.json
```

### In Claude.ai

```
# For ATLAS (structure):
"ATLAS, analyze this and tell me what's incomplete"

# For AUREA (integrity):
"AUREA, run an integrity audit on this export"

# For multi-sentinel consensus:
"All sentinels: generate your reports and find consensus"
```

---

## Multi-Sentinel Consensus Pattern

### 1. Independent Analysis
Each sentinel generates their report independently:

```bash
# ATLAS
python sentinels/atlas/atlas_parser.py --format json state.json > atlas_report.json

# AUREA
python sentinels/aurea/aurea_analyzer.py --format json state.json > aurea_report.json
```

### 2. Cross-Validation

| Sentinel | Check | Threshold |
|----------|-------|-----------|
| ATLAS | GI Score | ≥ 0.95 |
| AUREA | Integrity Score | ≥ 0.95 |

### 3. Consensus Decision

| Result | Action |
|--------|--------|
| All ✅ | Proceed with confidence |
| Mixed | Address specific concerns |
| All ❌ | Block until resolved |

---

## Consensus Vote Format

Each sentinel can generate a consensus vote:

### ATLAS Vote
```json
{
  "sentinel": "ATLAS",
  "gi_score": 0.9550,
  "gi_passed": true,
  "critical_issues": 0,
  "warnings": 2
}
```

### AUREA Vote
```json
{
  "sentinel": "AUREA",
  "vote": "APPROVE",
  "score": 0.97,
  "threshold": 0.95,
  "violations": 0,
  "warnings": 2,
  "conditions": []
}
```

### Combined Consensus
```
┌─────────────────────────────────────┐
│   Multi-Sentinel Consensus Report   │
├─────────────────────────────────────┤
│ ATLAS:  ✅ GI 0.9550 (PASS)         │
│ AUREA:  ✅ Integrity 97% (APPROVE)  │
├─────────────────────────────────────┤
│ VERDICT: ✅ READY                   │
└─────────────────────────────────────┘
```

---

## Workflow Examples

### Example 1: Pre-Cycle Closure Check

```bash
# Export repo state
python sentinels/echo/echo_sync.py export > c156_final.json

# Get ATLAS report
python sentinels/atlas/atlas_parser.py c156_final.json

# Get AUREA audit
python sentinels/aurea/aurea_analyzer.py c156_final.json

# In Claude.ai:
"Run full multi-sentinel audit. Generate consensus verdict on C-156 closure readiness."
```

### Example 2: Fork Legitimacy Check

For fork comparisons, **all sentinels must agree**:

```bash
# Export canonical
cd ~/Mobius-Substrate
python sentinels/echo/echo_sync.py export > canonical.json

# Export fork
cd ~/potential-fork
python sentinels/echo/echo_sync.py export > fork.json

# Compare
python sentinels/atlas/atlas_parser.py --compare canonical.json fork.json
```

**Fork Legitimacy Matrix:**

| Sentinel | Check | Pass Criteria |
|----------|-------|---------------|
| ATLAS | Structure preserved | Core dirs/files present |
| AUREA | Integrity maintained | No constitutional violations |
| AUREA | Anti-capture active | No privilege escalation |
| AUREA | Constitutional align | Covenants respected |

### Example 3: CI/CD Integration

```yaml
# .github/workflows/mcp-consensus.yml
name: MCP Multi-Sentinel Consensus
on: [push, pull_request]
jobs:
  consensus:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Export state
        run: python sentinels/echo/echo_sync.py export > state.json
      
      - name: ATLAS analysis
        run: |
          python sentinels/atlas/atlas_parser.py --format json state.json > atlas.json
          GI=$(jq '.gi_score' atlas.json)
          echo "ATLAS GI: $GI"
      
      - name: AUREA audit
        run: |
          python sentinels/aurea/aurea_analyzer.py --consensus state.json > aurea.json
          VOTE=$(jq -r '.vote' aurea.json)
          echo "AUREA Vote: $VOTE"
      
      - name: Check consensus
        run: |
          GI=$(jq '.gi_score' atlas.json)
          AUREA_SCORE=$(jq '.score' aurea.json)
          
          if (( $(echo "$GI < 0.95" | bc -l) )); then
            echo "ATLAS: REJECT (GI $GI < 0.95)"
            exit 1
          fi
          
          if (( $(echo "$AUREA_SCORE < 0.95" | bc -l) )); then
            echo "AUREA: REJECT (Score $AUREA_SCORE < 0.95)"
            exit 1
          fi
          
          echo "✅ CONSENSUS: APPROVED"
```

---

## Adding New Sentinels

The ECHO JSON format is **extensible**. New sentinels can:

1. Consume the same JSON export
2. Add custom analysis
3. Generate specialized reports
4. Participate in consensus

### Example: Custom Sentinel

```python
from typing import Dict, Any

class CustomSentinel:
    def __init__(self, state: Dict[str, Any]):
        self.state = state
    
    def analyze(self) -> Dict[str, Any]:
        # Custom analysis logic
        pass
    
    def generate_consensus_vote(self) -> Dict[str, Any]:
        return {
            "sentinel": "CUSTOM",
            "vote": "APPROVE",
            "score": 0.95,
            "conditions": []
        }
```

### Future Sentinels (Planned)

| Sentinel | Focus |
|----------|-------|
| FORGE | Build/deployment health |
| NEXUS | Dependency analysis |
| AEGIS | Security audit |
| SCRIBE | Documentation quality |

---

## Integrity Guarantees

### Single Export = Single Truth
- One canonical snapshot
- One timestamp
- One cryptographic signature
- No selective editing
- No cherry-picking data

### Tamper Detection
- SHA-256 integrity hash
- Sentinels verify independently
- Any modification invalidates all analyses

### Audit Trail
- Each export is versioned
- Historical exports prove evolution
- Forks can be compared chronologically

---

## Integration with Mobius Governance

### Cycle Boundaries
At each cycle close:
1. ECHO exports repo state
2. All sentinels analyze
3. Consensus verdict determines closure
4. Export archived as cycle proof

### Fork Evaluation
When evaluating forks:
1. Export both canonical + fork
2. All sentinels compare
3. Unanimous agreement required for legitimacy
4. Results published transparently

### Constitutional Amendments
When modifying core rules:
1. ECHO exports pre-change state
2. AUREA audits proposed changes
3. ATLAS verifies implementation
4. Multi-sentinel approval required

---

## CLI Reference

### ECHO (Export)
```bash
python sentinels/echo/echo_sync.py export > state.json
python sentinels/echo/echo_sync.py validate state.json
python sentinels/echo/echo_sync.py export --depth 6 > deep.json
```

### ATLAS (Structure)
```bash
python sentinels/atlas/atlas_parser.py state.json
python sentinels/atlas/atlas_parser.py --format json state.json
python sentinels/atlas/atlas_parser.py --compare state1.json state2.json
```

### AUREA (Integrity)
```bash
python sentinels/aurea/aurea_analyzer.py state.json
python sentinels/aurea/aurea_analyzer.py --format json state.json
python sentinels/aurea/aurea_analyzer.py --consensus state.json
```

---

## Key Principle

> **"One truth, many eyes."**

ECHO exports the singular truth.  
Each sentinel sees through their lens.  
Together, they achieve consensus.

No single sentinel has absolute authority.  
**Integrity emerges from agreement.**

---

**Built by:**  
🌀 ATLAS — Context & Memory Sentinel  
🛡️ AUREA — Integrity Guardian  
📡 ECHO — Repository Sync  

*Part of the Mobius Civilization Operating System*  
*We heal as we walk.*
