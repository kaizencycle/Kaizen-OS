# PR plan — Canonicalize MIC around runtime integrity

**Status:** Planning companion (documentation)  
**Primary outcome:** Runtime MIC docs under `docs/04-TECHNICAL-ARCHITECTURE/mic/` are canonical; older layers are clearly labeled research or archive.

---

## Title (suggested)

Canonicalize MIC around runtime integrity; demote macro tokenomics to research layer

---

## Why

Three MIC layers collided in the repo:

1. **README / civic framing** — integrity credits  
2. **`packages/tokenomics-engine` + cron** — provisional rewards + `/mic/attestations`  
3. **Supplementary + whitepapers** — broad economics and policy narrative  

This plan keeps (1) and (2) aligned and marks (3) as **non-canonical** unless cross-linked to runtime specs.

---

## What stays canonical

- `README.md` MIC line (updated to integrity-gated issuance)  
- `docs/04-TECHNICAL-ARCHITECTURE/mic/` (this folder)  
- `docs/protocols/vault-v2-sealed-reserve.md` (live Vault doctrine)  
- `packages/tokenomics-engine/src/*.ts` as **reward accounting**  
- `configs/tokenomics.yaml` as **config** (with follow-up to split mint vs reward thresholds)  
- `infra/cron/compute_rewards.sh`  

---

## What moves to “research only”

- `docs/11-SUPPLEMENTARY/tokenomics/*` — implementation notes + narrative; must point to `mic/` for issuance truth  
- `docs/07-RESEARCH-AND-PUBLICATIONS/tokenomics/*` — duplicate research copies; same banners  
- `docs/07-RESEARCH-AND-PUBLICATIONS/mic-economics/*` — macro implications and speculative economics  
- `docs/10-ARCHIVES/**/tokenomics*.md` — archive only  

---

## Suggested commit sequence

1. `docs(mic): add canonical runtime issuance architecture`  
2. `docs(tokenomics): mark supplementary MIC docs as research-only`  
3. `docs(readme): clarify MIC as integrity-gated issuance`  
4. `docs(nav): point DOCS.md economists to runtime MIC`  

---

## Acceptance criteria

- [x] Canonical MIC docs exist under `docs/04-TECHNICAL-ARCHITECTURE/mic/`  
- [x] `README.md` points readers to runtime MIC docs  
- [x] Supplementary tokenomics entry points carry non-canonical banners  
- [x] `DOCS.md` economist path foregrounds runtime truth, not pitch-deck macro  
- [x] No breaking code changes in a docs-only phase  

---

## Out of scope (follow-up PRs)

- Changing live multiplier math  
- Adding HTTP `/v1/mic/mint/*` routes  
- Rewriting entire MIC whitepaper  
- Finalizing total supply on-chain  

---

## One-line canon

**MIC is not issued because activity happened; MIC is issued because integrity was proven.**
