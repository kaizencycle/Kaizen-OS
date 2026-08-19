import { randomUUID } from 'crypto';
import type { EvidencePacket, EvidenceReuseEvent } from './types';
import { EvidencePacketSchema, EvidenceReuseEventSchema } from './types';

export interface EvidenceRepository {
  findLatestByRequestHash(requestHash: string): Promise<EvidencePacket | null>;
  findByPacketId(packetId: string): Promise<EvidencePacket | null>;
  listPackets(limit?: number): Promise<EvidencePacket[]>;
  insertPacket(packet: EvidencePacket, payload?: unknown): Promise<void>;
  appendReuseEvent(event: EvidenceReuseEvent): Promise<void>;
  listReuseEvents(packetId: string): Promise<EvidenceReuseEvent[]>;
  findCandidateIdempotency(key: string): Promise<string | null>;
  recordCandidateIdempotency(key: string, packetId: string): Promise<void>;
  reset(): void;
}

type StoredRecord = {
  packet: EvidencePacket;
  payload?: unknown;
};

export class InMemoryEvidenceRepository implements EvidenceRepository {
  private packetsById = new Map<string, StoredRecord>();
  private latestByRequestHash = new Map<string, string>();
  private reuseEvents: EvidenceReuseEvent[] = [];
  private candidateKeys = new Map<string, string>();
  private packetCounter = 0;

  async findLatestByRequestHash(requestHash: string): Promise<EvidencePacket | null> {
    const id = this.latestByRequestHash.get(requestHash);
    if (!id) {
      return null;
    }
    return this.packetsById.get(id)?.packet ?? null;
  }

  async findByPacketId(packetId: string): Promise<EvidencePacket | null> {
    return this.packetsById.get(packetId)?.packet ?? null;
  }

  async listPackets(limit = 100): Promise<EvidencePacket[]> {
    return Array.from(this.packetsById.values())
      .map((row) => row.packet)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit);
  }

  async insertPacket(packet: EvidencePacket, payload?: unknown): Promise<void> {
    EvidencePacketSchema.parse(packet);
    if (this.packetsById.has(packet.packetId)) {
      throw new Error(`Packet already exists: ${packet.packetId}`);
    }
    this.packetsById.set(packet.packetId, { packet, payload });
    this.latestByRequestHash.set(packet.requestHash, packet.packetId);
  }

  async appendReuseEvent(event: EvidenceReuseEvent): Promise<void> {
    EvidenceReuseEventSchema.parse(event);
    this.reuseEvents.push(event);
  }

  async listReuseEvents(packetId: string): Promise<EvidenceReuseEvent[]> {
    return this.reuseEvents.filter((event) => event.packetId === packetId);
  }

  async findCandidateIdempotency(key: string): Promise<string | null> {
    return this.candidateKeys.get(key) ?? null;
  }

  async recordCandidateIdempotency(key: string, packetId: string): Promise<void> {
    this.candidateKeys.set(key, packetId);
  }

  reset(): void {
    this.packetsById.clear();
    this.latestByRequestHash.clear();
    this.reuseEvents = [];
    this.candidateKeys.clear();
    this.packetCounter = 0;
  }

  nextPacketId(prefix = 'MOB-EVID'): string {
    this.packetCounter += 1;
    return `${prefix}-C408-${String(this.packetCounter).padStart(3, '0')}`;
  }

  getPayload(packetId: string): unknown | undefined {
    return this.packetsById.get(packetId)?.payload;
  }

  markPacketStale(packetId: string): EvidencePacket {
    const row = this.packetsById.get(packetId);
    if (!row) {
      throw new Error(`Packet not found: ${packetId}`);
    }
    row.packet = {
      ...row.packet,
      freshness: {
        ...row.packet.freshness,
        status: 'STALE',
        validUntil: new Date(Date.now() - 60_000).toISOString(),
      },
    };
    return row.packet;
  }
}

let defaultRepository: InMemoryEvidenceRepository | null = null;

export function getEvidenceRepository(): InMemoryEvidenceRepository {
  if (!defaultRepository) {
    defaultRepository = new InMemoryEvidenceRepository();
  }
  return defaultRepository;
}

export function resetEvidenceRepository(): void {
  if (defaultRepository) {
    defaultRepository.reset();
  }
}

export function createReuseEvent(input: {
  packetId: string;
  consumerAgent: string;
  purpose: string;
  accessMode: 'CACHE_REUSE' | 'HISTORICAL_REUSE';
  freshnessAtAccess: 'FRESH' | 'STALE';
  operatorScope?: string | null;
}): EvidenceReuseEvent {
  return {
    eventId: randomUUID(),
    packetId: input.packetId,
    consumerAgent: input.consumerAgent,
    operatorScope: input.operatorScope ?? null,
    purpose: input.purpose,
    accessMode: input.accessMode,
    freshnessAtAccess: input.freshnessAtAccess,
    reusedAt: new Date().toISOString(),
    additionalPayment: { amount: '0', currency: 'USDC' },
  };
}
