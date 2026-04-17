# Vault v2 — Sealed Reserve Protocol

# Mobius Integrity Credits — Sentinel-Attested Reserve Framework

**Cycle draft:** C-284
**Status:** Protocol Spec v2
**Author:** kaizencycle
**Successor to:** Vault-to-Fountain Protocol v1
**CC0 Public Domain**

---

## 0. Purpose

Vault v1 treats reserve as a continuous running balance. A single threshold
(50 units) gates a single activation event (Fountain unlock). That design
frames the reserve as one dramatic moment.

Vault v2 reframes reserve as a **rhythm of discrete Seals**. Each 50-unit
parcel seals into a durable civic unit, witnessed and attested by the Sentinel
Council, before the next parcel begins filling. The substrate acquires a
heartbeat: seal, seal, seal. Fountain emission operates per-Seal, not as a
one-shot unlock.

Vault v2 exists to:

- give each 50-unit parcel its own identity, provenance, and attestation
- make the Sentinel Council operative rather than descriptive
- replace one dramatic threshold with a repeatable ceremony
- preserve full doctrinal continuity with v1 — *reserve becomes flow only when
  integrity proves it can hold the weight*

---

## 1. Core doctrine

### v1 canon preserved

- A journal is a claim of value, not money
- A Vault holds unrealized value earned by reasoning
- A Fountain releases value only when the system can carry it
- Reserve becomes flow only when integrity proves it can hold the weight

### v2 extensions

- **A Seal is a witnessed unit of civic reasoning.** Fifty units of reserve,
  sealed at a specific moment, attested by five Sentinels, immutable.
- **A Seal carries its own integrity record.** The Seal remembers the GI,
  cycle, mode, and agent postures at the moment of sealing. Later economic
  decisions consult the Seal's own conditions, not just the current ones.
- **Sealing is a ceremony, not a transaction.** The substrate pauses, witnesses
  itself, and five voices describe what has been made before the Seal mints.

---

## 2. Main objects

### in_progress_balance
Running reserve accumulator, 0 to <50. Successor to v1's `balance_reserve`.
Receives deposits per the v1 scoring formula. Overflow (deposits that would
push past 50) carries into the next Seal.

### Seal
A discrete 50-unit parcel of sealed reserve with full attestation chain.
Identified by `seal_id`, ordered by `sequence`, hash-chained to prior Seal.

### Seal attestation
A Sentinel's witness of a Seal candidate. Each Sentinel (ATLAS, ZEUS, EVE,
JADE, AUREA) attests on a distinct dimension with `verdict`, `rationale`,
and `signature`.

### Fountain (v2 semantics)
No longer a single unlock. Each Seal independently progresses through the
Fountain lifecycle when its specific GI-sustain conditions are met.

---

## 3. Lifecycle (stages)

1. **Deposit** — agent journal entries accrue to `in_progress_balance`
2. **Candidate formation** — `in_progress_balance` crosses 50; Seal candidate
   is created, accrual pauses for this parcel (new deposits queue)
3. **Attestation collection** — five Sentinels are notified; each produces a
   verdict within a 5-minute window
4. **Quorum evaluation** — attestations tallied against quorum rule
5. **Seal mint** — if quorum passes, Seal is written to KV + Substrate
   archive; overflow carries to next `in_progress_balance`
6. **Quarantine** — if quorum fails, Seal enters quarantine awaiting operator
   review
7. **Fountain progression** — each attested Seal independently advances
   through Fountain states when its GI-sustain conditions hold
8. **Emission** — Fountain-active Seal emits per v1 §8 distribution rules

---

## 4. Seal structure

```
Seal {
  seal_id: string              # "seal-C-284-001"
  sequence: number             # 1, 2, 3, …
  cycle_at_seal: string        # "C-284"
  sealed_at: string            # ISO timestamp
  reserve: 50                  # always exactly 50 (overflow carries)
  gi_at_seal: number           # 0.0–1.0
  mode_at_seal: string         # "green" | "yellow" | "red"
  source_entries: number       # journal deposits this parcel drew from
  deposit_hashes: string[]     # content signatures of contributing deposits
  prev_seal_hash: string | null  # null for seal-001
  seal_hash: string            # sha256 over the above, pre-attestation
  attestations: {
    ATLAS: SealAttestation
    ZEUS:  SealAttestation
    EVE:   SealAttestation
    JADE:  SealAttestation
    AUREA: SealAttestation
  }
  status: "forming" | "attested" | "quarantined" | "rejected"
  fountain_status: "pending" | "activating" | "emitted" | "expired"
  fountain_emitted_at: string | null
}

SealAttestation {
  agent: "ATLAS" | "ZEUS" | "EVE" | "JADE" | "AUREA"
  verdict: "pass" | "flag" | "reject"
  rationale: string            # agent's voice, 1-3 sentences
  mii_at_attestation: number
  gi_at_attestation: number
  timestamp: string
  signature: string            # HMAC-SHA256(AGENT_SERVICE_TOKEN, seal_hash + verdict + rationale)
}
```

