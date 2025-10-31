"""DelibProof consensus wrapper for multi-agent validation."""
from statistics import pstdev, mean
from typing import List, Dict, Optional

def verdict(approvals: List[float], min_agree: float = 0.90, max_std: float = 0.15) -> Dict:
    """
    Calculate consensus verdict from approval scores.
    
    Args:
        approvals: List of approval scores (0.0 to 1.0) from sentinels
        min_agree: Minimum approval threshold (default 0.90)
        max_std: Maximum allowed standard deviation (default 0.15)
        
    Returns:
        Dictionary with consensus result:
        {
            "ok": bool,
            "avg": float,
            "sd": float,
            "agree": float,  # fraction of votes >= min_agree
            "votes": List[float]
        }
    """
    if not approvals:
        return {"ok": False, "reason": "no_votes", "avg": 0.0, "sd": 0.0, "agree": 0.0, "votes": []}
    
    avg = mean(approvals)
    sd = pstdev(approvals) if len(approvals) > 1 else 0.0
    
    # Agreement: fraction of votes >= min_agree
    agree = sum(1 for v in approvals if v >= min_agree) / len(approvals)
    
    # Consensus reached if:
    # 1. At least 50% of sentinels approve (agree >= 0.5)
    # 2. Standard deviation is low (sentinels agree with each other)
    # 3. Average approval is high (>= min_agree)
    ok = (agree >= 0.5) and (sd <= max_std) and (avg >= min_agree)
    
    return {
        "ok": ok,
        "avg": avg,
        "sd": sd,
        "agree": agree,
        "votes": approvals,
    }

def consensus_threshold(approvals: List[float], threshold: float = 0.90) -> bool:
    """
    Simplified consensus check: returns True if consensus reached.
    
    Args:
        approvals: List of approval scores
        threshold: Minimum consensus threshold
        
    Returns:
        True if consensus reached, False otherwise
    """
    result = verdict(approvals, min_agree=threshold)
    return result["ok"]

def weighted_consensus(approvals: List[float], weights: Optional[List[float]] = None) -> Dict:
    """
    Calculate weighted consensus where different sentinels have different weights.
    
    Args:
        approvals: List of approval scores
        weights: Optional list of weights (must match length of approvals)
        
    Returns:
        Dictionary with weighted consensus result
    """
    if not approvals:
        return {"ok": False, "weighted_avg": 0.0, "votes": []}
    
    if weights is None:
        weights = [1.0] * len(approvals)
    
    if len(weights) != len(approvals):
        raise ValueError("Weights length must match approvals length")
    
    # Normalize weights
    total_weight = sum(weights)
    normalized_weights = [w / total_weight for w in weights]
    
    # Calculate weighted average
    weighted_avg = sum(score * weight for score, weight in zip(approvals, normalized_weights))
    
    # Consensus if weighted average >= 0.90
    ok = weighted_avg >= 0.90
    
    return {
        "ok": ok,
        "weighted_avg": weighted_avg,
        "votes": approvals,
        "weights": weights,
    }
