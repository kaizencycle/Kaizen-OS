"""
Quality Metrics Router
Implements anti-slop metrics tracking and reporting for the OAA system.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
import os
import hashlib
from collections import defaultdict, Counter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dev/quality", tags=["quality-metrics"])

# In-memory storage for metrics (in production, use Redis or database)
quality_metrics = {
    "provenance_coverage": [],
    "hallucination_rate": [],
    "duplicate_ratio": [],
    "beacon_validity": [],
    "copilot_overlap_score": [],
    "rollback_rate": [],
    "outputs": [],
    "quarantined_items": []
}

class QualityMetricsService:
    """Service for tracking and calculating quality metrics."""
    
    def __init__(self):
        self.metrics_enabled = os.getenv("QUALITY_METRICS_ENABLED", "false").lower() == "true"
        self.retention_days = int(os.getenv("QUALITY_METRICS_RETENTION_DAYS", "30"))
    
    def record_output(self, output_data: dict, has_provenance: bool = False, 
                     sources: List[str] = None, is_duplicate: bool = False,
                     is_quarantined: bool = False, beacon_valid: bool = True):
        """Record a new output for quality tracking."""
        if not self.metrics_enabled:
            return
            
        timestamp = datetime.utcnow()
        output_hash = hashlib.sha256(json.dumps(output_data, sort_keys=True).encode()).hexdigest()
        
        record = {
            "timestamp": timestamp.isoformat(),
            "hash": output_hash,
            "has_provenance": has_provenance,
            "sources": sources or [],
            "is_duplicate": is_duplicate,
            "is_quarantined": is_quarantined,
            "beacon_valid": beacon_valid,
            "output_type": output_data.get("type", "unknown")
        }
        
        quality_metrics["outputs"].append(record)
        
        # Clean up old records
        self._cleanup_old_records()
        
        # Update derived metrics
        self._update_derived_metrics()
    
    def record_copilot_overlap(self, pr_id: str, overlap_score: float):
        """Record Copilot overlap score for a PR."""
        if not self.metrics_enabled:
            return
            
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "pr_id": pr_id,
            "overlap_score": overlap_score
        }
        
        quality_metrics["copilot_overlap_score"].append(record)
        self._cleanup_old_records()
    
    def record_rollback(self, reason: str, output_hash: str = None):
        """Record a rollback event."""
        if not self.metrics_enabled:
            return
            
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "reason": reason,
            "output_hash": output_hash
        }
        
        quality_metrics["rollback_rate"].append(record)
        self._cleanup_old_records()
    
    def _cleanup_old_records(self):
        """Remove records older than retention period."""
        cutoff = datetime.utcnow() - timedelta(days=self.retention_days)
        
        for metric_name in quality_metrics:
            if isinstance(quality_metrics[metric_name], list):
                quality_metrics[metric_name] = [
                    record for record in quality_metrics[metric_name]
                    if datetime.fromisoformat(record["timestamp"]) > cutoff
                ]
    
    def _update_derived_metrics(self):
        """Update derived metrics based on raw data."""
        if not quality_metrics["outputs"]:
            return
        
        # Calculate provenance coverage
        total_outputs = len(quality_metrics["outputs"])
        outputs_with_provenance = sum(1 for o in quality_metrics["outputs"] if o["has_provenance"])
        provenance_coverage = outputs_with_provenance / total_outputs if total_outputs > 0 else 0
        
        # Calculate hallucination rate (outputs without sources)
        outputs_without_sources = sum(1 for o in quality_metrics["outputs"] if not o["sources"])
        hallucination_rate = outputs_without_sources / total_outputs if total_outputs > 0 else 0
        
        # Calculate duplicate ratio
        duplicates = sum(1 for o in quality_metrics["outputs"] if o["is_duplicate"])
        duplicate_ratio = duplicates / total_outputs if total_outputs > 0 else 0
        
        # Calculate beacon validity
        valid_beacons = sum(1 for o in quality_metrics["outputs"] if o["beacon_valid"])
        beacon_validity = valid_beacons / total_outputs if total_outputs > 0 else 0
        
        # Store calculated metrics
        timestamp = datetime.utcnow().isoformat()
        
        quality_metrics["provenance_coverage"].append({
            "timestamp": timestamp,
            "value": provenance_coverage,
            "total_outputs": total_outputs
        })
        
        quality_metrics["hallucination_rate"].append({
            "timestamp": timestamp,
            "value": hallucination_rate,
            "total_outputs": total_outputs
        })
        
        quality_metrics["duplicate_ratio"].append({
            "timestamp": timestamp,
            "value": duplicate_ratio,
            "total_outputs": total_outputs
        })
        
        quality_metrics["beacon_validity"].append({
            "timestamp": timestamp,
            "value": beacon_validity,
            "total_outputs": total_outputs
        })
    
    def get_current_metrics(self) -> Dict:
        """Get current quality metrics."""
        if not self.metrics_enabled:
            return {"status": "disabled", "message": "Quality metrics are disabled"}
        
        # Get latest values
        latest_metrics = {}
        for metric_name in ["provenance_coverage", "hallucination_rate", "duplicate_ratio", "beacon_validity"]:
            if quality_metrics[metric_name]:
                latest = quality_metrics[metric_name][-1]
                latest_metrics[metric_name] = {
                    "value": latest["value"],
                    "timestamp": latest["timestamp"],
                    "total_outputs": latest.get("total_outputs", 0)
                }
            else:
                latest_metrics[metric_name] = {"value": 0, "timestamp": None, "total_outputs": 0}
        
        # Calculate rollback rate
        if quality_metrics["rollback_rate"]:
            recent_rollbacks = len([
                r for r in quality_metrics["rollback_rate"]
                if datetime.fromisoformat(r["timestamp"]) > datetime.utcnow() - timedelta(days=7)
            ])
            recent_outputs = len([
                o for o in quality_metrics["outputs"]
                if datetime.fromisoformat(o["timestamp"]) > datetime.utcnow() - timedelta(days=7)
            ])
            rollback_rate = recent_rollbacks / recent_outputs if recent_outputs > 0 else 0
        else:
            rollback_rate = 0
        
        latest_metrics["rollback_rate"] = {
            "value": rollback_rate,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Calculate Copilot overlap score
        if quality_metrics["copilot_overlap_score"]:
            recent_scores = [
                c["overlap_score"] for c in quality_metrics["copilot_overlap_score"]
                if datetime.fromisoformat(c["timestamp"]) > datetime.utcnow() - timedelta(days=7)
            ]
            copilot_overlap = sum(recent_scores) / len(recent_scores) if recent_scores else 0
        else:
            copilot_overlap = 0
        
        latest_metrics["copilot_overlap_score"] = {
            "value": copilot_overlap,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Overall health score
        health_score = (
            latest_metrics["provenance_coverage"]["value"] * 0.3 +
            (1 - latest_metrics["hallucination_rate"]["value"]) * 0.3 +
            (1 - latest_metrics["duplicate_ratio"]["value"]) * 0.2 +
            latest_metrics["beacon_validity"]["value"] * 0.2
        )
        
        return {
            "status": "enabled",
            "health_score": health_score,
            "metrics": latest_metrics,
            "targets": {
                "provenance_coverage": 0.9,
                "hallucination_rate": 0.1,
                "duplicate_ratio": 0.05,
                "beacon_validity": 0.95,
                "copilot_overlap": 0.5
            },
            "total_outputs": len(quality_metrics["outputs"]),
            "quarantined_items": len(quality_metrics["quarantined_items"])
        }
    
    def get_historical_metrics(self, hours: int = 24) -> Dict:
        """Get historical metrics for the specified time period."""
        if not self.metrics_enabled:
            return {"status": "disabled"}
        
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        historical = {}
        for metric_name in ["provenance_coverage", "hallucination_rate", "duplicate_ratio", "beacon_validity"]:
            historical[metric_name] = [
                record for record in quality_metrics[metric_name]
                if datetime.fromisoformat(record["timestamp"]) > cutoff
            ]
        
        return {
            "status": "enabled",
            "period_hours": hours,
            "metrics": historical
        }

# Global service instance
quality_service = QualityMetricsService()

@router.get("/")
def get_quality_metrics():
    """Get current quality metrics and health status."""
    return quality_service.get_current_metrics()

@router.get("/historical")
def get_historical_metrics(hours: int = 24):
    """Get historical quality metrics."""
    return quality_service.get_historical_metrics(hours)

@router.post("/record-output")
def record_output(
    output_data: dict,
    has_provenance: bool = False,
    sources: Optional[List[str]] = None,
    is_duplicate: bool = False,
    is_quarantined: bool = False,
    beacon_valid: bool = True
):
    """Record a new output for quality tracking."""
    quality_service.record_output(
        output_data=output_data,
        has_provenance=has_provenance,
        sources=sources,
        is_duplicate=is_duplicate,
        is_quarantined=is_quarantined,
        beacon_valid=beacon_valid
    )
    return {"status": "recorded"}

@router.post("/record-copilot-overlap")
def record_copilot_overlap(pr_id: str, overlap_score: float):
    """Record Copilot overlap score for a PR."""
    quality_service.record_copilot_overlap(pr_id, overlap_score)
    return {"status": "recorded"}

@router.post("/record-rollback")
def record_rollback(reason: str, output_hash: Optional[str] = None):
    """Record a rollback event."""
    quality_service.record_rollback(reason, output_hash)
    return {"status": "recorded"}

@router.get("/health")
def quality_health():
    """Health check for quality metrics system."""
    return {
        "status": "ok" if quality_service.metrics_enabled else "disabled",
        "enabled": quality_service.metrics_enabled,
        "retention_days": quality_service.retention_days,
        "total_records": sum(len(records) for records in quality_metrics.values() if isinstance(records, list))
    }