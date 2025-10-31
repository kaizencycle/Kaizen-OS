#!/usr/bin/env python3
"""
GI Aggregator - Tracks Global Integrity metrics from IntegrityEvents
Provides rolling GI, per-gate deltas, fairness tallies, and DP burn metrics
"""

from __future__ import annotations
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, List
from collections import defaultdict, deque

ROLLING_WINDOW_MIN = 1440  # 24h @ 1min bins
BIN_SECONDS = 60

class Ring:
    """Time-binned ring buffer for fast rolling aggregations"""
    def __init__(self, bins: int):
        self.bins = bins
        self.bucket = [0.0] * bins
        self.ts0 = int(time.time() // BIN_SECONDS)

    def _idx(self, ts: int) -> int:
        now_bin = ts // BIN_SECONDS
        shift = now_bin - self.ts0
        if shift > 0:
            shift = min(shift, self.bins)
            self.bucket = ([0.0] * shift) + self.bucket[:-shift]
            self.ts0 = now_bin
        return 0

    def add(self, ts: int, v: float):
        i = self._idx(ts)
        self.bucket[i] += v

    def sum(self) -> float:
        return float(sum(self.bucket))

    def values(self) -> List[float]:
        return list(self.bucket)

class GIAggregator:
    """Aggregates IntegrityEvents → GI state"""

    def __init__(self, gi_baseline: float = 0.90):
        self.gi_baseline = gi_baseline
        self.gi_current = gi_baseline
        self.delta_ring = Ring(ROLLING_WINDOW_MIN)
        self.dp_ring = Ring(ROLLING_WINDOW_MIN)
        self.counts = defaultdict(int)
        self.gate_delta = defaultdict(float)
        self.window_events = deque(maxlen=5000)
        self.justice = {
            "disparate_impact_ratio": None,
            "gi_outcome_parity": None,
            "wait_time_parity": None,
            "gic_distribution_parity": None,
            "last_failure": None,
        }

    def _ts(self, iso: str) -> int:
        try:
            return int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp())
        except Exception:
            return int(time.time())

    def ingest(self, event: Dict[str, Any]) -> None:
        """Ingest a single IntegrityEvent"""
        ts = self._ts(event.get("ts", datetime.now(timezone.utc).isoformat()))
        gate = event.get("gate", "Unknown")
        kind = event.get("kind", "report")

        delta = float((event.get("metrics") or {}).get("gi_delta", 0.0))
        self.gi_current = max(0.0, min(1.0, self.gi_current + delta))
        self.delta_ring.add(ts, delta)
        self.gate_delta[gate] += delta

        eps = float((event.get("privacy") or {}).get("epsilon", 0.0))
        self.dp_ring.add(ts, eps)

        self.counts[f"{gate}|{kind}"] += 1
        self.counts[f"kind|{kind}"] += 1
        self.counts[f"gate|{gate}"] += 1

        if gate == "Justice":
            det = event.get("details", {})
            if det.get("status") == "failed":
                self.justice["last_failure"] = {
                    "cycle": event.get("cycle"),
                    "reason": det.get("reason")
                }

        self.window_events.append({
            "id": event.get("id"),
            "gate": gate,
            "kind": kind,
            "gi_delta": delta,
            "epsilon": eps,
            "ts": ts
        })

    def snapshot_summary(self) -> Dict[str, Any]:
        return {
            "gi": {
                "baseline": self.gi_baseline,
                "current": round(self.gi_current, 6),
                "rolling_delta_24h": round(self.delta_ring.sum(), 6),
            },
            "dp": {
                "epsilon_24h": round(self.dp_ring.sum(), 6),
            },
            "counts": dict(self.counts),
            "gate_delta": {k: round(v, 6) for k, v in self.gate_delta.items()},
            "justice": self.justice,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

    def snapshot_timeseries(self) -> Dict[str, Any]:
        return {
            "window_minutes": ROLLING_WINDOW_MIN,
            "bin_seconds": BIN_SECONDS,
            "gi_delta_bins": self.delta_ring.values(),
            "epsilon_bins": self.dp_ring.values(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

# Singleton for app
AGG = GIAggregator()
