# ATLAS HANDOFF — C-373: OAA Sentinel Review Broker (Phase 0 + Phase 1)

**From:** Michael (Custodian)  
**To:** ATLAS (Principal Engineering Orchestration Sentinel)  
**Cycle:** C-373 (2026-07-15)  
**Provenance:** During PR #387 (Witness Protocol canonization), the required Sentinel Review check FAIL_CLOSEDed on vendor errors — AUREA on OpenAI HTTP 429, ATLAS on Anthropic HTTP 400 (retired model string `claude-3-5-sonnet-20241022` pinned in workflow env). Net effect: a vendor rate limiter held merge authority over constitutional canon. This is vendor-availability-derived authority — the C-366 doctrine violated via uptime rather than data — and the concrete Phase 1 justification for the C-371 OAA Universal Agent Hub proposal.  
**Governing protocol:** All completion reports per `docs/WITNESS_PROTOCOL.md` (PR #387). Reports are claims; acceptance is by ref-verification.

**Sibling charter:** [`docs/OAA_CHARTER.md`](../../../OAA_CHARTER.md) (C-374) — three-floor OAA stack (Authority / Hub / Academy); Floor 1 broker work here gates Floor 2+.

---

```intent
EPICON INTENT PUBLICATION

epicon_id: EPICON_C-373_infra_oaa-sentinel-broker_v1
ledger_id: mobius:oaa:sentinel-broker-phase1-c373
scope: infra
mode: normal
issued_at: 2026-07-15T23:00:00Z
expires_at: 2026-08-15T23:00:00Z

justification:
  VALUES INVOKED: sovereignty, cost-integrity, verifiability, metric humility
  REASONING: Sentinel semantic review currently calls OpenAI/Anthropic
    directly from CI with per-repo vendor keys, a hardcoded retired model
    string, no caching, no budget control, and a verdict ontology that
    conflates "review found problems" (FAIL) with "review could not run"
    (absence of witness). A vendor 429 therefore blocks canon merges.
    Route all sentinel inference through OAA as a single HMAC-authenticated
    broker: keys centralize, models become server-side routing config,
    every verdict becomes a ledger attestation, and vendor failure becomes
    an attested SKIPPED instead of a blocking FAIL.
  ANCHORS:
    - PR #387 Sentinel Review run: AUREA "OpenAI HTTP 429", ATLAS
      "Anthropic HTTP 400" (both blocking, neither a genuine review verdict)
    - .github/workflows/sentinel-review.yml (C-339 hardening header)
    - C-371 OAA Universal Agent Hub proposal (HMAC agent-plane identity,
      no Civic ID attribution for agent operations)
    - C-366 no vendor-derived truth; C-354 silent budget-suspension incident
    - docs/WITNESS_PROTOCOL.md (SKIPPED/STALE as first-class non-FALSE verdicts)
  BOUNDARIES: Phase 0 (CI ontology fix + model string) and Phase 1
    (OAA proxy endpoint + attestation) ONLY. No caching, no budget
    breaker, no tier routing, no local models (Phases 2-3, separate
    intents). No changes to seal lineage, Reserve Blocks, canonical KV,
    or identity-service auth surfaces. No new vendor dependencies.
  COUNTERFACTUAL: If OAA brokering degrades review latency beyond CI
    tolerance or the endpoint proves unstable, CI retains the ability to
    fall back to direct vendor calls behind a single env flag; if the
    Phase 1 service cannot ship within 2 cycles, Phase 0 stands alone
    as the delivered fix.

counterfactuals:
  - If Phase 0 changes cause any currently-passing required check to
    regress, revert Phase 0 and halt
  - If HMAC verification adds >2s p95 to review requests, profile before
    proceeding; do not ship a slow gate
  - If persistence cannot be provisioned on non-ephemeral storage,
    Phase 1 does not ship (no SQLite-on-Render-disk under any framing)
  - If the attestation write path touches CPC ledger auth in a way that
    requires identity-service changes, stop and file a dissent note --
    that surface is quarantined this cycle
```

---

## Mission

Remove vendor merge-authority over Mobius canon: sentinel reviews become brokered, attested, and honest about absence — without losing the C-339 principle that an unrequested or unrun review must never silently pass.

## Phase 0 — CI fixes (no OAA dependency; ships first, unblocks now)

Target: `.github/workflows/sentinel-review.yml` in Mobius-Substrate (and any repo carrying the same workflow — enumerate them in the report).

- **P0-1: Model string.** Replace retired `claude-3-5-sonnet-20241022`. Do not hardcode a guess — resolve the current recommended Anthropic model programmatically or from docs, and record which was chosen and why in the PR intent block. Move both model strings to repo variables (`vars.`) so future changes are config, not code.
- **P0-2: Verdict ontology.** Add SKIPPED as a third verdict in the decide step:
  - FAIL = review ran and returned ≥1 blocking item → check fails
  - SKIPPED = review could not run (missing key, vendor 4xx/5xx, timeout, parse failure of vendor *transport* — not parse failure of model output, which stays FAIL as "output was not valid JSON" is a real review failure) → check does NOT fail; comment renders a loud ⚠️ SKIPPED block with reason
  - Unrequested review (no label) remains FAIL-closed exactly as C-339 specifies — SKIPPED requires a *requested* review that could not execute
- **P0-3: Consensus discipline.** `consensus:approved` auto-label ONLY when all requested sentinels return genuine PASS. Any SKIPPED → no label. Two SKIPPEDs → no label, loud comment.
- **P0-4:** The workflow header comment must be updated to document the new ontology, citing WITNESS_PROTOCOL.md — the C-339 header text currently defines the old two-state model and will otherwise contradict the behavior.

## Phase 1 — OAA broker (proxy + attestation; no routing intelligence yet)

> **Execution note (C-374 audit, 2026-07-16):** The living OAA backend is already FastAPI at `oaa-api-library.onrender.com` (`OAA-API-Library` v0.4.0 per OpenAPI). Phase 1's `POST /v1/sentinel/review` should land in `app/main.py` (or a router module in that service) — **not** as a TypeScript port to the dormant Next.js hub blueprint. The broker kit's endpoint can ship in the service's own idiom; CI swaps to HMAC-signed requests against the live host. See [`AUDIT_C-374_oaa-reality.md`](../../audits/AUDIT_C-374_oaa-reality.md).

- **P1-1: Service home.** Use the live FastAPI service in `OAA-API-Library` (`app/main.py`, v0.4.0 at `oaa-api-library.onrender.com`). Do not create a new repo unless audit disposition changes. Record decision in PR intent block.
- **P1-2: Endpoint.** `POST /v1/sentinel/review`:
  - Auth: HMAC-SHA256 over `timestamp.body` with shared secret; `x-oaa-agent` (must carry `mobius-` prefix per agent-plane convention), `x-oaa-timestamp` (reject outside ±300s window), `x-oaa-signature`. No JWT, no Civic ID — this is agent-plane per the C-371 identity split.
  - Request: `{ task, sentinels[], tier, policy_ref, context_hash, context{meta,files,diff}, prompt_version }`
  - Behavior: for each requested sentinel, call the configured vendor adapter (Anthropic for ATLAS, OpenAI for AUREA — adapters ported from the existing workflow code, same JSON verdict schema, same fence-stripping parse), normalize, return.
  - Response: `{ verdicts: [{ sentinel, verdict: pass|fail|skipped, blocking[], non_blocking[], summary, model, cached: false, attestation }] }` — `cached` is present-and-false now so Phase 2 is non-breaking.
  - Vendor 4xx/5xx/timeout → `verdict: skipped` with `reason`; never fabricate a review.
- **P1-3: Attestation.** Every verdict (including SKIPPED) writes one ledger record via the existing CPC attestation path: sentinel, model used, prompt_version, context_hash, verdict, reason-if-skipped, timestamp. Use existing agent attestation patterns (the `identityToken.ts` lineage / mobius-prefix conventions) — do NOT build new auth. If the existing path is unavailable, buffer attestations to the service's own Postgres table and flag in the report; a missing attestation must never fail the review response.
- **P1-4: Persistence.** Provisioned Postgres (or existing durable KV) for request log + buffered attestations. Hard constraint: nothing stateful on ephemeral disk.
- **P1-5: CI swap.** Replace the two vendor-call steps in sentinel-review.yml with the single OAA request step (HMAC-signed curl + `scripts/build_oaa_request.py`). CI secrets after this PR: `OAA_HMAC_KEY` only — vendor keys removed from repo secrets and inventoried out. Keep direct-vendor code path behind `SENTINEL_DIRECT_FALLBACK=true` env flag per the counterfactual, default off.
- **P1-6: Ops.** `/healthz`; structured logs; deploy per current platform conventions. Document the HMAC key rotation procedure in the service README (one paragraph is sufficient).

## Acceptance criteria

- Phase 0 merged and witnessed: a PR with `consensus:requested` and a deliberately unreachable vendor produces SKIPPED (not FAIL), no consensus label, loud comment — demonstrated live, run URL in report
- C-339 regression check: an unlabeled PR still FAILs closed — demonstrated live
- Phase 1: end-to-end review through OAA on a real PR, both sentinels, attestation IDs present in response and resolvable in ledger (or buffered table, if flagged)
- HMAC negative tests: bad signature, stale timestamp, missing agent header → 401, no vendor call made
- Vendor keys absent from repo secrets post P1-5 (list what was removed, per Vacation Lock inventory discipline)
- All PRs carry intent blocks referencing this `ledger_id`; all completion reports arrive as Witness Tables with timestamp + verified SHA per WITNESS_PROTOCOL.md

## Explicitly forbidden this handoff

- Cache, budget circuit breaker, tier routing, GitHub Models / local model lanes (Phases 2-3 — file follow-up issues, do not stub)
- Any change to seal lineage, Reserve Block KV, cron topology, or identity-service auth
- Any new required branch-protection check (the required-vs-advisory decision for Sentinel Reviews is Michael's, made after observing Phase 1 attestations)
- Prompt content changes beyond mechanical adaptation — sentinel prompt revision is its own future intent

## Open items owned by Michael

1. Required-vs-advisory decision for the Sentinel Review check (deferred until attestation data exists)
2. OAA budget policy values for Phase 2 (thresholds, epoch window)
3. Whether SKIPPED-verdict semantics get added to WITNESS_PROTOCOL.md as a document-control amendment (recommended: yes, one bullet, v1.0.x bump)

## Repos carrying `sentinel-review.yml` (Phase 0 scope)

| Repo | Fail-closed on unlabeled PR | Phase 0 status |
|------|----------------------------|----------------|
| `kaizencycle/Mobius-Substrate` | Yes (C-339) | **This PR** |
| `kaizencycle/mobius-civic-ai-terminal` | No (advisory skip) | Follow-up PR — align SKIPPED ontology |

---

## Report-back format

Witness Table (Claim / Verdict / Evidence — TRUE/FALSE/STALE/TRUE-gap), UTC timestamp, `origin/main^{}` SHA per touched repo, live run URLs for both acceptance demonstrations, deviations with justification, dissent section. Per canon: report discloses; repo witnesses.

---

*A vendor's uptime is not a quorum. This handoff revokes the 429's seat at the table.*
