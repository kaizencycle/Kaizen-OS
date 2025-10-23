#!/usr/bin/env python3
"""Example Echo hook: send events into PAL ledger.
Integrate this in your event bus (e.g., after /v1/* handlers).
"""
import json, time, os, sys

EPISODES_PATH = os.environ.get("PAL_EPISODES_PATH", "ledger/episodes.jsonl")

def log_event(event_type: str, **payload):
    rec = {"type": event_type, "ts": time.time(), **payload}
    os.makedirs(os.path.dirname(EPISODES_PATH), exist_ok=True)
    with open(EPISODES_PATH, "a") as f:
        f.write(json.dumps(rec) + "\n")

if __name__ == "__main__":
    # toy demo
    log_event("decision", episode_id="demo-1", context={"task":"hello"}, action="default", uncertainty=0.5, policy_version="v1")
    log_event("explicit_feedback", episode_id="demo-1", thumbs="up")
    log_event("implicit_feedback", episode_id="demo-1", dwell_ms=2100, retries=0, errors=0)
    print("Wrote demo events to", EPISODES_PATH)

