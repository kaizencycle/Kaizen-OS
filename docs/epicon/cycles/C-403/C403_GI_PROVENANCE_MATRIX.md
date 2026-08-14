# C-403 GI Provenance Matrix

**Cycle:** C-403  
**Capture window:** 2026-08-14T13:07:40Z (ATLAS live fetch) · ZEUS catalog 2026-08-14T12:08:44Z  
**Deployment SHA (production):** `24513b5330795ba1dad73420a3793acd6f086132`  
**Posture:** DEGRADED / DISPUTED · reconciliation required · **no synthetic GI**

---

## Matrix (ATLAS collection)

| Field | Source | Observed value | Source timestamp | Fetch timestamp | Deploy SHA | Cycle | Cache state | Authority class | Verdict |
|-------|--------|----------------|------------------|-----------------|------------|-------|-------------|-----------------|---------|
| `cycle` | `/api/terminal/snapshot-lite` | `C-403` | 2026-08-14T13:07:40.559Z | 2026-08-14T13:07:40Z | `24513b53…` | C-403 | live | runtime pulse | **Current** |
| `cycle` | `cycle.json` (Substrate main) | `C-403` | 2026-08-14T05:43:26Z (`last_updated`) | 2026-08-14T13:07:40Z | n/a | C-403 | committed canon | canon pointer | **Current** |
| `cycle` | `STATE_OF_THE_SUBSTRATE_LATEST.md` | `C-401` | 2026-08-12 (editorial) | 2026-08-14T13:07:40Z | n/a | C-401 | committed doc | renderer | **Stale pointer** |
| `cycle` | `mkdocs.yml` | `C-401` | committed | 2026-08-14T13:07:40Z | n/a | C-401 | committed config | renderer | **Stale pointer** |
| `gi` (primary KV lane) | `/api/terminal/snapshot-lite` | `0.783` | 2026-08-14T13:07:40.559Z | 2026-08-14T13:07:40Z | `24513b53…` | C-403 | live-compute · `gi_verified=true` | runtime pulse | **Current** |
| `gi` | `/api/integrity-status` | `0.783` | 2026-08-14T13:01:46.226Z | 2026-08-14T13:07:40Z | n/a | C-403 | KV · age ~354–357s at fetch | runtime pulse | **Current** (aligned after sweep) |
| `gi` | `/api/signals/micro` | `0.875` | live sweep (no separate ts) | 2026-08-14T13:07:40Z | n/a | C-403 | `cached=false` | micro composite | **Explained difference** (different formula) |
| `gi` | `/api/vault/status` · `gi_current` | `0.783` | 2026-08-14T13:07:53.008Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime pulse | **Current** |
| `gi` | `ledger/cycle-state.json` (Terminal committed) | `0.64` | 2026-08-14T12:01:03.627Z | repo read | `24513b53…` | C-403 | committed snapshot | renderer | **Stale** vs live |
| `gi` | `cycle.json` · `gi` | `0.9` | carry-forward · `last_updated` 2026-08-14T05:43:26Z | repo read | n/a | C-403 | carry-forward | canon pointer | **Authority mismatch** (not live GI) |
| `gi` | ZEUS catalog · ATLAS heartbeat | `0.9` | heartbeat 2026-08-14T11:13:25Z | catalog 2026-08-14T12:08:44Z | n/a | C-403 | sweep snapshot | agent evidence | **Explained difference** (temporal) |
| `gi` | ZEUS catalog · micro capture | `0.892` | ~2026-08-14T12:08Z | catalog 2026-08-14T12:08:44Z | n/a | C-403 | live at capture | micro composite | **Explained difference** |
| `gi` | ZEUS catalog · integrity-status | `0.80` | ~378s stale at 12:08Z capture | catalog 2026-08-14T12:08:44Z | n/a | C-403 | KV lag pre-alignment | runtime pulse | **Explained difference** (lane refresh lag) |
| `degraded` | `/api/health` | `true` · status `degraded` | 2026-08-14T13:07:40.395Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime | **Current** |
| `terminal_status` | `/api/terminal/snapshot` | `degraded` | 2026-08-14T13:07:43.686Z | 2026-08-14T13:07:40Z | production | C-403 | live | runtime | **Current** |
| `verification_status` | ZEUS catalog | `disputed` | 2026-08-14T12:08:44Z | catalog read | n/a | C-403 | committed witness | ledger evidence | **Remains disputed** |
| `sustain_eligible` | ZEUS · ATLAS heartbeat | `false` | 2026-08-14T11:13:25Z sweep | catalog 12:08:44Z | n/a | C-403 | sweep snapshot | agent evidence | **Current** (gate closed) |
| `quorum` | ZEUS catalog · vault attest | `5/5 achieved` | 2026-08-14T12:08:44Z | catalog read | n/a | C-403 | witness | ledger evidence | **Current** (≠ Track R ADOPT) |
| `seals_raw` | `/api/vault/status` | `360` | 2026-08-14T13:07:53Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime | **Current** |
| `attested_seals_examined` | `/api/vault/status` | `319` | 2026-08-14T13:07:53Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime audit | **Current** |
| `seals_count` | `cycle.json` | `319` | 2026-08-14T05:43:26Z | repo read | n/a | C-403 | committed | canon pointer | **Explained difference** (attested count, not raw index) |
| `collision_pair_count` | `/api/vault/status` | `125` | 2026-08-14T13:07:53Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime audit | **Current** |
| `canonical_reserve_blocks` | `/api/vault/status` | `null` | 2026-08-14T13:07:53Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime | **Remains disputed** (Track R pending) |
| `chain_tip` | `/api/vault/status` / cycle-state | `seal-C-372-002` | live | 2026-08-14T13:07:40Z | n/a | C-372 tip cycle | live | runtime | **Current** |
| `in_progress_mic` | `/api/vault/status` | `2537.69764` (tranche slot 361 · 37.70/50) | 2026-08-14T13:07:53Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime | **Current** |
| `in_progress_balance` | `cycle.json` | `32.13` | 2026-08-14T05:43:26Z | repo read | n/a | C-403 | committed stale | canon pointer | **Stale pointer** (do not overwrite with live) |
| `previous_cycle` | `cycle.json` | `C-358` | writer 2026-08-14T05:43:26Z | repo read | n/a | n/a | committed | canon pointer | **Stale pointer** (writer skipped subfield sync) |
| `kv_keys_ok` | ZEUS · ATLAS flags | `false` | persistent · seed 200 OK | catalog 12:08:44Z | n/a | C-403 | flag vs probe | agent evidence | **Remains disputed** |
| `tripwire` | `/api/health` · lane-diagnostics | elevated · count 1 | 2026-08-14T13:00:57Z | 2026-08-14T13:07:40Z | n/a | C-403 | live | runtime | **Current** |
| `ledger pulse gi` | `journals/cycles/C-403.json` | `null` · `GI_NULL_IN_PULSE` | 2026-08-14T05:40:10Z | repo read | n/a | C-403 | ledger witness | ledger evidence | **Current** (withheld) |

