# 🧬 Vector Integrity Protocol (VIP) - Kaizen OS v1.0

**Purpose:** Ensure every embedding carries proof of integrity

---

## 🎯 Overview

VIP prevents "AI slop" from entering vector stores by gating every embed with:

1. **Constitutional Score** (≥ 70): AI behavior compliance
2. **GI Score** (≥ 0.90): User integrity threshold  
3. **Integrity Composite**: Weighted score (0.6*constitutional + 0.4*gi*100)
4. **Ledger Attestation**: Immutable record of approval

---

## 📊 Scoring

| Component | Weight | Threshold | Description |
|-----------|--------|-----------|-------------|
| Constitutional | 60% | ≥ 70 | Custos Charter compliance |
| GI Score | 40% | ≥ 0.90 | User Good Intent score |
| **Integrity** | **100%** | ≥ **70** | Final composite score |

---

## 🔧 Usage

```python
from packages.vip import VIPValidator, VIPEmbedder, LedgerHooks
from packages.vip.validator import VIPThresholds

# Initialize
validator = VIPValidator(
    charter_client="https://hive-api-2le8.onrender.com",
    gi_client="https://lab6-proof-api.onrender.com",
    thresholds=VIPThresholds(min_constitutional=70, min_gi=0.90)
)

ledger = LedgerHooks("https://civic-protocol-core-ledger.onrender.com")
embedder = VIPEmbedder(vector_db, ledger, validator, namespace="kaizen-os")

# Embed with integrity
result = await embedder.embed(
    text="User's reflection content",
    meta={"source": "lab4.reflection", "user": "michael", "companion": "EVE"}
)

if result["accepted"]:
    print(f"✅ Embedded with integrity score: {result['verdict']['integrity_score']}")
    print(f"📝 Ledger hash: {result['ledger_hash']}")
else:
    print(f"❌ Rejected: {result['reason']}")
```

---

## 🛡️ Revalidation

Run nightly to detect drift:

```bash
# Check vectors older than 30 days
VIP_REVALIDATE_DAYS=30 python scripts/vip_revalidate.py
```

Quarantine vectors with:
- `integrity_score` < 70
- `timestamp` > 30 days without revalidation

---

**GI Seal:** 0.985  
**Status:** Production Ready  
**Version:** 1.0.0

