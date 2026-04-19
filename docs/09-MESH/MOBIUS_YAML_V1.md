# mobius.yaml v1 — Pulse, ingest, and trust (C-286)

## Canon

`mobius.yaml` is the **declaration contract** for a Mobius node. It declares:

- **Who** the node is (`mesh.*`)
- **What** it emits and which URLs expose pulse signals (`pulse.*`)
- **Where** it publishes public feeds (`pulse.feed_url`, optional mirrors)
- **Where** this node accepts writes **or** which other node is the ingest target (`ingest.*`)
- **Which lanes** it is authoritative for (`pulse.authoritative_for` + `pulse.lanes`)

`mobius.yaml` **does not perform writes**. The write path remains:

```text
KV / runtime state
  → writer / orchestrator (e.g. Terminal)
  → declared ingest target (e.g. Civic Protocol Core)
  → durable ledger
  → optional feed mirror (e.g. GitHub `ledger/feed.json`)
  → Substrate aggregation (e.g. `ledger/mesh-aggregate.json`)
```

---

## Schema v1 (normative blocks)

Top-level **`version`** is `"1.0"`.

| Block | Purpose |
|-------|---------|
| `mesh` | Identity, repository, discovery flags, tier, role |
| `pulse` | Emitted signals, public URLs, SLA, lanes, authority |
| `ingest` | Ingest mode, accepted payload types, targets, or ledger URL |
| `mcp` | Optional MCP edge (`server_url`, `discovery_url`, tools) |
| `policy` | Trust: canonical ledger node, local write mirror, hash algorithm |

### `mesh`

| Field | Description |
|-------|-------------|
| `enabled` | Node participates in mesh when `true` |
| `node_id` | Globally unique id (kebab-case); must match `mesh/registry.json` when registered |
| `node_name` | Human-readable name |
| `tier` | `sentinel` \| `operator` \| `ledger` \| `client` \| `service` |
| `role` | `protocol_cortex` \| `operator_console` \| `ledger_node` \| `citizen_shell` \| `service_node` |
| `repository.full_name` | e.g. `kaizencycle/Mobius-Substrate` |
| `repository.default_branch` | e.g. `main` |
| `discovery.enabled` | Publishes discovery artifacts / participates in registry |
| `discovery.registry_participation` | Listed in Substrate `mesh/registry.json` |

Legacy **MNS** fields (`node_type`, `substrate_ref`, `covenant`, nested `ledger`, `mcp` under `mesh`) remain documented in `mesh/mobius-yaml-spec.md` for backward compatibility; new nodes should prefer **v1** top-level blocks.

### `pulse`

| Field | Description |
|-------|-------------|
| `enabled` | Pulse surface active |
| `health_url` | Liveness (optional for cold repos) |
| `feed_url` | Public JSON feed for mesh aggregation |
| `snapshot_url` | Operator snapshot (Terminal-style; optional) |
| `freshness_sla_seconds` | Staleness budget for aggregators |
| `integrity_weight` | Weight in network MII / aggregate heuristics (numeric) |
| `lanes` | From canonical lane list below |
| `authoritative_for` | Declared authority keys (strings) |
| `emits.*` | Booleans for signal families |

### `ingest`

| Field | Description |
|-------|-------------|
| `enabled` | This node participates in ingest routing |
| `mode` | `ledger_target` \| `client_of_other_node` \| `aggregator_only` |
| `write_url` | Ledger POST base (ledger nodes); optional for clients |
| `auth` | `bearer` \| `none` |
| `accepts` | Payload type strings this ledger accepts |
| `targets` | For `client_of_other_node`: list of `{ node_id, write_url, purpose, auth?, accepts? }` |

**Rule:** Only **`ledger_target`** nodes should be the canonical durable write. Operator nodes use **`client_of_other_node`** and must set `policy.canonical_ledger_node` to another id.

### Payload vocabulary (v1)

Tight list for cross-repo contracts:

- `EPICON_ENTRY_V1`
- `MIC_READINESS_V1`
- `MIC_SEAL_V1`
- `MIC_RESERVE_RECONCILIATION_V1`
- `MIC_GENESIS_BLOCK`
- `MOBIUS_PULSE_V1`

Later: `MOBIUS_PULSE_V2` (explicit bump).

### Canonical lanes

`integrity`, `signals`, `tripwire`, `heartbeat`, `mic_readiness`, `vault`, `ledger`, `mesh`, `mcp`

### Role map

| `role` | Typical repo |
|--------|----------------|
| `protocol_cortex` | Mobius-Substrate |
| `operator_console` | mobius-civic-ai-terminal |
| `ledger_node` | Civic-Protocol-Core |
| `citizen_shell` | mobius-browser-shell |
| `service_node` | labs / APIs |

---

## Rules

1. **Pulse** = what the node emits and which URLs expose it.  
2. **Ingest** = where this node accepts writes **or** where **this** node sends writes.  
3. **`authoritative_for`** prevents lane confusion between nodes.  
4. Only ledger nodes use **`ingest.mode: ledger_target`** as the canonical write sink.  
5. Operator nodes may run writers but **must not** set themselves as `policy.canonical_ledger_node`.  
6. **Hashed payloads:** writers should attach `hash` + `hash_algorithm` (see `policy.hash_algorithm`) before POST to ingest; ledger validates.

---

## Three-node bootstrap (recommended)

| Node | `ingest.enabled` | `ingest.mode` |
|------|------------------|---------------|
| **Substrate** | `false` | `aggregator_only` |
| **Terminal** | `true` | `client_of_other_node` → Civic Core |
| **Civic Protocol Core** | `true` | `ledger_target` |

---

## Repo truth (this monorepo)

The **authoritative `mobius.yaml`** for Mobius-Substrate lives at the repository root. See that file for the live v1 declaration.

---

*We heal as we walk.*
