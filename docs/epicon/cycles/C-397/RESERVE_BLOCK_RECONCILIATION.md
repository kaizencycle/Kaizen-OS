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

C-397 does **not** ship a regenerated `.dat` candidate in this tree—the canon rollback left checked-in `canon/reserve-blocks/` unchanged from `main`. What is preserved here is **verification evidence only**: the 125-pair witness JSON, the C-377 audit provenance, and the witness-table row recording that PR #419's 194-position candidate replayed as internally valid (`chain_tip_hash` `sha256:aefebc6cf87df587f601c55d9b269214d35d6a1621c333177b8bd39455d140d8` at commit `97607a52` documentation time—not retrievable as a Substrate artifact after rollback). Track R operators must re-export or re-verify from KV before any promotion; nothing in this PR substitutes for that artifact.

1. Preserve all original seal bodies.
2. Do not renumber or delete competing seals.
3. Generate reconciliation receipts for the 123 contested `block_number` positions.
4. Require ZEUS + EVE + human/custodian approval for hash-divergent repair.
5. Apply only through the existing guarded C-373 collision-repair transaction.
6. Re-run the pair-count audit against production KV.
7. Do not disengage `SEAL_INTEGRITY_GATE` until the live audit and canonical-count evidence resolve.
8. Only after reconciliation should `canonical_reserve_blocks` resolve from Track R evidence.

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

C-397 invokes **founder–custodian standing** only to preserve reconciliation evidence and hold the Reserve Block canon gate fail-closed while lineage is contested.

### Scope Constraints

This authority is narrowly scoped to:

- preserving the C-377 pair-count witness,
- preserving the verification facts for the cold-snapshot candidate without publishing it as canon,
- requiring Track R evidence before canonical promotion,
- requesting independent sentinel and human review.

It does **not** authorize production KV mutation, seal deletion/rewrite/renumbering, gate disablement, MIC issuance changes, or unilateral selection of canonical winners.

### Temporality & Revocation

This authority is transitional, contestable, and non-transferable. It may be superseded or revoked by a successor EPICON, ratified governance process, or contrary reconciliation evidence.

### Legitimacy Rationale

The integrity hold affects consequential ledger state. Making the custodian action explicit is preferable to allowing an implicit operator choice to decide which historical lineage becomes canon.

### Acknowledgement of Risk

The proposer acknowledges that founder authority is asymmetric and that the deterministic export winner is not automatically the legitimate historical winner. Future governance may revise this decision while preserving the evidence trail.

### Sunset Condition

This C-397 authority expires for this incident when either:

1. Track R reconciliation is approved and canonical-count evidence is published, or
2. a successor governance/EPICON decision supersedes C-397.

The separate intent timebox in PR #429 remains an outer bound.

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| 125 collisions are real pair-count findings | **TRUE** | Terminal run 29710940106; 125/125 hash-divergent |
| The 125 occupy 125 different blocks | **FALSE** | 123 positions; blocks 1–2 are three-way |
| Preserved seal bodies are hash-corrupt | **FALSE** | lineage audit: 319/319 hashes valid |
| The regenerated 194-line snapshot candidate is internally valid | **TRUE** | C-397 independent verifier replay of #419 candidate |
| All 194 positions are adjudicated canon | **FALSE** | 123 positions remain contested |
| Safe clean positions exist | **TRUE** | 34–41 and 132–194 = 71 positions |
| Production Track R repair has been applied | **UNVERIFIED / NO CLAIM** | Requires approved operator execution |

## Restraint row

- No production KV mutation in this PR.
- No canonical `.dat` or manifest change before Track R adjudication.
- No `SEAL_INTEGRITY_GATE` disable.
- No historical seal deletion, rewrite, or renumber.
- No MIC issuance or conversion change.
- No UI-derived canonical count.
- No claim that cryptographic chain validity substitutes for lineage adjudication.

*One truth, three skins. Canon → Ledger → UI.*
