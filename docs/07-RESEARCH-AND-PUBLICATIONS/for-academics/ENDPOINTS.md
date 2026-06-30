# Research Cathedral — API Endpoints

**Version**: C-151  
**Cathedral**: FOR-ACADEMICS  
**Base URL**: `https://terminal.mobius-substrate.com/academics`

---

## Overview

The Research Cathedral provides programmatic access to research data, papers, citations, and system snapshots for academic research and analysis.

**Full API Specification**: [endpoints.json](./endpoints.json)

---

## Endpoints

### 1. Complete System Dataset

**Endpoint**: `GET /dataset.json`

**Description**: Complete system snapshot for research analysis. Contains full system state including cycles, MII baseline, sentinels, apps, and packages.

**Format**: JSON

**Update Frequency**: Every 6 hours

**Schema**:
```json
{
  "cycle": "string",
  "mii_baseline": "number",
  "sentinels": "array",
  "apps": "array",
  "packages": "array"
}
```

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/academics/dataset.json
```

**Example Response**:
```json
{
  "cycle": "C-151",
  "mii_baseline": 0.97,
  "sentinels": [
    {
      "id": "ATLAS",
      "score": 0.98,
      "cathedral": "FOR-GOVERNMENTS"
    }
  ],
  "apps": [...],
  "packages": [...]
}
```

**Use Cases**:
- System-wide research analysis
- Reproducibility studies
- Baseline comparisons
- Academic research papers

---

### 2. MII Timeline

**Endpoint**: `GET /mii-timeline.csv`

**Description**: 30-day historical timeline of Mobius Integrity Index (MII) scores for economic modeling and trend analysis.

**Format**: CSV

**Columns**:
- `timestamp` — ISO 8601 timestamp
- `mii_score` — Mobius Integrity Index (0.0-1.0)
- `cycle` — Cycle identifier (e.g., "C-151")
- `sentinel_count` — Number of active sentinels

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/academics/mii-timeline.csv
```

**Example Response**:
```csv
timestamp,mii_score,cycle,sentinel_count
2025-12-01T00:00:00Z,0.97,C-151,10
2025-11-30T00:00:00Z,0.96,C-150,10
...
```

**Use Cases**:
- Economic modeling
- Trend analysis
- Time series research
- Statistical validation

---

### 3. Sentinel Coordination Data

**Endpoint**: `GET /sentinel-coordination.json`

**Description**: Sentinel performance metrics and coordination data for multi-agent system research.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/academics/sentinel-coordination.json
```

**Example Response**:
```json
{
  "timestamp": "2025-12-01T00:00:00Z",
  "sentinels": [
    {
      "id": "ATLAS",
      "coordination_score": 0.95,
      "uptime_days": 30,
      "cathedral": "FOR-GOVERNMENTS"
    }
  ],
  "average_coordination": 0.92,
  "consensus_rate": 0.88
}
```

**Use Cases**:
- Multi-agent system research
- Coordination mechanism studies
- Consensus algorithm validation
- Distributed systems research

---

### 4. Papers Index

**Endpoint**: `GET /papers.json`

**Description**: Complete index of published and working papers with metadata, status, and citation information.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/academics/papers.json
```

**Example Response**:
```json
{
  "papers": [
    {
      "id": "SML-2025",
      "title": "Strange Metamorphosis Loop: Human-Aligned Recursive Learning",
      "status": "ready_for_submission",
      "venues": ["NeurIPS", "ICML", "AAAI"],
      "key_result": "97% drift prevention",
      "path": "FOR-ACADEMICS/PAPERS/SML/"
    }
  ]
}
```

**Use Cases**:
- Literature reviews
- Citation tracking
- Research collaboration
- Academic networking

---

### 5. Citations Database

**Endpoint**: `GET /citations.bib`

**Description**: Complete BibTeX citation database for academic papers and publications.

**Format**: BibTeX

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/academics/citations.bib
```

**Example Response**:
```bibtex
@software{mobius2025,
  title={Mobius Systems: Operating System for Recursive Intelligence},
  author={Judan, Michael},
  year={2025},
  url={https://github.com/kaizencycle/Mobius-Substrate},
  note={AGPL-3.0 with Ethical Addendum}
}
```

**Use Cases**:
- Academic citations
- Bibliography generation
- Reference management
- Paper submissions

---

## Rate Limits

| Tier | Limit | Description |
|------|-------|-------------|
| **Anonymous** | 100 requests/day | Public access without authentication |
| **Academic** | 1,000 requests/day | Requires academic email verification |
| **Institutional** | 10,000 requests/day | Requires partnership agreement |

### Requesting Academic Access

1. Email `academics@mobius.systems` with:
   - Academic affiliation
   - Research purpose
   - Expected usage volume
2. Receive API key via email
3. Include `Authorization: Bearer <api_key>` header

### Requesting Institutional Access

Contact `academics@mobius.systems` for partnership discussions.

---

## Contact & Support

- **Research Inquiries**: academics@mobius.systems
- **Dataset Requests**: Open GitHub issue with `academic-data` label
- **Office Hours**: Tuesdays 14:00 UTC (Discord)

---

## Related Documentation

- [Research Cathedral Overview](./README.md)
- [Papers Directory](./PAPERS/)
- [Research Data](./RESEARCH-DATA/)
- [Complete API Specification](./endpoints.json)

---

**Mobius Systems Foundation** • Cycle C-151 • Research Cathedral
