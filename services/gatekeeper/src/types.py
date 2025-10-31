"""Type definitions for Gatekeeper service."""
from pydantic import BaseModel, Field
from typing import Literal, Optional

RiskLevel = Literal["low", "medium", "high", "critical"]

class ExecRequest(BaseModel):
    """Request model for executing privileged actions."""
    actor_did: str = Field(..., description="DID of the actor making the request")
    action: Literal["execute_script", "http_request", "db_query", "mint_gic", "write_file"] = Field(
        ..., description="Type of action to execute"
    )
    risk: RiskLevel = Field(default="low", description="Risk level of the action")
    payload: dict = Field(..., description="Action-specific payload")
    context_hash: str = Field(..., description="Hash of the request context")
    ttl_seconds: int = Field(default=30, description="Time-to-live for the request token")

class ExecResponse(BaseModel):
    """Response model for execution results."""
    status: Literal["ok", "blocked"]
    attestation_tx: Optional[str] = Field(None, description="Transaction hash of the attestation")
    result_preview: Optional[str] = Field(None, description="Preview of the execution result")
