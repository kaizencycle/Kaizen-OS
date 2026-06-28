/**
 * lib/dat/canonize.ts
 * Repo: mobius-civic-ai-terminal
 *
 * Core orchestration engine for Reserve Block .dat canonization.
 * Reads sealed blocks from vault KV, builds NDJSON .dat files with
 * SHA-256 hash chains, writes to Vercel Blob, posts hash anchors to CPC.
 *
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

import { put } from "@vercel/blob"
import { kv } from "@vercel/kv"
import { fetchAllSealedBlocks } from "@/lib/vault/fetchAllSealedBlocks"
import { postHashAnchor } from "@/lib/cpc/hashAnchor"
import {
  buildDatRecord,
  hashDatFile,
  datFileName,
  verifyDatChain,
  GENESIS_HASH,
  DAT_VERSION,
  MIC_PER_BLOCK,
  BLOCKS_PER_DAT_FILE,
} from "@/lib/dat/hashDatRecord"
import type {
  VaultSealedBlock,
  DatBlockRecord,
  DatManifest,
  CanonizationResult,
  CanonizationError,
} from "@/lib/dat/types"

const VAULT_BLOCK_PREFIX = "vault:block:"
const BLOB_DAT_PREFIX = "canon/reserve-blocks/"
const DAT_INDEX_KEY = "dat:canon:index"

export interface CanonizeOptions {
  dryRun?: boolean
  fromBlock?: number
  toBlock?: number
  verbose?: boolean
  epiconCycle?: string
}

export async function canonizeReserveBlocks(
  opts: CanonizeOptions = {}
): Promise<CanonizationResult> {
  const {
    dryRun = false,
    fromBlock = 1,
    toBlock = 10_000,
    verbose = false,
    epiconCycle = "C-357",
  } = opts

  const errors: CanonizationError[] = []
  const datFilesWritten: string[] = []
  let cpcAnchorsPosted = 0
  let cpcAnchorsIdempotent = 0

  const log = verbose ? console.log : () => {}

  // ── 1. Fetch all sealed blocks ──────────────────────────────────────────────

  log(`[canonize] Fetching sealed blocks ${fromBlock}–${toBlock}`)
  const fetchResult = await fetchAllSealedBlocks({ fromBlock, toBlock, verbose })

  if (fetchResult.errors.length > 0) {
    for (const msg of fetchResult.errors) {
      errors.push({ stage: "fetch", message: msg, retryable: true })
    }
  }

  if (fetchResult.blocks.length === 0) {
    return makeResult(epiconCycle, 0, [], "", GENESIS_HASH, 0, 0, errors, false)
  }

  log(`[canonize] Found ${fetchResult.blocks.length} blocks (source: ${fetchResult.source})`)
  if (fetchResult.gaps.length > 0) {
    log(`[canonize] Gaps in sequence: ${fetchResult.gaps.slice(0, 20).join(", ")}${fetchResult.gaps.length > 20 ? "..." : ""}`)
    errors.push({
      stage: "fetch",
      message: `${fetchResult.gaps.length} gaps in block sequence: ${fetchResult.gaps.slice(0, 5).join(", ")}${fetchResult.gaps.length > 5 ? "..." : ""}`,
      retryable: false,
    })
  }

  // ── 2. Partition into .dat files (100 blocks each) ─────────────────────────

  const blocks = fetchResult.blocks
  const fileCount = Math.ceil(blocks.length / BLOCKS_PER_DAT_FILE)
  log(`[canonize] Building ${fileCount} .dat files`)

  let chainTipHash = GENESIS_HASH
  const manifest: DatManifest = {
    version: DAT_VERSION,
    generated_at: new Date().toISOString(),
    total_blocks: blocks.length,
    total_mic: blocks.length * MIC_PER_BLOCK,
    chain_tip_hash: "",
    files: {},
  }

  for (let fileIdx = 0; fileIdx < fileCount; fileIdx++) {
    const fileBlocks = blocks.slice(fileIdx * BLOCKS_PER_DAT_FILE, (fileIdx + 1) * BLOCKS_PER_DAT_FILE)
    const fileName = datFileName(fileIdx + 1)
    const blockStart = fileBlocks[0].block_number
    const blockEnd = fileBlocks[fileBlocks.length - 1].block_number

    log(`[canonize] Building ${fileName}: blocks ${blockStart}–${blockEnd}`)

    // Capture the tip before building so we can verify from the correct starting hash
    const fileStartHash = chainTipHash

    // Build records
    const records: DatBlockRecord[] = []
    for (const block of fileBlocks) {
      try {
        const record = buildDatRecord(block, chainTipHash)
        records.push(record)
        chainTipHash = record.block_hash
      } catch (e) {
        const msg = `Failed to build record for block ${block.block_number}: ${e instanceof Error ? e.message : String(e)}`
        errors.push({ block_number: block.block_number, dat_file: fileName, stage: "hash", message: msg, retryable: false })
        log(`[canonize] ${msg}`)
      }
    }

    if (records.length === 0) continue

    // Verify chain before writing — pass the pre-file tip so cross-file prev_hash validates correctly
    const verification = verifyDatChain(records, fileStartHash)
    if (!verification.valid) {
      errors.push({
        dat_file: fileName,
        stage: "hash",
        message: `Chain verification failed: ${verification.error}`,
        retryable: false,
      })
      log(`[canonize] Chain verification failed for ${fileName}: ${verification.error}`)
      continue
    }

    const content = records.map(r => JSON.stringify(r)).join("\n") + "\n"
    const fileHash = hashDatFile(content)

    manifest.files[fileName] = {
      range: [blockStart, blockEnd],
      sha256: fileHash,
      block_count: records.length,
    }

    if (!dryRun) {
      // Write .dat to Blob storage
      try {
        await put(`${BLOB_DAT_PREFIX}${fileName}`, content, {
          access: "public",
          contentType: "application/octet-stream",
          addRandomSuffix: false,
        })
        datFilesWritten.push(fileName)
        log(`[canonize] Wrote ${fileName} to Blob`)
      } catch (e) {
        const msg = `Blob write failed for ${fileName}: ${e instanceof Error ? e.message : String(e)}`
        errors.push({ dat_file: fileName, stage: "write", message: msg, retryable: true })
        log(`[canonize] ${msg}`)
        continue
      }

      // Post hash anchor to CPC
      const anchorResult = await postHashAnchor({
        dat_file: fileName,
        file_hash: fileHash,
        block_range_start: blockStart,
        block_range_end: blockEnd,
        block_count: records.length,
        chain_tip_hash: records[records.length - 1].block_hash,
        version: DAT_VERSION,
        canonized_at: new Date().toISOString(),
      })

      if (anchorResult.success) {
        if (anchorResult.action === "anchored") cpcAnchorsPosted++
        else cpcAnchorsIdempotent++
      } else {
        errors.push({
          dat_file: fileName,
          stage: "cpc_anchor",
          message: anchorResult.error ?? "Unknown CPC anchor error",
          retryable: !(anchorResult.error?.includes("CANON CONFLICT")),
        })
      }

      // Mark blocks as canonized in KV
      const pipeline = kv.pipeline()
      for (const record of records) {
        const key = `${VAULT_BLOCK_PREFIX}${record.block_number}`
        pipeline.hset(key, { dat_canonized: true, dat_file: fileName })
      }
      await pipeline.exec()
    } else {
      datFilesWritten.push(fileName)
      log(`[canonize] [DRY RUN] Would write ${fileName} (${records.length} blocks, hash: ${fileHash})`)
    }
  }

  // ── 3. Write MANIFEST.json ─────────────────────────────────────────────────

  manifest.chain_tip_hash = chainTipHash
  const manifestContent = JSON.stringify(manifest, null, 2)
  const manifestHash = hashDatFile(manifestContent)

  if (!dryRun && datFilesWritten.length > 0) {
    try {
      await put(`${BLOB_DAT_PREFIX}MANIFEST.json`, manifestContent, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
      })

      // Store index in KV for fast lookup
      await kv.set(DAT_INDEX_KEY, {
        total_blocks: blocks.length,
        total_mic: blocks.length * MIC_PER_BLOCK,
        chain_tip_hash: chainTipHash,
        manifest_hash: manifestHash,
        dat_files: datFilesWritten,
        generated_at: manifest.generated_at,
        epicon_cycle: epiconCycle,
      })

      log(`[canonize] Wrote MANIFEST.json (hash: ${manifestHash})`)
    } catch (e) {
      errors.push({
        stage: "write",
        message: `MANIFEST.json write failed: ${e instanceof Error ? e.message : String(e)}`,
        retryable: true,
      })
    }
  }

  const substrateCommitReady = datFilesWritten.length > 0 && errors.filter(e => !e.retryable).length === 0

  return makeResult(
    epiconCycle,
    blocks.length,
    datFilesWritten,
    manifestHash,
    chainTipHash,
    cpcAnchorsPosted,
    cpcAnchorsIdempotent,
    errors,
    substrateCommitReady
  )
}

function makeResult(
  epiconCycle: string,
  totalBlocks: number,
  datFiles: string[],
  manifestHash: string,
  chainTipHash: string,
  anchorsPosted: number,
  anchorsIdempotent: number,
  errors: CanonizationError[],
  substrateCommitReady: boolean
): CanonizationResult {
  return {
    epicon_cycle: epiconCycle,
    total_blocks_processed: totalBlocks,
    total_mic_canonized: totalBlocks * MIC_PER_BLOCK,
    dat_files_written: datFiles,
    manifest_hash: manifestHash,
    chain_tip_hash: chainTipHash,
    cpc_anchors_posted: anchorsPosted,
    cpc_anchors_idempotent: anchorsIdempotent,
    errors,
    completed_at: new Date().toISOString(),
    substrate_commit_ready: substrateCommitReady,
  }
}
