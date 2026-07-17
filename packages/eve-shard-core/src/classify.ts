import type { EpiconSourceRecord } from './types.js';

export type SourceStatusSummary = {
  declared_count: number;
  repository_preserved_count: number;
  ledger_ingested_count: number;
  sealed_count: number;
  cold_canon_exported_count: number;
  sources: EpiconSourceRecord[];
};

export function classifySources(sources: EpiconSourceRecord[]): SourceStatusSummary {
  let declared_count = 0;
  let repository_preserved_count = 0;
  let ledger_ingested_count = 0;
  let sealed_count = 0;
  let cold_canon_exported_count = 0;

  for (const source of sources) {
    if (source.declared) {
      declared_count += 1;
    }
    if (source.repository_preserved) {
      repository_preserved_count += 1;
    }
    if (source.ledger_ingested === true) {
      ledger_ingested_count += 1;
    }
    if (source.sealed) {
      sealed_count += 1;
    }
    if (source.cold_canon_exported) {
      cold_canon_exported_count += 1;
    }
  }

  return {
    declared_count,
    repository_preserved_count,
    ledger_ingested_count,
    sealed_count,
    cold_canon_exported_count,
    sources: sources.map((source) => ({
      ...source,
      ledger_ingested: source.ledger_ingested ?? null,
      source_refs: [...source.source_refs],
      evidence_hashes: source.evidence_hashes ? [...source.evidence_hashes] : undefined,
    })),
  };
}

export function inferShardStatus(summary: SourceStatusSummary): 'proposed' | 'needs_evidence' {
  const missingRepositoryProof = summary.sources.some(
    (source) => !source.declared || !source.repository_preserved,
  );

  if (missingRepositoryProof || summary.sources.length === 0) {
    return 'needs_evidence';
  }

  return 'proposed';
}
