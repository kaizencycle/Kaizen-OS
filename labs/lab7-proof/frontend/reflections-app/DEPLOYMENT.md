# Frontend Deployment Guide

## Environment Variables

Set the following environment variable in your deployment platform:

```
NEXT_PUBLIC_OAA_API_BASE=https://your-lab7-api-url.onrender.com
```

## Local Development

```bash
# Set environment variable
export NEXT_PUBLIC_OAA_API_BASE=http://localhost:8000

# Install dependencies
npm install

# Run development server
npm run dev
```

## Production Build

```bash
# Build for static export
npm run build

# The output will be in the 'out' directory
# Deploy the contents of 'out' to your static hosting platform
```

## Render Static Site Deployment

1. Connect your repository to Render
2. Create a new Static Site
3. Set the following:
   - **Root Directory**: `frontend/reflections-app`
   - **Build Command**: `npm ci && npm run build && npx next export`
   - **Publish Directory**: `out`
   - **Environment Variables**: `NEXT_PUBLIC_OAA_API_BASE=https://your-lab7-api-url.onrender.com`

## Features

- ✅ OAA Console with health checks
- ✅ Public key display
- ✅ Verify endpoint testing
- ✅ Mock mentor system for demo
- ✅ Static export ready
- ✅ Responsive design

