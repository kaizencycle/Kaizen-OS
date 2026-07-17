# C-368 · PR 2 — GII thresholds aligned to canon
**Repo:** `kaizencycle/OAA-API-Library` · **Branch:** `core/oaa-gii-canon-c368` · **Tier:** EP-3 (mint governance) · **Priority: 2**

## 1. Summary

Live `/api/learning/system-status` reports thresholds that contradict constitutional constants:

| Threshold | Live service | Canon |
|---|---|---|
| Circuit breaker | GII < 0.60 | **GI < 0.85** |
| Reward floor | — (healthy: 0.90) | **GI ≥ 0.90** |
| Full-rate mint gate | — | **GI ≥ 0.95 (sustained 5 cycles)** |

The service would keep minting through conditions canon says must trip the breaker.

## 2. Changes

1. Threshold config becomes: `circuit_breaker: 0.85`, `reward_floor: 0.90`, `mint_gate: 0.95`,
   `warning_band: [0.85, 0.90)`.
2. Behavior mapping: GII < 0.85 → minting halted (breaker). 0.85–0.90 → minting halted,
   status `warning` (below reward floor). 0.90–0.95 → minting enabled at reduced
   `gii_multiplier`. ≥ 0.95 → full rate, and the *sustained 5 cycles* condition applies to the
   full-rate gate if cycle history is available; if not tracked yet, log a TODO and enforce
   instantaneous ≥ 0.95 as the interim gate — never weaker.
3. `/api/learning/system-status` response names the canon source:
   `"threshold_source": "Mobius-Substrate constitutional constants"`.

## 3. Explicitly out of scope — flagged for canon

The **five-domain vs. three-domain GI formula conflict** determines what the GII number *means*;
this PR only aligns the thresholds applied to it. Formula resolution remains a prerequisite for
DWE spec work and requires seal quorum, not a service PR.

## 4. Acceptance criteria

- `system-status` shows the four canon thresholds.
- Simulated GII 0.84 → `minting_enabled: false`, breaker tripped.
- Simulated GII 0.92 → minting enabled, multiplier < 1.0.

## 5. EPICON Intent

```intent
epicon_id: EPICON_C-368_CORE_oaa-gii-canon-alignment_v1
ledger_id: kaizencycle
scope: core
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability, safety
  REASONING: Production config has drifted from constitutional constants: the live breaker
    (0.60) is far below canon (0.85). Threshold drift in the mint governor is
    constitutional drift, not a tuning preference.
  ANCHORS:
    - Mobius-Substrate/docs/epicon/EPICON-02.md (IPDP v1.0.0)
    - Mobius-Substrate/docs/specs/EPICON_TIERING_SPEC_v0.1.md (canonized PR #357)
  BOUNDARIES: Threshold values and their behavior mapping only. Does not resolve the
    five-vs-three domain GI formula, does not touch the DWE proposal, does not
    change reward amounts.
  COUNTERFACTUAL: If canon constants are re-ratified to different values by seal quorum,
    this configuration follows canon, not the reverse.
counterfactuals:
  - If the stricter breaker halts minting in normal operation, investigate the GII inputs — do not lower the threshold
  - If sustained-5-cycle tracking proves infeasible this cycle, keep instantaneous 0.95 gate and open a follow-up
  - If formula resolution changes GII semantics, re-validate thresholds in a new intent
```
