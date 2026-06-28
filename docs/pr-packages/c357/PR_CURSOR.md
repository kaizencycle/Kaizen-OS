# [C-357] Reserve Block .dat Canonization — Terminal + CPC Changes

**EPICON:** C-357 | RESERVE_BLOCK_DAT_CANONIZATION
**Repos:** `mobius-civic-ai-terminal` + `mobius-civic-platform` (CPC)
**Authority:** Founder Standing DVA.02 — Infrastructure Recovery

> **For Cursor:** This PR description covers the Terminal and CPC file changes.
> The Substrate-side PR (GitHub Actions, format spec, EPICON record) is separate.
> All source files are ready-to-use — copy from `Mobius-Substrate/docs/pr-packages/c357/`.

---

## Context

319 sealed Reserve Blocks (cycles C-338–C-357, 15,950 MIC) are blocked from
attestation by 278 errors on the broken live JWT `/ledger/attest` path. The
solution is a cold-canon path: produce `.dat` NDJSON files with a SHA-256 hash
chain, store hash proofs in CPC, commit the files to the Substrate repo.
The GitHub Actions workflow on Substrate then serves as the attestation authority.

---

## Terminal changes (`mobius-civic-ai-terminal`)

### New files — copy exactly

**`lib/dat/types.ts`** (`terminal-lib-types.ts`)
- `VaultSealedBlock` — raw vault KV shape
- `DatBlockRecord` — `.dat` NDJSON record with hash chain fields
- `DatManifest` / `DatManifestEntry` — MANIFEST.json structure
- `DatHashAnchorPayload` / `DatHashAnchorResponse` — CPC API contract
- `CanonizationResult` / `CanonizationError` — orchestrator return types
- `AttestationDisplayStatus` — vault UI enum

**`lib/dat/hashDatRecord.ts`** (`terminal-lib-hashDatRecord.ts`)
- `hashDatRecord(record, prevHash)` — SHA-256 chain hash
- `buildDatRecord(block, prevHash)` — constructs a full `DatBlockRecord`
- `hashDatFile(content)` — file-level SHA-256
- `verifyDatChain(records, expectedPrevHash?)` — full chain verifier
- `parseDatFile(content)` — NDJSON parser
- Constants: `GENESIS_HASH`, `DAT_VERSION`, `MIC_PER_BLOCK`, `BLOCKS_PER_DAT_FILE`

**`lib/vault/fetchAllSealedBlocks.ts`** (`terminal-lib-fetchAllSealedBlocks.ts`)
- `fetchAllSealedBlocks(opts)` — three-strategy fetch:
  1. `vault:blocks:index` KV key → batched `mget`
  2. `vault:block:*` prefix scan → `mget`
  3. REST API fallback (`/api/vault/blocks/all?page=&limit=&from=&to=`)
- Returns: `{ blocks, total_found, source, gaps, errors }`

**`lib/cpc/hashAnchor.ts`** (`terminal-lib-hashAnchor.ts`)
- `postHashAnchor(payload)` — POST to `CPC_API_BASE/api/canon/reserve-blocks/anchor`
  - Auth: `AGENT_SERVICE_TOKEN` (NOT the identity JWT)
  - 3 retries with exponential backoff (1s, 2s, 3s)
  - Returns `{ success, action: "anchored"|"idempotent", error?, retries? }`
  - 409 → returns `success: false` with "CANON CONFLICT" in error (not retried)
- `fetchCpcManifest()` — GET manifest for vault UI
- `CpcManifestResponse` interface

**`lib/dat/canonize.ts`** (`terminal-lib-canonize.ts`)
- `canonizeReserveBlocks(opts)` — orchestrator:
  1. `fetchAllSealedBlocks` (with gap detection)
  2. Partition into 100-block `.dat` files
  3. `buildDatRecord` + `verifyDatChain` per file
  4. Write to Vercel Blob: `canon/reserve-blocks/blk{N}.dat`
  5. `postHashAnchor` to CPC per file
  6. Mark blocks as canonized in KV (`dat_canonized: true`, `dat_file`)
  7. Write `MANIFEST.json` to Blob
  8. Store index at `dat:canon:index` in KV
- Options: `{ dryRun, fromBlock, toBlock, verbose, epiconCycle }`
- Returns `CanonizationResult`

**`scripts/canonize-reserve-blocks.ts`** (`terminal-script-canonize-reserve-blocks.ts`)
- One-shot CLI bootstrap migration
- Usage: `npx tsx scripts/canonize-reserve-blocks.ts [--dry-run] [--from=N] [--to=N] [--verbose]`
- Validates env vars before running (exits 1 with clear error if missing)
- Prints structured summary with next steps

