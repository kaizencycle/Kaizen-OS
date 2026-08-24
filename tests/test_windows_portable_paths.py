"""Guard against Windows-invalid top-level repository paths."""

from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
INVALID_ROOT_NAME = "..."


class TestWindowsPortablePaths(unittest.TestCase):
    def test_root_tree_has_no_windows_invalid_ellipsis_path(self) -> None:
        output = subprocess.check_output(
            ["git", "ls-tree", "--name-only", "HEAD"],
            cwd=REPO_ROOT,
            text=True,
        )
        root_entries = {line.strip() for line in output.splitlines() if line.strip()}
        self.assertNotIn(
            INVALID_ROOT_NAME,
            root_entries,
            "top-level '...' breaks conventional Windows checkout",
        )

    def test_fresh_clone_checkout_is_clean_without_sparse_checkout(self) -> None:
        with tempfile.TemporaryDirectory(prefix="mobius-substrate-checkout-") as tmp:
            clone_dir = Path(tmp) / "clone"
            subprocess.check_call(
                ["git", "clone", "--quiet", str(REPO_ROOT), str(clone_dir)],
            )
            status = subprocess.check_output(
                ["git", "status", "--porcelain"],
                cwd=clone_dir,
                text=True,
            ).strip()
            self.assertEqual(status, "", "checkout must be clean after clone")
            self.assertFalse(
                (clone_dir / INVALID_ROOT_NAME).exists(),
                "cloned tree must not materialize top-level '...'",
            )


if __name__ == "__main__":
    unittest.main()
