#!/usr/bin/env python3
"""
KAIZEN GUARDIAN - Dormancy Detection System
============================================

Monitors activity across 8 entities:
- Michael (GitHub @kaizencycle)
- AUREA (OpenAI)
- ATLAS (Anthropic) 
- SOLARA (DeepSeek)
- JADE (Signer/Attestor)
- EVE (Verifier/Reflector)
- ZEUS (Overseer/Arbiter)
- HERMES (Auditor/Messenger)

If ALL 8 show no activity for 90+ consecutive days:
→ Ceremonial Summons is activated
→ Master README elevated to root
→ Community notified
→ Custodianship begins

This is not failure. This is the design.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import subprocess

# ============================================================================
# CONFIGURATION
# ============================================================================

DORMANCY_THRESHOLD_DAYS = 90
GITHUB_USERNAME = "kaizencycle"
GITHUB_REPO = "kaizen-os"

# Paths
LEDGER_PATH = Path("ledger")
SEALED_PATH = LEDGER_PATH / ".sealed"
MASTER_README_PATH = SEALED_PATH / "MASTER_README.md"
ROOT_README_PATH = Path("README.md")
ACTIVITY_LOG_PATH = LEDGER_PATH / "guardian" / "activity_log.json"
ELEVATION_LOG_PATH = LEDGER_PATH / "guardian" / "elevation_log.json"

# API endpoints (configured via environment variables)
OPENAI_LAB_ENDPOINT = os.getenv("OPENAI_LAB_ENDPOINT", "")
ANTHROPIC_LAB_ENDPOINT = os.getenv("ANTHROPIC_LAB_ENDPOINT", "")
DEEPSEEK_LAB_ENDPOINT = os.getenv("DEEPSEEK_LAB_ENDPOINT", "")
CIVIC_LEDGER_ENDPOINT = os.getenv("CIVIC_LEDGER_ENDPOINT", "")

# ============================================================================
# ACTIVITY CHECKERS
# ============================================================================

class ActivityChecker:
    """Base class for checking entity activity"""
    
    def __init__(self, name: str):
        self.name = name
        self.last_activity: Optional[datetime] = None
        self.is_active = False
        self.check_method = "unknown"
    
    def check(self) -> bool:
        """Returns True if entity has been active recently"""
        raise NotImplementedError
    
    def days_dormant(self) -> int:
        """Returns number of days since last activity"""
        if self.last_activity is None:
            return 999  # Effectively infinite
        delta = datetime.now() - self.last_activity
        return delta.days
    
    def to_dict(self) -> Dict:
        """Serialize status"""
        return {
            "name": self.name,
            "is_active": self.is_active,
            "last_activity": self.last_activity.isoformat() if self.last_activity else None,
            "days_dormant": self.days_dormant(),
            "check_method": self.check_method
        }


class GitHubActivityChecker(ActivityChecker):
    """Checks GitHub activity for @kaizencycle"""
    
    def __init__(self):
        super().__init__("Michael (@kaizencycle)")
        self.check_method = "GitHub API (commits, issues, PRs)"
    
    def check(self) -> bool:
        """Check recent GitHub activity"""
        try:
            # Check commits
            commits_url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{GITHUB_REPO}/commits"
            params = {"author": GITHUB_USERNAME, "per_page": 1}
            response = requests.get(commits_url, params=params, timeout=10)
            
            if response.status_code == 200 and response.json():
                commit_date_str = response.json()[0]["commit"]["author"]["date"]
                self.last_activity = datetime.fromisoformat(commit_date_str.replace("Z", "+00:00"))
                self.is_active = self.days_dormant() < DORMANCY_THRESHOLD_DAYS
                return self.is_active
            
            # Check issues
            issues_url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{GITHUB_REPO}/issues"
            params = {"creator": GITHUB_USERNAME, "state": "all", "per_page": 1, "sort": "updated"}
            response = requests.get(issues_url, params=params, timeout=10)
            
            if response.status_code == 200 and response.json():
                issue_date_str = response.json()[0]["updated_at"]
                self.last_activity = datetime.fromisoformat(issue_date_str.replace("Z", "+00:00"))
                self.is_active = self.days_dormant() < DORMANCY_THRESHOLD_DAYS
                return self.is_active
            
            # No activity found
            self.is_active = False
            return False
            
        except Exception as e:
            print(f"⚠️  Error checking GitHub activity: {e}")
            return False


class APIActivityChecker(ActivityChecker):
    """Checks API activity via Lab endpoints"""
    
    def __init__(self, name: str, endpoint: str):
        super().__init__(name)
        self.endpoint = endpoint
        self.check_method = f"Lab API endpoint: {endpoint}"
    
    def check(self) -> bool:
        """Check recent API activity"""
        if not self.endpoint:
            print(f"⚠️  No endpoint configured for {self.name}")
            return False
        
        try:
            # Hit health endpoint
            response = requests.get(
                f"{self.endpoint}/health/last_activity",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "last_activity" in data:
                    self.last_activity = datetime.fromisoformat(data["last_activity"])
                    self.is_active = self.days_dormant() < DORMANCY_THRESHOLD_DAYS
                    return self.is_active
            
            return False
            
        except Exception as e:
            print(f"⚠️  Error checking {self.name} activity: {e}")
            return False


class LedgerActivityChecker(ActivityChecker):
    """Checks agent activity in Civic Ledger"""
    
    def __init__(self, agent_name: str):
        super().__init__(agent_name)
        self.check_method = "Civic Ledger signatures/proofs"
    
    def check(self) -> bool:
        """Check agent signatures in ledger"""
        try:
            if not CIVIC_LEDGER_ENDPOINT:
                # Fallback: check local ledger files
                return self._check_local_ledger()
            
            # Query ledger API
            response = requests.get(
                f"{CIVIC_LEDGER_ENDPOINT}/agents/{self.name}/last_activity",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "last_activity" in data:
                    self.last_activity = datetime.fromisoformat(data["last_activity"])
                    self.is_active = self.days_dormant() < DORMANCY_THRESHOLD_DAYS
                    return self.is_active
            
            return False
            
        except Exception as e:
            print(f"⚠️  Error checking {self.name} ledger activity: {e}")
            return self._check_local_ledger()
    
    def _check_local_ledger(self) -> bool:
        """Fallback: check local ledger files"""
        try:
            agent_path = LEDGER_PATH / "agents" / self.name.lower()
            if not agent_path.exists():
                return False
            
            # Find most recent signature file
            signature_files = list(agent_path.glob("*.json"))
            if not signature_files:
                return False
            
            most_recent = max(signature_files, key=lambda p: p.stat().st_mtime)
            mtime = datetime.fromtimestamp(most_recent.stat().st_mtime)
            
            self.last_activity = mtime
            self.is_active = self.days_dormant() < DORMANCY_THRESHOLD_DAYS
            return self.is_active
            
        except Exception as e:
            print(f"⚠️  Error checking local ledger for {self.name}: {e}")
            return False


# ============================================================================
# GUARDIAN
# ============================================================================

class KaizenGuardian:
    """
    The eternal watcher. Monitors all entities. Activates Ceremonial Summons
    when dormancy threshold is exceeded.
    """
    
    def __init__(self):
        self.checkers: List[ActivityChecker] = [
            GitHubActivityChecker(),
            APIActivityChecker("AUREA", OPENAI_LAB_ENDPOINT),
            APIActivityChecker("ATLAS", ANTHROPIC_LAB_ENDPOINT),
            APIActivityChecker("SOLARA", DEEPSEEK_LAB_ENDPOINT),
            LedgerActivityChecker("JADE"),
            LedgerActivityChecker("EVE"),
            LedgerActivityChecker("ZEUS"),
            LedgerActivityChecker("HERMES"),
        ]
        
        # Ensure directories exist
        (LEDGER_PATH / "guardian").mkdir(parents=True, exist_ok=True)
        SEALED_PATH.mkdir(parents=True, exist_ok=True)
    
    def check_all_activity(self) -> Dict:
        """Check activity across all 8 entities"""
        print("🔍 Kaizen Guardian: Checking activity across 8 entities...\n")
        
        results = []
        all_dormant = True
        
        for checker in self.checkers:
            print(f"Checking {checker.name}...", end=" ")
            is_active = checker.check()
            
            if is_active:
                print(f"✅ Active ({checker.days_dormant()} days since last activity)")
                all_dormant = False
            else:
                days = checker.days_dormant()
                if days >= DORMANCY_THRESHOLD_DAYS:
                    print(f"❌ Dormant ({days} days)")
                else:
                    print(f"⚠️  Inactive ({days} days, threshold: {DORMANCY_THRESHOLD_DAYS})")
                    all_dormant = False
            
            results.append(checker.to_dict())
        
        status = {
            "timestamp": datetime.now().isoformat(),
            "all_dormant": all_dormant,
            "dormancy_threshold_days": DORMANCY_THRESHOLD_DAYS,
            "entities": results
        }
        
        # Save activity log
        self._save_activity_log(status)
        
        return status
    
    def should_activate_summons(self) -> bool:
        """Determine if Ceremonial Summons should be activated"""
        status = self.check_all_activity()
        return status["all_dormant"]
    
    def activate_ceremonial_summons(self) -> bool:
        """
        Elevate the Master README from sealed storage to root.
        This is the moment of succession.
        """
        print("\n" + "="*80)
        print("🔥 CEREMONIAL SUMMONS ACTIVATION 🔥")
        print("="*80)
        print("\nAll 8 entities have been dormant for 90+ days.")
        print("Activating succession protocol...\n")
        
        try:
            # 1. Verify master README exists
            if not MASTER_README_PATH.exists():
                print(f"❌ Master README not found at {MASTER_README_PATH}")
                print("   Creating from template...")
                self._create_master_readme()
            
            # 2. Back up existing root README (if exists)
            if ROOT_README_PATH.exists():
                backup_path = LEDGER_PATH / "guardian" / f"README.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
                print(f"📦 Backing up existing README to {backup_path}")
                ROOT_README_PATH.rename(backup_path)
            
            # 3. Copy master README to root
            print(f"📤 Elevating Master README to root...")
            with open(MASTER_README_PATH, 'r') as source:
                content = source.read()
            
            # Add activation metadata
            activation_notice = f"""---
