/**
 * lib/cpc/hashAnchor.ts
 * Repo: mobius-civic-ai-terminal
 *
 * Posts .dat file hash anchors to CPC. CPC stores hash proofs only.
 * Auth: AGENT_SERVICE_TOKEN — NOT the identity JWT (that's the broken path).
 *
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

import type { DatHashAnchorPayload, DatHashAnchorResponse } from "@/lib/dat/types"

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export interface AnchorResult {
  success: boolean
  action?: "anchored" | "idempotent"
  error?: string
  retries?: number
}

export async function postHashAnchor(payload: DatHashAnchorPayload): Promise<AnchorResult> {
  const base = process.env.CPC_API_BASE
  const token = process.env.AGENT_SERVICE_TOKEN

  if (!base) return { success: false, error: "CPC_API_BASE env var not set" }
  if (!token) return { success: false, error: "AGENT_SERVICE_TOKEN env var not set" }

  const url = `${base}/api/canon/reserve-blocks/anchor`
  let lastError = ""

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Mobius-EPICON": "C-357:RESERVE_BLOCK_DAT_CANONIZATION",
        },
        body: JSON.stringify(payload),
      })

      if (res.status === 409) {
        const body = await res.json() as { detail?: string }
        return { success: false, error: `CANON CONFLICT on ${payload.dat_file}: ${body.detail ?? "hash mismatch"}`, retries: attempt }
      }

      if (!res.ok) {
        lastError = `CPC ${res.status}: ${await res.text()}`
        if (attempt < MAX_RETRIES) { await delay(RETRY_DELAY_MS * attempt); continue }
        return { success: false, error: lastError, retries: attempt }
      }

      const data = await res.json() as DatHashAnchorResponse
      return { success: true, action: data.action, retries: attempt }
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e)
      if (attempt < MAX_RETRIES) await delay(RETRY_DELAY_MS * attempt)
    }
  }

  return { success: false, error: lastError, retries: MAX_RETRIES }
}

export interface CpcManifestResponse {
  total_dat_files: number
  total_blocks_anchored: number
  total_mic_anchored: number
  chain_tip: string | null
  chain_tip_hash: string | null
  anchors: Array<{
    id: number; dat_file: string; file_hash: string
    block_range_start: number; block_range_end: number; block_count: number
    chain_tip_hash: string; version: string; canonized_at: string; created_at: string
  }>
}

export async function fetchCpcManifest(): Promise<CpcManifestResponse | null> {
  const base = process.env.CPC_API_BASE
  if (!base) return null
  try {
    const res = await fetch(`${base}/api/canon/reserve-blocks/manifest`, {
      headers: { "Cache-Control": "no-cache" },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json() as Promise<CpcManifestResponse>
  } catch { return null }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
