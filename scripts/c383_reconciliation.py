#!/usr/bin/env python3
"""
C-383 Reconciliation Gate (optimization #20).

Reads existing witnesses and reports where they agree or disagree.
Creates NO new source of truth — this is a read-only aggregator.

Witnesses read (all live, no assumptions about which is "correct"):
  - Mobius-Substrate cycle.json               (repo, committed)
  - Mobius-Substrate STATE/writer-health.json (repo, committed)
  - Terminal snapshot-lite                    (live HTTP)
  - Terminal vault/status                     (live HTTP)
  - Civic-Protocol-Core ledger /pulse/state   (live HTTP)
  - Civic-Protocol-Core ledger /api/vault/global (live HTTP)

Taxonomy: docs/epicon/cycles/C-383/LEDGER_GI_SOURCE_TRACE.md

Per the C-383 DO-NOT-DO list: this script does not average GI values,
does not manufacture a single canonical number, and does not treat any
one UI/runtime value as ground truth.
"""
from __future__ import annotations

import json
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

TERMINAL_SNAPSHOT_LITE = "https://mobius-civic-ai-terminal.vercel.app/api/terminal/snapshot-lite"
TERMINAL_VAULT_STATUS = "https://mobius-civic-ai-terminal.vercel.app/api/vault/status"
LEDGER_PULSE = "https://civic-protocol-core-ledger.onrender.com/pulse/state"
LEDGER_VAULT_GLOBAL = "https://civic-protocol-core-ledger.onrender.com/api/vault/global"

GI_AGREEMENT_TOLERANCE = 0.02


@dataclass
class Witness:
    name: str
    source: str
    fetched_at: str
    ok: bool
    value: Any = None
    error: str | None = None


@dataclass
class Report:
    cycle: str | None = None
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    canon: dict = field(default_factory=dict)
    ledger: dict = field(default_factory=dict)
    terminal: dict = field(default_factory=dict)
    witnesses: list = field(default_factory=list)
    gates: list = field(default_factory=list)
    disagreements: list = field(default_factory=list)
    verdict: str = "CLARIFY"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def fetch_json(url: str, timeout: float = 15.0) -> tuple[bool, Any, str | None]:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return True, json.load(r), None
    except (
        urllib.error.URLError,
        urllib.error.HTTPError,
        TimeoutError,
        json.JSONDecodeError,
        OSError,
    ) as e:
        return False, None, str(e)[:300]


def git_show(ref: str, path: str) -> tuple[bool, Any, str | None]:
    try:
        out = subprocess.run(
            ["git", "show", f"{ref}:{path}"],
            capture_output=True,
            text=True,
            timeout=15,
            check=True,
        )
        return True, json.loads(out.stdout), None
    except subprocess.CalledProcessError as e:
        return False, None, f"git show failed: {e.stderr.strip()[:300]}"
    except json.JSONDecodeError as e:
        return False, None, f"not valid JSON: {e}"
    except OSError as e:
        return False, None, str(e)[:300]


def collect_witnesses(git_ref: str = "origin/main") -> list[Witness]:
    witnesses: list[Witness] = []

    ok, data, err = git_show(git_ref, "cycle.json")
    witnesses.append(
        Witness(
            name="substrate_cycle_json",
            source=f"git:{git_ref}:cycle.json",
            fetched_at=_now(),
            ok=ok,
            value=data,
            error=err,
        )
    )

    ok, data, err = git_show(git_ref, "STATE/writer-health.json")
    witnesses.append(
        Witness(
            name="substrate_writer_health",
            source=f"git:{git_ref}:STATE/writer-health.json",
            fetched_at=_now(),
            ok=ok,
            value=data,
            error=err,
        )
    )

    for name, url in (
        ("terminal_snapshot_lite", TERMINAL_SNAPSHOT_LITE),
        ("terminal_vault_status", TERMINAL_VAULT_STATUS),
        ("ledger_pulse", LEDGER_PULSE),
        ("ledger_vault_global", LEDGER_VAULT_GLOBAL),
    ):
        ok, data, err = fetch_json(url)
        witnesses.append(
            Witness(name=name, source=url, fetched_at=_now(), ok=ok, value=data, error=err)
        )

    return witnesses


