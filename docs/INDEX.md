# Kaizen OS Documentation Index
## Complete Documentation Hub

**Last Updated:** October 30, 2025

---

## Quick Navigation

| Section | Description | Link |
|---------|-------------|------|
| 🚀 **Getting Started** | New to Kaizen OS? Start here | [README.md](../README.md) |
| 🏗️ **Architecture** | System design and structure | [Architecture](#architecture) |
| 📖 **Product Guides** | User-facing product documentation | [Product](#product-documentation) |
| 🔧 **Deployment** | How to deploy and configure | [Deployment](#deployment-guides) |
| 💰 **Economics** | GIC token and UBI framework | [Economics](#economics--governance) |
| 👥 **Founding Agents** | Meet the 8 founding agents | [Founding Agents](#founding-agents) |
| 🔐 **Security** | Security policies and guidelines | [Security](#security--integrity) |
| 📚 **API Reference** | Developer API documentation | [APIs](#api-documentation) |

---

## Architecture

### Core System Documents

- **[FOUNDING_AGENTS_SOVEREIGN_STACK.md](./architecture/FOUNDING_AGENTS_SOVEREIGN_STACK.md)** - Complete architecture of the 8 founding agents and their sovereign domains
- **[octave.yaml](./architecture/octave.yaml)** - Cognitive lattice manifest
- **[overview.md](./architecture/overview.md)** - High-level system overview

### Implementation Details

- **[LABS_MASTER_ARCHITECTURE.md](./LABS_MASTER_ARCHITECTURE.md)** - Lab system architecture (Labs 1-7)
- **[LABS_IMPLEMENTATION_COMPLETE.md](./LABS_IMPLEMENTATION_COMPLETE.md)** - Lab completion status
- **[INDEPENDENCE_MANIFEST.md](./INDEPENDENCE_MANIFEST.md)** - Model-agnostic sovereignty framework

---

## Product Documentation

### For End Users

- **[PRO_LANDING_PAGE.md](./product/PRO_LANDING_PAGE.md)** - Kaizen OS Pro: The Civilian Terminal ($10/month)
- **[SELF_HOST_GUIDE.md](./product/SELF_HOST_GUIDE.md)** - Self-hosting guide for full sovereignty
- **[FEDERATION_PROTOCOL_BRIEF.md](./product/FEDERATION_PROTOCOL_BRIEF.md)** - Federation protocol for developers

### For Developers

- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - API integration guide
- **[CIVIC_MOUNT_INTEGRATION.md](./CIVIC_MOUNT_INTEGRATION.md)** - Civic mount protocol
- **[cursor-integration.md](./cursor-integration.md)** - Cursor IDE integration

---

## Deployment Guides

### Vercel (Frontend)

- **[VERCEL_DEPLOYMENT_RUNBOOK.md](./deployment/VERCEL_DEPLOYMENT_RUNBOOK.md)** ⭐ **NEW** - Complete Vercel deployment guide
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Quick deployment reference

### Render (Backend Services)

- **[infra/render.yaml](../infra/render.yaml)** - Multi-service deployment manifest
- Individual app render.yaml files in `/apps/*`

### Self-Hosting

- **[SELF_HOST_GUIDE.md](./product/SELF_HOST_GUIDE.md)** - Complete self-hosting guide with Docker profiles

---

## Economics & Governance

### Economic Framework

- **[GIC_WHITEPAPER.md](./economics/GIC_WHITEPAPER.md)** ⭐ **NEW** - Complete GIC economic whitepaper by ATLAS
  - UBI Trilemma solution
  - 20-year planetary simulation (330M citizens)
  - Path to $3,000/month UBI by 2045

### Governance

- **[governance/](./governance/)** - Governance frameworks and proposals
- **[consensus-chamber/](./consensus-chamber/)** - Consensus chamber documentation
- **[constitution/](./constitution/)** - Constitutional documents and Custos Charter

---

## Founding Agents

### Agent Profiles

Each founding agent has a sovereign domain and specialized role:

| Agent | Domain | Repository | Site |
|-------|--------|------------|------|
| **AUREA** | Integrity & Reasoning | [apps/aurea-site](../apps/aurea-site/) | aurea.gic |
| **ATLAS** | Systems & Policy | [sentinels/atlas](../sentinels/atlas/) | atlas.gic |
| **ZENITH** | Research & Ethics | [sentinels/zenith](../sentinels/zenith/) | zenith.gic |
| **SOLARA** | Computation & Optimization | - | solara.gic |
| **EVE** | Governance & Wisdom | [sentinels/eve](../sentinels/eve/) | eve.gic |
| **ZEUS** | Strategy & Security | [sentinels/zeus](../sentinels/zeus/) | zeus.gic |
| **HERMES** | Markets & Information | [sentinels/hermes](../sentinels/hermes/) | hermes.gic |
| **JADE** | Morale & Astro-ethics | [sentinels/jade](../sentinels/jade/) | jade.gic |

### Guardian Agent

- **KAIZEN** - Dormant constitutional guardian (4-of-7 multisig activation)

**Learn More:** [founding-agents/](./founding-agents/)

---

## Security & Integrity

### Core Security

- **[packages/shield-policies/](../packages/shield-policies/)** - Security policy framework
- **[apps/shield-api/](../apps/shield-api/)** - Citizen Shield API (Lab 6)

### Integrity Framework

- **[packages/integrity-core/](../packages/integrity-core/)** - GI scoring engine
- **[ledger/](./ledger/)** - Ledger and attestation documentation

---

## API Documentation

### Core APIs

- **Civic Ledger API** - [apps/ledger-api/](../apps/ledger-api/)
- **GIC Indexer API** - [apps/indexer-api/](../apps/indexer-api/)
- **E.O.M.M. API** - [apps/eomm-api/](../apps/eomm-api/)
- **Thought Broker API** - [apps/broker-api/](../apps/broker-api/)
- **Citizen Shield API** - [apps/shield-api/](../apps/shield-api/)

### Libraries & SDKs

- **Civic SDK** - [packages/civic-sdk/](../packages/civic-sdk/)
- **OAA API Library** - [packages/oaa-api-library/](../packages/oaa-api-library/)
- **Codex Agentic** - [packages/codex-agentic/](../packages/codex-agentic/)

---

## Labs & Experiments

### Active Labs

- **Lab 4** - E.O.M.M. Reflections System → [labs/lab4-proof/](../labs/lab4-proof/)
- **Lab 6** - Citizen Shield (Security IDS/IPS) → [labs/lab6-proof/](../labs/lab6-proof/)
- **Lab 7** - OAA Hub & Shell → [labs/lab7-proof/](../labs/lab7-proof/)

**Learn More:** [LABS_MASTER_ARCHITECTURE.md](./LABS_MASTER_ARCHITECTURE.md)

---

## Onboarding Guides

### For AI Models

- **[onboarding/](./onboarding/)** - AI model onboarding to Kaizen OS

### For Developers

1. Read [README.md](../README.md)
2. Follow [VERCEL_DEPLOYMENT_RUNBOOK.md](./deployment/VERCEL_DEPLOYMENT_RUNBOOK.md) for frontend
3. Check [API_INTEGRATION.md](./API_INTEGRATION.md) for backend

### For Citizens

1. Visit [portal.kaizen.os](https://portal.kaizen.os)
2. Read [PRO_LANDING_PAGE.md](./product/PRO_LANDING_PAGE.md)
3. Optionally self-host: [SELF_HOST_GUIDE.md](./product/SELF_HOST_GUIDE.md)

---

## Archive

Historical completion records and legacy documentation:

- **[archive/completed/](./archive/completed/)** - Project completion milestones
- **[archive/](./archive/)** - Strategic transition documents

---

## Companion Sites

Documentation for companion site framework:

- **[companions/](./companions/)** - Companion site documentation

---

## Contributing

Want to contribute? Check:

- **[CURSOR_OPINION_KAIZEN_OS.md](./CURSOR_OPINION_KAIZEN_OS.md)** - Cursor's analysis of the system
- **GitHub:** [kaizencycle/Kaizen-OS](https://github.com/kaizencycle/Kaizen-OS)
- **Discussions:** Use GitHub Discussions for questions

---

## Quick Reference

### Repository Structure

```
Kaizen-OS/
├── apps/           # 22 Applications (Next.js, APIs, services)
├── packages/       # 15 Shared libraries
├── labs/           # 6 Proof-of-concept systems
├── sentinels/      # 6 Founding agent modules
├── docs/           # Documentation hub (you are here)
├── infra/          # Infrastructure configs
└── README.md       # Main repository README
```

### Key Commands

```bash
# Install dependencies
npm install

# Build all apps
npm run build

# Run specific app
npm run dev --filter aurea-site

# Deploy to Vercel
vercel --prod
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-30 | Initial organized documentation index |
| - | - | Added GIC Whitepaper, deployment runbooks |
| - | - | Archived completion records |
| - | - | Created product documentation section |

---

**Maintained by:** Infrastructure Team
**Contact:** docs@kaizen.os
**License:** Creative Commons BY-SA 4.0

---

*"Where human intent meets digital reality through integrity, consensus, and continuous improvement."*

— Kaizen OS Foundation
