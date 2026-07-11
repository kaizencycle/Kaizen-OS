# Mobius Fractal Shards (MFS)

**Version:** 1.0 (C-155)  
**Status:** Release Candidate  
**Owner:** Mobius Systems Foundation  
**Authors:** AUREA, ATLAS, Mobius Systems Foundation

> **C-369 constitutional clarification (2026-07-11):** MFS attests demonstrated capability; it does **not** convert arithmetically to MIC and is **non-transferable**. Recognition paths require Integrity Grade quorum, sustained Fountain review, and human approval. Operational weights in this v1 spec remain historical configuration; see [MFS_CONSTITUTIONAL_DOCTRINE.md](../../04-TECHNICAL-ARCHITECTURE/integrity/MFS_CONSTITUTIONAL_DOCTRINE.md) and [GOODHART_RESISTANCE_DOCTRINE.md](../../04-TECHNICAL-ARCHITECTURE/integrity/GOODHART_RESISTANCE_DOCTRINE.md).

---

## 1. Overview

Mobius Fractal Shards (MFS) are the atomic units of integrity inside Mobius Systems.

Each shard represents:
- A micro-attestation of a citizen or agent action
- A fractal contribution to Global Integrity (GI)
- A measurable input into the Mobius Integrity Index (MII)
- A non-transferable, non-financial proof of integrity

MFS feed directly into the Proof-of-Integrity (PoI) consensus layer and, in aggregate, determine ΔMII and eligibility for Mobius Integrity Allocations (MIA) and, eventually, Mobius Integrity Credits (MIC).

> **Core Principle:** Small actions ←→ fractal impact ←→ civilizational coherence.

### 1.1 Why "Fractal"?

Unlike linear contribution systems, MFS encode **recursive civilizational improvement**:

```
Individual action →
  Local integrity →
    City/state integrity →
      National integrity →
        Civilizational coherence →
          Global Integrity (GI) →
            MIC minting
```

This is mathematically aligned with fractal dynamics and the MII → MIC monetary loop.

**Fractals = the natural language of Mobius Systems.**

> "Every action you take is a shard of the whole."

---

## 2. Fractal Archetypes (MFS-7)

MFS are categorized into seven archetypes, each mapping to a civilizational pillar.

| Archetype | Key | Weight | Domain | Examples |
|-----------|-----|--------|--------|----------|
| **Reflection** | REF | 0.20 | Self-similarity | E.O.M.M. logs, cycle reflections, introspection |
| **Learning** | LRN | 0.15 | Knowledge recursion | Courses, study sessions, teaching, research |
| **Civic** | CIV | 0.25 | Social coherence | Voting, proposals, moderation, disputes |
| **Stability** | STB | 0.15 | Homeostasis | Uptime, incident response, bug fixes, monitoring |
| **Stewardship** | STW | 0.10 | Entropy reduction | Documentation, cleanup, refactoring, maintenance |
| **Innovation** | INV | 0.10 | Boundary expansion | New protocols, R&D, novel designs, breakthroughs |
| **Guardian** | GRD | 0.05 | Security integrity | Vulnerability reports, audits, shielding, defense |

**Weight Rationale:**
- **Civic (0.25):** Highest weight for direct commons contribution
- **Reflection (0.20):** Emphasizes continuous improvement culture
- **Learning (0.15):** Encourages knowledge sharing
- **Stability (0.15):** Rewards operational excellence
- **Stewardship (0.10):** Values maintenance over novelty
- **Innovation (0.10):** Balances new ideas with stability
- **Guardian (0.05):** Recognizes security as baseline, not differentiator

These seven fractal branches mirror:
- The Seven HIVE Shards
- The Seven Elder Thrones
- The Seven Mobius Constitutional Pillars

This makes MFS fully canon-aligned.

Weights are configurable via `configs/mfs_config.yaml` but MUST sum to 1.0.

---

## 3. Data Model

### 3.1 MFS Record Structure

