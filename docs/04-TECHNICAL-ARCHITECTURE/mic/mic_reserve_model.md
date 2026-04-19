# MIC reserve model

**Status:** Architecture note — aligns MIC wording with **Vault v2**  
**See also:** [Vault v2 — Sealed Reserve](../../protocols/vault-v2-sealed-reserve.md), [MIC Issuance Protocol v1](./mic_issuance_protocol.md)

---

## Intent

**Reserve** holds integrity-weighted value that is **earned but not yet issuable** as circulating MIC. Reserve is:

- **non-circulating** in the issuance sense  
- **non-transferable** between parties in the civic model  
- **proof-bearing** (attestations, hashes, Seal metadata)  
- **convertible** to issuance-class events only through constitutional gates (GI sustain, quorum, replay checks, Fountain rules)  

---

## Vault v2 mapping

| Vault v2 object | MIC layer meaning |
| --------------- | ----------------- |
| `in_progress_balance` | Running accumulator toward the next Seal (0 ≤ x < 50 units) |
| **Seal** | Discrete 50-unit parcel with five-Sentinel attestation chain |
| **Fountain** | Per-Seal emission lifecycle when GI sustain and tripwire rules allow |

MIC **reward accounting** can deposit into this conceptual reserve continuously; **mint authorization** consumes reserve / Seal context when the ceremony passes.

---

## Relationship to `configs/tokenomics.yaml`

`minting.threshold_mii` and crisis bands describe **MII/GI policy** at the config layer. This reserve doc describes **where value sits in the state machine** before it becomes a mint-class ledger fact.

A future config revision should add explicit fields, for example:

```yaml
# Illustrative — not yet in repo
minting:
  threshold_mii: 0.95
  sustain_cycles_required: 5
  reserve_mode_below_threshold: true
  direct_mint_below_threshold: false
```

Until then, treat `tokenomics.yaml` as **partially legacy** for mint wording but still useful for weights and research alignment.
