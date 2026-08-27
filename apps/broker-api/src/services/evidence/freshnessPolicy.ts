import type { EvidencePacket } from './types';

export function evaluateFreshnessStatus(
  packet: EvidencePacket,
  now: Date = new Date(),
): 'FRESH' | 'STALE' | 'SUPERSEDED' | 'DISPUTED' {
  if (packet.freshness.status === 'SUPERSEDED' || packet.freshness.status === 'DISPUTED') {
    return packet.freshness.status;
  }
  const validUntil = packet.freshness.validUntil;
  if (!validUntil) {
    return packet.freshness.status === 'STALE' ? 'STALE' : 'FRESH';
  }
  const untilMs = Date.parse(validUntil);
  if (Number.isNaN(untilMs)) {
    return 'STALE';
  }
  return now.getTime() <= untilMs ? 'FRESH' : 'STALE';
}

export function freshnessAgeSeconds(packet: EvidencePacket, now: Date = new Date()): number {
  const fromMs = Date.parse(packet.freshness.validFrom);
  if (Number.isNaN(fromMs)) {
    return 0;
  }
  return Math.max(0, Math.floor((now.getTime() - fromMs) / 1000));
}

export function defaultValidUntil(fromIso: string, ttlHours = 24): string {
  const from = Date.parse(fromIso);
  return new Date(from + ttlHours * 3600 * 1000).toISOString();
}
