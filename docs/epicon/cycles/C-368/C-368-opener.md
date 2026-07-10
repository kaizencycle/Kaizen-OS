# C-368 Opener — Six Optimizations
**Cycle:** C-368 (2026-07-10) · **Drafted:** ATLAS, C-367 close · **All intents pre-validated: PASS**

Yesterday the constitution acquired teeth (Guard live on six repo-heads). Today closes the
gaps the rollout exposed. Each file below is a complete PR body — intent embedded — ready
for Cursor / Claude Code.

| # | File | Repo | What | Tier | Priority |
|---|------|------|------|------|----------|
| 1 | C368-PR1_oaa-mint-auth.md | OAA-API-Library | Close unauthenticated MIC mint path; gate debug endpoints | EP-3 | **1 — live hole** |
| 2 | C368-PR2_oaa-gii-canon.md | OAA-API-Library | Align GII thresholds to canon (0.85/0.90/0.95) | EP-3 | 2 |
| 3 | C368-PR3_epicon-cc0.md | epicon | Ratify CC0; resolve AGPL self-contradiction | EP-2 | 4 — quick |
| 4 | C368-PR4_epicon-api-truthful-health.md | epicon-api source | Truthful /health, manifest, discoverable source | EP-2/3 | 3 — small |
| 5 | C368-PR5_guard-app-phase1.md | epicon | Probot App: I2 immutability enforcement, PAT retirement begins | EP-2 | 5 — big |
| 6 | C368-PR6_org-dedup.md | mobius-civic-ai-terminal-main | Deprecate + archive duplicate repo | EP-1 | 6 — trivial |

**Suggested order:** 1 → 2 (same repo, sequential) → 4 → 3 → 6 → 5 (App work fills the rest of the cycle).

**Carried, not scheduled:** five-vs-three domain GI formula (needs seal quorum, blocks DWE);
Phase 2 ledger attestation; browser-shell's vendored OAA-API-Library copy (drift risk).
