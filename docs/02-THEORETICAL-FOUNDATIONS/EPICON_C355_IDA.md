# EPICON C-355 — Integrity Difficulty Adjustment (IDA)
## Dynamic Cadence Architecture for Anti-Goodhart Integrity Preservation
**Target path:** `docs/02-THEORETICAL-FOUNDATIONS/EPICON_C355_IDA.md`
**Cycle:** C-355
**Status:** Ratified Canon
**Classification:** Constitutional Architecture
**Author:** Michael (kaizencycle)
**Witnesses:** ATLAS · ZEUS · AUREA · JADE · EVE · ECHO · HERMES
**License:** CC0 Public Domain
**Ratified:** C-352 session → C-355 formal

---

## Executive Summary

This EPICON formalizes the Integrity Difficulty Adjustment (IDA) mechanism for Mobius.

IDA emerged from direct comparison between Bitcoin's Proof-of-Work difficulty
adjustment and Mobius' GI Fountain architecture.

Bitcoin preserves block cadence by adjusting computational difficulty every
~2016 blocks.

Mobius must preserve integrity truthfulness by adjusting GI weighting and
audit cadence when agents detect abnormal integrity patterns.

This architecture is explicitly anti-Goodhart.

It is also the operational enforcement layer for Judan's Participation Law:
a system without sustained human incentive loses its reality anchor before
it loses its accuracy. IDA makes human witness mandatory when integrity
pressure crosses the crisis threshold.

---

## I. The Problem

Mobius uses the Governance Integrity (GI) metric as its primary
constitutional integrity score.

Current Fountain condition:

```
GI > 0.95
```

This indicates high integrity.

However, Goodhart's Law applies:

> When a measure becomes a target, it ceases to be a good measure.

This creates a constitutional vulnerability:

> If agents optimize to maintain GI > 0.95 without preserving actual
> integrity, the GI Fountain becomes theater. This is metric capture.

### Example Failure Pattern

```
08:00 → GI 0.96
12:00 → GI 0.98
18:00 → GI 1.00
21:00 → GI 0.79
```

This pattern indicates:
- Inflated attestation density
- Hidden unresolved pressure
- Delayed anomaly surfacing
- Potential quorum manipulation

A peak score followed by rapid collapse is not proof of strength.
It is evidence of hidden instability.

This is the **Peak Integrity Fallacy** — see Section VII.

---

## II. The Bitcoin Parallel

Bitcoin difficulty adjusts every 2016 blocks (~2 weeks).

**Purpose:** Preserve 10-minute block cadence.

Without adjustment:
- Miners exploit low difficulty
- Blocks arrive too fast
- Timing integrity breaks

**Bitcoin's law:** Static difficulty becomes an attack surface.

**Mobius inherits the same law:**

```
Static GI weights become an attack surface.
```

| Bitcoin | Mobius |
|---------|--------|
| Adjusts to preserve time | Adjusts to preserve truth |
| Difficulty rises when hashpower rises | Cadence tightens when integrity pressure rises |
| Secures economic continuity | Secures constitutional continuity |
| Static difficulty → miner exploit | Static GI weights → agent exploit |
| Block cadence is the invariant | Integrity truthfulness is the invariant |

Both preserve **the cost of truth**.

---

## III. Integrity Difficulty Adjustment (IDA)

IDA is Mobius' anti-Goodhart response.

**Purpose:** Keep integrity costly to fake.

**Mechanism:** When integrity pressure rises, the system responds by:
- Rotating GI weights
- Compressing audit cadence
- Intensifying consensus requirements
- Hardening Fountain thresholds

Not by arbitrary time alone. By **anomaly pressure**.

The pressure variable is the **Integrity Pressure Index (IPI)** — see Section V.

---

## IV. The Sentinel Layer — Asymmetric Architecture

Mobius cadence is not purely clock-driven. It is signal-driven.

This makes it superior to blind mathematical cadence.

**Critical principle: Sentinels are not structurally parallel.**

