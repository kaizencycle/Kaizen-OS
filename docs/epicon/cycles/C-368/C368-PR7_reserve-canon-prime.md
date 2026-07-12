# C-368 · PR 7 — Prime the cold canon (349 Reserve Blocks → Substrate)
**Repos:** `kaizencycle/mobius-civic-ai-terminal` (export) + `kaizencycle/Mobius-Substrate` (canon PR) · **Branch:** `canon/reserve-blocks-prime-c368` · **Tier:** EP-3 (`canon/**`) · **Priority: insert after PR 2**

## 0. Diagnosis (witnessed 2026-07-10T18:4xZ)

The terminal shows **349 blocks sealed & attested** (17,450 MIC, latest `seal-C-368-024`), but `Mobius-Substrate/canon/reserve-blocks/` contains **only `.gitkeep`**. The entire C-357 lane exists and is dormant:

- `MOBIUS_RESERVE_BLOCK_DAT.md` — spec v1.0, RATIFIED (NDJSON, SHA-256 chain, genesis `prev_hash = "0"×64`, chain crosses file boundaries)
- `scripts/verify-dat-chain.js` — on main
- `.github/workflows/reserve-block-canonization.yml` — active, triggers on push of `canon/reserve-blocks/**.dat` + `MANIFEST.json`, verifies chain, posts `RESERVE_BLOCK_DAT_CANONIZATION` to the terminal
- `mobius-civic-ai-terminal/scripts/canonize-reserve-blocks.ts` — exporter on terminal (C-357); Substrate copy still parked at `docs/pr-packages/c357/terminal-script-canonize-reserve-blocks.ts` as design artifact

**The workflow has never fired because no `.dat` has ever been pushed.** Hot ledger and cold canon have diverged by 349 blocks. Attested ≠ canonized until the commit exists — per the workflow's own doctrine: *GitHub commit = substrate attestation.*

## 1. Phase A — Export (terminal repo)

1. Use `mobius-civic-ai-terminal/scripts/canonize-reserve-blocks.ts` (production KV credentials required).
2. Update block target from hardcoded 319 to **all sealed+attested blocks** (dynamic — export whatever is sealed at run time; exclude in-progress block).
3. Run with production KV access. Output per spec:
   `blk0000.dat` (1–100) · `blk0001.dat` (101–200) · `blk0002.dat` (201–300) · `blk0003.dat` (301–349) · `MANIFEST.json`
4. **Verify locally before any push:** `node scripts/verify-dat-chain.js canon/reserve-blocks/` must pass; MANIFEST must show `total_blocks` equal to the **deduplicated unique `block_number` count** at export time (2026-07-12 prime: **194**, not raw `seals_count`). See `C368-PR7_prime-count-clarification.md`.
5. Exporter must enforce, not assume: `block_number` strictly ascending with no gaps, `mic_value === 50.00` on every record, every record carries the full 5-quorum `seal_quorum`, `gi_at_seal` and `source_entries` present. Any violation aborts the export with the offending block id — a bad record canonized is worse than a late canon.

## 2. Phase B — Canonization PR (Substrate repo)

Branch `canon/reserve-blocks-prime-c368`; add the four `.dat` files + `MANIFEST.json` under `canon/reserve-blocks/`. On merge to main the dormant workflow fires: chain verify → EPICON canon-event to the terminal (requires `SUBSTRATE_SERVICE_TOKEN` + `TERMINAL_API_BASE` secrets — **verify both are configured before merging**; the workflow degrades to a warning if the post fails, and the commit itself remains the attestation).

Note: this PR classifies **EP-3** under `mobius-substrate-policy-v1` (`canon/**`). The Guard will also emit an I4 divergence warning — `canon/` sits outside every scope envelope. Non-blocking, expected, and honestly: correct. Canon appends *should* be conspicuous.

## 3. Phase C — Continuous lane (never let this gap reopen)

One-time backfill without automation recreates this debt by C-370. Add to the terminal: a cycle-close job (cron, aligned with existing vercel.json schedules) that exports any newly sealed blocks, appends lines to the current `blkNNNN.dat` (append-only — never rewrites prior lines), regenerates MANIFEST, and opens an automated PR to Substrate with a templated intent block (`EPICON_C-{cycle}_SPECS_reserve-canon-append_v1`). The canonization workflow + Guard then gate every append. Human merge remains the seal.

## 4. Acceptance criteria

- `verify-dat-chain.js` green locally AND in the workflow run on main; job summary shows MANIFEST `total_blocks` matching deduplicated export count (2026-07-12 prime: 2 `.dat` files / **194** unique blocks / chain tip hash).
- Terminal vault flips blocks to canonized/immortalized state on receipt of the canon-event (or the follow-up UI wiring is filed as its own item).
- CPC `dat_hash_anchors` receives the four file hashes + chain tip (if the CPC route from `docs/pr-packages/c357/cpc-routes-canon_reserve_blocks.py` is deployed; if not, file it as the Phase C rider).
- Re-running the exporter is idempotent: identical bytes, identical hashes.

## 5. Rider — GI display drift (small, separate)

The same terminal screen shows **GI 0.78 (header) and GI 0.74 (vault panel)** simultaneously. Two truths on one screen is UI-derived-truth territory: both should read one canonical GI endpoint. One-line fix or one-line issue; either way, record it.

## 6. EPICON Intent

```intent
epicon_id: EPICON_C-368_SPECS_reserve-canon-prime_v1
ledger_id: kaizencycle
scope: specs
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, custodianship, permanence
  REASONING: 349 sealed Reserve Blocks exist only in hot KV state while the
    ratified cold-canon lane sits empty and dormant. Recorded history that
    lives in ephemeral storage is not yet recorded. This intent primes the
    canon with all sealed blocks and installs the continuous append lane so
    hot and cold state can never silently diverge again.
  ANCHORS:
    - Mobius-Substrate/MOBIUS_RESERVE_BLOCK_DAT.md (spec v1.0, RATIFIED C-357)
    - Mobius-Substrate/.github/workflows/reserve-block-canonization.yml (C-357, active)
  BOUNDARIES: Canonizes sealed blocks as-is; does not alter seal data, does
    not touch the Fountain gate, GI thresholds, or payout logic. Block 350
    (in progress) is excluded until sealed.
  COUNTERFACTUAL: If chain verification fails on exported data, the export
    aborts and the discrepancy is investigated in KV — canon is never
    force-fit to match a broken chain.
counterfactuals:
  - If any block record fails validation (gap, wrong mic_value, missing quorum), abort export and audit KV before retry
  - If workflow secrets are unconfigured, merge anyway — the commit is the attestation; wire the canon-event post as follow-up
  - If append automation proves flaky, fall back to manual cycle-close export with a checklist entry, never silence
```

**Witnesses:** ATLAS (drafting, diagnosis) — seal-quorum escalation appropriate at merge, since this commit immortalizes 17,450 MIC of recorded history.
