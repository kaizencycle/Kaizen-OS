# Vercel Deployment Guide for API Gateway

This guide explains how to deploy the Kaizen OS API Gateway to Vercel.

## Prerequisites

- Vercel account
- Access to the Kaizen OS monorepo
- Node.js 18+ installed locally (for testing)

## Deployment Steps

### 1. Configure Vercel Project Settings

When creating or configuring the Vercel project:

1. **Root Directory**: Set the root directory to `apps/api-gateway`
   - In Vercel Dashboard → Project Settings → General
   - Set "Root Directory" to `apps/api-gateway`

2. **Framework Preset**: Select "Other" or leave blank (no framework preset needed)

3. **Build Command**: The build command in `vercel.json` will automatically build required workspace dependencies

4. **Output Directory**: Leave blank (Vercel handles serverless functions automatically)

### 2. Environment Variables

The following environment variables are configured in `vercel.json`:

- `NODE_ENV`: Set to `production`
- `GI_MIN`: Minimum GI score threshold (default: 0.90)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- Service URLs for proxied services (ledger, lab4, lab6, lab7, gic, oaa, etc.)

**Optional**: Override these in Vercel Dashboard → Project Settings → Environment Variables if needed.

### 3. Deploy

#### Option A: Via Vercel CLI

```bash
# From the monorepo root
cd apps/api-gateway
vercel

# For production deployment
vercel --prod
```

#### Option B: Via Git Integration

1. Connect your GitHub repository to Vercel
2. Set root directory to `apps/api-gateway` in project settings
3. Push to your main branch or create a pull request
4. Vercel will automatically deploy

### 4. Verify Deployment

After deployment, verify the API Gateway is working:

```bash
# Health check
curl https://your-project.vercel.app/health

# Integrity check
curl https://your-project.vercel.app/api/integrity-check

# Root endpoint
curl https://your-project.vercel.app/
```

## Architecture

The API Gateway uses Vercel serverless functions:

- **Entry Point**: `api/index.ts` - Handles all routes via Express middleware
- **Routing**: All requests are rewritten to `/api` which routes to the serverless function
- **Proxy**: Proxies requests to backend services (ledger, lab4, lab6, etc.)
- **Middleware**: Includes integrity checks, rate limiting, CORS, and security headers

## Monorepo Dependencies

The API Gateway depends on workspace packages:

- `@civic/integrity-core` - GI scoring and integrity checks
- `@civic/shield-policies` - Security policies

These are automatically built during the Vercel build process via the `buildCommand` in `vercel.json`.

## Troubleshooting

### Issue: Workspace dependencies not found

**Solution**: Ensure the `installCommand` in `vercel.json` runs from the monorepo root:
```json
"installCommand": "cd ../.. && npm install"
```

### Issue: TypeScript compilation errors

**Solution**: Vercel automatically compiles TypeScript in the `api/` directory. Ensure:
- `@vercel/node` is installed as a dependency
- TypeScript types are properly configured in `tsconfig.json`

### Issue: Environment variables not working

**Solution**: Verify environment variables are set in:
1. Vercel Dashboard → Project Settings → Environment Variables
2. `vercel.json` (for defaults)

### Issue: CORS errors

**Solution**: Update `ALLOWED_ORIGINS` environment variable to include your frontend domain(s).

## Local Development

For local development:

```bash
# From monorepo root
npm run dev --workspace=apps/api-gateway

# Or from api-gateway directory
cd apps/api-gateway
npm run dev
```

The local server runs on `http://localhost:8080` (configurable via `PORT` env var).

## Production Considerations

1. **Rate Limiting**: Configured via `RATE_LIMIT_MAX` env var (default: 100 requests per 15 minutes)
2. **Memory Limits**: Vercel serverless functions have memory limits - monitor via integrity check endpoint
3. **Cold Starts**: First request may be slower due to serverless cold starts
4. **Timeout**: Vercel serverless functions have a 10-second timeout for Hobby plan, 60 seconds for Pro

## Security

- Helmet.js security headers enabled
- CORS configured with allowed origins
- Rate limiting enabled
- Integrity middleware monitors GI scores
- Shield policies can be extended for additional security

## Support

For issues or questions:
- Check Kaizen OS documentation
- Review Vercel serverless function logs
- Check integrity check endpoint for service health
