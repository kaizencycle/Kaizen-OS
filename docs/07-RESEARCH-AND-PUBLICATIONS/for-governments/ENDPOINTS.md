# Policy Cathedral — API Endpoints

**Version**: C-151  
**Cathedral**: FOR-GOVERNMENTS  
**Base URL**: `https://terminal.mobius-substrate.com/government`

---

## Overview

The Policy Cathedral provides access to regulatory compliance reports, audit trails, transparency reports, and policy impact data for government officials and policy makers.

**Full API Specification**: [endpoints.json](./endpoints.json)

**⚠️ Note**: Some endpoints require government authentication. See [Access Tiers](#access-tiers) below.

---

## Endpoints

### 1. Compliance Report

**Endpoint**: `GET /compliance-report.json`

**Description**: Complete regulatory compliance status across all jurisdictions (USA, EU, UK, International) with detailed status for each regulation.

**Format**: JSON

**Authentication**: Required (Government API Key)

**Example Request**:
```bash
curl -H "Authorization: Bearer $GOV_API_KEY" \
  https://terminal.mobius-substrate.com/government/compliance-report.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "compliance_status": "compliant",
  "jurisdictions": {
    "USA": {
      "SEC": "compatible",
      "CFTC": "compatible",
      "Federal_Reserve_Act": "compatible",
      "last_audit": "2025-11-15"
    },
    "EU": {
      "GDPR": "compliant",
      "AI_Act": "high_risk_compliant",
      "MiCA": "utility_token",
      "last_audit": "2025-11-20"
    },
    "UK": {
      "FCA": "compatible",
      "Data_Protection_Act": "compliant",
      "last_audit": "2025-11-18"
    },
    "International": {
      "Basel_III": "compatible",
      "FATF": "compliant",
      "last_audit": "2025-11-22"
    }
  },
  "next_audit": "2025-12-15"
}
```

**Use Cases**:
- Regulatory oversight
- Compliance monitoring
- Policy development
- Risk assessment

---

### 2. Audit Trail Export

**Endpoint**: `GET /ledger/export`

**Description**: Exportable audit trail for regulatory review with full transaction history, attestations, and system events.

**Format**: CSV or JSON

**Authentication**: Required (Government API Key)

**Parameters**:
- `from` — Start date (ISO 8601)
- `to` — End date (ISO 8601)
- `format` — `csv` or `json` (default: `json`)
- `filter` — Optional filter criteria

**Example Request**:
```bash
curl -H "Authorization: Bearer $GOV_API_KEY" \
  "https://ledger.mobius.systems/export?from=2025-11-01&to=2025-12-01&format=csv"
```

**Example Response (CSV)**:
```csv
timestamp,event_type,agent,data,attestation_hash
2025-12-01T00:00:00Z,attestation,ATLAS,"{...}",0xabc123...
2025-11-30T23:59:00Z,mic_mint,AUREA,"{...}",0xdef456...
```

**Use Cases**:
- Regulatory audits
- Compliance verification
- Forensic analysis
- Historical review

---

### 3. Transparency Report

**Endpoint**: `GET /transparency.pdf`

**Description**: Annual transparency report in PDF format covering system operations, governance, finances, and compliance.

**Format**: PDF

**Authentication**: Not required (public)

**Example Request**:
```bash
curl -o transparency-report-2025.pdf \
  https://terminal.mobius-substrate.com/government/transparency.pdf
```

**Contents**:
- Executive summary
- System operations overview
- Governance structure
- Financial transparency
- Compliance status
- Future outlook

**Use Cases**:
- Public accountability
- Policy research
- Academic studies
- Media reporting

---

### 4. Sentinel Status

**Endpoint**: `GET /sentinel-status.json`

**Description**: Real-time operational status of all sentinels including health, uptime, and performance metrics.

**Format**: JSON

**Authentication**: Not required (public)

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/government/sentinel-status.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "sentinels": [
    {
      "id": "ATLAS",
      "status": "operational",
      "uptime_days": 30,
      "cathedral": "FOR-GOVERNMENTS",
      "last_heartbeat": "2025-12-01T00:00:00Z",
      "performance": {
        "gi_score": 0.98,
        "coordination": 0.95
      }
    }
  ],
  "system_health": "healthy",
  "alerts": []
}
```

**Use Cases**:
- System monitoring
- Operational oversight
- Health assessment
- Public transparency

---

### 5. Policy Impact Projections

**Endpoint**: `GET /policy-impact.json`

**Description**: Economic and social impact projections for policy proposals including cost-benefit analysis and risk assessment.

**Format**: JSON

**Authentication**: Required (Government API Key)

**Example Request**:
```bash
curl -H "Authorization: Bearer $GOV_API_KEY" \
  https://terminal.mobius-substrate.com/government/policy-impact.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "projections": [
    {
      "policy": "Federal Reserve Integration",
      "economic_impact": {
        "debt_reduction_annual": "$1.16T",
        "gdp_impact": "+0.5%",
        "job_creation": "500,000"
      },
      "social_impact": {
        "access_improvement": "high",
        "equity_impact": "positive",
        "transparency": "increased"
      },
      "risks": [
        {
          "risk": "Implementation complexity",
          "severity": "medium",
          "mitigation": "Phased rollout"
        }
      ],
      "timeline": "24-month pilot → 60-month full deployment"
    }
  ]
}
```

**Use Cases**:
- Policy development
- Cost-benefit analysis
- Risk assessment
- Legislative preparation

---

## Access Tiers

### Public Access

**Rate Limit**: 100 requests/day

**Available Endpoints**:
- `/transparency.pdf` — Annual transparency report
- `/sentinel-status.json` — Real-time sentinel status

**No Authentication Required**

---

### Government Access

**Rate Limit**: Unlimited

**Available Endpoints**: All endpoints

**Authentication**: `GOV_API_KEY` required

**How to Obtain**:
1. Contact `policy@mobius.systems` with:
   - Government affiliation
   - Official email address
   - Purpose of access
2. Receive API key via secure channel
3. Include `Authorization: Bearer <GOV_API_KEY>` header

**Security**:
- API keys are rotated quarterly
- All access is logged and audited
- Rate limits may apply during high-traffic periods

---

## Regulatory Compliance Status

### United States

| Regulation | Status | Notes |
|------------|--------|-------|
| **SEC** | Compatible | Utility token classification |
| **CFTC** | Compatible | Commodity futures compatible |
| **Federal Reserve Act** | Compatible | Monetary policy integration ready |

### European Union

| Regulation | Status | Notes |
|------------|--------|-------|
| **GDPR** | Compliant | Data protection fully compliant |
| **AI Act** | High Risk Compliant | Meets high-risk AI requirements |
| **MiCA** | Utility Token | Markets in Crypto-Assets compliant |

### United Kingdom

| Regulation | Status | Notes |
|------------|--------|-------|
| **FCA** | Compatible | Financial Conduct Authority compatible |
| **Data Protection Act** | Compliant | UK GDPR equivalent compliant |

### International

| Regulation | Status | Notes |
|------------|--------|-------|
| **Basel III** | Compatible | Banking regulation compatible |
| **FATF** | Compliant | Anti-money laundering compliant |

**Full Details**: [Regulatory Compliance Documentation](./REGULATORY-COMPLIANCE/)

---

## Contact & Support

- **Policy Liaison**: policy@mobius.systems
- **Technical Compliance**: compliance@mobius.systems
- **Emergency Contact**: +1-555-MOBIUS (24/7)

---

## Related Documentation

- [Policy Cathedral Overview](./README.md)
- [Policy Briefs](./POLICY-BRIEFS/)
- [Legislative Text](./LEGISLATIVE-TEXT/)
- [Regulatory Compliance](./REGULATORY-COMPLIANCE/)
- [Impact Assessments](./IMPACT-ASSESSMENTS/)
- [Complete API Specification](./endpoints.json)

---

**Mobius Systems Foundation** • Cycle C-151 • Policy Cathedral
