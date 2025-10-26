from datetime import datetime, timedelta
from .models import Source, SourceScore
from typing import Dict

def _clamp(x: float) -> float:
    return max(0.0, min(1.0, x))

def score_source(src: Source) -> SourceScore:
    # --- Heuristics (simple, transparent) ---
    # Provenance: has domain, owner, endpoints
    prov = 0.2
    if src.domain: prov += 0.3
    if src.owner and ("org" in src.owner or "contact" in src.owner): prov += 0.3
    if src.endpoints: prov += 0.2
    prov = _clamp(prov)

    # Permission: friendly open license or no license but public domain-ish
    lic = (src.license or "").lower()
    perm = 1.0 if lic in {"mit","apache-2.0","bsd-3-clause","cc-by-4.0","cc0"} else 0.7 if lic else 0.6

    # Freshness: recency of last_update in 180d window
    fresh = 0.5
    if src.last_update:
        delta = datetime.utcnow() - src.last_update
        days = delta.days
        if days <= 30: fresh = 0.95
        elif days <= 90: fresh = 0.85
        elif days <= 180: fresh = 0.75
        else: fresh = 0.5
    else:
        fresh = 0.6

    # Quality: quick proxy = presence of schema notes + rate limit metadata
    qual = 0.4
    if src.endpoints and any(e.schema for e in src.endpoints):
        qual += 0.3
    if "rate_limit" in src.meta:
        qual += 0.2
    if "uptime" in src.meta:
        try:
            up = float(src.meta["uptime"])
            qual += 0.1 * min(1.0, max(0.0, up))
        except:
            pass
    qual = _clamp(qual)

    # Safety: tag-based
    bad_tags = {"pii_leak","unsafe","malware","hate"}
    safe = 0.95 if not (set(src.tags) & bad_tags) else 0.2

    # Reputation: start neutral; can be fed from votes later
    rep = float(src.meta.get("reputation", 0.7))

    # Composite: weighted
    weights: Dict[str, float] = dict(
        provenance=0.20, permission=0.15, freshness=0.15, quality=0.20, safety=0.20, reputation=0.10
    )
    composite = (
        prov*weights["provenance"] + perm*weights["permission"] + fresh*weights["freshness"]
        + qual*weights["quality"] + safe*weights["safety"] + rep*weights["reputation"]
    )

    return SourceScore(
        source_id=src.id,
        scores=dict(
            provenance=round(prov,2),
            permission=round(perm,2),
            freshness=round(fresh,2),
            quality=round(qual,2),
            safety=round(safe,2),
            reputation=round(rep,2),
        ),
        composite=round(composite,3),
        policy_gate="review",  # updated by policy later
    )