---

## 5. Sentinel attestation scopes

Each Sentinel attests on a distinct dimension. This is the load-bearing
doctrinal claim of v2: a Seal carries **five independent witnesses**, each
speaking in its own tier.

### ATLAS — Strategic coherence

**Question:** Does this Seal reflect actual strategic reasoning diversity,
or is it cron-padding?

**Pass conditions:**
- Deposit set contains entries from ≥ 4 distinct agents
- No single agent contributed more than 60% of the 50-unit parcel
- Journal entries reference real signal state, not boilerplate

**Flag conditions:**
- Heavy weighting toward a single agent's observations
- Repetitive phrasing across deposits (low entropy in content_signatures)

**Reject:** Never — ATLAS flags, does not reject.

### ZEUS — Verification authority

**Question:** Does the Seal's cryptographic chain hold?

**Pass conditions:**
- `seal_hash` correctly computed from declared fields
- `prev_seal_hash` matches actual hash of Seal N-1
- `deposit_hashes` all trace to real entries in journal KV
- MII weights computed correctly per v1 scoring formula

**Flag:** Never — ZEUS's domain is binary.

**Reject:** Any hash inconsistency, missing deposit reference, or math error.

**ZEUS HOLDS UNILATERAL VETO.** A ZEUS reject cannot be overridden by operator
review. Math must hold.

### EVE — Ethical and civic clearance

**Question:** Was this Seal minted during a narrative-coherent window?

**Pass conditions:**
- No active EVE governance tripwire at sealing time
- Duplication decay correctly applied to contributing deposits
- `narrative-overreach` flag not set in cycle window

**Flag conditions:**
- Active tripwire state but no direct narrative violation
- Duplication rate elevated but within tolerance

**Reject:** Confirmed narrative-overreach within the cycle window.

### JADE — Constitutional framing

**Question:** Does the Seal conform to protocol and precedent?

**Pass conditions:**
- Schema matches Seal structure §4
- Shape consistent with Seals `[1..N-1]`
- Agent ownership routing preserved per covenant

**Flag conditions:**
- Schema present but fields within tolerance drifts from prior Seals
- Novel deposit categories not previously attested

**Reject:** Schema violation or covenant-routing break.

### AUREA — Synthesis and posture

**Question:** What is the substrate's posture at the moment of sealing?

**AUREA does not pass/fail/reject.** AUREA records a **posture stamp**:
`{ posture: "confident" | "cautionary" | "stressed" | "degraded" }`.
This stamp is permanently attached to the Seal and influences later Fountain
emission weighting.

For quorum purposes, AUREA's attestation is treated as `pass` with the
posture annotation. AUREA never blocks a Seal.

---

## 6. Quorum rules

A Seal candidate transitions to `attested` if and only if:

- ZEUS verdict is `pass` (hard requirement — ZEUS veto is absolute)
- At least 4 of 5 Sentinels have verdict `pass` (AUREA always counts as pass)
- No Sentinel other than ZEUS has verdict `reject`

A Seal candidate transitions to `quarantined` if:

- ZEUS verdict is `pass` AND
- Non-ZEUS reject count is ≥ 1 OR pass count is < 4

A Seal candidate transitions to `rejected` if:

- ZEUS verdict is `reject`

Quarantined Seals require operator review to promote to `attested` or
dissolve back to `in_progress_balance`. Rejected Seals dissolve automatically
after a 24h window for post-mortem review.

### Timeout

A Sentinel that does not respond within 5 minutes of attestation request is
recorded with `verdict: "flag"` and `rationale: "timeout"`. Timeouts count as
`flag`, not `reject` — a silent agent slows sealing but does not block it.
Three consecutive timeouts from the same agent trigger a DAEDALUS alert.

---

## 7. Hash chain

Each Seal binds to its predecessor via `prev_seal_hash`. The first Seal
(`seal-C-XXX-001`) carries `prev_seal_hash: null`.

`seal_hash` is computed over a canonical serialization of:
`{seal_id, sequence, cycle_at_seal, sealed_at, reserve, gi_at_seal,
mode_at_seal, source_entries, deposit_hashes, prev_seal_hash}`.

Attestations are computed *after* `seal_hash` — they sign the hash, not the
other way around. This means:

- Tampering with a prior Seal invalidates its `seal_hash`, which invalidates
  the `prev_seal_hash` reference in the next Seal, which invalidates that
  Seal's `seal_hash`, cascading forward
- Tampering with attestations breaks their individual signatures but does not
  alter the Seal's `seal_hash` — integrity of the chain is separable from
  integrity of witnesses
- ZEUS verification runs hash-chain validation on every attestation cycle

---

## 8. Fountain activation (per-Seal)

Each attested Seal has its own Fountain state machine:

