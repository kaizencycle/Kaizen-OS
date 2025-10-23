# Retryable Publish Queue + Gateway Cache Warming

This implementation adds a **BullMQ** queue system to process post-publish hooks reliably with retries, and implements a **gateway** endpoint for cache warming.

## Architecture

```
POST /api/posts/publish → enqueue job → worker updates .gic + pings gateway
→ gateway validates HMAC → warms cache → returns 200
```

## Components

### Hub App (companion_site_starter)
- **Queue Infrastructure**: BullMQ with Redis backend
- **Publish Worker**: Processes `publishEvents` queue jobs
- **Queue API**: `/api/queue/enqueue` for adding jobs
- **Publish API**: `/api/posts/publish` enqueues jobs instead of direct calls

### Gateway Service (gic_gateway_service)
- **Event Handler**: `POST /events/new-post` with HMAC validation
- **Cache Warming**: LRU cache for resolved labels
- **Fastify Server**: High-performance HTTP server

## Setup

### 1. Install Dependencies

```bash
# Hub app
cd companion_site_starter
npm install

# Gateway service
cd ../services/gic_gateway_service
npm install
```

### 2. Start Redis

```bash
docker run -p 6379:6379 redis:7-alpine
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Key variables:
- `REDIS_URL`: Redis connection string
- `GATEWAY_HMAC_SECRET`: Shared secret for HMAC validation
- `GIC_GATEWAY_BASE_URL`: Gateway service URL
- `GIC_RPC_URL`: Ethereum RPC endpoint
- `GIC_REGISTRY_ADDR`: Registry contract address
- `GIC_REGISTRAR_PRIVATE_KEY`: Private key for on-chain updates

### 4. Start Services

```bash
# Terminal 1: Start the worker
cd companion_site_starter
node -r esbuild-register workers/publishWorker.ts

# Terminal 2: Start the gateway
cd services/gic_gateway_service
npm run dev

# Terminal 3: Start the hub app
cd companion_site_starter
npm run dev
```

## Usage

### Publish a Post

```bash
curl -X POST "http://localhost:3000/api/posts/publish?companion=jade" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\nThis is a test post.",
    "integrityHex": "0x1234567890abcdef..."
  }'
```

### Check Queue Status

The worker will log:
```
Processing publish job for label: jade, cid: Qm...
Updated GIC record for jade: 0x...
Gateway cache warmed for jade: { ok: true }
```

### Verify Cache Warming

```bash
# This should show warmed: true if cache was warmed
curl "http://localhost:8787/resolve/jade"
```

## API Endpoints

### Hub App
- `POST /api/posts/publish?companion={label}` - Publish content and enqueue job
- `POST /api/queue/enqueue` - Internal: Add job to queue

### Gateway Service
- `GET /` - Health check
- `GET /resolve/:label` - Resolve label to CID (with cache warming)
- `GET /:label` - Redirect to IPFS content
- `POST /events/new-post` - Cache warming endpoint (HMAC protected)

## Security

- **HMAC Validation**: Gateway events require valid HMAC signature
- **Private Keys**: Never expose registrar private keys
- **Rate Limiting**: Consider adding rate limits to public endpoints

## Monitoring

- **Queue Metrics**: BullMQ provides built-in monitoring
- **Worker Logs**: Check worker console for job processing
- **Gateway Logs**: Fastify provides structured logging
- **Cache Stats**: LRU cache provides size and hit rate info

## Deployment

### Using Procfile (Heroku/Render)

```bash
# Start all services
foreman start
```

### Using PM2

```bash
# Start worker
pm2 start workers/publishWorker.ts --name "publish-worker"

# Start gateway
pm2 start services/gic_gateway_service/src/index.js --name "gateway"

# Start hub
pm2 start companion_site_starter --name "hub"
```

## Troubleshooting

### Worker Not Processing Jobs
1. Check Redis connection
2. Verify environment variables
3. Check worker logs for errors

### Gateway Cache Not Warming
1. Verify HMAC secret matches
2. Check gateway logs for authentication errors
3. Ensure worker can reach gateway URL

### Queue Jobs Failing
1. Check on-chain transaction requirements
2. Verify private key has sufficient funds
3. Check RPC endpoint connectivity

## Development

### Adding New Job Types
1. Update worker processor in `workers/publishWorker.ts`
2. Add new queue in `lib/queue/bull.ts`
3. Create enqueue API if needed

### Extending Gateway
1. Add new routes in `services/gic_gateway_service/src/index.js`
2. Update cache logic in `src/events.js`
3. Add new environment variables as needed
