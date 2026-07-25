# C-383 — Cycle journal ledger verification (#11)

**Tracking:** C-383 reconciliation queue item **#11**  
**Writer:** `mobius-bot-state-sync` → `journals/cycles/{cycle}.json`  
**Status:** Fix in flight (`scripts/state_sync_cycle.py`, `scripts/run_state_sync.py`)

## Problem (stale read disclaimer)

Both custodian sandboxes and CI checkouts can lag `origin/main`. Confirm live journal state with:

```bash
git fetch origin
git show origin/main:journals/cycles/C-383.json
```

As of the trace that motivated this doc (2026-07-25 UTC), `C-383.json` on `main` showed `ledger_verified: false` and `ledger_snapshot: null` while `STATE/writer-health.json` reported writer `status: ok` and ZEUS quorum could read 5/5 — **different signals, not a contradiction in quorum math**.

## Semantics (quorum ≠ ledger_verified)

| Signal | Source | Meaning |
|--------|--------|---------|
| ZEUS / sentinel quorum | EPICON consensus paths | Whether required sentinels attested the **PR / intent** |
| `ledger_verified` | `GET {ledger}/pulse/state` HTTP success | Whether Layer-1 captured a **ledger pulse witness** for the cycle journal |
| `ledger_gi_attested` | `gi` non-null in that pulse | Whether GI in the pulse is present (separate from HTTP reachability) |

Quorum closing does **not** set `ledger_verified`; only the state-sync writer does.

## Root cause on `main` (two mechanisms)

1. **`LEDGER_BASE_URL` gate** — inline workflow only fetched when `secrets.LEDGER_BASE_URL` was non-empty. If unset, `verified` stayed `False` with no `ledger_withheld_reason` on the journal.
2. **Idempotent stub lock** — journal file was written only when `journals/cycles/{cycle}.json` did not exist; a first-day false stub was never upgraded on reruns.

Evidence at parent of fix branch (`git show origin/main:.github/workflows/mobius-bot-state-sync.yml`):

- `if base:` around `urlopen` (no fetch when secret empty)
- `if not os.path.exists(p):` (no ledger field refresh)

## Fix approach

- Extract deterministic logic to `scripts/state_sync_cycle.py` + `scripts/run_state_sync.py`.
- Resolve ledger base: `LEDGER_BASE_URL` → `LEDGER_BASE_URL_FALLBACK` (workflow) → `DEFAULT_LEDGER_BASE_URL` (public Render ledger).
- When `ledger_verified` is false, **re-fetch** on subsequent runs (`should_refresh_ledger_fields`).
- While `ledger_verified` is true but `ledger_gi_attested` is false, **keep re-fetching** so a later non-null `gi` in pulse upgrades the journal with `cycle.json`.
- **ATLAS journals** (`meta` present) are never overwritten by Layer-1 ledger fields.
- Emit explicit enums: `ledger_withheld_reason` (`LEDGER_URL_UNCONFIGURED`, `LEDGER_PULSE_UNREACHABLE`), `ledger_gi_withheld_reason` (`GI_NULL_IN_PULSE`).

## Live ledger witness (2026-07-25)

```bash
curl -sS https://civic-protocol-core-ledger.onrender.com/pulse/state
# {"cycle":"unknown","gi":null,"attested_at":"..."}
```

HTTP **200** → after fix, expect `ledger_verified: true` with snapshot preserved and `ledger_gi_attested: false` until the ledger publishes non-null `gi`.

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| `main` skipped ledger fetch when `LEDGER_BASE_URL` empty | TRUE | `git show origin/main:.github/workflows/mobius-bot-state-sync.yml` — `if base:` |
| `main` never upgraded existing cycle journal ledger fields | TRUE | same file — `if not os.path.exists(p):` |
| Public ledger pulse reachable (HTTP 200) | TRUE | `curl` `/pulse/state` on `civic-protocol-core-ledger.onrender.com` |
| Pulse returns `gi: null` (GI withheld separate from verify) | TRUE | same `curl` body |
| Unit tests cover URL empty, unreachable, gi-null verified path | TRUE | `tests/test_state_sync_cycle.py` |

---

*"We heal as we walk."*
