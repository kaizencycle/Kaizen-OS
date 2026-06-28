/**
 * app/api/admin/canon/trigger/route.ts
 * Repo: mobius-civic-ai-terminal
 *
 * Admin endpoint to trigger Reserve Block .dat canonization.
 * Auth: AGENT_SERVICE_TOKEN bearer OR session with admin role.
 *
 * POST /api/admin/canon/trigger
 *   { dry_run?: boolean, from_block?: number, to_block?: number }
 *
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

import { NextRequest, NextResponse } from "next/server"
import { canonizeReserveBlocks } from "@/lib/dat/canonize"

export const runtime = "nodejs"
export const maxDuration = 300

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────

  const auth = req.headers.get("Authorization") ?? ""
  const serviceToken = process.env.AGENT_SERVICE_TOKEN

  if (!serviceToken) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 })
  }

  if (auth !== `Bearer ${serviceToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────

  let body: { dry_run?: boolean; from_block?: number; to_block?: number } = {}
  try {
    body = await req.json()
  } catch {
    // empty body is fine
  }

  const dryRun = body.dry_run === true
  const fromBlock = typeof body.from_block === "number" ? body.from_block : 1
  const toBlock = typeof body.to_block === "number" ? body.to_block : 10_000

  if (fromBlock < 1 || toBlock < fromBlock || toBlock > 100_000) {
    return NextResponse.json({ error: "Invalid block range" }, { status: 400 })
  }

  // ── Run canonization ──────────────────────────────────────────────────────

  try {
    const result = await canonizeReserveBlocks({
      dryRun,
      fromBlock,
      toBlock,
      verbose: false,
      epiconCycle: "C-357",
    })

    const status = result.errors.filter(e => !e.retryable).length > 0 ? 207 : 200

    return NextResponse.json(
      {
        ok: true,
        dry_run: dryRun,
        epicon_cycle: result.epicon_cycle,
        total_blocks_processed: result.total_blocks_processed,
        total_mic_canonized: result.total_mic_canonized,
        dat_files_written: result.dat_files_written,
        cpc_anchors_posted: result.cpc_anchors_posted,
        cpc_anchors_idempotent: result.cpc_anchors_idempotent,
        chain_tip_hash: result.chain_tip_hash,
        manifest_hash: result.manifest_hash,
        substrate_commit_ready: result.substrate_commit_ready,
        errors: result.errors,
        completed_at: result.completed_at,
      },
      { status }
    )
  } catch (e) {
    console.error("[canon/trigger] Fatal error:", e)
    return NextResponse.json(
      { error: "Canonization failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}

// ── GET: current canonization status ─────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get("Authorization") ?? ""
  const serviceToken = process.env.AGENT_SERVICE_TOKEN

  if (!serviceToken || auth !== `Bearer ${serviceToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { kv } = await import("@vercel/kv")
    const index = await kv.get("dat:canon:index")
    return NextResponse.json({ ok: true, canon_index: index })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
