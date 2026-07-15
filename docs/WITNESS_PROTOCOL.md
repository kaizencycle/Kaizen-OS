# Witness Protocol — Report Discloses; Repo Witnesses

**Version:** 1.0.2  
**Cycle:** C-373  
**Status:** CANONICAL  
**Layer:** Epistemic Governance  
**Authority:** Custodian handoff (Michael Judan, 2026-07-15)  
**License:** CC0 / Public Domain

## Authority Provenance

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

---

## 1. Doctrine

1. **An agent's completion report is a claim, not a verification.**
2. **Both directions fail.** Agent reports can run *ahead* of main (work described before it is merged and public). Rendered views — CDN pages, UIs, dashboards — can run *behind* it (staleness presented as current state). Neither is ground truth.
3. **Report discloses; repo witnesses.** Acceptance of any "shipped" claim requires verification against the repository's content-addressed layer — refs and SHAs — never against the report describing the work or a render displaying it.

---

## 2. The Witness Table

Standard format for all completion reports and any report disputing another witness:

| Claim | Verdict | Evidence |
| --- | --- | --- |

### Verdicts

| Verdict | Meaning |
| --- | --- |
| **TRUE** | Claim verified against independent evidence |
| **FALSE** | Claim contradicted by evidence |
| **STALE** | Claim was true at some point; evidence source aged out or render lagged — not a lie |
| **TRUE-gap** | Claim is directionally true; a deferral or boundary is correctly documented |

**STALE is first-class and distinct from FALSE.** A snapshot that aged out is not a lie; conflating them erodes trust in the protocol faster than real defects do.

**Evidence** must be independently checkable: a SHA, a resolvable ref, a command output, a link — never a restatement of the claim.

### Worked example — C-373 epicon MVP extraction (2026-07-15)

