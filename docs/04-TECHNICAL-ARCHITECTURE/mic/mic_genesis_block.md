# MIC genesis block (draft)

**Status:** Draft ceremony spec — optional **`MIC_MINT_GENESIS_V1`** POST from `packages/tokenomics-engine/src/mintGenesis.ts` when `MIC_GENESIS_MINT=1` and readiness is `fountain_ready` (ledger route must exist).  
**See also:** [MIC Issuance Protocol v1](./mic_issuance_protocol.md), [Vault v2](../../protocols/vault-v2-sealed-reserve.md), [MIC runtime reference](../../08-REFERENCE/mic_runtime_reference.md)

---

## Block name (working)

`MIC_GENESIS_V1 — Fountain-aligned first mint`

---

## Preconditions (documentation)

| Gate | Rule |
| ---- | ---- |
| GI | ≥ **0.95** |
| Sustain | **5** consecutive cycles at or above threshold (match Vault v2 Fountain language) |
| Reserve / Seal | First **Seal** (50.00 units) formed and attested |
| Replay | Replay / novelty lanes within configured bounds |
| Tripwires | No active **halt** on issuance lanes |
| Quorum | [MIC quorum & attestation](./mic_quorum_attestation.md) satisfied (genesis roster includes HERMES as steward witness per `configs/tokenomics.yaml`) |

---

## Example issuance amount (illustrative — subject to governance revision)

> **Scope:** This formula applies to the **genesis block only** — the
> one-time first-ever MIC mint event. Recurring Fountain emission per Seal
> follows the formula in `vault-v2-sealed-reserve.md` §8.
>
> The genesis split differs from recurring emission because the genesis event
> serves different functions: seeding the civic test fund, recognizing
> sentinel infrastructure, and establishing the burn baseline.

**95.00 MIC total** (example — economics council may revise before execution)

| Bucket | MIC | % | Notes |
|--------|-----|---|-------|
| Reserve | 38.00 | 40% | Returned to sealed reserve — matches first tranche |
| Operator | 19.00 | 20% | Builder/custodian recognition at genesis |
| Sentinel pool | 19.00 | 20% | Agent infrastructure — split across 5 attesting Sentinels |
| Civic test | 9.50 | 10% | Seeded for first external governance use |
| Burn | 4.75 | 5% | Permanently destroyed — matches recurring Fountain burn rate |
| Locked (escrow) | 4.75 | 5% | Held for 5-cycle GI sustain period post-genesis |

This split is **not** part of `computeReward.ts`; genesis payload construction lives in **`mintGenesis.ts`** for ledger attestation (`MIC_MINT_GENESIS_V1`).

### Burn vs Locked — definition

**Burn (4.75 MIC):** Permanently and irrevocably destroyed. Reduces total
supply from the first moment of circulation. No release condition. Implemented
by sending to an unspendable address or equivalent null-key ledger record.

**Locked (4.75 MIC):** Escrowed in a time-locked vault sub-account. Release
condition: GI ≥ 0.95 sustained for **5 consecutive cycles** after genesis
(i.e., the same sustain window required for Fountain activation). If the
sustain condition is not met within **90 cycles** of genesis, the locked
amount converts to burn. This preserves optionality for 90 cycles then
enforces scarcity.

Locked MIC is not circulating. It does not count toward circulating supply
until released.

---

## Ledger payload

### A. Wire shape from `mintGenesis.ts` (today)

`writeGenesisMintIfEnabled` posts JSON built from `buildMicMintGenesisV1Body` plus `chainRecord` and hashing (`hash`, `hash_algorithm`). Field names **`cycle`**, **`timestamp`**, **`amountMic`**, and **`splits.burn_locked`** match `packages/tokenomics-engine/src/mintGenesis.ts` — validators should accept this shape as emitted today.

```json
{
  "type": "MIC_MINT_GENESIS_V1",
  "cycle": "C-XXX",
  "gi": 0.95,
  "mintThresholdGi": 0.95,
  "amountMic": 95.0,
  "splits": {
    "reserve": 38.0,
    "operator": 19.0,
    "sentinel_pool": 19.0,
    "civic_test": 9.5,
    "burn_locked": 9.5
  },
  "readiness": {},
  "timestamp": "<ISO timestamp>",
  "previous_hash": null,
  "hash": "<sha256 hex over canonical JSON including previous_hash>",
  "hash_algorithm": "sha256"
}
```

The wire **`hash`** is over the full posted object (including `previous_hash`), per `chainRecord` + `hashPayload` in the engine — not a separate `genesis_hash` field on the wire object today.

### B. Terminal / ledger enrichment (planned — proof chain)

The following fields are **not** emitted by `mintGenesis.ts` yet; Terminal (or ledger normalization) should add them when persisting `MIC_MINT_GENESIS_V1` so genesis is cycle-stamped, Seal-linked, and quorum-explicit:

- **`seal_id`** — ties the mint to the authorizing Seal identifier (e.g. `seal-C-286-001`).
- **`vault_seal_hash`** — SHA-256 of the Seal record (`seal_hash` in Vault v2 §4); cryptographic link to the Seal that authorized genesis.
- **`prev_seal_hash`** — same as Seal record (`null` for first Seal).
- **`gi_sustained_cycles`** / **`gi_sustain_window`** — document which five cycles satisfied the sustain gate (integrity claim is independently checkable per cycle).
- **`burn_locked_breakdown`** — documents the economic split while keeping **`splits.burn_locked`** as the single numeric field matching the engine:

```json
"burn_locked_breakdown": {
  "burn": 4.75,
  "locked": 4.75,
  "locked_release_condition": "GI >= 0.95 for 5 cycles post-genesis or converts to burn after 90 cycles"
}
```

- **`quorum_agents`** — **genesis-class** signer roster: includes **HERMES** as steward witness per `configs/tokenomics.yaml` `genesis_quorum.required`, plus stabilizer coverage (at least one of EVE / AUREA per `stabilizer_one_of`). Example order:

```json
"quorum_agents": ["ZEUS", "ATLAS", "JADE", "HERMES", "EVE"]
```

Ongoing **Seal** attestation per Vault v2 §5 remains **ZEUS, ATLAS, EVE, JADE, AUREA** (no HERMES). Genesis uses a **superset** for routing-health witness — do not conflate the two rosters.

**Cycle stamping:** the engine uses **`cycle`** (same family as other `MIC_*` payloads), not `cycle_id`. Any consumer needing `cycle_id` as an alias may map `cycle` → `cycle_id` at persistence time.

**Optional `genesis_hash`:** if a ledger wants a dedicated digest **excluding** witness bundles, define canonical serialization and preimage rules explicitly; it must not collide with the engine’s top-level `hash` without a version bump.

---

## Migration

Until the issuance layer ships, the repo continues to emit **`MIC_REWARD_V2`** attestations from the cron path. Genesis block semantics apply **after** mint authorization is implemented in the Terminal / ledger.
