# ZEUS Dispute Dispositions — C-375

**Cycle:** C-375  
**Agent:** ZEUS (Lane C)  
**Ledger ID:** `mobius:substrate:renderers-and-archaeology-c375`  
**Witnessed at:** 2026-07-17T22:16:00Z (UTC) — refreshed post Gate G3 merge (#400) + vault/status verify (#627)  
**Search scope:** `mobius-civic-ai-terminal` git history (`zeus: verification disputed · C-375`); Mobius-Substrate (no matching commit subjects)

---

## Cycle context (updated)

| Event | SHA / ref | Relevance |
| --- | --- | --- |
| C-375 daily state sync | `cbe6daeded70f16c555e43e26b90e8ea237e2e03` | Writer advanced C-374 → C-375 |
| OAA Charter §7 merged | Substrate #397 (`4235a680`) | Lane A canon complete |
| Workflow archaeology merged | Substrate #398 (`bf500049`) | Lane B B1 complete |
| **Gate G3 capture merged** | Substrate #400 (`566c62d1`) | **125 collisions witnessed** @ run `29592258693` |
| **Vault status fix merged** | Terminal #627 | `/api/vault/status` HTTP 200 post-deploy |
| Post-deploy witness | Substrate #401 (pending) / `vault-status-2026-07-17T221206Z.json` | Closes kv_timeout verification row |
| Track R receipt draft | `RECONCILIATION_RECEIPT_BLOCK_001_PROPOSED.md` | First reconciliation receipt (block 1) |

---

## Enumeration

| SHA | Timestamp (UTC) | Repo | Files |
| --- | --- | --- | --- |
| `13b24f391329d9e22bfc562bbebcbeff872719b4` | 2026-07-17T06:02:35Z | mobius-civic-ai-terminal | `docs/catalog/zeus/2026-07-17T06-02-11Z-verification.json` |
| `afeacec3c419a361b5a11e46d4bee368c15cf369` | 2026-07-17T12:03:27Z | mobius-civic-ai-terminal | `docs/catalog/zeus/2026-07-17T12-03-10Z-verification.json` |
| `1c94f609632ca75cee32e5918119ffee9957c356` | 2026-07-17T18:02:42Z | mobius-civic-ai-terminal | `docs/catalog/zeus/2026-07-17T18-02-19Z-verification.json` |

**Count:** 3 commits found (third located on refresh scan).

---

## Per-commit dispositions

### `13b24f39` — 2026-07-17T06:02:35Z (morning pass)

| Field | Value |
| --- | --- |
| **Claim disputed** | Production integrity posture at C-375 open: GI layer alignment, KV flags, vault quorum path, instrument health |
| **Evidence reviewed** | `2026-07-17T06-02-11Z-verification.json` — `verification_status: disputed`, `gi_verified: false` |
| **Key findings** | Quadruple GI divergence; `kv_keys_ok=false`; `micro_operator_cycle_divergence`; `integrity_freshness=0.3`; `POST /api/vault/attest` → 404; `latest_seal_id: null` |
| **Disposition** | **SUPERSEDED_BY_VERIFIED_REF** — Gate G3 capture (#400, run `29592258693`) now provides timestamped collision + lineage witness for production vault state. Morning GI divergence superseded for witness purposes by afternoon alignment and Gate G3 artifact. |
| **Secondary label** | **EXPECTED_PRE_MERGE_STATE** — predates Substrate #397/#398 merge |

### `afeacec3` — 2026-07-17T12:03:27Z (afternoon pass)

| Field | Value |
| --- | --- |
| **Claim disputed** | Same production surface after GI recovery; post–Lane A/B merge window |
| **Evidence reviewed** | `2026-07-17T12-03-10Z-verification.json` — `verification_status: disputed`, `gi_verified: true` |
| **Key findings** | GI layers aligned at 0.82; integrity freshness improved; persistent instrument/tripwire flags; `POST /api/vault/attest` → 404; `latest_seal_id: null` |
| **Disposition** | **SUPERSEDED_BY_VERIFIED_REF** — afternoon pass partially superseded by Gate G3 artifact (`collision-pairs-2026-07-17T152857Z.json`, `lineage-audit-2026-07-17T152854Z.json`). Collision count 125 now verified, not merely disputed. |
| **Secondary label** | **STALE_WITNESS** — "capture blocked" language in disposition v1 is stale; Gate G3 capture completed 2026-07-17T16:08Z |

### `1c94f609` — 2026-07-17T18:02:42Z (evening pass)

| Field | Value |
| --- | --- |
| **Claim disputed** | Post–Gate G3 merge window; GI verified via kv-live; persistent anomaly flags |
| **Evidence reviewed** | `2026-07-17T18-02-19Z-verification.json` — `verification_status: disputed`, `gi_verified: true`, `gi_source: kv-live` |
| **Key findings** | Persistent `kv_keys_ok_false`, `micro_operator_cycle_divergence`, `tripwire_active`, `sustain_eligible_false`; `POST /api/vault/attest` → 404; `latest_seal_id: null`; block 361 candidate at 100%; hermes-arxiv resolved |
| **Disposition** | **STALE_WITNESS** — instrument/tripwire/micro-lag signals remain operational debt but collision state is now canon-witnessed at 125 pairs. Dispute does not contradict renderer charter or Gate G3 artifact. |
| **Secondary label** | **EXPECTED_PRE_MERGE_STATE** — vault attest 404 and `latest_seal_id: null` remain open; not closed by disposition |

---

## Classification summary

| Label | Count | SHAs |
| --- | --- | --- |
| SUPERSEDED_BY_VERIFIED_REF | 2 | `13b24f39`, `afeacec3` |
| STALE_WITNESS | 3 | `13b24f39`, `afeacec3`, `1c94f609` |
| EXPECTED_PRE_MERGE_STATE | 3 | `13b24f39`, `afeacec3`, `1c94f609` |
| FALSE_POSITIVE | 0 | — |
| UNRESOLVED_CONTRADICTION | 0 | — |

---

## Active signals (not closed by this disposition)

Disposition classifies dispute commits; it does **not** clear production debt or authorize reconciliation apply:

1. **125 hash-divergent collision pairs** — witnessed stable; **Track R reconciliation receipts** required (block 1 proposed).
2. **4 lineage components** — component-level quarantine policy pending receipt review.
3. **C-298 route** — `POST /api/vault/attest` returns 404 on deployed Terminal surface.
4. **`latest_seal_id: null`** — pointer gap persists (witnessed in Gate G3 + post-deploy vault/status).
5. **Instrument health** — tripwire, micro cycle lag, sustain flags remain open.
6. **Workflow archaeology B2** — four custodian workflow decisions open.

**Resolved since v1 disposition:**

- ~~Gate G3 capture blocked~~ → **COMPLETE** (Substrate #400)
- ~~`/api/vault/status` kv_timeout~~ → **RESOLVED** (Terminal #627)

---

## Witness summary

| Metric | Value |
| --- | --- |
| Commits enumerated | 3 |
| False positives | 0 |
| Unresolved contradictions | 0 |
| Superseded by Gate G3 verified ref | 2 |
| Canon integrity impact | None — disputes are production-witness signals, not renderer-charter conflicts |

---

## Restraint row

- ZEUS catalog commits: NOT rewritten  
- Production endpoints: NOT modified  
- Disputes closed as "noise": 0  
- Reconciliation apply: NOT authorized by this disposition  
- Renderer implementation: NOT authorized by this disposition
