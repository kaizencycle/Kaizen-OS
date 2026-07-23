# ATLAS Handoff Template

**File:** `docs/templates/ATLAS_HANDOFF_TEMPLATE.md`  
**Status:** Canonical  
**Cycle introduced:** C-373  
**Applies to:** ATLAS-orchestrated multi-repo handoffs with constitutional or protocol delivery

---

## Header

```markdown
# ATLAS Handoff — [Title]

**From:** Michael (Custodian) · **To:** ATLAS  
**Cycle:** C-[XXX] ([YYYY-MM-DD])  
**Target repo(s):** [org/repo list]  
**Provenance:** [One sentence — why this handoff exists]
```

---

## Intent block (required)

```intent
EPICON INTENT PUBLICATION

ledger_id: mobius:substrate:[slug]
scope: docs | infra | apps | …
mode: normal
issued_at: [ISO-8601]
expires_at: [ISO-8601]

justification:
  VALUES INVOKED: …
  REASONING: …
  ANCHORS: …
  BOUNDARIES: …

counterfactuals:
  - …
```

---

## Body sections

1. **Mission** — one paragraph  
2. **Deliverables** — numbered (D1, D2, …) with paths  
3. **Acceptance criteria** — checkable, ref-verifiable  
4. **Explicitly forbidden** — scope fence  
5. **Open items owned by custodian** — decisions not delegated to ATLAS  

## Witness Table (required — copy header verbatim)

Tier 2+ PRs and all completion reports must include this block **literally** (EPICON-02 invariant I7):

```markdown
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| <claim text> | TRUE | <SHA, git command, or URL> |
```

- Header line must be exactly `## Witness Table` (case-sensitive).
- Verdict: `TRUE`, `FALSE`, `STALE`, or `TRUE-gap` only (per `docs/WITNESS_PROTOCOL.md`).
- Evidence: SHA fragment, `git …` command, or URL — not prose restatement.

## Authority provenance (when exercising custodial authority)

*Authority declared using [`docs/templates/EPICON_FOUNDER_STANDING.md`](./EPICON_FOUNDER_STANDING.md) v0.1*

---

## Report-back format (required)

Completion reports are **claims**. Acceptance requires ref-verification per [`docs/WITNESS_PROTOCOL.md`](../WITNESS_PROTOCOL.md).

Every report-back MUST include:

1. **Witness table** — use the literal `## Witness Table` header and column names per I7 (see section above). Verdicts: `TRUE`, `FALSE`, `STALE`, `TRUE-gap`. Evidence: SHA, ref, command output, or resolvable link — never a restatement of the claim.

2. **Verification timestamp** (UTC)

3. **`origin/main^{}` SHA** verified for each target repo implicated by deliverables

4. **Test / link checks** for every reference in provenance sections

5. **Deviations** with justification (if any deliverable deferred)

6. **Dissent section** if any handoff constraint proved wrong — halt and file; do not silently reconcile

### Cycle-close command canon

```bash
git fetch origin main
git fetch origin --force --tags   # required after floating-tag moves; plain --tags may refuse
# or: git ls-remote origin refs/tags/<tag>^{}
git rev-parse origin/main^{}
git rev-parse <tag>^{}    # for each distribution tag cited
<repo test suite>
```

---

## PR requirements

- PR body carries its own ` ```intent ` block referencing the handoff `ledger_id`
- PR completion report uses the witness table above — the handoff's own close is the protocol's exercise

---

*Template v1.0.0 — C-373 Witness Protocol canonization*
