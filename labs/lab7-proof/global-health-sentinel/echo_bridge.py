#!/usr/bin/env python3
"""
Echo Bridge — unifies service telemetry into a single Echo Pulse and
optionally posts it to OAA (Lab7) and Civic Ledger.

Inputs:
  - Health endpoints for Labs 4/6/7, Civic Ledger, GIC Indexer
  - Optional: Global Health Pulse payload (from pulse_sentinel.py)

Outputs:
  - echo_pulse (JSON) with fingerprint_sha256
  - Optional POST to Lab7 OAA and Civic Ledger
"""
from __future__ import annotations
import os, time, json, hashlib, pathlib
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import requests

# ---------- Config via ENV ----------
LAB4_URL   = os.getenv("LAB4_URL",   "https://hive-api-2le8.onrender.com/health")
LAB6_URL   = os.getenv("LAB6_URL",   "https://lab6-proof-api.onrender.com/health")
LEDGER_URL = os.getenv("LEDGER_URL", "https://civic-protocol-core-ledger.onrender.com/health")
GIC_URL    = os.getenv("GIC_URL",    "https://gic-indexer.onrender.com/health")
LAB7_URL   = os.getenv("LAB7_URL",   "https://lab7-proof.onrender.com/health")

# Optional posting targets
OAA_INGEST_URL   = os.getenv("OAA_INGEST_URL",   "https://lab7-proof.onrender.com/oaa/ingest/snapshot")
LEDGER_ATTEST_URL= os.getenv("LEDGER_ATTEST_URL","")  # e.g., https://civic-protocol-core-ledger.onrender.com/ledger/attest
BEARER           = os.getenv("ECHO_BEARER", "")

TIMEOUT_SEC      = int(os.getenv("TIMEOUT_SEC", "10"))
RETRY_COUNT      = int(os.getenv("RETRY_COUNT", "1"))
LOG_DIR          = os.getenv("ECHO_LOG_DIR", "./echo_logs")

pathlib.Path(LOG_DIR).mkdir(parents=True, exist_ok=True)

def utcnow_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

@dataclass
class ServiceCheck:
    name: str
    url: str
    status: str
    latency_ms: Optional[float]
    error: Optional[str]

def http_health(name: str, url: str) -> ServiceCheck:
    t0 = time.perf_counter()
    try:
        r = requests.get(url, timeout=TIMEOUT_SEC)
        latency = round((time.perf_counter() - t0) * 1000, 2)
        if r.ok:
            return ServiceCheck(name, url, "UP", latency, None)
        return ServiceCheck(name, url, "DOWN", latency, f"HTTP {r.status_code}")
    except Exception as e:
        return ServiceCheck(name, url, "DOWN", None, str(e))

def check_core_services() -> List[ServiceCheck]:
    checks = []
    for name, url in [
        ("Lab4", LAB4_URL),
        ("Lab6", LAB6_URL),
        ("CivicLedger", LEDGER_URL),
        ("GICIndexer", GIC_URL),
        ("Lab7", LAB7_URL),
    ]:
        c = http_health(name, url)
        if c.status == "DOWN" and RETRY_COUNT > 0:
            c = http_health(name, url)  # quick retry
        checks.append(c)
    return checks

def load_latest_global_pulse(p: str = "./global-health-sentinel/attestations") -> Optional[Dict[str, Any]]:
    """Optionally decorate the Echo pulse with the most recent Global Health attestation."""
    try:
        d = pathlib.Path(p)
        if not d.exists(): return None
        files = sorted(d.glob("attestation_*.json"))
        if not files: return None
        return json.loads(files[-1].read_text())
    except Exception:
        return None

def build_echo_pulse(global_health: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    checks = check_core_services()
    services = {c.name: {"status": c.status, "latency_ms": c.latency_ms, "error": c.error} for c in checks}
    pulse = {
        "timestamp": utcnow_iso(),
        "kind": "echo_heartbeat",
        "services": services,
        "global_health": {
            "attached": bool(global_health),
            "fingerprint_sha256": global_health.get("fingerprint_sha256") if global_health else None
        },
        "summary": {
            "up": [c.name for c in checks if c.status == "UP"],
            "down": [c.name for c in checks if c.status == "DOWN"],
        }
    }
    pulse_str = json.dumps(pulse, sort_keys=True)
    pulse["fingerprint_sha256"] = sha256_hex(pulse_str)
    return pulse

def save_pulse(pulse: Dict[str, Any]) -> str:
    ts = pulse["timestamp"].replace(":", "").replace("-", "")
    p = pathlib.Path(LOG_DIR) / f"echo_{ts}.json"
    p.write_text(json.dumps(pulse, indent=2))
    return str(p)

def _headers():
    h = {"Content-Type": "application/json"}
    if BEARER: h["Authorization"] = f"Bearer {BEARER}"
    return h

def post_oaa(pulse: Dict[str, Any]) -> Dict[str, Any]:
    if not OAA_INGEST_URL: return {"status": "skipped"}
    try:
        r = requests.post(OAA_INGEST_URL, headers=_headers(), json=pulse, timeout=15)
        return {"status": r.status_code, "text": r.text[:200]}
    except Exception as e:
        return {"status": "error", "text": str(e)}

def post_ledger(pulse: Dict[str, Any]) -> Dict[str, Any]:
    if not LEDGER_ATTEST_URL: return {"status": "skipped"}
    body = {"kind":"echo_heartbeat","payload":pulse}
    try:
        r = requests.post(LEDGER_ATTEST_URL, headers=_headers(), json=body, timeout=15)
        return {"status": r.status_code, "text": r.text[:200]}
    except Exception as e:
        return {"status": "error", "text": str(e)}

def run_once(attach_global: bool = True):
    gh = load_latest_global_pulse() if attach_global else None
    pulse = build_echo_pulse(gh)
    path = save_pulse(pulse)
    oaa_res = post_oaa(pulse)
    ledger_res = post_ledger(pulse)
    # Console summary
    lines = [f"[Echo] {pulse['timestamp']}  SHA256={pulse['fingerprint_sha256']}  saved={path}"]
    for name, data in pulse["services"].items():
        lines.append(f" - {name}: {data['status']}  latency={data['latency_ms']} ms  err={data['error']}")
    lines.append(f"→ OAA post: {oaa_res['status']}  → Ledger post: {ledger_res['status']}")
    print("\n".join(lines))

if __name__ == "__main__":
    run_once()

