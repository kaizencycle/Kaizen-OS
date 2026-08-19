import { randomUUID } from 'crypto';
import type {
  EvidenceAccessDecision,
  EvidenceAcquisition,
  EvidencePacket,
  EvidenceResolveInput,
  EvidenceResolveParams,
  EvidenceReuseEvent,
  EvidenceSource,
  NormalizedEvidenceRequest,
} from './types';
import { DEFAULT_FEDERATION_LICENSE } from './types';
import {
  buildNormalizedQueryLabel,
  createEvidenceContentHash,
  createEvidenceRequestHash,
  normalizeEvidenceRequest,
} from './normalization';
import { evaluateFreshnessStatus, defaultValidUntil } from './freshnessPolicy';
import { canReusePayload } from './licensePolicy';
import { countIndependentSources, requiresIndependentSource } from './independence';
import {
  createReuseEvent,
  getEvidenceRepository,
  type EvidenceRepository,
  type InMemoryEvidenceRepository,
} from './repository';
import { withSingleFlight } from './singleFlight';

export type MockAcquireInput = {
  request: NormalizedEvidenceRequest;
  acquiredByAgent: string;
  subject: string;
  observation: string;
  source: EvidenceSource;
  payload: unknown;
  acquisition: EvidenceAcquisition;
  ttlHours?: number;
  predecessorPacketId?: string | null;
};

export async function decideEvidenceAccess(
  input: EvidenceResolveParams,
  repo: EvidenceRepository = getEvidenceRepository(),
): Promise<EvidenceAccessDecision> {
  const normalizedInput: EvidenceResolveInput = {
    ...input,
    historicalOnly: input.historicalOnly ?? false,
  };
  const normalized = normalizeEvidenceRequest(input.request);
  const requestHash = createEvidenceRequestHash(normalized);
  const existing = await repo.findLatestByRequestHash(requestHash);

  if (
    requiresIndependentSource(existing ?? undefined, normalizedInput.independentWitnessRequired) &&
    existing
  ) {
    return {
      decision: 'INDEPENDENT_SOURCE_REQUIRED',
      reason: 'Corroboration requires an independent source lineage; existing packet would reuse same evidence.',
      requiresPayment: true,
      packet: existing,
    };
  }

  if (!existing) {
    return {
      decision: 'NEW_ACQUISITION',
      reason: 'No matching evidence packet exists for this normalized request.',
      requiresPayment: true,
    };
  }

  const licenseCheck = canReusePayload(existing, normalizedInput.requesterAgent, normalizedInput.purpose);
  if (!licenseCheck.allowed) {
    return {
      decision: 'LICENSE_DENIED',
      packet: existing,
      reason: licenseCheck.reason,
      requiresPayment: true,
    };
  }

  const freshness = evaluateFreshnessStatus(existing);
  if (freshness === 'SUPERSEDED' || freshness === 'DISPUTED') {
    return {
      decision: 'NEW_ACQUISITION',
      packet: existing,
      reason: `Existing packet status ${freshness}; fresh acquisition required.`,
      requiresPayment: true,
    };
  }

  if (freshness === 'STALE') {
    if (normalizedInput.historicalOnly) {
      return {
        decision: 'STALE_ALLOWED',
        packet: existing,
        reason: 'Historical reuse permitted for stale packet within original time boundary.',
        requiresPayment: false,
      };
    }
    return {
      decision: 'REVALIDATE',
      packet: existing,
      reason: 'Matching packet exists but freshness window expired for current information.',
      requiresPayment: true,
    };
  }

  return {
    decision: 'FRESH_HIT',
    packet: existing,
    reason: 'Equivalent fresh packet exists and reuse is permitted.',
    requiresPayment: false,
  };
}

export async function recordEvidenceReuse(input: {
  packetId: string;
  consumerAgent: string;
  purpose: string;
  historicalOnly?: boolean;
  operatorScope?: string | null;
  repo?: EvidenceRepository;
}): Promise<EvidenceAccessDecision> {
  const repo = input.repo ?? getEvidenceRepository();
  const packet = await repo.findByPacketId(input.packetId);
  if (!packet) {
    throw new Error(`Packet not found: ${input.packetId}`);
  }
  const freshness = evaluateFreshnessStatus(packet);
  const accessMode = input.historicalOnly || freshness === 'STALE' ? 'HISTORICAL_REUSE' : 'CACHE_REUSE';
  await repo.appendReuseEvent(
    createReuseEvent({
      packetId: packet.packetId,
      consumerAgent: input.consumerAgent,
      purpose: input.purpose,
      accessMode,
      freshnessAtAccess: freshness === 'FRESH' ? 'FRESH' : 'STALE',
      operatorScope: input.operatorScope,
    }),
  );
  return {
    decision: freshness === 'FRESH' ? 'FRESH_HIT' : 'STALE_ALLOWED',
    packet,
    reason: 'Reuse event appended.',
    requiresPayment: false,
  };
}

