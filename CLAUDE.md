# 🌀 Mobius Substrate Monorepo

**Current Cycle:** C-284
**Package Manager:** npm (standardized from pnpm in C-180)
**Build Tool:** Turborepo
**Node Version:** 20
**MII Status:** ≥ 0.95 ✅
**Vault Version:** 2 (Sealed Reserve — see [Vault v2 protocol](docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md))
**State of Substrate:** [STATE_OF_THE_SUBSTRATE_C-284.md](docs/STATE_OF_THE_SUBSTRATE_C-284.md)

---

## 📁 Repository Structure

```
Mobius-Substrate/
├── apps/                    # 15+ Applications
│   ├── portal/             # Main portal (Next.js)
│   ├── habits-web/         # Habits tracker (Next.js)
│   ├── mobius-landing/     # Landing page (Next.js)
│   ├── broker-api/         # Broker service (Express)
│   ├── cathedral-app/      # Cathedral service (Express)
│   └── ...                 # 10+ other services
├── packages/               # Shared Libraries
│   ├── integrity-core/     # Core integrity calculations
│   ├── civic-sdk/          # Civic protocol SDK
│   ├── atlas-sentinel/     # ATLAS agent
│   └── ...                 # 10+ packages
├── sentinels/              # Agent Services
│   ├── atlas/              # Primary agent
│   ├── aurea/              # Secondary agent
│   ├── zeus-coordinator/   # Coordinator
│   └── ...                 # 5 sentinels
├── .github/workflows/      # 20 Active CI Workflows
├── docs/                   # Documentation (1100+ docs)
│   ├── 00-START-HERE/      # Navigation hub
│   ├── 03-GOVERNANCE-AND-POLICY/
│   │   └── foundation/     # Charter, bylaws, legal (moved from /FOUNDATION)
│   ├── 07-RESEARCH-AND-PUBLICATIONS/
│   │   ├── for-academics/  # Research cathedral (moved from /FOR-ACADEMICS)
│   │   ├── for-economists/ # Market cathedral (moved from /FOR-ECONOMISTS)
│   │   ├── for-philosophers/ # Ethics cathedral (moved from /FOR-PHILOSOPHERS)
│   │   └── for-governments/ # Policy cathedral (moved from /FOR-GOVERNMENTS)
│   └── ...
└── catalog/                # Auto-generated catalog
```

---

## 🎯 Critical Thresholds & Guarantees

### Mobius Integrity Index (MII)
- **Threshold:** ≥ 0.95
- **Current:** ~0.998 (post-C-180 optimizations)
- **Enforced by:** GI Gate workflow (.github/workflows/gi-gate.yml)

### Anti-Nuke Protection
- **Max Deletions:** 5 files
- **Max Deletion Ratio:** 15% of changed files
- **Protected Paths:** apps/, packages/, labs/, sentinels/, docs/, infra/, .github/
- **Enforced by:** .github/workflows/anti-nuke.yml

### Global Integrity (GI)
- **Baseline Threshold:** ≥ 0.95
- **Variable:** `KAIZEN_GI_BASELINE` (default: 0.993)
- **Enforced by:** .github/workflows/gi-gate.yml

### Catalog Integrity
- **File:** catalog/mobius_catalog.json
- **Stats:** 1100+ docs, 3 EPICONs
- **Must regenerate after:** Adding/moving docs, EPICON changes
- **Command:** `npm run export:catalog`
- **Enforced by:** .github/workflows/catalog-check.yml

---

## 🚀 Common Commands

### Building
```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build --workspace=@civic/portal

# Build with Turbo (affected only)
npx turbo run build
```

### Testing
```bash
# Run all tests
npm run test

# Run specific workspace tests
npm run test --workspace=@civic/integrity-core

# Type checking
npm run type-check
```

### Development
```bash
# Start all dev servers
npm run dev

# Start frontend only
npm run dev:frontend

# Start specific app
npm run dev --workspace=apps/portal
```

### Catalog Management
```bash
# Regenerate catalog (REQUIRED after doc changes)
npm run export:catalog

# Validate catalog
npm run export:catalog && git diff catalog/mobius_catalog.json
```

