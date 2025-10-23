# WebDataScout - Web Data Extraction Wrapper for Lab7

A comprehensive web data extraction system that integrates with your Lab7 OAA stack to provide dynamic content, civic data indexing, and operational intelligence.

## 🚀 Quick Start

### 1. Environment Setup

Add these environment variables to your `.env.local`:

```bash
# WebDataScout Configuration
SCOUT_ENDPOINT=https://api.parse.bot/v1/extract
SCOUT_API_KEY=your_parse_bot_api_key
SCOUT_FALLBACK_ENDPOINT=https://backup-provider.com/api
SCOUT_FALLBACK_API_KEY=your_backup_api_key

# Ops Guard Integration
OPS_GUARD_ENDPOINT=/api/ops-guard
ENABLE_PII_REDACTION=true
ENABLE_CONTENT_SAFETY=true
```

### 2. Basic Usage

```typescript
import { extract } from '@/lib/webDataScout';

// Extract data from a web page
const result = await extract('https://example.com/blog/post', [
  { name: 'title', required: true, type: 'string' },
  { name: 'author', type: 'string' },
  { name: 'updated_at', type: 'string' },
  { name: 'content', type: 'string' }
]);

if (result.ok) {
  console.log('Extracted data:', result.data);
} else {
  console.error('Extraction failed:', result.error);
}
```

### 3. Using OAA Live Cards

```tsx
import { OaaLiveCard, OaaLessonCard, OaaStatusCard } from '@/components/OaaLiveCard';

// Basic live card
<OaaLiveCard
  url="https://example.com/blog/post"
  schema={[
    { name: 'title', required: true },
    { name: 'author' },
    { name: 'updated_at' }
  ]}
  refreshInterval={300} // 5 minutes
/>

// Predefined lesson card
<OaaLessonCard
  url="https://docs.example.com/tutorial"
  onDataLoad={(data) => console.log('Lesson data loaded:', data)}
/>

// Status monitoring card
<OaaStatusCard
  url="https://status.render.com"
  refreshInterval={60} // 1 minute
/>
```

## 📋 Use Cases

### 1. OAA Lessons Auto-Freshen (Lab7-proof)

Pull live examples into lessons without hand-coding scrapers:

```typescript
// In your lesson component
const lessonData = await extract('https://news.ycombinator.com/item?id=123', [
  { name: 'title', required: true },
  { name: 'score', type: 'number' },
  { name: 'comments_count', type: 'number' },
  { name: 'url', type: 'string' }
]);

// Render in OAA UI with citations
<OaaLiveCard
  url="https://news.ycombinator.com/item?id=123"
  schema={lessonData.schema}
  children={(data, meta) => (
    <div className="lesson-example">
      <h3>{data.title}</h3>
      <p>Score: {data.score} | Comments: {data.comments_count}</p>
      <cite>Source: {meta.url}</cite>
    </div>
  )}
/>
```

### 2. Lab4-proof (Retro FB Frontend) - OAA Tab Data

Show "What's new to learn" by scraping curated sources:

```typescript
// Scrape learning resources
const learningResources = await extractBatch([
  {
    url: 'https://docs.python.org/3/tutorial/',
    fields: [
      { name: 'title', required: true },
      { name: 'sections', type: 'array' },
      { name: 'last_updated', type: 'string' }
    ]
  },
  {
    url: 'https://react.dev/learn',
    fields: [
      { name: 'title', required: true },
      { name: 'chapters', type: 'array' },
      { name: 'difficulty', type: 'string' }
    ]
  }
]);

// Display in OAA tab
{learningResources.map((resource, index) => (
  <OaaLiveCard
    key={index}
    url={resource.meta.url}
    schema={resource.schema}
    children={(data) => (
      <div className="learning-card">
        <h4>{data.title}</h4>
        <p>Difficulty: {data.difficulty}</p>
        <a href={resource.meta.url}>Read More</a>
      </div>
    )}
  />
))}
```

### 3. Ops & Uptime Intelligence

Scrape status pages and feed Echo Bridge Sentinel:

