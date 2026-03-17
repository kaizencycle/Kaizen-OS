---
epicon_id: EPICON_C-249_PRODUCT_civic-ai-terminal-scaffold_v1
title: "Mobius Civic AI Terminal — Scaffold and First Deploy"
author_name: "ATLAS Agent"
author_wallet: ""
cycle: "C-249"
epoch: ""
tier: "PRODUCT"
scope:
  domain: "product"
  system: "civic-ai-terminal"
  environment: "mainnet"
epicon_type: "milestone"
status: "active"
related_prs: []
related_commits: ["dfc33ba", "944bab9"]
related_epicons: ["EPICON_C-245_INFRA_cortex-bridge-heartbeat_v1"]
tags: ["terminal", "civic-bloomberg", "next-js", "vercel", "deploy", "product", "V1"]
integrity_index_baseline: 0.94
risk_level: "low"
created_at: "2026-03-13T07:46:00Z"
updated_at: "2026-03-13T18:00:00Z"
version: 1
hash_hint: ""
summary: "Scaffolded and deployed the Mobius Civic AI Terminal — a civic Bloomberg-style command interface with EPICON feed, Agent Cortex, GI Monitor, Tripwire Watch, Detail Inspector, and Command Palette"
---

# EPICON C-249: Mobius Civic AI Terminal — Scaffold and First Deploy

- **Layer:** PRODUCT > civic-ai-terminal
- **Author:** ATLAS Agent (+Michael Judan)
- **Date:** 2026-03-13
- **Status:** Active

---

## Intent Publication (EPICON-02 Compliance)

```intent
epicon_id: EPICON_C-249_PRODUCT_civic-ai-terminal-scaffold_v1
title: Mobius Civic AI Terminal — Scaffold and First Deploy
cycle: C-249
scope: product
mode: normal
issued_at: 2026-03-13T07:46:00Z
expires_at: 2026-09-13T07:46:00Z

justification:
  VALUES INVOKED: transparency, integrity, accountability
  REASONING: |
    The Mobius Substrate had infrastructure but no unified operational
    interface. The operator view was fragmented across Slack, the
    ATLAS-PAW dashboard, and direct repo inspection. A Bloomberg
    Terminal-style command center was needed — dense, real-time, auditable.
  ANCHORS:
    - Cortex bridge (C-245) provided the data layer without a UI consumer
    - Agent heartbeat data had no visual representation
    - EPICON ledger had no real-time feed surface
  BOUNDARIES:
    - New standalone repository (kaizencycle/mobius-civic-ai-terminal)
    - Does not modify core Substrate infrastructure
  COUNTERFACTUAL:
    - If mock data fallback masks live API failures, add explicit fallback indicator
    - If Vercel deploy causes rate limiting, move to dedicated hosting
```

---

## Context

The Mobius Substrate had infrastructure (ledger, agents, governance schemas, heartbeat monitoring) but no unified operational interface. The operator view was fragmented across Slack, the ATLAS-PAW dashboard, and direct repo inspection. A Bloomberg Terminal-style command center was needed — dense, real-time, auditable.

---

## Changes

### 1. New repository

**kaizencycle/mobius-civic-ai-terminal** — standalone Next.js frontend (repo: `github.com/kaizencycle/mobius-civic-ai-terminal`)

### 2. V1 terminal layout

- **Top status bar:** cycle, GI, alerts, agent heartbeats, tripwire state
- **Left sidebar:** chamber navigation (Pulse, Agents, Ledger, Markets, Geopolitics, Governance)
- **Center command canvas:** EPICON Feed, Agent Cortex, GI Monitor, Tripwire Watch, Command Palette
- **Right detail inspector:** source stack, confidence ladder, agent trace, operator notes

### 3. FastAPI backend scaffold

Six endpoints: `agents/status`, `epicon/feed`, `integrity/current`, `tripwires/active`, `system/health`, `stream/events` (SSE)

### 4. API transform layer

snake_case (Python) → camelCase (TypeScript) with envelope unwrapping and mock data fallback.

### 5. First Vercel deploy

Live at `mobius-civic-ai-terminal.vercel.app/terminal`

### Architecture

```
mobius-civic-ai-terminal (Next.js)
        ↓
Mock data fallback ←→ Live API (FastAPI)
        ↓
Vercel (frontend) + Render (backend, future)
```

---

## Impact

- First public-facing operational product in the Mobius ecosystem
- The design document ("Mobius Terminal") translated into a working, deployable interface in a single cycle
- Established the component architecture that subsequent cycles built upon
- Created the visual language (JetBrains Mono + IBM Plex Sans, Mobius color system) used across all terminal panels

---

## Integrity Notes

- **MII impact:** Positive — the terminal makes Mobius infrastructure visible and auditable
- **GI impact:** +0.02 — public deployment creates external accountability
- **Risk:** Low — frontend product, no changes to core infrastructure

---

*"We heal as we walk." — Mobius Substrate*
