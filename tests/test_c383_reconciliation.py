"""Tests for scripts/c383_reconciliation.py (network/git monkeypatched)."""
from __future__ import annotations

import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

import c383_reconciliation as recon  # noqa: E402


def make_witness(name, ok=True, value=None, error=None, source="test"):
    return recon.Witness(
        name=name, source=source, fetched_at="2026-07-25T00:00:00Z", ok=ok, value=value, error=error
    )


def test_gi_spread_detected_above_tolerance():
    obs = [{"source": "a", "value": 0.90}, {"source": "b", "value": 0.79}]
    disagreements = recon.find_gi_disagreements(obs)
    assert any(d["type"] == "gi_spread" for d in disagreements)


def test_gi_spread_not_flagged_within_tolerance():
    obs = [{"source": "a", "value": 0.90}, {"source": "b", "value": 0.895}]
    disagreements = recon.find_gi_disagreements(obs)
    assert not any(d["type"] == "gi_spread" for d in disagreements)


def test_null_gi_flagged_alongside_numeric():
    obs = [
        {"source": "some_other_witness.gi", "value": None},
        {"source": "terminal.gi", "value": 0.79},
    ]
    disagreements = recon.find_gi_disagreements(obs)
    assert any(d["type"] == "null_vs_numeric_gi" for d in disagreements)


def test_all_null_gi_does_not_spuriously_flag_null_vs_numeric():
    obs = [{"source": "a", "value": None}, {"source": "b", "value": None}]
    disagreements = recon.find_gi_disagreements(obs)
    assert not any(d["type"] == "null_vs_numeric_gi" for d in disagreements)


def test_cycle_mismatch_detected():
    witnesses = [
        make_witness("substrate_cycle_json", value={"current_cycle": "C-383"}),
        make_witness("ledger_pulse", value={"cycle": "unknown"}),
    ]
    disagreements = recon.find_cycle_disagreements(witnesses)
    assert any(d["type"] == "cycle_unresolved" for d in disagreements)


def test_no_disagreement_when_cycles_agree():
    witnesses = [
        make_witness("substrate_cycle_json", value={"current_cycle": "C-383"}),
        make_witness("substrate_writer_health", value={"last_cycle": "C-383"}),
    ]
    disagreements = recon.find_cycle_disagreements(witnesses)
    assert not any(d["type"] in ("cycle_mismatch", "cycle_unresolved") for d in disagreements)


def test_verdict_pass_when_clean():
    assert recon.determine_verdict([], []) == "PASS"


def test_verdict_quarantine_on_gi_spread():
    assert recon.determine_verdict([{"type": "gi_spread"}], []) == "QUARANTINE"


def test_verdict_clarify_on_open_gate_only():
    verdict = recon.determine_verdict([], [{"gate": "sustain_not_wired", "status": "open"}])
    assert verdict == "CLARIFY"


def test_extract_gi_flags_internal_snapshot_disagreement():
    witnesses = [
        make_witness(
            "terminal_snapshot_lite",
            value={
                "gi": 0.792,
                "gi_verified": True,
                "cycle": "C-383",
                "timestamp": "t",
                "lanes": {"integrity": {"gi": 0.792, "verified": False}},
            },
        ),
    ]
    obs = recon.extract_gi_observations(witnesses)
    sources = {o["source"] for o in obs}
    assert "terminal_snapshot_lite.gi" in sources
    assert "terminal_snapshot_lite.lanes.integrity.gi" in sources


def test_gi_source_unwired_detected_when_ledger_gi_null():
    witnesses = [make_witness("ledger_pulse", value={"cycle": "unknown", "gi": None})]
    disagreements = recon.find_gi_source_unwired(witnesses)
    assert len(disagreements) == 1
    assert disagreements[0]["type"] == "gi_source_unwired"


def test_gi_source_unwired_not_flagged_when_ledger_gi_present():
    witnesses = [make_witness("ledger_pulse", value={"cycle": "C-383", "gi": 0.8})]
    assert recon.find_gi_source_unwired(witnesses) == []


def test_ledger_null_gi_not_double_reported_as_generic_disagreement():
    obs = [
        {"source": "ledger_pulse.gi", "value": None},
        {"source": "terminal_snapshot_lite.gi", "value": 0.79},
    ]
    disagreements = recon.find_gi_disagreements(obs)
    assert not any(d["type"] == "null_vs_numeric_gi" for d in disagreements)


def test_vault_witness_divergence_detected_on_same_id_contradictory_state():
    witnesses = [
        make_witness(
            "ledger_vault_global",
            value={"vault_id": "vault-global", "sealed_blocks": 0, "total_balance": 0.0},
            source="ledger",
        ),
        make_witness(
            "terminal_vault_status",
            value={
                "vault_id": "vault-global",
                "reserve_blocks_sealed": 360,
                "sealed_reserve_total": 18000,
            },
            source="terminal",
        ),
    ]
    disagreements = recon.find_vault_divergence(witnesses)
    assert len(disagreements) == 1
    assert disagreements[0]["type"] == "vault_witness_divergence"


def test_vault_witness_divergence_not_flagged_when_ids_differ():
    witnesses = [
        make_witness(
            "ledger_vault_global",
            value={"vault_id": "vault-alpha", "sealed_blocks": 0, "total_balance": 0.0},
        ),
        make_witness(
            "terminal_vault_status",
            value={"vault_id": "vault-beta", "reserve_blocks_sealed": 360, "sealed_reserve_total": 18000},
        ),
    ]
    assert recon.find_vault_divergence(witnesses) == []


def test_vault_witness_divergence_not_flagged_when_both_zero():
    witnesses = [
        make_witness("ledger_vault_global", value={"vault_id": "v", "sealed_blocks": 0, "total_balance": 0.0}),
        make_witness(
            "terminal_vault_status",
            value={"vault_id": "v", "reserve_blocks_sealed": 0, "sealed_reserve_total": 0},
        ),
    ]
    assert recon.find_vault_divergence(witnesses) == []


def test_vault_witness_divergence_is_a_hard_blocker():
    assert recon.determine_verdict([{"type": "vault_witness_divergence"}], []) == "QUARANTINE"


def test_report_never_averages_gi():
    src = (SCRIPTS / "c383_reconciliation.py").read_text()
    assert "mean(" not in src
    assert "/ len(" not in src
