# Civic Internet - Render Deployment Guide

This guide covers deploying the Civic Internet ecosystem to Render, including the GIC Gateway, OAA Hub, and supporting services.

## Architecture Overview

The Civic Internet is a bio-digital microcosm with the following components:

- **Genome** → Virtue Accords + OAA/OAA-API schemas
- **Cells** → Companion apps & services  
- **Transcription/Translation** → Cursor agents turning reflections → code → PRs
- **Nervous system** → Queues (BullMQ), pulses, health sentinels
- **Immune system** → Citizen Shield (HMAC/attestations)
- **Circulatory** → .gic gateway ↔ IPFS ↔ Civic Ledger
- **Metabolism** → GIC Treasury feedback & rewards
- **Homeostasis** → monitoring + auto-retry + cache warm
- **Reproduction** → starter templates that spawn new agents/sites

## Services Deployed

### 1. GIC Gateway (`gic-gateway`)
- **Type**: Web service
- **Port**: 8787
- **Purpose**: Core gateway for .gic domain resolution and IPFS integration
- **Health Check**: `GET /` returns `{ ok: true, name: "gic-gateway" }`

### 2. OAA Hub (`oaa-hub`)
- **Type**: Web service  
- **Purpose**: Central hub for companion management and civic constitution
- **Features**:
  - Companion hologram UI with Three.js
  - Civic constitution viewer
  - Feed API for companion data
  - Auto-seal pipeline for constitution updates

### 3. Publish Worker (`oaa-publish-worker`)
- **Type**: Background worker
- **Purpose**: Processes publish queue jobs for companion content
- **Queue**: BullMQ with Redis backend

### 4. Redis (`civic-redis`)
- **Type**: Managed Redis instance
- **Purpose**: Queue storage and caching
- **Access**: Private (no external IP allowlist)

## Environment Variables

### Required Secrets (set in Render dashboard)

#### GIC Gateway
- `RPC_URL`: Ethereum RPC endpoint (e.g., Infura, Alchemy)
- `REGISTRY_ADDR`: Smart contract address for .gic registry
- `GATEWAY_HMAC_SECRET`: Auto-generated secret for HMAC authentication

#### OAA Hub
- `GIC_RPC_URL`: Same as gateway RPC_URL
- `GIC_REGISTRY_ADDR`: Same as gateway registry address
- `GIC_REGISTRAR_PRIVATE_KEY`: Private key for domain registration
- `LEDGER_BASE_URL`: Civic Ledger API endpoint
- `LEDGER_ADMIN_TOKEN`: Admin token for ledger operations
- `IPFS_PIN_TOKEN`: Web3.Storage API token
- `GATEWAY_HMAC_SECRET`: Shared with gateway

#### Publish Worker
- Same environment as OAA Hub (inherits from hub service)

## Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all files are committed
git add .
git commit -m "feat: add Render deployment configuration"
git push origin main
```

### 2. Create Render Services

#### Option A: Blueprint Deployment (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the `render.yaml` file
5. Review and deploy all services

#### Option B: Manual Service Creation
1. Create each service individually in Render dashboard
2. Use the configuration from `render.yaml`
3. Set environment variables as listed above

### 3. Configure Environment Variables
Set the following secrets in Render dashboard:

```bash
# Required for all services
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
REGISTRY_ADDR=0x1234567890123456789012345678901234567890
GATEWAY_HMAC_SECRET=your-secret-key-here

# Required for OAA Hub and Worker
GIC_REGISTRAR_PRIVATE_KEY=0x1234567890abcdef...
LEDGER_BASE_URL=https://ledger.yourdomain.com/api
LEDGER_ADMIN_TOKEN=your-ledger-token
IPFS_PIN_TOKEN=your-web3-storage-token
```

### 4. Verify Deployment

#### Health Checks
```bash
# Gateway health
curl https://gic-gateway.onrender.com/
# Expected: { "ok": true, "name": "gic-gateway" }

# Hub health  
curl https://oaa-hub.onrender.com/api/tools/status
# Expected: { "ok": true, "status": "healthy" }
```

#### Test Companion Features
```bash
# Test companion feed
curl "https://oaa-hub.onrender.com/api/companions/feed?companion=jade"

# Test constitution viewer
curl "https://oaa-hub.onrender.com/constitution"
```

#### Test Domain Resolution
```bash
# Resolve a .gic domain
curl "https://gic-gateway.onrender.com/resolve/jade"
# Expected: { "ok": true, "cid": "...", "proof": "..." }
```

## Features

### Companion Hologram UI
- **Path**: `/holo`
- **Features**:
  - Three.js rotating holo-sigil ring
  - Memory beads showing recent posts
  - Integrity-based color pulsing (green ↔ blue)
  - Real-time feed integration

### Civic Constitution Viewer
- **Path**: `/constitution`
- **Features**:
  - Renders Virtue Accords markdown
  - Shows signed amendment history
  - Cryptographic proof verification
  - Auto-updating via GitHub Actions

### Auto-Seal Pipeline
- **Trigger**: Changes to `public/constitution/virtue_accords.md`
- **Process**:
  1. Detects content changes via SHA256 hash
  2. Seals new version to Civic Ledger
  3. Updates `history.json` with proof
  4. Commits changes back to repository

## Monitoring and Maintenance

### Health Monitoring
- All services have health check endpoints
- Render provides built-in monitoring and alerts
- Check logs in Render dashboard for issues

### Scaling
- Services start on "starter" plan
- Upgrade to higher plans as needed
- Redis can be scaled independently

### Updates
- Auto-deploy is enabled for all services
- Push to main branch triggers deployment
- Constitution changes trigger auto-seal pipeline

## Troubleshooting

### Common Issues

1. **Service won't start**
   - Check environment variables are set
   - Verify build commands work locally
   - Check logs for specific errors

2. **Health checks failing**
   - Ensure all required env vars are present
   - Check service dependencies (Redis, external APIs)
   - Verify network connectivity

3. **Constitution auto-seal not working**
   - Check GitHub Actions secrets are set
   - Verify LEDGER_BASE_URL is accessible
   - Check workflow logs for errors

### Debug Commands
```bash
# Check service logs
render logs --service gic-gateway
render logs --service oaa-hub

# Test environment variables
render env --service gic-gateway
```

## Next Steps

After successful deployment:

1. **Configure DNS**: Point your .gic domains to the gateway
2. **Set up monitoring**: Configure alerts for service health
3. **Add more companions**: Deploy additional companion sites
4. **Governance**: Set up Agora (Cognitive Commons) for community governance
5. **Treasury**: Deploy GIC Treasury dApp for token management

## Support

- **Documentation**: See individual service READMEs
- **Issues**: Create GitHub issues for bugs
- **Community**: Join the Civic Internet Discord
- **Render Support**: Use Render's built-in support system

---

*This deployment brings the Civic Internet organism online, creating a living, self-healing web infrastructure with built-in integrity and governance.*