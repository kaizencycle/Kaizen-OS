/**
 * shared/types.ts → terminal: lib/dat/types.ts
 * Repo: mobius-civic-ai-terminal
 *
 * Reserve Block .dat canon type definitions.
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

// ─── Raw vault block as stored in KV ──────────────────────────────────────────

export interface VaultSealedBlock {
  seal_id: string
  block_number: number
  sealed_at: string
  cycle: string
  quorum: string[]
  gi_at_seal: number
  source_entries: number
  fountain_status: string
  substrate_attestation_id?: string
  dat_canonized?: boolean
  dat_file?: string
}

// ─── .dat record format (NDJSON, one line per block) ─────────────────────────

export interface DatBlockRecord {
  block_id: string
  block_number: number
  mic_value: number           // always 50.00
  sealed_at: string
  cycle: string
  seal_quorum: string[]
  gi_at_seal: number
  source_entries: number
  prev_hash: string           // SHA-256 of previous record (genesis = "0".repeat(64))
  block_hash: string          // SHA-256("sha256:" + preimage + prev_hash)
}

// ─── .dat file manifest ───────────────────────────────────────────────────────

export interface DatManifest {
  version: string
  generated_at: string
  total_blocks: number
  total_mic: number
  chain_tip_hash: string
  files: Record<string, DatManifestEntry>
}

export interface DatManifestEntry {
  range: [number, number]
  sha256: string
  block_count: number
}

// ─── CPC hash anchor payload ──────────────────────────────────────────────────

export interface DatHashAnchorPayload {
  dat_file: string
  file_hash: string
  block_range_start: number
  block_range_end: number
  block_count: number
  chain_tip_hash: string
  manifest_hash?: string
  version: string
  canonized_at: string
}

export interface DatHashAnchorResponse {
  status: "ok"
  action: "anchored" | "idempotent"
  dat_file: string
  blocks: string
  chain_tip: string
}

// ─── Canonization result ──────────────────────────────────────────────────────

export interface CanonizationResult {
  epicon_cycle: string
  total_blocks_processed: number
  total_mic_canonized: number
  dat_files_written: string[]
  manifest_hash: string
  chain_tip_hash: string
  cpc_anchors_posted: number
  cpc_anchors_idempotent: number
  errors: CanonizationError[]
  completed_at: string
  substrate_commit_ready: boolean
}

export interface CanonizationError {
  block_number?: number
  dat_file?: string
  stage: "fetch" | "hash" | "write" | "cpc_anchor"
  message: string
  retryable: boolean
}

// ─── Vault terminal display state ─────────────────────────────────────────────

export type AttestationDisplayStatus =
  | "attested"
  | "canonized_via_dat"
  | "pending"
  | "error"
  | "quarantined"
