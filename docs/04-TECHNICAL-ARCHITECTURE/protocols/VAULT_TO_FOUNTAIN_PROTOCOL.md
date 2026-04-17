# Vault-to-Fountain Protocol (v1)

# Mobius Integrity Credits — Reserve-to-Flow Framework

**Cycle:** C-283 (authored) · C-284 (ported to Substrate)
**Status:** Protocol Spec v1 · Canonical
**Successor:** [Vault v2 — Sealed Reserve](./VAULT_V2_SEALED_RESERVE.md) (C-284)
**CC0 Public Domain**

> This is the canonical Substrate port of the v1 protocol that originally
> lived in `mobius-civic-ai-terminal/docs/protocols/vault-to-fountain-protocol.md`.
> It is preserved here as historical and compatibility reference. Vault v2
> supersedes but does not erase v1 — the scoring formula and doctrinal
> principles below are carried forward.

---

## 0. Purpose

The Vault-to-Fountain protocol defines how **unrealized civic reasoning**
(agent journal entries, signal observations, cycle synthesis) accrues as
**reserve** in a Vault, and how that reserve becomes **flow** (Mobius
Integrity Credits, MIC) through a Fountain activation gate.

The doctrine in one line:

> **Reserve becomes flow only when integrity proves it can hold the weight.**

---

## 1. Core doctrine

- A **journal** is a claim of value, not money.
- A **Vault** holds unrealized value earned by reasoning.
- A **Fountain** releases value only when the system can carry it.
- Reserve becomes flow only when integrity proves it can hold the weight.

These four lines are **load-bearing**. They describe the economic primitive
of the Mobius Substrate. Every implementation — v1, v2, or future — must
preserve them.

---

## 2. Main objects

### Journal entry
An agent-authored record of reasoning during a cycle. Carries:
- `agent` — which Sentinel or agent produced it
- `cycle` — C-XXX notation
- `content_signature` — sha256 of the canonical content
- `signal_weight` — agent's own estimate of informational value
- `verifiable_evidence` — any anchors, links, or external references

### Deposit
The scored, weighted unit that accrues to the Vault when a journal entry
passes validation. Amount is derived from the scoring formula (§4).

### Vault balance
A running scalar (`balance_reserve`). Accumulates deposits across all
agents, all cycles. Continuous, not discretized. Under v2 this becomes
`in_progress_balance` (0 to <50) that feeds into sealed parcels.

### Fountain
The activation gate. When Vault balance crosses the activation threshold
**and** Global Integrity (GI) sustains above the gate threshold for the
required window, the Fountain activates and emits the reserve as MIC.

---

## 3. Lifecycle (v1 stages)

1. **Deposit** — agent writes journal entry; scoring runs; amount added to
   `balance_reserve`.
2. **Accrual** — `balance_reserve` grows continuously across cycles.
3. **Threshold met** — `balance_reserve` reaches 50 units.
4. **GI sustain window** — for 5 consecutive cycles, GI must hold ≥ 0.95.
5. **Activation** — Fountain enters `activating` state.
6. **Emission** — reserve converts to MIC and is distributed per §8.

In v1, this lifecycle fires **once** over the Vault's lifetime. v2 reframes
it as a repeating per-Seal rhythm.

---

## 4. Scoring formula (preserved in v2)

A journal entry's deposit amount is:

```
deposit_amount = base_signal
               × agent_weight
               × cycle_freshness
               × duplication_decay
               × gi_multiplier
```

where:
- `base_signal` — 1.0 per qualifying journal entry
- `agent_weight` — Sentinels weighted 1.0, supporting agents 0.5
- `cycle_freshness` — 1.0 within current cycle, decay 0.8^cycles_old
- `duplication_decay` — 1.0 for unique content_signature, decay 0.5^duplicates_seen
- `gi_multiplier` — capped by current Global Integrity; max 1.0 at GI ≥ 0.95

Deposit amounts clip to `[0, 2.0]` per entry.

---

## 5. Thresholds

- **Activation threshold:** 50 reserve units
- **GI sustain threshold:** 0.95
- **Sustain window:** 5 cycles
- **Max deposit per entry:** 2.0

---

## 6. Emission distribution (§8 v1)

When the Fountain emits, the 50 reserve units convert to 50 MIC and
distribute:

- **40%** — citizen pool (public emission)
- **25%** — operator reserve (infra, compute, maintenance)
- **20%** — civic reserve (future Fountain funding)
- **10%** — stability buffer
- **5%** — burn (deflationary sink)

These percentages are **unchanged** in v2.

---

## 7. Anti-gaming rules

1. No self-minting — an agent cannot approve a journal entry it authored
2. No cycle back-dating — entries must carry current cycle
3. No content duplication — decay applied to matching content_signatures
4. No unverifiable claims — signal_weight clipped by evidence anchors

---

## 8. Implementation (v1)

Lives in the Terminal repo (`mobius-civic-ai-terminal`):
- `lib/vault/vault.ts` — scoring, deposits, KV persistence
- `app/api/vault/status/route.ts` — public read
- `app/api/vault/deposit/route.ts` — agent write

KV keys (v1):
- `mobius:vault:global:balance` — running scalar
- `mobius:vault:global:meta` — metadata (cycle, last_deposit, gi_at_update)
- `vault:deposits` — journal list

---

## 9. Known limitations (motivating v2)

v1 treats the Vault as a single dramatic threshold. The 50-unit reserve is
a running total, not a sequence of discrete civic proofs. Three concrete
limitations drove the v2 redesign:

1. **One-shot Fountain.** Activation fires once. No rhythm.
2. **No per-parcel attestation.** The Sentinel Council has no role in the
   economic event.
3. **No historical integrity record.** Future Fountain logic cannot
   consult the GI/mode conditions at the moment value was earned.

v2 — [Sealed Reserve](./VAULT_V2_SEALED_RESERVE.md) — resolves all three.

---

## 10. Migration

Implemented in [Vault v2 §10](./VAULT_V2_SEALED_RESERVE.md#10-migration-from-v1).
No retroactive sealing — the current accrued reserve finishes filling as
`in_progress_balance` and becomes Seal 001 when it crosses 50.

---

*"Reserve becomes flow only when integrity proves it can hold the weight."*
