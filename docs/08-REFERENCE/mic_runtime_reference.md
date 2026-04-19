# MIC runtime reference

**Purpose:** Map **MIC documentation** to **code and cron paths** that exist in this repository today.

**Canonical issuance doctrine:** [MIC Issuance Protocol v1](../04-TECHNICAL-ARCHITECTURE/mic/mic_issuance_protocol.md)  
**Live Vault doctrine:** [Vault v2](../protocols/vault-v2-sealed-reserve.md)

---

## Reward accounting (implemented)

| Concern | Location |
| ------- | -------- |
| MIC score from activity | `packages/tokenomics-engine/src/computeReward.ts` |
| GI / consensus / novelty / drift multipliers | `packages/tokenomics-engine/src/multipliers.ts` |
| GI snapshot fetch | `packages/tokenomics-engine/src/giClient.ts` (`GET ${GI_BASE_URL}/gi/snapshot`) |
| Ledger IO | `packages/tokenomics-engine/src/ledgerClient.ts` (`/mic/activities`, `/mic/attestations`) |
| Cron batch | `packages/tokenomics-engine/src/cronPayout.ts` |
| Shell entry | `infra/cron/compute_rewards.sh` |

**Attestation payload type today:** `MIC_REWARD_V2` (see `ledgerClient.ts`).

---

## Configuration

| Concern | Location |
| ------- | -------- |
| MII / minting thresholds, distribution, MIA track | `configs/tokenomics.yaml` |

**Note:** YAML still describes dual-track / warning-band mint language. The [MIC issuance protocol](../04-TECHNICAL-ARCHITECTURE/mic/mic_issuance_protocol.md) documents the **directional split** between reward scoring and mint authorization; a follow-up PR should align YAML keys.

---

## Terminal (hot truth)

Operational GI, Vault balance, Seals, and tripwires are **not** fully represented in Substrate markdown. For live values, use the **Mobius Civic AI Terminal** public APIs (for example `/api/terminal/snapshot-lite`) as referenced in the handbook and `docs/protocols/agent-reporting-protocol.md`.

---

## Issuance layer (not yet a single binary path)

Mint authorization, Seal-attested genesis blocks, and Fountain unlock are specified under:

- `docs/04-TECHNICAL-ARCHITECTURE/mic/`  
- `docs/protocols/vault-v2-sealed-reserve.md`  

They are **not** yet implemented end-to-end inside `tokenomics-engine` (which currently stops at reward attestations).
