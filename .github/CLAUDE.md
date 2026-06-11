# GitHub Workflows & CI/CD

**Active Workflows:** 20
**Status:** All YAML valid ✅
**Package Manager:** npm (standardized in C-180)
**Build Tool:** Turborepo

---

## 🔄 Active Workflows

### Core CI/CD
1. **ci.yml** - Unified CI (build, lint, test, portal validation, spec validation)
2. **catalog-check.yml** - Ensures catalog stays in sync
3. **drift-compliance.yml** - Validates drift control test vectors
4. **gi-gate.yml** - Enforces Global Integrity threshold (≥ 0.95)
5. **epicon03-consensus.yml** - Multi-agent consensus validation

### Security & Quality
6. **anti-nuke.yml** - Prevents mass file deletions (max 5 files, 15% ratio)
7. **security-audit.yml** - npm audit security scanning
8. **codeql.yml** - GitHub Advanced Security code scanning
9. **sigstore-attest.yml** - Build attestation with Sigstore

### Governance & Ops
10. **mobius-merge-gate.yml** - Merge gate: requires `consensus:approved` label AND a passing sentinel review run on head SHA (C-339, fail-closed)
11. **mobius-auto-consensus-label.yml** - Consensus label hygiene: removal-only since C-339 (never applies the approval label; that's sentinel-review's job)
12. **mobius-pr-assistant.yml** - PR assistance and validation
13. **mobius-operator-merge.yml** - Operator-triggered merges
14. **sentinel-review.yml** - AUREA + ATLAS AI review; fails closed when not requested or when API secrets are missing (C-339)
15. **canon-state-validate.yml** - Schema-validates cycle.json, ledger/mobius-pulse.json, and lints mobius.yaml (C-339)

### Monitoring & Reporting
14. **mobius-pulse-unified.yml** - Telemetry and pulse generation
15. **mobius-sync-unified.yml** - Synchronization tasks
16. **mobius-divergence-dashboard.yml** - Divergence tracking
17. **sentinel-heartbeat.yml** - Sentinel health monitoring

### Documentation & Publishing
18. **mkdocs-pages.yml** - MkDocs documentation build
19. **publish-sr.yml** - Publish strategic review
20. **guardian.yml** - Guardian ceremonial summons

---

## 📋 CI Workflow (ci.yml)

### Triggers
```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```

### Jobs

**1. Core Build & Test**
- Checkout with `fetch-depth: 2` (for turbo --filter=...[HEAD^])
- Install: `npm ci`
- Build: `npx turbo run build --filter=...[HEAD^]`
- Lint: `npx turbo run lint --filter=...[HEAD^]`
- Type-check: `npx turbo run type-check --filter=...[HEAD^]`
- Test: `npx turbo run test --filter=...[HEAD^]`

**2. Portal Validation**
- Conditional: Only if `apps/portal/` files changed
- Install from root: `npm ci`
- Type-check: `npx tsc --noEmit` (in apps/portal)
- Lint: `npm run lint` (in apps/portal)
- Build: `npm run build` (in apps/portal)

**3. Spec Validation**
- Conditional: Only if spec/schema files changed
- Validate JSON schemas with `ajv`
- Lint OpenAPI specs with `redocly`

**4. Integration Tests**
- Requires: PostgreSQL service
- Runs: `npx turbo run test:integration --filter=...[HEAD^]`

**5. CI Summary**
- Aggregates all job results
- Fails if any critical job fails

### Common Issues

**Turbo "HEAD^ unknown":**
- Cause: Shallow clone (fetch-depth: 1)
- Fix: Added `fetch-depth: 2` to checkout steps
- Commit: `448972b`

**"npm run turbo: command not found":**
- Wrong: `npm run turbo run build`
- Right: `npx turbo run build`
- Fix: Updated all turbo invocations
- Commit: `20e0cee`

---

## 🛡️ Anti-Nuke Workflow (anti-nuke.yml)

### Purpose
Prevents accidental mass deletion of files.

### Thresholds
```yaml
MAX_DELETES: 5
MAX_DELETE_RATIO: 0.15  # 15% of changed files
```

### Protected Paths
```
^(apps|packages|labs|sentinels|docs|infra|\.github)/
```

### How It Works
1. Count file deletions: `git diff --diff-filter=D`
2. Count total changes: `git diff --name-only`
3. Calculate ratio: `deletes / total`
4. Block if: `deletes > 5` OR `ratio > 0.15`

### YAML Fix Applied (C-180)
- **Issue:** Heredoc indentation error
- **Fix:** Added 10 spaces to Python code
- **Commit:** `58286e9`

---

## 🎯 GI Gate Workflow (gi-gate.yml)

### Purpose
Enforces Global Integrity baseline threshold.

### Configuration
```yaml
GI_BASELINE: ${{ vars.KAIZEN_GI_BASELINE || '0.993' }}
THRESHOLD: 0.95
```

### Validation
```python
if gi < 0.95:
    print(f"::error::GI baseline ({gi}) is below minimum threshold (0.95)")
    sys.exit(1)
```

### YAML Fix Applied (C-180)
- **Issue:** Heredoc indentation error
- **Fix:** Added 10 spaces to Python code
- **Commit:** `58286e9`

---

## 📊 Catalog Check Workflow (catalog-check.yml)

### Purpose
Ensures `catalog/mobius_catalog.json` stays in sync with documentation.

### Process
1. Checkout repository
2. Install: `npm ci --ignore-scripts`
3. Regenerate: `npm run export:catalog`
4. Compare: `git diff --quiet catalog/mobius_catalog.json`
5. Fail if: Catalog has drifted

