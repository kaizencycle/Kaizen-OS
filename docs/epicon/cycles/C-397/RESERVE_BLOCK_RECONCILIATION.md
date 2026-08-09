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
| Attested seal records examined (C-377 audit) | 319 |
| Unique `block_number` **candidate** positions (deduped from examined set) | 194 |
| Hash-divergent collision pairs | 125 |
| Contested positions | 123 |
| Clean positions | 71 |
| Three-way positions | 1, 2 |

**Do not read 194 as `canonical_reserve_blocks`.** It is the verified C-377/C-397 **reconciliation candidate** count from the examined attested corpus only. Constitutional canon remains **`canonical_reserve_blocks = unresolved`** until Track R completes (see below).

The 125 pair count is explained exactly:

- 121 contested positions have two candidate seals → 121 collision pairs.
- Blocks 1 and 2 each have three candidates → 2 collision pairs per position.
- `121 + 2 + 2 = 125`.

**Contested ranges:** 1–33 and 42–131.  
**Clean ranges:** 34–41 and 132–194.

The complete 125 pair witness (kept/dropped seal IDs, cycles, quorum, timestamps, divergence flag) is preserved in
[`C397_RESERVE_BLOCK_COLLISION_WITNESS.json`](./C397_RESERVE_BLOCK_COLLISION_WITNESS.json).

## Index cardinality vs examination vs constitutional canon (live, 2026-08-08)

Production vault status exposes **three different lenses** — confusing them caused this incident:

```
360 indexed seal IDs          ← vault:seals:index:attested cardinality (accumulator index)
│
├─ 41 legacy MIC tranche      ← C-299–C-307 (indexed, outside collision audit scope) ✅ classified step 2
│
└─ 319 modern Reserve Block   ← C-308+ attested bodies in C-377 audit / collision witness scope
    ├─ 194 candidate positions ← deduped unique block_number (NOT constitutional canon)
    └─ 125 collision pairs / 123 contested
```

| Lens | Live value (approx.) | Constitutional? |
|------|----------------------|-----------------|
| Indexed seal IDs | 360 | **No** — operator accumulator index |
| Examined attested bodies | 319 | **No** — audit/witness scope |
| Candidate unique positions | 194 | **No** — reconciliation candidate only |
| `canonical_reserve_blocks` | `null` / unresolved | **Yes** — unset until Track R completes |

The **41-ID gap is classified** (Track R step 2, 2026-08-08). Do not publish `canonical_reserve_blocks = 194` or any other fixed count until step 8. The API field must remain unresolved.

**Future Terminal UI (deferred):** surface `360 INDEXED · 319 EXAMINED · 194 CANDIDATE POSITIONS · CANON UNRESOLVED` so operators cannot confuse index cardinality with constitutional canon.

## What the C-368/C-397 cold snapshot candidate proves

