#!/usr/bin/env python3
"""
Layer-1 deterministic cycle writer logic (mobius-bot-state-sync).

Quorum / sentinel verification is out of scope — this module only witnesses
Civic Ledger /pulse/state (and optional /health) for journals/cycles/*.json.
"""
from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import Any

DEFAULT_LEDGER_BASE_URL = "https://civic-protocol-core-ledger.onrender.com"

ANCHOR_CYCLE = 288
ANCHOR_DATE = date(2026, 4, 21)

# Replaced wholesale on each ledger refresh (avoids stale failure fields after retry).
LEDGER_JOURNAL_KEYS = (
    "ledger_verified",
    "ledger_snapshot",
    "ledger_snapshot_at",
    "ledger_witness_url",
    "ledger_gi_attested",
    "ledger_withheld_reason",
    "ledger_gi_withheld_reason",
    "ledger_fetch_error",
    "ledger_health_ephemeral",
)


@dataclass
class LedgerFetchResult:
    verified: bool
    withheld_reason: str | None
    snapshot: dict[str, Any] | None
    health: dict[str, Any] | None
    witness_url: str | None
    error: str | None


def compute_cycle_id(today: date | None = None) -> str:
    today = today or datetime.now(timezone.utc).date()
    cycle_n = ANCHOR_CYCLE + (today - ANCHOR_DATE).days
    return f"C-{cycle_n}"


def fetch_ledger_pulse(base_url: str, timeout: float = 15.0) -> LedgerFetchResult:
    base = (base_url or "").strip().rstrip("/")
    if not base:
        return LedgerFetchResult(
            verified=False,
            withheld_reason="LEDGER_URL_UNCONFIGURED",
            snapshot=None,
            health=None,
            witness_url=None,
            error="LEDGER_BASE_URL empty",
        )

    pulse_url = f"{base}/pulse/state"
    health_url = f"{base}/health"
    snapshot: dict[str, Any] | None = None
    health: dict[str, Any] | None = None

    try:
        with urllib.request.urlopen(pulse_url, timeout=timeout) as r:
            snapshot = json.load(r)
    except (
        urllib.error.URLError,
        urllib.error.HTTPError,
        json.JSONDecodeError,
        TimeoutError,
        OSError,
    ) as e:
        return LedgerFetchResult(
            verified=False,
            withheld_reason="LEDGER_PULSE_UNREACHABLE",
            snapshot=None,
            health=None,
            witness_url=pulse_url,
            error=str(e)[:500],
        )

    try:
        with urllib.request.urlopen(health_url, timeout=timeout) as r:
            health = json.load(r)
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, TimeoutError):
        health = None

    return LedgerFetchResult(
        verified=True,
        withheld_reason=None,
        snapshot=snapshot,
        health=health,
        witness_url=pulse_url,
        error=None,
    )


def is_atlas_cycle_journal(data: dict[str, Any] | None) -> bool:
    """Full ATLAS/issue-compiled journal (meta/signals/seal) — not Layer-1 writer stub."""
    return bool(data and isinstance(data.get("meta"), dict))


def gi_attestation_status(snapshot: dict[str, Any] | None) -> tuple[bool, str | None]:
    if not snapshot:
        return False, "NO_LEDGER_SNAPSHOT"
    gi = snapshot.get("gi")
    if gi is None:
        return False, "GI_NULL_IN_PULSE"
    return True, None


def build_ledger_journal_fields(
    fetch: LedgerFetchResult,
    fetched_at: str,
) -> dict[str, Any]:
    gi_ok, gi_reason = gi_attestation_status(fetch.snapshot)
    fields: dict[str, Any] = {
        "ledger_verified": fetch.verified,
        "ledger_snapshot": fetch.snapshot if fetch.verified else None,
        "ledger_snapshot_at": fetched_at if fetch.verified else None,
        "ledger_witness_url": fetch.witness_url,
        "ledger_gi_attested": gi_ok if fetch.verified else False,
    }
    if fetch.withheld_reason:
        fields["ledger_withheld_reason"] = fetch.withheld_reason
    elif fetch.verified and not gi_ok and gi_reason:
        fields["ledger_gi_withheld_reason"] = gi_reason
    if fetch.error:
        fields["ledger_fetch_error"] = fetch.error
    if fetch.health:
        ephemeral = fetch.health.get("ephemeral_storage")
        if isinstance(ephemeral, bool):
            fields["ledger_health_ephemeral"] = ephemeral
    return fields


