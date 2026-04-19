# MIC quorum and attestation

**Status:** Architecture note — bridges MIC **mint-class** events to Sentinel practice  
**See also:** [MIC Issuance Protocol v1](./mic_issuance_protocol.md), [Vault v2](../../protocols/vault-v2-sealed-reserve.md), [Agent reporting](../../protocols/agent-reporting-protocol.md)

---

## Seal attestation (Vault v2)

Vault v2 defines **five voting Sentinels** on Seal attestation: **ATLAS, ZEUS, EVE, JADE, AUREA**. That council is already the operative witness surface for **Seal** candidates.

MIC **issuance authorization** should reuse the same **attestation discipline**:

- each Seal / tranche has a **stable identifier** and hash chain  
- each Sentinel attestation carries **verdict**, **rationale**, and **signature** per protocol  
- no double-mint on the same Seal  

---

## MIC mint quorum (documentation contract)

For **genesis-class** or **first-Fountain** mint events, require:

**Required attestors (v1 doc contract):**

- ZEUS — verification / hash / math lane  
- ATLAS — strategic coherence  
- JADE — constitutional framing  
- HERMES — routing / operational health (steward witness)  

**Stabilizer (at least one healthy):**

- EVE *or* AUREA  

Exact agent lists may be tightened by governance; the **invariant** is: **no mint authorization without multi-party attestation aligned to live Sentinel roles.**

---

## Replay / novelty

Mint authorization must be **denied** when replay or novelty signals indicate **synthetic farming** or repeated low-signal output. Operational thresholds live in the **Terminal** and snapshot APIs (`/api/terminal/snapshot-lite`, tripwire lanes), not in static markdown.

---

## Ledger surface

Today’s code path posts **reward attestations** to `/mic/attestations`. Mint-class events should extend that pattern (or a versioned sibling route) with:

- explicit `type` (e.g. `MIC_MINT_V1`)  
- Seal / cycle references  
- attestation bundle hashes  

See [MIC runtime reference](../../08-REFERENCE/mic_runtime_reference.md).
