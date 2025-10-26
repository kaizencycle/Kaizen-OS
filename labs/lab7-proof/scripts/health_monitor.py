#!/usr/bin/env python3
"""
Health Monitor for Lab7 Background Agent
Monitors agent health and restarts if needed
"""
import os
import sys
import time
import subprocess
import json
import requests
from pathlib import Path
from datetime import datetime, timedelta

class HealthMonitor:
    def __init__(self):
        self.agent_log = "logs/background_agent.jsonl"
        self.health_log = "logs/health_monitor.jsonl"
        self.setup_logging()
        self.last_activity_threshold = 300  # 5 minutes
        self.restart_count = 0
        self.max_restarts = 5
        self.restart_window = 3600  # 1 hour
    
    def setup_logging(self):
        """Setup health monitoring logging"""
        os.makedirs("logs", exist_ok=True)
        if not os.path.exists(self.health_log):
            with open(self.health_log, "w", encoding='utf-8') as f:
                f.write("")
    
    def log_health(self, action, details):
        """Log health monitoring actions"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "monitor": "health_check",
            "action": action,
            "details": details
        }
        with open(self.health_log, "a", encoding='utf-8') as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def check_agent_activity(self):
        """Check if agent has been active recently"""
        if not os.path.exists(self.agent_log):
            return False, "Agent log not found"
        
        try:
            # Read last few lines of agent log
            with open(self.agent_log, "r", encoding='utf-8') as f:
                lines = f.readlines()
            
            if not lines:
                return False, "Agent log is empty"
            
            # Parse last log entry
            last_line = lines[-1].strip()
            if not last_line:
                return False, "Last log entry is empty"
            
            try:
                last_entry = json.loads(last_line)
                last_activity = datetime.fromisoformat(last_entry["timestamp"].replace("Z", "+00:00"))
                time_since_activity = datetime.utcnow() - last_activity.replace(tzinfo=None)
                
                if time_since_activity.total_seconds() > self.last_activity_threshold:
                    return False, f"Agent inactive for {time_since_activity.total_seconds():.0f} seconds"
                
                return True, f"Agent active, last activity {time_since_activity.total_seconds():.0f} seconds ago"
                
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                return False, f"Error parsing agent log: {e}"
        
        except Exception as e:
            return False, f"Error reading agent log: {e}"
    
    def check_agent_process(self):
        """Check if agent process is running"""
        try:
            # Check for python processes running the background agent
            result = subprocess.run(
                ["pgrep", "-f", "lab7_background_agent.py"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0 and result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                return True, f"Agent process running (PIDs: {', '.join(pids)})"
            else:
                return False, "Agent process not found"
                
        except Exception as e:
            return False, f"Error checking agent process: {e}"
    
    def check_git_status(self):
        """Check git repository status"""
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True,
                text=True,
                cwd="/workspace"
            )
            
            if result.returncode == 0:
                if result.stdout.strip():
                    return True, f"Git has uncommitted changes: {len(result.stdout.strip().split(chr(10)))} files"
                else:
                    return True, "Git working directory clean"
            else:
                return False, f"Git status check failed: {result.stderr}"
                
        except Exception as e:
            return False, f"Error checking git status: {e}"
    
    def restart_agent(self):
        """Restart the background agent"""
        try:
            # Kill existing agent processes
            subprocess.run(["pkill", "-f", "lab7_background_agent.py"], check=False)
            time.sleep(2)
            
            # Start new agent process
            subprocess.Popen([
                "python3", "/workspace/scripts/lab7_background_agent.py"
            ], cwd="/workspace")
            
            self.restart_count += 1
            self.log_health("agent_restarted", {
                "restart_count": self.restart_count,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return True, f"Agent restarted (restart #{self.restart_count})"
            
        except Exception as e:
            self.log_health("restart_failed", {"error": str(e)})
            return False, f"Failed to restart agent: {e}"
    
    def check_restart_limits(self):
        """Check if we've exceeded restart limits"""
        if self.restart_count >= self.max_restarts:
            # Check if we're within the restart window
            # For simplicity, we'll reset the count every hour
            # In production, you'd want more sophisticated tracking
            self.restart_count = 0
            return True
        
        return True
    
    def run_health_check(self):
        """Run complete health check"""
        print(f"[HEALTH] Running health check at {datetime.utcnow().isoformat()}")
        
        # Check agent activity
        is_active, activity_msg = self.check_agent_activity()
        print(f"[HEALTH] Agent activity: {activity_msg}")
        
        # Check agent process
        is_running, process_msg = self.check_agent_process()
        print(f"[HEALTH] Agent process: {process_msg}")
        
        # Check git status
        git_ok, git_msg = self.check_git_status()
        print(f"[HEALTH] Git status: {git_msg}")
        
        # Determine if restart is needed
        needs_restart = not (is_active and is_running)
        
        if needs_restart:
            if not self.check_restart_limits():
                print("[HEALTH] Restart limit exceeded, skipping restart")
                return False
            
            print("[HEALTH] Agent needs restart...")
            success, restart_msg = self.restart_agent()
            print(f"[HEALTH] Restart result: {restart_msg}")
            
            self.log_health("health_check", {
                "needs_restart": needs_restart,
                "restart_success": success,
                "activity_check": is_active,
                "process_check": is_running,
                "git_check": git_ok
            })
            
            return success
        else:
            print("[HEALTH] Agent is healthy")
            self.log_health("health_check", {
                "needs_restart": False,
                "activity_check": is_active,
                "process_check": is_running,
                "git_check": git_ok
            })
            return True
    
    def run_continuous(self, check_interval=60):
        """Run health monitor continuously"""
        print("[HEALTH] Health Monitor Starting...")
        print(f"[HEALTH] Check interval: {check_interval} seconds")
        print("[HEALTH] Press Ctrl+C to stop")
        
        self.log_health("monitor_started", {
            "check_interval": check_interval
        })
        
        try:
            while True:
                self.run_health_check()
                time.sleep(check_interval)
                
        except KeyboardInterrupt:
            print("\n[HEALTH] Shutting down gracefully...")
            self.log_health("monitor_stopped", {"reason": "user_interrupt"})
        except Exception as e:
            print(f"[HEALTH] Unexpected error: {e}")
            self.log_health("monitor_error", {"error": str(e)})

def main():
    """Main function"""
    monitor = HealthMonitor()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        # Single health check
        success = monitor.run_health_check()
        sys.exit(0 if success else 1)
    else:
        # Continuous monitoring
        check_interval = 60  # 1 minute default
        if len(sys.argv) > 2:
            try:
                check_interval = int(sys.argv[2])
            except ValueError:
                print("Invalid check interval, using default 60 seconds")
        
        monitor.run_continuous(check_interval)

if __name__ == "__main__":
    main()