---

## ATLAS conclusions (no averaging)

1. **GI disagreement is multi-causal:** temporal volatility (0.64 → 0.783 intraday), **different formulas** (micro composite vs KV primary), **lane refresh lag** (integrity-status ~6 min behind at fetch), and **canon carry-forward** (`cycle.json` gi=0.9 while note says pulse did not attest).
2. **0.64 in committed `cycle-state.json` is a stale renderer snapshot** (12:01Z), not authoritative over 13:07Z live lanes.
3. **integrity-status no longer lags by 0.09** at 13:07Z — it matches snapshot-lite at **0.783**. ZEUS 12:08 capture is **historically accurate** for that window.
4. **319 vs 360 is labeled, not broken:** 360 = raw KV index cardinality; 319 = attested bodies examined in modern collision audit; ~41 legacy MIC tranche records sit outside the modern collision lineage set.
5. **`cycle.json` vault balance 32.13 must not be “fixed” to 2537** — that would erase evidence of pointer drift; runtime truth lives in `/api/vault/status`.
6. **Quorum 5/5 does not authorize Track R** or lift integrity gate; ZEUS remains `disputed`.

---

## Safe vs runtime-only fields

| Field | Safe deterministic sync? | Action |
|-------|-------------------------|--------|
| `current_cycle` | Already C-403 | None |
| `previous_cycle` | Yes → `C-402` | Separate EP-3 writer/custodian PR |
| `updated_by` / `notes` | Yes (provenance text) | Separate EP-3 PR |
| `gi` | **No** (pulse null; carry-forward) | Document only |
| `vault.in_progress_balance` | **No** (runtime) | Document only |
| `vault.seals_count` | Label only (319 = attested) | Document 360 vs 319 |
| `open_flags` | **No** without custodian revalidation | Document only |
| `next_state_snapshot_expected` | Stale (`C-361`) | Classify; do not auto-rewrite |

---

*No KV mutation. No synthetic GI. We heal as we walk.*
