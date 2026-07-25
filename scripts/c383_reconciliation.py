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

REQUIRED_WITNESS_NAMES = (
    "substrate_cycle_json",
    "substrate_writer_health",
    "terminal_snapshot_lite",
    "terminal_vault_status",
    "ledger_pulse",
    "ledger_vault_global",
)

UNRESOLVED_CYCLE_MARKERS = frozenset({None, "unknown"})


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


def _coerce_witness_object(
    ok: bool, data: Any, err: str | None
) -> tuple[bool, Any, str | None]:
    if not ok:
        return ok, data, err
    if isinstance(data, dict):
        return True, data, None
    return False, None, f"expected JSON object, got {type(data).__name__}"


def witness_payload(w: Witness | None) -> dict[str, Any] | None:
    if not w or not w.ok or not isinstance(w.value, dict):
        return None
    return w.value


def fetch_json(url: str, timeout: float = 15.0) -> tuple[bool, Any, str | None]:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return _coerce_witness_object(True, json.load(r), None)
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
        return _coerce_witness_object(True, json.loads(out.stdout), None)
    except subprocess.TimeoutExpired:
        return False, None, "git show timed out after 15s"
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
    cyc_p = witness_payload(cyc)
    if cyc_p is not None and "gi" in cyc_p:
        observations.append(
            {
                "source": cyc.name,
                "value": cyc_p.get("gi"),
                "cycle": cyc_p.get("current_cycle"),
                "as_of": cyc_p.get("last_updated"),
            }
        )

    snap = by_name.get("terminal_snapshot_lite")
    snap_p = witness_payload(snap)
    if snap_p is not None:
        if "gi" in snap_p:
            observations.append(
                {
                    "source": "terminal_snapshot_lite.gi",
                    "value": snap_p.get("gi"),
                    "cycle": snap_p.get("cycle"),
                    "as_of": snap_p.get("timestamp"),
                    "verified": snap_p.get("gi_verified"),
                }
            )
        lanes = snap_p.get("lanes", {}) or {}
        integrity = lanes.get("integrity", {}) if isinstance(lanes, dict) else {}
        if isinstance(integrity, dict) and "gi" in integrity:
            observations.append(
                {
                    "source": "terminal_snapshot_lite.lanes.integrity.gi",
                    "value": integrity.get("gi"),
                    "cycle": snap_p.get("cycle"),
                    "as_of": snap_p.get("timestamp"),
                    "verified": integrity.get("verified"),
                    "note": (
                        "lanes.integrity.gi"
                        + ("; compare to top-level gi when both present" if "gi" in snap_p else "")
                    ),
                }
            )

    vault = by_name.get("terminal_vault_status")
    vault_p = witness_payload(vault)
    if vault_p is not None and "gi_current" in vault_p:
        observations.append(
            {
                "source": "terminal_vault_status.gi_current",
                "value": vault_p.get("gi_current"),
                "as_of": vault_p.get("timestamp"),
            }
        )

    ledger = by_name.get("ledger_pulse")
    ledger_p = witness_payload(ledger)
    if ledger_p is not None:
        observations.append(
            {
                "source": "ledger_pulse.gi",
                "value": ledger_p.get("gi"),
                "cycle": ledger_p.get("cycle"),
                "as_of": ledger_p.get("attested_at"),
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


def witness_effective_ok(w: Witness) -> bool:
    return w.ok and isinstance(w.value, dict)


def find_witness_unavailable(witnesses: list[Witness]) -> list[dict]:
    failed = [
        w for w in witnesses if w.name in REQUIRED_WITNESS_NAMES and not witness_effective_ok(w)
    ]
    if not failed:
        return []
    return [
        {
            "type": "witness_unavailable",
            "note": "required witness fetch failed — reconciliation incomplete; not PASS",
            "failures": [
                {
                    "name": w.name,
                    "source": w.source,
                    "error": w.error
                    or (
                        f"expected JSON object, got {type(w.value).__name__}"
                        if w.ok
                        else "witness not ok"
                    ),
                }
                for w in failed
            ],
        }
    ]


def find_gi_source_unwired(witnesses: list[Witness]) -> list[dict]:
    by_name = {w.name: w for w in witnesses}
    ledger = by_name.get("ledger_pulse")
    payload = witness_payload(ledger)
    if payload is None:
        return []
    if payload.get("gi") is not None:
        return []
    return [
        {
            "type": "gi_source_unwired",
            "classification": "hypothesis_pulse_only",
            "note": (
                "ledger /pulse/state is reachable and gi is null. Pulse alone cannot "
                "distinguish unwired GI input (GI_STATE_JSON / gi_state.json) from "
                "malformed config or a state file missing global_integrity/gi — see "
                "LEDGER_GI_SOURCE_TRACE.md for the integration hypothesis."
            ),
            "source": ledger.source,
            "see": "docs/epicon/cycles/C-383/LEDGER_GI_SOURCE_TRACE.md",
        }
    ]


def find_cycle_disagreements(witnesses: list[Witness]) -> list[dict]:
    by_name = {w.name: w for w in witnesses}
    cycles: dict[str, str | None] = {}

    cyc = by_name.get("substrate_cycle_json")
    cyc_p = witness_payload(cyc)
    if cyc_p is not None:
        cycles["substrate_cycle_json"] = cyc_p.get("current_cycle")

    wh = by_name.get("substrate_writer_health")
    wh_p = witness_payload(wh)
    if wh_p is not None:
        cycles["substrate_writer_health"] = wh_p.get("last_cycle")

    snap = by_name.get("terminal_snapshot_lite")
    snap_p = witness_payload(snap)
    if snap_p is not None:
        cycles["terminal_snapshot_lite.cycle"] = snap_p.get("cycle")
        cycles["terminal_snapshot_lite.scan_cycle"] = snap_p.get("scan_cycle")

    ledger = by_name.get("ledger_pulse")
    ledger_p = witness_payload(ledger)
    if ledger_p is not None:
        cycles["ledger_pulse"] = ledger_p.get("cycle")

    resolved = {v for v in cycles.values() if v not in UNRESOLVED_CYCLE_MARKERS}
    disagreements = []
    if len(resolved) > 1:
        disagreements.append(
            {
                "type": "cycle_mismatch",
                "note": "witnesses with resolved cycle ids do not agree",
                "by_source": cycles,
                "resolved_values": sorted(resolved),
            }
        )
    unknowns = [k for k, v in cycles.items() if v in UNRESOLVED_CYCLE_MARKERS]
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

    lv = witness_payload(ledger_vault) or {}
    tv = witness_payload(terminal_vault) or {}

    ledger_id = lv.get("vault_id")
    terminal_id = tv.get("vault_id")
    ledger_sealed = lv.get("sealed_blocks")
    terminal_sealed = tv.get("reserve_blocks_sealed")
    ledger_balance = lv.get("total_balance")
    terminal_balance = tv.get("sealed_reserve_total")

    if ledger_id is None or ledger_id != terminal_id:
        return []

    sealed_mismatch = (
        isinstance(ledger_sealed, (int, float))
        and isinstance(terminal_sealed, (int, float))
        and ledger_sealed != terminal_sealed
    )
    balance_mismatch = (
        isinstance(ledger_balance, (int, float))
        and isinstance(terminal_balance, (int, float))
        and ledger_balance != terminal_balance
    )

    if sealed_mismatch or balance_mismatch:
        return [
            {
                "type": "vault_witness_divergence",
                "note": (
                    f"ledger_vault_global and terminal_vault_status both report "
                    f"vault_id={ledger_id!r} but sealed counts and/or balances disagree — "
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
                "sealed_mismatch": sealed_mismatch,
                "balance_mismatch": balance_mismatch,
            }
        ]
    return []


def find_gate_status(witnesses: list[Witness]) -> list[dict]:
    by_name = {w.name: w for w in witnesses}
    gates = []

    cyc = by_name.get("substrate_cycle_json")
    cyc_p = witness_payload(cyc)
    if cyc_p is not None:
        vault = cyc_p.get("vault", {}) or {}
        if isinstance(vault, dict) and vault.get("fountain_status") == "locked":
            gates.append(
                {"gate": "fountain_gi_below_threshold", "source": "substrate_cycle_json", "status": "open"}
            )

    vault_status = by_name.get("terminal_vault_status")
    v = witness_payload(vault_status)
    if v is not None:
        if not v.get("sustain_cycles_met", True):
            gates.append({"gate": "sustain_not_wired", "source": "terminal_vault_status", "status": "open"})
        gate_info = v.get("integrity_gate") or v.get("seal_integrity_gate") or {}
        if isinstance(gate_info, dict) and gate_info.get("sealing_suspended"):
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
    hard_blocker_types = ("gi_spread", "cycle_mismatch", "vault_witness_divergence")
    hard_blockers = [d for d in disagreements if d["type"] in hard_blocker_types]
    if hard_blockers:
        return "QUARANTINE"
    if any(d["type"] == "witness_unavailable" for d in disagreements):
        return "CLARIFY"
    if not disagreements and not gates:
        return "PASS"
    return "CLARIFY"


def build_report(git_ref: str = "origin/main") -> Report:
    witnesses = collect_witnesses(git_ref)
    witness_gaps = find_witness_unavailable(witnesses)
    gi_obs = extract_gi_observations(witnesses)
    gi_disagreements = find_gi_disagreements(gi_obs)
    gi_source_disagreements = find_gi_source_unwired(witnesses)
    cycle_disagreements = find_cycle_disagreements(witnesses)
    vault_disagreements = find_vault_divergence(witnesses)
    gates = find_gate_status(witnesses)

    by_name = {w.name: w for w in witnesses}
    cyc = by_name.get("substrate_cycle_json")
    cyc_p = witness_payload(cyc)
    cycle = cyc_p.get("current_cycle") if cyc_p else None

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
        witness_gaps
        + gi_disagreements
        + gi_source_disagreements
        + cycle_disagreements
        + vault_disagreements
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
