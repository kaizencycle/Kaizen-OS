# C-383 — Ledger GI source trace (`gi_source_unwired`)

**Tracking:** C-383 reconciliation — extends **#11** (`ledger_gi_attested`) and informs **#01** / **#20**  
**Live API:** https://civic-protocol-core-ledger.onrender.com/docs  
**Status:** Finding doc (design/integration), not a Substrate writer bug

## Stale-read disclaimer

Confirm live responses with `curl` at review time; do not treat an earlier sandbox session or PR narrative as ground truth.

## Sharper framing (vs `GI_NULL_IN_PULSE` alone)

| Layer | Wording | Meaning |
|--------|---------|---------|
| **Journal / #11** | `ledger_gi_withheld_reason: GI_NULL_IN_PULSE` | Pulse returned HTTP 200 and `gi: null` in the JSON body — correct Layer-1 witness. |
| **Reconciliation / #20** | `gi_source_unwired` | **No federation writer** currently supplies `GI_STATE_JSON`, `GI_STATE_PATH`, or `{LEDGER_DATA_DIR}/gi_state.json`, so the ledger has nothing to expose — **missing integration**, not a failed attestation of an existing GI value. |

Do not collapse these into “GI attestation failed.” Substrate `cycle.json` / Terminal snapshot GI and ledger `/pulse/state` GI are **different surfaces** until something explicitly wires them.

## Live witnesses (2026-07-25 UTC)

```bash
# Persistence + event chain (ledger service)
curl -sS https://civic-protocol-core-ledger.onrender.com/health

# Layer-1 pulse (what mobius-bot-state-sync uses)
curl -sS https://civic-protocol-core-ledger.onrender.com/pulse/state

# Vault aggregate on ledger service (not Terminal)
curl -sS https://civic-protocol-core-ledger.onrender.com/api/vault/global
```

Observed at trace time:

- **`/health`:** `ephemeral_storage: false`, `data_dir: /var/lib/ledger`, `ledger_db.ok: true`, `event_count` in the tens of thousands — aligns with C-382 “ledger durability fixed on disk” (code: `assert_persistent_storage()` / Render disk mount), independent of GI wiring.
- **`/pulse/state`:** `gi: null`, `cycle: "unknown"` — OpenAPI may show an empty schema; behavior is defined in code, not in `/docs` shape alone.
- **`/api/vault/global`:** `vault-global`, `total_balance: 0`, `sealed_blocks: 0`, `nodes: []` — **not** the same witness as Terminal `vault/status` (e.g. sealed reserve totals). Reconciliation type: **`vault_witness_divergence`** (two registries / two URLs), separate from GI spread.

## Source trace — where `/pulse/state` gets `gi`

Civic-Protocol-Core `ledger/app/main.py` → `pulse_state()` calls `load_gi_state()` then `_current_gi(gi_state)`.

`load_gi_state()` (`ledger/app/mcp_integrity.py`) reads **only**:

1. `GI_STATE_JSON` env (JSON string)
2. Else `GI_STATE_PATH` env, else `{LEDGER_DATA_DIR}/gi_state.json`
3. If none present / parseable → returns `None` (no error log)

`_current_gi()` returns `None` when state is missing or has no `global_integrity` / `gi` key.

Deploy contract: `render.yaml` lists `GI_STATE_JSON` with `sync: false` (manual Render dashboard). `mobius.yaml` describes pulse as carrying GI **when `GI_STATE_JSON` is configured** — optional input.

Repo search (federation clones available here): **no** Substrate/Terminal cron or writer that populates `gi_state.json` or sets `GI_STATE_JSON` in automation; tests set env in pytest only.

## Reconciliation disagreement types (for #20)

| Code | When to use | Example witnesses |
|------|-------------|-------------------|
| `gi_source_unwired` | Pulse reachable, `gi` null, no GI input configured | `load_gi_state()` source; Render env unset; MCP docs “when configured” |
| `gi_null_vs_numeric_gi` | Two surfaces both claim GI but values disagree | Terminal snapshot vs ledger pulse **after** ledger is wired |
| `vault_witness_divergence` | Vault totals/blocks differ across services | `/api/vault/global` vs Terminal `vault/status` |
| `ledger_reachability` | HTTP failure / withheld pulse | #11 `LEDGER_PULSE_UNREACHABLE` |

## Implications for #01 / #11 / #20

- **#11 (PR #422):** Done when `ledger_verified` tracks `/pulse/state` HTTP witness; `ledger_gi_attested: false` with `GI_NULL_IN_PULSE` is **expected** until integration exists.
- **#01:** Derived flags must not treat “null GI in pulse” as “ledger broke GI” — map to `gi_source_unwired` where appropriate.
- **#20:** Report should emit **`gi_source_unwired`** as its own row; do not only list generic `null_vs_numeric_gi` without checking whether the ledger was ever fed GI.

## Design fork (custodian — not decided in #11)

1. **Wire GI into ledger:** Terminal (or Substrate cron) periodically writes `GI_STATE_JSON` / `gi_state.json` from canonical GI source.
2. **Stop expecting ledger GI:** Layer-1 journals and reconciliation use Terminal/handbook GI only; pulse documents reachability + chain stats, not GI.
3. **Compute on ledger:** Ledger derives GI from its own events (new product scope — not present today).

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| `/pulse/state` `gi` comes from `load_gi_state()` only | TRUE | Civic-Protocol-Core `ledger/app/main.py` `pulse_state`; `ledger/app/mcp_integrity.py` |
| Missing GI input → `gi: null` without error | TRUE | `load_gi_state()` returns `None`; `_current_gi(None)` → `None` |
| `GI_STATE_JSON` slot on Render, not auto-filled | TRUE | Civic-Protocol-Core `render.yaml` `GI_STATE_JSON` `sync: false` |
| Ledger DB durable on live deploy | TRUE | `curl` `/health` `ephemeral_storage: false`, `event_count` > 0 |
| Ledger `vault-global` empty vs Terminal vault activity | TRUE-gap | `curl` `/api/vault/global`; Terminal `vault/status` — compare at reconcile time |

---

*"We heal as we walk."*
