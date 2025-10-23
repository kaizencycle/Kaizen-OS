# 🚀 Health Sentinel Deployment Guide

This guide covers deploying the complete Health Sentinel system to Render for monitoring your DVA ecosystem.

## Overview

The Health Sentinel system consists of:

1. **Health Sentinel** (`sentinel/`) - Monitors service health endpoints
2. **Global Health Sentinel** (`global-health-sentinel/`) - Tracks public health/climate signals
3. **Echo Bridge** - Unifies all telemetry into system heartbeat
4. **Frontend Status Panel** - React component for real-time monitoring

## Render Services Setup

### 1. Health Sentinel (Background Worker)

**Service Type:** Background Worker
**Root Directory:** `/`
**Start Command:** `python sentinel/sentinel.py loop`

**Environment Variables:**
```
LAB4_URL=https://hive-api-2le8.onrender.com/health
LAB6_URL=https://lab6-proof-api.onrender.com/health
LEDGER_URL=https://civic-protocol-core-ledger.onrender.com/health
GIC_URL=https://gic-indexer.onrender.com/health
LAB7_URL=https://lab7-proof.onrender.com/health
TIMEOUT_SEC=10
RETRY_COUNT=1
INTERVAL_SEC=300
ALERT_THRESHOLD=2
ALERT_WINDOW_MIN=15
```

**Optional:**
```
ALERT_WEBHOOK=https://hooks.slack.com/services/...
ATTEST_POST_URL=https://lab7-proof.onrender.com/oaa/ingest/snapshot
ATTEST_BEARER=your-bearer-token
```

### 2. Global Health Sentinel (Cron Jobs)

Create **3 separate Cron Jobs** for daily pulses:

**Cron Job 1 - Morning Pulse (06:00 ET)**
- **Schedule:** `0 6 * * *`
- **Command:** `python global-health-sentinel/pulse_sentinel.py`

**Cron Job 2 - Midday Pulse (12:00 ET)**
- **Schedule:** `0 12 * * *`
- **Command:** `python global-health-sentinel/pulse_sentinel.py`

**Cron Job 3 - Evening Pulse (18:00 ET)**
- **Schedule:** `0 18 * * *`
- **Command:** `python global-health-sentinel/pulse_sentinel.py`

**Environment Variables (for all cron jobs):**
```
GHS_REGIONS=US,EU,JP
GHS_LOG_DIR=./logs
GHS_ATT_DIR=./attestations
GHS_ENFORCE_SCHEMA=1
GHS_ENFORCE_SHIELD=1
```

**Optional:**
```
GHS_OAA_URL=https://lab7-proof.onrender.com/oaa/ingest/snapshot
GHS_LEDGER_URL=https://civic-protocol-core-ledger.onrender.com/ledger/attest
GHS_BEARER=your-bearer-token
```

### 3. Echo Bridge (Background Worker)

**Service Type:** Background Worker
**Root Directory:** `/`
**Start Command:** `python global-health-sentinel/echo_bridge.py`

**Environment Variables:**
```
LAB4_URL=https://hive-api-2le8.onrender.com/health
LAB6_URL=https://lab6-proof-api.onrender.com/health
LEDGER_URL=https://civic-protocol-core-ledger.onrender.com/health
GIC_URL=https://gic-indexer.onrender.com/health
LAB7_URL=https://lab7-proof.onrender.com/health
ECHO_LOG_DIR=./echo_logs
OAA_INGEST_URL=https://lab7-proof.onrender.com/oaa/ingest/snapshot
```

**Optional:**
```
LEDGER_ATTEST_URL=https://civic-protocol-core-ledger.onrender.com/ledger/attest
ECHO_BEARER=your-bearer-token
```

### 4. Lab7 OAA Service Updates

Add to your existing Lab7 OAA service environment:
```
ECHO_LOG_DIR=/opt/render/project/src/echo_logs
OAA_BEARER=your-optional-bearer-token
```

The Echo routes are already integrated into the OAA router.

## Frontend Integration

### Update Environment Variables

In your Next.js frontend deployment:
```
NEXT_PUBLIC_OAA_API_BASE=https://lab7-proof.onrender.com
```

### Add Echo Status Panel

The Echo Status Panel component is ready to use:
```tsx
import EchoStatusPanel from '@/components/EchoStatusPanel';

// Use with Lab7 endpoint
<EchoStatusPanel endpoint="https://lab7-proof.onrender.com/oaa/echo/latest" />
```

## Verification

### 1. Check Health Sentinel
```bash
# Should show service status
curl https://your-health-sentinel.onrender.com/health
```

### 2. Check Global Health Sentinel
```bash
# Should generate pulse attestations
curl https://your-global-health-sentinel.onrender.com/health
```

### 3. Check Echo Bridge
```bash
# Should show unified system heartbeat
curl https://lab7-proof.onrender.com/oaa/echo/latest
```

### 4. Check Frontend
Visit your frontend and navigate to `/echo` to see the status panel.

## Monitoring

### Logs to Watch
- **Health Sentinel:** `sentinel_logs/health_*.jsonl`
- **Global Health:** `logs/pulse_*.jsonl`
- **Echo Bridge:** `echo_logs/echo_*.json`

### Alerts
- Health Sentinel will alert if ≥2 services are DOWN for ≥15 minutes
- Global Health Sentinel will deny invalid pulses (logged but not attested)

### Status Endpoints
- `GET /oaa/echo/latest` - Latest system heartbeat
- `GET /oaa/echo/list` - List of recent pulses
- `GET /oaa/echo/health` - Echo module health

## Troubleshooting

### Common Issues

1. **Services not responding**
   - Check service URLs in environment variables
   - Verify services are actually running
   - Check timeout settings

2. **Echo routes not working**
   - Ensure `ECHO_LOG_DIR` is set correctly
   - Check that echo_bridge.py is writing to the correct directory
   - Verify file permissions

3. **Frontend not loading status**
   - Check CORS settings in Lab7 OAA
   - Verify `NEXT_PUBLIC_OAA_API_BASE` is correct
   - Check browser network tab for errors

### Debug Commands

```bash
# Test health endpoints manually
curl -v https://hive-api-2le8.onrender.com/health
curl -v https://lab6-proof-api.onrender.com/health
curl -v https://lab7-proof.onrender.com/health

# Test Echo endpoint
curl -v https://lab7-proof.onrender.com/oaa/echo/latest

# Check logs
tail -f sentinel_logs/health_$(date +%Y-%m-%d).jsonl
tail -f echo_logs/echo_*.json
```

## Security Considerations

1. **Bearer Tokens** - Use strong, unique tokens for API authentication
2. **Webhook URLs** - Keep Slack/Discord webhook URLs secure
3. **File Permissions** - Ensure log directories have appropriate permissions
4. **CORS** - Configure CORS properly for production

## Scaling

- **Multiple Regions** - Deploy Echo Bridge in multiple regions for redundancy
- **Load Balancing** - Use multiple Health Sentinel instances for high availability
- **Storage** - Consider persistent storage for logs in production
- **Monitoring** - Set up external monitoring for the monitoring system itself

## Cost Optimization

- **Cron Jobs** - Use Render's cron jobs instead of always-on workers where possible
- **Log Rotation** - Implement log rotation to manage storage costs
- **Alert Throttling** - Configure alert thresholds to avoid spam
- **Resource Limits** - Set appropriate CPU/memory limits for each service
