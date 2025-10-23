#!/usr/bin/env python3
"""
Auto-Commit Changes Script
Handles automatic git operations for lab7-edits processing
"""
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime
import json
import git

class AutoCommitHandler:
    def __init__(self):
        self.repo = None
        self.commit_log = "logs/commit_history.jsonl"
        self.setup_logging()
        self.setup_git()
    
    def setup_logging(self):
        """Setup commit logging"""
        os.makedirs("logs", exist_ok=True)
        if not os.path.exists(self.commit_log):
            with open(self.commit_log, "w", encoding='utf-8') as f:
                f.write("")
    
    def setup_git(self):
        """Setup git repository connection"""
        try:
            self.repo = git.Repo(".")
            self.log_commit("git_setup", {"status": "success", "branch": self.repo.active_branch.name})
        except Exception as e:
            self.log_commit("git_setup", {"status": "error", "error": str(e)})
            print(f"[COMMIT] Error: Git setup failed: {e}")
            self.repo = None
    
    def log_commit(self, action, details):
        """Log commit actions"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "action": action,
            "details": details
        }
        with open(self.commit_log, "a", encoding='utf-8') as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def check_changes(self):
        """Check if there are any changes to commit"""
        if not self.repo:
            return False, "Git not available"
        
        # Check for staged changes
        staged_files = [item.a_path for item in self.repo.index.diff("HEAD")]
        untracked_files = self.repo.untracked_files
        
        has_changes = bool(staged_files or untracked_files)
        
        return has_changes, {
            "staged_files": staged_files,
            "untracked_files": untracked_files,
            "total_changes": len(staged_files) + len(untracked_files)
        }
    
    def stage_all_changes(self):
        """Stage all changes for commit"""
        if not self.repo:
            return False, "Git not available"
        
        try:
            # Add all changes (staged and untracked)
            self.repo.git.add(A=True)
            
            # Verify what was staged
            staged_files = [item.a_path for item in self.repo.index.diff("HEAD")]
            untracked_files = [f for f in self.repo.untracked_files if f in [item.a_path for item in self.repo.index.diff("HEAD")]]
            
            self.log_commit("stage_changes", {
                "success": True,
                "staged_files": staged_files,
                "untracked_files": untracked_files
            })
            
            return True, f"Staged {len(staged_files)} files"
            
        except Exception as e:
            self.log_commit("stage_changes", {"success": False, "error": str(e)})
            return False, str(e)
    
    def create_commit_message(self, change_details):
        """Create a descriptive commit message"""
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Count different types of changes
        staged_count = len(change_details.get("staged_files", []))
        untracked_count = len(change_details.get("untracked_files", []))
        
        # Determine change type
        if staged_count > 0 and untracked_count > 0:
            change_type = "modified and added files"
        elif staged_count > 0:
            change_type = "modified files"
        elif untracked_count > 0:
            change_type = "new files"
        else:
            change_type = "changes"
        
        # Create commit message
        message = f"Auto-merge: Processed lab7-edits at {timestamp}\n\n"
        message += f"- {change_type}: {staged_count + untracked_count} files\n"
        message += f"- Timestamp: {timestamp}\n"
        message += f"- Agent: lab7-background-agent\n"
        
        return message
    
    def commit_changes(self, commit_message):
        """Commit staged changes"""
        if not self.repo:
            return False, "Git not available"
        
        try:
            # Create commit
            commit = self.repo.index.commit(commit_message)
            
            self.log_commit("commit_changes", {
                "success": True,
                "commit_hash": commit.hexsha,
                "message": commit_message,
                "author": str(commit.author),
                "committed_at": commit.committed_datetime.isoformat()
            })
            
            return True, commit.hexsha
            
        except Exception as e:
            self.log_commit("commit_changes", {"success": False, "error": str(e)})
            return False, str(e)
    
    def push_changes(self):
        """Push committed changes to remote"""
        if not self.repo:
            return False, "Git not available"
        
        try:
            # Get origin remote
            origin = self.repo.remote('origin')
            if not origin.exists():
                return False, "No origin remote found"
            
            # Check if there are commits to push
            local_commits = list(self.repo.iter_commits(f"{origin.name}/{self.repo.active_branch.name}..{self.repo.active_branch.name}"))
            if not local_commits:
                return True, "No commits to push"
            
            # Push changes
            push_info = origin.push(self.repo.active_branch)
            
            self.log_commit("push_changes", {
                "success": True,
                "commits_pushed": len(local_commits),
                "branch": self.repo.active_branch.name,
                "push_info": str(push_info)
            })
            
            return True, f"Pushed {len(local_commits)} commits"
            
        except Exception as e:
            self.log_commit("push_changes", {"success": False, "error": str(e)})
            return False, str(e)
    
    def process_auto_commit(self, auto_push=True):
        """Process complete auto-commit workflow"""
        print("[COMMIT] Starting auto-commit process...")
        
        # Check for changes
        has_changes, change_details = self.check_changes()
        if not has_changes:
            print("[COMMIT] No changes to commit")
            return True
        
        print(f"[COMMIT] Found changes: {change_details['total_changes']} files")
        
        # Stage changes
        success, message = self.stage_all_changes()
        if not success:
            print(f"[COMMIT] Failed to stage changes: {message}")
            return False
        
        print(f"[COMMIT] {message}")
        
        # Create commit message
        commit_message = self.create_commit_message(change_details)
        
        # Commit changes
        success, commit_hash = self.commit_changes(commit_message)
        if not success:
            print(f"[COMMIT] Failed to commit changes: {commit_hash}")
            return False
        
        print(f"[COMMIT] Successfully committed: {commit_hash[:8]}")
        
        # Push changes if requested
        if auto_push:
            success, message = self.push_changes()
            if not success:
                print(f"[COMMIT] Failed to push changes: {message}")
                return False
            
            print(f"[COMMIT] {message}")
        
        print("[COMMIT] Auto-commit process completed successfully!")
        return True

def main():
    """Main function for standalone execution"""
    handler = AutoCommitHandler()
    
    # Check command line arguments
    auto_push = True
    if len(sys.argv) > 1 and sys.argv[1] == "--no-push":
        auto_push = False
    
    success = handler.process_auto_commit(auto_push=auto_push)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()