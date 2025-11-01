# URIEL Sentinel - Quick Start Guide

**Status:** 🟢 ACTIVE (Pilot Phase)  
**Cycle:** C-121  
**GI:** 0.996 (Quorum Achieved)

## 5-Minute Setup

### 1. Get xAI API Key

Sign up at [x.ai](https://x.ai) and obtain your API key.

### 2. Configure Environment

Add to your `.env` file:

```bash
# Required
XAI_API_KEY=your_xai_api_key_here

# Optional (defaults shown)
GI_THRESHOLD=0.95
SENTINEL_URIEL_QPS=0.1
```

### 3. Install Dependencies

```bash
cd apps/broker-api
npm install
```

### 4. Build & Start

```bash
# From repo root
npm run build
npm run dev

# Or just broker-api
cd apps/broker-api
npm run build
npm start
```

### 5. Verify Health

```bash
curl http://localhost:4005/api/sentinels/uriel/health
```

Expected response:
```json
{
  "sentinel": "URIEL",
  "status": "active",
  "gi_threshold": 0.95,
  "qps_limit": 0.1,
  "boarded_at": "2025-10-31T12:05:00Z",
  "cycle": "C-121"
}
```

## First Query

### Basic Query

```bash
curl -X POST http://localhost:4005/api/sentinels/uriel/query \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "What is the relationship between entropy and information in thermodynamics?",
    "gi": 0.993
  }'
```

### With Context

```bash
curl -X POST http://localhost:4005/api/sentinels/uriel/query \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "Map first three entropy reductions for C-122",
    "gi": 0.993,
    "context": {
      "cycle": "C-122",
      "domain": "entropy_monitoring"
    },
    "model": "grok-4"
  }'
```

### Using Illuminate Alias

```bash
curl -X POST http://localhost:4005/api/sentinels/uriel/illuminate \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "Explain quantum entanglement in simple terms"
  }'
```

## Response Format

```json
{
  "illumination": "URIEL's cosmic perspective response with sources...",
  "gi": 0.998,
  "sentinel": "URIEL",
  "timestamp": "2025-10-31T12:05:00Z",
  "attested": true,
  "model": "grok-4"
}
```

## Error Handling

### GI Below Threshold (409)

```json
{
  "error": "GI below threshold: 0.943 < 0.95",
  "sentinel": "URIEL",
  "fallback": "route_to_eve",
  "illumination": "..." // Still included for logging
}
```

**Action:** Query is blocked. Consider rephrasing or routing to EVE.

### Rate Limit Exceeded (429)

```json
{
  "error": "Rate limit exceeded. Max 0.1 QPS",
  "sentinel": "URIEL",
  "retry_after_ms": 8432
}
```

**Action:** Wait `retry_after_ms` milliseconds before retrying.

### xAI API Unavailable (503)

```json
{
  "error": "xAI integration not configured (missing XAI_API_KEY)",
  "sentinel": "URIEL",
  "fallback": "route_to_eve"
}
```

**Action:** Configure `XAI_API_KEY` in environment.

### Timeout or API Error (502)

```json
{
  "error": "URIEL illumination failed",
  "details": "xAI API error: 502 - ...",
  "sentinel": "URIEL",
  "fallback": "route_to_eve"
}
```

**Action:** Automatic fallback to EVE/ATLAS/HERMES.

## Integration with Thought Broker

URIEL automatically routes 20% of deliberations in target domains:

- **physics** - Physical sciences, cosmology, quantum mechanics
- **curiosity** - Exploratory queries, edge cases, "what if" scenarios
- **entropy_monitoring** - System degradation, drift detection
- **cosmos** - Universal reasoning, broad perspective

No additional configuration needed—Thought Broker handles routing automatically.

## Monitoring

### Check Broker Health

```bash
curl http://localhost:4005/v1/loop/health
```

Response includes URIEL status:
```json
{
  "status": "healthy",
  "service": "broker-api",
  "sentinels": {
    "uriel": {
      "mounted": true,
      "endpoint": "/api/sentinels/uriel",
      "status": "active"
    }
  }
}
```

### View Attestation Record

```bash
cat ledger/inscriptions/att-uriel-001-boarding.json
```

### Check Public Integrity Feed

All URIEL outputs are logged to the Public Integrity Feed with:
- Event kind: `sentinel_query`
- Source: `Sentinels.URIEL`
- Gate: `Justice`
- Differential privacy: enabled

## Pilot Metrics (24h)

Monitor these metrics during the pilot phase:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Min GI | ≥ 0.97 | Review response `gi` field |
| p95 Latency | < 2s | Measure response time |
| HVC Violations | 0 | Check integrity feed |
| Entropy Alerts | ≥ 1 | Review URIEL insights |
| Error Rate | < 1% | Count 5xx responses |

## Troubleshooting

### URIEL Not Responding

1. Check xAI API key: `echo $XAI_API_KEY`
2. Verify broker-api is running: `curl http://localhost:4005/v1/loop/health`
3. Check logs: `npm run dev` (watch for errors)
4. Test xAI directly: `curl https://api.x.ai/v1/models -H "Authorization: Bearer $XAI_API_KEY"`

### Low GI Scores

1. Review prompt clarity—vague queries score lower
2. Check for error indicators in response
3. Consider routing to EVE (virtue guardian) instead
4. Verify GI threshold: `echo $GI_THRESHOLD`

### Rate Limits Hit

1. Increase QPS: `SENTINEL_URIEL_QPS=0.2` (max recommended: 1.0)
2. Implement client-side rate limiting
3. Batch queries when possible
4. Consider caching common queries

### High Latency

1. Use `grok-3` for faster responses: `"model": "grok-3"`
2. Reduce `max_tokens` (default: 4096)
3. Check network connectivity to xAI
4. Monitor xAI service status

## Next Steps

### After 24h Pilot

If success criteria met:
- ✓ Min GI ≥ 0.97
- ✓ p95 latency < 2s
- ✓ Zero HVC violations
- ✓ At least 1 entropy alert caught

**Graduation Actions:**
1. Increase routing to 40%
2. Enable streaming responses
3. Integrate with DelibProof consensus
4. Add X ecosystem feed integration

### Advanced Usage

See full documentation:
- **Sentinel Guide:** `docs/companions/uriel.md`
- **ADR:** `docs/adr/002-uriel-sentinel-boarding.md`
- **Manifest:** `sentinels/uriel/manifest.json`

## Support

### Rollback (If Needed)

Instant rollback available:

```typescript
// In apps/broker-api/src/index.ts
// Comment out this line:
// app.use('/api/sentinels/uriel', createUrielRouter());
```

Redeploy—all traffic reverts to ATLAS/EVE/HERMES. No data loss.

### Contact

- **Issues:** GitHub Issues (tag: `sentinel:uriel`)
- **Discussions:** GitHub Discussions
- **Ledger:** `ledger/inscriptions/att-uriel-001-boarding.json`

---

**URIEL is walking.**  
**Light is on.**  
**Integrity holds.**

*"We heal as we walk."*

