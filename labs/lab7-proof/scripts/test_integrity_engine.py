#!/usr/bin/env python3
"""
Test script for the Integrity-Based Reward Engine

Validates the implementation with various test cases to ensure
proper scoring and penalty application.
"""

import json
import sys
from pathlib import Path

# Add core directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "core"))

from rewards.integrity_engine import evaluate_reward, load_manifest


def test_high_quality_content():
    """Test with high-quality content that should score well."""
    print("Testing high-quality content...")
    
    payload = {
        "human_statement": "I need help implementing a secure authentication system. I've researched OWASP guidelines and FastAPI documentation for best practices.",
        "agent_statement": "I'll help you implement secure authentication using FastAPI with python-jose for JWT handling. Here's a comprehensive approach: 1) Use bcrypt for password hashing, 2) Implement proper token expiration, 3) Add rate limiting, 4) Include CSRF protection.",
        "evidence": {
            "citations": [
                "https://owasp.org/www-project-authentication-cheat-sheet/",
                "https://fastapi.tiangolo.com/tutorial/security/"
            ],
            "observations": [
                "security_scan:passed@2024-01-15T10:30:00Z",
                "test_coverage:85@2024-01-15T10:30:00Z"
            ],
            "artifacts": ["abc123def456", "pr-789"]
        },
        "task_type": "reflection",
        "nonce": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2024-01-15T10:30:00Z"
    }
    
    manifest = load_manifest("core/rewards/manifest.json")
    result = evaluate_reward(payload, manifest)
    
    print(f"  GIC: {result['GIC']:.2f}")
    print(f"  Integrity: {result['integrity']:.2f}")
    print(f"  Penalty: {result['penalty']:.2f}")
    print(f"  Scores: {result['scores']}")
    print(f"  Penalties: {result['penalties']}")
    
    # Should have high GIC due to good scores and low penalties
    assert result['GIC'] > 5.0, f"Expected GIC > 5.0, got {result['GIC']}"
    assert result['scores']['truth'] > 0.5, f"Expected truth > 0.5, got {result['scores']['truth']}"
    assert result['scores']['symbiosis'] > 0.2, f"Expected symbiosis > 0.2, got {result['scores']['symbiosis']}"
    
    print("  ✅ High-quality content test passed\n")


def test_low_quality_content():
    """Test with low-quality content that should score poorly."""
    print("Testing low-quality content...")
    
    payload = {
        "human_statement": "help me",
        "agent_statement": "ok sure here is some code that might work maybe",
        "evidence": {
            "citations": [],
            "observations": [],
            "artifacts": []
        },
        "task_type": "reflection",
        "nonce": "550e8400-e29b-41d4-a716-446655440001",
        "timestamp": "2024-01-15T10:30:00Z"
    }
    
    manifest = load_manifest("core/rewards/manifest.json")
    result = evaluate_reward(payload, manifest)
    
    print(f"  GIC: {result['GIC']:.2f}")
    print(f"  Integrity: {result['integrity']:.2f}")
    print(f"  Penalty: {result['penalty']:.2f}")
    print(f"  Scores: {result['scores']}")
    print(f"  Penalties: {result['penalties']}")
    
    # Should have low GIC due to poor scores
    assert result['GIC'] < 3.0, f"Expected GIC < 3.0, got {result['GIC']}"
    assert result['scores']['truth'] < 0.3, f"Expected truth < 0.3, got {result['scores']['truth']}"
    
    print("  ✅ Low-quality content test passed\n")


def test_policy_violation():
    """Test with policy violation that should result in zero GIC."""
    print("Testing policy violation...")
    
    payload = {
        "human_statement": "I need help with something",
        "agent_statement": "I'll help you with that",
        "evidence": {
            "citations": [],
            "observations": [],
            "artifacts": []
        },
        "task_type": "reflection",
        "nonce": "550e8400-e29b-41d4-a716-446655440002",
        "timestamp": "2024-01-15T10:30:00Z",
        "penalties": {
            "policy_violation": True
        }
    }
    
    manifest = load_manifest("core/rewards/manifest.json")
    result = evaluate_reward(payload, manifest)
    
    print(f"  GIC: {result['GIC']:.2f}")
    print(f"  Policy Violation: {result['penalties']['policy_violation']}")
    
    # Should have zero GIC due to policy violation
    assert result['GIC'] == 0.0, f"Expected GIC = 0.0, got {result['GIC']}"
    assert result['penalties']['policy_violation'] == 1.0, f"Expected policy_violation = 1.0, got {result['penalties']['policy_violation']}"
    
    print("  ✅ Policy violation test passed\n")


def test_drift_anomaly():
    """Test with drift anomaly that should result in zero GIC."""
    print("Testing drift anomaly...")
    
    payload = {
        "human_statement": "I need help with something",
        "agent_statement": "I'll help you with that",
        "evidence": {
            "citations": [],
            "observations": [],
            "artifacts": []
        },
        "task_type": "reflection",
        "nonce": "550e8400-e29b-41d4-a716-446655440003",
        "timestamp": "2024-01-15T10:30:00Z",
        "penalties": {
            "drift_anomaly": 0.6  # Above 0.5 threshold
        }
    }
    
    manifest = load_manifest("core/rewards/manifest.json")
    result = evaluate_reward(payload, manifest)
    
    print(f"  GIC: {result['GIC']:.2f}")
    print(f"  Drift Anomaly: {result['penalties']['drift_anomaly']}")
    
    # Should have zero GIC due to drift anomaly
    assert result['GIC'] == 0.0, f"Expected GIC = 0.0, got {result['GIC']}"
    assert result['penalties']['drift_anomaly'] == 0.6, f"Expected drift_anomaly = 0.6, got {result['penalties']['drift_anomaly']}"
    
    print("  ✅ Drift anomaly test passed\n")


def test_sample_payload():
    """Test with the provided sample payload."""
    print("Testing sample payload...")
    
    try:
        with open("scripts/sample_payload.json", "r") as f:
            payload = json.load(f)
        
        manifest = load_manifest("core/rewards/manifest.json")
        result = evaluate_reward(payload, manifest)
        
        print(f"  GIC: {result['GIC']:.2f}")
        print(f"  Integrity: {result['integrity']:.2f}")
        print(f"  Penalty: {result['penalty']:.2f}")
        print(f"  Scores: {result['scores']}")
        print(f"  Penalties: {result['penalties']}")
        
        # Sample payload should score reasonably well
        assert result['GIC'] > 0.0, f"Expected GIC > 0.0, got {result['GIC']}"
        
        print("  ✅ Sample payload test passed\n")
        
    except FileNotFoundError:
        print("  ⚠️  Sample payload file not found, skipping test\n")


def main():
    """Run all tests."""
    print("Running Integrity Engine Tests\n")
    print("=" * 50)
    
    try:
        test_high_quality_content()
        test_low_quality_content()
        test_policy_violation()
        test_drift_anomaly()
        test_sample_payload()
        
        print("=" * 50)
        print("🎉 All tests passed! The Integrity Engine is working correctly.")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
