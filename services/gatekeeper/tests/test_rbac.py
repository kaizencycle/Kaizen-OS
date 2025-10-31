"""Tests for RBAC policies."""
import pytest
from src.policies import allowed, risk_requires_consensus, get_action_risk

def test_citizen_permissions():
    """Test citizen role permissions."""
    assert allowed("citizen", "http_request") == True
    assert allowed("citizen", "execute_script") == False
    assert allowed("citizen", "mint_gic") == False

def test_sentinel_permissions():
    """Test sentinel role permissions."""
    assert allowed("sentinel", "execute_script") == True
    assert allowed("sentinel", "mint_gic") == True
    assert allowed("sentinel", "http_request") == True

def test_risk_consensus():
    """Test risk level consensus requirements."""
    assert risk_requires_consensus("high") == True
    assert risk_requires_consensus("critical") == True
    assert risk_requires_consensus("low") == False
    assert risk_requires_consensus("medium") == False

def test_action_risk():
    """Test default risk levels for actions."""
    assert get_action_risk("execute_script") == "high"
    assert get_action_risk("mint_gic") == "critical"
    assert get_action_risk("http_request") == "low"
