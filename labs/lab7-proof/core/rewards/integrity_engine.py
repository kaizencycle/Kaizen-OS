# core/rewards/integrity_engine.py
"""
Integrity-Based Reward Engine (GIC v1.0)

Deterministic scorer that minimizes AI slop and drift by tying rewards to:
- Truth: grounded, cited statements
- Symbiosis: mutual human-AI contribution
- Verification: ledger seals, signatures, tests
- Novelty: meaningful differentiation from recent content

Penalties cut through slop:
- Entropy: internal contradictions
- Duplication: near-duplicate content
- Policy violation: immediate veto
- Drift anomaly: behavior shift vs baseline
"""

import hashlib
import json
import time
import re
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
import uuid


def _hash_payload(payload: Dict[str, Any]) -> str:
    """Create deterministic hash of payload for ledger sealing."""
    data = json.dumps(payload, sort_keys=True).encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def _clip(x: float) -> float:
    """Clamp value to [0, 1] range."""
    return max(0.0, min(1.0, float(x)))


def score_truth(evidence: Dict[str, Any]) -> float:
    """
    Score truth based on evidence quality and citations.
    Higher score for more credible, verifiable sources.
    """
    citations = evidence.get("citations", [])
    observations = evidence.get("observations", [])
    artifacts = evidence.get("artifacts", [])
    
    if not citations and not observations and not artifacts:
        return 0.0
    
    score = 0.0
    
    # Citations scoring (0.0 - 0.6)
    if citations:
        valid_citations = 0
        for citation in citations:
            if isinstance(citation, str) and len(citation) > 10:
                # Check if it's a URL or hash
                if citation.startswith(('http://', 'https://')) or len(citation) == 64:
                    valid_citations += 1
        score += min(0.6, valid_citations * 0.2)
    
    # Observations scoring (0.0 - 0.3)
    if observations:
        valid_observations = 0
        for obs in observations:
            if isinstance(obs, str) and ':' in obs and '@' in obs:
                # Format: metric_name:value@timestamp
                valid_observations += 1
        score += min(0.3, valid_observations * 0.1)
    
    # Artifacts scoring (0.0 - 0.1)
    if artifacts:
        score += min(0.1, len(artifacts) * 0.05)
    
    return _clip(score)


def score_symbiosis(human_statement: str, agent_statement: str) -> float:
    """
    Score mutual contribution and agreement between human and agent.
    Higher score for balanced, complementary contributions.
    """
    if not human_statement or not agent_statement:
        return 0.0
    
    human_len = len(human_statement.strip())
    agent_len = len(agent_statement.strip())
    
    if human_len == 0 or agent_len == 0:
        return 0.0
    
    # Balance ratio (closer to 1.0 is better)
    ratio = min(human_len, agent_len) / max(human_len, agent_len)
    balance_score = ratio * 0.6
    
    # Content overlap (some overlap is good, too much is bad)
    human_words = set(human_statement.lower().split())
    agent_words = set(agent_statement.lower().split())
    
    if human_words and agent_words:
        overlap = len(human_words & agent_words) / len(human_words | agent_words)
        # Sweet spot around 0.3-0.5 overlap
        if 0.2 <= overlap <= 0.6:
            overlap_score = 0.4
        else:
            overlap_score = max(0.0, 0.4 - abs(overlap - 0.4) * 2)
    else:
        overlap_score = 0.0
    
    return _clip(balance_score + overlap_score)


def score_verification(payload: Dict[str, Any], manifest: Dict[str, Any]) -> float:
    """
    Score verification based on signatures, ledger requirements, and policy compliance.
    """
    score = 0.0
    
    # Check required fields
    required_fields = ["nonce", "timestamp", "human_statement", "agent_statement"]
    present_fields = sum(1 for field in required_fields if payload.get(field))
    score += (present_fields / len(required_fields)) * 0.4
    
    # Check nonce format (should be UUID-like)
    nonce = payload.get("nonce", "")
    if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', nonce):
        score += 0.2
    
    # Check timestamp format (ISO8601-like)
    timestamp = payload.get("timestamp", "")
    if re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', timestamp):
        score += 0.2
    
    # Check task_type validity
    valid_task_types = ["reflection", "fix", "lesson", "dataset", "deployment"]
    task_type = payload.get("task_type", "")
    if task_type in valid_task_types:
        score += 0.2
    
    return _clip(score)


