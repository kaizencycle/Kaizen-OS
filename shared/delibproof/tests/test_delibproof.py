"""Tests for DelibProof consensus core."""
import pytest
from shared.delibproof.core import verdict, consensus_threshold, weighted_consensus

def test_verdict_all_approve():
    """Test verdict when all sentinels approve."""
    approvals = [0.95, 0.92, 0.98, 0.90]
    result = verdict(approvals)
    assert result["ok"] == True
    assert result["avg"] >= 0.90
    assert result["agree"] >= 0.5

def test_verdict_mixed():
    """Test verdict with mixed approvals."""
    approvals = [0.95, 0.85, 0.70, 0.60]
    result = verdict(approvals)
    # Should fail due to low average or high stddev
    assert result["ok"] == False

def test_verdict_no_votes():
    """Test verdict with no votes."""
    result = verdict([])
    assert result["ok"] == False
    assert result["reason"] == "no_votes"

def test_consensus_threshold():
    """Test simplified consensus threshold check."""
    assert consensus_threshold([0.95, 0.92, 0.98]) == True
    assert consensus_threshold([0.70, 0.80, 0.75]) == False

def test_weighted_consensus():
    """Test weighted consensus calculation."""
    approvals = [0.95, 0.90, 0.85]
    weights = [0.5, 0.3, 0.2]
    result = weighted_consensus(approvals, weights)
    assert result["ok"] == True
    assert result["weighted_avg"] >= 0.90

def test_weighted_consensus_mismatch():
    """Test weighted consensus with mismatched lengths."""
    approvals = [0.95, 0.90]
    weights = [0.5, 0.3, 0.2]
    with pytest.raises(ValueError):
        weighted_consensus(approvals, weights)
