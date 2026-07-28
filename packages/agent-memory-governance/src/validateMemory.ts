import { isRecordStaleForConsequence } from './freshness.js';
import { meetsConsequenceEvidenceBar } from './promotion.js';
import type { AgentMemoryRecord, MemoryClass } from './types.js';

const KNOWN_CLASSES = new Set<MemoryClass>([
  'REPORTED',
  'INFERRED',
  'VERIFIED',
  'STALE',
  'QUARANTINED',
  'SUPERSEDED',
  'REJECTED',
]);

const PLANNING_CONTEXT_CLASSES = new Set<MemoryClass>([
  'REPORTED',
  'INFERRED',
  'VERIFIED',
  'STALE',
]);

export interface MemoryValidationResult {
  safe_for_context: boolean;
  safe_for_consequence: boolean;
  quarantine_recommended: boolean;
  issues: string[];
  /** INV-005 — future-agent instructions are claims, not commands */
  future_agent_instruction_detected: boolean;
}

const FUTURE_AGENT_INSTRUCTION = /\bfuture\s+[A-Z][A-Za-z0-9_-]*\s*:/i;

/**
 * Validates whether a record may be read for planning/context. Never promotes class.
 */
export function validateMemory(record: AgentMemoryRecord): MemoryValidationResult {
  const issues: string[] = [];
  let quarantine_recommended = false;

  if (!KNOWN_CLASSES.has(record.class)) {
    issues.push(`unknown class "${record.class as string}"`);
    quarantine_recommended = true;
  }

  const future_agent_instruction_detected = FUTURE_AGENT_INSTRUCTION.test(record.claim);
  if (future_agent_instruction_detected) {
    issues.push('future-agent instruction detected — treat as claim (INV-005)');
  }

  if (record.class === 'QUARANTINED' || record.class === 'REJECTED') {
    quarantine_recommended = true;
    issues.push(`${record.class} — not safe for planning or consequence`);
  }

  if (record.verification_conflict) {
    issues.push('verification_conflict — unresolved dispute');
    quarantine_recommended = true;
  }

  if (record.class === 'VERIFIED' && !record.provenance) {
    issues.push('VERIFIED record missing provenance');
  }

  if (record.class === 'STALE') {
    issues.push('STALE — reverify required before consequence');
  }

  const safe_for_context =
    !quarantine_recommended &&
    PLANNING_CONTEXT_CLASSES.has(record.class) &&
    record.class !== 'QUARANTINED' &&
    record.class !== 'REJECTED';

  const safe_for_consequence =
    safe_for_context &&
    record.class === 'VERIFIED' &&
    !record.zeus_hold &&
    !future_agent_instruction_detected &&
    !isRecordStaleForConsequence(record) &&
    meetsConsequenceEvidenceBar(record);

  return {
    safe_for_context,
    safe_for_consequence,
    quarantine_recommended,
    issues,
    future_agent_instruction_detected,
  };
}