export async function mockAcquireEvidencePacket(
  input: MockAcquireInput,
  repo: EvidenceRepository = getEvidenceRepository(),
): Promise<EvidencePacket> {
  const normalized = normalizeEvidenceRequest(input.request);
  const requestHash = createEvidenceRequestHash(normalized);

  const { result } = await withSingleFlight(requestHash, 30_000, async () => {
    const existing = await repo.findLatestByRequestHash(requestHash);
    if (existing && evaluateFreshnessStatus(existing) === 'FRESH') {
      return existing;
    }

    const memRepo = repo as ReturnType<typeof getEvidenceRepository>;
    const packetId =
      typeof (memRepo as { nextPacketId?: () => string }).nextPacketId === 'function'
        ? (memRepo as { nextPacketId: () => string }).nextPacketId()
        : `MOB-EVID-C408-${randomUUID().slice(0, 8)}`;

    const now = new Date().toISOString();
    const contentHash = createEvidenceContentHash(input.payload);
    const packet: EvidencePacket = {
      packetId,
      version: 1,
      requestHash,
      contentHash,
      normalizedQuery: buildNormalizedQueryLabel(normalized),
      claimClass: 'OBSERVED',
      subject: input.subject,
      observation: input.observation,
      source: {
        ...input.source,
        providerId: normalized.providerId,
        acquiredAt: input.source.acquiredAt || now,
      },
      acquisition: input.acquisition,
      license: normalized.licenseScope ?? DEFAULT_FEDERATION_LICENSE,
      visibility: 'FEDERATION_SHARED',
      freshness: {
        validFrom: now,
        validUntil: defaultValidUntil(now, input.ttlHours ?? 24),
        status: 'FRESH',
      },
      verification: {
        status: 'PROVISIONAL',
        uniquePacketCount: 1,
        independentSourceCount: 1,
        conflicts: [],
      },
      createdAt: now,
      payloadRef: `payload:${packetId}`,
      predecessorPacketId: input.predecessorPacketId ?? null,
    };

    await repo.insertPacket(packet, input.payload);
    return packet;
  });

  return result;
}

export async function expirePacketForFixture(
  packetId: string,
  repo: EvidenceRepository = getEvidenceRepository(),
): Promise<EvidencePacket> {
  const memRepo = repo as InMemoryEvidenceRepository;
  if (typeof memRepo.markPacketStale !== 'function') {
    throw new Error('expirePacketForFixture requires InMemoryEvidenceRepository');
  }
  return memRepo.markPacketStale(packetId);
}

export function summarizePacket(
  packet: EvidencePacket,
  reuseEvents: EvidenceReuseEvent[],
): {
  readerCount: number;
  reuseCount: number;
  independentSourceCount: number;
  totalPaidAmount?: string;
  totalPaidCurrency?: string;
} {
  const readers = new Set<string>([packet.acquisition.acquiredByAgent]);
  for (const event of reuseEvents) {
    readers.add(event.consumerAgent);
  }
  const price = packet.acquisition.price;
  return {
    readerCount: readers.size,
    reuseCount: reuseEvents.length,
    independentSourceCount: countIndependentSources([packet]),
    totalPaidAmount: price?.amount,
    totalPaidCurrency: price?.currency,
  };
}


export async function resolveAndReuse(
  input: EvidenceResolveParams,
  repo: EvidenceRepository = getEvidenceRepository(),
): Promise<EvidenceAccessDecision> {
  const decision = await decideEvidenceAccess(input, repo);
  if (decision.decision === 'FRESH_HIT' && decision.packet) {
    await recordEvidenceReuse({
      packetId: decision.packet.packetId,
      consumerAgent: input.requesterAgent,
      purpose: input.purpose,
      repo,
    });
  }
  return decision;
}
