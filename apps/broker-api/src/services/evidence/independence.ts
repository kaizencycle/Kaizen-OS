import type { EvidencePacket } from './types';

export function countIndependentSources(packets: EvidencePacket[]): number {
  const lineage = new Set<string>();
  for (const packet of packets) {
    const key = [
      packet.source.providerId.toLowerCase(),
      packet.source.publisherId?.toLowerCase() ?? '',
      packet.source.sourceRecordId ?? '',
      packet.contentHash,
    ].join('|');
    lineage.add(key);
  }
  return Math.max(1, lineage.size);
}

export function sameLineage(a: EvidencePacket, b: EvidencePacket): boolean {
  return (
    a.source.providerId.toLowerCase() === b.source.providerId.toLowerCase() &&
    (a.source.publisherId ?? '') === (b.source.publisherId ?? '') &&
    a.contentHash === b.contentHash
  );
}

export function requiresIndependentSource(
  existing: EvidencePacket | undefined,
  independentWitnessRequired: boolean,
): boolean {
  if (!independentWitnessRequired) {
    return false;
  }
  if (!existing) {
    return false;
  }
  return true;
}
