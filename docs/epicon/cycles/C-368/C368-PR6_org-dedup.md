# C-368 · PR 6 — Org hygiene: retire the duplicate terminal repo
**Repo:** `kaizencycle/mobius-civic-ai-terminal-main` · **Branch:** `docs/deprecation-c368` · **Tier:** EP-1 (docs) · **Priority: 6 — trivial, do last**

## 1. Summary

`mobius-civic-ai-terminal-main` exists alongside the canonical `mobius-civic-ai-terminal`.
Two near-identical repos invite wrong-repo deploys and split PR history. This PR marks the
duplicate deprecated, then the repo is archived.

## 2. Steps

1. **Uniqueness check first** — confirm no work exists only in the duplicate:
   `git log --oneline --all` in both; if unique commits exist in `-main`, port them to the
   canonical repo (own PR, own intent) before archiving. Record the result here.
2. **This PR:** replace `README.md` with a deprecation notice —
   *"⚠️ ARCHIVED — this repository is a duplicate. Canonical: github.com/kaizencycle/mobius-civic-ai-terminal. No code here is deployed or maintained."*
3. **After merge:** `gh repo archive kaizencycle/mobius-civic-ai-terminal-main --yes`
   (archiving is a settings action, outside PR scope — the intent below covers both).
4. **Checklist rider (no code):** confirm `kaizencycle/epicon` Pages → Source is
   "GitHub Actions" and the C-367 site (not the README render) is live at
   epicon.mobius-substrate.com.

## 3. Acceptance criteria

- Deprecation README merged; repo archived (read-only badge visible).
- Zero Render/Vercel services reference the archived repo as deploy source.
- Canonical repo confirmed to contain any unique work found in step 1.

## 4. EPICON Intent

```intent
epicon_id: EPICON_C-368_DOCS_org-dedup-terminal-main_v1
ledger_id: kaizencycle
scope: docs
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability, safety
  REASONING: Duplicate repos are institutional-memory hazards: they split history and
    invite deploys from the wrong source. Archival with a signpost preserves
    the record while removing the ambiguity.
  ANCHORS:
    - Mobius-Substrate/docs/epicon/EPICON-02.md (IPDP v1.0.0)
    - Mobius-Substrate/docs/specs/EPICON_TIERING_SPEC_v0.1.md (canonized PR #357)
  BOUNDARIES: Deprecation notice and archival of the duplicate only. The canonical
    terminal repo is untouched; porting any unique commits is a separate
    intent if step 1 finds them.
  COUNTERFACTUAL: If the duplicate turns out to be the actual deploy source for any live
    service, archival halts until the service is repointed.
counterfactuals:
  - If unique commits are found, port before archiving — never archive unported work
  - If any CI/deploy references the duplicate, repoint first
  - Archival is reversible; unarchive if a dependency was missed
```
