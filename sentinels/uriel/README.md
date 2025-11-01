# 🕯️🔥 URIEL Sentinel - Kaizen OS

**Cycle:** C-121  
**Provider:** xAI Grok  
**Status:** Active - GI-Gated Pilot  

---

## 🧭 Overview

URIEL is the Cosmic Illuminator sentinel in Kaizen OS, bringing xAI Grok's unfiltered curiosity and truth-seeking capabilities to the Thought Broker system.

**Key Features:**
- 🎯 GI-gated responses (≥ 0.95 threshold)
- 🧠 Deep cosmic reasoning (Grok-4) and lightweight queries (Grok-3)
- 📐 Domain specialization: physics, curiosity, entropy monitoring, deliberation proofs
- 🔐 Virtue Accord compliance (Kaizen, Summon, Kintsugi)
- 📝 Rate-limited (0.1 QPS default) with automatic fallback to EVE

---

## 🏗️ Integration Points

### 1. Thought Broker (`apps/broker-api/src/consensus/uriel.ts`)
- xAI Grok API integration
- GI attestation with virtue accord checks
- Rate limiting and error handling

### 2. Broker API Endpoint (`apps/broker-api/src/index.ts`)
- POST `/api/sentinels/uriel/query`
- Accepts intent, optional GI context, and domain
- Returns illuminated response with GI score

### 3. Sentinel Manifest (`sentinels/uriel/manifest.json`)
- Sentinel metadata and configuration
- Mount endpoint declaration
- Limits and fallback configuration

---

## ⚙️ Configuration

```bash
# Required Environment Variables
XAI_API_KEY=<your-xai-api-key>

# Optional Configuration
XAI_BASE_URL=https://api.x.ai/v1  # Default
URIEL_MODEL=grok-beta              # Default
URIEL_MAX_TOKENS=4096              # Default
URIEL_TIMEOUT_MS=20000             # Default
SENTINEL_URIEL_QPS=0.1             # Default (10s between calls)
```

---

## 🧪 API Usage

### POST `/api/sentinels/uriel/query`

**Request:**
```json
{
  "intent": "Map first three entropy reductions for C-122",
  "gi": 0.993,
  "domain": "entropy"
}
```

**Response:**
```json
{
  "illumination": "Top 3 entropy sinks for C-122:\n1. **DelibProof drift**...",
  "gi": 0.998,
  "sentinel": "URIEL",
  "uriel_sig": "light-7b2f1a3c",
  "usage": {
    "totalTokens": 1024,
    "latencyMs": 1400
  }
}
```

### Error Responses

**GI Below Threshold (409 Conflict):**
```json
{
  "error": "GI below threshold: 0.942; route_to=eve",
  "route_to": "eve"
}
```

**API Key Missing (503 Service Unavailable):**
```json
{
  "error": "xAI key missing",
  "message": "URIEL requires XAI_API_KEY to be configured"
}
```

---

## 📊 GI Attestation

URIEL automatically attests GI scores for all responses:

- **Base Score:** 0.95 (virtue accord compliance)
- **Boosts:**
  - +0.01 for substantive responses (>200 chars)
  - +0.02 for Summon (truth-seeking) keywords
  - +0.01 for Kaizen keywords
  - +0.01 for Kintsugi keywords
  - +0.02-0.05 for domain-specific keyword matches
- **Penalties:**
  - -0.02 for responses <50 chars

**Threshold:** GI ≥ 0.95 required, otherwise routes to EVE

---

## 🔒 Guardrails

1. **GI Gate:** Responses below 0.95 GI automatically fail
2. **Rate Limits:** 0.1 QPS default (configurable via `SENTINEL_URIEL_QPS`)
3. **Token Limits:** 4096 tokens max (configurable via `URIEL_MAX_TOKENS`)
4. **Timeout:** 20s timeout (configurable via `URIEL_TIMEOUT_MS`)
5. **Fallback:** Routes to EVE sentinel on GI violations

---

## 🧪 Health Check

```bash
curl -X POST http://localhost:4005/api/sentinels/uriel/query \
  -H "Content-Type: application/json" \
  -d '{"intent":"Test illumination","gi":0.993}'
```

---

## 📊 Pilot Metrics

**Target Metrics (24h):**
- Min GI: ≥ 0.97
- p95 Latency: < 2s
- HVC Violations: 0
- Entropy Alerts Caught: ≥ 1

**Current Status:**
- ✅ Mounted and active
- ✅ GI-gated pilot (20% deliberation routing)
- ⏳ Monitoring phase

---

## 🚀 Rollout Plan

1. **Phase 1 (Current):** GI-gated pilot, 20% routing
2. **Phase 2 (After 24h):** If GI ≥ 0.97, increase to 35-40% routing
3. **Phase 3:** Full integration based on metrics

---

## 🔄 Rollback

To disable URIEL:

1. Remove router import from `apps/broker-api/src/index.ts`
2. Redeploy broker-api
3. All traffic reverts to ATLAS/EVE/HERMES

No data loss: prior attestations remain in ledger.

---

**GI Score:** 0.996 (Quorum Attestation)  
**Next Review:** C-122 (24h monitoring complete)

---

*Light reveals the path; integrity illuminates the way.* 🕯️🔥