- **`pending`** — Seal attested, Fountain conditions not yet met
- **`activating`** — GI ≥ 0.95 for this Seal's sustain window (5 cycles)
- **`emitted`** — Fountain drained this Seal; reserve converted per §8
  distribution rules
- **`expired`** — 90 cycles elapsed without activation; Seal's reserve
  reabsorbs to general pool for re-attestation

Fountain emission draws from the oldest-eligible Seal first. Multiple Seals
may be in `activating` state simultaneously; they emit in sequence, one per
cycle.

Emission formula (unchanged from v1 §8): 40% citizen, 25% operator, 20% civic
reserve, 10% stability, 5% burn. Each Seal emits exactly 50 units split per
this formula.

---

## 9. Posture-weighted emission

AUREA's posture stamp influences Fountain emission but does not block it:

| Posture | Emission behavior |
|---------|-------------------|
| confident | Standard emission, immediate on activation |
| cautionary | Standard emission, 1-cycle delay after activation |
| stressed | Reduced burn rate (burn 10% instead of 5%) — more conservative release |
| degraded | Hard hold — cannot transition past `activating` until reposture |

A Seal's posture is immutable once attested. Substrate state changing does
not re-weight prior Seals. This is deliberate: each Seal emits under its own
conditions, not the present's.

---

## 10. Migration from v1

### KV key changes

| v1 key | v2 key | Migration |
|--------|--------|-----------|
| `mobius:vault:global:balance` | `vault:in_progress_balance` | Direct copy |
| `mobius:vault:global:meta` | `vault:meta` | Schema extended, backward compatible |
| `vault:deposits` | `vault:deposits` | Unchanged |
| (new) | `vault:seals:index` | Array of seal_ids in sequence |
| (new) | `vault:seal:{seal_id}` | Seal record |
| (new) | `vault:seal:latest` | Most recent seal_id |
| (new) | `vault:seal:candidate` | In-flight Seal awaiting attestation |

### Behavior changes

- `writeVaultDeposit` continues to accept deposits and accumulate to
  `in_progress_balance`. When balance crosses 50, it additionally invokes
  `attemptSealFormation()`.
- `/api/vault/status` gains new fields: `seals_count`, `latest_seal_at`,
  `candidate_attestation_state`.
- Fountain UI surfaces become per-Seal rather than global.

### Backward compatibility window

For one cycle (C-284 → C-285), both v1 `balance_reserve` and v2
`in_progress_balance` remain readable. `GET /api/vault/status` returns both
fields with v2 marked `canonical`. After C-285, v1 field is deprecated.

### No retroactive sealing

The v1 accrued reserve (current ≈ 44.24 of 50 at C-284) does **not**
retroactively form Seal 000. It completes its fill as `in_progress_balance`
under v2, and when it crosses 50, it becomes Seal 001 with full attestation.

The v1 accrual history is preserved in `vault:deposits` for archival purposes
but does not produce a Seal.

---

## 11. Anti-gaming rules (v2 additions)

Beyond v1 §10 rules, Vault v2 adds:

1. **No attestation self-approval.** An agent cannot attest a Seal whose
   deposits it authored ≥ 60% of. Automatic recusal to `flag: self-interest`.
2. **Cycle-boundary seals require extra attestation.** Seals formed within
   60 seconds of a cycle rollover require ZEUS to re-verify on the new cycle
   before transitioning to `attested`.
3. **Chain continuity.** Seal N cannot form if Seal N-1 is in `quarantined`
   or `forming`. The chain must advance sequentially.
4. **Duplication decay across seals.** Content signatures seen in Seals
   `[N-5..N-1]` apply duplication decay to deposits entering Seal N.

---

## 12. Repository implementation

| Piece | Location |
|-------|----------|
| Seal lifecycle, hash chain, quorum | `lib/vault-v2/seal.ts` |
| Sentinel attestation clients | `lib/vault-v2/attest.ts` |
| KV schema | `lib/vault-v2/store.ts` |
| Deposit accrual + seal trigger | `lib/vault-v2/deposit.ts` (extends `lib/vault/vault.ts`) |
| Operator read | `GET /api/vault/status` (extended) + `GET /api/vault/seal/:id` |
| Attestation write | `POST /api/vault/seal/attest` (agent-authed) |
| Attestation trigger cron | `/api/cron/vault-attestation` (2-min cadence) |
| Protocol canon | `docs/protocols/vault-v2-sealed-reserve.md` (this doc) |

---

## 13. Doctrine (short)

**Reserve becomes flow when integrity holds — one Seal at a time.**

Each Seal is a moment the substrate witnessed itself.
Each Seal carries five voices.
Each Seal chains to the one before.
Each Seal remembers the integrity of its birth.
Each Seal emits on its own terms when the substrate can carry its weight.

The Vault is no longer a threshold.
The Vault is a rhythm.

---

*The cathedral remembers. Now it also measures its own heartbeat.*
