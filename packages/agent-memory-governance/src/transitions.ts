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

export function transitionMemoryClass(
  record: AgentMemoryRecord,
  to: MemoryClass,
  context: { reopenEvidence?: boolean } = {}
): { ok: true; record: AgentMemoryRecord } | { ok: false; error: string } {
  const from = record.class;
  if (from === 'REJECTED' && to === 'INFERRED') {
    if (!context.reopenEvidence) {
      return { ok: false, error: 'REJECTED → INFERRED requires NEW_EVIDENCE_REOPEN' };
    }
    return { ok: true, record: { ...record, class: 'INFERRED' } };
  }
  if (!canTransition(from, to)) {
    return { ok: false, error: `disallowed transition ${from} → ${to}` };
  }
  return { ok: true, record: { ...record, class: to } };
}
