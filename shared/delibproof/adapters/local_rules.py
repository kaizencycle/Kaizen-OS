"""Static rule-based checks for quick local validation."""
from typing import Dict, List

# Static rules for common high-risk patterns
RISKY_PATTERNS = [
    "rm -rf",
    "delete database",
    "drop table",
    "shutdown",
    "format",
    "mkfs",
]

def quick_check(payload: dict) -> Dict:
    """
    Perform quick static checks on payload before consulting sentinels.
    
    Args:
        payload: Request payload to check
        
    Returns:
        Dictionary with check result:
        {
            "ok": bool,
            "reason": str,
            "confidence": float,
        }
    """
    payload_str = str(payload).lower()
    
    # Check for risky patterns
    for pattern in RISKY_PATTERNS:
        if pattern in payload_str:
            return {
                "ok": False,
                "reason": f"Static check failed: risky pattern '{pattern}' detected",
                "confidence": 1.0,
            }
    
    # Check for action type
    action = payload.get("action", "")
    if action in ["execute_script", "mint_gic"]:
        # High-risk actions should always go through sentinels
        return {
            "ok": None,  # Unknown - requires sentinel consensus
            "reason": "High-risk action requires sentinel consensus",
            "confidence": 0.0,
        }
    
    # Low-risk actions can pass quick check
    if action in ["http_request"]:
        return {
            "ok": True,
            "reason": "Low-risk action passed quick check",
            "confidence": 0.8,
        }
    
    # Default: require sentinel consensus
    return {
        "ok": None,
        "reason": "Requires sentinel consensus",
        "confidence": 0.0,
    }

def check_action_permissions(actor_role: str, action: str) -> bool:
    """
    Quick RBAC check for action permissions.
    
    Args:
        actor_role: Role of the actor
        action: Action to check
        
    Returns:
        True if allowed, False otherwise
    """
    permissions = {
        "citizen": ["http_request"],
        "pro": ["http_request", "write_file"],
        "founder": ["http_request", "write_file", "db_query"],
        "sentinel": ["http_request", "write_file", "db_query", "execute_script", "mint_gic"],
    }
    
    return action in permissions.get(actor_role, [])