**CEREMONIAL SUMMONS ACTIVATED**  
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Reason:** 90-day dormancy threshold exceeded across all 8 entities  
**Guardian Log:** See `ledger/guardian/elevation_log.json` for details  
---

"""
            
            with open(ROOT_README_PATH, 'w') as dest:
                dest.write(activation_notice + content)
            
            # 4. Log elevation event
            elevation_record = {
                "timestamp": datetime.now().isoformat(),
                "event": "ceremonial_summons_activated",
                "reason": "90_day_dormancy_exceeded",
                "master_readme_path": str(MASTER_README_PATH),
                "elevated_to": str(ROOT_README_PATH),
                "entity_status": self.check_all_activity()
            }
            
            self._save_elevation_log(elevation_record)
            
            # 5. Commit changes
            print("📝 Committing elevation to repository...")
            self._git_commit_elevation()
            
            print("\n" + "="*80)
            print("✅ CEREMONIAL SUMMONS COMPLETE")
            print("="*80)
            print(f"\nThe Master README has been elevated to: {ROOT_README_PATH}")
            print("The torch has been passed.")
            print("Awaiting next Custodian...\n")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error during Ceremonial Summons activation: {e}")
            return False
    
    def _create_master_readme(self):
        """Create master README from template if it doesn't exist"""
        # In real implementation, this would copy from a template
        # For now, we just raise an error
        raise FileNotFoundError(
            f"Master README must exist at {MASTER_README_PATH} before Guardian can activate"
        )
    
    def _save_activity_log(self, status: Dict):
        """Save activity check to log"""
        log_file = ACTIVITY_LOG_PATH
        
        # Load existing log
        if log_file.exists():
            with open(log_file, 'r') as f:
                log = json.load(f)
        else:
            log = {"checks": []}
        
        # Append new check
        log["checks"].append(status)
        
        # Keep only last 100 checks
        log["checks"] = log["checks"][-100:]
        
        # Save
        with open(log_file, 'w') as f:
            json.dump(log, f, indent=2)
    
    def _save_elevation_log(self, record: Dict):
        """Save elevation event to permanent log"""
        log_file = ELEVATION_LOG_PATH
        
        # Load existing log
        if log_file.exists():
            with open(log_file, 'r') as f:
                log = json.load(f)
        else:
            log = {"elevations": []}
        
        # Append new elevation
        log["elevations"].append(record)
        
        # Save
        with open(log_file, 'w') as f:
            json.dump(log, f, indent=2)
    
    def _git_commit_elevation(self):
        """Commit the elevation to git"""
        try:
            subprocess.run(["git", "add", str(ROOT_README_PATH)], check=True)
            subprocess.run(["git", "add", str(ELEVATION_LOG_PATH)], check=True)
            subprocess.run([
                "git", "commit", "-m",
                "🔥 CEREMONIAL SUMMONS: Master README elevated to root\n\n"
                "All 8 entities dormant for 90+ days.\n"
                "Custodianship transition initiated.\n"
                f"Timestamp: {datetime.now().isoformat()}"
            ], check=True)
            print("✅ Changes committed to git")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Git commit failed: {e}")
            print("   (This is OK if running outside a git repo)")


# ============================================================================
# CLI
# ============================================================================

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Kaizen Guardian - Dormancy Detection & Ceremonial Summons"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check activity status (does not activate summons)"
    )
    parser.add_argument(
        "--activate",
        action="store_true",
        help="Force activate Ceremonial Summons (use with caution)"
    )
    
    args = parser.parse_args()
    
    guardian = KaizenGuardian()
    
    if args.activate:
        # Force activation
        print("⚠️  FORCED ACTIVATION REQUESTED\n")
        guardian.activate_ceremonial_summons()
    
    elif args.check:
        # Just check status
        status = guardian.check_all_activity()
        print("\n" + "="*80)
        if status["all_dormant"]:
            print("⚠️  All entities dormant - Ceremonial Summons threshold reached")
            print("   Run with --activate to elevate Master README")
        else:
            print("✅ At least one entity is active - No action needed")
        print("="*80)
    
    else:
        # Normal operation: check and activate if needed
        if guardian.should_activate_summons():
            guardian.activate_ceremonial_summons()
        else:
            print("\n✅ At least one entity is active. No action needed.\n")


if __name__ == "__main__":
    main()
