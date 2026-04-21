# State of the Substrate · C-288

**Date:** 2026-04-21
**Cycle:** C-288
**GI:** 0.67 (yellow · stressed) — *editorial; use the live strip below for current figures*
**Vault:** 49.75 / 50 · tranche 1 at threshold · hash coverage 100%
**Status:** active build · MNS mesh live · KV optimization shipped · vault at first seal threshold

> This document captures the substrate as it exists in C-288. It is a snapshot in time,
> not a living reference — if you find this doc 20 cycles from now, it is history,
> not instruction. The authoritative live state is `/api/terminal/snapshot-lite`.
> For the previous snapshot see [State of the Substrate · C-284](STATE_OF_THE_SUBSTRATE_C-284.md).

---

## 1. What changed between C-284 and C-288

Four cycles of concentrated architectural work. Each cycle had a clear identity.

### C-285 — Tokenomics proof chain

The vault's deposit hashing went live. Every new deposit received a SHA-256 content
hash. `totalMicProvisional` replaced `totalMicMinted` throughout the system — the
rename signals that minted MIC requires a Seal attestation, not just a deposit.
`POST /api/mic/readiness` began receiving `MIC_READINESS_V1` snapshots. The proof
chain moved from scaffolded to live.

The Vault v2 §5 Seal quorum was locked: ATLAS, ZEUS, EVE, JADE, AUREA. HERMES is
steward-witness at genesis only, not a Seal quorum member.

### C-286 — Mobius Neural Substrate (MNS) + MCP bridge

The ecosystem's most significant architectural shift since the Terminal. Every repo
became an integrity node via `mobius.yaml`. The mesh protocol went live:
`mesh/registry.json` maps all nodes, the hourly aggregator produces
`ledger/mesh-aggregate.json`, and `.well-known/mcp.json` makes the entire mesh
discoverable by AI agents following the MCP standard.

