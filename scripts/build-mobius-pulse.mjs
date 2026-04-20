#!/usr/bin/env node
/**
 * Builds ledger/mobius-pulse.json — cycle-level mesh pulse for HIVE / browser-shell readers.
 * Run after mesh-aggregate.mjs in CI.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'ledger', 'mobius-pulse.json')
const CYCLE = path.join(ROOT, 'cycle.json')
const AGG = path.join(ROOT, 'ledger', 'mesh-aggregate.json')
const NET = path.join(ROOT, 'ledger', 'network-mii.json')

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return fallback
  }
}

async function fetchSnapshotLite(url) {
  if (!url) return null
  try {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 6000)
    const res = await fetch(url, {
      signal: c.signal,
      headers: { 'User-Agent': 'mobius-pulse-builder/1.0' },
    })
    clearTimeout(t)
    if (!res.ok) return { ok: false, error: `http_${res.status}` }
    const j = await res.json()
    return {
      ok: true,
      gi: j.gi ?? j.global_integrity ?? j.lanes?.integrity?.gi ?? null,
      mode: j.mode ?? j.gi_mode ?? null,
      cycle: j.cycle ?? j.current_cycle ?? null,
    }
  } catch (e) {
    return { ok: false, error: e?.name === 'AbortError' ? 'timeout' : String(e?.message ?? e) }
  }
}

const cycleDoc = readJson(CYCLE, {})
const agg = readJson(AGG, {})
const net = readJson(NET, {})
const snapshotUrl = cycleDoc.snapshot_lite || cycleDoc.snapshot

const pulse = {
  schema: 'MOBIUS_PULSE_V1',
  updated_at: new Date().toISOString(),
  cycle: cycleDoc.current_cycle ?? null,
  cycle_date: cycleDoc.date ?? null,
  aggregate: {
    node_count: agg.node_count ?? null,
    live_nodes: agg.live_nodes ?? null,
    total_entries: agg.total_entries ?? null,
  },
  network_mii: typeof net.network_mii === 'number' ? net.network_mii : null,
  terminal_snapshot: await fetchSnapshotLite(snapshotUrl),
  notes:
    'Pulse is derived from cycle.json + mesh-aggregate + network-mii + optional Terminal snapshot-lite. HIVE and browser-shell should treat this file as read-only input.',
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(pulse, null, 2))
console.log('Wrote', OUT)
