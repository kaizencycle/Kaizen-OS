# Integrated Packages

This directory contains packages that have been integrated from external repositories into the Civic OS monorepo.

## Integrated Packages

### Civic Protocol Core (`civic-protocol-core/`)
- **Source**: [Civic-Protocol-Core](https://github.com/kaizencycle/Civic-Protocol-Core)
- **Purpose**: Core blockchain and governance protocols for Civic OS
- **Technology**: Python, JavaScript
- **Function**: Provides the foundational blockchain infrastructure, consensus mechanisms, and governance tools
- **Integration**: Serves as the core protocol layer for all Civic OS operations

### OAA API Library (`oaa-api-library/`)
- **Source**: [OAA-API-Library](https://github.com/kaizencycle/OAA-API-Library)
- **Purpose**: Comprehensive library for Open Agent Architecture
- **Technology**: TypeScript, Next.js, React
- **Function**: Provides APIs, components, and utilities for agent-based systems
- **Integration**: Powers the agent coordination and API layer of Civic OS

### Civic AI Specs (`civic-ai-specs/`)
- **Source**: [civic-ai-specs](https://github.com/kaizencycle/civic-ai-specs)
- **Purpose**: Open specifications for ethical, verifiable, and geocivic AI systems
- **Technology**: TypeScript, JSON schemas
- **Function**: Defines standards and specifications for AI systems within Civic OS
- **Integration**: Provides the specification framework for all AI components

## Development

These packages are now part of the Civic OS monorepo and can be developed alongside other packages:

```bash
# Start all packages in development mode
npm run dev --workspace=packages/*

# Start specific package
npm run dev --workspace=@civic/oaa-api-library

# Build all packages
npm run build --workspace=packages/*

# Test all packages
npm run test --workspace=packages/*
```

## Integration Benefits

- **Shared Dependencies**: Common dependencies can be shared across packages
- **Consistent Tooling**: Single build, test, and deployment pipeline
- **Cross-Package References**: Packages can easily reference each other
- **Unified Development**: All related code in one repository
- **Preserved History**: Original git history maintained through git subtree

## Package Relationships

- **Civic Protocol Core** provides the foundation for all other packages
- **OAA API Library** builds on the protocol core to provide agent coordination
- **Civic AI Specs** defines the standards that all AI components must follow
- All packages work together to form the complete Civic OS ecosystem
