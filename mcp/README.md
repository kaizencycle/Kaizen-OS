# Mobius MCP Servers

> The integrity infrastructure for agentic AI — memory with teeth.

## Overview

This directory contains MCP (Model Context Protocol) servers that provide integrity, accountability, and safety infrastructure for AI agent systems. These servers are designed to work with any MCP-compliant AI agent, including Claude, ChatGPT, Gemini, Copilot, and others.

**Core Principle:** As AI agents gain autonomy, accountability infrastructure must scale with capability.

## Servers

| Server | Purpose | Status |
|--------|---------|--------|
| [epicon-mcp-server](./epicon-mcp-server/) | Intent declaration and audit trail | ✅ Active |
| [zeus-mcp-server](./zeus-mcp-server/) | Threshold monitoring and circuit-breaking | ✅ Active |
| [mobius-repo-scanner](./mobius-repo-scanner/) | Repository scanning and analysis | ✅ Active |

### EPICON MCP Server

**Purpose:** Intent declaration and audit trail for agent actions.

EPICON (Explicit Purpose and Intent for Code Operations Network) requires agents to declare intent before consequential actions, creating an immutable audit trail that connects decisions to outcomes.

**Key Tools:**
- `epicon_declare_intent` — Declare intent before action
- `epicon_execute_with_intent` — Execute action with valid intent token
- `epicon_validate_intent` — Check if intent token is valid
- `epicon_audit_query` — Query the audit trail
- `epicon_revoke_intent` — Cancel a declared intent
- `epicon_get_integrity_status` — System health and statistics

### ZEUS MCP Server

**Purpose:** Threshold monitoring and circuit-breaking for agent systems.

ZEUS (Zero-tolerance Escalation and Uncertainty Surveillance) monitors system integrity, detects pre-instability patterns, and can halt agent actions when critical thresholds are crossed.

**Key Tools:**
- `zeus_check_status` — Check current system status
- `zeus_request_permission` — Request permission for an action
- `zeus_report_outcome` — Report action outcome
- `zeus_get_circuit_status` — Get circuit breaker status
- `zeus_trigger_circuit` — Manually control circuit breakers
- `zeus_register_threshold` — Register monitoring thresholds
- `zeus_report_metric` — Report metrics for threshold evaluation
- `zeus_set_status` — Manually set system status (admin)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Agents                                 │
│         Claude / ChatGPT / Gemini / Copilot / etc.              │
└─────────────────────┬───────────────────────────────────────────┘
                      │ MCP Protocol (Universal Standard)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Mobius Integrity Layer                         │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   EPICON Server      │    │    ZEUS Server       │          │
│  │   (Intent & Audit)   │◄──►│  (Threshold & Circuit)│          │
│  └──────────────────────┘    └──────────────────────┘          │
│                      │                │                          │
│                      ▼                ▼                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │              Mobius Integrity Index (MII)         │          │
│  │              (System Health Metrics)              │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Protected Systems                             │
│              Git / Deploy / Database / APIs                      │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm

### Install All Servers
```bash
# From mcp/ directory
cd epicon-mcp-server && npm install && npm run build && cd ..
cd zeus-mcp-server && npm install && npm run build && cd ..
cd mobius-repo-scanner && npm install && npm run build && cd ..
```

## Running

### stdio Transport (Local)
```bash
# EPICON
node epicon-mcp-server/dist/index.js

# ZEUS
node zeus-mcp-server/dist/index.js
```

### HTTP Transport (Remote)
```bash
# EPICON
TRANSPORT=http PORT=3100 node epicon-mcp-server/dist/index.js

# ZEUS
TRANSPORT=http PORT=3101 node zeus-mcp-server/dist/index.js
```

## Integrated Workflow

The recommended workflow combines EPICON and ZEUS for comprehensive accountability:

```typescript
async function performAction(action: Action) {
  // 1. Check ZEUS status
  const status = await mcp.call("zeus_check_status", {
    context: { agent_id: "my-agent", action_type: action.type }
  });
  
  if (!status.permissions.can_proceed) {
    throw new Error(`ZEUS: ${status.message}`);
  }
  
  // 2. Declare intent with EPICON
  const intent = await mcp.call("epicon_declare_intent", {
    action_type: action.type,
    description: action.description,
    rationale: action.rationale,
    scope: { files: action.files, estimated_impact: action.impact },
    risks_acknowledged: action.risks
  });
  
  if (intent.status !== "approved") {
    throw new Error(`Intent not approved: ${intent.status}`);
  }
  
  // 3. Request ZEUS permission (links to intent)
  const permission = await mcp.call("zeus_request_permission", {
    agent_id: "my-agent",
    action: {
      type: action.type,
      description: action.description,
      scope: action.scope,
      estimated_impact: action.impact,
      reversible: !!action.rollback
    },
    context: { intent_token: intent.intent_token }
  });
  
  if (!permission.granted) {
    throw new Error(`Permission denied: ${permission.denial_reason}`);
  }
  
  // 4. Execute with EPICON
  const result = await mcp.call("epicon_execute_with_intent", {
    intent_token: intent.intent_token,
    action_payload: action.payload,
    execution_context: {
      agent_id: "my-agent",
      session_id: session.id,
      timestamp: new Date().toISOString()
    }
  });
  
  // 5. Report outcome to ZEUS
  await mcp.call("zeus_report_outcome", {
    permission_token: permission.permission_token,
    outcome: {
      status: result.status,
      details: result.result.details
    }
  });
  
  return result;
}
```

## Philosophy

### The Three Covenants

1. **Integrity** — Power must leave traces; decisions must be auditable
2. **Ecology** — Systems must be sustainable; externalities must be accounted
3. **Custodianship** — Technology serves humans; capability requires responsibility

### Why This Matters

As AI agents become more capable:
- **Without EPICON:** Actions happen without recorded intent, making accountability forensic rather than proactive
- **Without ZEUS:** Systems continue operating even when integrity is compromised, amplifying harm

These are not restrictions on agent capability—they are *infrastructure* that makes agent capability trustworthy.

## Relationship to Mobius Systems

These MCP servers are part of the broader [Mobius Systems](https://github.com/kaizencycle/Mobius-Substrate) project, which includes:

- **Mobius Integrity Index (MII)** — Measuring institutional accountability
- **Mobius Browser Shell** — Citizen-facing interface
- **Mobius Substrate** — Multi-agent governance infrastructure
- **Global Integrity Credits (GIC/MIC)** — Integrity-backed economics

## License

CC0 1.0 Universal — Public Domain Dedication

These tools are released into the public domain to ensure they remain civic infrastructure, not proprietary control mechanisms.

---

*Mobius Systems — Memory with teeth.*

*"We heal as we walk."*
