"""C-410 Substrate cycle.json pointer reconciliation tests."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CYCLE_PATH = ROOT / "cycle.json"


def load_cycle() -> dict:
    with CYCLE_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def test_current_cycle_remains_c410():
    cycle = load_cycle()
    assert cycle["current_cycle"] == "C-410"
    assert cycle["date"] == "2026-08-21"


def test_stale_writer_residue_superseded():
    cycle = load_cycle()
    assert "next_state_snapshot_expected" not in cycle
    assert cycle["previous_cycle"] == "C-409"
    superseded = cycle["superseded_fields"]
    assert superseded["previous_cycle"]["former"] == "C-358"
    assert superseded["next_state_snapshot_expected"]["former"] == "C-361"


def test_editorial_gi_not_blended():
    cycle = load_cycle()
    assert cycle["gi"] is None
    assert cycle["gi_status"] == "unresolved"
    pulse = cycle["operational_pulse"]
    assert pulse["gi"] == 0.81
    assert pulse["execution_authorized"] is False
    readings = cycle["competing_projections"]["readings"]
    values = [entry["gi"] for entry in readings if isinstance(entry.get("gi"), (int, float))]
    assert len(set(values)) > 1


def test_stale_vault_counts_not_carried_forward():
    cycle = load_cycle()
    vault = cycle["vault"]
    assert vault["seals_count"] is None
    assert vault["in_progress_balance"] is None
    assert cycle["operational_pulse"]["seals_raw"] == 360


def test_zeus_dispute_preserved():
    cycle = load_cycle()
    assert cycle["operational_pulse"]["zeus_disposition"] == "disputed"
    assert "c410-zeus-dispute-unresolved" in cycle["open_flags"]
