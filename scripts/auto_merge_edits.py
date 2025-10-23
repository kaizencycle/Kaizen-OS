#!/usr/bin/env python3
"""
Autonomous Lab7 Edits Merger
Processes v1, v2, v3 folders in lab7-edits and merges them into the repository
"""
import os
import sys
import json
import shutil
import glob
from pathlib import Path
from datetime import datetime
import subprocess

class Lab7EditsMerger:
    def __init__(self):
        self.edits_dir = Path("lab7-edits")
        self.processed_log = "logs/merge_history.jsonl"
        self.setup_logging()
    
    def setup_logging(self):
        """Setup logging directory and file"""
        os.makedirs("logs", exist_ok=True)
        if not os.path.exists(self.processed_log):
            with open(self.processed_log, "w", encoding='utf-8') as f:
                f.write("")  # Create empty file
    
    def log_merge(self, version, action, details):
        """Log merge actions"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": version,
            "action": action,
            "details": details
        }
        with open(self.processed_log, "a", encoding='utf-8') as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def has_edits(self, version_dir):
        """Check if version directory has any files"""
        return any(Path(version_dir).rglob("*")) and not all(
            p.is_dir() for p in Path(version_dir).rglob("*")
        )
    
    def merge_version(self, version):
        """Merge files from a specific version"""
        version_dir = self.edits_dir / version
        
        if not version_dir.exists():
            return False
            
        if not self.has_edits(version_dir):
            return False
        
        print(f"[PROCESSING] {version}...")
        
        # Process each pack in the version
        for pack_dir in version_dir.iterdir():
            if pack_dir.is_dir():
                self.merge_pack(pack_dir, version)
        
        # Clean up after merge
        self.cleanup_version(version_dir)
        self.log_merge(version, "merged", f"Processed {version}")
        return True
    
    def merge_pack(self, pack_dir, version):
        """Merge a specific pack"""
        pack_name = pack_dir.name
        print(f"  [PACK] Merging: {pack_name}")
        
        # Process docs directory
        docs_dir = pack_dir / "docs"
        if docs_dir.exists():
            self.merge_docs(docs_dir, pack_name)
        
        # Process scripts directory
        scripts_dir = pack_dir / "scripts"
        if scripts_dir.exists():
            self.merge_scripts(scripts_dir, pack_name)
    
    def merge_docs(self, docs_dir, pack_name):
        """Merge documentation files"""
        for file_path in docs_dir.rglob("*"):
            if file_path.is_file():
                # Calculate relative path from docs_dir
                rel_path = file_path.relative_to(docs_dir)
                dest_path = Path("docs") / rel_path
                
                # Create destination directory
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy file
                shutil.copy2(file_path, dest_path)
                print(f"    [DOC] Merged: {rel_path}")
    
    def merge_scripts(self, scripts_dir, pack_name):
        """Merge script files"""
        for file_path in scripts_dir.rglob("*.py"):
            if file_path.is_file():
                dest_path = Path("scripts") / file_path.name
                shutil.copy2(file_path, dest_path)
                print(f"    [SCRIPT] Merged: {file_path.name}")
    
    def cleanup_version(self, version_dir):
        """Clean up version directory after merge - empty but keep folder structure"""
        for item in version_dir.rglob("*"):
            if item.is_file():
                item.unlink()
            elif item.is_dir() and not any(item.iterdir()):
                item.rmdir()
        print(f"  [CLEANUP] Emptied {version_dir.name} (folders preserved)")
    
    def ensure_empty_folders(self):
        """Ensure v1, v2, v3 folders exist but are empty after merge"""
        for version in ["v1", "v2", "v3"]:
            version_dir = self.edits_dir / version
            version_dir.mkdir(exist_ok=True)
            # Clean any remaining files
            for item in version_dir.rglob("*"):
                if item.is_file():
                    item.unlink()
                elif item.is_dir() and not any(item.iterdir()):
                    item.rmdir()
        print("  [CLEANUP] Ensured v1, v2, v3 folders are empty and ready")
    
    def update_readme_badges(self):
        """Update README with badges if they exist"""
        readme_path = Path("README.md")
        if not readme_path.exists():
            return
        
        # Check if badges exist
        rollout_badge = Path("docs/badges/pal_rollout.svg")
        safety_badge = Path("docs/badges/pal_safety.svg")
        
        if rollout_badge.exists() and safety_badge.exists():
            self.ensure_readme_badges(readme_path)
    
    def ensure_readme_badges(self, readme_path):
        """Ensure README has badge section"""
        content = readme_path.read_text(encoding='utf-8')
        
        badge_start = "<!-- PAL BADGES START -->"
        badge_end = "<!-- PAL BADGES END -->"
        badge_line = "![PAL Rollout](docs/badges/pal_rollout.svg) ![PAL Safety](docs/badges/pal_safety.svg)"
        
        if badge_start not in content or badge_end not in content:
            # Add badge section after key features
            key_features_end = "## 🏗️ Architecture"
            if key_features_end in content:
                badge_section = f"\n{badge_start}\n{badge_line}\n{badge_end}\n\n"
                content = content.replace(key_features_end, badge_section + key_features_end)
                readme_path.write_text(content, encoding='utf-8')
                print("  [README] Updated with badges")
    
    def run_merge_scripts(self):
        """Run any generation scripts that were merged"""
        scripts_to_run = [
            "generate_pal_api_json.py",
            "generate_pal_badges.py",
            "generate_pal_dashboard.py"
        ]
        
        for script in scripts_to_run:
            script_path = Path("scripts") / script
            if script_path.exists():
                try:
                    print(f"  [RUN] Executing {script}...")
                    subprocess.run([sys.executable, str(script_path)], check=True)
                except subprocess.CalledProcessError as e:
                    print(f"  [WARN] {script} failed: {e}")
    
    def process_all_versions(self):
        """Process all versions in sequence"""
        versions = ["v1", "v2", "v3"]
        processed = 0
        
        for version in versions:
            if self.merge_version(version):
                processed += 1
        
        if processed > 0:
            print(f"[SUCCESS] Processed {processed} versions")
            self.update_readme_badges()
            self.run_merge_scripts()
            # Always ensure folders are empty after merge
            self.ensure_empty_folders()
            return True
        else:
            print("[INFO] No edits to process")
            return False

def main():
    print("[AGENT] Lab7 Edits Auto-Merger Starting...")
    
    merger = Lab7EditsMerger()
    success = merger.process_all_versions()
    
    if success:
        print("[SUCCESS] Auto-merge completed successfully!")
        sys.exit(0)
    else:
        print("[INFO] No changes to merge")
        sys.exit(0)

if __name__ == "__main__":
    main()
