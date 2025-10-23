import yaml, os
from typing import Any

_policy_cache: dict[str, Any] | None = None

def load_policy(path: str | None = None) -> dict:
    global _policy_cache
    if _policy_cache: return _policy_cache
    p = path or os.getenv("SHIELD_POLICY_PATH", "./policy/shield.policy.yaml")
    with open(p, "r") as f:
        _policy_cache = yaml.safe_load(f) or {}
    return _policy_cache
