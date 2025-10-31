#!/usr/bin/env python3
"""
Lab 3 - API Routes
FastAPI routes for Resource Orchestration
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Optional
from pydantic import BaseModel

# Import orchestrators
import sys
import pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))

from compute_allocation.orchestrator import ORCHESTRATOR, Priority
from financial_flows.manager import FINANCIAL_MANAGER

router = APIRouter(prefix="/lab3", tags=["resource-orchestration"])

# --- REQUEST MODELS ---

class ComputeAllocationRequest(BaseModel):
    citizen_did: str
    query_tokens: int
    priority: str = "standard"
    min_quality: float = 0.80
    max_cost_gic: Optional[float] = None
    preferred_provider: Optional[str] = None

class UsageReportRequest(BaseModel):
    citizen_did: str
    provider: str
    actual_cost: float
    success: bool

class TransferRequest(BaseModel):
    from_did: str
    to_did: str
    amount: float
    reason: str

class GrantRequest(BaseModel):
    recipient_did: str
    amount: float
    project: str

# --- COMPUTE ALLOCATION ROUTES ---

@router.post("/compute/allocate")
def allocate_compute(req: ComputeAllocationRequest):
    """Allocate compute resources for AI query"""
    try:
        priority_enum = Priority(req.priority)
    except ValueError:
        raise HTTPException(400, f"Invalid priority: {req.priority}")

    allocation = ORCHESTRATOR.allocate(
        citizen_did=req.citizen_did,
        query_tokens=req.query_tokens,
        priority=priority_enum,
        min_quality=req.min_quality,
        max_cost_gic=req.max_cost_gic,
        preferred_provider=req.preferred_provider
    )

    return {
        "provider": allocation.provider,
        "estimated_cost_gic": allocation.estimated_cost,
        "estimated_latency_ms": allocation.estimated_latency_ms,
        "quota_remaining": allocation.quota_remaining,
        "fallback_provider": allocation.fallback_provider,
        "reason": allocation.reason
    }

@router.post("/compute/report_usage")
def report_usage(req: UsageReportRequest):
    """Report actual compute usage after query completes"""
    ORCHESTRATOR.report_usage(
        req.citizen_did,
        req.provider,
        req.actual_cost,
        req.success
    )
    return {"ok": True}

@router.get("/compute/stats")
def get_compute_stats():
    """Get compute orchestrator statistics"""
    return ORCHESTRATOR.get_stats()

@router.get("/compute/quota/{citizen_did}")
def get_quota(citizen_did: str):
    """Get citizen's remaining quota"""
    remaining = ORCHESTRATOR._check_quota(citizen_did)
    return {
        "citizen_did": citizen_did,
        "quota_remaining_gic": remaining,
        "default_quota_gic": ORCHESTRATOR.default_quota
    }

# --- FINANCIAL FLOWS ROUTES ---

@router.post("/financial/transfer")
def transfer_gic(req: TransferRequest):
    """Transfer GIC between citizens"""
    tx = FINANCIAL_MANAGER.process_gic_transfer(
        req.from_did,
        req.to_did,
        req.amount,
        req.reason
    )
    return {
        "tx_id": tx.tx_id,
        "type": tx.type,
        "amount_gic": tx.amount_gic,
        "timestamp": tx.timestamp
    }

@router.post("/financial/grant")
def allocate_grant(req: GrantRequest):
    """Allocate public goods grant"""
    tx = FINANCIAL_MANAGER.allocate_public_goods_grant(
        req.recipient_did,
        req.amount,
        req.project
    )
    if not tx:
        raise HTTPException(400, "Insufficient PublicGoodsPool balance")

    return {
        "tx_id": tx.tx_id,
        "amount_gic": tx.amount_gic,
        "project": tx.metadata["project"],
        "pool_balance_remaining": FINANCIAL_MANAGER.public_goods_pool_balance
    }

@router.get("/financial/balance/{citizen_did}")
def get_balance(citizen_did: str):
    """Get citizen's GIC balance"""
    balance = FINANCIAL_MANAGER.get_balance(citizen_did)
    return {
        "citizen_did": citizen_did,
        "balance_gic": balance
    }

@router.get("/financial/pool")
def get_pool_stats():
    """Get PublicGoodsPool statistics"""
    return {
        "pool_balance_gic": FINANCIAL_MANAGER.public_goods_pool_balance,
        "total_gic_supply": FINANCIAL_MANAGER.total_gic_supply,
        "current_epoch": FINANCIAL_MANAGER.current_epoch,
        "epoch_length_days": FINANCIAL_MANAGER.epoch_length_days
    }

# --- HEALTH CHECK ---

@router.get("/health")
def health_check():
    """Lab 3 health check"""
    return {
        "status": "healthy",
        "lab": "Lab 3: Resource Orchestration",
        "modules": {
            "compute_allocation": "active",
            "financial_flows": "active",
            "energy_routing": "planned",
            "supply_chain": "planned",
            "labor_market": "planned",
            "maintenance": "planned"
        }
    }