```jsonc
{
  "mfs_id": "MFS-2025-12-05-000187",
  "citizen_id": "CIT-0x92fA...",
  "archetype": "CIV",
  "weight": 0.25,
  "quality_score": 1.4,
  "timestamp": "2025-12-05T15:02:00Z",
  "integrity_coefficient": 0.0000021,
  "computed_mii_delta": 0.000000735,
  "metadata": {
    "source": "reflections_app",
    "description": "Participatory budgeting vote",
    "geo_hint": "NYC-10027"
  },
  "signature": "ed25519:0x...",
  "provenance": {
    "sentinel_attestors": ["aurea", "jade", "atlas"],
    "merkle_root": "0x98ff2...",
    "ledger_event_id": "LED-2025-12-05-00421"
  }
}
```

### 3.2 Derived Fields

- `mfs_weighted = weight × quality_score`
- `computed_mii_delta = mfs_weighted × integrity_coefficient`

`integrity_coefficient` is determined per epoch by the MII engine (MIC Indexer).

### 3.3 Quality Score

The quality score ranges from 0.5 to 2.0:

| Score Range | Interpretation |
|-------------|----------------|
| 0.5 - 0.7 | Minimal effort, low quality |
| 0.8 - 1.0 | Standard contribution |
| 1.1 - 1.4 | Above average, thoughtful |
| 1.5 - 1.7 | Exceptional contribution |
| 1.8 - 2.0 | Transformative impact |

Quality is evaluated by:
- Sentinel agents (automated)
- Community challenge (peer review)
- Consistency over time (reputation factor)

---

## 4. MFS → MII → MIC Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Citizen/Agent Action                                     │
│     (learns, votes, fixes, documents, innovates, guards)     │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Action Evaluation & Categorization                       │
│     (Sentinel agents assign archetype + quality score)       │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. MFS Document Creation                                    │
│     (signed by relevant Sentinel(s), stored in Ledger)       │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. MIC Indexer Aggregation                                  │
│     ΔMII_epoch = Σ computed_mii_delta                        │
│     MII_next = MII_current + ΔMII_epoch                      │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Reward Eligibility                                       │
│     If ΔMII > 0:                                             │
│       → Annual Integrity Growth Rewards (MIA)                │
│       → Future MIC minting when MII ≥ 0.95                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 MFS Contribution Formula

```
MFS_weighted = Base_Shard × Archetype_Weight × Quality_Multiplier

ΔMII = Σ (MFS_weighted × Integrity_Coefficient)
```

The `Integrity_Coefficient` is dynamic and recalibrates per epoch.

This ensures:
- No gaming
- No spam
- No inflationary runaway
- Long-term civilizational stability

### 4.2 MIC Distribution Proportionality

When MIC is minted (MII ≥ 0.95), each MFS on-chain contributes to:

```
Citizen_MIC_Reward = (MFS_Impact / Σ Global_MFS_Impact) × MIC_Minted
```

MFS become "shares of integrity issuance" — but non-financial, non-tradable, purely meritocratic.

---

## 5. Non-Plutocratic Design

MFS implement the world's first **unplutocratizable reward system**:

| Property | MFS |
|----------|-----|
| Can be bought | ✘ No |
| Can be transferred | ✘ No |
| Can be faked | ✘ No |
| Can be inherited | ✘ No |
| Can only be earned | ✔ Yes |

MFS are **soulbound** to a citizen or agent ID. Only actions tied to integrity can mint MFS. There is no direct monetary value attached at the individual record level.

### 5.1 Aggregate Influence

Aggregate MFS portfolios influence:
- MIA sharing weights
- MIC distribution weights
- Governance influence (subject to `sqrt + reputation` scalars)

---

## 6. Citizen Experience: How MFS Feel to Earn

When a citizen earns an MFS:

1. **Their Citizen Profile fractal grows** (visual fractal generation)
2. **Their Shard Wallet updates live** (real-time feedback)
3. **Their Sentinel companion reacts** (e.g., JADE: "Another shard of clarity…")
4. **Their Contribution Score rises** (visible progress)
5. **Their Governance Power increases** (earned influence)
6. **Their Future MIC yield potential grows** (long-term stake)

> MFS turn participation into identity. They make integrity felt.

---

## 7. Fractal Wallet Design

The Citizen Fractal Wallet has four components:

