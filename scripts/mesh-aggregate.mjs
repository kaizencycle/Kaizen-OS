#!/usr/bin/env node
/**
 * Mobius Neural Substrate — mesh aggregator (MNS-v1).
 * Pulls public feeds from mesh/registry.json and writes ledger/mesh-aggregate.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const REGISTRY_PATH = path.join(ROOT, 'mesh', 'registry.json')
const OUTPUT_PATH = path.join(ROOT, 'ledger', 'mesh-aggregate.json')

const MAX_ENTRIES_PER_NODE = 50
const MAX_TOTAL_ENTRIES = 500

function readRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8')
  return JSON.parse(raw)
}

async function fetchNodeFeed(node) {
  if (!node.feed_url || node.live === false) {
    return {
      node_id: node.node_id,
      node_type: node.node_type,
      tier: node.tier,
      entries: [],
      fetched_at: null,
      error: node.live === false ? 'offline' : 'no_feed_url',
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(node.feed_url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'mobius-mesh-aggregator/1.0' },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return {
        node_id: node.node_id,
        node_type: node.node_type,
        tier: node.tier,
        entries: [],
        fetched_at: new Date().toISOString(),
        error: `http_${res.status}`,
      }
    }

    const data = await res.json()
    const entries = Array.isArray(data) ? data : data.items ?? data.entries ?? []

    return {
      node_id: node.node_id,
      node_type: node.node_type,
      tier: node.tier,
      entries: entries.slice(0, MAX_ENTRIES_PER_NODE).map((e) => ({
        ...e,
        _mesh_node: node.node_id,
        _mesh_tier: node.tier,
      })),
      fetched_at: new Date().toISOString(),
      error: null,
    }
  } catch (err) {
    const msg = err?.name === 'AbortError' ? 'timeout' : String(err?.message ?? err)
    return {
      node_id: node.node_id,
      node_type: node.node_type,
      tier: node.tier,
      entries: [],
      fetched_at: new Date().toISOString(),
      error: msg,
    }
  }
}

const REGISTRY = readRegistry()
const nodes = REGISTRY.nodes ?? []

const nodeResults = await Promise.all(nodes.map((n) => fetchNodeFeed(n)))

const allEntries = nodeResults.flatMap((n) => n.entries)
const seen = new Set()
const deduped = allEntries.filter((e) => {
  const id = e?.id ?? e?.sha
  if (!id || seen.has(id)) return false
  seen.add(id)
  return true
})

deduped.sort((a, b) => {
  const ta = new Date(a.timestamp ?? a.created_at ?? 0).getTime()
  const tb = new Date(b.timestamp ?? b.created_at ?? 0).getTime()
  return tb - ta
})

const aggregate = {
  schema: 'MNS_AGGREGATE_V1',
  updated_at: new Date().toISOString(),
  node_count: nodes.length,
  live_nodes: nodeResults.filter((n) => !n.error).length,
  total_entries: deduped.length,
  nodes: nodeResults.map((n) => ({
    node_id: n.node_id,
    tier: n.tier,
    node_type: n.node_type,
    entry_count: n.entries.length,
    fetched_at: n.fetched_at,
    error: n.error,
  })),
  entries: deduped.slice(0, MAX_TOTAL_ENTRIES),
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(aggregate, null, 2))

console.log(`MNS aggregate: ${deduped.length} entries from ${nodes.length} nodes`)
for (const n of nodeResults) {
  const status = n.error ? `ERROR: ${n.error}` : `${n.entries.length} entries`
  console.log(`  ${n.node_id}: ${status}`)
}
