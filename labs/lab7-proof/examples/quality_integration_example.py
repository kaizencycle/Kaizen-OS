#!/usr/bin/env python3
"""
Quality Tracking Integration Example

This example shows how to integrate quality tracking into your OAA services
to prevent "AI slop" and maintain high-quality outputs.
"""

import requests
import json
import hashlib
from datetime import datetime
from typing import Dict, List, Optional, Any

class QualityTracker:
    """Helper class for integrating quality tracking into OAA services."""
    
    def __init__(self, oaa_base_url: str = "https://oaa-api-library.onrender.com"):
        self.oaa_base_url = oaa_base_url
        self.quality_enabled = True  # Set to False to disable tracking
    
    def record_output(self, output_data: Dict[str, Any], 
                     has_provenance: bool = False,
                     sources: Optional[List[str]] = None,
                     is_duplicate: bool = False,
                     is_quarantined: bool = False,
                     beacon_valid: bool = True) -> Dict[str, Any]:
        """
        Record an output for quality tracking.
        
        Args:
            output_data: The output data to track
            has_provenance: Whether the output has source attribution
            sources: List of source identifiers
            is_duplicate: Whether this is a duplicate output
            is_quarantined: Whether this output was quarantined
            beacon_valid: Whether the beacon metadata is valid
            
        Returns:
            Response from quality tracking API
        """
        if not self.quality_enabled:
            return {"status": "disabled"}
        
        payload = {
            "output_data": output_data,
            "has_provenance": has_provenance,
            "sources": sources or [],
            "is_duplicate": is_duplicate,
            "is_quarantined": is_quarantined,
            "beacon_valid": beacon_valid
        }
        
        try:
            response = requests.post(
                f"{self.oaa_base_url}/dev/quality/record-output",
                json=payload,
                timeout=5
            )
            return response.json()
        except Exception as e:
            print(f"Warning: Failed to record quality metric: {e}")
            return {"status": "error", "message": str(e)}
    
    def record_copilot_overlap(self, pr_id: str, overlap_score: float) -> Dict[str, Any]:
        """Record Copilot overlap score for a PR."""
        if not self.quality_enabled:
            return {"status": "disabled"}
        
        payload = {
            "pr_id": pr_id,
            "overlap_score": overlap_score
        }
        
        try:
            response = requests.post(
                f"{self.oaa_base_url}/dev/quality/record-copilot-overlap",
                json=payload,
                timeout=5
            )
            return response.json()
        except Exception as e:
            print(f"Warning: Failed to record Copilot overlap: {e}")
            return {"status": "error", "message": str(e)}
    
    def record_rollback(self, reason: str, output_hash: Optional[str] = None) -> Dict[str, Any]:
        """Record a rollback event."""
        if not self.quality_enabled:
            return {"status": "disabled"}
        
        payload = {
            "reason": reason,
            "output_hash": output_hash
        }
        
        try:
            response = requests.post(
                f"{self.oaa_base_url}/dev/quality/record-rollback",
                json=payload,
                timeout=5
            )
            return response.json()
        except Exception as e:
            print(f"Warning: Failed to record rollback: {e}")
            return {"status": "error", "message": str(e)}
    
    def get_quality_metrics(self) -> Dict[str, Any]:
        """Get current quality metrics."""
        try:
            response = requests.get(f"{self.oaa_base_url}/dev/quality/", timeout=5)
            return response.json()
        except Exception as e:
            print(f"Warning: Failed to get quality metrics: {e}")
            return {"status": "error", "message": str(e)}
    
    def check_duplicate(self, output_data: Dict[str, Any]) -> bool:
        """Simple duplicate detection based on content hash."""
        content_str = json.dumps(output_data, sort_keys=True)
        content_hash = hashlib.sha256(content_str.encode()).hexdigest()
        
        # In a real implementation, you'd check against a database of previous outputs
        # For this example, we'll just return False
        return False

# Example usage functions