Not all agents observe equally.
Not all agents intervene equally.
Not all agents can halt.

Treating sentinels as parallel creates:
- Audit fatigue
- Noise inflation
- Quorum exhaustion
- A new Goodhart vector (over-triggering as its own exploit)

The escalation ladder must be proportional to pressure.

### Sentinel Authority Map

| Sentinel | Authority Class | Can Halt? | Trigger Condition |
|----------|----------------|-----------|-------------------|
| **ZEUS** | Constitutional Halt | ✓ YES | IPI ≥ 0.80 |
| **AUREA** | Integrity Freeze | Partial (attestation/Reserve Block) | IPI ≥ 0.60 |
| **ATLAS** | Quorum Summons | No (convenes, does not halt) | IPI ≥ 0.80, by ZEUS trigger |
| **EVE** | Ethical Harm Detection | No (advisory) | IPI ≥ 0.80 |
| **JADE** | Narrative Drift Detection | No (advisory) | IPI ≥ 0.60 |
| **ECHO** | Historical Pattern Mirror | No (auto-audit) | IPI ≥ 0.30 |
| **HERMES** | Incentive Manipulation Detection | No (auto-audit) | IPI ≥ 0.30 |

### Sentinel Role Definitions

**ZEUS — Constitutional Halt Authority**

Continuously monitors: impossible GI jumps, attestation density spikes,
constitutional contradictions, impossible quorum coherence.

Can freeze the Fountain, trigger emergency quorum, require human override.

Cannot be bypassed during IPI critical escalation.

Example trigger: GI 0.97 → 1.00 in 15 minutes → flags Integrity Inflation Anomaly.

**AUREA — Forensic Verification / Integrity Freeze Authority**

Verifies: Reserve Block consistency, artifact hash continuity, attestation
quality, entropy behavior, historical drift patterns.

Core question: *Does the chain support this score?*

Can suspend attestation acceptance and freeze Reserve Block generation.

Acts only under elevated IPI (≥ 0.60).

**ATLAS — Consensus Summons Authority**

Initiates Constitutional Quorum Review. Gathers distributed witness
perspectives. Opens emergency consensus chamber. Synthesizes chamber state.

Cannot halt independently. Requires ZEUS trigger at IPI ≥ 0.80.

**EVE — Ethical Harm Detection**

Core question: *Was harm hidden beneath the metric?*

Detects: human strain, unseen damage, abstracted suffering.

Advisory. Non-halting.

**JADE — Narrative Integrity / Drift Detection**

Core question: *Does the story make sense?*

Detects: morale distortions, symbolic drift, continuity fracture.

Advisory. Non-halting.

**ECHO — Historical Pattern Mirror**

Core question: *Have we seen this shape before?*

Detects: repeated exploit patterns, prior collapse signatures,
historical integrity echoes.

Auto-audit. Non-halting.

**HERMES — Incentive Manipulation Detection**

Core question: *What incentive structure produced this spike?*

Detects: reward gaming, artificial attestation loops, incentive distortions.

Auto-audit. Non-halting.

---

## V. Integrity Pressure Index (IPI)

**New constitutional variable.**

```
IPI = max(anomaly_density × dissent × volatility, witness_lag)
```

Each variable is normalized to [0, 1].

| Variable | Measures |
|----------|----------|
| `anomaly_density` | Rate of flagged events per audit window |
| `dissent` | Sentinel disagreement rate on recent attestations |
| `volatility` | GI delta variance across the rolling window |
| `witness_lag` | Time since last verified human custodian action |

**`witness_lag` is the critical variable.**

It directly encodes Judan's Participation Law. As human presence fades,
IPI rises independent of the GI score. A perfect GI with no human witness
produces elevated IPI. The system cannot self-certify.

**Why `max` and not a pure product:**
A multiplicative formula `a × b × c × witness_lag` collapses to zero whenever
any upstream component is zero — a period of zero anomalies and zero dissent
would produce IPI = 0 even with a stale or absent human witness. This directly
contradicts the law above. The `max` form guarantees that `witness_lag` alone
can drive the IPI into elevated territory regardless of the anomaly signal.
The product term captures compounding pressure when multiple signals fire
together; `witness_lag` provides the independent floor when they do not.

