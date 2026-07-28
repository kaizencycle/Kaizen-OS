# C-386 — Agent memory / KV drift control

**Status:** HANDOFF / IMPLEMENTATION REVIEW  
**Cycle:** C-386  
**Primary agents:** ATLAS × ZEUS  
**Human authority:** Michael Judan  

## Executable chambers (paste-ready)

| Chamber | Document |
|---------|----------|
| ATLAS implementation | [CHAMBER_ATLAS.md](./CHAMBER_ATLAS.md) |
| ZEUS adversarial | [CHAMBER_ZEUS.md](./CHAMBER_ZEUS.md) |
| Full handoff + ratified amendments | [HANDOFF_C-386_ATLAS_ZEUS_agent-memory-kv-drift_v1.md](./HANDOFF_C-386_ATLAS_ZEUS_agent-memory-kv-drift_v1.md) |

## Implementation anchor (ATLAS A-002)

| Artifact | Path |
|----------|------|
| Reference library | `packages/agent-memory-governance/` |
| JSON Schema | `schemas/agent_memory_record_v1.schema.json` |
| TTL / quorum policy | `configs/c386-agent-memory-policy.yaml` |
| Tests (§16 minimum set) | `packages/agent-memory-governance/tests/c386-memory-governance.test.ts` |

Run tests:

```bash
npm run build --workspace=@mobius/agent-memory-governance
npm test --workspace=@mobius/agent-memory-governance
```

## Seal language

> Quorum is evidentiary independence, not agent headcount.  
> Persistence may preserve a claim. Only independent evidence may strengthen it.  
> KV exists to make reasoning faster. It must never make reality unnecessary.

**C-386 does not seal** until ATLAS + ZEUS reports and human merge gate (§23).
