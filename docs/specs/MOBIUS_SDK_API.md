# MobiusSDK API — BYOK, Model-Agnostic Architecture

**Cycle:** C-285 (draft)  
**Status:** Draft specification  
**Canonical path:** `docs/specs/MOBIUS_SDK_API.md` (also linked from repo root as `specs/MOBIUS_SDK_API.md` for tooling).  
**CC0 Public Domain** (align with substrate canon unless superseded by project license)

---

## Purpose

Define how Mobius supports **bring-your-own-key (BYOK)** and **model-agnostic inference** while keeping Mobius-owned **identity, memory, governance, ledger, and MIC** logic intact.

---

## Short answer

**Yes** — this belongs in the Mobius monorepo as a shared protocol / backend surface.  
**Yes** — parts of it should surface in the **Terminal** (operator) and **Browser Shell** (citizen), but not the same way.

### Canonical split

| Surface | Role |
|---------|------|
| **Mobius-Substrate (monorepo)** | Canonical home for SDK, gateway, provider adapters, shared schemas, auth contracts, ledger-aware inference flow |
| **Mobius Terminal** | Operator/admin: provider health, routing visibility, usage/cost telemetry, key **status** (no secret echo), model routing / fallback state |
| **Mobius Browser Shell** | User-facing: connect provider, add key, choose models, budget caps, scopes |

---

## 1. Core principle

**Users bring the model and the key. Mobius provides identity, memory, governance, and economics.**

Mobius is not locked to one model vendor. Mobius is the **constitutional layer** around inference.

### Mobius owns

- identity  
- session  
- wallet  
- journal  
- EPICON  
- Vault  
- MIC logic  
- permissions  
- audit trail  
- governance / review  

### Users may provide

- OpenAI, Anthropic, Gemini, OpenRouter keys  
- local OpenAI-compatible endpoints  
- future provider endpoints  

---

## 2. Why this direction

| Without BYOK | With BYOK |
|----------------|-----------|
| Backend pays for inference | User pays for their inference |
| Scaling users scales your bill | Platform scales as control plane |
| Vendor lock-in risk | Model-agnostic posture |
| Model choice constrained by infra | Enterprise uses own procurement |

---

## 3. What MobiusSDK is

A normalized **client + API** layer for:

- inference  
- journal  
- EPICON  
- wallet  
- vault  
- task state  
- permissions  
- model routing  

### Responsibilities (non-exhaustive)

- register provider config  
- store **encrypted** provider key reference (never raw key in client logs)  
- submit inference through Mobius gateway  
- attach outputs to journal / ledger when policy allows  
- record provenance and usage metadata  
- enforce scopes and rate limits  

---

## 4. Canonical architecture

```text
Client App / Browser Shell / Terminal / External App
                |
                v
           MobiusSDK Client
                |
                v
         Mobius Gateway / BFF
      (identity + routing + policy)
          /         |          \
         /          |           \
        v           v            v
 Provider Adapter  Journal     Ledger / MIC / Vault
 (OpenAI etc.)     / EPICON    / governance services
```

- **SDK client** — developer surface  
- **Gateway** — policy and routing authority  
- **Provider adapters** — normalized request → vendor wire format  
- **Mobius services** — source of truth for memory, canon, economics  

---

## 5. Repo placement

### A. Monorepo / Substrate — canonical home

Protocol infrastructure: auth, gateway, schemas, ledger contracts, MIC implications, adapters, SDK packages.

### Recommended layout (evolutionary target)

```text
Mobius-Substrate/
├── apps/
│   └── gateway/                  # Mobius Gateway / BFF (when introduced)
├── packages/
│   ├── mobius-sdk/               # SDK client
│   ├── provider-adapters/      # OpenAI, Anthropic, Gemini, OpenRouter, local
│   ├── inference-schema/         # normalized request/response contracts
│   └── mobius-auth/              # provider config / scopes / claims helpers
├── specs/
│   └── MOBIUS_SDK_API.md         # this document
└── services/
    └── ...                       # identity / gateway services as adopted
```

### B. Terminal — operational surface

**Should show:** provider status, adapter latency, failure rate, fallback chain, routing decisions, usage summaries, cost telemetry, tripwires on routing failure.

**Should not be:** sole implementation of adapters or only source of provider policy.

### C. Browser Shell — user configuration

Connect provider, add key, test model, defaults, budget caps, scopes — profile / settings / wallet / builder.

---

## 6. Normalized inference contract

Single normalized request shape (example).

### Request (example)

