# Vercel Deployment Runbook
## Kaizen OS Frontend Applications

**Last Updated:** October 30, 2025
**Maintainer:** Infrastructure Team

---

## Overview

This runbook covers deployment of Kaizen OS Next.js applications to Vercel. Currently, 3 applications are Vercel-ready:

1. **AUREA Site** - Founding Agent Reference Site
2. **Portal** - Main Kaizen Portal Interface
3. **Website Creator** - .gic Website Builder

---

## Pre-Deployment Checklist

### 1. Environment Variables

Each app requires specific environment variables. Check the `.env.example` file in each app directory.

**Common Variables:**
```bash
NODE_ENV=production
KAIZEN_CURRENT_CYCLE=C-119
GI_BASELINE=0.993
```

**App-Specific:**

**AUREA Site (`/apps/aurea-site/`):**
```bash
AGENT_ID=AUREA
AGENT_DOMAIN=aurea.gic
LEDGER_API_BASE=https://ledger.kaizen.os/v1
GUARDIAN_CONFIG=./guardian.config.json
```

**Portal (`/apps/portal/`):**
```bash
AGENT_ID=PORTAL
AGENT_DOMAIN=portal.kaizen.os
KAIZEN_CURRENT_CYCLE=C-119
GI_BASELINE=0.993
```

**Website Creator (`/apps/website-creator/`):**
```bash
AGENT_ID=WEBSITE_CREATOR
AGENT_DOMAIN=create.gic
```

### 2. Dependency Check

```bash
# From app directory
cd apps/aurea-site  # or portal, or website-creator
npm install
npm run type-check
npm run build
```

### 3. Verify Configuration Files

Ensure each app has:
- ✅ `vercel.json` (deployment config)
- ✅ `package.json` (build scripts)
- ✅ `.env.example` (template for environment vars)
- ✅ `next.config.js` or `next.config.mjs` (Next.js config)

---

## Deployment Methods

### Method 1: Vercel CLI (Recommended for Testing)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview (from app directory)
cd apps/aurea-site
vercel

# Deploy to production
vercel --prod
```

### Method 2: GitHub Integration (Recommended for Production)

**Setup:**

1. **Connect Repository to Vercel:**
   - Go to vercel.com/new
   - Import from GitHub: `kaizencycle/Kaizen-OS`
   - Framework Preset: Next.js
   - Root Directory: `apps/aurea-site` (or other app)

2. **Configure Build Settings:**
   ```
   Build Command: next build
   Output Directory: .next
   Install Command: npm install
   Development Command: next dev
   ```

3. **Set Environment Variables:**
   - Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Separate configs for Preview vs. Production

4. **Configure Deployment Branches:**
   - Production: `main` branch
   - Preview: All other branches (including `claude/*`)

**Automatic Deployments:**
- Push to `main` → Production deployment
- Push to any branch → Preview deployment
- Pull request → Preview deployment with comment

---

## App-Specific Deployment Notes

### AUREA Site

**Special Configuration:**
- Uses custom headers for SSE (Server-Sent Events) streaming
- Requires guardian.config.json to be present
- Depends on `/api/guardian/status` endpoint

**vercel.json highlights:**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "X-Accel-Buffering", "value": "no" }
      ]
    }
  ]
}
```

**Post-Deployment Verification:**
```bash
# Check homepage loads
curl https://aurea.kaizen.os/

# Check API health
curl https://aurea.kaizen.os/api/guardian/status

# Check attestation endpoint
curl https://aurea.kaizen.os/api/attest
```

### Portal

**Special Configuration:**
- Uses legacy peer dependencies (`--legacy-peer-deps`)
- Monorepo build requires specific npm flags

**vercel.json highlights:**
```json
{
  "buildCommand": "npm run build --legacy-peer-deps",
  "installCommand": "npm install --legacy-peer-deps"
}
```

**Known Issues:**
- May show peer dependency warnings (expected)
- Build can take 3-5 minutes due to legacy dependencies

**Post-Deployment Verification:**
```bash
# Check homepage
curl https://portal.kaizen.os/

# Check health endpoint
curl https://portal.kaizen.os/api/health
```

### Website Creator

**Special Configuration:**
- Standard Next.js deployment
- No special headers or legacy dependencies
- Fast build (<2 minutes)

**Post-Deployment Verification:**
```bash
# Check homepage
curl https://create.gic/

# Check .well-known routing
curl https://create.gic/.well-known/kaizen.json
```

---

## Monorepo Deployment Strategy

Kaizen OS uses a **Turborepo monorepo** structure. Vercel needs special configuration to build apps correctly.

### Option 1: Root-Level Deployment (Current)

**Project Structure:**
```
Kaizen-OS/
├── apps/
│   ├── aurea-site/
│   ├── portal/
│   └── website-creator/
└── packages/
    └── [shared packages]
```

**Vercel Configuration:**
1. Import root repository: `Kaizen-OS`
2. Set Root Directory to specific app: `apps/aurea-site`
3. Vercel auto-detects monorepo and includes workspace dependencies

**Build Process:**
```bash
# Vercel automatically runs:
npm install (at root)
cd apps/aurea-site
npm run build
```

### Option 2: Separate Projects (Alternative)

Deploy each app as a separate Vercel project:

- **Project 1:** AUREA Site (`apps/aurea-site`)
- **Project 2:** Portal (`apps/portal`)
- **Project 3:** Website Creator (`apps/website-creator`)

**Pros:**
- Independent deployments
- Separate environment variables per project
- Clearer deployment logs

**Cons:**
- More projects to manage
- Shared package changes require rebuilding all

---

## Environment Variable Management

### Development

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Vercel (Production)

**Add via Dashboard:**
1. Project Settings → Environment Variables
2. Add each variable
3. Select environments: Production, Preview, Development

**Add via CLI:**
```bash
vercel env add AGENT_ID production
# Enter value when prompted: AUREA

vercel env add LEDGER_API_BASE production
# Enter value: https://ledger.kaizen.os/v1
```

**Pull Environment Variables:**
```bash
# Download .env file from Vercel
vercel env pull .env.local
```

---

## Troubleshooting

### Build Fails with "Module not found"

**Cause:** Workspace dependencies not resolved

**Fix:**
```bash
# Clean install from root
rm -rf node_modules
rm -rf apps/*/node_modules
npm install

