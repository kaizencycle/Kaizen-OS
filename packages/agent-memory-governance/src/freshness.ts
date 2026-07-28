import { QUALIFYING_EVIDENTIARY_TYPES } from './canonicalizeRoot.js';
import type { AgentMemoryRecord } from './types.js';

function parseExpiryMs(iso: string | undefined): number | 'missing' | 'invalid' {
  if (!iso) return 'missing';
  const exp = Date.parse(iso);
  if (Number.isNaN(exp)) return 'invalid';
  return exp;
}

/** True when every qualifying root with expires_at is still valid at `now`. Fail-closed on invalid timestamps. */
export function evidentiaryRootsFresh(
  record: AgentMemoryRecord,
  now: Date = new Date()
): boolean {
  const nowMs = now.getTime();
  const sources = record.evidence?.independent_sources ?? [];
  for (const source of sources) {
    if (!QUALIFYING_EVIDENTIARY_TYPES.has(source.type)) continue;
    const parsed = parseExpiryMs(source.expires_at);
    if (parsed === 'invalid') return false;
    if (parsed !== 'missing' && parsed <= nowMs) return false;
  }
  const recordExpiry = parseExpiryMs(record.freshness?.expires_at);
  if (recordExpiry === 'invalid') return false;
  if (recordExpiry !== 'missing' && recordExpiry <= nowMs) return false;
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
