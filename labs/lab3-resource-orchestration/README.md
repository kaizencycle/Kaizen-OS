# Lab 3 — Resource Orchestration

**Purpose:** Allocate compute, energy, supply chains, financial flows, labor markets, and maintenance resources across the Kaizen OS federation.

**Spec:** See `docs/architecture/Lab3_Resource_Orchestration_Specification.md` and `docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md`

---

## Overview

Lab 3 provides the **economic and resource substrate** for Kaizen OS. It orchestrates:

1. **Compute Allocation** — Multi-provider AI query routing (Anthropic, OpenAI, Google, DeepSeek, local)
2. **Energy Routing** — Grid-aware renewable energy optimization (planned)
3. **Supply Chain** — Logistics and material flow coordination (planned)
4. **Financial Flows** — GIC transfers, settlements, PublicGoodsPool grants
5. **Labor Market** — Skills matching and gig coordination (planned)
6. **Maintenance** — Predictive maintenance for physical infrastructure (planned)

This lab serves as the **backend for Lab 2 (Thought Broker)** compute requests and **integrates with Lab 5 (Humanities & Healthcare)** for ethical constraint enforcement.

---

## Architecture

```
labs/lab3-resource-orchestration/
├── compute-allocation/
│   └── orchestrator.py          # Multi-provider compute routing
├── energy-routing/              # Renewable energy optimization (planned)
├── supply-chain/                # Logistics coordination (planned)
├── financial-flows/
│   └── manager.py               # GIC transfers & PublicGoodsPool
├── labor-market/                # Skills matching (planned)
├── maintenance/                 # Predictive maintenance (planned)
├── api/
│   └── routes.py                # FastAPI endpoints
├── tests/
│   └── test_orchestration.py   # Integration tests
└── schemas/
    └── allocation.schema.json   # Request/response schemas
```

---

## Module 1: Compute Allocation

**File:** `compute-allocation/orchestrator.py`

### Purpose
Routes AI queries to the optimal provider based on:
- **Cost** (GIC per 1K tokens)
- **Latency** (milliseconds)
- **Quality** (model capability score 0-1)
- **Reliability** (uptime percentage)
- **Citizen quota** (monthly GIC budget)

### Providers

| Provider | Cost (GIC/1K) | Latency (ms) | Quality | Reliability | Max Context |
|----------|---------------|--------------|---------|-------------|-------------|
| **Anthropic Claude** | 0.015 | 600 | 0.97 | 99% | 200K tokens |
| **OpenAI GPT-4** | 0.010 | 800 | 0.95 | 98% | 128K tokens |
| **Google Gemini** | 0.008 | 700 | 0.92 | 97% | 1M tokens |
| **DeepSeek** | 0.002 | 1200 | 0.88 | 95% | 64K tokens |
| **Local Llama** | 0.0001 | 2500 | 0.80 | 99% | 32K tokens |

### Priority Modes

```python
class Priority(Enum):
    standard = "standard"    # Balance cost, latency, quality
    cost_optimized = "cost_optimized"  # Prefer cheapest
    latency_optimized = "latency_optimized"  # Prefer fastest
    quality_optimized = "quality_optimized"  # Prefer best model
```

### Scoring Algorithm

```python
def _score_and_select(providers, priority, tokens):
    weights = {
        "standard": {"cost": 0.4, "latency": 0.3, "quality": 0.2, "reliability": 0.1},
        "cost_optimized": {"cost": 0.7, "latency": 0.1, "quality": 0.1, "reliability": 0.1},
        "latency_optimized": {"cost": 0.1, "latency": 0.7, "quality": 0.1, "reliability": 0.1},
        "quality_optimized": {"cost": 0.1, "latency": 0.1, "quality": 0.7, "reliability": 0.1}
    }

    for provider in providers:
        score = (
            (1 - normalized_cost) * w["cost"] +
            (1 - normalized_latency) * w["latency"] +
            quality * w["quality"] +
            reliability * w["reliability"]
        )
```

### Quota Management

- **Default quota:** 100 GIC per citizen per month
- **Quota tracking:** Per-DID consumption ledger
- **Fallback:** When quota exhausted, route to `local_llama` (near-zero cost)