def example_reflection_processing():
    """Example: Processing a user reflection with quality tracking."""
    tracker = QualityTracker()
    
    # Simulate processing a user reflection
    reflection_data = {
        "type": "reflection",
        "user_id": "user123",
        "content": "The system helped me understand the concept better",
        "timestamp": datetime.utcnow().isoformat(),
        "session_id": "session456"
    }
    
    # Check for duplicates
    is_duplicate = tracker.check_duplicate(reflection_data)
    
    # Record the output with quality tracking
    result = tracker.record_output(
        output_data=reflection_data,
        has_provenance=True,  # We know the source
        sources=["user_input", "reflection_system"],
        is_duplicate=is_duplicate,
        is_quarantined=False,
        beacon_valid=True
    )
    
    print(f"Reflection processed: {result}")
    return reflection_data

def example_beacon_validation():
    """Example: Validating a beacon with quality tracking."""
    tracker = QualityTracker()
    
    # Simulate beacon data
    beacon_data = {
        "type": "beacon",
        "object_type": "CreativeWork",
        "title": "AI Ethics Guide",
        "url": "https://example.com/ethics-guide",
        "metadata": {
            "author": "AI Ethics Team",
            "created": "2025-01-14T10:00:00Z",
            "version": "1.0"
        }
    }
    
    # Validate beacon schema (simplified)
    is_valid = validate_beacon_schema(beacon_data)
    
    # Record validation result
    result = tracker.record_output(
        output_data=beacon_data,
        has_provenance=True,
        sources=["beacon_validation"],
        is_duplicate=False,
        is_quarantined=not is_valid,
        beacon_valid=is_valid
    )
    
    print(f"Beacon validation: {result}")
    return is_valid

def example_copilot_verification():
    """Example: Verifying Copilot suggestions."""
    tracker = QualityTracker()
    
    # Simulate PR with Copilot suggestions
    pr_id = "pr-123"
    copilot_suggestion = "Add error handling for null values"
    actual_change = "Added null checks in data processing function"
    
    # Calculate overlap (simplified)
    overlap_score = calculate_text_overlap(copilot_suggestion, actual_change)
    
    # Record overlap score
    result = tracker.record_copilot_overlap(pr_id, overlap_score)
    
    print(f"Copilot overlap recorded: {result}")
    return overlap_score

def example_quality_gate():
    """Example: Implementing a quality gate."""
    tracker = QualityTracker()
    
    # Get current quality metrics
    metrics = tracker.get_quality_metrics()
    
    if metrics.get("status") == "enabled":
        health_score = metrics.get("health_score", 0)
        provenance_coverage = metrics.get("metrics", {}).get("provenance_coverage", {}).get("value", 0)
        
        # Quality gate: require high health score and provenance coverage
        if health_score < 0.8:
            print(f"Quality gate failed: Health score too low ({health_score:.2f})")
            tracker.record_rollback("low_health_score")
            return False
        
        if provenance_coverage < 0.9:
            print(f"Quality gate failed: Provenance coverage too low ({provenance_coverage:.2f})")
            tracker.record_rollback("low_provenance_coverage")
            return False
        
        print("Quality gate passed")
        return True
    else:
        print("Quality tracking disabled, skipping gate")
        return True

# Helper functions

def validate_beacon_schema(beacon_data: Dict[str, Any]) -> bool:
    """Simple beacon validation (in real implementation, use JSON Schema)."""
    required_fields = ["type", "object_type", "title", "url"]
    return all(field in beacon_data for field in required_fields)

def calculate_text_overlap(text1: str, text2: str) -> float:
    """Simple text overlap calculation (in real implementation, use proper similarity)."""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    if not words1 or not words2:
        return 0.0
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    return len(intersection) / len(union) if union else 0.0

def main():
    """Run all examples."""
    print("=== Quality Tracking Integration Examples ===\n")
    
    print("1. Processing reflection with quality tracking:")
    example_reflection_processing()
    print()
    
    print("2. Validating beacon with quality tracking:")
    example_beacon_validation()
    print()
    
    print("3. Verifying Copilot suggestions:")
    example_copilot_verification()
    print()
    
    print("4. Implementing quality gate:")
    example_quality_gate()
    print()
    
    print("=== Examples completed ===")

if __name__ == "__main__":
    main()
