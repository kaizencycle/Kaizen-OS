#!/usr/bin/env python3
import os, sys, json, glob, argparse

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--increment", type=int, default=5, help="percent points to increase")
    ap.add_argument("--max", dest="max_pct", type=int, default=25, help="cap percent for canary")
    ap.add_argument("--glob", default=os.getenv("ZEUS_CARD_GLOB", "ledger/model_cards/*.json"))
    args = ap.parse_args()

    cards = sorted(glob.glob(args.glob))
    if not cards:
        print(f"::error::No model cards found for glob: {args.glob}")
        sys.exit(1)
    path = cards[-1]
    data = json.load(open(path))

    rollout = data.setdefault("rollout", {})
    mode = rollout.get("mode", "shadow")
    pct = int(rollout.get("traffic_pct", 0))

    if mode == "shadow" and pct == 0:
        mode = "canary"
        pct = max(args.increment, 1)
    else:
        if mode != "canary":
            mode = "canary"
        pct = min(pct + args.increment, args.max_pct)

    rollout["mode"] = mode
    rollout["traffic_pct"] = pct
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

    with open("CANARY_BUMP_SUMMARY.md", "w") as f:
        f.write("# Canary Traffic Bump\n")
        f.write(f"- Card: {path}\n")
        f.write(f"- New rollout.mode: {mode}\n")
        f.write(f"- New rollout.traffic_pct: {pct}%\n")

    print(f"Bumped canary to {pct}% on {path}")

if __name__ == "__main__":
    main()

