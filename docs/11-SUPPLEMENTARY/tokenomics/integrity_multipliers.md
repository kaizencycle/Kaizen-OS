# Integrity-Based Multipliers

!!! note "Reward scoring layer"

    This file documents **multiplier math** used in provisional reward computation (`packages/tokenomics-engine/src/multipliers.ts`).  
    It does **not** alone define **mint authorization** or Seal attestation. See **[MIC issuance protocol](../../04-TECHNICAL-ARCHITECTURE/mic/mic_issuance_protocol.md)**.

Mobius Tokenomics v2.0 scales **provisional** MIC rewards by measuring how each contribution strengthens the integrity substrate.

## GI Multiplier

```
M_gi = (GI - 0.90) / 0.10
```

- GI below 0.90 yields 0 reward.
- GI 0.92 → 2× multiplier.
- GI 0.99 → 9× multiplier.

## Consensus Multiplier

| Sentinel Participation | Multiplier |
| ---------------------- | ---------- |
| 1 sentinel             | 1.0×       |
| 2 sentinels            | 1.5×       |
| ≥3 sentinels           | 2.0×       |

More engines and proofs yield higher integrity confidence.

## Novelty Multiplier

Adds 1.4× reward when a contribution injects net-new, high-confidence knowledge into ECHO + Civic Ledger.

## Anti-Drift Multiplier

Rewards drift correction and stale-answer repair with a 3× spike. Cron jobs that restore integrity automatically benefit from this multiplier.

## Human Intent Multiplier

Human co-creation injects ethics and civic oversight. When a human verifies or guides an answer, the multiplier increases rewards proportionally to the human oversight weight configured per epoch.
