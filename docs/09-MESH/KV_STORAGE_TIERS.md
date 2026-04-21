# KV Storage Tier Architecture

**Introduced:** C-286 (OAA bridge), C-287 (read resilience + optimization)
**Current as of:** C-288

## Overview

The Terminal operates across five storage tiers with different latency, durability,
and cost characteristics. The system routes reads and writes through this hierarchy
automatically, degrading gracefully when upper tiers are unavailable.

The guiding principle: **GI is never estimated.** Each tier returns a real recorded
value or falls through to the next tier. `source: unknown` with `gi: null` is the
honest answer when nothing is available.

---

## The five tiers

### Tier 1 — Upstash KV primary (hot)

| Property | Value |
|---|---|
| Latency | 5–25ms |
| Monthly limit | 500k requests (free tier) |
| Failure mode | Monthly ceiling |

**Role:** Hot state for all live reads. GI, heartbeat, signals, vault balance,
EPICON feed, agent journals, MII, tripwire state, cycle metadata.

**When it fails:** Terminal falls through to Tier 2 automatically via
`withFallback()` in the KV client. The snapshot-lite response shows
`degraded: true` and `gi_source` changes to a lower-tier value.

**Optimization (C-287):**
- `mget` bundling: 14 sequential reads → 1 round-trip per snapshot
- Tiered write cadence: critical keys write every run; operational every other;
  slow-changing hourly; MII gated on delta > 0.01
- Edge cache `s-maxage=15` on snapshot-lite endpoint

**KV keys (canonical):**

| Key | TTL | Cadence | Mirrored |
|---|---|---|---|
| `GI_STATE` | 720s | every sweep | yes |
| `HEARTBEAT` | 600s | every heartbeat | yes |
| `SIGNAL_SNAPSHOT` | 1200s | every sweep | yes |
| `VAULT_STATE` | 600s | every other run | yes |
| `CURRENT_CYCLE` | 86400s | hourly | yes |
| `SYSTEM_PULSE` | 1200s | every sweep | yes |
| `ECHO_STATE` | 600s | every other run | no |
| `TRIPWIRE_STATE` | 600s | every other run | no |
| `MIC_SUSTAIN_STATE` | 30d | on change | no |
| `MIC_REPLAY_PRESSURE` | 14d | on ingest | no |
| `MIC_READINESS_SNAPSHOT` | no-store | on demand | no |
| `epicon:feed` | TTL per entry | LPUSH/LTRIM 100 | no |
| `mii:feed` | TTL per entry | LPUSH/LTRIM 100 | no |

---

### Tier 2 — Backup Upstash Redis (hot mirror)

| Property | Value |
|---|---|
| Latency | 1–3ms |
| Monthly limit | Separate instance, separate quota |
| Failure mode | Cold-start on Render (backup checks cached 60s) |

**Role:** Automatic read fallback when Tier 1 is at its monthly ceiling or
otherwise unavailable. Enabled C-287 (`mirror_enabled: true`,
`read_fallback_enabled: true`).

**Mirror policy:** Only 6 continuity-critical keys mirror to backup Redis.
All other keys (MII, journal, EPICON, non-critical ops) do not mirror.
This reduces backup Redis writes from ~100% of writes to ~6 keys × write cadence.

**Mirrored keys:** `GI_STATE`, `HEARTBEAT`, `SIGNAL_SNAPSHOT`, `VAULT_STATE`,
`CURRENT_CYCLE`, `SYSTEM_PULSE`

**Health gate:** Backup Redis health is cached for 60 seconds between checks.
During known-unhealthy windows (Render cold-start), mirror writes skip
gracefully rather than queueing failed HTTP calls.

---

### Tier 3 — OAA-API-Library bridge (warm)

| Property | Value |
|---|---|
| Latency | ~200–500ms (Render cold-start: up to 10s) |
| Monthly limit | None (file-backed storage) |
| Failure mode | Render cold-start (free tier: spins down after 15 min idle) |

**Role:** Sovereign memory. When Tiers 1 and 2 are both unavailable, the
Terminal reads from OAA and shows `source: oaa-verified` with `verified: true`
in the snapshot response.

**Dual-write:** Every heartbeat cron fires a fire-and-forget write to OAA for
`GI_STATE`, `HEARTBEAT`, `SIGNAL_SNAPSHOT`, and `VAULT_STATE`. This means OAA
always has a recent copy of the most critical state.

**OAA Memory integration:** When `GI_STATE` is written to the OAA bridge, it
appends a note to `OAA_MEMORY.json`:
```
Terminal GI bridge: 0.74 (yellow) — KV fallback active
```
This means EVE's cycle tracking in OAA can see Terminal health during degraded
periods without polling the Terminal.

