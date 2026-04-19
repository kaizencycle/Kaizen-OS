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

**Attestation payload type today:** `MIC_REWARD_V2` (see `ledgerClient.ts`). Each write includes **`hash`** (SHA-256 of canonical JSON over the signed fields) and **`hash_algorithm`: `sha256`**. The hash is computed **before** attaching `hash` / `hash_algorithm` to the wire object.

### MIC integrity hashing (monorepo)

| Concern | Location |
| ------- | -------- |
| Canonical JSON (sorted keys, stable stringify) | `packages/tokenomics-engine/src/canonicalJson.ts` |
| `hashPayload` / `withHash` / `verifyPayloadHash` | `packages/tokenomics-engine/src/hash.ts` |
| `chainRecord` / `previous_hash` for genesis | `packages/tokenomics-engine/src/chainHash.ts` |

**Genesis chain tip:** set `MIC_GENESIS_PREVIOUS_HASH` to the prior block or seal hash hex when minting after the first block (defaults to `null`).

**Terminal repo:** should **display** and **verify** these hashes; canonical hashing stays in the monorepo.

### MIC readiness + activation (C-285 / PR #274–277)

| Concern | Location |
| ------- | -------- |
| Shared readiness shape + `deriveMicReadiness` | `packages/tokenomics-engine/src/readiness.ts` |
| Ledger snapshot `MIC_READINESS_V1` | `packages/tokenomics-engine/src/readinessClient.ts` → `POST /mic/readiness` (best-effort) |
| Fountain eligibility on readiness | `packages/tokenomics-engine/src/fountain.ts` |
| Seal snapshot `MIC_SEAL_V1` | `packages/tokenomics-engine/src/sealWriter.ts` → `POST /mic/seal` when `trancheStatus === eligible_for_seal` (best-effort) |
| Genesis mint attestation `MIC_MINT_GENESIS_V1` | `packages/tokenomics-engine/src/mintGenesis.ts` → `POST /mic/mint/genesis` when `mintReadiness === fountain_ready` **and** `MIC_GENESIS_MINT=1` (best-effort) |
| Orchestrator (seal → sealed transition → fountain → readiness → genesis) | `packages/tokenomics-engine/src/micActivation.ts` |
| Shared ledger POST helper | `packages/tokenomics-engine/src/ledgerMic.ts` |

**Cron:** `runPayoutCron` runs **`runMicActivationPipeline`** when `MIC_ACTIVATION_PIPELINE=1` (runs after reward attestations). Otherwise, legacy **`MIC_READINESS_SNAPSHOT=1`** still posts only readiness.

**Stub env (until Terminal feeds sustain + quorum):**

| Variable | Effect |
| -------- | ------ |
| `MIC_SUSTAIN_CYCLES` | Integer; `>= 5` with `gi >= mintThreshold` sets sustain `satisfied` |
| `MIC_QUORUM_ATTESTED` | Comma/semicolon list of sentinel names — **must match** `readiness.ts` stub quorum today: e.g. `ZEUS,ATLAS,JADE,HERMES` (see warning below) |

`buildReadinessFromActivities` uses **mean GI** and **summed provisional MIC** as a **proxy** for `reserve.inProgressBalance` / tranche eligibility until Vault fields are wired from Terminal. After a seal POST, the pipeline advances readiness to **`sealed`** in-memory for fountain evaluation.

### Runtime quorum field warning (`MIC_QUORUM_ATTESTED`)

`packages/tokenomics-engine/src/readiness.ts` still defines stub **required** sentinels as `ZEUS`, `ATLAS`, `JADE`, `HERMES`. Fountain eligibility requires `quorum.status === 'satisfied'` against that list (`fountain.ts`). **Do not** set `MIC_QUORUM_ATTESTED` to the Vault v2 Seal roster (`ZEUS,ATLAS,EVE,JADE,AUREA`) until `DEFAULT_REQUIRED` in `readiness.ts` is migrated — doing so leaves quorum **partial** and blocks `fountain_ready` / genesis posting.

| Concern | Live (C-285 engine stub) | Target (Vault v2 Seal attestation) |
| ------- | ------------------------ | ------------------------------------ |
| Required attestors for `MIC_QUORUM_ATTESTED` | `ZEUS,ATLAS,JADE,HERMES` | `ZEUS,ATLAS,EVE,JADE,AUREA` |

**Genesis-only HERMES** is specified under `configs/tokenomics.yaml` `quorum_requirements.genesis_quorum`; that is a **documentation / ceremony** contract until Terminal attestation paths encode it.

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

## Issuance layer (client path in repo)

Canonical doctrine:

- `docs/04-TECHNICAL-ARCHITECTURE/mic/`  
- `docs/protocols/vault-v2-sealed-reserve.md`  

The **tokenomics-engine** now emits **optional** ledger payloads (`MIC_READINESS_V1`, `MIC_SEAL_V1`, `MIC_MINT_GENESIS_V1`) when env flags are set. **Ledger and Terminal must implement the routes** for these POSTs to persist; until then, calls are best-effort and logged on failure.

---

## Cross-repo proof contract (C-285)

The proof chain from deposit to reserve to seal to mint spans two repositories.
For the chain to be auditable end-to-end:

| Proof step | Substrate spec | Terminal implementation |
|------------|----------------|------------------------|
| Deposit hash | `vault-v2-sealed-reserve.md` §4 `deposit_hashes[]` | `lib/vault/vault.ts` `writeVaultDeposit()` → `deposit_hash` |
| Reward accounting | `mic_issuance_protocol.md` §reward computation | `packages/tokenomics-engine/src/computeReward.ts` → `MIC_REWARD_V2` |
| Readiness snapshot | `readiness.ts` `MicReadinessState` | `POST /api/mic/readiness` → `MIC_READINESS_V1` |
| Seal formation | `vault-v2-sealed-reserve.md` §3 | `lib/vault-v2/seal.ts` `attemptSealFormation()` |
| Sentinel attestation | `vault-v2-sealed-reserve.md` §4–5 | `POST /api/vault/seal/attest` |
| Seal record | `vault-v2-sealed-reserve.md` §4 | `vault:seal:{seal_id}` KV + `GET /api/vault/seal/:id` |
| Mint authorization | `mint_authorization` in `tokenomics.yaml` | `POST /api/vault/fountain/unseal` (planned) |
| Genesis mint | `mic_genesis_block.md` | `POST /api/mic/mint/commit` (planned) |

**As of C-285:** Steps 1–4 are implemented or scaffolded. Steps 5–8 remain planned.
The proof chain is **traceable but not yet executable end-to-end.**

For current live values, use `GET /api/vault/status` and `GET /api/vault/seal`
on the Terminal. The Terminal is the hot truth; this Substrate is the constitutional
record.