def extract_gi_observations(witnesses: list[Witness]) -> list[dict]:
    observations = []
    by_name = {w.name: w for w in witnesses}

    cyc = by_name.get("substrate_cycle_json")
    if cyc and cyc.ok and isinstance(cyc.value, dict) and "gi" in cyc.value:
        observations.append(
            {
                "source": cyc.name,
                "value": cyc.value.get("gi"),
                "cycle": cyc.value.get("current_cycle"),
                "as_of": cyc.value.get("last_updated"),
            }
        )

    snap = by_name.get("terminal_snapshot_lite")
    if snap and snap.ok and isinstance(snap.value, dict):
        observations.append(
            {
                "source": "terminal_snapshot_lite.gi",
                "value": snap.value.get("gi"),
                "cycle": snap.value.get("cycle"),
                "as_of": snap.value.get("timestamp"),
                "verified": snap.value.get("gi_verified"),
            }
        )
        lanes = snap.value.get("lanes", {}) or {}
        integrity = lanes.get("integrity", {}) or {}
        if "gi" in integrity:
            observations.append(
                {
                    "source": "terminal_snapshot_lite.lanes.integrity.gi",
                    "value": integrity.get("gi"),
                    "cycle": snap.value.get("cycle"),
                    "as_of": snap.value.get("timestamp"),
                    "verified": integrity.get("verified"),
                    "note": "same payload as terminal_snapshot_lite.gi — check for internal disagreement",
                }
            )

    vault = by_name.get("terminal_vault_status")
    if vault and vault.ok and isinstance(vault.value, dict) and "gi_current" in vault.value:
        observations.append(
            {
                "source": "terminal_vault_status.gi_current",
                "value": vault.value.get("gi_current"),
                "as_of": vault.value.get("timestamp"),
            }
        )

    ledger = by_name.get("ledger_pulse")
    if ledger and ledger.ok and isinstance(ledger.value, dict):
        observations.append(
            {
                "source": "ledger_pulse.gi",
                "value": ledger.value.get("gi"),
                "cycle": ledger.value.get("cycle"),
                "as_of": ledger.value.get("attested_at"),
            }
        )

    return observations


def find_gi_disagreements(observations: list[dict]) -> list[dict]:
    numeric = [o for o in observations if isinstance(o.get("value"), (int, float))]
    disagreements = []

    if len(numeric) >= 2:
        values = [o["value"] for o in numeric]
        spread = max(values) - min(values)
        if spread > GI_AGREEMENT_TOLERANCE:
            disagreements.append(
                {
                    "type": "gi_spread",
                    "spread": round(spread, 4),
                    "tolerance": GI_AGREEMENT_TOLERANCE,
                    "observations": numeric,
                }
            )

    null_gi = [o for o in observations if o.get("value") is None]
    if null_gi and numeric:
        generic_null = [o for o in null_gi if o["source"] != "ledger_pulse.gi"]
        if generic_null:
            disagreements.append(
                {
                    "type": "null_vs_numeric_gi",
                    "note": "at least one witness reports GI as null while others report a number",
                    "null_sources": [o["source"] for o in generic_null],
                    "numeric_sources": [o["source"] for o in numeric],
                }
            )

    return disagreements


def find_gi_source_unwired(witnesses: list[Witness]) -> list[dict]:
    by_name = {w.name: w for w in witnesses}
    ledger = by_name.get("ledger_pulse")
    if not (ledger and ledger.ok and isinstance(ledger.value, dict)):
        return []
    if ledger.value.get("gi") is not None:
        return []
    return [
        {
            "type": "gi_source_unwired",
            "note": (
                "ledger /pulse/state is reachable and gi is null — no GI_STATE_JSON/"
                "gi_state.json input wired; design decision needed, not a bugfix."
            ),
            "source": ledger.source,
            "see": "docs/epicon/cycles/C-383/LEDGER_GI_SOURCE_TRACE.md",
        }
    ]


def find_cycle_disagreements(witnesses: list[Witness]) -> list[dict]:
    by_name = {w.name: w for w in witnesses}
    cycles: dict[str, str | None] = {}

    cyc = by_name.get("substrate_cycle_json")
    if cyc and cyc.ok:
        cycles["substrate_cycle_json"] = cyc.value.get("current_cycle")

    wh = by_name.get("substrate_writer_health")
    if wh and wh.ok:
        cycles["substrate_writer_health"] = wh.value.get("last_cycle")

    snap = by_name.get("terminal_snapshot_lite")
    if snap and snap.ok:
        cycles["terminal_snapshot_lite.cycle"] = snap.value.get("cycle")
        cycles["terminal_snapshot_lite.scan_cycle"] = snap.value.get("scan_cycle")

    ledger = by_name.get("ledger_pulse")
    if ledger and ledger.ok:
        cycles["ledger_pulse"] = ledger.value.get("cycle")

    distinct = {v for v in cycles.values() if v is not None}
    disagreements = []
    if len(distinct) > 1:
        disagreements.append(
            {
                "type": "cycle_mismatch",
                "note": "witnesses do not agree on the current cycle",
                "by_source": cycles,
            }
        )
    unknowns = [k for k, v in cycles.items() if v in (None, "unknown")]
    if unknowns:
        disagreements.append(
            {
                "type": "cycle_unresolved",
                "note": "at least one witness could not report a cycle at all",
                "sources": unknowns,
            }
        )
    return disagreements


