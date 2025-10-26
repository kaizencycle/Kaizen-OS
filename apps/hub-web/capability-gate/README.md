# Capability Gate v0

This gate enforces a **standard promotion flow** for model/agent upgrades:
1) Prepare dataset + model card
2) Run eval suites (capability, safety, robustness)
3) Summarize + compare against baselines
4) Check thresholds in `gate.config.json`
5) **Dual approvals** + **Civic Ledger seal**
6) Canary rollout → staged promotion → post-roll checks

All artifacts are committed to the repo (JSON + Markdown) and linked in the **Civic Ledger**.