```json
{
  "task": "journal_synthesis",
  "input": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "provider": "openai",
  "model": "gpt-4.1",
  "fallbacks": ["claude-sonnet-4", "gemini-2.5-pro"],
  "scope": "journal",
  "mobius_context": {
    "cycle": "C-285",
    "agent": "ATLAS",
    "attach_to_journal": true,
    "write_provenance": true
  }
}
```

### Response (example)

```json
{
  "ok": true,
  "provider": "openai",
  "model": "gpt-4.1",
  "latency_ms": 1832,
  "usage": {
    "prompt_tokens": 1420,
    "completion_tokens": 310
  },
  "output": {
    "role": "assistant",
    "content": "..."
  },
  "provenance": {
    "request_id": "req_...",
    "timestamp": "2026-04-18T12:00:00Z",
    "mobius_scope": "journal",
    "user_key_used": true
  }
}
```

---

## 7. Provider config model

Users attach one or more providers. **Do not** store raw keys in the frontend; store **encrypted key references** server-side.

### Stored record (example)

```json
{
  "provider_id": "prov_01",
  "mobius_user_id": "usr_123",
  "provider": "openai",
  "label": "My OpenAI Key",
  "api_key_ref": "vault://usr_123/openai/main",
  "default_model": "gpt-4.1",
  "allowed_models": ["gpt-4.1", "gpt-4.1-mini"],
  "budget": {
    "monthly_usd_cap": 25,
    "daily_request_cap": 200
  },
  "scopes": ["chat", "journal", "oaa"],
  "status": "active"
}
```

---

## 8. Scopes and permissions

Scope-limit provider keys. Examples: `chat`, `journal`, `oaa`, `builder`, `research`, `terminal_read`, `terminal_admin`, `agent_runtime`.

Rationale: cheap keys for chat only; stronger models for builder; operator vs runtime separation; no unlimited inference by default.

---

## 9. Routing logic

Examples:

- user-selected provider → use it  
- model unavailable → fallbacks  
- scope disallowed → refuse  
- budget exceeded → refuse or downgrade  
- provider unhealthy → fallback  
- no BYOK → Mobius default tier / disabled (product decision)  

**Telemetry** (for Terminal): chosen provider/model, fallback used, cost metadata, failure reason, latency.

---

## 10. Cost models

- **Option A — Full BYOK:** user keys for all inference.  
- **Option B — Hybrid:** small Mobius tier + BYOK for sustained / power use (**recommended start**).  
- **Option C — Enterprise tenant:** org-shared keys; Mobius still routes and audits.

---

## 11. MIC fit

MIC must **not** depend on vendor. Any provider output can feed Mobius actions **only** through the same constitutional pathway (journal / EPICON / integrity gates / canonical events).

**Inference provider is pluggable. Mobius legitimacy is not.**

---

## 12. Security model

**Required:** encrypted key storage, server-side references, per-user scopes, rate limits, audit logs, rotation/revoke, test/probe route.

**Strongly recommended:** budget caps, provider health checks, fallback allowlist, **no raw key echo** in UI or logs.

---

## 13. Terminal responsibilities

“Inference / SDK / Providers” chamber or pane:

- provider health, fallback usage, failed auth counts  
- request volume by scope, adapter latency, error spikes  
- budget warnings  

Example card copy: `OPENAI · healthy · p95 1.8s`, `ANTHROPIC · degraded · fallback active`, etc.

---

## 14. Browser Shell responsibilities

Connect provider, add API key, default model, test inference, caps, scopes, rotate/remove.

---

## 15. Phased implementation

1. **Spec + schema** — this doc + request/response/provider JSON schemas.  
2. **Gateway + adapters** — OpenAI first; encrypted key storage.  
3. **Browser Shell UX** — connect / test / model selection.  
4. **Terminal ops** — health lane, telemetry, cost/error/fallback.  
5. **Ledger integration** — provenance on inference flows; auditable usage metadata.

### 15a. Implementation status (Substrate repo)

| Component | Path | Notes |
|-----------|------|--------|
| Types | `packages/inference-schema/` | `MobiusInferenceRequest`, `MobiusInferenceResponse`, `ProviderConfigRecord`, scopes |
| Adapters | `packages/provider-adapters/` | OpenAI-compatible POST + fallback router |
| SDK client | `packages/mobius-sdk/` | `MobiusClient` for gateway HTTP |
| Gateway (BFF) | `apps/gateway/` | Express: `POST /v1/providers`, `POST /v1/inference`, `GET /v1/telemetry`, AES-256-GCM key refs (in-memory store for dev) |

See `apps/gateway/README.md` for env vars and local run.

---

## 16. One-line canon

**Bring your own model. Bring your own key. Enter through Mobius for memory, governance, and canon.**

---

*We heal as we walk. — Mobius Substrate*
