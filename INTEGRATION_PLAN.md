# Civic OS Repository Integration Plan

## Overview
This document outlines the plan to integrate all kaizencycle repositories into the Civic OS monorepo while maintaining their individual histories and functionality.

## Repository Integration Strategy

### 1. Lab Repositories (Proof Systems)
- **lab4-proof** → `labs/lab4-proof/`
- **lab6-proof** → `labs/lab6-proof/`
- **lab7-proof** → `labs/lab7-proof/`

### 2. Core Protocol & Libraries
- **Civic-Protocol-Core** → `packages/civic-protocol-core/`
- **OAA-API-Library** → `packages/oaa-api-library/`
- **civic-ai-specs** → `packages/civic-ai-specs/`

### 3. Integration Method
Using `git subtree` to preserve individual repository histories while integrating into the monorepo structure.

## Directory Structure After Integration

```
civic-os/
├── apps/                          # Existing applications
│   ├── hub-web/
│   ├── ledger-api/
│   ├── indexer-api/
│   ├── eomm-api/
│   ├── shield-api/
│   ├── broker-api/
│   ├── hive-app/
│   ├── cathedral-app/
│   ├── genesisdome-app/
│   └── api-gateway/
├── packages/                      # Shared packages
│   ├── civic-sdk/
│   ├── integrity-core/
│   ├── oaa-memory/
│   ├── ui-kit/
│   ├── shield-policies/
│   ├── atlas-sentinel/
│   ├── civic-protocol-core/      # ← NEW: From Civic-Protocol-Core
│   ├── oaa-api-library/          # ← NEW: From OAA-API-Library
│   └── civic-ai-specs/           # ← NEW: From civic-ai-specs
├── labs/                         # ← NEW: Lab proof systems
│   ├── lab4-proof/               # ← NEW: From lab4-proof
│   ├── lab6-proof/               # ← NEW: From lab6-proof
│   └── lab7-proof/               # ← NEW: From lab7-proof
├── sentinels/                    # Existing sentinels
├── configs/
├── infra/
└── docs/
```

## Integration Commands

### Step 1: Add Lab Repositories
```bash
# Lab4 Proof
git remote add lab4-proof https://github.com/kaizencycle/lab4-proof.git
git fetch lab4-proof
git subtree add --prefix=labs/lab4-proof lab4-proof main --squash

# Lab6 Proof  
git remote add lab6-proof https://github.com/kaizencycle/lab6-proof.git
git fetch lab6-proof
git subtree add --prefix=labs/lab6-proof lab6-proof main --squash

# Lab7 Proof
git remote add lab7-proof https://github.com/kaizencycle/lab7-proof.git
git fetch lab7-proof
git subtree add --prefix=labs/lab7-proof lab7-proof main --squash
```

### Step 2: Add Core Packages
```bash
# Civic Protocol Core
git remote add civic-protocol-core https://github.com/kaizencycle/Civic-Protocol-Core.git
git fetch civic-protocol-core
git subtree add --prefix=packages/civic-protocol-core civic-protocol-core main --squash

# OAA API Library
git remote add oaa-api-library https://github.com/kaizencycle/OAA-API-Library.git
git fetch oaa-api-library
git subtree add --prefix=packages/oaa-api-library oaa-api-library main --squash

# Civic AI Specs
git remote add civic-ai-specs https://github.com/kaizencycle/civic-ai-specs.git
git fetch civic-ai-specs
git subtree add --prefix=packages/civic-ai-specs civic-ai-specs main --squash
```

## Post-Integration Tasks

1. **Update package.json workspaces** to include new directories
2. **Update turbo.json** pipeline configuration
3. **Create individual README files** for each integrated repository
4. **Update main README.md** to reflect new structure
5. **Set up proper build/test scripts** for each integrated component
6. **Create cross-references** between related components

## Benefits of This Integration

1. **Unified Development**: All related projects in one place
2. **Shared Dependencies**: Common packages can be shared across projects
3. **Consistent Tooling**: Single build, test, and deployment pipeline
4. **Better Organization**: Clear separation between apps, packages, and labs
5. **Preserved History**: Each repository maintains its commit history
6. **Easy Maintenance**: Single repository to manage all Civic OS components

## Next Steps

1. Execute the integration commands
2. Update configuration files
3. Test all integrated components
4. Update documentation
5. Set up CI/CD for new components