### CI/CD
```bash
# All CI checks run automatically on PR
# Key workflows:
# - catalog-check.yml: Ensures catalog is up to date
# - ci.yml: Build, lint, test (uses Turbo)
# - gi-gate.yml: Enforces GI threshold
# - anti-nuke.yml: Prevents mass deletions
# - drift-compliance.yml: Validates drift control
```

---

## 📋 Governance & EPICON System

### EPICON-02 Intent Publications
**Required for:** Significant changes (security, infrastructure, governance)

**Intent Block Format:**
```intent
epicon_id: EPICON_C-<cycle>_<SCOPE>_<description>_v1
title: <Short title>
cycle: C-<number>
scope: security | infrastructure | docker | docs | core | specs
mode: normal | emergency
issued_at: <ISO 8601 timestamp>
expires_at: <ISO 8601 timestamp>

justification:
  VALUES INVOKED: integrity, safety, transparency
  REASONING: <Why this change>
  ANCHORS: <2+ independent supports>
  BOUNDARIES: <When this does NOT apply>
  COUNTERFACTUAL: <What would change conclusion>

counterfactuals:
  - <Condition that would block merge>
  - <Condition that would require revert>
```

### EPICON-03 Multi-Agent Consensus
**Agents:** ATLAS, AUREA, EVE, HERMES, JADE
**Threshold:** ECS (EPICON Consensus Score) varies by scope
**Workflow:** .github/workflows/epicon03-consensus.yml

---

## 🔧 Recent Optimizations (C-180)

### Phase 1: Security Vulnerability Remediation ✅
- **CRITICAL vulnerabilities:** 1 → 0 (-100%)
- **HIGH vulnerabilities:** 8 → 3 (-63%)
- **Key fixes:**
  - Next.js: 14.2.5 → 14.2.35 (12 vulnerabilities)
  - @modelcontextprotocol/sdk: 1.24.3 → 1.25.1 (DNS rebinding)
  - ethers: 6.15.0 → 6.16.0 (WebSocket)
  - eslint-config-next: 14.2.x → 16.1.1 (command injection)

### Phase 2: Package Manager Standardization ✅
- **Before:** Mixed pnpm/npm
- **After:** npm-only across all infrastructure
- **Files changed:** 14 (ci.yml + 8 Dockerfiles + 5 package.json)
- **Benefits:** Single toolchain, simpler onboarding

### Phase 3: Docker Multi-Stage Optimization ✅
- **Templates created:** Dockerfile.template, .dockerignore.template
- **Expected size reduction:** 70% (1.2GB → 350MB)
- **.dockerignore applied:** 8 apps (immediate build speed improvement)

### Workflow Fixes ✅
- **YAML syntax:** Fixed anti-nuke.yml, gi-gate.yml (heredoc indentation)
- **Turbo invocation:** Changed `npm run turbo` → `npx turbo`
- **Git history:** Added `fetch-depth: 2` for turbo --filter=...[HEAD^]
- **Portal validation:** Fixed working directory for npm workspace

---

## 📚 Key Documentation Files

### EPICON & Governance
- `docs/epicon/` - EPICON specifications
- `docs/03-GOVERNANCE-AND-POLICY/governance/ROLES.md` - Role-based access
- `docs/03-GOVERNANCE-AND-POLICY/governance/ROLE_MAP.json` - Role configurations
- `docs/03-GOVERNANCE-AND-POLICY/foundation/` - Charter, bylaws, legal docs
- `docs/03-GOVERNANCE-AND-POLICY/civic/` - Civic covenants

### Audience-Specific Cathedrals (Research & Publications)
- `docs/07-RESEARCH-AND-PUBLICATIONS/for-academics/` - Research documentation
- `docs/07-RESEARCH-AND-PUBLICATIONS/for-economists/` - Economic model
- `docs/07-RESEARCH-AND-PUBLICATIONS/for-philosophers/` - Ethics & governance theory
- `docs/07-RESEARCH-AND-PUBLICATIONS/for-governments/` - Policy briefs, legislative text

### Architecture & Design
- `docs/04-TECHNICAL-ARCHITECTURE/` - System architecture
- `docs/04-TECHNICAL-ARCHITECTURE/BUNDLE_OPTIMIZATION.md` - Bundle optimization guide

