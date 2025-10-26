# 🧠 OAA Central Hub

> **Plan • Act • Learn • Seal** — The central nervous system for all labs and tools

## Overview

The OAA Central Hub is the orchestration layer that unifies all labs, tools, and services under a single command and control system. It provides planning, execution, learning, and sealing capabilities across the entire OAA ecosystem.

## Architecture

```
┌───────────────────────────────────────────┐
│ OAA CENTRAL HUB — Plan • Act • Learn • Seal │
└───────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  Jade   │ │  Zeus   │ │   Eve   │
   │(Planner)│ │(Executor)│ │(Human)  │
   └─────────┘ └─────────┘ └─────────┘
        │           │           │
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  Plan   │ │  Act    │ │  Gate   │
   │  /plan  │ │  /act   │ │  /gate  │
   └─────────┘ └─────────┘ └─────────┘
```

## Components

### Core Files

- **`hub.manifest.yaml`** - Central configuration for all labs, tools, and policies
- **`registry.ts`** - TypeScript registry for labs and tools with circuit breakers
- **`hub.ts`** - Main Express router with /plan, /act, /status, and /gate endpoints
- **`OaaTab.tsx`** - React component for Lab4 frontend integration

### Directory Structure

```
oaa/
├── hub.manifest.yaml      # Central configuration
├── registry.ts            # Labs and tools registry
├── hub.ts                 # Main router
├── OaaTab.tsx            # Frontend component
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── lessons/              # Learning materials
├── playbooks/            # Automated procedures
└── runbooks/             # Manual procedures
```

## API Endpoints

### Planning (Jade)
- **POST** `/oaa/plan` - Generate execution plans from goals and state

### Execution (Zeus)
- **POST** `/oaa/act` - Execute tools with policy enforcement
- **GET** `/oaa/status` - System health and status overview

### Human Gate (Eve)
- **POST** `/oaa/gate` - Human approval and review system

## Features

### 🧠 Planning (Jade)
- Goal-based planning system
- Context-aware decision making
- Tool selection and argument generation
- Next steps planning

### ⚡ Execution (Zeus)
- Policy enforcement before execution
- Circuit breaker protection
- Tool registry management
- Execution metrics and monitoring

### 🛡️ Human Gate (Eve)
- Human approval workflows
- Review and audit trails
- Safety gate controls
- Manual override capabilities

### 📊 Observability
- Real-time status monitoring
- Execution card tracking
- Performance metrics
- Error logging and analysis

### 🔄 Learning
- Lesson capture and storage
- Playbook generation
- Runbook maintenance
- Continuous improvement

## Quick Start

1. **Install Dependencies**
   ```bash
   cd oaa
   npm install
   ```

2. **Build TypeScript**
   ```bash
   npm run build
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Hub**
   - API: `http://localhost:8000/oaa`
   - Status: `http://localhost:8000/oaa/status`

## Integration

### Lab4 Frontend
Add the OAA Tab component to your frontend:

```tsx
import OaaTab from './oaa/OaaTab';

// In your main component
<OaaTab />
```

### Lab6 Gateway
Deploy the gateway with HMAC protection:

```bash
# Enable HMAC on all /agent/* endpoints
export ENABLE_HMAC_AUTH=true
export HMAC_SECRET_KEY=your-secret-key
```

### Lab7 OAA
The hub integrates with existing OAA services:

```typescript
// Use existing OAA endpoints
const oaaEndpoint = process.env.OAA_ENDPOINT || 'http://localhost:8000';
```

## Configuration

### Environment Variables

```bash
# Tool endpoints
SCOUT_ENDPOINT=http://localhost:8001/scout
SENTINEL_ENDPOINT=http://localhost:8002/sentinel

# Policy configuration
POLICY_FILE=ops/policy.json

# Logging
OPS_LOGS_DIR=.github/ops_logs
```

### Policy Configuration

The hub reads policy from `ops/policy.json`:

```json
{
  "allowed_domains": ["github.com", "render.com", "localhost"],
  "circuit_breakers": {
    "global_timeout_ms": 30000,
    "max_concurrent_requests": 100
  }
}
```

## Monitoring

### Health Checks
- Lab health monitoring
- Tool availability tracking
- Circuit breaker status
- Performance metrics

### Logging
- Structured JSON logging
- Ops logs integration
- Audit trail maintenance
- Error tracking

### Metrics
- Execution success rates
- Response times
- Error frequencies
- Resource utilization

## Safety Features

### Circuit Breakers
- Automatic failure detection
- Service protection
- Graceful degradation
- Recovery mechanisms

### Policy Enforcement
- Domain allowlisting
- Access controls
- Rate limiting
- Security validation

### Human Gates
- Approval workflows
- Review processes
- Override capabilities
- Audit trails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**OAA Central Hub** - Unifying the nervous system of your entire OAA ecosystem.