Incident window: three witness failures in one afternoon on [`kaizencycle/epicon`](https://github.com/kaizencycle/epicon). Table verified against refs on **2026-07-15** (UTC); re-verify before acceptance.

| Claim | Verdict | Evidence |
| --- | --- | --- |
| PR [#19](https://github.com/kaizencycle/epicon/pull/19) (README rewrite) merged to `epicon` `main` | TRUE | Merge commit `d53ad24c8fffcc7ec79655e361cfcf77a9326bde`; mergedAt `2026-07-15T20:38:02Z` |
| PR [#21](https://github.com/kaizencycle/epicon/pull/21) (repo hygiene) merged same cycle window | TRUE | Merge commit `11d2f488ebda58c12d5fdea323004dda92f1c339`; mergedAt `2026-07-15T21:23:47Z` |
| PR [#22](https://github.com/kaizencycle/epicon/pull/22) (retag `v1` + immutability policy) merged | TRUE | Merge commit `29b9e36c654d3653a7f6590bacefa57325bfaf31`; mergedAt `2026-07-15T21:24:31Z` |
| Floating tag `v1` moved from `c0e5e10` → `1f9090d` per movement log | TRUE | `origin/main:docs/releases/v1.md` movement log; `git ls-remote origin refs/tags/v1^{}` → `1f9090df20d9d7c53bea713a5623ea678fa79226` |
| Comparing unpeeled tag-object SHAs on `v1` produces false drift alarms | TRUE | Remote tag object `becb16f6fdb8cc0c3081dd4c2353c14b58bf60cf` ≠ peeled `1f9090d` — always use `^{}` |
| Agent completion report described work as on `main` before merge landed | TRUE-gap | Custodian incident narrative (C-373 handoff); no archived agent-report SHA in canon — verify with `git rev-parse origin/main^{}` at acceptance time |
| GitHub/CDN rendered repo view matched `origin/main^{}` immediately after merge | STALE | Product copy: epicon `docs/releases/TAG_POLICY.md` — *"Check refs, not renders. GitHub's rendered repo page and CDN can lag; SHAs cannot."* |

---

## 3. Cycle-close verification canon

```bash
git fetch origin main
# Floating/moved tags: plain --tags will NOT overwrite a stale local tag after a force-move.
# Use --force, or witness remote refs directly (preferred when verifying a retag).
git fetch origin --force --tags
# Alternative for implicated distribution tags (no local cache):
git ls-remote origin refs/tags/<tag>^{}

git rev-parse origin/main^{}
git rev-parse <tag>^{}        # only after force-fetch or ls-remote agrees
<run the repo's test suite>
# record: UTC timestamp + every SHA verified
```

### Rules

- **Always compare peeled (`^{}`) SHAs, never tag-object SHAs.** Annotated tags created at different moments have different tag-object SHAs while pointing at identical code; comparing unpeeled SHAs produces false drift alarms.
- **Force-moved floating tags require forced fetch or `git ls-remote`.** If you already fetched `v1` at `c0e5e10` and remote moved it to `1f9090d`, `git fetch origin main --tags` rejects the update (*would clobber existing tag*) and `git rev-parse v1^{}` witnesses stale local data. Use `git fetch origin --force --tags`, a per-tag refspec (`git fetch origin +refs/tags/v1:refs/tags/v1`), or `git ls-remote origin refs/tags/v1^{}` before recording the witness table.
- A one-commit lag between a tag and `main` is expected when the tag-movement log is committed after tagging (causality constraint, not drift).
- **Floating tags** (e.g., `v1`) move only to commits already on `main` — post-merge, never pre-merge. Every movement is logged in the product repo's release docs (see epicon [`docs/releases/v1.md`](https://github.com/kaizencycle/epicon/blob/main/docs/releases/v1.md) movement log; canon does not duplicate product release files).

---

## 4. Provenance — C-373 origin (2026-07-15)

Forced into existence by **five** witness failures in one afternoon — three on the **epicon** MVP extraction lane, two on the **Substrate** canonization of this protocol — each caught by a different party:

| # | Failure | Witness | Hole closed |
| --- | --- | --- | --- |
| 1 | Agent completion report ran **ahead** of `main` | Human / custodian | Report discloses; ref-verify before acceptance |
| 2 | External fetch / CDN render ran **behind** `main` | Human / custodian | Check refs, not renders |
| 3 | Floating `v1` **force-moved** (`c0e5e10` → `1f9090d`) | Tag movement log + `git ls-remote` | Peeled SHAs; logged retags only post-merge |
| 4 | Canonization PR [#387](https://github.com/kaizencycle/Mobius-Substrate/pull/387) intent block **malformed** (missing `epicon_id`, `COUNTERFACTUAL` inside `justification`) | **EPICON Guard** FAIL_CLOSED (EP-3) | I6 structural keys; authority provenance on binding docs |
| 5 | Cycle-close canon used `git fetch --tags` without **force** on moved tags | **Codex** automated review (P2) | `git fetch --force --tags` or `git ls-remote` before `rev-parse` |

The protocol was not designed in the abstract; every rule above closes a hole that was actually exploited by accident. Trust it accordingly.

### epicon lane (failures 1–3)

1. **Agent report ahead of main** — a completion report described merged/shipped state before `origin/main` contained the work (Cursor / PR #19 window).
2. **External fetch behind main** — a rendered or CDN-backed view presented stale content as current (refs had already advanced).
3. **Distribution tag drift** — floating `v1` was force-updated; prior target `c0e5e10`, post–PR #22 target `1f9090d` (movement logged in epicon release docs).

### Substrate canonization lane (failures 4–5)

4. **Guard FAIL_CLOSED on own amendment** — [PR #387](https://github.com/kaizencycle/Mobius-Substrate/pull/387) first push (`7e6549c`) failed Intent Publication Gate (missing `epicon_id`, `justification.COUNTERFACTUAL`) and Authority Provenance (binding doc without founder standing); Catalog Freshness caught `mobius_catalog.json` drift. Fixed in `ca929fca`.
5. **Codex P2 on draft canon** — `git fetch origin main --tags` in §3 could reproduce failure #3 locally; fixed in `e50ab859` (document control v1.0.1).

### Resolvable references (verify by ref)

| Reference | Resolver |
| --- | --- |
| epicon PR #19 | https://github.com/kaizencycle/epicon/pull/19 |
| epicon PR #21 | https://github.com/kaizencycle/epicon/pull/21 |
| epicon PR #22 | https://github.com/kaizencycle/epicon/pull/22 |
| `v1` retag `c0e5e10` → `1f9090d` | https://github.com/kaizencycle/epicon/blob/main/docs/releases/v1.md#movement-log |
| Tag policy (product copy) | https://github.com/kaizencycle/epicon/blob/main/docs/releases/TAG_POLICY.md |
| Substrate PR #387 (Witness Protocol canon) | https://github.com/kaizencycle/Mobius-Substrate/pull/387 |
| Guard fix commit | `ca929fca` on `cursor/witness-protocol-canon-c373-0e02` |
| Codex P2 fix commit | `e50ab859` on `cursor/witness-protocol-canon-c373-0e02` |
| EPICON-02 invariant I6 (no narrative without verification) | [`docs/epicon/EPICON-02.md`](./epicon/EPICON-02.md) §2.6 |
| I7 follow-up (witness-table enforcement) | https://github.com/kaizencycle/Mobius-Substrate/issues/386 |

If any reference above 404s or SHAs disagree at verification time, mark the row **STALE** in your witness table and re-witness — do not assert from memory.

---

## 5. Relationship to existing canon

### Metric humility (Section 17 lineage)

Section 17 as a numbered constitutional section is **not yet assigned** in Substrate canon (see C-369 handoff cross-refs — numbering remains OPEN; custodian decision pending). The doctrine already lives in [`GI_PERCEPTION_DOCTRINE.md`](./04-TECHNICAL-ARCHITECTURE/integrity/GI_PERCEPTION_DOCTRINE.md) (**Metric humility**) and [`GOODHART_RESISTANCE_DOCTRINE.md`](./04-TECHNICAL-ARCHITECTURE/integrity/GOODHART_RESISTANCE_DOCTRINE.md) (**Witness Principle**): no metric, score, or render may be acted upon as reality without disclosed confidence and blind spots.

**This protocol applies the same humility to agent completion reports.** A report that omits ref-verification is a high-confidence narrative — the same failure mode as a high GI score without blind-spot disclosure.

### C-366 — no UI/vendor-derived truth

C-366 constitutional EPICON tiering establishes Mobius as **constitutional witness**, not actor — operational evidence stays local; constitutional commitments carry hashes and fingerprints, not narrative ([`EPICON_TIERING_SPEC_v0.1.md`](./specs/EPICON_TIERING_SPEC_v0.1.md)). The **no UI-derived truth** constraint is explicit in civic research EPICONs (e.g. [`EPICON-C367-US-NY-NYC-BUDGET-TRACE.md`](./07-RESEARCH-AND-PUBLICATIONS/civic-budget-audits/EPICON-C367-US-NY-NYC-BUDGET-TRACE.md) §2).

**This protocol extends that doctrine to agent reports and distribution tags:** neither a dashboard, a vendor API response, nor an agent's natural-language summary is ground truth — only content-addressed repository state witnessed by ref.

---

## 6. Sibling protocol — EPICON-02

| Protocol | Gates |
| --- | --- |
| [**EPICON-02**](./epicon/EPICON-02.md) (IPDP) | Intent before authority — divergence legible, time-bounded |
| **Witness Protocol** (this document) | Claims before acceptance — completion reports witnessed by ref |

EPICON-02 publishes *why* authority may be exercised. The Witness Protocol verifies *whether* a shipped claim is true on `main` before acceptance.

---

## Document control

| Version | Date | Change |
| --- | --- | --- |
| 1.0.0 | 2026-07-15 | Initial canon — C-373 ATLAS handoff |
| 1.0.1 | 2026-07-15 | Cycle-close canon: force-fetch / ls-remote for moved floating tags (Codex P2) |
| 1.0.2 | 2026-07-15 | Provenance: five-failure origin table (epicon lane + Guard + Codex on PR #387) |

**Follow-up (out of scope for canon PR):** Guard invariant **I7: witness-table enforcement** — automate witness-table presence on completion reports; file as issue, do not block this doc.

---

*"Report discloses; repo witnesses."*
