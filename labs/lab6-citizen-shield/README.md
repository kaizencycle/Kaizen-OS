# Lab 6 — Citizen Shield

Purpose: Security, privacy, DID identity, and network defense.

Spec: See `docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md` (Lab 6 section).

## Components

### Gatekeeper Service
**Location**: `services/gatekeeper/`

Security gatekeeper for agent tool calls. Enforces:
- DID signature verification
- GI (Global Integrity) floor checks (≥ 0.95)
- DelibProof consensus for high-risk actions
- Sandboxed execution
- RBAC (Role-Based Access Control)
- Injection detection
- Immutable attestations to Civic Ledger

See `services/gatekeeper/README.md` for details.

### DelibProof Consensus
**Location**: `shared/delibproof/`

Multi-agent consensus validation library for requiring sentinel approval on high-risk actions.

See `shared/delibproof/README.md` for details.

### Incident Response
**Location**: `docs/runbooks/incident_response_citizen_shield.md`

Comprehensive incident response playbook for model/browser injection attacks and security incidents.

## Existing Components

Where to look in this repo:
- `apps/shield-api` — Shield services and UI
- `packages/shield-policies` — Policy modules
- `sentinels/` — Sentinel configs (atlas, jade, zeus, etc.)
- `packages/civic-protocol-core/frontend/citizen-shield-app` — Reference UI

Modules (suggested under this lab or respective apps):
- identity/
- network-defense/
- companion-system/
- encryption/

## Status

Core code exists and integrates with Guardian. Gatekeeper service added October 31, 2025.