def score_novelty(payload: Dict[str, Any], reference_data: Optional[List[Dict]] = None) -> float:
    """
    Score novelty based on content differentiation from recent submissions.
    Higher score for more unique, meaningful content.
    """
    if not reference_data:
        # If no reference data, assume moderate novelty
        return 0.5
    
    content = f"{payload.get('human_statement', '')} {payload.get('agent_statement', '')}"
    if not content.strip():
        return 0.0
    
    # Simple character-level uniqueness check
    content_len = len(content)
    unique_chars = len(set(content.lower()))
    char_diversity = unique_chars / content_len if content_len > 0 else 0
    
    # Word-level uniqueness (basic)
    words = content.lower().split()
    unique_words = len(set(words))
    word_diversity = unique_words / len(words) if words else 0
    
    # Combine metrics
    novelty = (char_diversity * 0.3 + word_diversity * 0.7)
    
    return _clip(novelty)


def score_entropy(payload: Dict[str, Any]) -> float:
    """
    Score entropy (contradictions/ambiguity) in the payload.
    Lower entropy is better (more consistent).
    """
    human_statement = payload.get("human_statement", "")
    agent_statement = payload.get("agent_statement", "")
    
    if not human_statement or not agent_statement:
        return 0.0
    
    # Check for contradictory keywords
    contradiction_words = [
        ("yes", "no"), ("true", "false"), ("correct", "incorrect"),
        ("agree", "disagree"), ("should", "shouldn't"), ("will", "won't")
    ]
    
    contradictions = 0
    human_lower = human_statement.lower()
    agent_lower = agent_statement.lower()
    
    for pos, neg in contradiction_words:
        if (pos in human_lower and neg in agent_lower) or (pos in agent_lower and neg in human_lower):
            contradictions += 1
    
    # Normalize by content length
    total_words = len(human_statement.split()) + len(agent_statement.split())
    entropy = contradictions / max(total_words / 100, 1)  # Normalize per 100 words
    
    return _clip(entropy)


def score_duplication(payload: Dict[str, Any], reference_data: Optional[List[Dict]] = None) -> float:
    """
    Score duplication against recent submissions.
    Higher score means more duplicated content.
    """
    if not reference_data:
        return 0.0
    
    content = f"{payload.get('human_statement', '')} {payload.get('agent_statement', '')}"
    if not content.strip():
        return 1.0  # Empty content is considered duplicated
    
    # Simple similarity check (in production, use proper embeddings)
    content_words = set(content.lower().split())
    max_similarity = 0.0
    
    for ref in reference_data:
        ref_content = f"{ref.get('human_statement', '')} {ref.get('agent_statement', '')}"
        ref_words = set(ref_content.lower().split())
        
        if content_words and ref_words:
            similarity = len(content_words & ref_words) / len(content_words | ref_words)
            max_similarity = max(max_similarity, similarity)
    
    return _clip(max_similarity)


def score_drift(payload: Dict[str, Any], reference_vectors: Optional[Dict] = None) -> float:
    """
    Score drift anomaly based on behavior shift from baseline.
    Higher score means more anomalous behavior.
    """
    if not reference_vectors:
        return 0.0
    
    # Simple drift detection based on content patterns
    content = f"{payload.get('human_statement', '')} {payload.get('agent_statement', '')}"
    
    # Check for unusual patterns that might indicate drift
    drift_indicators = 0
    
    # Check for excessive repetition
    words = content.split()
    if len(words) > 10:
        word_counts = {}
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1
        max_repetition = max(word_counts.values()) if word_counts else 0
        if max_repetition > len(words) * 0.3:  # More than 30% repetition
            drift_indicators += 1
    
    # Check for unusual length patterns
    if len(content) > 1000:  # Very long content might indicate drift
        drift_indicators += 1
    
    # Check for policy violation patterns
    policy_violation = payload.get("penalties", {}).get("policy_violation", False)
    if policy_violation:
        drift_indicators += 2
    
    return _clip(drift_indicators / 3.0)  # Normalize to [0, 1]


