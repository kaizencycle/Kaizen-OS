# mobius.yaml — Node Declaration Specification

**mobius.yaml v1 (pulse + ingest + policy):** see [`docs/09-MESH/MOBIUS_YAML_V1.md`](../docs/09-MESH/MOBIUS_YAML_V1.md) (canonical lanes, payload vocabulary, ingest modes, rules). This page retains **MNS mesh** fields (`node_type`, `covenant`, nested `mesh.mcp` tools) for backward compatibility and richer MCP manifests.

Every repository joining the **Mobius Neural Substrate (MNS)** drops a `mobius.yaml` at its root. It declares identity, mesh participation, optional legacy ledger hooks, and optionally an **MCP bridge** so the node becomes a discoverable, integrity-governed MCP server for AI clients.

Canonical registry: `mesh/registry.json` in Mobius-Substrate.

---

## Minimal (observer tier)

```yaml
mesh:
  node_id: "my-lab-name"
  node_type: "lab"
  substrate_ref: "kaizencycle/Mobius-Substrate"
  tier: "observer"
  covenant: "integrity"
```

---

## Full (contributor / sentinel tier)

```yaml
mesh:
  node_id: "lab-epicon-guard"
  node_type: "lab" # substrate | app | service | lab | framework
  substrate_ref: "kaizencycle/Mobius-Substrate"
  version: "1.0.0"
  tier: "contributor" # observer | contributor | sentinel
  covenant: "integrity" # integrity | ecology | custodianship | all
  agent_affinity:
    - ZEUS
    - JADE
  ledger:
    enabled: true
    backend: "github-actions" # github-actions | upstash | render | none
    feed_url: "https://raw.githubusercontent.com/kaizencycle/lab-epicon-guard/main/ledger/feed.json"
    push_to_substrate: true
    push_endpoint: "https://civic-protocol-core-ledger.onrender.com/mesh/ingest"
  mii:
    track: true
    baseline: 0.8
  epicon:
    intent_blocks_required: true
    push_on_merge: true
  mic:
    participate: false
    reward_type: "MIC_REWARD_V2"

  # ── MCP BRIDGE (optional) ────────────────────────────────────────────────
  # When enabled, this node is listed in mesh/mcp-discovery.json and .well-known/mcp.json
  mcp:
    enabled: true
    server_url: "https://mobius-civic-ai-terminal.vercel.app/api/mcp"
    transport: "streamable-http" # streamable-http | sse | stdio
    schema_version: "MCP-2025-03-26"
    integrity:
      require_gi_above: 0.5
      log_all_invocations: true
      invocation_agent: "HERMES"
      verification_agent: "ZEUS"
      mic_reward_on_invocation: false
    tools:
      - name: "get_integrity_snapshot"
        description: "Returns current Global Integrity state, GI score, mode, and active signals"
        endpoint: "/api/terminal/snapshot-lite"
        method: "GET"
        auth: "none"
        epicon_tag: "tool:integrity-read"
      - name: "get_epicon_feed"
        description: "Returns recent EPICON ledger entries"
        endpoint: "/api/epicon/feed"
        method: "GET"
        auth: "none"
        epicon_tag: "tool:ledger-read"
      - name: "get_vault_status"
        description: "Returns MIC vault state — reserve, Seal status"
        endpoint: "/api/vault/status"
        method: "GET"
        auth: "none"
        epicon_tag: "tool:vault-read"
      - name: "get_agent_journal"
        description: "Returns recent agent journal entries"
        endpoint: "/api/journal/feed"
        method: "GET"
        auth: "none"
        epicon_tag: "tool:journal-read"
      - name: "post_epicon_entry"
        description: "Submit a new EPICON intent entry to the civic ledger"
        endpoint: "/api/echo/ingest"
        method: "POST"
        auth: "bearer"
        auth_env: "AGENT_SERVICE_TOKEN"
        epicon_tag: "tool:ledger-write"
        requires_gi_above: 0.6
      - name: "get_mic_readiness"
        description: "Returns MIC readiness — GI, reserve, quorum, fountain"
        endpoint: "/api/mic/readiness"
        method: "GET"
        auth: "none"
        epicon_tag: "tool:mic-read"
```

---

## Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `mesh.node_id` | yes | Globally unique, kebab-case. Matches an entry in `mesh/registry.json`. |
| `mesh.node_type` | yes | One of: `substrate`, `app`, `service`, `lab`, `framework` |
| `mesh.substrate_ref` | yes | Points at `kaizencycle/Mobius-Substrate` |
| `mesh.tier` | yes | `observer`, `contributor`, or `sentinel` |
| `mesh.covenant` | yes | Which of the Three Covenants this node primarily serves |
| `mesh.agent_affinity` | no | Agents with governance interest in this node |
| `mesh.ledger.feed_url` | yes if tier ≥ contributor | Public URL to this node's `ledger/feed.json` |
| `mesh.ledger.push_to_substrate` | no | If true, automation may POST merges to an ingest endpoint |
| `mesh.mii.baseline` | no | Expected minimum MII for this node's work |
| `mesh.epicon.intent_blocks_required` | no | If true, CI may require EPICON intent on PRs |
| `mesh.mic.participate` | no | If true, node opts into MIC reward accounting (policy TBD) |

### MCP bridge (`mesh.mcp`)

| Field | Required | Description |
|-------|----------|-------------|
| `mesh.mcp.enabled` | yes (if block present) | If `true`, this node exposes an MCP server and should appear in `mesh/mcp-discovery.json` |
| `mesh.mcp.server_url` | yes when enabled | HTTPS URL of the MCP HTTP endpoint (e.g. `/api/mcp`) |
| `mesh.mcp.transport` | yes | `streamable-http` (default), `sse`, or `stdio` |
| `mesh.mcp.schema_version` | no | MCP protocol label; default `MCP-2025-03-26` |
| `mesh.mcp.integrity.require_gi_above` | no | Minimum GI to allow tool calls; `0` means no gate |
| `mesh.mcp.integrity.log_all_invocations` | yes | If `true`, runtime should record each invocation to the civic ledger / EPICON feed |
| `mesh.mcp.integrity.invocation_agent` | no | Agent that classifies invocations (e.g. HERMES) |
| `mesh.mcp.integrity.verification_agent` | no | Agent that verifies chains (e.g. ZEUS) |
| `mesh.mcp.integrity.mic_reward_on_invocation` | no | If `true`, verified invocations may emit MIC reward candidates (when live) |
| `mesh.mcp.tools[].name` | per tool | Tool name (`snake_case`) |
| `mesh.mcp.tools[].description` | per tool | Human- and agent-readable purpose |
| `mesh.mcp.tools[].endpoint` | per tool | Path relative to the node's public origin |
| `mesh.mcp.tools[].method` | per tool | HTTP method |
| `mesh.mcp.tools[].auth` | per tool | `none`, `bearer`, or `api-key` |
| `mesh.mcp.tools[].auth_env` | if auth ≠ none | Env var holding the secret on the server |
| `mesh.mcp.tools[].epicon_tag` | per tool | Tag written with ledger entries for this tool |
| `mesh.mcp.tools[].requires_gi_above` | no | Per-tool GI gate (overrides node-level `require_gi_above` when stricter) |

---

### Layered ingest (`ingest.mode: write_through`)

For **operator** nodes (e.g. Terminal), declare **hot state**, **sovereign OAA memory**, and **durable ledger** targets so writers read config instead of hardcoding URLs. Fields are documented in [`docs/09-MESH/MOBIUS_YAML_V1.md`](../docs/09-MESH/MOBIUS_YAML_V1.md) and narrative in [`docs/09-MESH/MNS_OAA_MEMORY.md`](../docs/09-MESH/MNS_OAA_MEMORY.md).

Typical shape:

```yaml
ingest:
  enabled: true
  mode: "write_through"
  hot_state:
    type: "upstash_kv"
  sovereign_memory:
    node_id: "oaa-api-library"
    write_url: "https://<oaa>/api/oaa/kv"
    auth: "hmac"
  durable_ledger:
    node_id: "civic-protocol-core"
    write_url: "https://<civic-core>/mesh/ingest"
    auth: "bearer"
```

---

## Joining the mesh

1. Add `mobius.yaml` to your repo root.
2. Create `ledger/feed.json` (can be `[]` initially).
3. Open a PR to `kaizencycle/Mobius-Substrate` adding your node to `mesh/registry.json`.
4. Optional: copy `mesh/mesh-sync-template.yml` to `.github/workflows/mesh-sync.yml` in your repo.
5. Optional MCP: add `mesh.mcp` as above; implement the HTTP MCP route in your app (see `docs/09-MESH/MNS_MCP_BRIDGE.md`); open a PR to refresh `mesh/mcp-discovery.json` or rely on the hourly Substrate workflow to regenerate discovery from live `mobius.yaml` files.

One registry PR completes public discovery; optional workflows handle push-on-merge.

**Discovery:** `https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/mesh/mcp-discovery.json` and `https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/.well-known/mcp.json` (updated by `scripts/mesh-mcp-discovery.mjs` in CI).
