import type { EvidenceLicenseScope, EvidencePacket, EvidenceVisibility } from './types';

export function canReusePayload(
  packet: EvidencePacket,
  requesterAgent: string,
  purpose: string,
): { allowed: boolean; reason: string } {
  const license = packet.license;
  if (!license.cacheAllowed) {
    return { allowed: false, reason: 'License forbids cache reuse for this packet.' };
  }
  if (packet.visibility === 'PRIVATE_SCOPED' && packet.acquisition.acquiredByAgent !== requesterAgent) {
    return { allowed: false, reason: 'Private-scoped packet is outside requester scope.' };
  }
  if (
    packet.visibility === 'FEDERATION_SHARED' &&
    !license.federationReuse &&
    packet.acquisition.acquiredByAgent !== requesterAgent
  ) {
    return { allowed: false, reason: 'Federation reuse not permitted by license.' };
  }
  if (!license.internalReuse && packet.acquisition.acquiredByAgent !== requesterAgent) {
    return { allowed: false, reason: 'Internal reuse restricted to acquiring agent.' };
  }
  if (license.expiresAt && Date.parse(license.expiresAt) < Date.now()) {
    return { allowed: false, reason: 'License scope expired.' };
  }
  if (!purpose.trim()) {
    return { allowed: false, reason: 'Purpose required for reuse authorization.' };
  }
  return { allowed: true, reason: 'Reuse permitted by license scope.' };
}

export function publicMetadataOnly(packet: EvidencePacket): Partial<EvidencePacket> {
  const license = packet.license;
  const base: Partial<EvidencePacket> = {
    packetId: packet.packetId,
    requestHash: packet.requestHash,
    contentHash: packet.contentHash,
    claimClass: packet.claimClass,
    subject: packet.subject,
    visibility: packet.visibility,
    freshness: packet.freshness,
    verification: packet.verification,
    createdAt: packet.createdAt,
    source: {
      providerId: packet.source.providerId,
      acquiredAt: packet.source.acquiredAt,
      eventTime: packet.source.eventTime,
      reportingTime: packet.source.reportingTime,
    },
    acquisition: {
      acquiredByAgent: packet.acquisition.acquiredByAgent,
      acquisitionMode: packet.acquisition.acquisitionMode,
      price: license.publicProvenance ? packet.acquisition.price ?? null : null,
      paymentReference: license.publicProvenance ? packet.acquisition.paymentReference ?? null : null,
    },
    license: {
      cacheAllowed: license.cacheAllowed,
      internalReuse: license.internalReuse,
      federationReuse: license.federationReuse,
      publicPayload: license.publicPayload,
      publicProvenance: license.publicProvenance,
      derivativeSummary: license.derivativeSummary,
    },
  };
  if (license.publicPayload) {
    const visible: EvidencePacket = { ...packet };
    if (!license.publicProvenance) {
      visible.source = {
        providerId: packet.source.providerId,
        acquiredAt: packet.source.acquiredAt,
        eventTime: packet.source.eventTime,
        reportingTime: packet.source.reportingTime,
      };
      visible.acquisition = {
        acquiredByAgent: packet.acquisition.acquiredByAgent,
        acquisitionMode: packet.acquisition.acquisitionMode,
        price: null,
        paymentReference: null,
      };
      visible.normalizedQuery = '[redacted query]';
    }
    return visible;
  }
  base.observation = license.derivativeSummary
    ? `[redacted — see license scope; subject: ${packet.subject}]`
    : '[payload restricted]';
  base.normalizedQuery = license.publicProvenance ? packet.normalizedQuery : '[redacted query]';
  return base;
}

export function defaultVisibilityFor(visibility?: EvidenceVisibility): EvidenceVisibility {
  return visibility ?? 'FEDERATION_SHARED';
}
