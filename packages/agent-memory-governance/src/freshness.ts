import { QUALIFYING_EVIDENTIARY_TYPES } from './canonicalizeRoot.js';
import type { AgentMemoryRecord } from './types.js';

/** True when every qualifying root with expires_at is still valid at `now`. */
export function evidentiaryRootsFresh(
  record: AgentMemoryRecord,
  now: Date = new Date()
): boolean {
  const nowMs = now.getTime();
  const sources = record.evidence?.independent_sources ?? [];
  for (const source of sources) {
    if (!QUALIFYING_EVIDENTIARY_TYPES.has(source.type)) continue;
    if (source.expires_at) {
      const exp = Date.parse(source.expires_at);
      if (!Number.isNaN(exp) && exp <= nowMs) return false;
    }
  }
  if (record.freshness?.expires_at) {
    const exp = Date.parse(record.freshness.expires_at);
    if (!Number.isNaN(exp) && exp <= nowMs) return false;
  }
  return true;
}

export function isRecordStaleForConsequence(
  record: AgentMemoryRecord,
  now: Date = new Date()
): boolean {
  if (record.class === 'STALE' || record.class === 'QUARANTINED' || record.class === 'REJECTED') {
    return true;
  }
  if (record.class === 'VERIFIED' && !evidentiaryRootsFresh(record, now)) {
    return true;
  }
  return false;
}
