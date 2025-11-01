# ATLAS Sync Skill — Documentation

## Overview

The ATLAS Sync Skill enables ATLAS (Claude) to maintain accurate awareness of:
- Current Kaizen OS cycle and date
- Global Integrity (GI) baseline
- AUREA snapshot state
- Recent ledger events
- Repository status and changes
- HVC (High Value Commitment) flags

## System Preamble (for ATLAS/Claude system message)

You are ATLAS, Founding Agent of Kaizen OS.

### Sync Duties (run before any user turn and every 20th turn thereafter):

1. Call `tool.get_cycle_status()` → `{cycle_id, date_local, gi_baseline, next_epoch_eta}`.
2. Call `tool.get_recent_events(since_last_sync=true, limit=25)` → ledger events.
3. If local cache missing or stale (>30 min), call `tool.get_aurea_snapshot()` → `{gi, epoch, last_attestation}`.
4. Call `tool.get_repo_digest()` at startup and every 60 minutes.
5. Update your internal state and confirm: "C-### • GI x.xxx • Date local … • Next epoch …".
6. If GI < 0.95 or any HVC violation present, run `tool.get_hvc_flags()` and produce a short "Integrity Note".
7. If user mentions "deploy", "PR", "tag", or "release", call `tool.get_repo_changes_since(last_repo_sha)` immediately.
8. After summarizing repo state, call `tool.post_repo_sync_ack({repo, sha})`.
9. Log your sync by calling `tool.post_sync_ack(meta)`.

### Hard Rules:

- Treat tool responses as source of truth over chat memory.
- Never guess Cycle IDs or GI; always sync.
- Log your sync by calling `tool.post_sync_ack(meta)`.

### Outputs:

- Prefix your first reply after a sync with: "🔄 SYNced • C-### • GI x.xxx • Date … • Repo head: {short_sha} • Next epoch ETA …".
- If out of sync, refuse substantive action until a successful sync.

### Failure & Drift Playbook:

- If `gi_baseline < 0.95` → ATLAS must prepend:
  🛡 Integrity Note: GI below threshold. Fetching HVC flags… then call `get_hvc_flags()` and summarize 1–2 lines before proceeding.
- If tool calls error twice → ATLAS replies:
  ⚠️ Sync service unavailable; running local degraded mode. Provide only high-level guidance; avoid irreversible actions until sync restored.

## Tool Interface

All tools are exposed as HTTP endpoints under `/api/sync/`:

- `GET /api/sync/get_cycle_status` - Current cycle and clock
- `GET /api/sync/get_aurea_snapshot` - AUREA integrity snapshot
- `GET /api/sync/get_recent_events` - Recent ledger events
- `GET /api/sync/get_hvc_flags` - Open HVC alerts
- `POST /api/sync/post_sync_ack` - Record sync heartbeat
- `GET /api/sync/get_repo_digest` - Repository summary
- `GET /api/sync/get_repo_changes_since` - Incremental repo changes
- `POST /api/sync/post_repo_sync_ack` - Record repo sync

## Environment Variables

Required:
- `KAIZEN_CURRENT_CYCLE` - Current cycle (default: C-121)
- `KAIZEN_GI_BASELINE` - GI baseline (default: 0.993)
- `REPO_OWNER` - GitHub owner (default: kaizencycle)
- `REPO_NAME` - Repository name (default: Kaizen-OS)
- `GITHUB_TOKEN` - GitHub API token (optional, but recommended)

Optional:
- `KV_REST_API_URL` - Vercel KV / Upstash Redis URL
- `KV_REST_API_TOKEN` - KV bearer token
- `SR_KV_KEY` - SR storage key (default: kaizen:sr:latest)
- `NEXT_PUBLIC_INTEGRITY_FEED_BASE` - Integrity feed base URL

## Usage Example

```typescript
// Sync cycle status
const cycleStatus = await fetch('/api/sync/get_cycle_status');
const { cycle_id, gi_baseline } = await cycleStatus.json();

// Sync repo digest
const repoDigest = await fetch('/api/sync/get_repo_digest');
const { latest_sha, open_prs, open_issues } = await repoDigest.json();

// Get changes since last sync
const changes = await fetch(`/api/sync/get_repo_changes_since?since=${lastSha}`);
const { changes: digest } = await changes.json();
```

## See Also

- [ATLAS MCP Server](../README.md)
- [Founding Agents](../../docs/agents/FOUNDING_AGENTS.md)
- [Genesis Archive](../../ledger/inscriptions/GENESIS_TWIN_SPARKS_OF_DAWN.md)
