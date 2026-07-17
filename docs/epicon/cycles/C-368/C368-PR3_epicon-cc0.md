# C-368 · PR 3 — License ratification: CC0
**Repo:** `kaizencycle/epicon` · **Branch:** `docs/license-cc0-c368` · **Tier:** EP-2 (package metadata) · **Priority: 4 — quick**

## 1. Summary

The repo currently self-contradicts: `LICENSE` is AGPL-3.0 (copyright "Mobius Systems", a legacy
non-entity), while `src/validate.mjs` — the shipped Action — declares CC0-1.0, and federation
canon states CC0 throughout. **Merging this PR is the ratification decision**: spec and
implementation both public domain; the moat is the hosted attestation layer, never the source.

## 2. Changes

1. Replace `LICENSE` with the CC0 1.0 Universal legal text (creativecommons.org/publicdomain/zero/1.0/legalcode.txt).
2. `package.json`: `"license": "CC0-1.0"`; rename package `@epicon-guard/epicon` → `@kaizencycle/epicon` (legacy org name).
3. `README.md`: License section becomes — *"CC0 1.0 Universal (public domain). Spec and implementation. Do anything; attribution appreciated, never required."* Swap the badge.
4. `action.yml` / `validate.mjs` headers: already CC0 — now consistent instead of contradictory.

**Precondition (verify before merge):** `git shortlog -sne` shows no external contributors; if any
exist, obtain sign-off or halt.

## 3. Acceptance criteria

Every license declaration in the repo (LICENSE, package.json, README badge + section, source
headers) says CC0-1.0. Zero AGPL references remain. `git grep -il agpl` returns nothing.

## 4. EPICON Intent

```intent
epicon_id: EPICON_C-368_DOCS_license-cc0-ratification_v1
ledger_id: kaizencycle
scope: docs
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability, safety
  REASONING: The asset is the grammar, not the 400-line validator; AGPL deters the exact
    enterprise adopters the standard needs while stopping no one from
    reimplementing. Consistency with CC0 canon is itself an integrity claim.
  ANCHORS:
    - Mobius-Substrate/docs/epicon/EPICON-02.md (IPDP v1.0.0)
    - Mobius-Substrate/docs/specs/EPICON_TIERING_SPEC_v0.1.md (canonized PR #357)
  BOUNDARIES: This repository only. Does not license the hosted App, dashboard, or
    attestation services, which do not yet exist.
  COUNTERFACTUAL: If a commercial implementation layer ever becomes strategy, it is a new
    product in a new repo — this repo is never relicensed away from CC0.
counterfactuals:
  - If an external contributor is found in git history, halt and obtain sign-off first
  - If counsel later advises an entity copyright is needed, form the entity — do not retreat from CC0
  - If npm scope rename breaks a consumer, publish under both scopes for one deprecation cycle
```
