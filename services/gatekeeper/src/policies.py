"""RBAC policies and risk assessment rules."""
from typing import Literal, Set

# Role-based access control matrix
ROLE_MATRIX = {
    "citizen": {"http_request"},
    "pro": {"http_request", "write_file"},
    "founder": {"http_request", "write_file", "db_query"},
    "sentinel": {"http_request", "write_file", "db_query", "execute_script", "mint_gic"}
}

def allowed(actor_role: Literal["citizen", "pro", "founder", "sentinel"], action: str) -> bool:
    """
    Check if actor role is allowed to perform action.
    
    Args:
        actor_role: Role of the actor
        action: Action to check
        
    Returns:
        True if allowed, False otherwise
    """
    allowed_actions: Set[str] = ROLE_MATRIX.get(actor_role, set())
    return action in allowed_actions

def risk_requires_consensus(risk: str) -> bool:
    """
    Check if risk level requires DelibProof consensus.
    
    Args:
        risk: Risk level (low, medium, high, critical)
        
    Returns:
        True if consensus required
    """
    return risk in {"high", "critical"}

def get_action_risk(action: str) -> str:
    """
    Determine default risk level for an action.
    
    Args:
        action: Action type
        
    Returns:
        Default risk level
    """
    risk_map = {
        "execute_script": "high",
        "mint_gic": "critical",
        "db_query": "medium",
        "write_file": "medium",
        "http_request": "low",
    }
    return risk_map.get(action, "medium")