The 194-position **candidate** chain (e.g. PR #419 replay) is internally cryptographically valid when re-verified:

- 194 contiguous candidate positions
- 9,700 MIC at 50 MIC per position
- both `.dat` SHA-256 digests match `MANIFEST.json`
- every `prev_hash` link and per-block hash verifies
- chain tip matches the manifest

That proves **artifact integrity of a candidate export**. It does not adjudicate which competing historical seal belongs in each of the 123 contested positions, and it does not resolve the 41-ID index/examination gap.

## Track R recovery gate (ordered)

C-397 does **not** ship a regenerated `.dat` candidate in this tree—the canon rollback left checked-in `canon/reserve-blocks/` unchanged from `main`. What is preserved here is **verification evidence only**: the 125-pair witness JSON, the C-377 audit provenance, and witness-table rows for #419 candidate replay hashes (not retrievable as Substrate artifacts after rollback).

**Merge-ready sequence** — do not skip or reorder without recording why:

1. **Fresh collision audit** — production KV; confirm pair count still matches witness (or regenerate evidence).
2. **Classify the 41 index/examination-gap IDs** — ✅ **done (2026-08-08):** legacy MIC tranche C-299–C-307; see gap witness JSON.
3. **Confirm live unique-position candidate count** — verify whether deduped candidate positions remain 194 after step 1–2 (may change).
4. **Adjudicate the 123 known contested positions** — Track R receipts per position; no silent dedupe winners.
5. **Human + ZEUS + EVE approval** — recorded on PR / consensus gate.
6. **Apply guarded Track R repair** — C-373 collision-repair transaction only; no KV rewrite outside guard.
7. **Post-repair audit** — zero unresolved hash-divergent divergence; `SEAL_INTEGRITY_GATE` may lift only after this.
8. **Determine canonical RB count and regenerate `.dat`** — only after steps 1–7; then `canonical_reserve_blocks` resolves from Track R evidence, not from index cardinality or candidate dedupe alone.

Invariant constraints (all steps):

1. Preserve all original seal bodies.
2. Do not renumber or delete competing seals.
3. Do not disengage `SEAL_INTEGRITY_GATE` until live audit and canonical-count evidence resolve.
4. `canonical_reserve_blocks` stays **unresolved** until step 8 — never preset to 194.

### Track R step 1 — fresh production audit (2026-08-08) ✅

Manual workflow **Audit Reserve Block Lineage #6** on `mobius-civic-ai-terminal@main`:

| Field | Fresh (run [31267379043](https://github.com/kaizencycle/mobius-civic-ai-terminal/actions/runs/31267379043)) | C-377 witness (run 29710940106) | Match? |
|-------|------|------|:---:|
| `raw_attested_count` / `attested_count` | **319** | 319 | ✅ |
| `unique_block_count` (candidate) | **194** | 194 | ✅ |
| `collision_count` / pairs | **125** | 125 | ✅ |
| `hash_divergent_collisions` | **125** | 125 | ✅ |
| `operator_cycle` | C-397 | C-377 | — |
| `audited_at` | 2026-08-08T16:38Z | 2026-07-20T01:28Z | — |

**Step 1 verdict:** collision witness **still valid** — no regeneration of `C397_RESERVE_BLOCK_COLLISION_WITNESS.json` required for pair counts.

**Lineage audit adds structure** (artifact `lineage-audit.json`, same run):

| Finding | Value | Implication |
|---------|-------|-------------|
| `multiple_lineages` | `true` | Collisions are **parallel lineage forks**, not hash corruption |
| `lineage_components` | **4** | Four disconnected `prev_seal_hash` chains among attested seals |
| `genesis_count` | **3** | Three competing genesis seals (blocks 1–2 three-way) |
| `link_issues` | **1** | `seal-C-308-042` seq 42 — `orphan_prev` (prev hash not in attested set) |
| `reattest_clusters` | **1** | 283 seals re-attested in `2026-06-30T20` hour, seq 1–194 |

The four lineage components (by tip):

1. **C-332-001 → C-358-131** — seq 1–131 (131 seals)
2. **C-359-001 → C-371-033** — seq 1–33 (33 seals)
3. **C-372-001 → C-372-002** — seq 1–2 (2 seals)
4. **C-308-042 → C-332-194** — seq 42–194 (153 seals; orphan link at genesis of this fork)

**Still open after step 1:**

- **Step 3:** candidate count still **194** among examined set — unchanged, still **not** constitutional canon.
- **Steps 4–8:** unchanged.

### Track R step 2 — index/examination gap classified (2026-08-08) ✅

Operator KV export (`vault:seals:index`, `:attested`, `:all`, `vault:seal:latest`) proves the **41-ID gap is not a mystery subset** — it is exactly the **legacy MIC tranche era**:

| Segment | Count | Cycle range | First → last seal ID | In collision audit? |
|---------|------:|-------------|----------------------|:---:|
| Legacy MIC tranche | **41** | C-299–C-307 | `seal-C-299-001` → `seal-C-307-041` | No |
| Modern Reserve Block era | **319** | C-308–C-372 | `seal-C-308-042` → `seal-C-372-002` | Yes |
| **Vault index total** | **360** | C-299–C-372 | (accumulator index) | — |

**Arithmetic:** `360 indexed − 41 legacy = 319 examined` — the gap closes without orphan or missing-body IDs.

Evidence artifact: [`C397_INDEX_EXAMINATION_GAP_WITNESS.json`](./C397_INDEX_EXAMINATION_GAP_WITNESS.json)

**KV observations (same export):**

- `vault:seals:index`, `:attested`, and `:all` are **byte-identical** (360 IDs, no quarantine delta).
- `vault:seal:latest` points to **`seal-C-372-002`** (C-372 fork tip) — an accumulator/migration pointer from C-305 v1 migrate, **not** `canonical_reserve_blocks` tip while `SEAL_INTEGRITY_GATE` is active.
- **Zero** legacy-tranche IDs appear in `C397_RESERVE_BLOCK_COLLISION_WITNESS.json` collision pairs — they are not collision candidates.

**Step 2 verdict:** classify as **`legacy_mic_tranche_outside_audit_scope`**. Do not adjudicate these 41 as contested Reserve Block positions; Track R steps 4–8 apply only to the **319 modern-era** seals (125 pairs / 123 contested positions among them).


*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

C-397 invokes **founder–custodian standing** only to preserve reconciliation evidence and hold the Reserve Block canon gate fail-closed while lineage is contested.

### Scope Constraints

This authority is narrowly scoped to:

- preserving the C-377 pair-count witness,
- preserving the verification facts for the #419 candidate replay (hashes recorded in Witness Table—not a checked-in artifact),
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
| Fresh collision audit matches C-377 witness (step 1) | **TRUE** | Terminal run 31267379043 — 319 / 194 candidate / 125 pairs |
| 125 collisions are real pair-count findings | **TRUE** | Terminal run 29710940106; 125/125 hash-divergent |
| The 125 occupy 125 different blocks | **FALSE** | 123 positions; blocks 1–2 are three-way |
| Preserved seal bodies are hash-corrupt | **FALSE** | lineage audit: 319/319 hashes valid |
| #419 candidate replay was internally valid (not in tree) | **TRUE** | Independent verifier at PR #419; tip `sha256:aefebc6c…40d8`; see superseded PR diff |
| 194 candidate positions (not constitutional canon) | **TRUE-gap** | C-377 witness dedupe among 319 modern-era seals; `canonical_reserve_blocks` unresolved |
| All 194 positions are adjudicated canon | **FALSE** | 123 contested among modern era; canon count unset |
| Safe clean positions exist | **TRUE** | 34–41 and 132–194 = 71 positions |
| Index/examination gap (41 IDs) classified | **TRUE** | KV export 2026-08-08 — 41 = legacy C-299–C-307 tranche; see gap witness JSON |
| 41 gap IDs are collision/adjudication candidates | **FALSE** | 0 overlap with collision witness; outside modern RB audit scope |
| Production Track R repair has been applied | **UNVERIFIED / NO CLAIM** | Requires approved operator execution |

## Restraint row

- No production KV mutation in this PR.
- No canonical `.dat` or manifest change before Track R adjudication.
- No `SEAL_INTEGRITY_GATE` disable.
- No historical seal deletion, rewrite, or renumber.
- No MIC issuance or conversion change.
- No preset `canonical_reserve_blocks = 194` (or any fixed count) before Track R step 8.
- No UI-derived canonical count.
- No claim that cryptographic chain validity substitutes for lineage adjudication.

*One truth, three skins. Canon → Ledger → UI.*