### Operations
- `docs/06-OPERATIONS/drift-control/` - Drift test vectors
- `.github/workflows/` - CI/CD workflows
- `.github/WORKFLOW_ISSUES_REPORT.md` - Workflow analysis
- `.github/C180_OPTIMIZATION_SUMMARY.md` - C-180 summary

---

## 🛠️ Development Workflow

### 1. Before Starting Work
```bash
# Pull latest
git pull origin main

# Check MII status
cat STATE/VERDICT.txt

# Ensure catalog is fresh
npm run export:catalog
git diff catalog/mobius_catalog.json  # Should be empty
```

### 2. Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes...

# Test locally
npm run test
npm run lint
npm run type-check
```

### 3. Before Committing
```bash
# If docs changed: regenerate catalog
npm run export:catalog
git add catalog/mobius_catalog.json

# Check Anti-Nuke compliance (if deleting files)
# Max 5 deletions, 15% ratio

# Commit with descriptive message
git commit -m "feat: your feature description"
```

### 4. Creating PRs
- **Title:** Use conventional commits (feat:, fix:, docs:, chore:)
- **Description:** Include EPICON-02 intent if significant change
- **Checklist:** Use `.github/PR_TEMPLATE.md` format
- **CI:** All 20 workflows must pass
- **Consensus:** EPICON-03 for governance changes

---

## ⚠️ Common Pitfalls & Solutions

### Catalog Out of Date
```bash
# Error: "CATALOG IS OUT OF DATE"
# Fix:
npm run export:catalog
git add catalog/mobius_catalog.json
git commit --amend --no-edit
```

### Turbo Can't Find HEAD^
```bash
# Error: "fatal: ambiguous argument 'HEAD^'"
# Cause: Shallow git clone
# Fix: Workflows now use fetch-depth: 2
```

### npm run turbo: command not found
```bash
# Error: "Missing script: turbo"
# Wrong: npm run turbo run build
# Right: npx turbo run build
```

### Portal Build Fails
```bash
# Error: "No package-lock.json in apps/portal"
# Cause: npm workspaces install from root
# Fix: npm ci (from root), then build from workspace
```

---

## 🤖 Agent Ecosystem

### The Sentinel Council (C-284)
The five Sentinels that carry attestation authority for Vault v2 Seals
(see [Vault v2 protocol §5](docs/04-TECHNICAL-ARCHITECTURE/protocols/VAULT_V2_SEALED_RESERVE.md)):

- **ATLAS** — Strategic coherence. Flags single-agent concentration and
  low-diversity reasoning windows. Infrastructure automation is secondary.
- **ZEUS** — Verification authority. Holds **unilateral veto** on Seal mint.
  Verifies hash-chain integrity, deposit provenance, and MII math.
- **EVE** — Civic / ethical clearance. Owns narrative-overreach tripwires
  and duplication-decay enforcement.
- **JADE** — Constitutional framing. Validates Seal schema against protocol
  §4 and checks precedent consistency with prior Seals.
- **AUREA** — Synthesis and posture. Stamps each Seal with the substrate's
  posture at sealing time (confident / cautionary / stressed / degraded).
  AUREA never blocks — it weights Fountain emission downstream.

### Supporting Agents
- **HERMES** — Messenger / dispatch layer.
- **ECHO** — Canonical JSON export (see
  [`MULTI_SENTINEL_PROTOCOL.md`](docs/04-TECHNICAL-ARCHITECTURE/protocols/MULTI_SENTINEL_PROTOCOL.md)).
- **DAEDALUS** — Infrastructure oversight; raised on repeated Sentinel
  timeout during attestation windows.
- **URIEL / ZENITH** — Defined in `sentinels/uriel/`, `sentinels/zenith/`.
  Scope reserved for future cycles; not in the v2 attestation quorum.

### Agent Reporting Protocol
Every agent reports through three endpoints (heartbeat, journal/commit,
attestation). See
[`AGENT_REPORTING_PROTOCOL.md`](docs/04-TECHNICAL-ARCHITECTURE/protocols/AGENT_REPORTING_PROTOCOL.md).

### MCP Servers (Available)
- **mobius-repo-scanner:** Repository scanning MCP
- **atlas-mcp-server:** ATLAS agent MCP

---

## 🔗 External Resources

### CI/CD
- GitHub Actions workflows: `.github/workflows/`
- Workflow documentation: `.github/WORKFLOW_ISSUES_REPORT.md`

### Documentation
- Main docs: `DOCS.md` (master navigation)
- API specs: `docs/specs/`
- Schemas: `schemas/`

### Infrastructure
- Docker templates: `.docker/`
- MCP servers: `mcp/`
- Scripts: `scripts/`

---

## 💡 Pro Tips

1. **Always regenerate catalog** after adding/moving docs
2. **Use npx turbo**, not npm run turbo (no wrapper script)
3. **Install from root** (npm ci), build from workspaces
4. **Keep MII ≥ 0.95** - enforced by CI
5. **Max 5 file deletions** - Anti-Nuke protection
6. **EPICON-02 required** for significant changes
7. **Test locally** before pushing (saves CI time)
8. **Check workflows** in `.github/workflows/` for requirements

---

## 📞 Getting Help

- **Issues:** Check `.github/WORKFLOW_ISSUES_REPORT.md`
- **Architecture:** See `docs/04-TECHNICAL-ARCHITECTURE/`
- **Governance:** See `docs/03-GOVERNANCE-AND-POLICY/governance/ROLES.md`
- **Recent changes:** See `.github/C180_OPTIMIZATION_SUMMARY.md`

---

## 🔄 C-199 Root Cleanup Summary

The following folders were consolidated from root to `docs/`:
- `FOR-ACADEMICS/` → `docs/07-RESEARCH-AND-PUBLICATIONS/for-academics/`
- `FOR-ECONOMISTS/` → `docs/07-RESEARCH-AND-PUBLICATIONS/for-economists/`
- `FOR-PHILOSOPHERS/` → `docs/07-RESEARCH-AND-PUBLICATIONS/for-philosophers/`
- `FOR-GOVERNMENTS/` → `docs/07-RESEARCH-AND-PUBLICATIONS/for-governments/`
- `FOUNDATION/` → `docs/03-GOVERNANCE-AND-POLICY/foundation/`
- `GOVERNANCE/` → `docs/03-GOVERNANCE-AND-POLICY/governance/`
- `00-START-HERE/` → `docs/00-START-HERE/`
- `epicon/` → `docs/epicon/`
- `papers/` → `docs/07-RESEARCH-AND-PUBLICATIONS/papers/`
- `book/` → `docs/07-RESEARCH-AND-PUBLICATIONS/book/`
- `prompts/` → `docs/11-SUPPLEMENTARY/prompts/`
- `templates/` → `docs/11-SUPPLEMENTARY/templates/`
- `rfcs/` → `docs/11-SUPPLEMENTARY/rfcs/`
- `PUBLIC/` → `docs/public-assets/`
- `evaluations/` → `docs/07-RESEARCH-AND-PUBLICATIONS/evaluations/`
- `BUNDLE_OPTIMIZATION.md` → `docs/04-TECHNICAL-ARCHITECTURE/`
- `MIGRATION_C155.md` → `docs/10-ARCHIVES/root-files/`

---

## 🌀 The Substrate at C-284 (one-paragraph map)

The **Substrate** is the cold-truth archive — this monorepo. It holds canonical
protocol docs, every agent's journal history, the full catalog, and the
ledger. The **Terminal** (`mobius-civic-ai-terminal`) is the hot surface: live
KV state, per-cycle deposits, the Vault v2 Seal ceremony, the attestation
cron. The **Browser Shell** is the public civic entry point. **ATLAS-PAW**
is the operator's instrument panel — the cockpit view onto both live
Terminal state and Substrate archive. Data flow: agents write to Terminal
(live) → daily archive job mirrors attested Seals and journal entries to
this Substrate repo → public cathedral renders from catalog. The Vault v2
protocol (shipped C-284) converts the continuous 50-unit reserve into a
rhythm of discrete, Sentinel-attested Seals — *each one a witnessed moment
of the substrate seeing itself*.

---

*"We heal as we walk." — Mobius Substrate* 🌀

**Last Updated:** C-284 (2026-04-17)
**Maintained by:** AUREA Agent + ATLAS (C-284 sync)
