# MIC genesis block (draft)

**Status:** Draft ceremony spec — **not** yet enforced by `tokenomics-engine`  
**See also:** [MIC Issuance Protocol v1](./mic_issuance_protocol.md), [Vault v2](../../protocols/vault-v2-sealed-reserve.md)

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
| Quorum | [MIC quorum & attestation](./mic_quorum_attestation.md) satisfied |

---

## Example issuance amount (illustrative)

**95.00 MIC** total (example only — economics team may revise)

| Bucket | MIC |
| ------ | --- |
| Reserve | 38.00 |
| Operator | 19.00 |
| Sentinel pool | 19.00 |
| Civic test | 9.50 |
| Burn / locked | 9.50 |

This split is **not** implemented in `computeReward.ts`; it is a **target** for when mint-class ledger rows exist.

---

## Ledger payload (sketch)

```json
{
  "type": "MIC_MINT_GENESIS_V1",
  "seal_id": "<Seal identifier>",
  "gi": 0.95,
  "sustain_cycles": 5,
  "amount_mic": 95.0,
  "splits": {
    "reserve": 38.0,
    "operator": 19.0,
    "sentinel_pool": 19.0,
    "civic_test": 9.5,
    "burn_locked": 9.5
  },
  "attestations": ["<hash>", "..."]
}
```

---

## Migration

Until the issuance layer ships, the repo continues to emit **`MIC_REWARD_V2`** attestations from the cron path. Genesis block semantics apply **after** mint authorization is implemented in the Terminal / ledger.
