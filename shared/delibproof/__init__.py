"""DelibProof consensus wrapper for multi-agent validation in Kaizen OS."""

from .core import verdict, consensus_threshold, weighted_consensus
from .adapters.sentinel_http import ask, ask_all, ask_with_details
from .adapters.local_rules import quick_check, check_action_permissions

__all__ = [
    "verdict",
    "consensus_threshold",
    "weighted_consensus",
    "ask",
    "ask_all",
    "ask_with_details",
    "quick_check",
    "check_action_permissions",
]
