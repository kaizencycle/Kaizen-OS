# AUDIT C-374 — Cold Canon Tip Divergence (PR #392)

**Cycle:** C-374 (2026-07-16)  
**Auditor:** ATLAS (Lane A forensics)  
**Ledger ID:** `mobius:substrate:vault-canon-witness-c374`  
**Governing protocol:** [`docs/WITNESS_PROTOCOL.md`](../WITNESS_PROTOCOL.md)  
**Constraint:** Read-only — PR #392 remains **draft**; no canon merge, no KV mutation

**Witnessed at:** 2026-07-16T23:30:00Z (UTC)  
**Repo SHAs at audit time:**

| Repo | `origin/main^{}` |
| --- | --- |
| Mobius-Substrate | `9a7827ab1e775cbfc4987d10ddf2bb4c26957f13` |
| PR #392 head | `7bb5beb2` (`canon/reserve-blocks-prime-c368`) |

**Comparison inputs (witnessed regeneration):**

| Artifact | Source | SHA / timestamp |
| --- | --- | --- |
| **Old export** (merged on `main`) | `git show origin/main:canon/reserve-blocks/` | `generated_at: 2026-07-12T18:50:08.462Z`, tip `sha256:2ccc5e41…` |
| **New export** (PR #392) | `git show origin/canon/reserve-blocks-prime-c368:canon/reserve-blocks/` | `generated_at: 2026-07-16T13:27:25.375Z`, tip `sha256:aefebc6c…` |
| Per-block table | `docs/audits/data/C-374_block_hash_comparison.csv` | 194 rows, machine-readable |

Both chains independently pass `node scripts/verify-dat-chain.js` (MOBIUS01 hash-chain valid for each export; tips differ).

---

## Executive verdict

Identical **totals** (194 blocks / 9,700 MIC) with a different **tip** is an alarm, not reassurance. Forensics show **six** `block_number` slots where the **sealed body** (seal identity and metadata) differs between exports — not merely serialization reordering. The new export reflects **collision-resolution selection drift** in `dedupeBlocksByNumber()` as KV state evolved between 2026-07-12 and 2026-07-16.

Per handoff counterfactual: *if ANY original sealed body hash differs, #392 closes unmerged*. **Custodian disposition: close #392 unmerged** pending Gate G3 production collision capture and reconciliation receipt discipline.

---

## Witness Table — seven questions

| # | Question | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Why did the chain tip change? | **TRUE** (explained) | First divergent `block_number` is **1** (genesis-adjacent). Old tip `2ccc5e41…` (block 194, `seal-C-332-194`) vs new tip `aefebc6c…` (block 194, same seal id, different `prev_hash` chain). Root cause: blocks **1, 2, 30–33** selected different attested seals from KV collision groups; all subsequent `prev_hash` / `block_hash` values re-derive. |
| 2 | Did any original .dat block body change? | **TRUE** (6 bodies differ) | Slots **1, 2, 30, 31, 32, 33** — different `block_id`, `cycle`, `sealed_at`, `gi_at_seal`, `source_entries`. Full 194-row table in `docs/audits/data/C-374_block_hash_comparison.csv`. **0/194** `block_hash` matches between exports (chain re-anchors from block 1). |
| 3 | Is the export derived from unresolved KV collisions? | **TRUE** (selection uses collision dedupe) | Exporter: `mobius-civic-ai-terminal/scripts/canonize-reserve-blocks.ts` → `fetchAllSealedBlocks` → `dedupeBlocksByNumber` (`lib/dat/reserveBlockCollisions.ts`). `pickPreferredBlock` chooses winner by quorum count, then `sealed_at`, then `seal_id`. Gate G3 collision audit **UNVERIFIED** this cycle — repair receipts **not** applied. |
| 4 | Which 194 records selected; identical sets? | **FALSE** (sets differ) | Same **count** (194) and **block_number** coverage (1–194, no gaps). **Set diff:** 6 `block_id` substitutions (see table below). 188 slots share identical seal metadata excluding hash chain fields. |
| 5 | Selection approved by reconciliation receipts? | **FALSE** (no receipts) | No reconciliation receipt references in PR #392 body, MANIFEST, or export log. C-373 pre-repair witness explicitly notes repair **not** executed. Selection is algorithmic dedupe only. |
| 6 | What does CPC anchor — old, new, or neither? | **NEITHER** (live) | `GET https://civic-protocol-core-ledger.onrender.com/api/canon/reserve-blocks/manifest` → HTTP **404** (`{"detail":"Not Found"}`) at 2026-07-16T23:28Z. CPC health OK; reserve-block manifest route not deployed. |
| 7 | Is authorizing C-368 intent still live? | **AUTHORIZED** | PR #392 intent `expires_at: 2026-10-14T13:27:29.082Z`; generation `2026-07-16T13:27:25Z` — inside window. **Note:** intent is C-368-labeled while handoff is C-374; relabel required if custodian ever re-opens after forensics. |

---

## Question 1 detail — first divergent block

| Field | Old (`main`) | New (PR #392) |
| --- | --- | --- |
| `block_number` | 1 | 1 |
| `block_id` | `seal-C-359-001` | `seal-C-372-001` |
| `cycle` | C-359 | C-372 |
| `sealed_at` | 2026-07-01T09:02:18.052Z | 2026-07-14T04:01:41.168Z |
| `block_hash` | `sha256:ec89e30e…` | `sha256:bfbae53c…` |

Downstream blocks 3–29 retain the **same seal ids** as old export but **different** `prev_hash` / `block_hash` because the chain re-anchors at block 1.

---

## Question 2 — seal body substitutions (load-bearing)

| block_number | Old `block_id` | New `block_id` | Old cycle | New cycle |
| --- | --- | --- | --- | --- |
| 1 | seal-C-359-001 | seal-C-372-001 | C-359 | C-372 |
| 2 | seal-C-359-002 | seal-C-372-002 | C-359 | C-372 |
| 30 | seal-C-337-030 | seal-C-370-030 | C-337 | C-370 |
| 31 | seal-C-338-031 | seal-C-371-031 | C-338 | C-371 |
| 32 | seal-C-338-032 | seal-C-371-032 | C-338 | C-371 |
| 33 | seal-C-338-033 | seal-C-371-033 | C-338 | C-371 |

---

## Question 3 — collision dedupe mechanism

```39:45:mobius-civic-ai-terminal/lib/dat/reserveBlockCollisions.ts
export function pickPreferredSeal(a: Seal, b: Seal): Seal {
  const aQuorum = quorumCount(a);
  const bQuorum = quorumCount(b);
  if (bQuorum !== aQuorum) return bQuorum > aQuorum ? b : a;
  if (b.sealed_at !== a.sealed_at) return b.sealed_at > a.sealed_at ? b : a;
  return b.seal_id > a.seal_id ? b : a;
}
```

When multiple attested seals share a `block_number`, the **newer** seal (by `sealed_at` or `seal_id`) wins. KV growth between exports changed winners at six positions — consistent with unresolved collision state, not with a stable canon selection.

---

## Question 4 — MANIFEST comparison

| Field | Old (`main`) | New (PR #392) |
| --- | --- | --- |
| `generated_at` | 2026-07-12T18:50:08.462Z | 2026-07-16T13:27:25.375Z |
| `total_blocks` | 194 | 194 |
| `total_mic` | 9700 | 9700 |
| `chain_tip_hash` | `sha256:2ccc5e41…` | `sha256:aefebc6c…` |
| `blk0000.dat` sha256 | `sha256:67b78b11…` | changed |
| `blk0001.dat` sha256 | `sha256:0ec62d17…` | changed |

---

## PR #392 disposition (informing custodian — not executed here)

| Action | Recommendation |
| --- | --- |
| Merge #392 | **Do not merge** — six sealed bodies differ; counterfactual triggered |
| Relabel under C-374 | Only after G3 witnessed + reconciliation path defined |
| Fresh export | After Gate G3 capture and receipt-approved repair (separate handoff) |

---

## Lane B cross-reference

Gate G3 production collision capture: **BLOCKED** — see [`docs/epicon/cycles/C-374/production-audit/LANE_B_BLOCKED.md`](../../epicon/cycles/C-374/production-audit/LANE_B_BLOCKED.md). G3 remains **UNVERIFIED**.

---

## Restraint row

| Item | Status |
| --- | --- |
| PR #392 merge/close | NOT EXECUTED (custodian act) |
| KV mutation / receipt application | NOT PERFORMED |
| New canon export | NOT PERFORMED |
| CPC anchor POST | NOT PERFORMED |

---

*Totals are gameable; hashes witness. This audit witnesses divergence — it does not canonize it.*
