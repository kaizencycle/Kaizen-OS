# Migration Guide: Mobius Systems → Mobius Systems (C-127)

## Overview

As of Cycle C-127 (November 2025), **Mobius Systems** has been rebranded to **Mobius Systems** to establish a dual-track identity:

- **Kaizen Turing Test (KTT)** — Unchanged scientific evaluation framework for continuous AI improvement
- **Mobius Systems** — Technical platform implementing KTT with continuous integrity architecture

This migration guide helps you update your code, configurations, and deployments to use the new naming conventions.

## What Changed

### Core Nomenclature

| Category | Old Name | New Name |
|----------|----------|----------|
| **Platform** | Mobius Systems | Mobius Systems |
| **Evaluation Framework** | *(implicit)* | Kaizen Turing Test (KTT) |
| **Integrity Metric** | GI (Mobius Integrity Index) | MII (Mobius Integrity Index) |
| **Token/Credits** | MIC (Mobius Integrity Credits) | MIC (Mobius Integrity Credits) |
| **Collectibles** | Kaizen Shards | Mobius Fractal Shards (MFS) |

### Technical Changes

| Scope | Old | New |
|-------|-----|-----|
| **Package Namespace** | `@kaizen/*` | `@mobius/*` |
| **Config Directories** | `.kaizen/` | `.mobius/` |
| **Environment Variables** | `KAIZEN_OS_*` | `MOBIUS_*` |
| **API Endpoints** | `/api/kaizen/*` | `/api/mobius/*` |
| **Root Package Name** | `kaizen-os` | `mobius-systems` |

### What Did NOT Change

- **Kaizen Turing Test (KTT)** name and concept
- **Kaizen principles**: 改善 (Kaizen), 召唤 (Summon), 金繕い (Kintsugi)
- The Triad of Healing
- Manifesto & Rituals
- Repository URL: `kaizencycle/Mobius-Substrate` (GitHub org unchanged)
- Package registry: `@civic/*` packages remain unchanged (specific civic components)

## Migration Steps

### 1. Update Package Dependencies

If you're consuming packages from this monorepo, update your `package.json`:

```diff
{
  "dependencies": {
-   "@kaizen/codex-agentic": "^0.1.0",
+   "@mobius/codex-agentic": "^0.1.0",
-   "@kaizen/delibproof": "^0.1.0",
+   "@mobius/delibproof": "^0.1.0"
  }
}
```

### 2. Update Import Statements

Update all imports in your TypeScript/JavaScript files:

```diff
- import { codexDeliberate } from '@kaizen/codex-agentic';
+ import { codexDeliberate } from '@mobius/codex-agentic';

- import type { DelibProof } from '@kaizen/codex-agentic';
+ import type { DelibProof } from '@mobius/codex-agentic';
```

### 3. Update Configuration Files

#### Next.js Configuration

```diff
// next.config.js
const nextConfig = {
  reactStrictMode: true,
- transpilePackages: ['@kaizen/codex-agentic'],
+ transpilePackages: ['@mobius/codex-agentic'],
}
```

#### Directory References

Update any references to `.kaizen/` directories:

```diff
- const manifestPath = '.kaizen/atlas.manifest.json';
+ const manifestPath = '.mobius/atlas.manifest.json';

- GET /api/kaizen/mount
+ GET /api/mobius/mount
```

### 4. Update Environment Variables

Rename environment variables in your `.env` files and deployment configs:

```diff
# Old naming
- KAIZEN_OS_EXPORT_URL=https://api.example.com
- KAIZEN_OS_EXPORT_TOKEN=secret_token
+ MOBIUS_EXPORT_URL=https://api.example.com
+ MOBIUS_EXPORT_TOKEN=secret_token

# Metrics (if using explicit env vars)
- GI_THRESHOLD=0.95
+ MII_THRESHOLD=0.95
```

### 5. Update API Endpoints

If you have custom API routes:

```diff
// pages/api/deliberate.ts
export default async function handler(req, res) {
- const response = await fetch('/api/kaizen/mount');
+ const response = await fetch('/api/mobius/mount');
}
```

### 6. Update Documentation and Comments

Update inline documentation:

