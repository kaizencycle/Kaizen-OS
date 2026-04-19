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

- `mii.thresholds` — healthy / warning / crisis bands (MII policy signals)  
- `reserve_policy` — Vault v2–aligned semantics (non-circulating reserve, tranche target)  
- `mint_authorization.mint_threshold_gi` — formal mint gate (0.95) alongside `planned_runtime_fields` for sustain / replay / Fountain wiring  

This reserve doc describes **where value sits in the state machine** before it becomes a mint-class ledger fact. The YAML structure (C-285) matches that separation; not every field is enforced in `tokenomics-engine` yet.

**Runtime alignment (PR #274):** `MicReadinessState` in `packages/tokenomics-engine/src/readiness.ts` uses the same field names (`inProgressBalance`, `trancheTarget`, `trancheStatus`, sustain / replay / novelty / quorum / fountain) as the convergence target for Terminal and ledger. Until Vault balances flow from the Terminal, the engine may populate reserve fields from **ledger activity proxies** only.
