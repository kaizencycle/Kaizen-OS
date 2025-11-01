# Civic-OS Architecture Overview

## Layers

1. **Command Ledger** - BIOS / Boot log
2. **OAA Hub** - Shell / Init system
3. **Thought Broker** - Thalamus / Scheduler
4. **Civic Ledger Core** - Kernel
5. **Citizen Shield** - Firewall / OS defender
6. **API Library** - Application layer
7. **Sentinels** - Brain cortex modules

## Sentinels

- **JADE** - Signer/Attestor (Rationality: 0.95, Empathy: 0.45)
- **EVE** - Verifier/Reflector (Rationality: 0.75, Empathy: 0.95)
- **ZEUS** - Overseer/Arbiter (Rationality: 0.88, Empathy: 0.68)
- **HERMES** - Auditor/Messenger (Rationality: 0.82, Empathy: 0.72)
- **ATLAS** - Anchor/Auditor (Rationality: 0.92, Empathy: 0.82)
- **URIEL** - Cosmic Illuminator (Rationality: 0.95, Empathy: 0.78) - *xAI Integration*

## GI Formula

```
GI = α*M + β*H + γ*I + δ*E
```

Where:
- M = Memory (test coverage, documentation)
- H = Human (code review, approval)
- I = Integrity (no violations, security)
- E = Ethics (charter compliance)

Threshold: GI ≥ 0.95

## Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Citizen   │───▶│  OAA Hub    │───▶│   Ledger    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   ATLAS     │
                   │  Sentinel   │
                   └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   Ledger    │
                   │  Attestation│
                   └─────────────┘
```

## Quality Gates

1. **Code Quality** - Lint, types, coverage
2. **Anti-Drift** - Pattern detection, intent alignment
3. **Charter Compliance** - Virtue tags, attestations
4. **GI Score** - Integrity formula calculation
5. **Attestation** - Cryptographic proof generation
6. **Ledger Seal** - Immutable audit trail