**Endpoint:** `POST /api/kv-bridge/write`, `GET /api/kv-bridge/read?key=KEY`
**Auth:** `Authorization: Bearer {KV_BRIDGE_SECRET}`

**Allowed write keys:** `GI_STATE`, `GI_STATE_CARRY`, `HEARTBEAT`,
`SIGNAL_SNAPSHOT`, `SYSTEM_PULSE`, `ECHO_STATE`, `CURRENT_CYCLE`,
`MIC_READINESS_SNAPSHOT`, `VAULT_STATE`, `VAULT_GLOBAL_META`, `TRIPWIRE_STATE`,
`TRIPWIRE_STATE_KV`, `LAST_INGEST`

---

### Tier 4 — Civic-Protocol-Core / PostgreSQL (durable)

| Property | Value |
|---|---|
| Latency | ~300–500ms |
| Monthly limit | None (PostgreSQL 18) |
| Failure mode | Render service failures (circuit breaker protects Terminal) |

**Role:** Permanent EPICON attestation storage. All EPICON entries that pass
ZEUS verification are committed to Postgres. The `mesh_entries` table receives
ingestion from all contributor-tier mesh nodes via `POST /mesh/ingest`.

**Tables:** `epicon_entries`, `mesh_entries`, `attestations`

**Circuit breaker:** `LEDGER_CIRCUIT_OPEN` KV key with 5-minute TTL. When the
Civic-Protocol-Core API times out (3s threshold), the circuit opens and the
Terminal stops sending requests for 5 minutes. This prevents cascading timeouts
from degrading the snapshot response time.

**Status (C-288):** Service experiencing intermittent Render deploy failures.
Circuit breaker is functioning correctly. Hot-lane EPICON data (from KV) remains
authoritative during outages.

---

### Tier 5 — GitHub ledger (cold, permanent)

| Property | Value |
|---|---|
| Latency | seconds |
| Monthly limit | None |
| Failure mode | Credential expiry (C-288 active issue: 401 on archive fetch) |

**Role:** Permanent, cryptographically-addressable archive. Every repo in the
MNS mesh commits its `ledger/feed.json` on merge. The Substrate hourly aggregator
pulls all node feeds into `ledger/mesh-aggregate.json`.

**Hash chain:** Each git commit SHA is the hash. Git history is the chain. Every
entry in `ledger/mesh-aggregate.json` carries `_mesh_node` and `_mesh_tier` fields
linking it back to its origin node.

**Format:** `ledger/mesh-aggregate.json` with schema `MNS_AGGREGATE_V1`

**C-288 issue:** The Terminal's archive journal fetch is returning `401 Bad
credentials`. The GitHub Actions token used for archive reads needs rotation.
Hot-lane journals (KV-backed) remain authoritative; archive merge is degraded.

---

## GI resolution chain (C-287)

When the Terminal resolves GI for display, it walks this chain in order:

```
1. KV GI_STATE (age < 10 min) ──────────── source: kv-live      · degraded: false
2. KV GI_STATE_CARRY (prev cycle) ─────── source: kv-carry     · degraded: true
3. OAA bridge GET /read?key=GI_STATE ───── source: oaa-verified · degraded: true  · verified: true
4. KV MIC_READINESS_SNAPSHOT ──────────── source: readiness-fallback · degraded: true
5. null ────────────────────────────────── source: unknown      · gi: null
```

The Terminal UI shows the source badge in the GI gauge:

| Source | Badge | Meaning |
|---|---|---|
| `kv-live` | LIVE | Fresh from KV, age < 10 min |
| `kv-carry` | CARRY | Previous cycle's value |
| `oaa-verified` | MEMORY | OAA bridge, cryptographically backed |
| `readiness-fallback` | CACHED | MIC readiness snapshot |
| `unknown` | — | Nothing available |

---

## Request budget (C-288)

Monthly KV request breakdown after C-287 optimizations:

| Source | Before | After | Method |
|---|---|---|---|
| Snapshot reads | ~1,400/day | ~100/day | mget + edge cache |
| Cron writes | ~8,352/day | ~2,392/day | tiered cadence |
| Mirror writes | ~8,352/day | ~1,728/day | selective (6 keys) |
| EPICON/journal | ~5,000/day | ~5,000/day | unchanged |
| **Total** | **~58k/day** | **~9.2k/day** | |
| **Monthly** | **~1.74M** | **~277k** | |
| **Free tier** | 500k | 500k | under budget |

---

## Related documents

- [MNS Protocol v1](MNS_PROTOCOL.md)
- [OAA sovereign memory](MNS_OAA_MEMORY.md)
- [MNS MCP Bridge](MNS_MCP_BRIDGE.md)
- [State of the Substrate C-288](../STATE_OF_THE_SUBSTRATE_C-288.md)