def find_vault_divergence(witnesses: list[Witness]) -> list[dict]:
    by_name = {w.name: w for w in witnesses}
    ledger_vault = by_name.get("ledger_vault_global")
    terminal_vault = by_name.get("terminal_vault_status")

    if not (ledger_vault and ledger_vault.ok and terminal_vault and terminal_vault.ok):
        return []

    lv = ledger_vault.value or {}
    tv = terminal_vault.value or {}

    ledger_id = lv.get("vault_id")
    terminal_id = tv.get("vault_id")
    ledger_sealed = lv.get("sealed_blocks")
    terminal_sealed = tv.get("reserve_blocks_sealed")
    ledger_balance = lv.get("total_balance")
    terminal_balance = tv.get("sealed_reserve_total")

    same_id_contradictory_state = (
        ledger_id is not None
        and ledger_id == terminal_id
        and isinstance(ledger_sealed, (int, float))
        and isinstance(terminal_sealed, (int, float))
        and terminal_sealed > 0
        and ledger_sealed == 0
    )

    if same_id_contradictory_state:
        return [
            {
                "type": "vault_witness_divergence",
                "note": (
                    f"ledger_vault_global and terminal_vault_status both report "
                    f"vault_id={ledger_id!r} but disagree on sealed state — "
                    "same declared identity, contradictory truths."
                ),
                "ledger": {
                    "vault_id": ledger_id,
                    "sealed_blocks": ledger_sealed,
                    "total_balance": ledger_balance,
                    "source": ledger_vault.source,
                },
                "terminal": {
                    "vault_id": terminal_id,
                    "reserve_blocks_sealed": terminal_sealed,
                    "sealed_reserve_total": terminal_balance,
                    "source": terminal_vault.source,
                },
            }
        ]
    return []


def find_gate_status(witnesses: list[Witness]) -> list[dict]:
    by_name = {w.name: w for w in witnesses}
    gates = []

    cyc = by_name.get("substrate_cycle_json")
    if cyc and cyc.ok:
        vault = cyc.value.get("vault", {}) or {}
        if vault.get("fountain_status") == "locked":
            gates.append(
                {"gate": "fountain_gi_below_threshold", "source": "substrate_cycle_json", "status": "open"}
            )

    vault_status = by_name.get("terminal_vault_status")
    if vault_status and vault_status.ok:
        v = vault_status.value
        if not v.get("sustain_cycles_met", True):
            gates.append({"gate": "sustain_not_wired", "source": "terminal_vault_status", "status": "open"})
        gate_info = v.get("integrity_gate") or v.get("seal_integrity_gate") or {}
        if gate_info.get("sealing_suspended"):
            gates.append(
                {
                    "gate": "cold_canon_append_pending",
                    "source": "terminal_vault_status",
                    "status": "open",
                    "reasons": gate_info.get("reasons"),
                }
            )

    return gates


def determine_verdict(disagreements: list[dict], gates: list[dict]) -> str:
    if not disagreements and not gates:
        return "PASS"
    hard_blockers = [
        d
        for d in disagreements
        if d["type"] in ("gi_spread", "cycle_mismatch", "vault_witness_divergence")
    ]
    if hard_blockers:
        return "QUARANTINE"
    return "CLARIFY"


def build_report(git_ref: str = "origin/main") -> Report:
    witnesses = collect_witnesses(git_ref)
    gi_obs = extract_gi_observations(witnesses)
    gi_disagreements = find_gi_disagreements(gi_obs)
    gi_source_disagreements = find_gi_source_unwired(witnesses)
    cycle_disagreements = find_cycle_disagreements(witnesses)
    vault_disagreements = find_vault_divergence(witnesses)
    gates = find_gate_status(witnesses)

    by_name = {w.name: w for w in witnesses}
    cyc = by_name.get("substrate_cycle_json")
    cycle = cyc.value.get("current_cycle") if (cyc and cyc.ok) else None

    report = Report(cycle=cycle)
    report.canon = {"source": "git:cycle.json", "ok": cyc.ok if cyc else False}
    report.ledger = {
        w.name: {"ok": w.ok, "value": w.value, "error": w.error, "source": w.source}
        for w in witnesses
        if w.name in ("ledger_pulse", "ledger_vault_global")
    }
    report.terminal = {
        w.name: {"ok": w.ok, "error": w.error, "source": w.source}
        for w in witnesses
        if w.name.startswith("terminal_")
    }
    report.witnesses = [
        {
            "name": w.name,
            "source": w.source,
            "fetched_at": w.fetched_at,
            "ok": w.ok,
            "error": w.error,
        }
        for w in witnesses
    ]
    report.gates = gates
    report.disagreements = (
        gi_disagreements + gi_source_disagreements + cycle_disagreements + vault_disagreements
    )
    report.verdict = determine_verdict(report.disagreements, gates)
    return report


def to_json(report: Report) -> dict:
    return {
        "cycle": report.cycle,
        "generated_at": report.generated_at,
        "canon": report.canon,
        "ledger": report.ledger,
        "terminal": report.terminal,
        "hive": {},
        "oaa": {},
        "browser": {},
        "epicon": {},
        "repositories": {},
        "issues": {},
        "pull_requests": {},
        "witnesses": report.witnesses,
        "gates": report.gates,
        "disagreements": report.disagreements,
        "verdict": report.verdict,
    }


def main() -> int:
    git_ref = sys.argv[1] if len(sys.argv) > 1 else "origin/main"
    report = build_report(git_ref)
    print(json.dumps(to_json(report), indent=2, default=str))
    return 1 if report.verdict == "QUARANTINE" else 0


if __name__ == "__main__":
    raise SystemExit(main())
