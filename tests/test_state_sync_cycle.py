"""Unit tests for scripts/state_sync_cycle.py (mobius-bot ledger witness)."""
from __future__ import annotations

import io
import json
import unittest
from datetime import date
from unittest.mock import patch

from scripts.state_sync_cycle import (
    build_ledger_journal_fields,
    compute_cycle_id,
    fetch_ledger_pulse,
    gi_attestation_status,
    merge_journal_record,
    should_refresh_ledger_fields,
)


class TestComputeCycle(unittest.TestCase):
    def test_anchor_day(self):
        self.assertEqual(compute_cycle_id(date(2026, 4, 21)), "C-288")

    def test_c383(self):
        self.assertEqual(compute_cycle_id(date(2026, 7, 25)), "C-383")


class TestFetchLedgerPulse(unittest.TestCase):
    def test_empty_url_withheld(self):
        r = fetch_ledger_pulse("")
        self.assertFalse(r.verified)
        self.assertEqual(r.withheld_reason, "LEDGER_URL_UNCONFIGURED")

    def test_pulse_ok_gi_null_still_verified(self):
        pulse = json.dumps({"cycle": "unknown", "gi": None}).encode()
        health = json.dumps({"ephemeral_storage": False}).encode()

        def fake_urlopen(url, timeout=15):
            url_s = url.get_full_url() if hasattr(url, "get_full_url") else str(url)
            if url_s.endswith("/pulse/state"):
                return io.BytesIO(pulse)
            if url_s.endswith("/health"):
                return io.BytesIO(health)
            raise AssertionError(url_s)

        with patch("urllib.request.urlopen", fake_urlopen):
            r = fetch_ledger_pulse("https://ledger.example")
        self.assertTrue(r.verified)
        self.assertIsNone(r.withheld_reason)
        self.assertIsNotNone(r.snapshot)
        self.assertEqual(r.snapshot.get("gi"), None)

    def test_pulse_unreachable(self):
        with patch("urllib.request.urlopen", side_effect=OSError("connection refused")):
            r = fetch_ledger_pulse("https://ledger.example")
        self.assertFalse(r.verified)
        self.assertEqual(r.withheld_reason, "LEDGER_PULSE_UNREACHABLE")


class TestGiAttestation(unittest.TestCase):
    def test_null_gi(self):
        ok, reason = gi_attestation_status({"gi": None})
        self.assertFalse(ok)
        self.assertEqual(reason, "GI_NULL_IN_PULSE")


class TestJournalFields(unittest.TestCase):
    def test_verified_with_gi_null_sets_gi_withheld(self):
        from scripts.state_sync_cycle import LedgerFetchResult

        fetch = LedgerFetchResult(
            verified=True,
            withheld_reason=None,
            snapshot={"gi": None},
            health=None,
            witness_url="https://x/pulse/state",
            error=None,
        )
        fields = build_ledger_journal_fields(fetch, "2026-07-25T12:00:00Z")
        self.assertTrue(fields["ledger_verified"])
        self.assertFalse(fields["ledger_gi_attested"])
        self.assertEqual(fields["ledger_gi_withheld_reason"], "GI_NULL_IN_PULSE")


class TestRefreshPolicy(unittest.TestCase):
    def test_refresh_when_false(self):
        self.assertTrue(should_refresh_ledger_fields({"ledger_verified": False}))

    def test_skip_when_true(self):
        self.assertFalse(should_refresh_ledger_fields({"ledger_verified": True}))

    def test_merge_preserves_narrative(self):
        existing = {"narrative": "ATLAS note", "ledger_verified": False}
        fields = {"ledger_verified": True, "ledger_snapshot": {"gi": None}}
        out = merge_journal_record(existing, "C-383", date(2026, 7, 25), fields)
        self.assertEqual(out["narrative"], "ATLAS note")
        self.assertTrue(out["ledger_verified"])


if __name__ == "__main__":
    unittest.main()
