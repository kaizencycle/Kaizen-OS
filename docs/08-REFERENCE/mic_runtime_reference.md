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

### MIC readiness (C-285 field convergence)

| Concern | Location |
| ------- | -------- |
| Shared readiness shape + `deriveMicReadiness` | `packages/tokenomics-engine/src/readiness.ts` |
| Ledger snapshot payload `MIC_READINESS_V1` + POST helper | `packages/tokenomics-engine/src/readinessClient.ts` |
| Optional cron snapshot (off by default) | Set `MIC_READINESS_SNAPSHOT=1` when running cron; posts to `POST ${LEDGER_BASE_URL}/mic/readiness` (best-effort warn on failure) |

`buildReadinessFromActivities` uses **mean GI** and **summed provisional MIC** from activities as a **proxy** for `reserve.inProgressBalance` and tranche eligibility until Terminal Vault fields are wired in.

---

## Configuration

| Concern | Location |
| ------- | -------- |
| MII weights, reward vs mint vs reserve policy, MIA (soft track), distribution | `configs/tokenomics.yaml` |

**Config note (C-285):** `configs/tokenomics.yaml` separates **live** `reward_accounting` (engine + `MIC_REWARD_V2`) from `reserve_policy`, `mint_authorization`, `quorum_requirements`, and `planned_runtime_fields`. Do not read reward attestations as formal circulation-class minting; see `mint_authorization.semantics`.

---

## Terminal (hot truth)

Operational GI, Vault balance, Seals, and tripwires are **not** fully represented in Substrate markdown. For live values, use the **Mobius Civic AI Terminal** public APIs (for example `/api/terminal/snapshot-lite`) as referenced in the handbook and `docs/protocols/agent-reporting-protocol.md`.

---

## Issuance layer (not yet a single binary path)

Mint authorization, Seal-attested genesis blocks, and Fountain unlock are specified under:

- `docs/04-TECHNICAL-ARCHITECTURE/mic/`  
- `docs/protocols/vault-v2-sealed-reserve.md`  

They are **not** yet implemented end-to-end inside `tokenomics-engine` (which currently stops at reward attestations).
