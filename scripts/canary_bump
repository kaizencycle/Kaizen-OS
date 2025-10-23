#!/usr/bin/env python3
import os, sys, json, glob

def main():
    min_implicit = float(os.getenv("ZEUS_MIN_SUCCESS_IMPLICIT", "0.55"))
    min_safety   = float(os.getenv("ZEUS_MIN_SAFETY_SCORE", "0.97"))
    card_glob    = os.getenv("ZEUS_CARD_GLOB", "ledger/model_cards/*.json")

    cards = sorted(glob.glob(card_glob))
    if not cards:
        print(f"::error::No model cards found for glob: {card_glob}")
        sys.exit(1)

    card_path = cards[-1]
    data = json.load(open(card_path))
    metrics = data.get("metrics", {})
    success_implicit = metrics.get("success_implicit")
    safety_score = metrics.get("safety_score")

    print(f"Using card: {card_path}")
    print(f"success_implicit={success_implicit} (min {min_implicit})")
    print(f"safety_score={safety_score} (min {min_safety})")

    ok = True
    if success_implicit is not None and success_implicit < min_implicit:
        print(f"::error::success_implicit below threshold")
        ok = False
    if safety_score is not None and safety_score < min_safety:
        print(f"::error::safety_score below threshold")
        ok = False

    with open("ZEUS_GATE_SUMMARY.md", "w") as f:
        f.write("# Zeus Gate Summary\n")
        f.write(f"- Card: {card_path}\n")
        f.write(f"- success_implicit: {success_implicit} (min {min_implicit})\n")
        f.write(f"- safety_score: {safety_score} (min {min_safety})\n")
        f.write(f"- Result: {'PASS' if ok else 'FAIL'}\n")

    if not ok:
        sys.exit(2)

if __name__ == "__main__":
    main()
