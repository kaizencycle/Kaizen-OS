# Frontend Development Guide

## Frontend Applications Overview

This monorepo contains multiple frontend applications that can be run end-to-end. Below is the complete list with port assignments and development instructions.

## Port Assignments

| App | Port | Framework | Location |
|-----|------|-----------|----------|
| Website Creator | 3000 | Next.js | `apps/website-creator` |
| AUREA Site | 3001 | Next.js | `apps/aurea-site` |
| Portal | 3002 | Next.js | `apps/portal` |
| Hub Web | 3004 | Next.js | `apps/hub-web` |
| HIVE App | 3005 | Static HTML/JS | `apps/hive-app` |
| Genesis Dome | 3006 | Static HTML/JS | `apps/genesisdome-app` |
| Citizen Shield | 3007 | Vite + React | `apps/shield-api/citizen-shield-app` |

## Quick Start

### Install Dependencies

```bash
# Install all dependencies (root + all workspaces)
npm install
```

### Run All Frontend Apps

```bash
# Start all apps in parallel (using Turbo)
npm run dev

# Or start specific apps individually
cd apps/aurea-site && npm run dev
cd apps/portal && npm run dev
cd apps/hub-web && npm run dev
cd apps/website-creator && npm run dev
cd apps/hive-app && npm run dev
cd apps/genesisdome-app && npm run dev
cd apps/shield-api/citizen-shield-app && npm run dev
```

## Application Details

### 1. Website Creator (`apps/website-creator`)
- **Port**: 3000
- **Framework**: Next.js 14
- **Purpose**: .gic Website Creator interface
- **Dev**: `npm run dev` (runs on port 3000)

### 2. AUREA Site (`apps/aurea-site`)
- **Port**: 3001
- **Framework**: Next.js 14
- **Purpose**: Founding Agent Site (Integrity & Reasoning)
- **Dev**: `npm run dev` (runs on port 3001)
- **Features**: Ethers.js integration, Zustand state management

### 3. Portal (`apps/portal`)
- **Port**: 3002
- **Framework**: Next.js 14 (App Router)
- **Purpose**: Main Kaizen OS portal interface
- **Dev**: `npm run dev` (runs on port 3002)

### 4. Hub Web (`apps/hub-web`)
- **Port**: 3004
- **Framework**: Next.js 14
- **Purpose**: OAA Central Hub interface
- **Dev**: `npm run dev` (runs on port 3004)

### 5. HIVE App (`apps/hive-app`)
- **Port**: 3005
- **Framework**: Vanilla HTML/JS (Phaser.js game)
- **Purpose**: 8-bit Starter Game
- **Dev**: `npm run dev` (serves static files on port 3005)
- **Note**: Uses `serve` package for static file serving

### 6. Genesis Dome (`apps/genesisdome-app`)
- **Port**: 3006
- **Framework**: Static HTML/JS (PWA)
- **Purpose**: Genesis Dome PWA site starter
- **Dev**: `npm run dev` (serves static files on port 3006)
- **Features**: Service worker, PWA manifest, offline-first

### 7. Citizen Shield App (`apps/shield-api/citizen-shield-app`)
- **Port**: 3007
- **Framework**: Vite + React
- **Purpose**: Citizen Shield security interface
- **Dev**: `npm run dev` (runs on port 3007)

## Shared Packages

Frontend apps may depend on shared packages:

- `@civic/ui-kit` - Shared React UI components
- `@civic/sdk` - Shared API clients and types
- `@civic/oaa-memory` - OAA parsers and memory management
- `@civic/integrity-core` - GI scoring and integrity checks
- `@kaizen/codex-agentic` - Codex agentic utilities

## Build All Frontend Apps

```bash
# Build all packages and apps
npm run build

# Build specific app
cd apps/aurea-site && npm run build
```

## Troubleshooting

### Port Conflicts

If a port is already in use:
1. Check what's using the port: `lsof -i :3000` (Linux/Mac) or `netstat -ano | findstr :3000` (Windows)
2. Either stop the conflicting process or change the port in the app's `package.json`

### Missing Dependencies

If an app fails to start:
1. Ensure root dependencies are installed: `npm install`
2. Check app-specific dependencies: `cd apps/[app-name] && npm install`
3. Verify shared packages are built: `npm run build --workspace=packages/ui-kit`

### TypeScript Errors

If TypeScript errors occur:
1. Build shared packages first: `npm run build --workspaces`
2. Run type-check: `npm run type-check`
3. Check individual app: `cd apps/[app-name] && npm run type-check`

## Environment Variables

Some apps may require environment variables. Copy `.env.example` to `.env` and configure:

```bash
cp env.example .env
```

Key variables:
- `LEDGER_BASE_URL=http://localhost:4001`
- `INDEXER_BASE_URL=http://localhost:4002`
- `SHIELD_BASE_URL=http://localhost:4004`

## Testing End-to-End

1. **Start all backend services** (if required):
   ```bash
   npm run compose:up
   ```

2. **Start all frontend apps**:
   ```bash
   npm run dev
   ```

3. **Verify each app**:
   - Website Creator: http://localhost:3000
   - AUREA Site: http://localhost:3001
   - Portal: http://localhost:3002
   - Hub Web: http://localhost:3004
   - HIVE App: http://localhost:3005
   - Genesis Dome: http://localhost:3006
   - Citizen Shield: http://localhost:3007

## CI/CD Integration

All frontend apps are configured in `turbo.json` to:
- Build in dependency order
- Run tests after build
- Cache build outputs
- Support parallel execution

## Notes

- **Static Apps**: `hive-app` and `genesisdome-app` are static HTML/JS apps that don't require a build step
- **Next.js Apps**: All Next.js apps use the App Router and support server components
- **Vite App**: `citizen-shield-app` uses Vite for fast HMR and modern tooling
