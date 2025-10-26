"""
Civic OS Gateway Configuration
AUREA + ATLAS Unified Settings
"""
import os

CFG = {
    "JWT_ALG": os.getenv("JWT_ALG", "HS256"),
    "JWT_KEY": os.getenv("JWT_KEY", "dev-insecure-key-change-in-production"),
    "GI_GATE": float(os.getenv("GI_GATE", "0.95")),
    
    # Upstream services
    "UP": {
        "ledger": os.getenv("UP_LEDGER", "http://ledger:8000"),
        "oaa": os.getenv("UP_OAA", "http://oaa:8000"),
        "reflections": os.getenv("UP_REFLECTIONS", "http://reflections:8000"),
        "shield": os.getenv("UP_SHIELD", "http://shield:8000"),
        "gic": os.getenv("UP_GIC", "http://gic:8000"),
    },
    
    # Feature flags (ATLAS enhancements)
    "FF_CONSTITUTIONAL": os.getenv("FF_CONSTITUTIONAL", "1") == "1",
    "FF_EVENT_ATTEST": os.getenv("FF_EVENT_ATTEST", "1") == "1",
    
    # ATLAS-specific config
    "CHARTER_URL": os.getenv("CHARTER_URL", "https://hive-api-2le8.onrender.com"),
    "NATS_URL": os.getenv("NATS_URL", "nats://localhost:4222"),
}