def merge_journal_record(
    existing: dict[str, Any] | None,
    cycle: str,
    today: date,
    ledger_fields: dict[str, Any],
) -> dict[str, Any]:
    base = existing or {
        "cycle": cycle,
        "date": today.isoformat(),
        "writer": "mobius-bot/state-sync",
        "narrative": None,
    }
    base["cycle"] = cycle
    base["date"] = today.isoformat()
    base.setdefault("writer", "mobius-bot/state-sync")
    base.setdefault("narrative", None)
    for key in LEDGER_JOURNAL_KEYS:
        base.pop(key, None)
    base.update(ledger_fields)
    return base


def should_refresh_ledger_fields(existing: dict[str, Any] | None) -> bool:
    """Re-fetch when pulse unverified, or verified but GI not yet attested in journal."""
    if is_atlas_cycle_journal(existing):
        return False
    if not existing:
        return True
    if existing.get("ledger_verified") is not True:
        return True
    if existing.get("ledger_gi_attested") is not True:
        return True
    return False


CYCLE_SCOPED_RECONCILIATION_KEYS = (
    "operational_pulse",
    "competing_projections",
    "superseded_fields",
    "editorial_pointer",
    "gi_status",
    "gi_editorial_class",
    "mode_status",
)


def is_cycle_scoped_open_flag(flag: str) -> bool:
    return bool(re.match(r"^c\d+-", flag, re.IGNORECASE))


def apply_cycle_writer_hygiene(
    cycle_doc: dict[str, Any],
    *,
    previous_cycle: str | None,
    new_cycle: str,
    fetch: LedgerFetchResult,
) -> None:
    """Keep mobius-bot writer from leaving stale reconciliation metadata behind."""
    if previous_cycle and previous_cycle != new_cycle:
        for key in CYCLE_SCOPED_RECONCILIATION_KEYS:
            cycle_doc.pop(key, None)
        cycle_doc["open_flags"] = [
            flag
            for flag in cycle_doc.get("open_flags", [])
            if not is_cycle_scoped_open_flag(flag)
        ]
        cycle_doc["previous_cycle"] = previous_cycle
        cycle_doc["updated_by"] = "mobius-bot-state-sync"

    if fetch.verified and fetch.snapshot and fetch.snapshot.get("gi") is not None:
        cycle_doc["gi"] = fetch.snapshot["gi"]
        cycle_doc["gi_attested_at"] = new_cycle
        cycle_doc["gi_attested_this_cycle"] = True
        for key in ("gi_status", "gi_editorial_class", "mode_status", "gi_withheld_reason"):
            cycle_doc.pop(key, None)
        mode = fetch.snapshot.get("mode")
        if mode in ("green", "yellow", "red"):
            cycle_doc["mode"] = mode
    else:
        # cycle.json's own `gi` field is carried forward unchanged from the
        # last cycle where the ledger pulse actually attested a value. That
        # carry-forward was previously silent (visible only as a CI log
        # warning and a per-cycle journal field); surface it durably here so
        # a reader of cycle.json alone — not just the day's Actions log or
        # journals/cycles/<cycle>.json — can see the value is stale. This is
        # not GI calculation: no numeric value is invented or averaged.
        cycle_doc["gi_attested_this_cycle"] = False
        _, gi_reason = gi_attestation_status(fetch.snapshot)
        cycle_doc["gi_withheld_reason"] = (
            fetch.withheld_reason or gi_reason or "LEDGER_PULSE_UNVERIFIED"
        )
