#!/usr/bin/env python3
"""
MCP-CLI-GitHub-Render Integration for Lab7 Edits
Provides MCP server functionality for autonomous merge operations
"""
import asyncio
import json
import os
from datetime import datetime
from pathlib import Path
import subprocess
import sys

class Lab7MCPIntegration:
    def __init__(self):
        self.repo_path = Path.cwd()
        self.edits_dir = self.repo_path / "lab7-edits"
        self.log_file = self.repo_path / "logs" / "mcp_operations.jsonl"
        
    async def health_check(self):
        """MCP Health check endpoint"""
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "edits_available": self.count_available_edits(),
            "last_merge": self.get_last_merge_time()
        }
    
    def count_available_edits(self):
        """Count available edits across all versions"""
        count = 0
        for version in ["v1", "v2", "v3"]:
            version_dir = self.edits_dir / version
            if version_dir.exists():
                count += len(list(version_dir.rglob("*")))
        return count
    
    def get_last_merge_time(self):
        """Get timestamp of last merge operation"""
        if self.log_file.exists():
            with open(self.log_file) as f:
                lines = f.readlines()
                if lines:
                    last_line = json.loads(lines[-1])
                    return last_line.get("timestamp")
        return None
    
    async def trigger_merge(self):
        """Trigger merge operation via MCP"""
        try:
            # Run the auto-merge script
            result = subprocess.run([
                sys.executable, 
                str(self.repo_path / "scripts" / "auto_merge_edits.py")
            ], capture_output=True, text=True, cwd=self.repo_path)
            
            success = result.returncode == 0
            
            # Log the operation
            self.log_mcp_operation("merge_triggered", {
                "success": success,
                "stdout": result.stdout,
                "stderr": result.stderr
            })
            
            return {
                "success": success,
                "message": "Merge operation completed",
                "output": result.stdout,
                "error": result.stderr if not success else None
            }
            
        except Exception as e:
            self.log_mcp_operation("merge_error", {"error": str(e)})
            return {
                "success": False,
                "message": "Merge operation failed",
                "error": str(e)
            }
    
    async def get_edits_status(self):
        """Get status of available edits"""
        status = {}
        for version in ["v1", "v2", "v3"]:
            version_dir = self.edits_dir / version
            if version_dir.exists():
                files = list(version_dir.rglob("*"))
                status[version] = {
                    "has_content": len(files) > 0,
                    "file_count": len([f for f in files if f.is_file()]),
                    "packs": [d.name for d in version_dir.iterdir() if d.is_dir()]
                }
            else:
                status[version] = {"has_content": False, "file_count": 0, "packs": []}
        
        return status
    
    async def deploy_to_render(self):
        """Deploy changes to Render after merge"""
        try:
            # This would integrate with Render's API
            # For now, we'll just log the intention
            self.log_mcp_operation("render_deploy_triggered", {
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {
                "success": True,
                "message": "Deploy to Render triggered",
                "note": "Integration with Render API needed"
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": "Render deploy failed",
                "error": str(e)
            }
    
    def log_mcp_operation(self, operation, details):
        """Log MCP operations"""
        os.makedirs(self.log_file.parent, exist_ok=True)
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "operation": operation,
            "details": details
        }
        
        with open(self.log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")

# MCP Server Implementation
async def mcp_server():
    """MCP Server for Lab7 Edits integration"""
    integration = Lab7MCPIntegration()
    
    print("🚀 Lab7 MCP Server Starting...")
    print("Available operations:")
    print("  - health_check")
    print("  - trigger_merge") 
    print("  - get_edits_status")
    print("  - deploy_to_render")
    
    # Example usage
    health = await integration.health_check()
    print(f"Health Status: {health}")
    
    status = await integration.get_edits_status()
    print(f"Edits Status: {status}")

if __name__ == "__main__":
    asyncio.run(mcp_server())

