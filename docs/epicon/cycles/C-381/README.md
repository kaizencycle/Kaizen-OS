# C-381 — Handbook CI / Codex Remediation

**Status:** **OPEN** — CI alignment for [PR #413](https://github.com/kaizencycle/Mobius-Substrate/pull/413) (C-380 handbook)  
**Parent work:** C-380 progressive disclosure (`EPICON-C380-HANDBOOK-001`)

## Objective

Close CI and Mobius PR Bot failures on the handbook PR without changing handbook doctrine or scope.

## Codex / CI findings addressed

| Gate | Failure | Fix |
|------|---------|-----|
| Intent Publication Gate | No ` ```intent ` block in PR | Intent in PR body + `EPICON-C380-HANDBOOK-001.md` |
| Mobius PR Bot | Missing `EPICON-02 INTENT PUBLICATION` header | PR body updated with header + intent |
| License + cycle pointer | `STATE_OF_THE_SUBSTRATE_LATEST` = C-360 vs `cycle.json` = C-381 | State file + `mkdocs.yml` → C-381 |
| Authority Provenance Guard | `docs/epicon/EPICON-C380-HANDBOOK-001.md` lacks provenance | Founder standing block added |
| Catalog Freshness | New docs not indexed | `npm run export:catalog` |

## Witness table

| Claim | Verdict |
|-------|---------|
| Handbook changes alter protocol/runtime behavior | **FALSE** — renderer/navigation only |
| `AI Simple in Life` promotes HIVE simulation as truth | **FALSE** — explicit "Simulation is not truth" |
| Cycle pointer fix promotes handbook to canon | **FALSE** — metadata sync only |
| C-381 supersedes C-380 handbook intent | **FALSE** — remediation layer only |

## Review handoff (unchanged from C-380)

- **ATLAS:** nav accuracy, canonical placement, implementation claims
- **JADE:** newcomer readability, integrity vs morality distinction
- **ZEUS:** simulation-as-truth, stale-state, false-authority failure modes
- **EVE:** consequence lens; anti-surveillance boundary

## Acceptance

- [x] Cycle pointer aligned (`cycle.json`, `STATE_OF_THE_SUBSTRATE_LATEST.md`, `mkdocs.yml`)
- [x] EPICON-02 intent published
- [x] Authority provenance on handbook EPICON
- [ ] Catalog committed
- [ ] MkDocs strict build
- [ ] Sentinel review
- [ ] Human merge

---

*"We heal as we walk." — Mobius Systems*
