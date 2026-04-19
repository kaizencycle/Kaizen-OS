# MIC — Runtime issuance layer

**Mobius Integrity Credits (MIC)** in this repository are defined first as a **runtime protocol primitive**: measured integrity gates whether value becomes issuable, not the other way around.

## Canonical stack (read in order)

| Document | Purpose |
| -------- | ------- |
| [MIC Issuance Protocol v1](./mic_issuance_protocol.md) | Constitutional model: reward accounting vs reserve vs mint |
| [MIC reserve model](./mic_reserve_model.md) | Vault / Seal framing aligned with Terminal doctrine |
| [MIC quorum & attestation](./mic_quorum_attestation.md) | Who must witness issuance-class events |
| [MIC genesis block (draft)](./mic_genesis_block.md) | Example first-mint ceremony and splits |

## Runtime ↔ code

| Document | Purpose |
| -------- | ------- |
| [MIC runtime reference](../../08-REFERENCE/mic_runtime_reference.md) | Maps this spec to `packages/tokenomics-engine`, `configs/tokenomics.yaml`, cron |

## Research vs implementation

- **Canonical (this folder):** integrity-gated issuance, GI sustain rules, Vault v2 alignment, ledger attestations.
- **Research / narrative:** [MIC economics (interpretation)](../../07-RESEARCH-AND-PUBLICATIONS/mic-economics/), [tokenomics studies](../../07-RESEARCH-AND-PUBLICATIONS/tokenomics/), [supplementary tokenomics index](../../11-SUPPLEMENTARY/tokenomics/README.md).

## One-line canon

**MIC is not emitted because activity happened; MIC is issued because integrity was measured, sustained, and attested above constitutional thresholds.**
