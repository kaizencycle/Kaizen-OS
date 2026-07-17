# ZEUS Dispute Dispositions — C-375

**Cycle:** C-375  
**Agent:** ZEUS (Lane C)  
**Ledger ID:** `mobius:substrate:renderers-and-archaeology-c375`  
**Witnessed at:** 2026-07-17T15:20:00Z (UTC)  
**Search scope:** `mobius-civic-ai-terminal` git history (`zeus: verification disputed · C-375`); Mobius-Substrate (no matching commit subjects)

---

## Cycle context

| Event | SHA / ref | Relevance |
| --- | --- | --- |
| C-375 daily state sync | `cbe6daeded70f16c555e43e26b90e8ea237e2e03` | Writer advanced C-374 → C-375; recovery sustained across cycle boundary |
| OAA Charter §7 merged | Substrate #397 (`4235a680`) | Lane A canon complete; no production surface change |
| Workflow archaeology merged | Substrate #398 (`bf500049`) | Lane B B1 complete; `guardian.yml` archived only |
| C-374 Gate G3 | `artifacts/C-374/production-audit/LANE_B_BLOCKED.md` | Production vault audit still blocked — inherited by disputes |

---

## Enumeration

| SHA | Timestamp (UTC) | Repo | Files |
| --- | --- | --- | --- |
| `13b24f391329d9e22bfc562bbebcbeff872719b4` | 2026-07-17T06:02:35Z | mobius-civic-ai-terminal | `docs/catalog/zeus/2026-07-17T06-02-11Z-verification.json` |
| `afeacec3c419a361b5a11e46d4bee368c15cf369` | 2026-07-17T12:03:27Z | mobius-civic-ai-terminal | `docs/catalog/zeus/2026-07-17T12-03-10Z-verification.json` |

**Count:** 2 commits found.

---

## Per-commit dispositions

### `13b24f39` — 2026-07-17T06:02:35Z (morning pass)

| Field | Value |
| --- | --- |
| **Claim disputed** | Production integrity posture at C-375 open: GI layer alignment, KV flags, vault quorum path, instrument health |
| **Evidence reviewed** | `2026-07-17T06-02-11Z-verification.json` — `verification_status: disputed`, `gi_verified: false` |
| **Key findings** | Quadruple GI divergence (ATLAS 0.793 vs integrity-status 0.74 vs micro 0.86 vs quorum 0.736); persistent `kv_keys_ok=false`; `micro_operator_cycle_divergence` (operator C-375 vs micro C-306); `integrity_freshness=0.3`; `POST /api/vault/attest` → 404; `latest_seal_id: null`; hermes-arxiv + gaia-usgs-water instrument errors |
| **Disposition** | **EXPECTED_PRE_MERGE_STATE** — morning pass predates Substrate #397/#398 merge and reflects C-374 production carryover (Gate G3 blocked, C-298 attest route undeployed). Dispute is not a canon contradiction. |
| **Secondary label** | **STALE_WITNESS** — `micro_operator_cycle_divergence` is expected lag between cycle writer (C-375) and micro signal pipeline (C-306); not evidence that charter or renderer canon is wrong. |

### `afeacec3` — 2026-07-17T12:03:27Z (afternoon pass)

| Field | Value |
| --- | --- |
| **Claim disputed** | Same production surface after GI recovery; post–Lane A/B merge window |
| **Evidence reviewed** | `2026-07-17T12-03-10Z-verification.json` — `verification_status: disputed`, `gi_verified: true` |
| **Key findings** | GI layers aligned at 0.82 green (`gi_layer_alignment: pass`); integrity freshness improved 0.3 → 0.6; govtrack anomaly resolved; persistent `kv_keys_ok=false` vs `kv_keys.ok=true` inconsistency; `sustain_eligible=false`; tripwire Hormuz elevated; hermes-arxiv persistent error; OpenAQ degraded to 0.3; `POST /api/vault/attest` → 404; `micro_operator_cycle_divergence` persists |
| **Disposition** | **STALE_WITNESS** — afternoon pass supersedes morning GI-layer divergence for witness purposes; KV band now coherent. Remaining fails are instrument/tripwire/sustain flags, not undispositioned canon conflict. |
| **Secondary label** | **EXPECTED_PRE_MERGE_STATE** — vault attest 404 and `latest_seal_id: null` remain active C-374 Gate G3 items; archiving `guardian.yml` (#398) does not affect these signals. |

---

## Classification summary

| Label | Count | SHAs |
| --- | --- | --- |
| EXPECTED_PRE_MERGE_STATE | 2 | `13b24f39`, `afeacec3` |
| STALE_WITNESS | 2 | `13b24f39`, `afeacec3` |
| FALSE_POSITIVE | 0 | — |
| SUPERSEDED_BY_VERIFIED_REF | 0 | — (afternoon GI alignment noted inline; no separate verified ref PR yet) |
| UNRESOLVED_CONTRADICTION | 0 | — |

---

## Active signals (not closed by this disposition)

These findings remain **open operational items** — disposition classifies the dispute commits, it does not clear production debt:

1. **Gate G3** — production vault collision audit blocked (`LANE_B_BLOCKED.md`); custodian capture required.
2. **C-298 route** — `POST /api/vault/attest` returns 404 on deployed Terminal surface.
3. **Instrument health** — hermes-arxiv persistent error; OpenAQ degraded in afternoon pass.
4. **Micro cycle lag** — operator C-375 vs micro C-306 until micro pipeline syncs cycle label.
5. **Workflow archaeology B2** — four custodian workflow decisions open per `AUDIT_C-375_workflow-archaeology.md`.

---

## Witness summary

| Metric | Value |
| --- | --- |
| Commits enumerated | 2 |
| False positives | 0 |
| Unresolved contradictions | 0 |
| Expected pre-merge / stale witness | 2 |
| Canon integrity impact | None — disputes are production-witness signals, not renderer-charter conflicts |

---

## Restraint row

- ZEUS catalog commits: NOT rewritten  
- Production endpoints: NOT modified  
- Disputes closed as "noise": 0  
- Renderer implementation: NOT authorized by this disposition
