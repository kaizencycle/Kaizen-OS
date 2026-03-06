# Integrity Pulse - Deployment Guide

Complete deployment and integration guide for the Integrity Pulse visualization system.

**Cycle C-125 | November 5, 2025**

---

## Table of Contents

1. [Local Development](#local-development)
2. [Production Deployment](#production-deployment)
3. [WebSocket Integration](#websocket-integration)
4. [Render.com Deployment](#rendercom-deployment)
5. [Vercel Deployment](#vercel-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Integration Patterns](#integration-patterns)
8. [Monitoring & Observability](#monitoring--observability)

---

## Local Development

### Quick Start

```bash
# Navigate to app directory
cd apps/integrity-pulse

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3010`

### Mock Data Mode

Default configuration uses randomly generated metrics:

```bash
# .env.local
NEXT_PUBLIC_MOCK_DATA=true
```

Perfect for:
- Frontend development
- Visual tweaking
- Performance testing
- Demos without backend

### Real Data Mode

Connect to civic-ledger WebSocket stream:

```bash
# .env.local
NEXT_PUBLIC_MOCK_DATA=false
NEXT_PUBLIC_WS_URL=ws://localhost:4001/ws/gi-stream
```

**Prerequisites**:
1. Civic Ledger running on port 4001
2. WebSocket endpoint `/ws/gi-stream` implemented
3. Metrics emitting in expected format (see README.md)

---

## Production Deployment

### Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```bash
# Required for production
NODE_ENV=production
PORT=3010

# Data source
NEXT_PUBLIC_MOCK_DATA=false
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws/gi-stream

# Optional: HTTP fallback
NEXT_PUBLIC_POLL_URL=https://your-domain.com/api/sentinels/metrics
NEXT_PUBLIC_POLL_INTERVAL=2000
```

### Production Optimizations

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
}
```

**Benefits**:
- Dead code elimination
- Console.log removal
- Smaller bundle size (~30% reduction)
- Faster initial load

---

## WebSocket Integration

### Civic Ledger Setup

**Step 1: Install WebSocket library**

```bash
cd packages/civic-ledger
npm install ws @types/ws
```

**Step 2: Create WebSocket endpoint**

```typescript
// packages/civic-ledger/src/ws/gi-stream.ts
import { WebSocketServer, WebSocket } from 'ws';
import { getSentinelMetrics } from '../services/sentinels';

export function createGIStreamServer(port: number = 4001) {
  const wss = new WebSocketServer({ port, path: '/ws/gi-stream' });

  console.log(`[GI Stream] WebSocket server running on ws://localhost:${port}/ws/gi-stream`);

  wss.on('connection', (ws: WebSocket) => {
    console.log('[GI Stream] Client connected');

    // Send initial metrics
    sendMetrics(ws);

    // Send updates every 2 seconds
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendMetrics(ws);
      }
    }, 2000);

    ws.on('close', () => {
      console.log('[GI Stream] Client disconnected');
      clearInterval(interval);
    });

    ws.on('error', (error) => {
      console.error('[GI Stream] Error:', error);
      clearInterval(interval);
    });
  });

  return wss;
}

async function sendMetrics(ws: WebSocket) {
  try {
    const metrics = await getSentinelMetrics();
    ws.send(JSON.stringify(metrics));
  } catch (error) {
    console.error('[GI Stream] Failed to send metrics:', error);
  }
}
```

**Step 3: Implement metrics service**

```typescript
// packages/civic-ledger/src/services/sentinels.ts
interface SentinelMetrics {
  id: string;
  gi: number;
  eventRate: number;
  lastUpdate: string;
}

export async function getSentinelMetrics(): Promise<Record<string, SentinelMetrics>> {
  // Query your database/telemetry system
  const sentinels = ['AUREA', 'ZEUS', 'HERMES', 'EVE', 'JADE', 'ATLAS', 'ECHO'];

  const metrics: Record<string, SentinelMetrics> = {};

  for (const sentinel of sentinels) {
    // Example: Query from database
    const gi = await db.query(
      'SELECT gi FROM sentinel_metrics WHERE id = $1 ORDER BY timestamp DESC LIMIT 1',
      [sentinel]
    );

    const eventRate = await db.query(
      'SELECT COUNT(*) / 60 as rate FROM sentinel_events WHERE id = $1 AND timestamp > NOW() - INTERVAL \'1 minute\'',
      [sentinel]
    );

    metrics[sentinel] = {
      id: sentinel,
      gi: gi.rows[0]?.gi || 0.95,
      eventRate: eventRate.rows[0]?.rate || 0,
      lastUpdate: new Date().toISOString(),
    };
  }

  return metrics;
}
```

**Step 4: Start WebSocket server**

```typescript
// packages/civic-ledger/src/index.ts
import { createGIStreamServer } from './ws/gi-stream';
import express from 'express';

const app = express();
const httpPort = 4000;
const wsPort = 4001;

// HTTP API
app.listen(httpPort, () => {
  console.log(`[Civic Ledger] HTTP server running on port ${httpPort}`);
});

// WebSocket stream
createGIStreamServer(wsPort);
```

### Testing WebSocket Connection

**Using wscat**:
```bash
npm install -g wscat
wscat -c ws://localhost:4001/ws/gi-stream
```

**Using JavaScript**:
```javascript
const ws = new WebSocket('ws://localhost:4001/ws/gi-stream');

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## Render.com Deployment

### Step 1: Create `render.yaml`

```yaml
# apps/integrity-pulse/render.yaml
services:
  - type: web
    name: integrity-pulse
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3010
      - key: NEXT_PUBLIC_MOCK_DATA
        value: false
      - key: NEXT_PUBLIC_WS_URL
        sync: false  # Set in Render dashboard
```

### Step 2: Connect Repository

1. Log in to [Render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect GitHub repository: `kaizencycle/Mobius-Substrate`
4. Set **Root Directory**: `apps/integrity-pulse`
5. Use **render.yaml** configuration

### Step 3: Configure Environment

In Render dashboard:
```
NEXT_PUBLIC_WS_URL = wss://civic-ledger.onrender.com/ws/gi-stream
```

### Step 4: Deploy

```bash
git push origin claude/add-founding-agents-sovereign-stack-011CUbjRDnqMJUuq71a2kkPT
```

Render will automatically:
- Detect `render.yaml`
- Install dependencies
- Build Next.js app
- Start production server

**Access**: `https://integrity-pulse.onrender.com`

---

## Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Configure Project

```bash
cd apps/integrity-pulse

# Login to Vercel
vercel login

# Initialize project
vercel
```

Follow prompts:
- **Project name**: `integrity-pulse`
- **Framework**: Next.js
- **Build command**: `npm run build`
- **Output directory**: `.next`

### Step 3: Set Environment Variables

```bash
vercel env add NEXT_PUBLIC_MOCK_DATA production
# Enter: false

vercel env add NEXT_PUBLIC_WS_URL production
# Enter: wss://civic-ledger.your-domain.com/ws/gi-stream
```

### Step 4: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Alternative: GitHub Integration

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. **Import Project** → Select `kaizencycle/Mobius-Substrate`
3. **Root Directory**: `apps/integrity-pulse`
4. **Framework Preset**: Next.js
5. **Environment Variables**: Add via dashboard
6. **Deploy**

**Auto-deploy**: Vercel will redeploy on every push to branch.

---

## Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
# apps/integrity-pulse/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3010

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3010

CMD ["npm", "start"]
```

### Step 2: Create `.dockerignore`

```
node_modules
.next
.env*.local
*.log
.git
README.md
```

### Step 3: Build Image

```bash
cd apps/integrity-pulse

docker build -t kaizen/integrity-pulse:latest .
```

### Step 4: Run Container

```bash
docker run -d \
  --name integrity-pulse \
  -p 3010:3010 \
  -e NEXT_PUBLIC_MOCK_DATA=false \
  -e NEXT_PUBLIC_WS_URL=ws://host.docker.internal:4001/ws/gi-stream \
  kaizen/integrity-pulse:latest
```

**Access**: `http://localhost:3010`

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  integrity-pulse:
    build:
      context: ./apps/integrity-pulse
      dockerfile: Dockerfile
    ports:
      - "3010:3010"
    environment:
      - NEXT_PUBLIC_MOCK_DATA=false
      - NEXT_PUBLIC_WS_URL=ws://civic-ledger:4001/ws/gi-stream
    depends_on:
      - civic-ledger
    restart: unless-stopped

  civic-ledger:
    build:
      context: ./packages/civic-ledger
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
      - "4001:4001"
    restart: unless-stopped
```

**Start services**:
```bash
docker-compose up -d
```

---

## Integration Patterns

### Pattern 1: Standalone Dashboard

**Use Case**: Dedicated integrity monitoring dashboard

**Setup**:
```bash
# Run as independent service
cd apps/integrity-pulse
npm start
```

**Access**: `http://localhost:3010`

**Pros**:
- Isolated deployment
- Independent scaling
- Simple configuration

**Cons**:
- Separate subdomain/port
- Additional infrastructure

---

### Pattern 2: Embedded in Cathedral App

**Use Case**: Integrate into existing Next.js application

**Setup**:

```typescript
// apps/cathedral-app/src/app/integrity/page.tsx
import dynamic from 'next/dynamic';

const MultiAgentGrid = dynamic(
  () => import('../../../integrity-pulse/src/components/MultiAgentGrid'),
  { ssr: false }
);

export default function IntegrityVisualizationPage() {
  return (
    <main className="w-full h-screen">
      <MultiAgentGrid
        mockData={false}
        wsUrl={process.env.NEXT_PUBLIC_WS_URL!}
      />
    </main>
  );
}
```

**Pros**:
- Single deployment
- Unified navigation
- Shared authentication

**Cons**:
- Larger bundle size
- Coupled releases

---

### Pattern 3: Shared Package

**Use Case**: Reusable across multiple applications

**Setup**:

```bash
# Publish to npm or private registry
cd apps/integrity-pulse
npm publish
```

**Usage**:
```typescript
// In any Next.js app
import { MultiAgentGrid } from '@kaizen/integrity-pulse';

export default function Page() {
  return <MultiAgentGrid mockData={false} />;
}
```

**Pros**:
- Maximum reusability
- Version control
- Independent updates

**Cons**:
- Package management overhead
- Dependency coordination

---

## Monitoring & Observability

### Health Check Endpoint

```typescript
// apps/integrity-pulse/src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
```

**Test**:
```bash
curl http://localhost:3010/api/health
```

### Metrics Collection

**Prometheus Integration**:
```typescript
// apps/integrity-pulse/src/lib/metrics.ts
import { Counter, Histogram } from 'prom-client';

export const wsConnectionCounter = new Counter({
  name: 'integrity_pulse_ws_connections_total',
  help: 'Total WebSocket connections',
});

export const renderDuration = new Histogram({
  name: 'integrity_pulse_render_duration_seconds',
  help: 'Frame render duration',
  buckets: [0.001, 0.005, 0.01, 0.02, 0.05],
});
```

### Error Tracking

**Sentry Integration**:
```bash
npm install @sentry/nextjs
```

```typescript
// apps/integrity-pulse/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Logging

**Structured Logging**:
```typescript
// apps/integrity-pulse/src/lib/logger.ts
export const logger = {
  info: (msg: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', msg, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (msg: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({ level: 'error', msg, error: error?.message, ...meta, timestamp: new Date().toISOString() }));
  },
};
```

---

## Performance Tuning

### Reduce Particle Count

For lower-end devices:
```typescript
<SentinelSphere particleCount={4000} />  // Default: 8000
```

### Enable GPU Profiling

**Chrome DevTools**:
1. Open DevTools → **Performance**
2. Check **Screenshots** + **GPU**
3. Record 5-second session
4. Look for **GPU Activity** bars

**Target**: 60 FPS with <16ms frame time

### Bundle Size Optimization

```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

**Expected sizes**:
- Total bundle: ~800 KB
- Three.js: ~600 KB
- React Three Fiber: ~150 KB
- App code: ~50 KB

---

## Troubleshooting

### Issue: WebSocket connection refused

**Check**:
```bash
# Verify civic-ledger is running
curl http://localhost:4001/health

# Test WebSocket
wscat -c ws://localhost:4001/ws/gi-stream
```

**Fix**:
```bash
cd packages/civic-ledger
npm start
```

### Issue: CORS errors in production

**Civic Ledger CORS config**:
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://integrity-pulse.onrender.com',
    'http://localhost:3010',
  ],
  credentials: true,
}));
```

### Issue: Build fails on Render

**Cause**: Missing dependencies or incorrect build command

**Fix**:
```yaml
# render.yaml
buildCommand: cd apps/integrity-pulse && npm install && npm run build
```

---

## Security Considerations

### WebSocket Authentication

```typescript
// Civic Ledger: Validate auth token
wss.on('connection', (ws, req) => {
  const token = req.headers['authorization'];

  if (!validateToken(token)) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  // ... proceed
});
```

### HTTPS/WSS in Production

**Always use secure protocols**:
```bash
# .env.production
NEXT_PUBLIC_WS_URL=wss://civic-ledger.your-domain.com/ws/gi-stream
```

### Rate Limiting

```typescript
// Civic Ledger: Prevent abuse
import rateLimit from 'express-rate-limit';

const wsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,                 // 100 connections per IP
});

app.use('/ws', wsLimiter);
```

---

## Rollback Strategy

### Vercel

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Render

1. Visit Render dashboard
2. Select **integrity-pulse** service
3. **Events** tab → Find previous deployment
4. Click **Redeploy** on stable version

### Docker

```bash
# Tag stable version
docker tag kaizen/integrity-pulse:latest kaizen/integrity-pulse:stable

# Rollback
docker stop integrity-pulse
docker rm integrity-pulse
docker run -d --name integrity-pulse kaizen/integrity-pulse:stable
```

---

## Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update Next.js (test carefully)
npm install next@latest

# Update Three.js
npm install three@latest @react-three/fiber@latest @react-three/drei@latest
```

### Database Migrations

If adding new sentinel metrics:
```sql
-- Add new metrics column
ALTER TABLE sentinel_metrics ADD COLUMN uptime_seconds INTEGER DEFAULT 0;
```

Update TypeScript interface:
```typescript
interface SentinelMetrics {
  // ... existing fields
  uptimeSeconds?: number;  // Optional for backwards compatibility
}
```

---

## Support

For deployment issues:
- **GitHub Issues**: https://github.com/kaizencycle/Mobius-Substrate/issues
- **Documentation**: `apps/integrity-pulse/README.md`
- **Civic Ledger API**: `packages/civic-ledger/README.md`

---

**Last Updated**: November 5, 2025 (Cycle C-125)
**Status**: Production Ready
**Maintainers**: ATLAS, HERMES, AUREA
