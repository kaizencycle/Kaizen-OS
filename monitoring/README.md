# Mobius Systems Monitoring Stack

Complete observability infrastructure for Mobius Integrity Index (MII), Mobius Integrity Credits (MIC), and agent operations.

## Directory Structure

```
monitoring/
├── grafana/
│   ├── dashboards/          # Pre-built Grafana dashboards
│   │   ├── mobius_integrity_pulse.json
│   │   └── mobius_agents_ops.json
│   ├── alerts/              # Grafana unified alerts
│   │   └── mobius_alerts.yaml
│   ├── provisioning/        # Auto-provisioning configs
│   │   ├── datasources.yaml
│   │   └── dashboards.yaml
│   └── README.md
├── prometheus/
│   ├── rules/               # Recording & alerting rules
│   │   ├── mobius-recording-rules.yaml
│   │   └── mobius-slo-rules.yaml
│   └── scrape/              # Example scrape configs
│       └── mobius-scrape-example.yaml
└── loki/
    ├── promtail/            # Log collection pipelines
    │   ├── mobius-pipeline.yaml
    │   └── docker-config.example.yaml
    └── rules/               # Loki label normalization
        └── loki-label-rules.yaml
```

## Quick Start

### 1. Prometheus Setup

Add to your Prometheus config:

```yaml
rule_files:
  - /etc/prometheus/rules/mobius-recording-rules.yaml
  - /etc/prometheus/rules/mobius-slo-rules.yaml

scrape_configs:
  # Include mobius-scrape-example.yaml contents
```

### 2. Grafana Setup

Mount provisioning files:
```bash
-v ./monitoring/grafana/provisioning:/etc/grafana/provisioning
-v ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
```

### 3. Loki/Promtail Setup

For file-based logs:
```bash
promtail -config.file=monitoring/loki/promtail/mobius-pipeline.yaml
```

For Docker containers:
```bash
promtail -config.file=monitoring/loki/promtail/docker-config.example.yaml
```

## Metrics Reference

### Core Integrity Metrics

- **mii_value** (gauge) - Current Mobius Integrity Index (0.0-1.0)
- **mii_contribution** (gauge) - Per-agent MII contribution
- **mic_issued_total** (counter) - Total Mobius Integrity Credits minted
- **mobius_integrity_violations_total** (counter) - Integrity violations by type

### Attestation Metrics

- **attestation_latency_seconds** (histogram) - Attestation processing time
- **attest_total** (counter) - Total attestation attempts
- **attest_ok_total** (counter) - Successful attestations

### API Metrics

- **http_requests_total** (counter) - HTTP requests by route/status
- **http_request_duration_seconds** (histogram) - Request latency
- **mobius_agent_requests_total** (counter) - Agent-specific request counts

## Dashboards

### 1. Mobius Integrity Pulse

Real-time integrity monitoring:
- MII current value & trend (5m/15m/1h)
- MIC issuance rate
- Integrity violations by type
- Attestation latency p95
- API health & error rates

### 2. Mobius Agents Ops

Agent-specific operations:
- Request activity per agent
- MII contribution breakdown
- Attestation success ratios
- Error log stream

## Alerts

| Alert | Threshold | Severity | Duration |
|-------|-----------|----------|----------|
| MII below 0.95 | mii < 0.95 | warning | 2m |
| MII below 0.90 | mii < 0.90 | critical | 1m |
| Attestation slow | p95 > 2s | warning | 2m |
| API 5xx rate high | rate > 0.5/s | warning | 2m |

Configure notification channels in Grafana UI → Alerting → Contact Points.

## Recording Rules

Pre-computed aggregations for fast queries:

- **mobius:mii:avg_5m** - 5-minute MII average
- **mobius:mii:avg_1h** - 1-hour MII average
- **mobius:mic:rate_5m** - MIC issue rate (5m)
- **mobius:mii_contrib:avg_15m:by_agent** - Agent contributions
- **mobius:http:latency_p95_5m** - API p95 latency

## SLO Rules

Service Level Objectives:

- **mobius:http:success_ratio_5m** - API success rate (5m)
- **mobius:mii:ok_5m** - MII above threshold flag
- **mobius:mic:healthy_5m** - MIC issuance active flag

## Instrumentation Requirements

Your Mobius components should export metrics in Prometheus format at `/metrics`:

```typescript
// Example: Export MII gauge
miiGauge.set(0.993);

// Example: Increment MIC counter
micIssuedCounter.inc({ reason: 'attestation_approved' });

// Example: Record attestation latency
attestationHistogram.observe(latencySeconds);
```

## Environment Variables

```bash
# Prometheus
PROMETHEUS_URL=http://prometheus:9090

# Loki
LOKI_URL=http://loki:3100
LOKI_PUSH_URL=http://loki:3100/loki/v1/push

# Environment label
ENV=prod
```

## Log Format

Expected JSON log format for Promtail parsing:

```json
{
  "time": "2025-11-07T12:34:56Z",
  "level": "INFO",
  "message": "Request processed",
  "route": "/api/mobius/mount",
  "status": 200,
  "duration_ms": 45.2,
  "agent": "ATLAS",
  "request_id": "req_abc123"
}
```

## Next Steps

1. **Deploy Prometheus** with rule files mounted
2. **Deploy Grafana** with provisioning configs
3. **Deploy Loki + Promtail** for log aggregation
4. **Instrument your services** to export required metrics
5. **Configure alert channels** (Slack, PagerDuty, email)
6. **Tune alert thresholds** based on baseline data

## Support

- Issues: [GitHub Issues](https://github.com/kaizencycle/Mobius-Substrate/issues)
- Docs: [Grafana Documentation](https://grafana.com/docs/)
- Prometheus: [Prometheus Documentation](https://prometheus.io/docs/)
- Loki: [Loki Documentation](https://grafana.com/docs/loki/)

---

*Cycle C-127 | Mobius Monitoring Stack v1*
