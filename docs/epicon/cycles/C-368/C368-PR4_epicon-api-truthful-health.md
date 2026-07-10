# C-368 · PR 4 — epicon-api: truthful health + discoverable source
**Repo:** deploy source of the `epicon-api` Render service (identify in step 0) · **Branch:** `infra/epicon-api-health-c368` · **Tier:** EP-2/EP-3 (service infra) · **Priority: 3 — small, principled**

## 1. Summary

The `epicon-api` service (Render, Node, deployed this week) is alive but `GET /health` returns
`{"ok": false, "error": "not found"}` and `GET /` returns empty. A health endpoint that
reports failure while the service is up will eventually flap Render's health checks — and it
is a claim/reality inversion on infrastructure named EPICON. The service also corresponds to
no discoverable public repo: a production API with no findable source violates the witness norm.

## 2. Changes

0. **Identify the deploy source** (Render → epicon-api → Settings → Repository/branch/root dir).
   Record it in the PR description.
1. **`GET /health`** → `200 {"ok": true, "service": "epicon-api", "version": "<pkg>", "ts": <epoch>}`
   when the process is serving; non-200 only when a real dependency is down.
2. **`GET /`** → JSON manifest: service name, version, purpose, endpoint list — same convention
   as the OAA root manifest.
3. **Discoverability:** if the source is a private repo, either publish it or add
   `docs/services/epicon-api.md` in `kaizencycle/epicon` stating what the service is, where the
   source lives, and why it is private. Add the Render service link to that doc.
4. **State the purpose.** If epicon-api is the intended Phase-1 Guard App host, say so in the
   manifest (`"role": "guard-app-host (phase 1)"`) — PR 5 then converges on it instead of
   creating a new service.

## 3. Acceptance criteria

- `curl /health` → 200 `ok:true` with version. `curl /` → manifest.
- The source repo is either public or documented in `kaizencycle/epicon/docs/services/`.
- Render health check configured against `/health` without flapping for 24h.

## 4. EPICON Intent

```intent
epicon_id: EPICON_C-368_INFRA_epicon-api-truthful-health_v1
ledger_id: kaizencycle
scope: infra
mode: normal
issued_at: 2026-07-10T00:00:00Z
expires_at: 2026-10-08T00:00:00Z
justification:
  VALUES INVOKED: integrity, transparency, accountability, safety
  REASONING: A health endpoint reporting failure while up is a standing false claim on
    the wire, and an undiscoverable production service contradicts the
    constitutional-witness norm the service is named after.
  ANCHORS:
    - Mobius-Substrate/docs/epicon/EPICON-02.md (IPDP v1.0.0)
    - Mobius-Substrate/docs/specs/EPICON_TIERING_SPEC_v0.1.md (canonized PR #357)
  BOUNDARIES: Health/manifest endpoints and source documentation only. No functional API
    changes; the service purpose decision (Guard App host or not) is recorded,
    not implemented, here.
  COUNTERFACTUAL: If the service has no defined purpose after this audit, it is suspended
    rather than left running as unaccounted infrastructure.
counterfactuals:
  - If /health semantics are load-bearing for some client, version the endpoint and migrate
  - If the source cannot be published for a legitimate reason, the docs entry states the reason explicitly
  - If epicon-api is orphaned, suspend the service and record the suspension in the cycle journal
```
