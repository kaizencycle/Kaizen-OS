# C-397 — Reserve Block collision reconciliation witness

**Cycle:** C-397  
**Status:** EVIDENCE RECOVERED · TRACK R REPAIR NOT APPLIED  
**Source audit:** [Terminal Actions run 29710940106](https://github.com/kaizencycle/mobius-civic-ai-terminal/actions/runs/29710940106)  
**Source SHA:** `346cdc13630fa9415cef9d95ede95dcfdb59c721`  
**Audited:** 2026-07-20T01:28:54.815Z

## Finding

The Reserve Block incident is a **lineage collision**, not corruption of the preserved seal bodies.

| Metric | C-397 witness |
|---|---:|
| Attested seal records | 319 |
| Unique `block_number` positions | 194 |
| Hash-divergent collision pairs | 125 |
| Contested positions | 123 |
| Clean positions | 71 |
| Three-way positions | 1, 2 |

The 125 pair count is explained exactly:

- 121 contested positions have two candidate seals → 121 collision pairs.
- Blocks 1 and 2 each have three candidates → 2 collision pairs per position.
- `121 + 2 + 2 = 125`.

**Contested ranges:** 1–33 and 42–131.  
**Clean ranges:** 34–41 and 132–194.

The complete 125 pair witness (kept/dropped seal IDs, cycles, quorum, timestamps, divergence flag) is preserved in
[`C397_RESERVE_BLOCK_COLLISION_WITNESS.json`](./C397_RESERVE_BLOCK_COLLISION_WITNESS.json).

## What the C-368/C-397 cold snapshot proves

The 194-line cold snapshot is internally cryptographically valid:

- 194 contiguous positions
- 9,700 MIC at 50 MIC per position
- both `.dat` SHA-256 digests match `MANIFEST.json`
- every `prev_hash` link and per-block hash verifies
- chain tip matches the manifest

That proves **artifact integrity**. It does not, by itself, adjudicate which competing historical seal belongs in each of the 123 contested positions.

## Track R recovery gate

C-397 therefore carries the snapshot forward without pretending dedupe equals adjudication.

1. Preserve all original seal bodies.
2. Do not renumber or delete competing seals.
3. Generate reconciliation receipts for the 123 contested `block_number` positions.
4. Require ZEUS + EVE + human/custodian approval for hash-divergent repair.
5. Apply only through the existing guarded C-373 collision-repair transaction.
6. Re-run the pair-count audit against production KV.
7. Do not disengage `SEAL_INTEGRITY_GATE` until the live audit and canonical-count evidence resolve.
8. Only after reconciliation should `canonical_reserve_blocks` resolve from Track R evidence.

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| 125 collisions are real pair-count findings | **TRUE** | Terminal run 29710940106; 125/125 hash-divergent |
| The 125 occupy 125 different blocks | **FALSE** | 123 positions; blocks 1–2 are three-way |
| Preserved seal bodies are hash-corrupt | **FALSE** | lineage audit: 319/319 hashes valid |
| The 194-line cold snapshot is internally valid | **TRUE** | C-397 independent verifier replay |
| All 194 positions are adjudicated canon | **FALSE** | 123 positions remain contested |
| Safe clean positions exist | **TRUE** | 34–41 and 132–194 = 71 positions |
| Production Track R repair has been applied | **UNVERIFIED / NO CLAIM** | Requires approved operator execution |

## Restraint row

- No production KV mutation in this PR.
- No `SEAL_INTEGRITY_GATE` disable.
- No historical seal deletion, rewrite, or renumber.
- No MIC issuance or conversion change.
- No UI-derived canonical count.
- No claim that cryptographic chain validity substitutes for lineage adjudication.

*One truth, three skins. Canon → Ledger → UI.*
