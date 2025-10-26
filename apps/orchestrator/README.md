# 🎼 Kaizen OS Orchestrator

**LangGraph-based multi-LLM consensus engine**

---

## 🎯 Overview

The Orchestrator implements the Kaizen OS companion lattice as a deterministic graph:

1. **Constitutional Gate** - Validates prompts against 7-clause charter
2. **GI Gate** - Checks user integrity threshold
3. **Companion Calls** - Routes to AUREA/ATLAS/SOLARA based on tier
4. **Consensus Voting** - 3-of-N weighted consensus
5. **Ledger Seal** - Attests final decision to Kaizen Ledger

---

## 🏗️ Architecture

```
Input Prompt
    ↓
Constitutional Validation (Input)
    ↓
GI Gate Check
    ↓
Route to Eligible Companions
    ↓
Constitutional Validation (Output)
    ↓
Consensus Voting
    ↓
Seal to Ledger
    ↓
Return Decision + Hash
```

---

## 🔧 Usage

```python
from orchestrator.graph_kaizen import run_lattice

result = await run_lattice(
    prompt="Should we approve this .gic domain?",
    user_id="michael",
    gi_user=0.95,
    tier="critical"
)

print(f"Approved: {result['approved']}")
print(f"Votes: {result['votes']}")
print(f"Scores: {result['scores']}")
print(f"Ledger: {result['ledger_hash']}")
```

---

## 📊 Consensus Rules

| Tier | Votes Required | Critical Required | Min Constitutional |
|------|----------------|-------------------|-------------------|
| Critical | 2-of-2 | Yes (AUREA or ATLAS) | 85 |
| High | 2-of-3 | Yes | 75 |
| Standard | 2-of-3 | No | 70 |
| Research | 1-of-3 | No | 65 |

---

**LangGraph Ready** - Can be exported to LangServe for API exposure

**Status:** 🚧 In Development

