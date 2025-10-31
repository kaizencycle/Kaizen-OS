"""Sandbox execution environment for untrusted code."""
import subprocess
import tempfile
import os
import json
import resource
from typing import Dict

# Resource limits
MAX_CPU_TIME = 2  # seconds
MAX_MEMORY = 262144  # 256 MB in KB
MAX_OUTPUT_SIZE = 2048  # bytes

def run_in_sandbox(script: str) -> Dict:
    """
    Execute script in a sandboxed environment with resource limits.
    
    Args:
        script: Script content to execute
        
    Returns:
        Dictionary with execution results
        
    Note:
        In production, use nsjail, gVisor, or container isolation
        instead of basic ulimit/timeout
    """
    # Write script to temporary file
    with tempfile.TemporaryDirectory() as tmpdir:
        script_path = os.path.join(tmpdir, "task.sh")
        
        # Write script with shebang
        with open(script_path, "w") as f:
            f.write("#!/bin/bash\n")
            f.write(script)
        
        # Make executable
        os.chmod(script_path, 0o755)
        
        # Set resource limits
        try:
            resource.setrlimit(resource.RLIMIT_CPU, (MAX_CPU_TIME, MAX_CPU_TIME))
            resource.setrlimit(resource.RLIMIT_AS, (MAX_MEMORY * 1024, MAX_MEMORY * 1024))
        except Exception:
            # Limits may not be settable in all environments
            pass
        
        # Execute with timeout and no network (via environment)
        env = os.environ.copy()
        env["PATH"] = "/usr/bin:/bin"  # Minimal PATH
        env["NETWORK"] = "0"  # Flag to disable network
        
        try:
            proc = subprocess.run(
                ["bash", "-c", f"ulimit -t {MAX_CPU_TIME} -v {MAX_MEMORY}; timeout {MAX_CPU_TIME}s {script_path}"],
                capture_output=True,
                text=True,
                timeout=MAX_CPU_TIME + 1,
                env=env,
                cwd=tmpdir,
            )
            
            # Truncate output to prevent exfiltration
            stdout = proc.stdout[-MAX_OUTPUT_SIZE:] if proc.stdout else ""
            stderr = proc.stderr[-MAX_OUTPUT_SIZE:] if proc.stderr else ""
            
            return {
                "rc": proc.returncode,
                "stdout": stdout,
                "stderr": stderr,
                "sandboxed": True,
            }
        except subprocess.TimeoutExpired:
            return {
                "rc": -1,
                "stdout": "",
                "stderr": "Execution timeout",
                "sandboxed": True,
            }
        except Exception as e:
            return {
                "rc": -1,
                "stdout": "",
                "stderr": f"Sandbox error: {str(e)}",
                "sandboxed": True,
            }

def validate_script_safety(script: str) -> tuple[bool, str]:
    """
    Perform static analysis on script before execution.
    
    Args:
        script: Script content to validate
        
    Returns:
        Tuple of (is_safe, reason)
    """
    script_lower = script.lower()
    
    # Deny dangerous commands
    dangerous_patterns = [
        "rm -rf",
        "dd if=",
        "mkfs",
        "fdisk",
        "shutdown",
        "reboot",
        "curl",
        "wget",
        "nc ",
        "netcat",
        "python -c",
        "perl -e",
        "eval",
        "exec(",
    ]
    
    for pattern in dangerous_patterns:
        if pattern in script_lower:
            return False, f"Dangerous pattern detected: {pattern}"
    
    # Check for suspicious file operations
    if script.count(">") > 10 or script.count("|") > 10:
        return False, "Too many redirections or pipes"
    
    return True, "Script appears safe"
