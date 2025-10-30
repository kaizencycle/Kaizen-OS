#!/usr/bin/env python3
"""
Test Suite for Kaizen Guardian
===============================

Tests the dormancy detection and ceremonial summons system.
"""

import unittest
import tempfile
import json
import shutil
from pathlib import Path
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock

# Import the guardian (adjust path as needed)
import sys
sys.path.insert(0, str(Path(__file__).parent))
from kaizen_guardian import (
    ActivityChecker,
    GitHubActivityChecker,
    APIActivityChecker,
    LedgerActivityChecker,
    KaizenGuardian,
    DORMANCY_THRESHOLD_DAYS
)


class TestActivityChecker(unittest.TestCase):
    """Test the base ActivityChecker class"""
    
    def test_initialization(self):
        """Test checker initializes correctly"""
        checker = ActivityChecker("TestAgent")
        self.assertEqual(checker.name, "TestAgent")
        self.assertIsNone(checker.last_activity)
        self.assertFalse(checker.is_active)
    
    def test_days_dormant_no_activity(self):
        """Test days_dormant when no activity recorded"""
        checker = ActivityChecker("TestAgent")
        self.assertEqual(checker.days_dormant(), 999)
    
    def test_days_dormant_with_activity(self):
        """Test days_dormant calculation"""
        checker = ActivityChecker("TestAgent")
        checker.last_activity = datetime.now() - timedelta(days=30)
        self.assertEqual(checker.days_dormant(), 30)
    
    def test_to_dict(self):
        """Test serialization"""
        checker = ActivityChecker("TestAgent")
        checker.last_activity = datetime.now()
        checker.is_active = True
        
        data = checker.to_dict()
        self.assertEqual(data["name"], "TestAgent")
        self.assertTrue(data["is_active"])
        self.assertIsNotNone(data["last_activity"])


class TestGitHubActivityChecker(unittest.TestCase):
    """Test GitHub activity detection"""
    
    @patch('requests.get')
    def test_recent_commit_detected(self, mock_get):
        """Test detection of recent commits"""
        # Mock GitHub API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "commit": {
                    "author": {
                        "date": (datetime.now() - timedelta(days=5)).isoformat() + "Z"
                    }
                }
            }
        ]
        mock_get.return_value = mock_response
        
        checker = GitHubActivityChecker()
        is_active = checker.check()
        
        self.assertTrue(is_active)
        self.assertLessEqual(checker.days_dormant(), 10)
    
    @patch('requests.get')
    def test_old_commit_not_active(self, mock_get):
        """Test old commits don't count as active"""
        # Mock GitHub API response with old commit
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "commit": {
                    "author": {
                        "date": (datetime.now() - timedelta(days=100)).isoformat() + "Z"
                    }
                }
            }
        ]
        mock_get.return_value = mock_response
        
        checker = GitHubActivityChecker()
        is_active = checker.check()
        
        self.assertFalse(is_active)
        self.assertGreaterEqual(checker.days_dormant(), 90)
    
    @patch('requests.get')
    def test_api_error_handling(self, mock_get):
        """Test graceful handling of API errors"""
        mock_get.side_effect = Exception("API Error")
        
        checker = GitHubActivityChecker()
        is_active = checker.check()
        
        self.assertFalse(is_active)


