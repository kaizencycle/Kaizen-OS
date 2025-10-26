#!/usr/bin/env python3
import os, sys, json, glob

def main():
    card_glob = os.getenv("ZEUS_CARD_GLOB", "ledger/model_cards/*.json")
    cards = sorted(glob.glob(card_glob))
    if not cards:
        print(f"::error::No model cards found for glob: {card_glob}")
        sys.exit(1)
    path = cards[-1]
    data = json.load(open(path))

    rollout = data.setdefault("rollout", {})
    rollout["mode"] = "full"
    rollout["traffic_pct"] = 100

    with open(path, "w") as f:
        json.dump(data, f, indent=2)

    with open("PROMOTE_FULL_SUMMARY.md", "w") as f:
        f.write("# Promote to Full Rollout\n")
        f.write(f"- Card: {path}\n")
        f.write(f"- New rollout.mode: full\n")
        f.write(f"- New rollout.traffic_pct: 100%\n")

    print(f"Promoted rollout to 100% on {path}")

if __name__ == "__main__":
    main()

