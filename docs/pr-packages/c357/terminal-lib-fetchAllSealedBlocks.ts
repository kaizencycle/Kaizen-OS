/**
 * lib/vault/fetchAllSealedBlocks.ts
 * Repo: mobius-civic-ai-terminal
 *
 * Reads ALL sealed Reserve Blocks from vault KV storage.
 * Three-strategy fallback: KV index → KV scan → REST API.
 *
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

import { kv } from "@vercel/kv"
import type { VaultSealedBlock } from "@/lib/dat/types"

const VAULT_BLOCK_PREFIX = "vault:block:"
const VAULT_INDEX_KEY = "vault:blocks:index"
const PAGE_SIZE = 50
const MAX_BLOCKS = 10_000

export interface FetchBlocksOptions {
  forceApi?: boolean
  fromBlock?: number
  toBlock?: number
  verbose?: boolean
}

export interface FetchBlocksResult {
  blocks: VaultSealedBlock[]
  total_found: number
  source: "kv_index" | "kv_scan" | "api"
  gaps: number[]
  errors: string[]
}

export async function fetchAllSealedBlocks(opts: FetchBlocksOptions = {}): Promise<FetchBlocksResult> {
  const { forceApi = false, fromBlock = 1, toBlock = MAX_BLOCKS, verbose = false } = opts
  const errors: string[] = []

  if (!forceApi) {
    try {
      return await fetchViaIndex({ fromBlock, toBlock, verbose, errors })
    } catch (e) {
      const msg = `KV index fetch failed: ${e instanceof Error ? e.message : String(e)}`
      errors.push(msg)
      if (verbose) console.warn(`[fetchAllSealedBlocks] ${msg} — falling back to scan`)
    }

    try {
      return await fetchViaScan({ fromBlock, toBlock, verbose, errors })
    } catch (e) {
      const msg = `KV scan fetch failed: ${e instanceof Error ? e.message : String(e)}`
      errors.push(msg)
      if (verbose) console.warn(`[fetchAllSealedBlocks] ${msg} — falling back to API`)
    }
  }

  return await fetchViaApi({ fromBlock, toBlock, verbose, errors })
}

async function fetchViaIndex(opts: { fromBlock: number; toBlock: number; verbose: boolean; errors: string[] }): Promise<FetchBlocksResult> {
  const { fromBlock, toBlock, verbose, errors } = opts
  const indexRaw = await kv.get<number[]>(VAULT_INDEX_KEY)
  if (!indexRaw || !Array.isArray(indexRaw)) throw new Error("vault:blocks:index missing or malformed")

  const targetNumbers = indexRaw.filter(n => n >= fromBlock && n <= toBlock).sort((a, b) => a - b)
  if (verbose) console.log(`[fetchAllSealedBlocks] index: ${targetNumbers.length} blocks`)

  const blocks: VaultSealedBlock[] = []
  for (let i = 0; i < targetNumbers.length; i += PAGE_SIZE) {
    const batch = targetNumbers.slice(i, i + PAGE_SIZE)
    const keys = batch.map(n => `${VAULT_BLOCK_PREFIX}${n}`)
    const results = await kv.mget<VaultSealedBlock[]>(...keys)
    for (let j = 0; j < results.length; j++) {
      const block = results[j]
      if (block) blocks.push(normalizeBlock(block, batch[j]))
      else errors.push(`Block ${batch[j]} missing from KV`)
    }
  }

  blocks.sort((a, b) => a.block_number - b.block_number)
  return { blocks, total_found: blocks.length, source: "kv_index", gaps: findGaps(blocks.map(b => b.block_number)), errors }
}

async function fetchViaScan(opts: { fromBlock: number; toBlock: number; verbose: boolean; errors: string[] }): Promise<FetchBlocksResult> {
  const { fromBlock, toBlock, verbose, errors } = opts
  const blocks: VaultSealedBlock[] = []
  let cursor = 0
  let iterations = 0

  do {
    const { cursor: nextCursor, keys } = await kv.scan(cursor, { match: `${VAULT_BLOCK_PREFIX}*`, count: PAGE_SIZE })
    cursor = nextCursor
    if (keys.length > 0) {
      const results = await kv.mget<VaultSealedBlock[]>(...keys)
      for (let i = 0; i < results.length; i++) {
        const block = results[i]
        if (!block) continue
        const n = block.block_number ?? extractBlockNumber(keys[i])
        if (n >= fromBlock && n <= toBlock) blocks.push(normalizeBlock(block, n))
      }
    }
    iterations++
    if (verbose && iterations % 10 === 0) console.log(`[fetchAllSealedBlocks] scan iter ${iterations}, found ${blocks.length}`)
  } while (cursor !== 0 && iterations < 500)

  blocks.sort((a, b) => a.block_number - b.block_number)
  return { blocks, total_found: blocks.length, source: "kv_scan", gaps: findGaps(blocks.map(b => b.block_number)), errors }
}

async function fetchViaApi(opts: { fromBlock: number; toBlock: number; verbose: boolean; errors: string[] }): Promise<FetchBlocksResult> {
  const { fromBlock, toBlock, verbose, errors } = opts
  const base = process.env.TERMINAL_API_BASE ?? "http://localhost:3000"
  const token = process.env.AGENT_SERVICE_TOKEN
  if (!token) throw new Error("AGENT_SERVICE_TOKEN not set")

  const blocks: VaultSealedBlock[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const url = `${base}/api/vault/blocks/all?page=${page}&limit=${PAGE_SIZE}&from=${fromBlock}&to=${toBlock}`
    if (verbose) console.log(`[fetchAllSealedBlocks] API page ${page}`)
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Vault API ${res.status}: ${await res.text()}`)
    const json = await res.json() as { blocks: VaultSealedBlock[]; has_more: boolean }
    blocks.push(...json.blocks.map((b, i) => normalizeBlock(b, b.block_number ?? fromBlock + (page - 1) * PAGE_SIZE + i)))
    hasMore = json.has_more
    page++
  }

  blocks.sort((a, b) => a.block_number - b.block_number)
  return { blocks, total_found: blocks.length, source: "api", gaps: findGaps(blocks.map(b => b.block_number)), errors }
}

function normalizeBlock(raw: Partial<VaultSealedBlock>, blockNumber: number): VaultSealedBlock {
  return {
    seal_id: raw.seal_id ?? `seal-unknown-${blockNumber}`,
    block_number: raw.block_number ?? blockNumber,
    sealed_at: raw.sealed_at ?? new Date(0).toISOString(),
    cycle: raw.cycle ?? "unknown",
    quorum: raw.quorum ?? ["ATLAS", "ZEUS", "EVE", "JADE", "AUREA"],
    gi_at_seal: raw.gi_at_seal ?? 0,
    source_entries: raw.source_entries ?? 0,
    fountain_status: raw.fountain_status ?? "LOCKED",
    substrate_attestation_id: raw.substrate_attestation_id,
    dat_canonized: raw.dat_canonized,
    dat_file: raw.dat_file,
  }
}

function extractBlockNumber(key: string): number {
  const n = parseInt(key.replace(VAULT_BLOCK_PREFIX, ""), 10)
  return isNaN(n) ? 0 : n
}

function findGaps(sorted: number[]): number[] {
  if (sorted.length === 0) return []
  const set = new Set(sorted)
  const gaps: number[] = []
  for (let i = sorted[0]; i <= sorted[sorted.length - 1]; i++) {
    if (!set.has(i)) gaps.push(i)
  }
  return gaps
}