### Usage Example

```python
from compute_allocation.orchestrator import ORCHESTRATOR, Priority

allocation = ORCHESTRATOR.allocate(
    citizen_did="did:kaizen:alice",
    query_tokens=5000,
    priority=Priority.quality_optimized,
    min_quality=0.90,
    max_cost_gic=0.10
)

print(f"Provider: {allocation.provider}")
print(f"Estimated cost: {allocation.estimated_cost} GIC")
print(f"Estimated latency: {allocation.estimated_latency_ms}ms")
print(f"Quota remaining: {allocation.quota_remaining} GIC")
```

---

## Module 4: Financial Flows

**File:** `financial-flows/manager.py`

### Purpose
Manages **GIC (Global Integrity Currency)** transfers and **PublicGoodsPool** grant allocations.

### Features

#### 1. **GIC Transfers**
```python
tx = FINANCIAL_MANAGER.process_gic_transfer(
    from_did="did:kaizen:alice",
    to_did="did:kaizen:bob",
    amount=50.0,
    reason="Compute resource payment"
)
```

#### 2. **PublicGoodsPool Grants**
```python
tx = FINANCIAL_MANAGER.allocate_public_goods_grant(
    recipient_did="did:kaizen:community_garden",
    amount=1000.0,
    project="Urban Food Network Expansion"
)
```

#### 3. **Balance Queries**
```python
balance = FINANCIAL_MANAGER.get_balance("did:kaizen:alice")
```

### Transaction Schema

```python
@dataclass
class Transaction:
    tx_id: str                  # Unique transaction ID
    type: str                   # "transfer" | "grant" | "settlement"
    from_did: Optional[str]     # Sender DID
    to_did: str                 # Recipient DID
    amount_gic: float           # Amount in GIC
    timestamp: str              # ISO 8601 timestamp
    metadata: Dict[str, Any]    # Additional context
```

### PublicGoodsPool

- **Initial balance:** 50,000 GIC
- **Purpose:** Fund community projects, healthcare, education, infrastructure
- **Allocation:** Governed by Lab 6 (Governance) deliberation protocols
- **Replenishment:** Transaction fees, voluntary contributions, epoch rewards

---

## API Endpoints

**Base path:** `/lab3`

### Compute Allocation

#### `POST /lab3/compute/allocate`

**Request:**
```json
{
  "citizen_did": "did:kaizen:alice",
  "query_tokens": 5000,
  "priority": "quality_optimized",
  "min_quality": 0.90,
  "max_cost_gic": 0.10,
  "preferred_provider": null
}
```

**Response:**
```json
{
  "provider": "anthropic_claude",
  "estimated_cost_gic": 0.075,
  "estimated_latency_ms": 600,
  "quota_remaining": 99.925,
  "fallback_provider": "local_llama",
  "reason": "Quality score 0.97 meets min_quality 0.90"
}
```

#### `POST /lab3/compute/report_usage`

Report actual usage after query completes (for settlement and quota deduction).

**Request:**
```json
{
  "citizen_did": "did:kaizen:alice",
  "provider": "anthropic_claude",
  "actual_cost": 0.078,
  "success": true
}
```

#### `GET /lab3/compute/stats`

Returns orchestrator health, provider availability, total allocations.

#### `GET /lab3/compute/quota/{citizen_did}`

Returns remaining quota for a citizen.

---

### Financial Flows

#### `POST /lab3/financial/transfer`

**Request:**
```json
{
  "from_did": "did:kaizen:alice",
  "to_did": "did:kaizen:bob",
  "amount": 50.0,
  "reason": "API compute credits"
}
```

**Response:**
```json
{
  "tx_id": "tx_abc123",
  "type": "transfer",
  "amount_gic": 50.0,
  "timestamp": "2025-10-31T14:30:00Z"
}
```

#### `POST /lab3/financial/grant`

Allocate PublicGoodsPool grant (requires governance approval in production).

**Request:**
```json
{
  "recipient_did": "did:kaizen:community_project",
  "amount": 1000.0,
  "project": "Solar Microgrid Deployment"
}
```

