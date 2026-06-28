# EPICON — C-357 Reserve Block .dat Canonization

**ID:** EPICON-C357-DAT-001
**Cycle:** C-357 (2026-06-28)
**Actor:** Claude Code, operating under operator identity (kaizencycle)
**Consequence class:** Infrastructure — cold canon migration, additive
**Status:** proposed

---

## Intent

Canonize 319 sealed Reserve Blocks (15,950 MIC) that failed live Substrate
attestation (278 errors, root cause: JWT identity token mismatch diagnosed
C-338–C-353) into the `.dat` Reserve Block cold-canon architecture.

This action creates permanent, hash-chained storage in GitHub as the distributed
append-only ledger, with SHA-256 hash anchors posted to CPC. The broken
`/ledger/attest` JWT path is NOT repaired by this action — it is routed around
without data loss.

A GitHub commit to `canon/reserve-blocks/` IS the substrate attestation.
The GitHub Action (`reserve-block-canonization.yml`) verifies chain integrity
before posting the EPICON canonization event.

## Scope

**Changed files (Mobius-Substrate):**
- `docs/epicon/EPICON-C357-DAT-001.md` — this document
- `MOBIUS_RESERVE_BLOCK_DAT.md` — canon specification for .dat format
- `scripts/verify-dat-chain.js` — SHA-256 chain verifier
- `.github/workflows/reserve-block-canonization.yml` — chain verify + EPICON event on push
- `canon/reserve-blocks/` — directory for .dat files (populated by migration script)
- `docs/pr-packages/c357/` — PR packages for terminal and CPC changes

**Companion PRs required (other repos):**
- `mobius-civic-ai-terminal` — `c357-dat-canonization` branch
  - `lib/vault/fetchAllSealedBlocks.ts`, `lib/dat/`, `lib/cpc/hashAnchor.ts`
  - `scripts/canonize-reserve-blocks.ts`, `scripts/verify-dat-chain.js`
  - `app/api/canon/trigger/route.ts`
  - `components/vault/AttestationStatus.tsx`
- `Civic-Protocol-Core` — `c357-dat-canonization` branch
  - `routes/canon_reserve_blocks.py`
  - `alembic/versions/c357_dat_hash_anchors.py`

## Two-Layer Architecture After This Ships

| Layer | Where | Role |
|-------|-------|------|
| Hot state | Upstash KV | Active blocks, current seal, MIC accumulation |
| Cold canon | GitHub `.dat` files | Permanent hash-chained record |
| Proof store | CPC `dat_hash_anchors` | Hash anchors only (not data) |

## What This Does NOT Do

- Does not repair the live `/ledger/attest` JWT path (separate issue)
- Does not delete or modify existing KV vault data
- Does not alter GI computation, MIC mint gate, or sentinel roster
- Does not change MOBIUS_CANON_v0.1.md

## Reversibility

Fully reversible. The `.dat` files are additive. KV vault data is untouched.
CPC hash anchors can be tombstoned via admin API. GitHub commit history is
append-only per constitutional architecture.

## Authority Provenance

Authority declared using EPICON_FOUNDER_STANDING.md

Michael / kaizencycle holds Custodian authority (DVA.02 — Founder Standing).
Changes are infrastructure recovery — cold canon migration for sealed blocks
that could not be attested via the broken live path. No canon mutations, no
attested values modified, no governance surfaces touched.

## Witnesses

ATLAS · ZEUS

## Authorization

Michael / kaizencycle (Custodian, DVA.02)

## Refs

- Follows C-356 PR #330 (unified substrate recovery)
- Resolves: vault terminal `✗ Substrate attestation failed` (278 errored blocks)
- Vault state: 319 sealed · 15,950 MIC · Latest seal: seal-C-356-125
