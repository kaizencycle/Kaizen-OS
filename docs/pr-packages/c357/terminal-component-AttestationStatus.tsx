/**
 * components/vault/AttestationStatus.tsx
 * Repo: mobius-civic-ai-terminal
 *
 * Displays canonization status for a Reserve Block in the Vault UI.
 * Shows: attestation state, .dat file link, CPC anchor link, chain position.
 *
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

"use client"

import { useEffect, useState } from "react"
import type { VaultSealedBlock } from "@/lib/dat/types"
import type { CpcManifestResponse } from "@/lib/cpc/hashAnchor"

interface AttestationStatusProps {
  block: VaultSealedBlock
  cpcManifest?: CpcManifestResponse | null
  compact?: boolean
}

type DisplayStatus = "attested" | "canonized_via_dat" | "pending" | "error" | "quarantined"

function resolveStatus(block: VaultSealedBlock): DisplayStatus {
  if (block.dat_canonized && block.dat_file) return "canonized_via_dat"
  if (block.substrate_attestation_id) return "attested"
  if (block.fountain_status === "QUARANTINED") return "quarantined"
  return "pending"
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; color: string; dot: string }> = {
  canonized_via_dat: { label: "Canonized (.dat)", color: "text-emerald-400", dot: "bg-emerald-400" },
  attested:         { label: "Attested",          color: "text-blue-400",   dot: "bg-blue-400" },
  pending:          { label: "Pending",            color: "text-yellow-400", dot: "bg-yellow-400" },
  error:            { label: "Error",              color: "text-red-400",    dot: "bg-red-400" },
  quarantined:      { label: "Quarantined",        color: "text-orange-400", dot: "bg-orange-400" },
}

export function AttestationStatus({ block, cpcManifest, compact = false }: AttestationStatusProps) {
  const status = resolveStatus(block)
  const cfg = STATUS_CONFIG[status]

  const cpcAnchor = cpcManifest?.anchors.find(a => a.dat_file === block.dat_file)

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-mono ${cfg.color}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    )
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 uppercase tracking-wider">Attestation</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${cfg.color}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot} animate-pulse`} />
          {cfg.label}
        </span>
      </div>

      {status === "canonized_via_dat" && block.dat_file && (
        <div className="space-y-1.5">
          <Row label=".dat file" value={block.dat_file} mono />

          {cpcAnchor && (
            <>
              <Row label="CPC anchor" value={`#${cpcAnchor.id}`} mono />
              <Row label="Chain tip" value={truncHash(cpcAnchor.chain_tip_hash)} mono />
              <Row label="Canonized" value={formatDate(cpcAnchor.canonized_at)} />
              <Row
                label="Blocks"
                value={`${cpcAnchor.block_range_start}–${cpcAnchor.block_range_end} (${cpcAnchor.block_count})`}
              />
            </>
          )}
        </div>
      )}

      {status === "attested" && block.substrate_attestation_id && (
        <div className="space-y-1.5">
          <Row label="Attestation ID" value={truncHash(block.substrate_attestation_id)} mono />
          <Row label="Method" value="Substrate JWT" />
        </div>
      )}

      {status === "pending" && (
        <p className="text-xs text-white/40">
          This block has not yet been canonized into the .dat archive. It will be
          included in the next canonization run.
        </p>
      )}

      {status === "quarantined" && (
        <p className="text-xs text-orange-400/80">
          This block is quarantined and excluded from canonization until resolved.
        </p>
      )}
    </div>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-white/40 shrink-0">{label}</span>
      <span className={`text-xs text-white/80 truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  )
}

function truncHash(h: string): string {
  if (h.length <= 16) return h
  const clean = h.replace(/^sha256:/, "")
  return `${clean.slice(0, 8)}…${clean.slice(-6)}`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    })
  } catch { return iso }
}

// ─── Bulk status summary for vault overview ───────────────────────────────────

export interface CanonizationSummaryProps {
  blocks: VaultSealedBlock[]
  cpcManifest?: CpcManifestResponse | null
}

export function CanonizationSummary({ blocks, cpcManifest }: CanonizationSummaryProps) {
  const counts = blocks.reduce((acc, b) => {
    const s = resolveStatus(b)
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {} as Partial<Record<DisplayStatus, number>>)

  const canonized = counts.canonized_via_dat ?? 0
  const attested = counts.attested ?? 0
  const pending = counts.pending ?? 0
  const pct = blocks.length > 0 ? Math.round((canonized / blocks.length) * 100) : 0

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">.dat Canon Coverage</h3>
        <span className="text-xs text-white/40">EPICON C-357</span>
      </div>

      <div className="flex items-end gap-3">
        <span className="text-3xl font-mono font-bold text-emerald-400">{pct}%</span>
        <span className="text-sm text-white/40 pb-1">{canonized} / {blocks.length} blocks</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Canonized" value={canonized} color="text-emerald-400" />
        <Stat label="Attested" value={attested} color="text-blue-400" />
        <Stat label="Pending" value={pending} color="text-yellow-400" />
      </div>

      {cpcManifest && (
        <div className="pt-2 border-t border-white/10 space-y-1.5">
          <Row label="CPC chain tip" value={truncHash(cpcManifest.chain_tip_hash ?? "")} mono />
          <Row
            label="Total MIC anchored"
            value={`${(cpcManifest.total_mic_anchored ?? 0).toLocaleString()} MIC`}
          />
          <Row label=".dat files anchored" value={String(cpcManifest.total_dat_files ?? 0)} />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-mono font-semibold ${color}`}>{value}</span>
      <span className="text-xs text-white/40">{label}</span>
    </div>
  )
}
