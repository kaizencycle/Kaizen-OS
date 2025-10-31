#!/usr/bin/env python3
"""
Integrity Event Emitter - Dynamic Ledger Writer for Lab 5
Enforces DP budget, computes GI deltas, signs events with Ed25519, posts to Civic Ledger
"""

import os
import json
import time
import hashlib
import logging
import pathlib
from typing import Any, Dict, Optional, Tuple
from dataclasses import dataclass

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
LOG = logging.getLogger("integrity_emitter")

# Configuration
LEDGER_BASE_URL = os.getenv("CIVIC_LEDGER_BASE_URL", "https://civic-protocol-core-ledger.onrender.com")
LEDGER_ATTEST_ENDPOINT = os.getenv("LEDGER_ATTEST_PATH", "/ledger/attest")
LEDGER_API = f"{LEDGER_BASE_URL.rstrip('/')}{LEDGER_ATTEST_ENDPOINT}"

DP_BUDGET_PATH = pathlib.Path(os.getenv("DP_BUDGET_PATH", "data/dp_budget.json"))
DP_DEFAULT_EPSILON = float(os.getenv("DP_DEFAULT_EPSILON", "0.5"))
DP_EPSILON_FLOOR = float(os.getenv("DP_EPSILON_FLOOR", "0.05"))

MAX_RETRIES = int(os.getenv("EMITTER_MAX_RETRIES", "3"))
RETRY_BACKOFF_SEC = float(os.getenv("EMITTER_RETRY_BACKOFF_SEC", "1.2"))

@dataclass
class EmitterResult:
    success: bool
    status: int
    ledger_ref: Optional[str]
    error: Optional[str]
    payload_hash: str

class DPBudgetManager:
    """Minimal DP budget manager: subtracts epsilon per event type per cycle."""
    def __init__(self, path: pathlib.Path):
        self.path = path
        self._data: Dict[str, Any] = {}
        self._load()

    def _load(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists():
            try:
                self._data = json.loads(self.path.read_text(encoding="utf-8"))
            except Exception:
                self._data = {}

    def _save(self):
        self.path.write_text(json.dumps(self._data, indent=2), encoding="utf-8")

    def take(self, cycle: str, epsilon_cost: float) -> bool:
        if epsilon_cost <= 0:
            return True
        cycle_budget = self._data.get(cycle, {"epsilon_remaining": DP_DEFAULT_EPSILON})
        remaining = float(cycle_budget.get("epsilon_remaining", DP_DEFAULT_EPSILON))
        if remaining - epsilon_cost < DP_EPSILON_FLOOR:
            return False
        cycle_budget["epsilon_remaining"] = remaining - epsilon_cost
        self._data[cycle] = cycle_budget
        self._save()
        return True

    def remaining(self, cycle: str) -> float:
        return float(self._data.get(cycle, {}).get("epsilon_remaining", DP_DEFAULT_EPSILON))

DP = DPBudgetManager(DP_BUDGET_PATH)

def canonical_json(obj: Dict[str, Any]) -> bytes:
    """Deterministic JSON encoder"""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

def sha256_hex(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def calculate_gi_change(event: Dict[str, Any]) -> float:
    """Apply HVC rule effect to compute GI delta"""
    metrics = event.get("metrics") or {}
    recommended = metrics.get("gi_recommended_delta")
    if isinstance(recommended, (int, float)):
        return float(recommended)

    gate = event.get("gate")
    kind = event.get("kind")
    current_gi = float(metrics.get("gi_baseline", 0.90))

    if gate == "NonMaleficence" and kind == "violation":
        factor = float(metrics.get("gi_penalty_factor", 0.99))
        return current_gi * (factor - 1.0)

    if gate == "Beneficence" and kind == "reward":
        return float(metrics.get("gi_reward_factor", 0.01))

    if gate == "Justice" and kind in ("remediation", "report"):
        return float(metrics.get("gi_reward_factor", 0.002))

    if gate == "Autonomy" and kind == "violation":
        factor = float(metrics.get("gi_penalty_factor", 0.999))
        return current_gi * (factor - 1.0)

    return 0.0

def enforce_dp_consumption(event: Dict[str, Any]) -> bool:
    """Consume epsilon from cycle budget"""
    cycle = (event.get("meta") or {}).get("cycle", "C-UNSPEC")
    privacy = event.get("privacy") or {}
    epsilon = float(privacy.get("epsilon", DP_DEFAULT_EPSILON))
    ok = DP.take(cycle, epsilon)
    if not ok:
        LOG.warning("DP budget exhausted for cycle %s", cycle)
    return ok

def attest_and_emit(event: Dict[str, Any]) -> EmitterResult:
    """Canonicalize -> hash -> sign -> POST to ledger (simplified - no signing in this version)"""
    body = canonical_json(event)
    payload_hash = sha256_hex(body)

    envelope = {
        "type": "integrity.event/v1",
        "id": event.get("id", f"evt_{int(time.time())}"),
        "payload": event,
        "attestation": {
            "hash": payload_hash,
            "algo": "sha256",
        },
        "timestamp": int(time.time()),
    }

    headers = {"Content-Type": "application/json"}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(LEDGER_API, json=envelope, headers=headers, timeout=10)
            if 200 <= resp.status_code < 300:
                data = resp.json() if resp.text else {}
                ledger_ref = data.get("ref", f"{LEDGER_API}#{envelope['id']}")
                return EmitterResult(True, resp.status_code, ledger_ref, None, payload_hash)
            else:
                LOG.warning("Ledger write failed (status=%s)", resp.status_code)
        except Exception as e:
            LOG.warning("Ledger write exception (attempt %d/%d): %s", attempt, MAX_RETRIES, e)
        time.sleep(RETRY_BACKOFF_SEC * attempt)

    return EmitterResult(False, 503, None, "Ledger unreachable", payload_hash)

def process_integrity_event(event: Dict[str, Any]) -> EmitterResult:
    """Full pipeline: DP gate -> GI delta -> emit"""
    if not enforce_dp_consumption(event):
        return EmitterResult(False, 429, None, "DP budget exhausted", sha256_hex(canonical_json(event)))

    delta = calculate_gi_change(event)
    if "metrics" not in event:
        event["metrics"] = {}
    event["metrics"]["gi_delta"] = delta

    return attest_and_emit(event)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Integrity Event Emitter")
    parser.add_argument("--from-json", type=str, required=True)
    args = parser.parse_args()

    path = pathlib.Path(args.from_json)
    data = json.loads(path.read_text())
    events = [data] if isinstance(data, dict) else list(data)

    LOG.info("Emitting %d event(s) to ledger: %s", len(events), LEDGER_API)
    successes = 0
    for evt in events:
        res = process_integrity_event(evt)
        if res.success:
            successes += 1
            LOG.info("OK hash=%s", res.payload_hash[:12])
        else:
            LOG.error("FAIL hash=%s err=%s", res.payload_hash[:12], res.error)

    LOG.info("Done. %d/%d succeeded.", successes, len(events))