**`components/vault/AttestationStatus.tsx`** (`terminal-component-AttestationStatus.tsx`)
- `<AttestationStatus block={} cpcManifest={} compact? />` — per-block status chip/card
- `<CanonizationSummary blocks={} cpcManifest? />` — vault overview progress bar
- Status resolution: `canonized_via_dat` > `attested` > `quarantined` > `pending`

**`app/api/admin/canon/trigger/route.ts`** (`terminal-api-canon-trigger-route.ts`)
- `POST /api/admin/canon/trigger` — trigger canonization run
  - Body: `{ dry_run?, from_block?, to_block? }`
  - Auth: `AGENT_SERVICE_TOKEN` bearer
  - `maxDuration: 300` (Vercel Pro required for runs > 60s on 319 blocks)
- `GET /api/admin/canon/trigger` — read `dat:canon:index` from KV

---

## CPC changes (`mobius-civic-platform`)

### `alembic/versions/c357_dat_hash_anchors.py` (`cpc-migration-c357_dat_hash_anchors.py`)

Creates `dat_hash_anchors` table:
```
id                INTEGER PK
dat_file          VARCHAR(32)  UNIQUE  e.g. "blk0001.dat"
file_hash         VARCHAR(73)          "sha256:" + 64 hex chars
block_range_start INTEGER
block_range_end   INTEGER
block_count       INTEGER (1–100)
chain_tip_hash    VARCHAR(73)
manifest_hash     VARCHAR(73)  nullable
version           VARCHAR(16)  default "1.0"
canonized_at      TIMESTAMPTZ
epicon_cycle      VARCHAR(16)  nullable
created_at        TIMESTAMPTZ  default NOW()
```

Constraints: range order check, block_count range, hash prefix checks.
Indexes: `dat_file`, `block_range_start`, `canonized_at`.

SQLAlchemy model stub is in the file as a comment block — paste into `models/canon.py`.

### `api/routes/canon_reserve_blocks.py` (`cpc-routes-canon_reserve_blocks.py`)

Mount at: `app.include_router(router)` — prefix is `/api/canon/reserve-blocks`.

Routes:
- `POST /anchor` — store hash proof (idempotent on `dat_file+file_hash`, 409 on conflict)
  - Validates `dat_file` pattern `blk{4d}.dat`, `file_hash` pattern `sha256:{64hex}`
  - Auth: `AGENT_SERVICE_TOKEN` via `Authorization: Bearer` or `X-Service-Token` header
- `GET /manifest` — public, returns all anchors ordered by `block_range_start`
  - Includes `total_mic_anchored` (blocks × 50)
- `GET /verify/{dat_file}?file_hash=` — hash match check

---

## Environment variables

| Var | Repo | Purpose |
|-----|------|---------|
| `KV_REST_API_URL` | Terminal | Upstash KV |
| `KV_REST_API_TOKEN` | Terminal | Upstash KV |
| `BLOB_READ_WRITE_TOKEN` | Terminal | Vercel Blob write |
| `CPC_API_BASE` | Terminal | CPC service base URL |
| `AGENT_SERVICE_TOKEN` | Terminal + CPC | Shared service auth |
| `TERMINAL_API_BASE` | Substrate Action | For EPICON post |
| `SUBSTRATE_SERVICE_TOKEN` | Substrate Action | For EPICON post |

---

## Deployment order

```
1. Apply CPC migration:   alembic upgrade c357_dat_hash_anchors
2. Deploy CPC route:      register router in app.py
3. Deploy Terminal files: merge this PR
4. Run bootstrap script:  npx tsx scripts/canonize-reserve-blocks.ts --verbose
5. Pull .dat files from Blob and commit to Substrate
6. Substrate Action auto-verifies chain on push
```

---

## Test plan

- [ ] `canonize-reserve-blocks.ts --dry-run` completes, prints 319 blocks, zero writes
- [ ] `canonize-reserve-blocks.ts` (live) writes blk0001–blk0004.dat to Blob
- [ ] CPC `/anchor` returns `action: "anchored"` (first) then `"idempotent"` (repeat)
- [ ] CPC `/anchor` returns 409 on same filename + different hash
- [ ] CPC `/manifest` reflects `total_blocks_anchored: 319`, `total_mic_anchored: 15950`
- [ ] `<AttestationStatus compact>` renders green "Canonized (.dat)" for canonized blocks
- [ ] `<CanonizationSummary>` shows 100% coverage bar after full run
- [ ] Admin `POST /api/admin/canon/trigger` with wrong token returns 401
- [ ] Vault KV blocks have `dat_canonized: true` and correct `dat_file` after run

---

## References

- Format spec: `Mobius-Substrate/MOBIUS_RESERVE_BLOCK_DAT.md`
- EPICON record: `Mobius-Substrate/docs/epicon/EPICON-C357-DAT-001.md`
- Substrate PR: c357-dat-canonization branch in kaizencycle/Mobius-Substrate
- Vault state: 319 sealed blocks, 278 attestation errors, 15,950 MIC