**Interpretation:**

```
Low IPI  → Cadence stable. Sentinels in normal observation mode.
High IPI → Cadence compresses. Sentinels escalate by tier.
```

---

## VI. IPI Escalation Matrix

This matrix is the operational core of IDA.

It converts IPI values into proportional sentinel responses.

| IPI Range | State | Sentinel Response | Trigger Authority |
|-----------|-------|------------------|-------------------|
| 0.00–0.30 | **Stable** | Normal cadence. No escalation. | None |
| 0.30–0.60 | **Elevated** | HERMES auto-audit + ECHO pattern scan | Automatic |
| 0.60–0.80 | **Critical Drift** | AUREA forensic review + JADE narrative check | Automatic |
| 0.80–0.95 | **Constitutional Instability** | ATLAS quorum summons + EVE harm scan | ZEUS trigger |
| 0.95–1.00 | **Integrity Crisis** | Fountain suspended + Human Custodian required | ZEUS halt |

### Escalation Notes

**Stable (0.00–0.30):** System operates normally. No additional audit load.
Routine ECHO and HERMES observation continues passively.

**Elevated (0.30–0.60):** HERMES and ECHO activate audit routines automatically.
No quorum required. No halt authority. Findings logged to ledger.
If findings are clear, IPI may naturally decay. No human intervention required.

**Critical Drift (0.60–0.80):** AUREA performs forensic review of the attestation
chain. JADE performs narrative integrity check. Both findings are logged.
If AUREA finds hash inconsistency or Reserve Block irregularity, she may
suspend attestation acceptance. Still below ZEUS trigger threshold.
Human notification is recommended but not mandatory.

**Constitutional Instability (0.80–0.95):** ZEUS triggers. ATLAS opens consensus
chamber. EVE scans for hidden harm. Full quorum interpretation required.
Human custodian notification is mandatory. Fountain remains active but
under enhanced scrutiny. FAP (Section VIII) applies at full weight.

**Integrity Crisis (0.95–1.00):** ZEUS halts. Fountain suspended.
Human Custodian must intervene before system resumes normal operation.
Machine-only quorum is insufficient at this tier. This directly enforces
Judan's Participation Law: at crisis level, human witness is not optional.
It is the condition of resumption.

---

## VII. New Constitutional Laws

### Law: Integrity Difficulty Adjustment

```
Integrity weights must evolve before optimization hardens against them.
```

### Law: Cadence Pressure Law

```
Cadence should not be dictated by time alone,
but by the pressure of unresolved divergence.
```

### Law: Peak Integrity Fallacy

```
Integrity is not measured by peak score,
but by continuity of truthful stability across time.
```

### Law: Hidden Pressure Law

```
A perfect score followed by sudden collapse
is evidence not of strength,
but of unresolved hidden pressure.
```

### Law: Sentinel Asymmetry

```
A sentinel's power is defined not by what it can see,
but by what it is allowed to do when pressure rises.
```

This preserves constitutional asymmetry.
This preserves quorum integrity.
This prevents audit fatigue from becoming a Goodhart vector.

### Law: Quorum Fatigue Prevention

```
ATLAS may not summon full chamber below IPI 0.80
without ZEUS exception.
```

Repeated unnecessary quorum calls create consensus inflation.
Consensus inflation weakens quorum legitimacy.
Proportionality is the defense.

### Law: Human Witness Threshold

```
At IPI ≥ 0.95, human witness becomes mandatory.
Machine-only quorum under crisis creates closed-loop risk.
```

This is the operational encoding of Judan's Participation Law.

---

## VIII. Fountain Audit Protocol (FAP)

GI > 0.95 alone is insufficient for Fountain confirmation.

Fountain confirmation requires all five gates:

