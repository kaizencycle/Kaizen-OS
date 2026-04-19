# MNS — OAA sovereign memory layer (C-286)

## Stack roles

| Layer | Responsibility |
|-------|----------------|
| **KV (e.g. Upstash)** | Hot runtime state — fast reads, operator truth *right now* |
| **OAA-API-Library** | Sovereign **append** journal — signed structured writes, deterministic hashes, optional async proof to ledger |
| **Civic Protocol Core** | Durable ledger — mesh ingest, seals, verification |
| **Mobius-Substrate** | Doctrine, `mobius.yaml` v1 routing canon, mesh registry, pulse aggregation |
| **Terminal** | Operator UI + **writer/orchestrator** — reads KV, posts to OAA, may mirror proofs to Civic Core |

**C-286 recommendation:** do **not** rip out KV on day one. Use **dual-write**: keep KV hot; add OAA as the append journal; Civic Core remains the durable seal target.

## Write path (target)

```text
KV / runtime state (hot)
  → Terminal writer / orchestrator
  → POST OAA /api/oaa/kv (HMAC-signed payload)
  → OAA append-only memory + SHA-256 over canonical bytes
  → async POST proof → Civic Protocol Core (/mesh/ingest or dedicated route)
  → optional GitHub / feed mirror
  → Substrate pulse aggregation
```

`mobius.yaml` **declares** `hot_state`, `sovereign_memory`, and `durable_ledger` (see `MOBIUS_YAML_V1.md`); it does **not** execute writes.

## Payload type

- **`OAA_MEMORY_ENTRY_V1`** — OAA-origin journal record (hash-chained); Civic Core should accept it alongside existing MIC / pulse types once implemented there.

## Rules

1. **Append-only** in OAA memory — no in-place mutation of historical entries.  
2. **Canonical JSON** (sorted keys, stable separators) before hashing.  
3. **HMAC** (or equivalent) on every write to OAA from trusted writers.  
4. **Async ledger bridge** — OAA (or Terminal) must not block hot paths on Civic Core latency.  
5. **Config-driven URLs** — Terminal reads targets from its own `mobius.yaml`, not hardcoded strings in code.

---

*See also:* [`MOBIUS_YAML_V1.md`](./MOBIUS_YAML_V1.md), [`MNS_PROTOCOL.md`](./MNS_PROTOCOL.md).

*We heal as we walk.*
