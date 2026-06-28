# [C-357] Reserve Block .dat Canonization — Substrate Infrastructure

**EPICON:** C-357 | RESERVE_BLOCK_DAT_CANONIZATION
**Repo:** kaizencycle/Mobius-Substrate
**Branch:** `c357-dat-canonization`
**Authority:** Founder Standing DVA.02 — Infrastructure Recovery

---

## Summary

Establishes the cold-canon archive path for 319 sealed Reserve Blocks (15,950 MIC)
currently blocked by 278 attestation errors on the broken live JWT `/ledger/attest` path.
This PR lands the Substrate side: the `.dat` file format spec, the GitHub Actions
verification workflow, and the companion package files for the Terminal and CPC.

The Terminal and CPC changes are delivered as drop-in files under `docs/pr-packages/c357/`
— ready to be opened as PRs in their respective repos without further authoring.

---

## What changed

### Canon specification
- **`MOBIUS_RESERVE_BLOCK_DAT.md`** — Full format spec: NDJSON `.dat` files (100 blocks/file),
  SHA-256 hash chain, `MANIFEST.json`, CPC integration contract, verification rules.

### EPICON record
- **`docs/epicon/EPICON-C357-DAT-001.md`** — Intent record with `## Authority Provenance`
  and infrastructure-recovery classification.

### Verification script
- **`scripts/verify-dat-chain.js`** — Node.js chain verifier (no build step).
  - Reads `canon/reserve-blocks/*.dat` and `MANIFEST.json`
  - Verifies file SHA-256, NDJSON parse, hash chain linkage, cross-file continuity
  - Exit codes: `0` valid, `1` invalid, `2` missing files
  - GitHub Actions outputs: `file_count`, `total_blocks`, `manifest_hash`, `chain_tip`

### GitHub Actions workflow
- **`.github/workflows/reserve-block-canonization.yml`** — Triggers on push to
  `canon/reserve-blocks/**.dat` or `MANIFEST.json`:
  1. Runs `verify-dat-chain.js` — fails the job on invalid chain
  2. Writes summary table with chain metrics
  3. Posts EPICON canonization event to Terminal (main branch only, dry-run bypass)
  - EPICON payload replaces the broken live JWT attestation path for historical
    blocks (C-338–C-353).

### PR package for Terminal (`mobius-civic-ai-terminal`)
Files under `docs/pr-packages/c357/` — copy to the Terminal repo as-is:

| File | Target path in terminal |
|------|------------------------|
| `terminal-lib-types.ts` | `lib/dat/types.ts` |
| `terminal-lib-hashDatRecord.ts` | `lib/dat/hashDatRecord.ts` |
| `terminal-lib-fetchAllSealedBlocks.ts` | `lib/vault/fetchAllSealedBlocks.ts` |
| `terminal-lib-hashAnchor.ts` | `lib/cpc/hashAnchor.ts` |
| `terminal-lib-canonize.ts` | `lib/dat/canonize.ts` |
| `terminal-script-canonize-reserve-blocks.ts` | `scripts/canonize-reserve-blocks.ts` |
| `terminal-component-AttestationStatus.tsx` | `components/vault/AttestationStatus.tsx` |
| `terminal-api-canon-trigger-route.ts` | `app/api/admin/canon/trigger/route.ts` |

### PR package for CPC (`mobius-civic-platform`)
| File | Target path in CPC |
|------|-------------------|
| `cpc-routes-canon_reserve_blocks.py` | `api/routes/canon_reserve_blocks.py` |
| `cpc-migration-c357_dat_hash_anchors.py` | `alembic/versions/c357_dat_hash_anchors.py` |

---

## Architecture

```
Vault KV (319 sealed blocks)
        │
        ▼ fetchAllSealedBlocks.ts
        │  strategy: KV index → KV scan → REST API
        │
        ▼ canonize.ts (orchestrator)
        │  builds NDJSON .dat files, SHA-256 chain
        │
        ├──► Vercel Blob: canon/reserve-blocks/blk0001.dat … blk0004.dat
        │                                       MANIFEST.json
        │
        └──► CPC: POST /api/canon/reserve-blocks/anchor
                  stores hash proof per .dat file
                  (not block data — proofs only)

Substrate repo (this PR):
  canon/reserve-blocks/   ← git-committed .dat files
        │
        ▼ reserve-block-canonization.yml
          verify-dat-chain.js → EPICON event → Terminal
```

---

## Hash chain design

```
Genesis hash: "0000...0000" (64 zeros, no "sha256:" prefix)

For each block record:
  preimage = JSON.stringify(record_without_block_hash)
  block_hash = "sha256:" + SHA256(preimage + prev_hash).hex()

File SHA-256:
  file_hash = "sha256:" + SHA256(ndjson_content).hex()

Chain is continuous across file boundaries:
  blk0001.dat chain_tip → blk0002.dat genesis_prev_hash
```

---

## Deployment sequence

1. **CPC first** — apply Alembic migration, deploy FastAPI route
2. **Terminal** — deploy the new lib files and API route; run canonization:
   ```bash
   npx tsx scripts/canonize-reserve-blocks.ts --verbose
   ```
3. **Substrate** — commit `.dat` files and `MANIFEST.json` from Blob, push to
   trigger verification Action

Required secrets (Terminal):
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob write access
- `CPC_API_BASE` — CPC service URL
- `AGENT_SERVICE_TOKEN` — shared service auth token

Required secrets (this repo, for EPICON post):
- `SUBSTRATE_SERVICE_TOKEN`
- `TERMINAL_API_BASE`

---

## Test plan

- [ ] `node scripts/verify-dat-chain.js canon/reserve-blocks/` passes on sample data
- [ ] Workflow triggers on `.dat` file push, writes summary, exits 0 on valid chain
- [ ] Chain verifier exits 1 on corrupted block hash
- [ ] Terminal: `canonize-reserve-blocks.ts --dry-run` completes without writes
- [ ] CPC anchor endpoint returns `action: "anchored"` on first POST
- [ ] CPC anchor endpoint returns `action: "idempotent"` on duplicate POST
- [ ] CPC anchor endpoint returns 409 on same `dat_file` with different hash

---

## References

- EPICON intent: `docs/epicon/EPICON-C357-DAT-001.md`
- Format spec: `MOBIUS_RESERVE_BLOCK_DAT.md`
- Vault sealed blocks: 319 blocks, cycles C-338–C-357
- MIC at stake: 15,950 (319 × 50.00)
- Attestation errors being resolved: 278

🤖 Generated with Claude Code