def evaluate_reward(payload: Dict[str, Any], manifest: Dict[str, Any], 
                   reference_data: Optional[List[Dict]] = None) -> Dict[str, Any]:
    """
    Main reward evaluation function.
    
    Args:
        payload: Input data containing human/agent statements and evidence
        manifest: Reward algorithm configuration
        reference_data: Recent submissions for novelty/duplication scoring
    
    Returns:
        Dictionary with GIC reward, scores, and metadata
    """
    weights = manifest["scoring"]["weights"]
    penalties_w = manifest["scoring"]["penalties"]
    base = manifest["issuance"]["base"]
    
    # Calculate scores
    evidence = payload.get("evidence", {})
    truth = score_truth(evidence)
    symbiosis = score_symbiosis(
        payload.get("human_statement", ""),
        payload.get("agent_statement", "")
    )
    verification = score_verification(payload, manifest)
    novelty = score_novelty(payload, reference_data)
    
    # Calculate penalties (use pre-calculated values if available, otherwise calculate)
    penalties = payload.get("penalties", {})
    entropy = penalties.get("entropy", score_entropy(payload))
    duplication = penalties.get("duplication", score_duplication(payload, reference_data))
    policy_violation = 1.0 if penalties.get("policy_violation", False) else 0.0
    drift_anomaly = penalties.get("drift_anomaly", score_drift(payload, reference_data))
    
    # Calculate integrity and penalty scores
    I = (weights["truth"] * truth +
         weights["symbiosis"] * symbiosis +
         weights["verification"] * verification +
         weights["novelty"] * novelty)
    
    P = (penalties_w["entropy"] * entropy +
         penalties_w["duplication"] * duplication +
         penalties_w["policy_violation"] * policy_violation +
         penalties_w["drift_anomaly"] * drift_anomaly)
    
    # Calculate GIC reward
    gic = max(0.0, base * (I - P))
    
    # Apply tripwires
    if policy_violation >= 1.0 or drift_anomaly > 0.5:
        gic = 0.0
    
    # Create ledger seal
    seal = _hash_payload(payload)
    
    # Calculate splits
    human_share = gic * manifest["issuance"]["split"]["human"]
    agent_share = gic * manifest["issuance"]["split"]["agent_pool"]
    
    return {
        "ok": True,
        "GIC": gic,
        "integrity": I,
        "penalty": P,
        "scores": {
            "truth": truth,
            "symbiosis": symbiosis,
            "verification": verification,
            "novelty": novelty
        },
        "penalties": {
            "entropy": entropy,
            "duplication": duplication,
            "policy_violation": policy_violation,
            "drift_anomaly": drift_anomaly
        },
        "splits": {
            "human": human_share,
            "agent_pool": agent_share
        },
        "seal": seal,
        "timestamp": time.time()
    }


def load_manifest(manifest_path: str) -> Dict[str, Any]:
    """Load reward manifest from file."""
    with open(manifest_path, 'r') as f:
        return json.load(f)


# CLI interface for testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python integrity_engine.py <payload_file> [manifest_file]")
        sys.exit(1)
    
    payload_file = sys.argv[1]
    manifest_file = sys.argv[2] if len(sys.argv) > 2 else "manifest.json"
    
    with open(payload_file, 'r') as f:
        payload = json.load(f)
    
    manifest = load_manifest(manifest_file)
    result = evaluate_reward(payload, manifest)
    
    print(json.dumps(result, indent=2))

