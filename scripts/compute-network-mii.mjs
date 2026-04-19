#!/usr/bin/env node
/**
 * Network MII proxy from mesh aggregate + registry (MNS-v1).
 * Writes ledger/network-mii.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const AGG_PATH = path.join(ROOT, 'ledger', 'mesh-aggregate.json')
const REG_PATH = path.join(ROOT, 'mesh', 'registry.json')
const OUT_PATH = path.join(ROOT, 'ledger', 'network-mii.json')

const TIER_WEIGHTS = { sentinel: 1.0, contributor: 0.7, observer: 0.3 }

const aggregate = JSON.parse(fs.readFileSync(AGG_PATH, 'utf8'))
const registry = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'))

const nodeMiis = (aggregate.nodes ?? [])
  .filter((n) => !n.error && n.entry_count > 0)
  .map((n) => {
    const regNode = registry.nodes?.find((r) => r.node_id === n.node_id)
    const tier = regNode?.tier ?? n.tier ?? 'observer'
    const baseline = typeof regNode?.mii_baseline === 'number' ? regNode.mii_baseline : 0.5
    return {
      node_id: n.node_id,
      tier,
      mii_baseline: baseline,
      weight: TIER_WEIGHTS[tier] ?? 0.3,
      entry_count: n.entry_count,
    }
  })

const totalWeight = nodeMiis.reduce((s, n) => s + n.weight, 0)
const weightedMii =
  totalWeight > 0 ? nodeMiis.reduce((s, n) => s + n.mii_baseline * n.weight, 0) / totalWeight : 0

const output = {
  schema: 'MNS_NETWORK_MII_V1',
  computed_at: new Date().toISOString(),
  network_mii: Math.round(weightedMii * 10000) / 10000,
  node_count: nodeMiis.length,
  nodes: nodeMiis,
  note:
    'Network MII is a weighted average of registered node baselines for nodes with at least one aggregated entry. Live per-node MII is a follow-up.',
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2))
console.log(`Network MII: ${output.network_mii} (${nodeMiis.length} contributing nodes)`)