```typescript
// Monitor multiple services
const statusChecks = await extractBatch([
  {
    url: 'https://status.render.com',
    fields: [
      { name: 'status', required: true },
      { name: 'incidents', type: 'array' },
      { name: 'timestamp', type: 'string' }
    ]
  },
  {
    url: 'https://www.githubstatus.com',
    fields: [
      { name: 'status', required: true },
      { name: 'components', type: 'array' }
    ]
  }
]);

// Feed to Echo Bridge Sentinel
for (const check of statusChecks) {
  if (!check.ok) {
    await fetch('/api/echo-bridge/incident', {
      method: 'POST',
      body: JSON.stringify({
        service: check.meta.url,
        status: 'degraded',
        details: check.error,
        timestamp: new Date().toISOString()
      })
    });
  }
}
```

### 4. Civic/Education Datasets

Pull city/open-data tables into GIC Indexer:

```typescript
// Extract civic data
const civicData = await extract('https://data.cityofchicago.org/api/views/example', [
  { name: 'rows', type: 'array' },
  { name: 'columns', type: 'array' },
  { name: 'metadata', type: 'object' }
]);

// Normalize and push to GIC Indexer
if (civicData.ok) {
  const normalizedData = {
    source: 'chicago_open_data',
    dataset: 'example',
    rows: civicData.data.rows,
    columns: civicData.data.columns,
    last_updated: new Date().toISOString()
  };
  
  await fetch('/api/gic-indexer/ingest', {
    method: 'POST',
    body: JSON.stringify(normalizedData)
  });
}
```

### 5. Rapid Connectors for New Partners

Pilot integrations without waiting for formal APIs:

```typescript
// Quick integration with new partner
const partnerData = await extract('https://partner-api.com/data', [
  { name: 'products', type: 'array' },
  { name: 'pricing', type: 'object' },
  { name: 'availability', type: 'string' }
], {
  timeoutMs: 30000,
  retryCount: 3,
  opsGuardConfig: {
    enablePiiDetection: true,
    enableContentSafety: true,
    piiThreshold: 0.1
  }
});

// Later swap to first-party API behind same interface
```

## 🛡️ Security & Guardrails

### PII Redaction

Automatically detects and redacts PII:

```typescript
const result = await extract(url, schema, {
  opsGuardConfig: {
    enablePiiDetection: true,
    piiThreshold: 0.2,
    enableContentSafety: true
  }
});

// PII is automatically redacted in result.data
console.log(result.data); // Sensitive data replaced with [REDACTED]
```

### Content Safety

Built-in content safety analysis:

```typescript
import { analyzeContentSafety } from '@/lib/opsGuard';

const safetyResult = await analyzeContentSafety(data);
if (!safetyResult.isSafe) {
  console.warn('Unsafe content detected:', safetyResult.detectedIssues);
}
```

### Rate Limiting & Circuit Breakers

Automatic rate limiting and circuit breaker protection:

```typescript
// Configure rate limits
const result = await extract(url, schema, {
  timeoutMs: 20000,
  retryCount: 2,
  retryDelayMs: 1200
});
```

## 📊 Monitoring & SLOs

### Dashboard

Access the monitoring dashboard at `/scout-dashboard`:

```tsx
import ScoutDashboard from '@/components/ScoutDashboard';

<ScoutDashboard
  refreshInterval={30}
  showAlerts={true}
  showMetrics={true}
  showHealth={true}
/>
```

### SLO Configuration

SLOs are defined in `ops/scout-slo.yml`:

- **Availability**: 99.9% uptime
- **Latency**: P95 < 5s
- **Success Rate**: 95%
- **Cache Hit Rate**: 80%
- **PII Detection Accuracy**: 95%

### Alerts

Automatic alerts for:
- High error rates
- High latency
- Low cache hit rates
- PII leaks detected
- Layout drift detected
- Ops Guard blocks

## 🔧 API Reference

### Core Functions

#### `extract(url, schema, config?)`

Extract data from a single URL.

**Parameters:**
- `url: string` - URL to extract data from
- `schema: ScoutSchema` - Field definitions
- `config?: ScoutConfig` - Optional configuration

**Returns:** `Promise<ScoutResult>`

#### `extractBatch(requests)`

Extract data from multiple URLs in parallel.

**Parameters:**
- `requests: Array<{url, fields, config?}>` - Array of extraction requests

**Returns:** `Promise<ScoutResult[]>`

#### `clearCache(url?)`

Clear cache for specific URL or all cache.

**Parameters:**
- `url?: string` - Optional URL to clear specific cache

**Returns:** `Promise<void>`

### Configuration Options

#### `ScoutConfig`

