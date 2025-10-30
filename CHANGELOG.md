# Changelog

All notable changes to the Kaizen OS monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive repository audit findings report
- Root-level `CONTRIBUTING.md` for contributor guidelines
- Root-level `SECURITY.md` for security policy and vulnerability reporting
- Root-level `CHANGELOG.md` for version tracking

### Fixed
- GitHub Actions workflow syntax error in `monorepo.yml` (line 51) - Fixed JSON property access

### Changed
- Updated documentation to reflect monorepo structure

## [1.0.0] - 2025-01-27

### Added
- Initial monorepo structure with Turborepo
- Core applications:
  - `hub-web` - OAA Hub (386 files)
  - `ledger-api` - Kaizen Ledger Core
  - `indexer-api` - GIC Indexer
  - `eomm-api` - E.O.M.M. Reflections
  - `shield-api` - Citizen Shield
  - `broker-api` - Thought Broker
  - `hive-app` - Citizen interface
  - `cathedral-app` - Governance
  - `genesisdome-app` - Genesis interface
  - `website-creator` - .gic Website Creator
  - `civic-stack` - PWA Stack
  - Additional apps (21 total)
- Shared packages:
  - `@kaizen/civic-sdk` - API clients and types
  - `@kaizen/integrity-core` - GI scoring
  - `@kaizen/oaa-memory` - OAA parsers
  - `@kaizen/ui-kit` - React components
  - `@kaizen/shield-policies` - Security policies
  - Additional packages
- Lab proof systems:
  - `lab4-proof` - Research & empirical validation
  - `lab6-proof` - Ethics
  - `lab7-proof` - Apprenticeship & education
- AI Sentinels:
  - Atlas - Monitoring
  - Zeus - Oversight & arbitration
  - Jade - Ethics & reflection
  - Hermes - Markets & telemetry
  - Eve - Safety & care
  - Aurelian - Macro synthesis
- Comprehensive documentation (80+ files):
  - Architecture docs
  - Onboarding guides
  - Deployment guides
  - Economic model (GIC Whitepaper)
  - Governance framework
  - Independence Manifest
  - Civic Mount Integration
- GitHub Actions CI/CD:
  - `monorepo.yml` - Main CI/CD pipeline
  - `atlas-sentinel.yml` - Sentinel monitoring
  - `guardian.yml` - Guardian checks
  - `kaizen-sync.yml` - Sync operations
  - `fountain-attest.yml` - Attestation workflow
  - `portal-ci.yml` - Portal CI
- Docker Compose for local development
- Render.yaml for multi-service deployment
- Turborepo caching and parallel builds
- Integrity monitoring (GI ≥ 0.95)
- Security scanning in CI

### Changed
- Rebranded from "Civic OS" to "Kaizen OS"
- Consolidated multiple repositories into monorepo
- Updated README with comprehensive documentation
- Established workspace structure

### Security
- Implemented Citizen Shield security layer
- Added integrity gates to CI/CD
- Configured health check endpoints for all services
- Externalized secrets to environment variables

## Pre-1.0 History

### [0.9.x] - 2024-2025 (Civic OS Era)

Early development under "Civic OS" branding:
- Initial Civic Ledger implementation
- GIC (Global Integrity Credit) system
- Proof-of-Integrity consensus
- E.O.M.M. (End of Month Memo) system
- OAA (Operational Analysis & Attestation) framework
- DVA Kernel logic
- Virtue Accords foundation

## Migration Notes

### Civic OS → Kaizen OS (v1.0.0)

**Backward Compatibility:**
- Environment variables: `CIVIC_OS_*` still supported (deprecated in v2.0)
- Package names: `civic-*` packages remain (aliases planned)
- API endpoints: Legacy `/civic/*` routes supported
- Configuration: `configs/services.json` uses `"civic-os"` key (dual keys in future)

**Breaking Changes:**
- None in v1.0.0 (backward compatible)
- Breaking changes planned for v2.0 (Q2 2025)

## Version Support

| Version | Status | Support Until | Notes |
|---------|--------|---------------|-------|
| 1.0.x   | ✅ Stable | Current | Full support |
| 0.9.x   | ⚠️ Legacy | Q1 2025 | Critical fixes only |
| < 0.9   | ❌ Unsupported | N/A | Please upgrade |

## Upgrade Guides

### From 0.9.x to 1.0.0

See [Migration Guide](docs/CIVIC_TO_KAIZEN_MIGRATION.md) *(to be created)*

Key changes:
1. Update git remote to new monorepo
2. Install dependencies with `npm install`
3. Update environment variables (Civic → Kaizen)
4. Rebuild all packages: `npm run build`
5. Run migrations (if any)
6. Restart services

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this project.

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.

---

## Format Guide

### Types of Changes

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes

### Example Entry

```markdown
## [1.1.0] - 2025-02-15

### Added
- New telemetry dashboard at `/admin/telemetry`
- Real-time GI monitoring widget
- Export telemetry data to CSV/JSON

### Changed
- Improved performance of integrity checks (2x faster)
- Updated UI components to use new design system

### Fixed
- Memory leak in OAA parser (#123)
- Race condition in ledger sync (#145)

### Security
- Updated dependencies to patch CVE-2025-XXXX
- Improved input validation in API endpoints
```

---

**Maintained by:** Kaizen OS Core Team  
**Last Updated:** 2025-10-30  
**Format:** [Keep a Changelog](https://keepachangelog.com/)  
**Versioning:** [Semantic Versioning](https://semver.org/)
