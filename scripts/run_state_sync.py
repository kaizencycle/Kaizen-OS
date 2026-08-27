#!/usr/bin/env python3
"""Entrypoint for mobius-bot-state-sync (GitHub Actions)."""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPTS))

from state_sync_cycle import (  # noqa: E402
    DEFAULT_LEDGER_BASE_URL,
    apply_cycle_writer_hygiene,
    build_ledger_journal_fields,
    compute_cycle_id,
    fetch_ledger_pulse,
    is_atlas_cycle_journal,
    merge_journal_record,
    should_refresh_ledger_fields,
)

ROOT = _SCRIPTS.parent


def main() -> int:
    today = datetime.now(timezone.utc).date()
    cycle = compute_cycle_id(today)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    base = (
        os.environ.get("LEDGER_BASE_URL", "").strip()
        or os.environ.get("LEDGER_BASE_URL_FALLBACK", "").strip()
        or DEFAULT_LEDGER_BASE_URL
    )
    fetch = fetch_ledger_pulse(base)
    ledger_fields = build_ledger_journal_fields(fetch, now)

    cycle_path = ROOT / "cycle.json"
    with cycle_path.open() as f:
        c = json.load(f)

    prev = c.get("current_cycle")
    c["current_cycle"] = cycle
    c["date"] = today.isoformat()
    c["last_updated"] = now
    c["last_state_snapshot"] = cycle
    apply_cycle_writer_hygiene(c, previous_cycle=prev, new_cycle=cycle, fetch=fetch)
    note = (
        f"Auto-sync by mobius-bot (deterministic, no LLM). Advanced {prev} -> {cycle}. "
        + (
            "GI refreshed from ledger /pulse/state."
            if fetch.verified and fetch.snapshot and fetch.snapshot.get("gi") is not None
            else "Ledger pulse fetched; GI not updated (unreachable, absent, or null in pulse)."
        )
    )
    c["notes"] = note

    with cycle_path.open("w") as f:
        json.dump(c, f, indent=2)
        f.write("\n")

    (ROOT / "STATE" / "CYCLE.txt").write_text(cycle + "\n")

    journal_dir = ROOT / "journals" / "cycles"
    journal_dir.mkdir(parents=True, exist_ok=True)
    journal_path = journal_dir / f"{cycle}.json"

    existing = None
    if journal_path.exists():
        with journal_path.open() as f:
            existing = json.load(f)

    if existing is not None and is_atlas_cycle_journal(existing):
        print(
            "::warning::skipping ledger witness write — ATLAS cycle journal present "
            f"({journal_path.name}); Layer-1 fields must not overwrite meta/signals journal"
        )
    elif not journal_path.exists() or should_refresh_ledger_fields(existing):
        record = merge_journal_record(existing, cycle, today, ledger_fields)
        with journal_path.open("w") as f:
            json.dump(record, f, indent=2)
            f.write("\n")

    health = {
        "writer": "mobius-bot-state-sync",
        "last_run_at": now,
        "last_cycle": cycle,
        "status": "ok",
        "ledger_verified": fetch.verified,
        "ledger_witness_url": fetch.witness_url,
        "gi_attested_this_cycle": c.get("gi_attested_this_cycle", False),
    }
    if fetch.withheld_reason:
        health["ledger_withheld_reason"] = fetch.withheld_reason
    if c.get("gi_withheld_reason"):
        health["gi_withheld_reason"] = c["gi_withheld_reason"]

    with (ROOT / "STATE" / "writer-health.json").open("w") as f:
        json.dump(health, f, indent=2)
        f.write("\n")

    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a") as f:
            f.write(f"cycle={cycle}\n")
            f.write(f"ledger_verified={'true' if fetch.verified else 'false'}\n")

    if not fetch.verified:
        print(f"::warning::ledger pulse not verified: {fetch.withheld_reason} ({fetch.error})")
    elif fetch.snapshot and fetch.snapshot.get("gi") is None:
        print("::warning::ledger /pulse/state returned gi=null — ledger_verified true, gi not attested in cycle.json")

    return 0


if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    raise SystemExit(main())
