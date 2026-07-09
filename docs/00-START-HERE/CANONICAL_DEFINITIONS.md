# Canonical Definitions

**Cycle:** C-363 · **Purpose:** One glossary for contributors and agents

Do not redefine these terms in new docs — link here instead.

---

## Integrity family

| Term | Definition |
|------|------------|
| **Integrity** | Alignment between stated values, recorded intent, and observed behavior over time |
| **GI (Global Integrity)** | Federation-wide integrity score (0–1); Terminal and pulse writers surface it |
| **MII (Mobius Integrity Index)** | Per-system or per-domain integrity index; influences MIC multipliers and gates |
| **MIC (Mobius Integrity Credit)** | Reward accounting for verified civic participation; not cash-like issuance |

---

## Memory and proof

| Term | Definition |
|------|------------|
| **EPICON** | Intent protocol — declares who, why, and what before important actions |
| **EP-1 / EP-2 / EP-3** | EPICON consequence tiers (low-risk record / meaningful state change / consequential action). Distinct from DVA agent tiers T1/T2/T3. Policy assigns tier; unknown actions default EP-3. ([Tiering spec v0.1](../specs/EPICON_TIERING_SPEC_v0.1.md)) |
| **Constitutional EPICON** | Compact ledger commitment derived from operational EPICON before EP-2 (elective) or EP-3 (mandatory) execution — hashes and attestations only, never raw evidence |
| **Reserve Block** | Canonical `.dat` bundle of sealed history; replayable archive unit |
| **Seal** | Vault tranche completion record with sentinel attestations |
| **Attestation** | Signed or logged proof that an event or seal was witnessed |
| **Quorum** | [Seal attestation rule](../protocols/vault-v2-sealed-reserve.md#6-quorum-rules) (Vault v2 §6): ZEUS `pass` required; ≥4 of 5 Seal Sentinels `pass` (ATLAS, ZEUS, EVE, JADE, AUREA); no non-ZEUS `reject` — not the full ten-Sentinel roster |
| **MEC** | Mobius Extraction Code — compact citation address for a Seal / Reserve Block / Epoch; points at EPICON, never replaces it. Corrections mint the next seal (no `S016A` suffixes). ([MEC spec v0.1](../specs/MEC_SPEC_v0.1.md)) |
| **SealCode** | Human-friendly multi-line display of a MEC for operator UI; round-trips to exactly one canonical MEC string |

---

## Surfaces (short)

| Term | Definition |
|------|------------|
| **Substrate** | This repo — constitution, cycles, policy, sentinels |
| **Terminal** | Live civic AI terminal — pulse, vault, journal |
| **Browser Shell** | Public School of Chambers onboarding UI |
| **CPC** | Civic Protocol Core — identity, ledger, MIC wallet services |
| **HIVE** | Playable world layer inside the Shell |

---

## Related

- Legacy expanded glossary: [GLOSSARY.md](./GLOSSARY.md)
- [EPICON philosophy](./EPICON_PHILOSOPHY.md)
- [School of Chambers](./SCHOOL_OF_CHAMBERS.md)

*"We heal as we walk."*
