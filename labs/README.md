# Labs Directory

This directory contains the Lab proof systems that form the core components of Civic OS.

## Lab Repositories

### Lab4 Proof (`lab4-proof/`)
- **Purpose**: E.O.M.M. Reflections API and Civic Ledger integration
- **Technology**: Python, FastAPI
- **Function**: Handles reflection cycles, command ledger operations, and E.O.M.M. (Echo of Memory Management) processes
- **Integration**: Provides the reflection and memory management layer for Civic OS

### Lab6 Proof (`lab6-proof/`)
- **Purpose**: Citizen Shield application
- **Technology**: React, TypeScript, Vite
- **Function**: Frontend interface for citizen security and policy management
- **Integration**: Provides the citizen-facing security interface

### Lab7 Proof (`lab7-proof/`)
- **Purpose**: OAA Hub and Civic OS shell/init system
- **Technology**: Python, FastAPI
- **Function**: Acts as the central hub for Open Agent Architecture, parsing human intent and coordinating system operations
- **Integration**: Serves as the main shell/init system for Civic OS

## Development

Each lab can be developed independently while maintaining integration with the broader Civic OS ecosystem. Use the monorepo scripts to manage development:

```bash
# Start all labs in development mode
npm run dev --workspace=labs/*

# Start specific lab
npm run dev --workspace=@civic/lab4-proof

# Build all labs
npm run build --workspace=labs/*

# Test all labs
npm run test --workspace=labs/*
```

## Integration Notes

- All labs maintain their original git history through git subtree integration
- Each lab has its own package.json for dependency management
- Labs can reference shared packages from the `packages/` directory
- Common configuration is managed at the monorepo level