```diff
/**
- * Codex Agentic system for Mobius Systems Founding Agents
+ * Codex Agentic system for Mobius Systems Founding Agents
+ * Implements the Kaizen Turing Test (KTT) evaluation framework
 */
```

### 7. Update Badge References

If you're displaying badges or metrics:

```diff
- [![GI Badge](https://img.shields.io/badge/GI-0.995-brightgreen)]
+ [![MII Badge](https://img.shields.io/badge/MII-0.995-brightgreen)]
```

## Backwards Compatibility

For a transition period, consider supporting both naming schemes:

```typescript
// Environment variables with fallback
const exportUrl = process.env.MOBIUS_EXPORT_URL
  || process.env.KAIZEN_OS_EXPORT_URL
  || process.env.CIVIC_OS_EXPORT_URL;

// Package imports (if publishing dual packages)
try {
  const { codexDeliberate } = await import('@mobius/codex-agentic');
} catch {
  const { codexDeliberate } = await import('@kaizen/codex-agentic');
}
```

## Deployment Updates

### Vercel

Update your `vercel.json` if it references old naming:

```diff
{
  "env": {
-   "KAIZEN_OS_API_KEY": "@kaizen-api-key"
+   "MOBIUS_API_KEY": "@mobius-api-key"
  }
}
```

### Docker

Update Dockerfile and docker-compose.yml:

```diff
# Dockerfile
- ENV KAIZEN_OS_MODE=production
+ ENV MOBIUS_MODE=production

# docker-compose.yml
services:
  app:
    environment:
-     - KAIZEN_OS_EXPORT_URL=${KAIZEN_OS_EXPORT_URL}
+     - MOBIUS_EXPORT_URL=${MOBIUS_EXPORT_URL}
```

### Kubernetes

Update ConfigMaps and Secrets:

```diff
apiVersion: v1
kind: ConfigMap
metadata:
- name: kaizen-config
+ name: mobius-config
data:
- KAIZEN_OS_API_URL: "https://api.example.com"
+ MOBIUS_API_URL: "https://api.example.com"
```

## Testing Migration

After migrating, verify:

1. **Package Resolution**: Run `npm install` and ensure all `@mobius/*` packages resolve
2. **Type Checking**: Run `tsc --noEmit` to catch import errors
3. **Build**: Run your build process and check for errors
4. **Runtime**: Test key features that use renamed packages
5. **Environment**: Verify all environment variables are recognized

## Common Issues

### Issue: Package Not Found

```
Error: Cannot find module '@mobius/codex-agentic'
```

**Solution**: Run `npm install` to fetch updated packages. If using workspaces, ensure the package has been renamed.

### Issue: Old Environment Variables

```
Warning: KAIZEN_OS_EXPORT_URL is undefined
```

**Solution**: Update your `.env` files and deployment environment to use `MOBIUS_*` prefixes.

### Issue: API 404 Errors

```
Error: POST /api/kaizen/mount 404 Not Found
```

**Solution**: Update API routes from `/api/kaizen/*` to `/api/mobius/*`.

## Timeline

- **C-126 and earlier**: Mobius Systems naming
- **C-127 (November 2025)**: Mobius Systems rebrand
- **C-127 → C-130 (3 cycles)**: Transition period with backwards compatibility
- **C-131+ (February 2026)**: Full migration expected, legacy naming deprecated

## Philosophy Preservation

While the platform name has changed, the core philosophy remains:

- **改善 (Kaizen)** — Continuous improvement as a way of being
- **召唤 (Summon)** — Calling forth collective intelligence
- **金繕い (Kintsugi)** — Healing through transparent repair

The **Kaizen Turing Test (KTT)** continues as the scientific framework for evaluating AI systems on their capacity for continuous integrity improvement. **Mobius Systems** is the technical implementation demonstrating infinite recursion toward higher integrity.

## Support

- **Documentation**: [README.md](./README.md)
- **Issues**: [GitHub Issues](https://github.com/kaizencycle/Mobius-Substrate/issues)
- **Discord**: [Mobius Systems Community](https://discord.gg/kaizenos)

---

*"Intelligence moves. Integrity guides."* — Mobius Principle
*"We heal as we walk."* — Founder's Seal

**Last Updated**: C-127 (2025-11-07)
