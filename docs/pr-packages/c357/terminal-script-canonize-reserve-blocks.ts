/**
 * scripts/canonize-reserve-blocks.ts
 * Repo: mobius-civic-ai-terminal
 *
 * One-shot CLI migration: canonizes ALL sealed Reserve Blocks into .dat files.
 * Run once to bootstrap the cold-canon archive, then let the cron handle deltas.
 *
 * Usage:
 *   npx tsx scripts/canonize-reserve-blocks.ts [--dry-run] [--from=N] [--to=N] [--verbose]
 *
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

import { canonizeReserveBlocks } from "../lib/dat/canonize"
import type { CanonizationResult } from "../lib/dat/types"

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const verbose = args.includes("--verbose")
const fromArg = args.find(a => a.startsWith("--from="))
const toArg = args.find(a => a.startsWith("--to="))
const fromBlock = fromArg ? parseInt(fromArg.split("=")[1], 10) : 1
const toBlock = toArg ? parseInt(toArg.split("=")[1], 10) : 10_000

async function main() {
  console.log("══════════════════════════════════════════════════════════")
  console.log("  Mobius Reserve Block .dat Canonization")
  console.log("  EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION")
  console.log("══════════════════════════════════════════════════════════")
  console.log(`  Mode:   ${dryRun ? "DRY RUN (no writes)" : "LIVE"}`)
  console.log(`  Range:  blocks ${fromBlock}–${toBlock}`)
  console.log(`  Time:   ${new Date().toISOString()}`)
  console.log("══════════════════════════════════════════════════════════")
  console.log()

  const envErrors: string[] = []
  if (!process.env.KV_REST_API_URL) envErrors.push("KV_REST_API_URL")
  if (!process.env.KV_REST_API_TOKEN) envErrors.push("KV_REST_API_TOKEN")
  if (!dryRun) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) envErrors.push("BLOB_READ_WRITE_TOKEN")
    if (!process.env.CPC_API_BASE) envErrors.push("CPC_API_BASE")
    if (!process.env.AGENT_SERVICE_TOKEN) envErrors.push("AGENT_SERVICE_TOKEN")
  }

  if (envErrors.length > 0) {
    console.error(`ERROR: Missing environment variables: ${envErrors.join(", ")}`)
    console.error("Set these in .env.local and re-run.")
    process.exit(1)
  }

  const startMs = Date.now()
  let result: CanonizationResult

  try {
    result = await canonizeReserveBlocks({
      dryRun,
      fromBlock,
      toBlock,
      verbose,
      epiconCycle: "C-357",
    })
  } catch (e) {
    console.error("FATAL: canonizeReserveBlocks threw:", e instanceof Error ? e.message : String(e))
    process.exit(1)
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1)

  console.log()
  console.log("══════════════════════════════════════════════════════════")
  console.log("  RESULT")
  console.log("══════════════════════════════════════════════════════════")
  console.log(`  Blocks processed:   ${result.total_blocks_processed}`)
  console.log(`  MIC canonized:      ${result.total_mic_canonized.toFixed(2)}`)
  console.log(`  .dat files written: ${result.dat_files_written.length}`)
  console.log(`  CPC anchors posted: ${result.cpc_anchors_posted}`)
  console.log(`  CPC idempotent:     ${result.cpc_anchors_idempotent}`)
  console.log(`  Chain tip:          ${result.chain_tip_hash}`)
  console.log(`  Manifest hash:      ${result.manifest_hash}`)
  console.log(`  Substrate ready:    ${result.substrate_commit_ready ? "YES" : "NO"}`)
  console.log(`  Errors:             ${result.errors.length}`)
  console.log(`  Elapsed:            ${elapsed}s`)

  if (result.dat_files_written.length > 0) {
    console.log()
    console.log("  .dat files:")
    for (const f of result.dat_files_written) {
      console.log(`    ${f}`)
    }
  }

  if (result.errors.length > 0) {
    console.log()
    console.log("  Errors:")
    for (const err of result.errors) {
      const loc = err.block_number ? `block ${err.block_number}` : err.dat_file ?? "—"
      console.log(`    [${err.stage}] ${loc}: ${err.message} ${err.retryable ? "(retryable)" : ""}`)
    }
  }

  console.log()

  if (result.substrate_commit_ready) {
    console.log("  NEXT STEPS:")
    console.log("  1. Pull the .dat files and MANIFEST.json from Blob storage:")
    console.log("     npx tsx scripts/pull-dat-files.ts")
    console.log("  2. Commit to Mobius-Substrate:")
    console.log("     git add canon/reserve-blocks/")
    console.log(`     git commit -m "canon(c357): canonize ${result.total_blocks_processed} reserve blocks"`)
    console.log("  3. Push to trigger reserve-block-canonization.yml verification")
  } else if (result.errors.length > 0) {
    const fatal = result.errors.filter(e => !e.retryable)
    const retryable = result.errors.filter(e => e.retryable)
    if (fatal.length > 0) {
      console.log(`  ATTENTION: ${fatal.length} non-retryable errors — manual intervention required.`)
    }
    if (retryable.length > 0) {
      console.log(`  ${retryable.length} retryable errors — re-run the script to retry.`)
    }
  }

  console.log("══════════════════════════════════════════════════════════")
  console.log()

  process.exit(result.errors.filter(e => !e.retryable).length > 0 ? 1 : 0)
}

main().catch(e => {
  console.error("Unhandled error:", e)
  process.exit(1)
})
