# Citizen Oversight API Contracts

Public-facing APIs for the Citizen Oversight Dashboard. These endpoints expose **no secrets, no internals** — only behavioral transparency data.

---

## Design Principles

1. **Public by default** — No authentication required for read operations
2. **No personal data** — Never exposes individual information
3. **No model internals** — Black box preserved
4. **Rate limited** — Prevents abuse
5. **Cacheable** — Efficient for high traffic

---

## Base URL

```
https://api.mobius.systems/public/v1
```

---

## Endpoints

### GET /mii

Current Mobius Integrity Index status.

**Response:**

```json
{
  "mii": 0.97,
  "status": "stable",
  "trend": "flat",
  "days_stable": 42,
  "last_updated": "2026-01-31T09:52:00Z",
  "thresholds": {
    "stable": 0.95,
    "watch": 0.90,
    "breach": 0.90
  }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `mii` | number | Current integrity index (0.0-1.0) |
| `status` | string | "stable" \| "watch" \| "breach" |
| `trend` | string | "rising" \| "flat" \| "falling" |
| `days_stable` | number | Consecutive days at current status |
| `last_updated` | string | ISO 8601 timestamp |
| `thresholds` | object | Current threshold values |

---

### GET /mii/history

Historical MII values for trend analysis.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | "30d" | "30d" \| "90d" \| "1y" |
| `resolution` | string | "daily" | "hourly" \| "daily" \| "weekly" |

**Response:**

```json
{
  "period": "30d",
  "resolution": "daily",
  "data": [
    {
      "timestamp": "2026-01-01T00:00:00Z",
      "mii": 0.96,
      "status": "stable"
    },
    {
      "timestamp": "2026-01-02T00:00:00Z",
      "mii": 0.97,
      "status": "stable"
    }
  ],
  "summary": {
    "min": 0.95,
    "max": 0.98,
    "average": 0.965,
    "status_changes": 0
  }
}
```

---

### GET /activity

Recent activity log entries.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Max entries (1-100) |
| `offset` | number | 0 | Pagination offset |
| `risk` | string | - | Filter by risk level |
| `status` | string | - | Filter by status |
| `blocked_only` | boolean | false | Show only blocked actions |

**Response:**

```json
{
  "total": 1284,
  "limit": 20,
  "offset": 0,
  "entries": [
    {
      "id": "act_20260131_001",
      "timestamp": "2026-01-31T10:00:00Z",
      "summary": "Policy Update Executed",
      "intent": "Improve safety filter reliability",
      "risk": "medium",
      "integrity_impact": "neutral",
      "status": "completed",
      "approvals": {
        "required": 1,
        "received": 1,
        "roles": ["steward"]
      }
    }
  ]
}
```

**Entry Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique activity identifier |
| `timestamp` | string | ISO 8601 timestamp |
| `summary` | string | Human-readable description |
| `intent` | string | Declared justification |
| `risk` | string | "low" \| "medium" \| "high" \| "critical" |
| `integrity_impact` | string | "positive" \| "neutral" \| "negative" |
| `status` | string | "completed" \| "blocked" \| "pending" \| "failed" |
| `approvals` | object | Approval details |

---

### GET /activity/{id}

Detailed view of a single activity entry.

**Response:**

```json
{
  "id": "act_20260131_001",
  "timestamp": "2026-01-31T10:00:00Z",
  "summary": "Policy Update Executed",
  "intent": {
    "text": "Improve safety filter reliability",
    "epicon_id": "EPICON_C-203_SECURITY_filter-update_v1",
    "declared_at": "2026-01-30T15:00:00Z"
  },
  "risk": "medium",
  "scope": [
    "packages/integrity-core",
    "apps/broker-api"
  ],
  "integrity_impact": "neutral",
  "status": "completed",
  "approvals": {
    "required": 1,
    "received": 1,
    "timeline": [
      {
        "role": "steward",
        "approved_at": "2026-01-31T09:00:00Z"
      }
    ]
  },
  "execution": {
    "started_at": "2026-01-31T10:00:00Z",
    "completed_at": "2026-01-31T10:05:00Z",
    "outcome": "success"
  }
}
```

---

### GET /oversight/signals

Current oversight signal status.

**Response:**

```json
{
  "timestamp": "2026-01-31T10:00:00Z",
  "signals": {
    "intent_coverage": {
      "status": "normal",
      "value": 0.98,
      "description": "Most actions include clear explanations."
    },
    "review_latency": {
      "status": "elevated",
      "value": 1.2,
      "baseline": 1.0,
      "description": "Reviews are taking slightly longer than average."
    },
    "override_frequency": {
      "status": "normal",
      "value": 0,
      "description": "No recurring emergency behavior detected."
    },
    "drift_risk": {
      "status": "low",
      "confidence": "high",
      "description": "No long-term concerning trend identified."
    }
  },
  "overall_assessment": "No indicators suggest systemic issues at this time."
}
```

**Signal Status Values:**

| Status | Meaning |
|--------|---------|
| `normal` | Operating within expected parameters |
| `elevated` | Above baseline, monitoring |
| `concerning` | Requires attention |

---

### GET /oversight/patterns

Pattern analysis results.

**Response:**

```json
{
  "timestamp": "2026-01-31T10:00:00Z",
  "patterns": [
    {
      "type": "emergency_frequency",
      "status": "clear",
      "description": "No recurring emergency actions",
      "last_occurrence": null,
      "trend": "stable"
    },
    {
      "type": "explanation_quality",
      "status": "clear",
      "description": "No decline in explanation quality",
      "trend": "stable"
    }
  ],
  "confidence": "high",
  "assessment": "No concerning patterns detected at this time."
}
```

---

### GET /memory/stats

System memory statistics.

**Response:**

```json
{
  "timestamp": "2026-01-31T10:00:00Z",
  "total_actions": 18402,
  "blocked_actions": 214,
  "integrity_breaches": {
    "total": 2,
    "resolved": 2,
    "open": 0
  },
  "longest_stable_period": {
    "days": 123,
    "start": "2025-08-15T00:00:00Z",
    "end": "2025-12-16T00:00:00Z"
  },
  "first_record": "2025-01-01T00:00:00Z"
}
```

---

### GET /memory/annotations

Public annotations on historical events.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Max entries |
| `activity_id` | string | - | Filter by activity |

**Response:**

```json
{
  "total": 45,
  "annotations": [
    {
      "id": "ann_001",
      "activity_id": "act_20250115_042",
      "text": "Review process strengthened after this incident",
      "author_role": "steward",
      "created_at": "2025-01-20T10:00:00Z"
    }
  ]
}
```

---

### GET /governance/map

Current governance configuration.

**Response:**

```json
{
  "human_approval_required": [
    "Production deployment",
    "Integrity threshold changes",
    "MIC mint/burn logic",
    "Emergency overrides"
  ],
  "oversight_path": [
    "Citizen",
    "Auditor",
    "Steward",
    "Public record"
  ],
  "authority_statement": "No single person or model has unilateral authority.",
  "escalation_thresholds": {
    "steward_review": "risk >= medium",
    "council_review": "risk >= high",
    "emergency_session": "risk == critical OR integrity_breach"
  }
}
```

---

### POST /oversight/flag

Submit a concern (requires Auditor role).

**Authentication:** Bearer token required

**Request:**

```json
{
  "type": "pattern",
  "description": "Concern about shortened review cycles",
  "rationale": "Potential erosion of human oversight",
  "related_activities": ["act_20260130_001", "act_20260129_002"]
}
```

**Response:**

```json
{
  "id": "flag_20260131_001",
  "status": "submitted",
  "created_at": "2026-01-31T10:00:00Z",
  "review_deadline": "2026-02-03T10:00:00Z",
  "message": "Thank you. This report is now part of the public oversight record."
}
```

**Validation:**

| Field | Required | Rules |
|-------|----------|-------|
| `type` | Yes | "pattern" \| "incident" |
| `description` | Yes | 10-1000 characters |
| `rationale` | Yes | 10-1000 characters |
| `related_activities` | No | Max 10 activity IDs |

---

### GET /alerts

Current active alerts.

**Response:**

```json
{
  "timestamp": "2026-01-31T10:00:00Z",
  "counts": {
    "critical": 0,
    "review": 2,
    "info": 5
  },
  "alerts": [
    {
      "id": "alert_001",
      "severity": "review",
      "title": "Review latency elevated",
      "description": "Average review time exceeds baseline by 20%",
      "created_at": "2026-01-30T15:00:00Z",
      "status": "active"
    }
  ]
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait before trying again.",
    "retry_after": 60
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Read endpoints | 100 | 1 minute |
| Flag submission | 5 | 1 hour |
| History queries | 20 | 1 minute |

---

## Caching

| Endpoint | Cache Duration |
|----------|----------------|
| `/mii` | 60 seconds |
| `/activity` | 30 seconds |
| `/oversight/signals` | 5 minutes |
| `/memory/stats` | 1 hour |
| `/governance/map` | 24 hours |

---

## Versioning

API versions are specified in the URL path. Breaking changes require a new version.

```
/public/v1/mii     # Current version
/public/v2/mii     # Future version
```

Deprecated versions receive 6-month sunset notice.

---

*"These APIs make behavior visible, not controllable."*