# Try build again
cd apps/aurea-site
npm run build
```

### "Legacy peer deps" warnings

**Cause:** Portal app uses older packages

**Fix:** This is expected. Ensure `vercel.json` includes:
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

### Deployment succeeds but 500 error

**Cause:** Missing environment variables

**Fix:**
1. Check Vercel dashboard → Environment Variables
2. Ensure all required vars from `.env.example` are set
3. Redeploy after adding

### SSE/Streaming not working

**Cause:** Vercel buffering responses

**Fix:** Ensure headers in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Accel-Buffering", "value": "no" }
      ]
    }
  ]
}
```

---

## Performance Optimization

### Image Optimization

Next.js automatically optimizes images via Vercel Image Optimization:

```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={200}
  alt="Kaizen OS"
/>
```

**Limits:**
- Free plan: 1,000 optimizations/month
- Pro plan: 5,000 optimizations/month

### Edge Functions

Use Edge Runtime for faster response times:

```tsx
// app/api/health/route.ts
export const runtime = 'edge'

export async function GET() {
  return new Response('OK', { status: 200 })
}
```

### Caching Strategy

**Static Pages:** Cached at edge (ISR)
```tsx
export const revalidate = 3600 // 1 hour
```

**API Routes:** No cache (dynamic)
```tsx
export const dynamic = 'force-dynamic'
```

---

## Monitoring & Analytics

### Vercel Analytics

Enable in dashboard:
1. Project Settings → Analytics
2. Toggle "Web Analytics" ON
3. Add to app:

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Custom Metrics

Log custom events:

```tsx
import { track } from '@vercel/analytics'

track('guardian_status_checked', {
  gi_score: 0.993,
  agent_id: 'AUREA'
})
```

---

## Rollback Procedure

### Via Dashboard

1. Go to Deployments tab
2. Find previous successful deployment
3. Click three dots → "Promote to Production"

### Via CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

---

## Security Best Practices

1. **Never commit `.env` files** (use `.env.example` as template)
2. **Use Vercel Environment Variables** for secrets
3. **Enable Vercel Authentication** for preview deployments (if sensitive)
4. **Set up Vercel Firewall** (Pro/Enterprise)
5. **Use HTTPS only** (enforced by default)
6. **Add security headers** in `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

## Cost Management

### Free Tier Limits

- **100 GB bandwidth/month**
- **100 deployments/day**
- **10 concurrent builds**

### Monitoring Usage

```bash
# Check deployment quota
vercel ls --limit 100

# View bandwidth usage
# (Via dashboard only)
```

### Optimization Tips

1. **Use Image Optimization sparingly** (counts against quota)
2. **Cache static assets** (reduce bandwidth)
3. **Consolidate preview deployments** (delete old previews)
4. **Use Vercel Edge Network** (free CDN)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'apps/aurea-site/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/aurea-site
```

---

## Post-Deployment Checklist

- [ ] Homepage loads without errors
- [ ] API endpoints return expected responses
- [ ] Environment variables are set correctly
- [ ] No console errors in browser
- [ ] Images load and are optimized
- [ ] Forms submit successfully
- [ ] Analytics tracking works
- [ ] SSL certificate is valid
- [ ] Custom domain (if applicable) resolves correctly
- [ ] Performance score >90 (Lighthouse)

---

## Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Kaizen OS Docs:** `/docs/README.md`
- **Deployment Guide:** `/docs/VERCEL_DEPLOYMENT_GUIDE.md`

**Internal Contacts:**
- Infrastructure Team: infra@kaizen.os
- DevOps Lead: atlas@kaizen.os

---

**Runbook Version:** 1.0
**Last Tested:** October 30, 2025
**Next Review:** November 30, 2025