### Auto-Fix
```bash
npm run export:catalog
git add catalog/mobius_catalog.json
git commit --amend --no-edit
```

### Tracked Stats
- EPICONs: 3
- Docs: 743
- Catalog version: 1.0.0

---

## 🔐 EPICON-03 Consensus (epicon03-consensus.yml)

### Purpose
Multi-agent consensus validation for significant changes.

### Agents
- ATLAS (Primary)
- AUREA (Secondary)
- EVE (Evaluator)
- HERMES (Messenger)
- JADE (Judge)

### Consensus Threshold
Variable by scope (ECS - EPICON Consensus Score)

### Triggers
```yaml
on:
  pull_request:
    types: [opened, synchronize, labeled]
    paths:
      - 'GOVERNANCE/**'
      - 'EPICON/**'
      - 'docs/03-GOVERNANCE-AND-POLICY/**'
```

---

## 🏃 Local Testing

### Before Pushing

**Simulate CI checks:**
```bash
# Install dependencies
npm ci

# Build all packages
npx turbo run build

# Run tests
npx turbo run test

# Lint and type-check
npx turbo run lint
npx turbo run type-check

# Regenerate catalog
npm run export:catalog
```

### Test Affected Packages Only
```bash
# Requires git history
git fetch origin main
npx turbo run build --filter=...[origin/main]
```

---

## 🐛 Debugging Workflow Failures

### View Logs
GitHub Actions → Failed workflow → Specific job → Expand steps

### Common Patterns

**"npm ci failed":**
```
Cause: package-lock.json out of sync
Fix: npm install && git add package-lock.json
```

**"Turbo can't find packages":**
```
Cause: Package name mismatch
Fix: Ensure package.json "name" field matches filter
```

**"Catalog out of date":**
```
Cause: Docs changed, catalog not regenerated
Fix: npm run export:catalog
```

**"GI baseline below threshold":**
```
Cause: GI variable < 0.95
Fix: Update KAIZEN_GI_BASELINE variable or improve integrity
```

---

## 📝 Adding New Workflows

### 1. Create Workflow File
```yaml
# .github/workflows/my-workflow.yml
name: My Workflow

on:
  pull_request:
  push:
    branches: [main]

jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install
        run: npm ci
      - name: Run task
        run: npm run my-task
```

### 2. Add Metadata Header
```yaml
# MOBIUS-CLASS: <class>
# OWNER: @<username>
# INTRODUCED: C-<cycle>
# LAST-REVIEWED: <date>
# STATUS: active | archived
# PURPOSE: <description>
```

### 3. Validate YAML
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/my-workflow.yml'))"
```

### 4. Test Locally (if possible)
```bash
# Install act (GitHub Actions local runner)
# https://github.com/nektos/act

act pull_request -j my-job
```

### 5. Document
Add to this file and `WORKFLOW_ISSUES_REPORT.md`

---

## 📚 Workflow Documentation

### Key Files
- **WORKFLOW_ISSUES_REPORT.md** - Analysis of all workflows, missing scripts
- **CI_FAILURES_FIXED.md** - C-180 CI failure analysis and fixes
- **C180_OPTIMIZATION_SUMMARY.md** - Complete C-180 optimization summary

### Archived Workflows
See `.github/workflows/archived/ARCHIVED.md`:
- monorepo.yml (redundant with ci.yml)
- opencode-ci.yml (unused external dependency)
- preview-autowire.yml (infrastructure-specific)
- uriel-smoke.yml (duplicate of sentinel-heartbeat.yml)

---

## 🔧 Best Practices

### 1. **Use npx for CLI tools**
```yaml
# ✅ Good
run: npx turbo run build

# ❌ Bad
run: npm run turbo run build  # Script doesn't exist
```

### 2. **Fetch git history for Turbo**
```yaml
# ✅ Good
- uses: actions/checkout@v4
  with:
    fetch-depth: 2  # For HEAD^ reference

# ❌ Bad
- uses: actions/checkout@v4  # Shallow clone, no HEAD^
```

### 3. **Install from root in monorepo**
```yaml
# ✅ Good
- run: npm ci  # Installs all workspaces

# ❌ Bad
- run: npm ci
  working-directory: apps/portal  # No package-lock.json there
```

### 4. **Cache npm properly**
```yaml
# ✅ Good
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Auto-detects package-lock.json

# ❌ Bad
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: 'apps/portal/package-lock.json'  # Doesn't exist
```

### 5. **Add metadata headers**
```yaml
# MOBIUS-CLASS: core-ci
# OWNER: @kaizencycle
# INTRODUCED: C-148
# LAST-REVIEWED: 2026-01-06
# STATUS: active
# PURPOSE: Core build, lint, test pipeline
```

---

## 🚨 Emergency Procedures

### Disable Failing Workflow
```yaml
# Temporarily disable by changing trigger
on:
  workflow_dispatch:  # Manual only
  # pull_request:  # Commented out
  # push:
```

### Force Merge (Emergency Only)
Requires `consensus:approved` label and admin override.
**Use sparingly** - bypasses safety checks.

### Rollback After Bad Merge
```bash
git revert <bad-commit-sha>
git push
# CI will re-run on revert commit
```

---

## 📞 Getting Help

- **Workflow failures:** Check `WORKFLOW_ISSUES_REPORT.md`
- **Missing scripts:** See "Missing Script Dependencies" section in report
- **YAML syntax:** Validate with `python3 -c "import yaml; yaml.safe_load(...)"`
- **CI debugging:** Check `.github/CI_FAILURES_FIXED.md`

---

*Part of Mobius Substrate CI/CD Infrastructure* 🌀
