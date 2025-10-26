# Sentinel Suite - OAA Hub Operational Monitoring

This document describes the comprehensive Sentinel Suite implementation for the OAA Hub, providing queue administration, real-time monitoring, and automated incident reporting.

## 🎯 Overview

The Sentinel Suite transforms the OAA Hub from a basic heartbeat system into a living, self-healing operational platform with:

- **Queue Admin Console** (`/dev/queue`) - Visual queue management with pause/resume/retry/drain controls
- **Real-time Monitoring** - Enhanced Sentinel badge with runtime vitals and 2-hour sparkline
- **Automated Notifications** - Command Ledger webhook integration for state changes
- **Incident Management** - GitHub integration for automated incident creation and tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Queue Admin   │    │  Sentinel Badge  │    │  GitHub Issues  │
│   /dev/queue    │    │  (Enhanced UI)   │    │  (Auto-created) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BullMQ Queue System                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Waiting   │  │   Active    │  │      Failed Jobs        │ │
│  │   Delayed   │  │ Processing  │  │     (Retry Queue)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Redis Storage  │    │  Command Ledger  │    │  GitHub Actions │
│  (Queue State)  │    │  (Webhook)       │    │  (Monitoring)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
companion_site_starter/
├── pages/
│   ├── dev/
│   │   └── queue.tsx                    # Queue admin console UI
│   └── api/dev/
│       ├── queue/
│       │   ├── stats.ts                 # Queue statistics endpoint
│       │   ├── pause.ts                 # Pause queue endpoint
│       │   ├── resume.ts                # Resume queue endpoint
│       │   ├── retryFailed.ts           # Retry failed jobs endpoint
│       │   └── drain.ts                 # Drain queue endpoint
│       └── sentinel/
│           └── notify.ts                # Command Ledger webhook
├── components/
│   └── SentinelBadge.tsx                # Enhanced badge with sparkline
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── operational_incident.yml     # Incident template
│   └── workflows/
│       └── incident-auto.yml            # Auto-incident workflow
└── .env.example                         # Updated with new variables
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Existing variables (keep these)
DEV_MODE=1
REDIS_URL=redis://localhost:6379
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo
SENTINEL_WORKFLOW=sentinel-patch.yml
GITHUB_PAT=your-github-token

# New Sentinel Suite variables
DEV_ADMIN_TOKEN=your-secure-admin-token
LEDGER_WEBHOOK_URL=https://your-ledger.com/webhook
LEDGER_WEBHOOK_HMAC=your-hmac-secret

# Optional: Tune thresholds
SENTINEL_FAIL_RATE_WARN=0.05    # 5% → amber
SENTINEL_FAIL_RATE_CRIT=0.15    # 15% → red
SENTINEL_DEPTH_WARN=50          # 50 jobs → amber
SENTINEL_DEPTH_CRIT=200         # 200 jobs → red
SENTINEL_WINDOW_MIN=15          # 15min lookback window
```

### 2. GitHub Repository Setup

1. **Add Repository Variables:**
   - Go to Settings → Variables and secrets → Actions
   - Add `HUB_BASE_URL` (e.g., `https://your-hub.onrender.com`)

2. **Add Repository Secrets (if needed):**
   - Add `HUB_AUTH_HEADER` if your dev API requires authentication

3. **Enable GitHub Actions:**
   - The workflow will automatically run every 5 minutes
   - Manual triggers available via "Actions" tab

### 3. Command Ledger Integration

1. **Configure Webhook Endpoint:**
   - Set up your Command Ledger to receive webhooks at the configured URL
   - Ensure it can validate HMAC signatures

2. **Test Webhook:**
   ```bash
   curl -X GET https://your-hub.com/api/dev/sentinel/notify
   ```

## 🚀 Usage

### Queue Administration

1. **Access Admin Console:**
   ```
   https://your-hub.com/dev/queue
   ```

2. **Enter Admin Token:**
   - Use the `DEV_ADMIN_TOKEN` value you configured
   - Required for all write operations (pause/resume/retry/drain)

3. **Monitor Queue Health:**
   - Real-time statistics update every 5 seconds
   - Color-coded indicators for queue depth and failure rates
   - Historical data shows trends over time

### Sentinel Badge

The enhanced badge now shows:

- **CI Status** - GitHub Actions workflow state
- **Runtime Vitals** - Queue depth, failure rate, job counts
- **2-Hour Sparkline** - Visual trend of queue depth over time
- **Interactive Details** - Hover/click for comprehensive information

### Automated Incident Management

1. **State Change Detection:**
   - GitHub Actions polls every 5 minutes
   - Compares CI status vs runtime vitals
   - Triggers on amber/red state changes

2. **Incident Creation:**
   - Auto-creates GitHub issues using the operational incident template
   - Includes full snapshot of system state
   - Prevents duplicate incidents (6-hour deduplication)

3. **Command Ledger Integration:**
   - Webhook fires on every state change
   - HMAC-signed payloads for security
   - Includes both CI and runtime data

## 🧪 Testing

### Local Development