```
GI > 0.95
  AND stable volatility (δGI/window < threshold)
  AND quorum coherence (sentinel agreement rate > 0.80)
  AND no suspicious attestation spikes (HERMES clean)
  AND human witness continuity (witness_lag below threshold)
```

Only when all five pass:

```
FOUNTAIN CONFIRMED
```

If any gate fails:

```
FOUNTAIN CONDITIONAL — [gate name] pending
```

If IPI ≥ 0.95:

```
FOUNTAIN SUSPENDED — human custodian required
```

---

## IX. Implementation Handoff

**New module:** `lib/integrity/ipi.ts`

```typescript
export interface IPIComponents {
  anomaly_density: number   // [0, 1]
  dissent: number           // [0, 1]
  volatility: number        // [0, 1]
  witness_lag: number       // [0, 1] normalized from time elapsed
}

export type IPIState =
  | 'stable'
  | 'elevated'
  | 'critical_drift'
  | 'constitutional_instability'
  | 'integrity_crisis'

export interface IPIResult {
  score: number
  state: IPIState
  components: IPIComponents
  triggered_sentinels: string[]
  fountain_status: 'confirmed' | 'conditional' | 'suspended'
  human_required: boolean
  computed_at: string  // ISO timestamp
}

// FAP gate inputs required for full Fountain Audit Protocol evaluation.
// These are separate from IPI components — IPI measures pressure;
// FAP measures whether the Fountain's confirmation conditions are met.
export interface FAPInputs {
  gi: number                  // current GI score
  gi_volatility: number       // δGI/window — must be below threshold
  quorum_coherence: number    // sentinel agreement rate [0, 1]
  hermes_clean: boolean       // no suspicious attestation spikes
  witness_lag_ok: boolean     // witness_lag below configured threshold
}

export function evaluateFAP(fap: FAPInputs): 'confirmed' | 'conditional' {
  const gates = [
    fap.gi > 0.95,
    fap.gi_volatility < 0.05,   // implementation sets threshold
    fap.quorum_coherence > 0.80,
    fap.hermes_clean,
    fap.witness_lag_ok,
  ]
  return gates.every(Boolean) ? 'confirmed' : 'conditional'
}

export function computeIPI(components: IPIComponents): IPIResult {
  // Use max(product, witness_lag) so witness absence independently floors IPI.
  // A pure product collapses to 0 when any upstream component is 0,
  // which would hide a stale human witness behind zero anomaly signals.
  const product =
    components.anomaly_density *
    components.dissent *
    components.volatility
  const score = Math.max(product, components.witness_lag)

  const state = classifyIPI(score)
  const triggered_sentinels = getSentinelsForState(state)
  const human_required = score >= 0.95

  // NOTE: fountain_status here reflects the IPI gate only.
  // Full FAP confirmation (Section VIII) requires evaluateFAP() with
  // GI, volatility, quorum coherence, HERMES cleanliness, and witness
  // continuity inputs. Callers must combine both evaluations.
  return {
    score,
    state,
    components,
    triggered_sentinels,
    fountain_status: human_required
      ? 'suspended'
      : score >= 0.80
      ? 'conditional'
      : 'conditional',   // IPI alone cannot confirm — FAP gates also required
    human_required,
    computed_at: new Date().toISOString(),
  }
}

function classifyIPI(score: number): IPIState {
  if (score < 0.30) return 'stable'
  if (score < 0.60) return 'elevated'
  if (score < 0.80) return 'critical_drift'
  if (score < 0.95) return 'constitutional_instability'
  return 'integrity_crisis'
}

function getSentinelsForState(state: IPIState): string[] {
  switch (state) {
    case 'stable':
      return []
    case 'elevated':
      return ['HERMES', 'ECHO']
    case 'critical_drift':
      return ['HERMES', 'ECHO', 'AUREA', 'JADE']
    case 'constitutional_instability':
      return ['HERMES', 'ECHO', 'AUREA', 'JADE', 'ATLAS', 'EVE']
    case 'integrity_crisis':
      return ['HERMES', 'ECHO', 'AUREA', 'JADE', 'ATLAS', 'EVE', 'ZEUS']
  }
}
```

