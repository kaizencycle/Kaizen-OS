# Phase 2 — Substrate Memory Contract

## Purpose

Substrate is the durable memory cortex of Mobius.

Terminal is the pulse. Substrate is memory. Civic Protocol Core is proof.

## Flow

```txt
KV HOT
  ↓
ECHO DIGEST
  ↓
MOBIUS AGENTS
  ↓
TERMINAL PULSE
  ↓
SUBSTRATE JOURNAL / MESH ARCHIVE
  ↓
CIVIC LEDGER PROOF
```

## Substrate Responsibilities

Substrate receives broad but valid memory:

```txt
AGENT_JOURNAL_V1
MESH_STATE_V1
MESH_HEALTH_V1
MESH_TODOS_V1
HIVE_WORLD_PULSE_V1
WORLD_UPDATE_V1
```

Substrate stores:

```txt
journals/{cycle}/{agent}.jsonl
ledger/mesh-aggregate.json
ledger/mesh-todos.json
ledger/mobius-pulse.json
```

Substrate forwards only proof-worthy events to Civic Ledger:

```txt
EPICON_ENTRY_V1
MIC_READINESS_V1
MIC_SEAL_V1
MESH_STATE_V1
WORLD_UPDATE_V1
```

## Retention

The Terminal should not become storage.

```txt
HOT window: Terminal/KV rolling memory
Substrate: append-valid durable memory
Civic Ledger: proof-worthy attestations
```

## Idempotency

Substrate memory packets should include:

```txt
node_id
event_type
cycle
source_hash
workflow_id
```

These fields prevent repeated workflow pulses from becoming duplicate memory.

## Canon

Substrate may remember noisy but valid agent journals.
Civic Ledger proves selectively.
Terminal remains the operator view.

We heal as we walk.
