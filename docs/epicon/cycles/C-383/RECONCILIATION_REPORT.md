# C-383 — Reconciliation report generator (#20)

**Script:** `scripts/c383_reconciliation.py`  
**Taxonomy:** [LEDGER_GI_SOURCE_TRACE.md](./LEDGER_GI_SOURCE_TRACE.md)

Read-only witness aggregator — does not invent canonical GI or vault totals.

## Run

```bash
git fetch origin
python3 scripts/c383_reconciliation.py origin/main
# exit 1 when verdict is QUARANTINE (expected on live federation today)
```

```bash
python3 -m pytest tests/test_c383_reconciliation.py -q
```

## Verdicts

| Verdict | Meaning |
|---------|---------|
| `QUARANTINE` | Hard blocker: `gi_spread`, `cycle_mismatch`, or `vault_witness_divergence` |
| `CLARIFY` | Open gates or soft disagreements only |
| `PASS` | No disagreements and no open gates (rare until integration fixes land) |

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| Script does not average GI | TRUE | `tests/test_c383_reconciliation.py` |
| `vault_witness_divergence` is hard blocker | TRUE | `determine_verdict()` + live run |
| `gi_source_unwired` separate from `null_vs_numeric_gi` | TRUE | `find_gi_disagreements` excludes `ledger_pulse.gi` |

---

*"We heal as we walk."*