```bash
# 1. Start Redis
redis-server

# 2. Set environment variables
export DEV_MODE=1
export REDIS_URL=redis://localhost:6379
export DEV_ADMIN_TOKEN=dev-123

# 3. Start the application
npm run dev

# 4. Test endpoints
curl http://localhost:3000/api/dev/queue/stats
curl http://localhost:3000/api/dev/sentinel/notify

# 5. Access admin console
open http://localhost:3000/dev/queue
```

### Production Testing

1. **Queue Operations:**
   - Pause queue → verify jobs stop processing
   - Resume queue → verify jobs resume
   - Retry failed → verify failed jobs re-queue
   - Drain queue → verify waiting jobs are removed

2. **Monitoring:**
   - Check badge updates every minute
   - Verify sparkline grows with new data points
   - Test state transitions (green → amber → red)

3. **Incident Management:**
   - Trigger state change → verify GitHub issue created
   - Check Command Ledger receives webhook
   - Verify deduplication works (no duplicate issues)

## 🔒 Security

### Access Control

- **DEV_MODE Guard:** All `/api/dev/*` routes require `DEV_MODE=1`
- **Admin Token:** Write operations require `x-dev-admin-token` header
- **HMAC Signing:** Webhook payloads are cryptographically signed
- **No Secret Leakage:** Redis credentials never exposed to client

### Production Considerations

1. **Disable Dev Routes:**
   ```bash
   # In production
   unset DEV_MODE
   # or
   DEV_MODE=0
   ```

2. **Secure Admin Token:**
   - Use strong, random token
   - Rotate regularly
   - Limit access to operations team

3. **Webhook Security:**
   - Use HTTPS for webhook URLs
   - Validate HMAC signatures
   - Rate limit webhook endpoints

## 📊 Monitoring & Alerting

### Key Metrics

- **Queue Depth:** Number of waiting + delayed jobs
- **Failure Rate:** Percentage of failed jobs in rolling window
- **Processing Rate:** Jobs completed per minute
- **State Duration:** How long system stays in amber/red

### Alert Thresholds

| Metric | Green | Amber | Red |
|--------|-------|-------|-----|
| Queue Depth | < 50 | 50-199 | ≥ 200 |
| Failure Rate | < 5% | 5-14% | ≥ 15% |
| CI Status | Success | Running/Queued | Failed/Cancelled |

### Dashboard Integration

The Sentinel badge can be embedded in any page:

```tsx
import SentinelBadge from '../components/SentinelBadge';

export default function MyPage() {
  return (
    <div>
      <h1>My Dashboard</h1>
      <SentinelBadge />
      {/* rest of your content */}
    </div>
  );
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Queue Admin Not Loading:**
   - Check `DEV_MODE=1` is set
   - Verify Redis connection
   - Check browser console for errors

2. **Admin Operations Failing:**
   - Verify `DEV_ADMIN_TOKEN` is correct
   - Check token is passed in `x-dev-admin-token` header
   - Ensure Redis is accessible

3. **Webhook Not Firing:**
   - Check `LEDGER_WEBHOOK_URL` is set
   - Verify webhook endpoint is accessible
   - Check HMAC secret matches

4. **GitHub Issues Not Creating:**
   - Verify `HUB_BASE_URL` repository variable
   - Check GitHub Actions permissions
   - Review workflow logs for errors

### Debug Commands

```bash
# Check queue stats
curl -H "x-dev-admin-token: your-token" \
     http://localhost:3000/api/dev/queue/stats

# Test webhook
curl http://localhost:3000/api/dev/sentinel/notify

# Check Redis connection
redis-cli ping

# View GitHub Actions logs
# Go to Actions tab in GitHub repository
```

## 🔄 Rollback Plan

If issues arise, the Sentinel Suite can be safely disabled:

1. **Disable Dev Routes:**
   ```bash
   unset DEV_MODE
   ```

2. **Disable GitHub Actions:**
   - Go to Actions → incident-auto → Disable workflow

3. **Remove Webhook:**
   - Unset `LEDGER_WEBHOOK_URL` environment variable

4. **Revert Code:**
   - The changes are isolated to `/dev/*` routes and `SentinelBadge.tsx`
   - No impact on production functionality

## 📈 Future Enhancements

- **Queue Metrics Dashboard:** Historical charts and analytics
- **Custom Alert Rules:** User-defined thresholds and conditions
- **Slack Integration:** Direct notifications to team channels
- **Queue Job Inspector:** Detailed view of individual jobs
- **Performance Profiling:** Queue processing time analysis
- **Multi-Queue Support:** Monitor multiple BullMQ queues

## 🤝 Contributing

When extending the Sentinel Suite:

1. **Follow Security Patterns:** Always check `DEV_MODE` and admin tokens
2. **Add Comprehensive Logging:** Include error details and context
3. **Update Documentation:** Keep this README current
4. **Test Thoroughly:** Verify both local and production scenarios
5. **Consider Backwards Compatibility:** Don't break existing functionality

---

**The Sentinel Suite transforms operational monitoring from reactive to proactive, giving your team the tools they need to maintain a healthy, self-healing system.**