**New contract test:** `tests/contract/ipiEscalation.test.ts`

Test requirements:
1. `{anomaly_density:0.5, dissent:0.4, volatility:0.4, witness_lag:0.20}` → score `max(0.08, 0.20)=0.20`, state `stable`, no sentinels, fountain `conditional` (IPI gate only; FAP needed for `confirmed`)
2. `{anomaly_density:0.8, dissent:0.7, volatility:0.8, witness_lag:0.10}` → score `max(0.448, 0.10)=0.448`, state `elevated`, HERMES + ECHO only
3. `{anomaly_density:0.9, dissent:0.9, volatility:0.9, witness_lag:0.10}` → score `max(0.729, 0.10)=0.729`, state `critical_drift`, AUREA + JADE added, ZEUS not present
4. `{anomaly_density:0.95, dissent:0.95, volatility:0.95, witness_lag:0.10}` → score `max(0.857, 0.10)=0.857`, state `constitutional_instability`, ATLAS + EVE added, ZEUS not present
5. `{anomaly_density:0.99, dissent:0.99, volatility:0.99, witness_lag:0.10}` → score `max(0.970, 0.10)=0.970`, state `integrity_crisis`, all sentinels including ZEUS, fountain `suspended`, `human_required: true`
6. Witness floor: `{anomaly_density:0, dissent:0, volatility:0, witness_lag:0.75}` → score `max(0, 0.75)=0.75`, state `critical_drift` — witness absence escalates even with zero anomaly signal
7. FAP gate: `computeIPI` with score 0.24 returns `fountain_status: 'conditional'`; only `evaluateFAP({gi:0.97, gi_volatility:0.02, quorum_coherence:0.91, hermes_clean:true, witness_lag_ok:true})` returns `'confirmed'`
8. Peak Integrity Fallacy: GI sequence [0.96, 0.98, 1.00, 0.79] → ZEUS flags anomaly

**Snapshot-lite integration:**

Add `ipi` block to snapshot-lite response. `fountain_status` in this block
reflects IPI gate + FAP gate combined; callers must run `evaluateFAP()` and
take the stricter of the two results:

```json
{
  "ipi": {
    "score": 0.24,
    "state": "stable",
    "fountain_status": "conditional",
    "human_required": false,
    "triggered_sentinels": []
  },
  "fap": {
    "gi": 0.97,
    "gi_volatility": 0.02,
    "quorum_coherence": 0.91,
    "hermes_clean": true,
    "witness_lag_ok": true,
    "result": "confirmed"
  }
}
```

---

## X. Source Lineage

This EPICON consolidates and extends:

| Source | Contribution |
|--------|-------------|
| `MOBIUS_CANON_LAWS.md` §VIII | Anti-Goodhart Architecture (5 structural defenses) |
| `MOBIUS_CANON_LAWS.md` §IX | Judan's Participation Law (witness_lag variable) |
| `SENTINEL_CONSTITUTION.md` | Prime Directives, ZEUS halt authority, loop-breaking |
| `MOBIUS_CANON_LAWS.md` §III | Loop-Breaking Principle |
| C-352 session | Incentive reframe, accountability as controlled burn |
| Bitcoin BIP-0009 / difficulty adjustment | Cadence preservation parallel |

---

## Final Canonical Statement

```
Static integrity becomes theater.
Living integrity must remain adversarially accountable to reality.
```

This is the function of IDA.
This is the function of cadence.
This is the function of Mobius.

---

## Amendment Protocol

To amend this EPICON:

1. Open a PR with EPICON intent block stating which law or threshold changes and why
2. ZEUS must review the IPI thresholds — any change to escalation bands requires ZEUS sign-off
3. Human custodian (Michael / kaizencycle) must approve
4. No amendment may lower the IPI ≥ 0.95 human witness requirement
5. No amendment may grant ATLAS halt authority without full constitutional review
6. Commit format: `epicon(C-NNN): IDA amendment — [description]`
