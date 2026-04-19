#!/usr/bin/env node
/**
 * Refreshes mesh/mcp-discovery.json and .well-known/mcp.json from mesh/registry.json.
 * Attempts to read each live node's mobius.yaml from GitHub raw; Terminal gets a
 * default MCP entry until that repo declares mesh.mcp in YAML.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const REGISTRY = JSON.parse(fs.readFileSync(path.join(ROOT, 'mesh', 'registry.json'), 'utf8'))
const OUT = path.join(ROOT, 'mesh', 'mcp-discovery.json')
const WELL_KNOWN = path.join(ROOT, '.well-known', 'mcp.json')

const TERMINAL_TOOLS = [
  'get_integrity_snapshot',
  'get_epicon_feed',
  'get_vault_status',
  'get_agent_journal',
  'post_epicon_entry',
  'get_mic_readiness',
]

function parseRepo(repo) {
  const parts = String(repo || '').split('/')
  return parts.length >= 2 ? { owner: parts[0], name: parts[1] } : null
}

function extractMcpFromYaml(yaml) {
  if (!yaml || !/^\s*mcp\s*:/m.test(yaml)) return null
  const idx = yaml.search(/^\s*mcp\s*:/m)
  if (idx < 0) return null
  const block = yaml.slice(idx, idx + 8000)
  const enabled = /^\s*enabled\s*:\s*true\s*$/m.test(block)
  const serverUrl = block.match(/^\s*server_url\s*:\s*["']?([^"'\n]+)["']?\s*$/m)
  const transport = block.match(/^\s*transport\s*:\s*["']?([^"'\n]+)["']?\s*$/m)
  const gi = block.match(/require_gi_above\s*:\s*([\d.]+)/)
  if (!enabled || !serverUrl) return null
  return {
    server_url: serverUrl[1].trim(),
    transport: (transport && transport[1].trim()) || 'streamable-http',
    integrity_gate: gi ? Number(gi[1]) : 0,
  }
}

async function fetchMobiusYaml(repo) {
  const p = parseRepo(repo)
  if (!p) return null
  const url = `https://raw.githubusercontent.com/${p.owner}/${p.name}/main/mobius.yaml`
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'mobius-mcp-discovery/1.0' } })
    if (!r.ok) return null
    return await r.text()
  } catch {
    return null
  }
}

function cursorKey(nodeId) {
  return nodeId === 'mobius-civic-ai-terminal' ? 'mobius-terminal' : String(nodeId).replace(/[^a-z0-9-]/gi, '-')
}

const servers = []

for (const node of REGISTRY.nodes || []) {
  if (node.live === false) continue

  const yaml = await fetchMobiusYaml(node.repo)
  const declared = yaml ? extractMcpFromYaml(yaml) : null

  if (node.node_id === 'mobius-civic-ai-terminal') {
    const url = declared?.server_url || 'https://mobius-civic-ai-terminal.vercel.app/api/mcp'
    const transport = declared?.transport || 'streamable-http'
    const gate = typeof declared?.integrity_gate === 'number' ? declared.integrity_gate : 0.5
    servers.push({
      node_id: 'mobius-civic-ai-terminal',
      server_url: url,
      transport,
      tier: node.tier,
      covenant: Array.isArray(node.covenant) ? node.covenant[0] : node.covenant,
      integrity_gate: gate,
      tools: [...TERMINAL_TOOLS],
      description: node.description,
      cursor_config: { mcpServers: { 'mobius-terminal': { url } } },
    })
    continue
  }

  if (declared) {
    servers.push({
      node_id: node.node_id,
      server_url: declared.server_url,
      transport: declared.transport,
      tier: node.tier,
      covenant: Array.isArray(node.covenant) ? node.covenant[0] : node.covenant,
      integrity_gate: declared.integrity_gate,
      tools: [],
      description: node.description,
      cursor_config: {
        mcpServers: { [cursorKey(node.node_id)]: { url: declared.server_url } },
      },
    })
  }
}

const cursorServers = {}
for (const s of servers) {
  const key = cursorKey(s.node_id)
  cursorServers[key] = { url: s.server_url }
}

const doc = {
  schema: 'MNS_MCP_DISCOVERY_V1',
  description:
    'Mobius Neural Substrate — MCP server index. Nodes declare mesh.mcp in mobius.yaml; Terminal is listed by default until its repo YAML is extended.',
  updated_at: new Date().toISOString(),
  servers,
  cursor_config_all: { mcpServers: cursorServers },
  usage:
    'Merge cursor_config_all into your MCP client. Runtime: implement app/api/mcp/route.ts in mobius-civic-ai-terminal (see docs/09-MESH/MNS_MCP_BRIDGE.md).',
}

fs.writeFileSync(OUT, JSON.stringify(doc, null, 2))

const wellKnown = {
  schema_version: '1.0',
  mesh: 'kaizencycle/Mobius-Substrate',
  protocol: 'MNS-v1',
  mcp_index: 'https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/mesh/mcp-discovery.json',
  integrity_doctrine: 'https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/docs/09-MESH/MNS_PROTOCOL.md',
  mcp_bridge_doctrine: 'https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/docs/09-MESH/MNS_MCP_BRIDGE.md',
  servers: servers.map((s) => ({
    node_id: s.node_id,
    url: s.server_url,
    transport: s.transport,
  })),
  note:
    'Mesh MCP discovery. Enforcement is per-node; this file is the canonical discovery surface for the Substrate.',
}

fs.mkdirSync(path.dirname(WELL_KNOWN), { recursive: true })
fs.writeFileSync(WELL_KNOWN, JSON.stringify(wellKnown, null, 2))

console.log('mesh/mcp-discovery.json servers:', servers.length)
console.log('.well-known/mcp.json written')
