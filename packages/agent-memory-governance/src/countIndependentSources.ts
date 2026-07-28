import { canonicalRootKey, QUALIFYING_EVIDENTIARY_TYPES } from './canonicalizeRoot.js';
import type { AgentMemoryRecord } from './types.js';

/** Single authority for independent evidentiary root counting (C-386 A-005 / §9). */
export function countIndependentSources(record: AgentMemoryRecord): number {
  const sources = record.evidence?.independent_sources ?? [];
  const keys = new Set<string>();
  for (const source of sources) {
    if (!QUALIFYING_EVIDENTIARY_TYPES.has(source.type)) continue;
    keys.add(canonicalRootKey(source));
  }
  return keys.size;
}

export function quorumSatisfied(record: AgentMemoryRecord, requiredSources = 2): boolean {
  return countIndependentSources(record) >= requiredSources;
}

/**
 * C-386 §9 — self-referential when prior memory exists and no qualifying external roots.
 * Uses countIndependentSources() only; no second evidence definition.
 */
export function isSelfReferentialChain(record: AgentMemoryRecord): boolean {
  const previous = record.provenance?.previous_memory_ids ?? [];
  if (previous.length === 0) return false;
  return countIndependentSources(record) === 0;
}