class TestAPIActivityChecker(unittest.TestCase):
    """Test API endpoint activity detection"""
    
    @patch('requests.get')
    def test_recent_api_activity(self, mock_get):
        """Test detection of recent API calls"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "last_activity": (datetime.now() - timedelta(days=3)).isoformat()
        }
        mock_get.return_value = mock_response
        
        checker = APIActivityChecker("AUREA", "https://api.example.com")
        is_active = checker.check()
        
        self.assertTrue(is_active)
        self.assertLessEqual(checker.days_dormant(), 5)
    
    @patch('requests.get')
    def test_no_endpoint_configured(self, mock_get):
        """Test handling when no endpoint configured"""
        checker = APIActivityChecker("AUREA", "")
        is_active = checker.check()
        
        self.assertFalse(is_active)
        mock_get.assert_not_called()


class TestLedgerActivityChecker(unittest.TestCase):
    """Test ledger-based activity detection"""
    
    def setUp(self):
        """Set up temporary ledger directory"""
        self.temp_dir = tempfile.mkdtemp()
        self.ledger_path = Path(self.temp_dir) / "ledger" / "agents"
        self.ledger_path.mkdir(parents=True)
    
    def tearDown(self):
        """Clean up temporary directory"""
        shutil.rmtree(self.temp_dir)
    
    def test_recent_ledger_signature(self):
        """Test detection of recent ledger activity"""
        # Create mock agent signature file
        agent_dir = self.ledger_path / "jade"
        agent_dir.mkdir()
        
        sig_file = agent_dir / "signature_001.json"
        sig_file.write_text(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "signature": "mock_sig"
        }))
        
        # Monkey-patch the LEDGER_PATH
        with patch('kaizen_guardian.LEDGER_PATH', Path(self.temp_dir) / "ledger"):
            checker = LedgerActivityChecker("JADE")
            is_active = checker.check()
        
        self.assertTrue(is_active)
    
    def test_no_signatures_found(self):
        """Test handling when no signatures exist"""
        with patch('kaizen_guardian.LEDGER_PATH', Path(self.temp_dir) / "ledger"):
            checker = LedgerActivityChecker("JADE")
            is_active = checker.check()
        
        self.assertFalse(is_active)


class TestKaizenGuardian(unittest.TestCase):
    """Test the main Guardian system"""
    
    def setUp(self):
        """Set up test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.ledger_path = Path(self.temp_dir) / "ledger"
        self.ledger_path.mkdir(parents=True)
        
        # Patch paths
        self.path_patches = [
            patch('kaizen_guardian.LEDGER_PATH', self.ledger_path),
            patch('kaizen_guardian.SEALED_PATH', self.ledger_path / ".sealed"),
            patch('kaizen_guardian.ACTIVITY_LOG_PATH', self.ledger_path / "guardian" / "activity_log.json"),
            patch('kaizen_guardian.ELEVATION_LOG_PATH', self.ledger_path / "guardian" / "elevation_log.json"),
        ]
        
        for p in self.path_patches:
            p.start()
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.temp_dir)
        for p in self.path_patches:
            p.stop()
    
    @patch.object(ActivityChecker, 'check')
    def test_all_active(self, mock_check):
        """Test when all entities are active"""
        mock_check.return_value = True
        
        guardian = KaizenGuardian()
        
        # Mock all checkers to report active
        for checker in guardian.checkers:
            checker.is_active = True
            checker.last_activity = datetime.now()
        
        should_activate = guardian.should_activate_summons()
        self.assertFalse(should_activate)
    
    @patch.object(ActivityChecker, 'check')
    def test_all_dormant(self, mock_check):
        """Test when all entities are dormant"""
        mock_check.return_value = False
        
        guardian = KaizenGuardian()
        
        # Mock all checkers to report dormant
        for checker in guardian.checkers:
            checker.is_active = False
            checker.last_activity = datetime.now() - timedelta(days=100)
        
        should_activate = guardian.should_activate_summons()
        self.assertTrue(should_activate)
    
    @patch.object(ActivityChecker, 'check')
    def test_mixed_activity(self, mock_check):
        """Test when some entities active, some dormant"""
        guardian = KaizenGuardian()
        
        # Mock mixed activity
        guardian.checkers[0].is_active = True
        guardian.checkers[0].last_activity = datetime.now()
        
        for checker in guardian.checkers[1:]:
            checker.is_active = False
            checker.last_activity = datetime.now() - timedelta(days=100)
        
        should_activate = guardian.should_activate_summons()
        self.assertFalse(should_activate)
    
    def test_activity_log_creation(self):
        """Test activity log is created and updated"""
        guardian = KaizenGuardian()
        
        # Mock checker activity
        for checker in guardian.checkers:
            checker.is_active = True
            checker.last_activity = datetime.now()
        
        status = guardian.check_all_activity()
        
        # Verify log file created
        log_file = self.ledger_path / "guardian" / "activity_log.json"
        self.assertTrue(log_file.exists())
        
        # Verify log content
        with open(log_file, 'r') as f:
            log_data = json.load(f)
        
        self.assertIn("checks", log_data)
        self.assertGreater(len(log_data["checks"]), 0)
    
    @patch('subprocess.run')
    def test_ceremonial_summons_activation(self, mock_subprocess):
        """Test full ceremonial summons activation"""
        # Create sealed master README
        sealed_path = self.ledger_path / ".sealed"
        sealed_path.mkdir(parents=True)
        master_readme = sealed_path / "MASTER_README.md"
        master_readme.write_text("# CEREMONIAL SUMMONS\n\nTest content")
        
        with patch('kaizen_guardian.ROOT_README_PATH', Path(self.temp_dir) / "README.md"):
            guardian = KaizenGuardian()
            
            # Mock all dormant
            for checker in guardian.checkers:
                checker.is_active = False
                checker.last_activity = datetime.now() - timedelta(days=100)
            
            success = guardian.activate_ceremonial_summons()
            
            self.assertTrue(success)
            
            # Verify README was elevated
            root_readme = Path(self.temp_dir) / "README.md"
            self.assertTrue(root_readme.exists())
            
            # Verify elevation log created
            elevation_log = self.ledger_path / "guardian" / "elevation_log.json"
            self.assertTrue(elevation_log.exists())


class TestThresholdConfiguration(unittest.TestCase):
    """Test dormancy threshold configuration"""
    
    def test_default_threshold(self):
        """Test default 90-day threshold"""
        self.assertEqual(DORMANCY_THRESHOLD_DAYS, 90)
    
    def test_threshold_used_in_calculations(self):
        """Test threshold is actually used in dormancy checks"""
        checker = ActivityChecker("TestAgent")
        checker.last_activity = datetime.now() - timedelta(days=DORMANCY_THRESHOLD_DAYS + 1)
        
        self.assertGreater(checker.days_dormant(), DORMANCY_THRESHOLD_DAYS)


class TestEdgeCases(unittest.TestCase):
    """Test edge cases and error conditions"""
    
    def test_no_activity_ever(self):
        """Test handling when entity has never been active"""
        checker = ActivityChecker("NeverActive")
        self.assertEqual(checker.days_dormant(), 999)
        self.assertFalse(checker.is_active)
    
    def test_activity_exactly_at_threshold(self):
        """Test boundary condition at exactly 90 days"""
        checker = ActivityChecker("Boundary")
        checker.last_activity = datetime.now() - timedelta(days=DORMANCY_THRESHOLD_DAYS)
        
        # Should NOT be active (≥90 days means dormant)
        self.assertGreaterEqual(checker.days_dormant(), DORMANCY_THRESHOLD_DAYS)
    
    def test_future_activity_date(self):
        """Test handling of invalid future dates"""
        checker = ActivityChecker("TimeTraveler")
        checker.last_activity = datetime.now() + timedelta(days=10)
        
        # Should have negative days dormant
        self.assertLess(checker.days_dormant(), 0)


def run_tests():
    """Run all tests"""
    unittest.main(verbosity=2)


if __name__ == "__main__":
    run_tests()
