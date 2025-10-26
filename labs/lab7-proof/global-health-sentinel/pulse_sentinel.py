#!/usr/bin/env python3
import os, json, time, hashlib, pathlib
from datetime import datetime, timezone

# ---- Configure via ENV or edit below ----
REGIONS = os.getenv("GHS_REGIONS", "US,EU,JP").split(",")
LOG_DIR = os.getenv("GHS_LOG_DIR", "./logs")
ATT_DIR = os.getenv("GHS_ATT_DIR", "./attestations")
OAA_POST_URL = os.getenv("GHS_OAA_URL", "")   # e.g., https://lab7-proof.onrender.com/oaa/ingest/snapshot
LEDGER_POST_URL = os.getenv("GHS_LEDGER_URL", "")  # e.g., https://civic-protocol-core-ledger.onrender.com/ledger/attest
BEARER = os.getenv("GHS_BEARER", "")

# Validation & Shield
SCHEMA_PATH = os.getenv("GHS_SCHEMA_PATH", "./schema/pulse.schema.json")
ENFORCE_SCHEMA = os.getenv("GHS_ENFORCE_SCHEMA", "1") == "1"
ENFORCE_SHIELD = os.getenv("GHS_ENFORCE_SHIELD", "1") == "1"

pathlib.Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
pathlib.Path(ATT_DIR).mkdir(parents=True, exist_ok=True)

def utcnow_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def sample_signals(regions):
    # TODO: Replace with real fetchers/parsers gated by Citizen Shield policies.
    epidemic, climate = [], []
    for r in regions:
        epidemic.append({"region": r, "indicator": "admissions_index", "value": 0.42, "delta_7d": 0.03, "confidence": 0.7, "source": "sample"})
        climate.append({"region": r, "indicator": "AQI", "value": 52, "delta_7d": -4, "confidence": 0.8, "source": "sample"})
    return epidemic, climate

def build_pulse():
    ts = utcnow_iso()
    epidemic, climate = sample_signals(REGIONS)
    payload = {
        "timestamp": ts,
        "regions": [{"code": r} for r in REGIONS],
        "signals": {"epidemic": epidemic, "climate_health": climate},
        "risk_flags": [{"region": "US", "level": "MODERATE", "reason": "Admissions_index +3bps / 7d"}],
        "summary": {
            "headline": "Stable conditions with localized upticks",
            "one_liner": "No global alarm; monitor US admissions trend.",
            "analyst_notes": "Replace sample data with real feeds gated by Lab6 Citizen Shield."
        }
    }
    # Fingerprint
    fstr = json.dumps(payload, sort_keys=True)
    payload["fingerprint_sha256"] = sha256_hex(fstr)
    return payload

def write_log(pulse):
    p = pathlib.Path(LOG_DIR) / f"pulse_{pulse['timestamp'][:10]}.jsonl"
    with open(p, "a", encoding="utf-8") as f:
        f.write(json.dumps(pulse, separators=(",", ":")) + "\n")

def save_attestation(pulse):
    ts = pulse["timestamp"].replace(":", "").replace("-", "")
    p = pathlib.Path(ATT_DIR) / f"attestation_{ts}.json"
    with open(p, "w", encoding="utf-8") as f:
        json.dump(pulse, f, indent=2)
    return str(p)

def maybe_post(url, payload):
    if not url:
        return {"status": "skipped"}
    import requests
    headers = {"Content-Type": "application/json"}
    if BEARER:
        headers["Authorization"] = f"Bearer {BEARER}"
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=15)
        return {"status": r.status_code, "text": r.text[:200]}
    except Exception as e:
        return {"status": "error", "text": str(e)}

def run_once():
    pulse = build_pulse()
    
    # Validate schema
    if ENFORCE_SCHEMA:
        from validate import validate_payload
        errs = validate_payload(pulse, SCHEMA_PATH)
        if errs:
            print("[DENY] Schema validation failed:")
            for e in errs: print(" -", e)
            # still log the attempt, but do NOT attest
            write_log({"timestamp": pulse["timestamp"], "denied": "schema", "errors": errs})
            return

    # Shield precheck
    if ENFORCE_SHIELD:
        from shield_policy import shield_precheck
        gate = shield_precheck(pulse)
        if not gate["ok"]:
            print("[DENY] Citizen Shield pre-check failed:")
            for e in gate["errors"]: print(" -", e)
            write_log({"timestamp": pulse["timestamp"], "denied": "shield", "errors": gate["errors"]})
            return
    
    write_log(pulse)
    att_path = save_attestation(pulse)
    oaa_res = maybe_post(OAA_POST_URL, pulse)
    ledger_res = maybe_post(LEDGER_POST_URL, {"kind":"global_health_pulse","payload":pulse})
    print(f"[Pulse] {pulse['timestamp']}  SHA256={pulse['fingerprint_sha256']}  saved={att_path}")
    print(f"→ OAA post: {oaa_res['status']}  → Ledger post: {ledger_res['status']}")

if __name__ == "__main__":
    run_once()

