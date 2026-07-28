import { countIndependentSources, isSelfReferentialChain, quorumSatisfied } from './countIndependentSources.js';
import { evidentiaryRootsFresh } from './freshness.js';
import { resolveRequiredSources } from './quorumPolicy.js';
import type { AgentMemoryRecord, PromotionBlockReason } from './types.js';

export interface PromotionDecision {
  allowed: boolean;
  reasons: PromotionBlockReason[];
}

/**
 * Explicit promotion gate (C-386 §10 / A-007). Does not run inside validate_memory().
 */
export function canPromoteToVerified(
  record: AgentMemoryRecord,
  options: { requiredSources?: number; now?: Date } = {}
): PromotionDecision {
  const requiredSources = resolveRequiredSources(options.requiredSources);
  const now = options.now ?? new Date();
  const reasons: PromotionBlockReason[] = [];

  if (record.class !== 'INFERRED') {
    reasons.push('not_inferred');
  }
  if (!record.provenance) {
    reasons.push('missing_provenance');
  }
  if (record.verification_conflict) {
    reasons.push('verification_conflict');
  }
  if (!quorumSatisfied(record, requiredSources)) {
    reasons.push('quorum_not_met');
  }
  if (isSelfReferentialChain(record)) {
    reasons.push('self_referential_chain');
  }
  if (!evidentiaryRootsFresh(record, now)) {
    if (record.freshness?.expires_at && Date.parse(record.freshness.expires_at) <= now.getTime()) {
      reasons.push('stale_record_freshness');
    } else {
      reasons.push('stale_evidence_root');
    }
  }

  return { allowed: reasons.length === 0, reasons };
}

/** Runtime consequence bar: provenance, no conflict, evidentiary quorum (§13). */
export function meetsConsequenceEvidenceBar(
  record: AgentMemoryRecord,
  requiredSources?: number
): boolean {
  if (!record.provenance) return false;
  if (record.verification_conflict) return false;
  if (isSelfReferentialChain(record)) return false;
  return quorumSatisfied(record, resolveRequiredSources(requiredSources));
}

/** INFERRED + 1 root → not promotable; exposed for tests */
export function promotionEligibilitySummary(record: AgentMemoryRecord): {
  independent_sources: number;
  self_referential: boolean;
} {
  return {
    independent_sources: countIndependentSources(record),
    self_referential: isSelfReferentialChain(record),
  };
}
