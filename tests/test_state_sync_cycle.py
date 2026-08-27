"""Unit tests for scripts/state_sync_cycle.py (mobius-bot ledger witness)."""
from __future__ import annotations

import io
import json
import unittest
from datetime import date
from unittest.mock import patch

from scripts.state_sync_cycle import (
    LedgerFetchResult,
    apply_cycle_writer_hygiene,
    build_ledger_journal_fields,
    compute_cycle_id,
    fetch_ledger_pulse,
    gi_attestation_status,
    is_atlas_cycle_journal,
    is_cycle_scoped_open_flag,
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

    def test_health_omits_null_ephemeral(self):
        fetch = LedgerFetchResult(
            verified=True,
            withheld_reason=None,
            snapshot={"gi": None},
            health={},
            witness_url="https://x/pulse/state",
            error=None,
        )
        fields = build_ledger_journal_fields(fetch, "2026-07-25T12:00:00Z")
        self.assertNotIn("ledger_health_ephemeral", fields)


class TestRefreshPolicy(unittest.TestCase):
    def test_atlas_journal_never_refreshed(self):
        atlas = {"meta": {"cycle_id": "C-100", "date": "2026-01-01", "timezone": "UTC", "chamber": "x"}}
        self.assertTrue(is_atlas_cycle_journal(atlas))
        self.assertFalse(should_refresh_ledger_fields(atlas))

    def test_refresh_when_false(self):
        self.assertTrue(should_refresh_ledger_fields({"ledger_verified": False}))

    def test_refresh_when_verified_but_gi_not_attested(self):
        self.assertTrue(
            should_refresh_ledger_fields(
                {"ledger_verified": True, "ledger_gi_attested": False}
            )
        )

    def test_skip_when_verified_and_gi_attested(self):
        self.assertFalse(
            should_refresh_ledger_fields(
                {"ledger_verified": True, "ledger_gi_attested": True}
            )
        )

    def test_merge_clears_stale_failure_fields(self):
        existing = {
            "ledger_verified": False,
            "ledger_withheld_reason": "LEDGER_PULSE_UNREACHABLE",
            "ledger_fetch_error": "timeout",
        }
        fields = build_ledger_journal_fields(
            LedgerFetchResult(
                verified=True,
                withheld_reason=None,
                snapshot={"gi": 0.91},
                health=None,
                witness_url="https://x/pulse/state",
                error=None,
            ),
            "2026-07-25T12:00:00Z",
        )
        out = merge_journal_record(existing, "C-383", date(2026, 7, 25), fields)
        self.assertTrue(out["ledger_verified"])
        self.assertNotIn("ledger_withheld_reason", out)
        self.assertNotIn("ledger_fetch_error", out)
        self.assertTrue(out["ledger_gi_attested"])

    def test_merge_preserves_narrative(self):
        existing = {"narrative": "ATLAS note", "ledger_verified": False}
        fields = {"ledger_verified": True, "ledger_snapshot": {"gi": None}}
        out = merge_journal_record(existing, "C-383", date(2026, 7, 25), fields)
        self.assertEqual(out["narrative"], "ATLAS note")
        self.assertTrue(out["ledger_verified"])


class TestCycleWriterHygiene(unittest.TestCase):
    def test_cycle_scoped_open_flag(self):
        self.assertTrue(is_cycle_scoped_open_flag("c410-zeus-dispute-unresolved"))
        self.assertFalse(is_cycle_scoped_open_flag("mic-wallet-render-crash-loop"))

    def test_cycle_advance_clears_reconciliation_metadata(self):
        doc = {
            "current_cycle": "C-410",
            "gi_status": "unresolved",
            "operational_pulse": {"cycle": "C-410"},
            "open_flags": ["c410-zeus-dispute-unresolved", "mic-wallet-render-crash-loop"],
        }
        fetch = LedgerFetchResult(
            verified=True,
            withheld_reason=None,
            snapshot={"gi": None},
            health=None,
            witness_url="https://x/pulse/state",
            error=None,
        )
        apply_cycle_writer_hygiene(
            doc, previous_cycle="C-410", new_cycle="C-411", fetch=fetch
        )
        self.assertNotIn("operational_pulse", doc)
        self.assertNotIn("gi_status", doc)
        self.assertEqual(doc["previous_cycle"], "C-410")
        self.assertIn("mic-wallet-render-crash-loop", doc["open_flags"])
        self.assertNotIn("c410-zeus-dispute-unresolved", doc["open_flags"])

    def test_gi_attestation_clears_unresolved_markers(self):
        doc = {
            "current_cycle": "C-410",
            "gi": 0.9,
            "gi_status": "unresolved",
            "gi_editorial_class": "carry_forward_withheld",
            "mode_status": "unresolved",
        }
        fetch = LedgerFetchResult(
            verified=True,
            withheld_reason=None,
            snapshot={"gi": 0.81, "mode": "green"},
            health=None,
            witness_url="https://x/pulse/state",
            error=None,
        )
        apply_cycle_writer_hygiene(
            doc, previous_cycle="C-410", new_cycle="C-410", fetch=fetch
        )
        self.assertEqual(doc["gi"], 0.81)
        self.assertEqual(doc["mode"], "green")
        self.assertNotIn("gi_status", doc)
        self.assertNotIn("gi_editorial_class", doc)
        self.assertNotIn("mode_status", doc)
        self.assertTrue(doc["gi_attested_this_cycle"])
        self.assertNotIn("gi_withheld_reason", doc)

    def test_gi_null_pulse_marks_carry_forward_unattested(self):
        doc = {"current_cycle": "C-415", "gi": 0.9}
        fetch = LedgerFetchResult(
            verified=True,
            withheld_reason=None,
            snapshot={"gi": None},
            health=None,
            witness_url="https://x/pulse/state",
            error=None,
        )
        apply_cycle_writer_hygiene(
            doc, previous_cycle="C-415", new_cycle="C-416", fetch=fetch
        )
        self.assertEqual(doc["gi"], 0.9)
        self.assertFalse(doc["gi_attested_this_cycle"])
        self.assertEqual(doc["gi_withheld_reason"], "GI_NULL_IN_PULSE")

    def test_same_cycle_rerun_failure_does_not_unattest_earlier_success(self):
        # Codex review on PR #443: mobius-bot-state-sync.yml allows
        # workflow_dispatch catch-up runs alongside the scheduled cron. If
        # the scheduled run already attested GI for this cycle and a later
        # same-day manual rerun can't reach the ledger, that rerun must not
        # flip gi_attested_this_cycle back to false.
        doc = {
            "current_cycle": "C-416",
            "gi": 0.93,
            "gi_attested_at": "C-416",
            "gi_attested_this_cycle": True,
        }
        fetch = LedgerFetchResult(
            verified=False,
            withheld_reason="LEDGER_PULSE_UNREACHABLE",
            snapshot=None,
            health=None,
            witness_url="https://x/pulse/state",
            error="connection refused",
        )
        apply_cycle_writer_hygiene(
            doc, previous_cycle="C-416", new_cycle="C-416", fetch=fetch
        )
        self.assertEqual(doc["gi"], 0.93)
        self.assertTrue(doc["gi_attested_this_cycle"])
        self.assertNotIn("gi_withheld_reason", doc)

    def test_unreachable_pulse_marks_carry_forward_with_transport_reason(self):
        doc = {"current_cycle": "C-415", "gi": 0.9}
        fetch = LedgerFetchResult(
            verified=False,
            withheld_reason="LEDGER_PULSE_UNREACHABLE",
            snapshot=None,
            health=None,
            witness_url="https://x/pulse/state",
            error="connection refused",
        )
        apply_cycle_writer_hygiene(
            doc, previous_cycle="C-415", new_cycle="C-416", fetch=fetch
        )
        self.assertFalse(doc["gi_attested_this_cycle"])
        self.assertEqual(doc["gi_withheld_reason"], "LEDGER_PULSE_UNREACHABLE")

    def test_re_attestation_clears_prior_withheld_reason(self):
        doc = {
            "current_cycle": "C-415",
            "gi": 0.9,
            "gi_attested_this_cycle": False,
            "gi_withheld_reason": "GI_NULL_IN_PULSE",
        }
        fetch = LedgerFetchResult(
            verified=True,
            withheld_reason=None,
            snapshot={"gi": 0.93, "mode": "yellow"},
            health=None,
            witness_url="https://x/pulse/state",
            error=None,
        )
        apply_cycle_writer_hygiene(
            doc, previous_cycle="C-415", new_cycle="C-416", fetch=fetch
        )
        self.assertTrue(doc["gi_attested_this_cycle"])
        self.assertNotIn("gi_withheld_reason", doc)


if __name__ == "__main__":
    unittest.main()
