# MIC Issuance Protocol v1

**Status:** Proposed canonical runtime spec (documentation)  
**Repo:** `Mobius-Substrate`  
**Supersedes as canon:** ad-hoc “MIC as macro token” framing in older narrative docs

---

## Purpose

Define **MIC (Mobius Integrity Credits)** as a **runtime protocol primitive** backed by measured integrity, distinct from speculative macro-economic storytelling.

This document separates:

1. **Reward accounting** — provisional MIC-weighted scores from activity  
2. **Reserve accumulation** — value held in non-circulating reserve until rules allow progression  
3. **Mint authorization** — constitutional GI + sustain + quorum + replay gates  
4. **Ledger commit** — immutable attestation of a mint-class event  

---

## Canonical definition

**MIC are minted only when system integrity satisfies constitutional thresholds and the mint event is attested into the ledger (or equivalent attestation surface).**

Reward math may run continuously; **circulating issuance** (or issuance-class ledger rows) requires the issuance layer below.

---

## Why this replaces mixed framing

The repository historically described MIC in three overlapping ways:

- **README / civic narrative:** integrity credits  
- **`packages/tokenomics-engine`:** computed rewards + ledger posts  
- **Supplementary / whitepaper material:** broad economics and policy vision  

This protocol makes the **integrity-gated runtime path** canonical. Macro and institutional scenarios remain valid **research**, not implementation truth.

---

## Source of truth (code and config)

Ground truth for **today’s reward accounting** implementation:

| Artifact | Role |
| -------- | ---- |
| `packages/tokenomics-engine/src/computeReward.ts` | Provisional MIC from activity dimensions × multipliers |
| `packages/tokenomics-engine/src/multipliers.ts` | GI, consensus, novelty, anti-drift scaling |
| `packages/tokenomics-engine/src/ledgerClient.ts` | `GET /mic/activities`, `POST /mic/attestations` |
| `packages/tokenomics-engine/src/giClient.ts` | `GET /gi/snapshot` (when wired) |
| `packages/tokenomics-engine/src/cronPayout.ts` | Batch: fetch activities → compute → write attestations |
| `configs/tokenomics.yaml` | MII weights; `reward_accounting`, `reserve_policy`, `mint_authorization`, `mia_allocation_policy` |
| `infra/cron/compute_rewards.sh` | Scheduled invocation of the payout path |

The **Terminal** and **Vault v2** protocols (`docs/protocols/vault-v2-sealed-reserve.md`, `docs/protocols/agent-reporting-protocol.md`) are the live doctrine for reserve, Seal, and Fountain semantics. This MIC doc **aligns** with them; it does not redefine them.

---

## Current repo behavior (factual)

### Reward computation

`computeReward` builds a **base** from non-negative contributions:

- integrity work  
- human intent  
- coordination value  
- resilience work  

Then multiplies by:

- GI multiplier (`multipliers.ts`)  
- consensus multiplier (sentinel count)  
- novelty multiplier (new knowledge flag)  
- anti-drift multiplier (drift correction flag)  

### Multiplier rules (as implemented)

From `multipliers.ts`:

- `GI < 0.90` → GI multiplier `0` (zero provisional reward from GI lane)  
- `GI >= 0.90` → `(GI - 0.90) / 0.10`  
- Sentinel count `2` → `1.5×`; `3+` → `2.0×`  
- New knowledge → `1.4×`  
- Drift corrected → `3.0×`  

### Payout flow (as implemented)

`cronPayout.ts`:

1. Fetch ledger activities from `/mic/activities`  
2. Compute MIC reward per activity  
3. POST reward breakdown to `/mic/attestations` with type `MIC_REWARD_V2`  

This is **reward accounting and attestation**, not yet a full **constitutional mint ceremony** with Seal quorum and Fountain unlock encoded in the same binary path.

---

## Constitutional upgrade (target state)

Introduce explicit stages:

| Stage | Meaning |
| ----- | ------- |
| **Activity** | Node or human action with integrity relevance |
| **Reward accounting** | Tokenomics engine computes **provisional** MIC-weighted value |
| **Reserve accumulation** | Provisional value accrues to **non-circulating** reserve (Vault / in-progress balance) |
| **Tranche / Seal** | When reserve crosses a **Seal threshold** (50 units in Vault v2), the tranche becomes a **witnessed unit** per protocol |
| **Mint authorization** | Only if GI sustain, replay/novelty, tripwires, and quorum rules pass |
| **Ledger commit** | Mint-class attestation is immutable and hash-linked as required by protocol |

---

## Canonical mint rule (protocol intent)

### Hard gate

**MIC may only *authorize circulation-class mint*** when **GI ≥ 0.95** (align with Vault v2 Fountain sustain doctrine and `configs/tokenomics.yaml` → `mint_authorization.mint_threshold_gi: 0.95`).

### Sustain

**Standard recurring issuance** should require **GI ≥ 0.95 for N sustained cycles** (N = 5 matches current Vault v2 Fountain language in substrate docs; exact enforcement belongs in Terminal / ledger).

### Freeze bands (documentation contract)

| GI band | Intent |
| ------- | ------ |
| `0.95+` sustained | Mint authorization eligible (subject to Seal / quorum / replay) |
| `0.90 ≤ GI < 0.95` | Reserve accumulation allowed; **mint locked** or heavily restricted |
| `0.80 ≤ GI < 0.90` | Repair mode; mint frozen |
| `GI < 0.80` | Constitutional lockdown |

`mii.thresholds.warning` still uses legacy wording (“reduced minting” in older docs); interpret it as **elevated risk band**, not as a description of the live `reward_accounting` engine. Structural split of reward vs mint vs reserve is in `configs/tokenomics.yaml` (C-285); see [MIC repo restructure plan](./MIC_REPO_RESTRUCTURE_PR_PLAN.md).

---

## Reserve model

Below mint threshold, **rewards are not discarded** in the target model: they accumulate as **MIC-eligible reserve** (Vault reserve units, non-transferable, proof-bearing). Conversion to circulating MIC happens only through **valid mint conditions**. See [MIC reserve model](./mic_reserve_model.md) and [Vault v2](../../protocols/vault-v2-sealed-reserve.md).

---

## Tranche / Seal model

Vault v2: **50.00** reserve units per Seal, five-Sentinel attestation, per-Seal Fountain. MIC issuance ceremonies should **reference Seal identity** (hash, sequence) so tranches are not double-counted.

---

## Quorum and replay

See [MIC quorum & attestation](./mic_quorum_attestation.md). Replay / novelty pressure should **block** mint authorization when signals indicate synthetic farming; exact thresholds live in Terminal configuration, not in this markdown file.

---

## API direction (non-binding)

Suggested future HTTP surface (Terminal or ledger):

- `GET /v1/mic/reserve`  
- `GET /v1/mic/tranches`  
- `POST /v1/mic/mint/preview`  
- `POST /v1/mic/mint/authorize`  
- `POST /v1/mic/mint/commit`  
- `GET /v1/mic/blocks/:id`  

---

## Tokenomics compatibility

The tokenomics engine remains the **reward scoring layer**. Vault / Seal / quorum / mint block semantics are the **issuance layer**. Both can coexist: one scores continuously; the other authorizes rare, high-ceremony events.

---

## One-line canon

**MIC is not emitted because activity happened; MIC is issued because integrity was proven.**
