#!/usr/bin/env python3
"""
Sentinel API - Autonomous Code Change Orchestration System

This API orchestrates four agents:
- Jade: Planner/Architect (writes plan + acceptance criteria)
- Eve: Reviewer/Safety (policy, secrets, licenses)
- Hermes: Implementer (edits files, runs tests, formats)
- Zeus: Gatekeeper (approvals/labels/automerge, rollback)
"""

import os
import json
import hmac
import hashlib
import tempfile
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import requests

# Configuration
SHARED_SECRET = os.getenv("SENTINEL_HMAC", "")
GITHUB_APP_ID = os.getenv("GH_APP_ID", "")
GITHUB_INSTALL_ID = os.getenv("GH_INSTALL_ID", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "your_github_personal_access_token")
RENDER_SERVICE_ID = os.getenv("RENDER_SERVICE_ID", "")
RENDER_API_KEY = os.getenv("RENDER_API_KEY", "")

# Agent modules
from .agents.jade import JadePlanner
from .agents.eve import EveReviewer
from .agents.hermes import HermesImplementer
from .agents.zeus import ZeusGatekeeper

app = FastAPI(
    title="Sentinel API",
    description="Autonomous Code Change Orchestration System",
    version="1.0.0"
)

# Initialize agents
jade = JadePlanner()
eve = EveReviewer()
hermes = HermesImplementer()
zeus = ZeusGatekeeper()

class TaskRequest(BaseModel):
    """Request model for agent tasks"""
    repo: str = Field(..., description="Repository in format 'owner/repo'")
    branch: str = Field(..., description="Target branch name")
    intent: str = Field(..., description="Intent description for the change")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="Policy constraints")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")

class TaskResponse(BaseModel):
    """Response model for agent tasks"""
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None
    pr_url: Optional[str] = None
    plan_id: Optional[str] = None

def verify_hmac(signature: str, body: bytes) -> bool:
    """Verify HMAC signature for request authentication"""
    if not SHARED_SECRET:
        return True  # Skip verification if no secret set
    
    expected_mac = hmac.new(
        SHARED_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_mac}", signature)

@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "service": "Sentinel API",
        "version": "1.0.0",
        "agents": ["Jade", "Eve", "Hermes", "Zeus"],
        "endpoints": {
            "dispatch": "/sentinel/dispatch",
            "status": "/sentinel/status",
            "health": "/sentinel/health"
        }
    }

@app.get("/sentinel/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/sentinel/status")
def status():
    """Get current system status"""
    return {
        "agents": {
            "jade": jade.get_status(),
            "eve": eve.get_status(),
            "hermes": hermes.get_status(),
            "zeus": zeus.get_status()
        },
        "config": {
            "github_app_configured": bool(GITHUB_APP_ID and GITHUB_INSTALL_ID),
            "render_configured": bool(RENDER_SERVICE_ID and RENDER_API_KEY),
            "hmac_configured": bool(SHARED_SECRET)
        }
    }

@app.post("/sentinel/dispatch", response_model=TaskResponse)
async def dispatch_task(
    task: TaskRequest,
    x_signature_256: str = Header(..., alias="X-Signature-256")
):
    """
    Main dispatch endpoint that orchestrates all four agents
    
    Flow:
    1. Jade creates a plan
    2. Eve reviews for safety/policy compliance
    3. If approved, Hermes implements and creates PR
    4. Zeus manages the PR lifecycle
    """
    try:
        # Verify request signature
        body = json.dumps(task.dict()).encode()
        if not verify_hmac(x_signature_256, body):
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Step 1: Jade creates plan
        plan_result = await jade.create_plan(
            intent=task.intent,
            repo=task.repo,
            constraints=task.constraints,
            context=task.context
        )
        
        if not plan_result["success"]:
            return TaskResponse(
                status="failed",
                message=f"Planning failed: {plan_result['error']}",
                plan_id=plan_result.get("plan_id")
            )
        
        plan_id = plan_result["plan_id"]
        plan_data = plan_result["plan"]
        
        # Step 2: Eve reviews plan
        review_result = await eve.review_plan(
            plan_id=plan_id,
            plan_data=plan_data,
            repo=task.repo
        )
        
        if not review_result["approved"]:
            return TaskResponse(
                status="rejected",
                message=f"Plan rejected: {review_result['reason']}",
                data={"review": review_result},
                plan_id=plan_id
            )
        
        # Step 3: Hermes implements and creates PR
        implementation_result = await hermes.implement_and_create_pr(
            plan_id=plan_id,
            plan_data=plan_data,
            repo=task.repo,
            branch=task.branch
        )
        
        if not implementation_result["success"]:
            return TaskResponse(
                status="failed",
                message=f"Implementation failed: {implementation_result['error']}",
                plan_id=plan_id
            )
        
        pr_url = implementation_result["pr_url"]
        
        # Step 4: Zeus takes over PR management
        zeus_result = await zeus.manage_pr(
            pr_url=pr_url,
            plan_id=plan_id,
            repo=task.repo
        )
        
        return TaskResponse(
            status="submitted",
            message="Task submitted successfully",
            pr_url=pr_url,
            plan_id=plan_id,
            data={
                "plan": plan_data,
                "review": review_result,
                "implementation": implementation_result,
                "zeus": zeus_result
            }
        )
        
    except Exception as e:
        return TaskResponse(
            status="error",
            message=f"Internal error: {str(e)}"
        )

@app.post("/sentinel/zeus/approve")
async def zeus_approve(
    pr_url: str,
    x_signature_256: str = Header(..., alias="X-Signature-256")
):
    """Manual approval endpoint for Zeus"""
    body = json.dumps({"pr_url": pr_url}).encode()
    if not verify_hmac(x_signature_256, body):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    result = await zeus.approve_pr(pr_url)
    return result

@app.post("/sentinel/zeus/rollback")
async def zeus_rollback(
    pr_url: str,
    x_signature_256: str = Header(..., alias="X-Signature-256")
):
    """Rollback endpoint for Zeus"""
    body = json.dumps({"pr_url": pr_url}).encode()
    if not verify_hmac(x_signature_256, body):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    result = await zeus.rollback_pr(pr_url)
    return result

@app.get("/sentinel/plans/{plan_id}")
def get_plan(plan_id: str):
    """Get plan details by ID"""
    plan = jade.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@app.get("/sentinel/prs")
def list_prs(repo: Optional[str] = None, status: Optional[str] = None):
    """List PRs managed by Sentinel"""
    return zeus.list_prs(repo=repo, status=status)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
