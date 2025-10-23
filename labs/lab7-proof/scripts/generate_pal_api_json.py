#!/usr/bin/env python3
import os, glob, json, datetime, hashlib

CARD_GLOB = os.getenv("PAL_CARD_GLOB", "ledger/model_cards/*.json")
API_DIR   = os.getenv("API_DIR", "docs/api")

def latest_card():
    paths = sorted(glob.glob(CARD_GLOB))
    if not paths:
        return None, None
    p = paths[-1]
    with open(p) as f:
        data = json.load(f)
    return p, data

def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print("wrote", path)

def main():
    src, card = latest_card()
    now = datetime.datetime.utcnow().isoformat() + "Z"
    if not card:
        empty = {
            "ok": False,
            "message": "no model cards yet",
            "updated": now,
        }
        write_json(os.path.join(API_DIR, "status.json"), empty)
        write_json(os.path.join(API_DIR, "rollout.json"), {"mode":"shadow","traffic_pct":0,"updated":now})
        write_json(os.path.join(API_DIR, "safety.json"), {"score": None, "updated": now})
        return

    metrics = card.get("metrics", {})
    rollout = card.get("rollout", {})
    version = card.get("version","v?")

    # Common envelope
    env = {
        "ok": True,
        "version": version,
        "source": src,
        "updated": now,
    }

    # Build JSON docs
    status = {
        **env,
        "metrics": metrics,
        "rollout": rollout,
    }
    rollout_doc = {
        **env,
        "mode": rollout.get("mode","shadow"),
        "traffic_pct": rollout.get("traffic_pct", 0),
    }
    safety_doc = {
        **env,
        "score": metrics.get("safety_score", None),
    }

    write_json(os.path.join(API_DIR, "status.json"), status)
    write_json(os.path.join(API_DIR, "rollout.json"), rollout_doc)
    write_json(os.path.join(API_DIR, "safety.json"), safety_doc)

if __name__ == "__main__":
    main()
