# ZEUS Dispute Dispositions — C-374

**Cycle:** C-374  
**Agent:** ZEUS (Lane C)  
**Ledger ID:** `mobius:substrate:vault-canon-witness-c374`  
**Witnessed at:** 2026-07-16T23:30:00Z (UTC)  
**Search scope:** `mobius-civic-ai-terminal` git history (`zeus: verification disputed · C-374`); Mobius-Substrate (no matching commit subjects)

---

## Enumeration

| SHA | Timestamp (UTC) | Repo | Files |
| --- | --- | --- | --- |
| `948ec336e90cd7330473d98e38068423cc08726f` | 2026-07-16T06:02:30Z | mobius-civic-ai-terminal | `docs/catalog/zeus/2026-07-16T06-02-10Z-verification.json` |
| `59875437e9f5c4b95c001b4d6c6159224b5ef0b7` | 2026-07-16T12:02:28Z | mobius-civic-ai-terminal | `docs/catalog/zeus/2026-07-16T12-02-10Z-verification.json` |

**Count:** 2 commits found (handoff cited ≥3 — third not located in either repo; may reflect pending writer run or alternate branch).

---

## Per-commit dispositions

### `948ec336` — 2026-07-16T06:02:30Z

| Field | Value |
| --- | --- |
| **Claim disputed** | Production integrity posture for C-374: GI layer alignment, KV key health flags, vault quorum path |
| **Evidence reviewed** | `2026-07-16T06-02-10Z-verification.json` — `verification_status: disputed`, `gi_verified: false` |
| **Key findings** | Quadruple GI divergence (ATLAS 0.76 cached vs integrity-status 0.82 vs micro 0.907 vs quorum 0.82); persistent `kv_keys_ok=false`; `latest_seal_id: null`; `POST /api/vault/attest` → 404 |
| **Disposition** | **Expected pre-recovery state** — disputes reflect known Gate G3/G5 gaps and undeployed vault attest route, not a false alarm. Findings remain active until Lane B capture and C-298 route deploy. |

### `59875437` — 2026-07-16T12:02:28Z

| Field | Value |
| --- | --- |
| **Claim disputed** | Same production surface; afternoon pass after GI degradation |
| **Evidence reviewed** | `2026-07-16T12-02-10Z-verification.json` — integrity-status GI **dropped to 0.64** yellow/stressed (from 0.82 at 06:02Z pass) |
| **Key findings** | `gi_layer_alignment: fail`; `integrity_freshness: fail` (freshness=0.3); `themis-govtrack` regressed to error; tripwire resolved; sustain_eligible recovered |
| **Disposition** | **Stale witness / expected pre-recovery state** — afternoon degradation is a real signal (not closed as noise), but root cause is unresolved production integrity freshness + instrument errors, not disputed canon content. Escalation: custodian should correlate with vault/KV health (Lane B), not dismiss. **Not** unresolved contradiction. |

---

## Standing-rule proposal (custodian read)

No cycle should close with undispositioned `zeus: verification disputed · C-{cycle}` commits in the catalog trail. Proposed WITNESS_PROTOCOL.md amendment (one bullet, v1.0.x): *"ZEUS `verification_status: disputed` catalog commits require a disposition record (false positive / stale witness / expected pre-recovery / superseded / escalated contradiction) before cycle close; undispositioned disputes block canon-export intents."*

---

## Witness summary

| Metric | Value |
| --- | --- |
| Commits enumerated | 2 |
| False positives | 0 |
| Escalated contradictions | 0 |
| Expected pre-recovery / stale | 2 |

---

## Restraint row

- ZEUS catalog commits: NOT rewritten  
- Production endpoints: NOT modified  
- Disputes closed as "noise": 0
