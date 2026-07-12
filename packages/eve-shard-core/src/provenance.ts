import { createHash } from 'node:crypto';

import type { EpiconSourceRecord } from './types.js';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
}

export function computeSourceRootHash(cycle: string, sources: EpiconSourceRecord[]): string {
  const canonicalSources = sources
    .map((source) => ({
      cold_canon_exported: source.cold_canon_exported,
      declared: source.declared,
      epicon_id: source.epicon_id,
      evidence_hashes: [...(source.evidence_hashes ?? [])].sort(),
      ledger_ingested: source.ledger_ingested,
      repository_preserved: source.repository_preserved,
      sealed: source.sealed,
      source_refs: [...source.source_refs].sort(),
    }))
    .sort((left, right) => left.epicon_id.localeCompare(right.epicon_id));

  const payload = {
    cycle: normalizeCycleSegment(cycle),
    sources: canonicalSources,
  };

  const digest = createHash('sha256').update(stableStringify(payload)).digest('hex');
  return `sha256:${digest}`;
}

export function normalizeCycleSegment(cycle: string): string {
  const trimmed = cycle.trim().toUpperCase();
  if (trimmed.startsWith('C-')) {
    return trimmed;
  }

  const digits = trimmed.replace(/[^0-9]/g, '');
  return `C-${digits.padStart(3, '0').slice(-3)}`;
}

export function allocateShardId(cycle: string, sequence = 1): string {
  const normalized = normalizeCycleSegment(cycle);
  const suffix = String(sequence).padStart(3, '0');
  return `SHARD_${normalized}_EVE_${suffix}`;
}

export const GENERATOR_VERSION = 'eve-shard-core/0.1.0';
