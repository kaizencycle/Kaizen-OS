# C-368 PR7 — Prime count clarification (194 vs ~350)

**Date:** 2026-07-12  
**Context:** Codex review on [PR #380](https://github.com/kaizencycle/Mobius-Substrate/pull/380)  
**Operator cycle:** C-370

---

## Question

The C-368 runbook expected `MANIFEST.total_blocks >= 350`, but the prime export shows
**194 blocks / 9,700 MIC**. Is this a partial export that should be re-run?

## Answer: no re-export needed — counting model was wrong

**Re-exporting with the same pipeline reproduces 194.** The gap is not missing export rows;
it is duplicate `block_number` collisions in hot KV.

| Metric | Value | Meaning |
|---|---|---|
| Raw attested seal records | 313 | `countSeals()` / `seals_count` — every seal ID in KV |
| Unique `block_number` (sequence) | **194** | MOBIUS01 chain positions after dedupe |
| Collision pairs dropped | 119 | Same `block_number`, different seal from parallel chain eras |
| Cold canon `total_blocks` | **194** | Correct per C-357 spec (one NDJSON line per `block_number`) |

The pre-export "~350" figure conflated three different quantities:

1. **Raw seal index cardinality** (~313–350 attested seal *records* in KV)
2. **v1 MIC balance** (17,450 MIC ÷ 50 = 349 blocks-worth of reserve — not seal count)
3. **Latest-era naming** (`seal-C-368-024` = sequence 24 in C-368, not block 368)

`/api/vault/status` → `reserve_blocks_sealed` reports **seal record count**, not unique
`block_number` max. Until C-370 item 6 deploys, operators must compare
`MANIFEST.total_blocks` against **deduplicated** hot count, not raw `seals_count`.

## Why 194 is the correct prime (not a broken partial)

- Export reads **all** attested seals from KV (`listAllSeals`)
- `dedupeBlocksByNumber` keeps one winner per `block_number` (quorum → `sealed_at` → `seal_id`)
- Resulting chain is **contiguous 1–194**, `verify-dat-chain.js` **CHAIN VALID**
- Blocks 195–349 do not appear because **no attested seal with a unique winning sequence > 194**
  exists in KV at export time — not because export skipped them

Duplicate-era example: block #1 sealed in C-332 and again in C-359 — only one can occupy
`block_number: 1` in the hash chain.

## What to do before merge

1. Paste EPICON-02 body from terminal `docs/epicon/cycles/C-370/PR380_body.md`
2. Run `npx tsx scripts/audit-reserve-block-collisions.ts` (terminal repo, KV creds)
3. If `hash_divergent_collisions > 0` → **hold merge** (two different payloads at same number)
4. If hash-divergent count is 0 → verify prime count:  
   `C368_PRIME_EXPECTED_BLOCKS=<unique_block_count> ./docs/epicon/cycles/C-368/c368-verify.sh pr7`  
   (2026-07-12: `C368_PRIME_EXPECTED_BLOCKS=194`)
5. Merge when EPICON gate + audited count match

## Follow-up (C-370, not PR #380 blocker)

- `/api/cron/reserve-canon-integrity` alerts on collisions + hot/cold gap (terminal PR #608)
- Governance decision on whether forked-era duplicate seals should be renumbered or tombstoned

---

*This doc resolves Codex P2 "Re-export the missing reserve blocks" — the missing blocks are
duplicate seal records at existing chain positions, not absent unique block_numbers.*