#### `GET /lab3/financial/balance/{citizen_did}`

Returns GIC balance for a citizen.

#### `GET /lab3/financial/pool`

Returns PublicGoodsPool balance, total supply, current epoch.

---

## Integration Points

### Lab 1 (Civic Protocol)
- **DID resolution** for citizen identity
- **Ledger attestation** for all transactions

### Lab 2 (Thought Broker)
- **Compute allocation backend** for AI queries
- **Cost tracking** for usage analytics

### Lab 4 (Proof Fabric)
- **Zero-knowledge proofs** for private transactions
- **Verifiable compute** attestations

### Lab 5 (Humanities & Healthcare)
- **GI-constrained resource allocation** (if GI < threshold, block non-essential compute)
- **Ethical audits** on financial flow equity

### Lab 6 (Governance)
- **PublicGoodsPool governance** via deliberation protocols
- **Quota policy** adjustments through citizen voting

### Lab 7 (Data Economy)
- **Data marketplace settlements** via GIC
- **Compute-for-data** exchanges

---

## Development

### Setup

```bash
cd labs/lab3-resource-orchestration

# Install dependencies (from monorepo root)
npm install

# Run API server (integrates with apps/api-gateway)
python -m uvicorn api.routes:router --reload --port 8003
```

### Testing

```bash
# Unit tests
pytest tests/test_compute_allocation.py
pytest tests/test_financial_flows.py

# Integration test with Lab 2 Thought Broker
pytest tests/test_lab2_integration.py

# Load test
pytest tests/test_quota_stress.py
```

### Configuration

Environment variables:

```bash
# Compute Allocation
DEFAULT_CITIZEN_QUOTA_GIC=100
ENABLE_LOCAL_FALLBACK=true

# Financial Flows
PUBLIC_GOODS_POOL_INITIAL_BALANCE=50000
TRANSACTION_FEE_PERCENT=0.001

# External APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENAI_API_KEY=...
```

---

## Planned Modules

### Module 2: Energy Routing
- Grid-aware renewable energy source selection
- Peak load shifting for compute jobs
- Carbon accounting for AI inference

### Module 3: Supply Chain
- Materials tracking for Hive construction
- Food network logistics (Lab 5 integration)
- Just-in-time manufacturing coordination

### Module 5: Labor Market
- Skills ontology and citizen capability matching
- Gig coordination for community projects
- Fair wage computation via Lab 5 Justice constraint

### Module 6: Maintenance
- Predictive maintenance for Hive infrastructure
- IoT sensor integration for physical systems
- Automated repair dispatching

---

## Future Enhancements

1. **Multi-cloud orchestration** — AWS, GCP, Azure compute pools
2. **Federated learning** — Distribute training across regional Hives
3. **Dynamic pricing** — Real-time GIC exchange rates based on demand
4. **Cross-lab resource bundling** — "Compute + Storage + Network" packages
5. **Algorithmic fairness audits** — Lab 5 Justice gate integration for allocation equity
6. **Carbon-neutral compute** — Renewable energy verification via Lab 4 ZK proofs

---

## Status

✅ **Module 1: Compute Allocation** — Active
✅ **Module 4: Financial Flows** — Active
📋 **Modules 2, 3, 5, 6** — Protocols specified, implementation staged

Integration with **Lab 2 Thought Broker** complete. Backend API ready for **apps/api-gateway** registration.

---

## Linked Implementations

**Current repo:**
- Compute: `packages/codex-agentic` (cost/latency/quality inputs)
- Financial flows: `packages/gic-registry-contracts` + `apps/ledger-api`
- Hub/API surface: `apps/api-gateway`, `apps/hub-web`

---

## References

- **Spec:** `docs/architecture/Lab3_Resource_Orchestration_Specification.md`
- **GIC Whitepaper:** `docs/economics/GIC_WHITEPAPER.md`
- **Complete Lab Architecture:** `docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md`
- **Self-Host Guide:** `docs/product/SELF_HOST_GUIDE.md`

---

**Lab 3 honors the principle of 改善 (Kaizen) — continuous improvement of resource efficiency, fairness, and resilience.**
