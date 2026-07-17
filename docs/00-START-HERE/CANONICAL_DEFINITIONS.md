# Canonical Definitions

**Cycle:** C-363 · **Purpose:** One glossary for contributors and agents

Do not redefine these terms in new docs — link here instead.

---

## Integrity family

| Term | Definition |
|------|------------|
| **Integrity** | Alignment between stated values, recorded intent, and observed behavior over time |
| **GI (Global Integrity)** | Federation **attested estimate** of integrity (0–1); a witness, not objective truth. See [GI perception doctrine](../04-TECHNICAL-ARCHITECTURE/integrity/GI_PERCEPTION_DOCTRINE.md) |
| **MII (Mobius Integrity Index)** | Per-system or per-domain integrity index; witnesses evaluator reliability — subject to collusion monitoring per C-369 |
| **MIC (Mobius Integrity Credit)** | **Rare constitutional recognition** of verified stewardship after provenance, replay, quorum, and time — not a direct learning reward |
| **MFS (Mobius Fractal Shard)** | Non-transferable attestation of demonstrated capability or learning; portfolio evidence — **not** currency, collateral, or arithmetic input to MIC. See [MFS constitutional doctrine](../04-TECHNICAL-ARCHITECTURE/integrity/MFS_CONSTITUTIONAL_DOCTRINE.md) |
| **Integrity Grade** | User-requested portfolio review workflow; may lead to possible MIC recognition — never automatic mint. See [workflow](../04-TECHNICAL-ARCHITECTURE/integrity/INTEGRITY_GRADE_WORKFLOW.md) |
| **Fountain** | Provisional eligibility gate when GI survives sustained verification and audit — **not** an automatic MIC trigger. See [Fountain doctrine](../04-TECHNICAL-ARCHITECTURE/integrity/FOUNTAIN_ANTI_GAMING_DOCTRINE.md) |
| **GI95** | Provisional high-integrity condition (`PROVISIONAL_GI95` → `SUSTAINED_GI95`); opens review window only after adversarial checks — not a farming target |

---

## Memory and proof

| Term | Definition |
|------|------------|
| **EPICON** | Intent protocol — declares who, why, and what before important actions |
| **EP-1 / EP-2 / EP-3** | EPICON consequence tiers (low-risk record / meaningful state change / consequential action). Distinct from DVA agent tiers T1/T2/T3. Policy assigns tier; unknown actions default EP-3. ([Tiering spec v0.1](../specs/EPICON_TIERING_SPEC_v0.1.md)) |
| **Constitutional EPICON** | Compact ledger commitment derived from operational EPICON before EP-2 (elective) or EP-3 (mandatory) execution — hashes and attestations only, never raw evidence |
| **Reserve Block** | Canonical `.dat` bundle of sealed history; replayable archive unit. **Attribution** to a contributor is not ownership of the archive. See [attribution doctrine](../04-TECHNICAL-ARCHITECTURE/integrity/RESERVE_BLOCK_ATTRIBUTION.md) |
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
- C-369 integrity canon: [Goodhart resistance](../04-TECHNICAL-ARCHITECTURE/integrity/GOODHART_RESISTANCE_DOCTRINE.md)

*"We heal as we walk."*
