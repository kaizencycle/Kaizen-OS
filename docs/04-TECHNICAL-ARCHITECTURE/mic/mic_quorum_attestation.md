# MIC quorum and attestation

**Status:** Architecture note — bridges MIC **mint-class** events to Sentinel practice  
**See also:** [MIC Issuance Protocol v1](./mic_issuance_protocol.md), [Vault v2](../../protocols/vault-v2-sealed-reserve.md), [Agent reporting](../../protocols/agent-reporting-protocol.md)

---

## Seal attestation (Vault v2) — canonical roster

Vault v2 defines **five voting Sentinels** on Seal attestation:
**ATLAS, ZEUS, EVE, JADE, AUREA**. This is the operative witness surface.

Each Sentinel attests on a distinct scope (see `vault-v2-sealed-reserve.md` §5):

- **ZEUS** — hash chain verification. Holds unilateral veto. Math must hold.
- **ATLAS** — strategic coherence and deposit diversity.
- **EVE** — ethical clearance and narrative tripwire check.
- **JADE** — constitutional framing and schema conformance.
- **AUREA** — posture stamp. Always counts as pass for quorum. Never blocks.

**HERMES** is not a Seal quorum member in v2 protocol. HERMES is a
steward/routing agent; its attestation scope (routing health) is not defined
in the Seal structure. HERMES participates at genesis as a steward witness
(see `quorum_requirements.genesis_quorum` in `configs/tokenomics.yaml`).

MIC **issuance authorization** should reuse the same **attestation discipline**:

- each Seal / tranche has a **stable identifier** and hash chain  
- each Sentinel attestation carries **verdict**, **rationale**, and **signature** per protocol  
- no double-mint on the same Seal  

---

## MIC mint quorum — ongoing (post-genesis)

Same five-Sentinel roster as Seal attestation. No change for recurring
Fountain emission events.

---

## MIC mint quorum — genesis class

Genesis-class events additionally include **HERMES** as a steward witness
for routing-health certification. This is a superset of the Seal quorum, not
a replacement for it.

Exact thresholds may be tightened by governance; the **invariant** is:
**no mint authorization without multi-party attestation aligned to live Sentinel roles.**

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