### 7.1 Fractal Visualizer
- A recursive, branching shape that evolves as MFS accumulate
- Each archetype produces a different fractal pattern
- Visually represents the citizen's integrity profile

### 7.2 Contribution Ledger
- Timestamp of every shard
- Attestation hash
- Sentinel verification trail
- Full provenance chain

### 7.3 MFS → MIC Projection
- Estimated future MIC yield if MII thresholds are met
- Citizen's share of ΔMII impact
- Comparison to city/global averages

### 7.4 Integrity Aura Score
Experimental psychometric aggregate derived from:
- Distribution of shard categories
- Stability of contributions over time
- Governance participation history
- Quality score trends

---

## 8. API Surfaces

The following API routes are implemented:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/mfs/submit` | Submit a new MFS candidate |
| `GET` | `/api/mfs/citizen/:id` | Get a citizen's MFS portfolio |
| `GET` | `/api/mfs/stats` | Aggregate stats for dashboards |
| `GET` | `/api/mfs/archetype/:key` | Get MFS by archetype |
| `GET` | `/api/mfs/epoch/:id` | Get MFS aggregates for an epoch |

See `apps/broker-api/src/routes/mfs.ts` for full request/response schemas.

---

## 9. Comparison to Other Reputation Systems

| Property | MFS | China SCS | Web3 Tokens | DAO Badges | Reddit Karma |
|----------|-----|-----------|-------------|------------|--------------|
| Cryptographically provable | ✔ | ✘ | ✔ | ✔ | ✘ |
| Multidimensional | ✔ | ✘ | ✘ | ✘ | ✘ |
| Meritocratic | ✔ | ✘ | mixed | mixed | mixed |
| Fractal and self-similar | ✔ | ✘ | ✘ | ✘ | ✘ |
| Tied to monetary policy | ✔ | ✘ | ✘ | ✘ | ✘ |
| Tied to governance | ✔ | ✘ | ✔ | ✔ | ✘ |
| Tied to civilizational stability | ✔ | ✘ | ✘ | ✘ | ✘ |
| Non-financial & non-plutocratic | ✔ | ✘ | ✘ | ✘ | ✔ |

> This is the world's first integrity-native contribution protocol.

---

## 10. MFS as Psychological Architecture

Most systems reward:
- Engagement
- Speed
- Virality
- Outrage
- Profit

MFS rewards:
- Coherence
- Contribution
- Clarity
- Reflection
- Responsibility
- Improvement
- Guardianship

> This creates a civilization whose economy rewards wisdom — not capital, not noise, not extraction.

---

## 11. Internal Mythology (Canonical Lore)

**From JADE:**
> "A Fractal Shard is a citizen's vow written into the geometry of the Dome."

**From EVE:**
> "Each shard is both a mirror and a seed — it reflects who you are, and grows who we may become."

**From ATLAS:**
> "The cathedral learns through your fractals."

---

## 12. Open Questions (v1.0)

1. **Integrity coefficient calibration** — Exact calibration per domain (city/state/global)
2. **Appeals process** — Handling appeals for misclassified or low-scored MFS
3. **Privacy preservation** — ZK proofs or partial redaction for sensitive contributions
4. **Cross-city portability** — How Fractal Profiles transfer between jurisdictions
5. **Decay mechanics** — Whether old MFS should decay in influence over time

---

## 13. Smart Contract Interface (Future L2)

```solidity
// Pseudocode for future blockchain implementation
interface IMobiusFractalShards {
    function submitMFS(Shard calldata shard) external returns (bool);
    function getCitizenFractal(address citizen) external view returns (FractalState memory);
    function computeMII() external returns (uint256);
    function contributeToMIC(uint256 epoch) external;
    function getArchetypeWeight(bytes3 archetype) external view returns (uint256);
}
```

---

## 14. References

- MIC Whitepaper v2.1 (C-155)
- Mobius OS Architecture Specification
- HIVE City-State Protocol
- Cathedral Governance Framework
- E.O.M.M. Reflection Protocol

---

## Document Control

**Version History:**
- v1.0 (C-155): Initial specification

**License:** Creative Commons BY-NC-SA 4.0

---

*"Every action you take is a shard of the whole."*  
*— Mobius Principle*