```typescript
interface ScoutConfig {
  timeoutMs?: number;           // Request timeout (default: 20000)
  retryCount?: number;          // Number of retries (default: 2)
  retryDelayMs?: number;        // Delay between retries (default: 1200)
  cacheTtlSeconds?: number;     // Cache TTL (default: 3600)
  enablePiiRedaction?: boolean; // Enable PII redaction (default: true)
  enableLayoutDriftDetection?: boolean; // Enable drift detection (default: true)
  fallbackEndpoint?: string;    // Fallback provider endpoint
  opsGuardConfig?: OpsGuardConfig; // Ops Guard configuration
}
```

#### `ScoutSchema`

```typescript
interface ScoutSchema {
  name: string;                 // Field name
  selector?: string;            // CSS selector (optional)
  required?: boolean;           // Whether field is required
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  transform?: (value: any) => any; // Transform function
}
```

### API Endpoints

#### `GET /api/scout-test`

Health check and cache statistics.

#### `POST /api/scout-test/extract`

Single URL extraction.

**Body:**
```json
{
  "url": "https://example.com",
  "fields": [
    { "name": "title", "required": true, "type": "string" }
  ],
  "config": {}
}
```

#### `PUT /api/scout-test/batch`

Batch extraction.

**Body:**
```json
{
  "requests": [
    {
      "url": "https://example.com",
      "fields": [...],
      "config": {}
    }
  ]
}
```

#### `DELETE /api/scout-test/cache`

Clear cache.

**Query Parameters:**
- `url` (optional) - Specific URL to clear

#### `PATCH /api/scout-test`

Test predefined scenarios.

**Body:**
```json
{
  "scenario": "oaa-lesson" | "status-intelligence" | "civic-data" | "job-feed"
}
```

## 🚀 Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy and configure environment variables:

```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

### 3. Deploy

```bash
npm run build
npm start
```

### 4. Monitor

Access the dashboard at `/scout-dashboard` to monitor system health and performance.

## 🔄 Integration with Lab7 Architecture

The WebDataScout system integrates seamlessly with your existing Lab7 architecture:

```
Planner (Jade) → decides what URL + fields are needed
I/O (Hermes) → calls WebDataScout.extract({ url, schema })
Executor (Zeus) → post-process (clean, validate, cache)
Reviewer (Eve) → approves deltas; logs to Command Ledger III and Ops Logs
```

### Data Flow

1. **Jade** determines what data is needed for a lesson or operation
2. **Hermes** calls `WebDataScout.extract()` with the URL and schema
3. **Zeus** validates, cleans, and caches the extracted data
4. **Eve** reviews any flagged content and logs decisions to the Command Ledger

### Ops Guard Integration

The system integrates with your existing Ops Guard system for:
- PII detection and redaction
- Content safety analysis
- Policy evaluation
- Security logging

## 📈 Performance Optimization

### Caching Strategy

- **Default TTL**: 1 hour
- **Status pages**: 5 minutes
- **News sources**: 30 minutes
- **Data sources**: 1 hour
- **Job feeds**: 30 minutes

### Rate Limiting

- **Per user**: 60 requests/minute
- **Per domain**: 100 requests/minute
- **Global**: 1000 requests/minute

### Circuit Breakers

- **Scout provider**: 3 failures → 60s timeout
- **Fallback provider**: 2 failures → 120s timeout

## 🐛 Troubleshooting

### Common Issues

1. **High error rates**: Check provider endpoints and API keys
2. **Low cache hit rates**: Review cache TTL settings
3. **PII leaks**: Verify Ops Guard configuration
4. **Layout drift**: Check for website changes

### Debug Mode

Enable debug logging:

```typescript
const result = await extract(url, schema, {
  opsGuardConfig: {
    enablePiiDetection: true,
    enableContentSafety: true
  }
});

console.log('Debug info:', result.meta);
```

### Health Checks

Monitor system health:

```typescript
import { getCacheStats } from '@/lib/webDataScout';

const stats = getCacheStats();
console.log('Cache stats:', stats);
```

## 📚 Examples

See the `examples/` directory for complete working examples:

- `lesson-integration.tsx` - OAA lesson integration
- `status-monitoring.tsx` - Status page monitoring
- `civic-data.tsx` - Civic data extraction
- `job-feed.tsx` - Job board integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the Lab7 OAA system and follows the same licensing terms.

---

For more information, see the [Lab7 Architecture Documentation](./architecture.yaml) and [OAA README](./OAA_README.md).