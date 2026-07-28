import { evidentiaryRootsFresh } from './freshness.js';
import { canPromoteToVerified, meetsConsequenceEvidenceBar } from './promotion.js';
import type { AgentMemoryRecord, MemoryClass, ZeusAdjudication } from './types.js';

const ALLOWED_TRANSITIONS: Record<MemoryClass, MemoryClass[]> = {
  REPORTED: ['INFERRED', 'QUARANTINED'],
  INFERRED: ['VERIFIED', 'QUARANTINED', 'STALE'],
  VERIFIED: ['STALE', 'QUARANTINED', 'SUPERSEDED'],
  STALE: ['VERIFIED', 'QUARANTINED'],
  QUARANTINED: ['VERIFIED', 'SUPERSEDED', 'REJECTED', 'QUARANTINED'],
  SUPERSEDED: [],
  REJECTED: ['INFERRED'], // NEW_EVIDENCE_REOPEN only — caller must set new memory id
};

export function canTransition(from: MemoryClass, to: MemoryClass): boolean {
  if (from === 'REJECTED' && to === 'VERIFIED') return false;
  if (from === 'REPORTED' && to === 'VERIFIED') return false;
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

export function applyZeusAdjudication(
  current: MemoryClass,
  verdict: ZeusAdjudication
): MemoryClass | null {
  if (current !== 'QUARANTINED') return null;
  switch (verdict) {
    case 'CLEAR':
      return 'VERIFIED';
    case 'SUPERSEDE':
      return 'SUPERSEDED';
    case 'REJECT':
      return 'REJECTED';
    case 'HOLD':
      return 'QUARANTINED';
    default:
      return null;
  }
}

export type TransitionContext = {
  reopenEvidence?: boolean;
  zeusAdjudicationClear?: boolean;
  now?: Date;
  requiredSources?: number;
};

function gateVerifiedTransition(
  record: AgentMemoryRecord,
  from: MemoryClass,
  context: TransitionContext
): { ok: true } | { ok: false; error: string } {
  const now = context.now ?? new Date();
  if (from === 'INFERRED') {
    const promo = canPromoteToVerified(record, {
      now,
      requiredSources: context.requiredSources,
    });
    if (!promo.allowed) {
      return {
        ok: false,
        error: `INFERRED → VERIFIED blocked: ${promo.reasons.join(', ')}`,
      };
    }
    return { ok: true };
  }
  if (from === 'STALE') {
    if (!evidentiaryRootsFresh(record, now)) {
      return { ok: false, error: 'STALE → VERIFIED requires fresh qualifying evidentiary roots' };
    }
    if (!meetsConsequenceEvidenceBar(record, context.requiredSources)) {
      return { ok: false, error: 'STALE → VERIFIED requires provenance, quorum, and no conflict' };
    }
    return { ok: true };
  }
  if (from === 'QUARANTINED') {
    if (!context.zeusAdjudicationClear) {
      return { ok: false, error: 'QUARANTINED → VERIFIED requires ZEUS CLEAR (use applyZeusAdjudication)' };
    }
    if (!evidentiaryRootsFresh(record, now)) {
      return { ok: false, error: 'QUARANTINED → VERIFIED requires fresh qualifying evidentiary roots' };
    }
    if (!meetsConsequenceEvidenceBar(record, context.requiredSources)) {
      return { ok: false, error: 'QUARANTINED → VERIFIED requires provenance, quorum, and no conflict' };
    }
    return { ok: true };
  }
  return { ok: false, error: `VERIFIED transition not allowed from ${from}` };
}

export function transitionMemoryClass(
  record: AgentMemoryRecord,
  to: MemoryClass,
  context: TransitionContext = {}
): { ok: true; record: AgentMemoryRecord } | { ok: false; error: string } {
  const from = record.class;
  if (from === 'REJECTED' && to === 'INFERRED') {
    if (!context.reopenEvidence) {
      return { ok: false, error: 'REJECTED → INFERRED requires NEW_EVIDENCE_REOPEN' };
    }
    return { ok: true, record: { ...record, class: 'INFERRED' } };
  }
  if (to === 'VERIFIED') {
    const gate = gateVerifiedTransition(record, from, context);
    if (!gate.ok) return gate;
  }
  if (!canTransition(from, to)) {
    return { ok: false, error: `disallowed transition ${from} → ${to}` };
  }
  return { ok: true, record: { ...record, class: to } };
}
