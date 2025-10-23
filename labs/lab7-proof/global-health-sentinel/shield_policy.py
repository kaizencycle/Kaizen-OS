# shield_policy.py
# Lightweight policy gate BEFORE attestation.
# Replace/extend with real Lab6 call if desired.

from typing import Dict, Any, List

DEFAULT_RULES = {
  "allow_regions": ["US","EU","JP","CN","IN","BR","ZA","AU","CA","UK"],
  "blocked_indicators": ["pii_leak","raw_identifiers"],
  "min_confidence": 0.5,
  "max_regions": 20,
  "max_items_per_signal": 200
}

def _scan_signal_items(items: List[Dict[str, Any]], rules, topic: str, errs: List[str]):
    if len(items) > rules["max_items_per_signal"]:
        errs.append(f"{topic}: too many items ({len(items)}>{rules['max_items_per_signal']})")
    for i, it in enumerate(items):
        region = it.get("region","")
        indicator = it.get("indicator","")
        conf = it.get("confidence",1.0)
        if rules["allow_regions"] and region not in rules["allow_regions"]:
            errs.append(f"{topic}[{i}]: region '{region}' not allowed")
        if indicator in rules["blocked_indicators"]:
            errs.append(f"{topic}[{i}]: indicator '{indicator}' blocked")
        if conf is not None and conf < rules["min_confidence"]:
            errs.append(f"{topic}[{i}]: confidence {conf} < {rules['min_confidence']}")

def shield_precheck(payload: Dict[str, Any], rules: Dict[str, Any] = None) -> Dict[str, Any]:
    """Return {'ok': bool, 'errors': [..], 'warnings': [..]}"""
    rules = rules or DEFAULT_RULES
    errors, warnings = [], []

    regions = [r.get("code","") for r in payload.get("regions",[])]
    if len(regions) > rules["max_regions"]:
        errors.append(f"regions: too many regions ({len(regions)}>{rules['max_regions']})")

    signals = payload.get("signals",{})
    epi = signals.get("epidemic",[])
    clim = signals.get("climate_health",[])
    _scan_signal_items(epi, rules, "epidemic", errors)
    _scan_signal_items(clim, rules, "climate_health", errors)

    # Example heuristic: stop if any indicator name suggests raw PII
    suspicious = [x for x in (epi+clim) if str(x.get("indicator","")).lower() in {"pii","email","phone"}]
    if suspicious:
        errors.append("suspicious indicator suggests potential PII content")

    return {"ok": len(errors)==0, "errors": errors, "warnings": warnings}