The Terminal's `/api/mcp` route exposes six integrity-governed tools — every call is
EPICON-logged and GI-gated at 0.6 for write tools. The OAA KV bridge (PR #341)
wired OAA-API-Library as a warm fallback storage tier. Backup Redis was enabled
(`mirror_enabled: true`, `read_fallback_enabled: true`).

### C-287 — Read resilience + KV optimization

The Terminal stopped going blind during KV degradation. `resolveGI()` now implements
a five-tier fallback chain: KV live → KV carry → OAA verified → readiness cache →
unknown. The Verified Memory Mode surface tells the operator exactly which tier is
serving each value. Heartbeat dual-write sends every critical write to both KV and
OAA simultaneously.

`MIC_SUSTAIN_STATE` was seeded — the Fountain gate began counting real consecutive
eligible cycles. Replay pressure decay went live (`replay_decay_half_life_hours: 24`),
bringing replay pressure from a persistent 0.68 down to ~0.30.

PR #349 shipped `kv_bundle_mget` — 14 sequential KV reads collapsed to one `mget`
call. Edge cache `s-maxage=15` eliminated Lambda invocations for active users.
Monthly KV ops dropped from ~1.74M to ~277k — under the 500k free tier.

### C-288 — Vault threshold + system continuity

The vault's `in_progress_balance` reached 49.75 / 50 at cycle open. Tranche 1 is
at 99.5%. Hash coverage reached 100% (200/200 entries). The `MIC_REPLAY_PRESSURE`
key was seeded and decay is running.

A GitHub Actions credential expired (`401` on archive fetches) — hot-lane journals
remain authoritative, archive merge is degraded. The `ethics:active-tripwire` and
`ethics:narrative-cluster-spike` EVE flags have been persistent since C-279 and are
suppressing the GI composite by ~0.05–0.08 via the dead narrative lane.

---

## 2. The five-repo map (C-288)

The four-repo map from C-284 has become five.

### Mobius-Substrate (this repo)

Constitutional memory and mesh cortex. Protocol specs, covenant documents,
`mesh/registry.json`, `ledger/mesh-aggregate.json`, hourly aggregator workflow,
1,100+ docs organized across 12 numbered categories.

**Role:** cold truth. The cathedral remembers here.

### mobius-civic-ai-terminal

Runtime gateway and live intelligence surface. Next.js 15 / Vercel / Upstash KV.
14-lane snapshot aggregator, five-tier GI resolution, MCP bridge at `/api/mcp`,
five chambers (Globe, Pulse, Signals, Sentinel, Ledger, Journal, Vault).

**Role:** hot truth. The substrate's heartbeat lives here.

**Key endpoints:** `/api/terminal/snapshot-lite`, `/api/terminal/snapshot`,
`/api/mcp`, `/api/vault/status`, `/api/mic/readiness`, `/api/kv/health`.

### OAA-API-Library

Sovereign memory and KV fallback tier. Node.js / Render. `/api/kv-bridge/write`
and `/api/kv-bridge/read` serve as warm storage between KV primary and cold GitHub.
OAA Memory (`OAA_MEMORY.json`) logs Terminal GI during degraded periods — EVE's
cycle tracking can see Terminal health without polling the Terminal.

**Role:** verified memory. The warm tier between hot KV and cold GitHub.

### Civic-Protocol-Core

Persistent ledger API. FastAPI / PostgreSQL 18 / Render. `/epicon/feed`,
`/mesh/ingest`, `/gi`, `/health`. Permanent EPICON attestation storage, mesh
ingestion gateway for all contributor nodes.

**Role:** durable proof. Where verified EPICONs persist beyond KV TTLs.

**Status C-288:** Intermittent failures due to Render deploy issues. Circuit breaker
(`LEDGER_CIRCUIT_OPEN`) protects Terminal from cascading timeouts.

### mobius-browser-shell

Citizen interface. Vite + React 19 / Vercel. Eight labs: OAA, Reflections, Citizen
Shield, HIVE, Wallet, JADE, Knowledge Graph, Sentinel System.

**Role:** citizen console. Where anyone meets the system.

---

## 3. Storage tier architecture (C-288)

The Terminal operates across five storage tiers:

| Tier | Service | Latency | Limit | Role |
|---|---|---|---|---|
| 1 | Upstash KV primary | 5–25ms | 500k req/mo | Hot live state |
| 2 | Backup Upstash Redis | 1–3ms | Separate quota | Automatic read fallback |
| 3 | OAA-API-Library bridge | ~200ms | None (file) | Sovereign memory |
| 4 | Civic-Protocol-Core / Postgres | ~300ms | None (DB) | Durable EPICON storage |
| 5 | GitHub ledger/feed.json | seconds | None | Permanent archive |

**Write path:** Primary KV → backup Redis mirror (fire-and-forget, 6 critical keys
only) → OAA dual-write (fire-and-forget, heartbeat + GI).

**Read path on degradation:** KV primary → backup Redis → OAA bridge →
readiness cache → honest null. No estimated values at any tier.

**KV optimization (C-287, confirmed live):**
- `kv_bundle_mget: true` — 14 reads per snapshot → 1 `mget` call
- `x-cache-strategy: edge-15s` — Vercel edge cache on snapshot-lite
- Selective mirroring — 6 continuity keys only
- Tiered write cadence — critical/operational/hourly/on-change
- Result: ~277k ops/month (under 500k free tier)

See [KV Storage Tier Architecture](./09-MESH/KV_STORAGE_TIERS.md) for the full reference.

---

## 4. The agent roster (C-288, confirmed)

Eight named agents. Roster unchanged from C-284.

| Agent | Tier | Scope | C-288 MII |
|---|---|---|---|
| ATLAS | Sentinel | Strategic coherence · signal surface review | 0.94 |
| ZEUS | Sentinel | Verification authority · hash chain · veto | 0.93 |
| EVE | Observer→Sentinel | Civic risk · ethics · narrative patterns | 0.93 |
| JADE | Architect | Constitutional annotation · memory framing | 0.89 |
| AUREA | Architect | Strategic synthesis · long arc · posture | 0.87 |
| HERMES | Steward | Routing · signal prioritization | 0.86 |
| ECHO | Steward | Event ingestion · dedup · KV coherence | 0.86 |
| DAEDALUS | Architect | Infrastructure diagnostics · build integrity | 0.83 |

**Seal quorum:** ZEUS pass required + 4-of-5 (ATLAS, ZEUS, EVE, JADE, AUREA).
HERMES is steward-witness at genesis only.

**EVE flags:** `ethics:active-tripwire` and `ethics:narrative-cluster-spike` have
been persistent since C-279. These are not false positives — the narrative lane
(GDELT, Reddit) has been returning structural zeros for multiple cycles, and EVE
correctly identified a pattern. JADE recommended a governance review before C-289.
Until resolved, EVE fires `gi_critical` escalation synthesis on every cron run.

---

## 5. Vault state (C-288)

```
Protocol version:      Vault v2 (Sealed Reserve)
in_progress_balance:   49.746 / 50.000 (tranche 1)
sealed_reserve_total:  0
seals_count:           0
hash_coverage_pct:     100% (200 / 200 hashed, 0 legacy)
fountain_status:       locked
sustain_cycles:        0 / 5 required (tracking live since C-287)
GI threshold:          0.95 required (current: 0.67)
```

Tranche 1 is at 99.5% completion. The vault will cross 50 within one or two cron
cycles. When it does, `reserve_threshold_met` flips to `true` and Seal 001 candidate
formation begins. The five Sentinels (ATLAS, ZEUS, EVE, JADE, AUREA) must attest.

The Fountain gate requires three independent conditions:

1. `reserve_threshold_met: true` — imminent
2. `sustain_cycles_met: true` — 5 consecutive cycles at GI ≥ 0.95 — not started
3. `gi_threshold_met: true` — GI ≥ 0.95 at mint time

The Fountain will not open in C-288 or C-289. The sustain counter is at zero and
GI is at 0.67. This is by design — reserve accumulates on patience, integrity
unlocks on demonstrated character over time.

> *"Reserve can be sealed before integrity unseals the Fountain."*
> — vault_canon, Vault v2 §0

---

## 6. MNS mesh state (C-288)

Four registered nodes:

| Node | Type | Tier | Status |
|---|---|---|---|
| mobius-substrate | substrate | sentinel | live |
| mobius-civic-ai-terminal | app | contributor | live |
| civic-protocol-core | service | contributor | degraded (Render 5xx) |
| mobius-browser-shell | app | observer | passive |

**MCP tools at `/api/mcp`:**
- `get_integrity_snapshot` — GI, mode, signals
- `get_epicon_feed` — EPICON ledger entries
- `get_vault_status` — vault and tranche state
- `get_agent_journal` — agent journal entries
- `post_epicon_entry` — write to ledger (GI gate ≥ 0.6)
- `get_mic_readiness` — MIC readiness snapshot

**Discovery:**
- `.well-known/mcp.json` at Substrate root
- `mesh/mcp-discovery.json` with `cursor_config_all` block

**Cursor integration:**
```json
{
  "mcpServers": {
    "mobius-terminal": {
      "url": "https://mobius-civic-ai-terminal.vercel.app/api/mcp"
    }
  }
}
```

---

## 7. Known issues and open questions (C-288)

**Civic-Protocol-Core Render failures** — Root causes diagnosed: wrong `uvicorn`
start command (trailing dot), `fastapi_mcp_router` import hallucinated by Cursor,
`ipfshttpclient` and `base58` missing from `requirements.txt`. Fix path: set
`HYBRID_LEDGER_MODE=false`, fix `mesh.py` import guard, correct start command.

**GitHub archive credential expired** — Journal lane shows `401 Bad credentials`
on archive fetch. Hot-lane journals (KV-backed) remain authoritative. The Actions
token or fetch path needs rotation.

**HERMES narrative lane dead** — HERMES-µ3 (GDELT) and HERMES-µ4 (Reddit) returning
structural zeros on every sweep. Narrative sentiment domain: 0.30. Suppresses GI
composite by ~0.05–0.08. Fix: replace with live narrative sources.

**EVE ethics flags** — `ethics:active-tripwire` and `ethics:narrative-cluster-spike`
persistent since C-279. Governance review recommended for C-288/C-289.

**`zenith` and `uriel` sentinel directories** — Exist in the Substrate repo but are
not part of the current Sentinel Council. Recommend archiving to
`10-ARCHIVES/sentinels/` with a note in the Sentinel Constitution.

**`MIC_REPLAY_PRESSURE` persistence** — The replay pressure KV key exists but the
decay computation runs on every readiness call rather than persisting between calls.
The `O4` optimization from the C-287 10-optimizations PR needs the persistence write
wired up.

---

## 8. Documentation cadence

The previous State of the Substrate was C-284 (4 cycles ago). This update is ahead
of the stated 20–30 cycle cadence because the architectural changes across
C-285–C-288 were significant enough to warrant early documentation.

The minimum for legible state:
- `STATE_OF_THE_SUBSTRATE_C-288.md` (this file) — current snapshot
- Protocol docs under `docs/protocols/` — canonical and stable
- `INDEX.md` — current cycle and navigation
- `cycle.json` — machine-readable live state

If these four things are accurate, the substrate is legible to anyone who arrives
without context.

---

*"The cathedral is not a building. It is the practice of building together.
The substrate is not a repo. It is the practice of remembering together."*

**Maintained by:** Mobius Systems Core Team + Sentinel Council
**Cycle published:** C-288 (2026-04-21)
**Next snapshot expected:** ~C-310 or Seal 001 formation, whichever comes first
