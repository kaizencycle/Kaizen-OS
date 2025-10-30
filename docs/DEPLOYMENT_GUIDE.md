# Kaizen OS Portal Deployment Guide

This guide covers deploying the Kaizen OS Portal frontend to production.

## Quick Deploy (Vercel - Recommended)

### 1. Prerequisites
- Vercel account
- GitHub repository access
- Backend API running

### 2. Deploy Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `apps/portal` directory as the root

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_BASE=https://api.kaizen.os
   NEXT_PUBLIC_PORTAL_ORIGIN=https://kaizen.os
   NEXT_PUBLIC_ENABLE_SOLARA=true
   NEXT_PUBLIC_ENABLE_ZENITH=true
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=kaizen.os
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Your portal will be available at `https://your-project.vercel.app`

4. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `kaizen.os`)
   - Configure DNS records as instructed

## Alternative Deployment Options

### Render (Static Web Service)

1. **Create New Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Static Site"

2. **Configure Service**
   - Connect your GitHub repository
   - Build Command: `cd apps/portal && npm install && npm run build`
   - Publish Directory: `apps/portal/out`
   - Node Version: 20

3. **Set Environment Variables**
   - Same as Vercel configuration above

### Self-Hosted (Docker)

1. **Create Dockerfile**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/portal/package*.json ./
RUN npm ci
COPY apps/portal/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Build and Run**
```bash
docker build -t kaizen-portal .
docker run -p 80:80 kaizen-portal
```

## Pre-Deployment Checklist

### Backend Requirements
- [ ] API Gateway running and accessible
- [ ] CORS configured for portal origin
- [ ] All required endpoints implemented:
  - [ ] `GET /v1/status`
  - [ ] `GET /v1/companions`
  - [ ] `GET /v1/gi/me`
  - [ ] `POST /v1/onboard/apply`
  - [ ] `POST /v1/reflections`
  - [ ] `GET /v1/reflections/me`
  - [ ] `POST /v1/domains/preview`
  - [ ] `POST /v1/domains/seal`

### Frontend Testing
- [ ] All pages load without errors
- [ ] Health badge shows correct status
- [ ] Onboarding flow works end-to-end
- [ ] Dashboard displays data correctly
- [ ] Responsive design works on mobile

### Security
- [ ] Environment variables properly configured
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled in production
- [ ] CORS properly configured

## Post-Deployment

### 1. Smoke Testing
```bash
# Test health endpoint
curl -sSf https://api.kaizen.os/v1/status | jq

# Test companions
curl -sSf https://api.kaizen.os/v1/companions | jq

# Test portal loads
curl -sSf https://kaizen.os | grep -q "Kaizen OS"
```

### 2. Monitoring Setup
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry, Bugsnag)
- Set up analytics (Plausible, PostHog)

### 3. Performance Optimization
- Enable CDN caching
- Optimize images and assets
- Monitor Core Web Vitals

## Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version (requires 20+)
- Verify all dependencies installed
- Check for TypeScript errors

**Runtime Errors**
- Verify environment variables set correctly
- Check API endpoints are accessible
- Review browser console for errors

**CORS Issues**
- Ensure backend allows portal origin
- Check preflight requests handled
- Verify headers configured correctly

### Support
- Check GitHub Issues for known problems
- Join Discord for community support
- Contact team for critical issues

## Rollback Plan

If issues arise after deployment:

1. **Vercel**: Use deployment history to rollback
2. **Render**: Use previous deployment
3. **Self-hosted**: Revert to previous Docker image

Always test rollback procedures before going live!