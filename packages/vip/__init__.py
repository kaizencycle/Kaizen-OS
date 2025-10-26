"""
Vector Integrity Protocol (VIP) - Kaizen OS v1.0

Ensures every vector/embedding in Kaizen OS carries proof of integrity:
- Constitutional score validation
- GI (Good Intent) score validation  
- Ledger attestation
- Revalidation hooks for drift detection
"""

__version__ = "1.0.0"

from .validator import VIPValidator, VIPThresholds
from .embedder_adapter import VIPEmbedder
from .ledger_hooks import LedgerHooks

__all__ = [
    "VIPValidator",
    "VIPThresholds",
    "VIPEmbedder",
    "LedgerHooks",
]

