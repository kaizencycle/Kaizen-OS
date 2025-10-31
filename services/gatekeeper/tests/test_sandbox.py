"""Tests for sandbox execution."""
import pytest
from src.sandbox import run_in_sandbox, validate_script_safety

def test_sandbox_safe_script():
    """Test sandbox execution of safe script."""
    result = run_in_sandbox("echo 'Hello, World!'")
    assert "sandboxed" in result
    assert result["sandboxed"] == True

def test_sandbox_validate_safe():
    """Test script validation accepts safe scripts."""
    is_safe, reason = validate_script_safety("echo 'test'")
    assert is_safe == True
    assert "safe" in reason.lower()

def test_sandbox_validate_dangerous():
    """Test script validation rejects dangerous scripts."""
    is_safe, reason = validate_script_safety("rm -rf /")
    assert is_safe == False
    assert "dangerous" in reason.lower() or "rm" in reason.lower()

def test_sandbox_validate_eval():
    """Test script validation rejects eval patterns."""
    is_safe, reason = validate_script_safety("python -c 'eval(\"bad\")'")
    assert is_safe == False
