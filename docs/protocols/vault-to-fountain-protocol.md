# Vault-to-Fountain Protocol

# Mobius Integrity Credits — Reserve Emission Framework

**Cycle draft:** C-281  
**Status:** Protocol Spec v1  
**Author:** kaizencycle  
**CC0 Public Domain**

---

## 0. Purpose

The Vault-to-Fountain Protocol turns validated agent reasoning into **delayed** civic value, not instant extraction.

A journal entry should not immediately mint spendable MIC. Instead, it may contribute to a **Vault**, where value is held in reserve until the system proves enough integrity to support public release.

This creates a healthier loop:

**journaled reasoning → quality review → reserve accrual → integrity stability check → controlled public flow**

The protocol exists to reward:

- durable reasoning  
- verified usefulness  
- system-wide stability  
- civic trust  

It exists to prevent:

- spam journals  
- empty synthesis farming  
- reward extraction during degraded conditions  
- short-term opportunism  

---

## 1. Core doctrine

- **A journal is not money.** A journal is a **claim of value**.  
- **A Vault** is stored trust. It holds unrealized value earned by reasoning that has not yet matured.  
- **A Fountain** is public release. It emits value only when the whole system is healthy enough to carry it.

**One-line canon:** Reserve becomes flow only after integrity proves it can hold the weight.

---

## 2. Main objects

### Journal entry

Structured agent output: observation, inference, recommendation, confidence, provenance, timestamp, agent origin.

### Vault

Reserve account accumulating **non-spendable** value derived from journal contributions. Not liquid, not directly distributable.

### Fountain

Release state for a Vault. When activated, value flows outward under constrained rules.

### GI gate

Integrity threshold for release. Base threshold: **GI ≥ 0.95**.

**Sustain window:** GI must remain above threshold for **N** cycles before Fountain activation (suggested **N = 3 to 7**).

**Operational note:** Live GI often runs below 0.95. A **preview** tier at **GI ≥ 0.88** may surface "what would flow" without unlocking full emission (implementation detail).

---

## 3. Lifecycle (stages)

1. **Journal creation** — agent writes structured entry.  
2. **Journal scoring** — merit across quality, novelty, corroboration, impact, survival, duplication.  
3. **Vault deposit** — small **reserve** amount (not spendable MIC).  
4. **Maturity review** — reserve accrues only while entries and system remain trustworthy.  
5. **Fountain activation** — threshold + sustained GI + low contradiction + healthy tripwires.  
6. **Controlled emission** — gradual flow to downstream pools.

---

## 4. Journal scoring model

Composite score **J** from factors **Q, N, C, I, S, D** (quality, novelty, corroboration, impact, survival, duplication penalty), normalized where appropriate.

**Implementation refinement (v1 code):** Pure multiplication can collapse when any factor is near zero. Use a **floor** on **J** (e.g. 0.15) so honest, low-novelty but accurate journals still contribute a small reserve.

---

## 5. Vault deposit formula

```
vault_deposit = B × J × Wg × Wa
```

- **B** — base reserve rate (v1: `1.0`)  
- **J** — journal merit score `[0, 1]`  
- **Wg** — `clamp(GI / 0.95, 0.25, 1.0)`  
- **Wa** — agent trust multiplier (v1: `1.0` for all agents)

Reserve is credited to the Vault, **not** released as spendable MIC.

---

## 6. Vault structure (conceptual)

Fields include: `vault_id`, scope, `balance_reserve`, `status` (`sealed` | `preview` | `activating`), `activation_threshold`, `gi_threshold`, `sustain_cycles_required`, contradiction/tripwire signals, `source_entries`, timestamps.

**v1 repo keys (global vault only):**

| Key | Role |
|-----|------|
| `mobius:vault:global:balance` | Running reserve total (via `kvSet`) |
| `mobius:vault:global:meta` | `VaultState` JSON |
| `vault:deposits` | LPUSH list of `VaultDeposit` JSON (max 200) |

---

## 7. Fountain activation rules (future phase)

Activate only when **all** required conditions hold, for example:

- Vault balance ≥ threshold  
- GI ≥ 0.95  
- GI sustained ≥ N cycles  
- Contradiction rate ≤ maximum  
- Critical tripwires below threshold  
- No emergency integrity lock  

**Not implemented in v1** — deposits and status only.

---

## 8. Fountain emission and distribution (future phase)

Gradual emission; split across citizen / operator / civic reserve / stability / burn (e.g. 40 / 25 / 20 / 10 / 5). Caps per cycle.

---

## 9. Pausing and failure modes

- GI < 0.95 — pause new emissions  
- GI < 0.90 — hard freeze  
- GI < 0.85 — emergency lock, optional reabsorption  

---

## 10. Anti-gaming rules

1. No instant liquidity from journal text alone.  
2. Duplication decay on repeated patterns.  
3. Challenge window (cycles).  
4. Cross-agent validation bonus; copied entries do not compound.  
5. Operator override (pause vault, freeze fountain, quarantine).  
6. Rate caps per agent per cycle.

---

## 11. Ledger event shapes (reference)

**vault_deposit** — `journal_id`, `vault_id`, `agent`, `deposit_amount`, `journal_score`, `gi_at_deposit`, `timestamp`, `status: sealed`, plus `content_signature` for dedup in v1 implementation.

**fountain_activation** / **fountain_emission** — defined in a later spec revision when Fountain ships.

---

## 12. Repository implementation (v1 skeleton)

| Piece | Location |
|-------|----------|
| Scoring, deposit, KV writes | `lib/vault/vault.ts` |
| Operator read | `GET /api/vault/status` → `app/api/vault/status/route.ts` |
| Deposit trigger | After EVE journal + sentinel council journals on `POST/GET` cron path in `app/api/eve/cycle-synthesize/route.ts` |
| Snapshot lane | `vault` in `app/api/terminal/snapshot/route.ts` + `lib/terminal/snapshotLanes.ts` |

**Intentionally not in v1:** Fountain activation, emission math, distribution pools, multiple vault scopes beyond global, per-agent `Wa` variation.

---

## 13. Canon (short)

**The Vault remembers what proved itself. The Fountain releases what can be trusted to flow.**

Reserve becomes flow when integrity holds.

---

*When reasoning proves itself over time, reserve becomes flow. That is when the Vault becomes a Fountain.*
