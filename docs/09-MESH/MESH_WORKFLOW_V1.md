# Mobius Mesh Workflow v1 — C-287 HIVE bridge (C-288 loop)

## Core idea

**`mobius.yaml`** is the declaration contract for every repo. **GitHub Actions** (schedule + `workflow_dispatch`) are the execution fabric. **Substrate** aggregates truth. **mobius-hive** and **mobius-browser-shell** render world and player-facing state.

```text
mobius.yaml  →  declares identity / feeds / jobs / governance
GitHub Actions + cron  →  run declared jobs
Substrate  →  mesh-aggregate + mobius-pulse
Browser shell / HIVE  →  render world state
```

## Substrate outputs (this repo)

| Artifact | Producer | Consumers |
|----------|----------|-----------|
| `ledger/mesh-aggregate.json` | `scripts/mesh-aggregate.mjs` | Pulse, doctrine, Terminal |
| `ledger/mobius-pulse.json` | `scripts/build-mobius-pulse.mjs` | **HIVE**, browser-shell, agents |
| `ledger/network-mii.json` | `scripts/compute-network-mii.mjs` | Pulse, analytics |

`mobius-pulse.json` is **read-only** for downstream repos: it rolls up `cycle.json`, aggregate stats, optional live Terminal `snapshot-lite`, and network MII.

## `mobius.yaml` extensions (v1)

Cross-repo nodes may declare:

### `ingest.sources` (read-only inputs)

For **world** / **client** nodes (e.g. mobius-hive), declare URLs to pull state **without** mutating upstreams:

```yaml
ingest:
  enabled: true
  mode: "client_of_other_node"
  sources:
    terminal_snapshot:
      node_id: "mobius-terminal"
      read_url: "https://mobius-civic-ai-terminal.vercel.app/api/terminal/snapshot-lite"
    pulse:
      node_id: "mobius-substrate"
      read_url: "https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/ledger/mobius-pulse.json"
```

### `jobs` (execution fabric)

Documented only in YAML — **implement** matching files under `.github/workflows/` in each repo.

```yaml
jobs:
  enabled: true
  workflows:
    - id: "world-update"
      file: ".github/workflows/world-update.yml"
      trigger: "schedule"
      cron: "*/15 * * * *"
```

Substrate’s root `mobius.yaml` lists the aggregate job (`mesh-aggregate.yml`).

### `governance` (agent PR safety)

```yaml
governance:
  agent_prs_allowed: true
  auto_merge_allowed: false
  required_reviewers:
    - "ZEUS"
    - "ATLAS"
```

**Rule:** agents may open PRs and generate world files; they **must not** auto-merge or change MIC mint rules without human + Sentinel review.

## First HIVE auto-quest loop (target)

**Inputs:** Terminal snapshot, `mobius-pulse.json`, cycle state, optional OAA latest-by-key reads.

**Outputs (in mobius-hive repo):** e.g. `world/current-cycle.json`, `world/events/*.json`, `world/quests/*.json`, `world/sentinels/*.json`.

**Rendered in mobius-browser-shell:** cycle, active event/quest, Sentinel copy, vault / integrity.

Implementation of **world-update.yml** and **quest-proposal.yml** belongs in **mobius-hive**, not Substrate.

## Rollout order (recommended)

1. Substrate: `mobius-pulse.json` + pulse builder in existing mesh workflow (this PR).  
2. mobius-hive: `mobius.yaml` + `world-update.yml` reading pulse + snapshot.  
3. mobius-browser-shell: fetch pulse + world JSON.  
4. OAA / Terminal / Civic: keep dual-write and proof paths per C-286.

---

*One-line truth:* **`mobius.yaml` says what each repo is; Actions say when it acts.**

*We heal as we walk.*
