# C-368 · PR 1 — OAA mint-path authentication
**Repo:** `kaizencycle/OAA-API-Library` · **Branch:** `core/oaa-mint-auth-c368` · **Tier:** EP-3 (mint path) · **Priority: 1 — live integrity hole**

## 1. Summary

The production OAA service reports `jwt_configured: false` while `minting_enabled: true`, and
`POST /api/learning/session/{id}/complete` treats auth as optional ("auth binds MIC to subject_id").
Anonymous completions can mint unbound MIC. Additionally `/api/debug/test-anthropic` and
`/api/debug/test-openai` are exposed in production.

This PR closes the unauthenticated mint path and gates the debug surface.

## 2. Changes

1. **Require verified identity to mint.** `POST /api/learning/session/{id}/complete` returns
   `401` with no mint unless a valid Bearer JWT resolves a `subject_id`. Verification delegates
   to `mobius-identity-service` (same Render project): prefer JWKS
   (`MOBIUS_IDENTITY_JWKS_URL`) with `MOBIUS_IDENTITY_JWT_SECRET` as HS256 fallback.
   Sessions may still be *started and played* anonymously — only minting requires identity.
2. **Bind every mint.** The mint write must carry the verified `subject_id`; remove any code
   path that mints with a null/placeholder subject.
3. **Wallet endpoints authenticated.** `/api/v1/wallet/balance|ledger|breakdown` require the
   same Bearer token and only return the caller's own subject data.
4. **Gate debug endpoints.** `/api/debug/*` return 404 unless `DEBUG_ENDPOINTS_ENABLED=true`
   (default false). Never enabled in the production env group.
5. **Truthful manifest.** Root `/` reports `jwt_configured` from actual config state; reconcile
   the version drift (root says 0.4.0, OpenAPI says 0.1.0 — pick one, bump both).

## 3. Acceptance criteria

- Anonymous `POST .../complete` → `401`, wallet ledger shows **zero** new mint entries.
- Authenticated completion mints exactly once, bound to the token's `subject_id`.
- `curl /api/debug/test-openai` → 404 in production.
- Root manifest: `jwt_configured: true`; versions match.
- No change to module content, session flow, or reward math.

## 4. Rollback

Revert the merge commit. No env escape hatch is provided by design — an
"allow anonymous mint" flag would recreate the hole with a switch on it.

## 5. EPICON Intent

```intent
epicon_id: EPICON_C-368_CORE_oaa-mint-auth_v1
ledger_id: kaizencycle
scope: core
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability, safety
  REASONING: MIC is integrity-gated currency; an unauthenticated mint path contradicts
    its constitutional definition. The identity service exists and is deployed —
    this PR wires verification into the one endpoint that creates value.
  ANCHORS:
    - Mobius-Substrate/docs/epicon/EPICON-02.md (IPDP v1.0.0)
    - Mobius-Substrate/docs/specs/EPICON_TIERING_SPEC_v0.1.md (canonized PR #357)
  BOUNDARIES: Auth enforcement on mint and wallet endpoints only. No changes to learning
    content, session mechanics, reward formulas, or GII thresholds (PR 2).
  COUNTERFACTUAL: If the identity service cannot issue verifiable tokens for OAA clients
    within this window, minting is disabled entirely rather than left open.
counterfactuals:
  - If legitimate clients cannot authenticate post-merge, disable minting (do not re-open anonymous path) and patch
  - If JWKS integration stalls, ship HS256 shared-secret first and upgrade
  - If wallet endpoints break the Browser Shell, scope-limit to mint endpoint and fast-follow
```

**Note:** the Guard may emit an I4 divergence warning (declared scope `core` vs `app/` paths — the
generic envelope expects `apps/`). Non-blocking; known envelope-granularity limitation.
