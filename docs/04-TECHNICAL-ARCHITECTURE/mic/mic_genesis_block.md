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

## Ledger payload (sketch)

`genesis_hash` is the SHA-256 (hex) over the **canonical JSON** serialization of the payload **omitting** the `attestations` array and the `genesis_hash` field itself, so attestors sign a stable preimage. Implementations should document the exact canonicalization (aligned with `packages/tokenomics-engine`).

```json
{
  "type": "MIC_MINT_GENESIS_V1",
  "cycle_id": "C-XXX",
  "sealed_at": "<ISO timestamp>",
  "seal_id": "<Seal identifier — e.g. seal-C-286-001>",
  "vault_seal_hash": "<sha256 of the Seal record — cryptographic link>",
  "prev_seal_hash": null,
  "gi": 0.95,
  "gi_sustained_cycles": 5,
  "gi_sustain_window": ["C-XXX", "C-XXX-1", "C-XXX-2", "C-XXX-3", "C-XXX-4"],
  "amount_mic": 95.0,
  "splits": {
    "reserve": 38.0,
    "operator": 19.0,
    "sentinel_pool": 19.0,
    "civic_test": 9.5,
    "burn": 4.75,
    "locked": 4.75
  },
  "locked_release_condition": "GI >= 0.95 for 5 cycles post-genesis or burn after 90 cycles",
  "attestations": ["<sentinel_hash>", "..."],
  "quorum_agents": ["ZEUS", "ATLAS", "EVE", "JADE", "AUREA"],
  "genesis_hash": "<sha256 over canonical serialization of entire payload pre-attestations>"
}
```

---

## Migration

Until the issuance layer ships, the repo continues to emit **`MIC_REWARD_V2`** attestations from the cron path. Genesis block semantics apply **after** mint authorization is implemented in the Terminal / ledger.
