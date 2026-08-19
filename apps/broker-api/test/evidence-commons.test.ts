import {
  createEvidenceContentHash,
  createEvidenceRequestHash,
  normalizeEvidenceRequest,
} from '../src/services/evidence/normalization';
import {
  decideEvidenceAccess,
  mockAcquireEvidencePacket,
  recordEvidenceReuse,
  resolveAndReuse,
  expirePacketForFixture,
  authorizePayloadAccess,
} from '../src/services/evidence/cacheBroker';
import {
  InMemoryEvidenceRepository,
} from '../src/services/evidence/repository';
import { resetSingleFlightLocks, withSingleFlight } from '../src/services/evidence/singleFlight';
import {
  ingestHermesCandidates,
  MARKET_SWEEP_FIXTURE,
  equivalentEchoResolveRequest,
  parseHermesSubmission,
} from '../src/services/evidence/hermesAdapter';
import { resetEvidenceRepository } from '../src/services/evidence/repository';

const BASE_REQUEST = {
  providerId: 'example-provider',
  resourceClass: 'market_search',
  query: 'middle east oil export disruption',
  parameters: { date: '2026-08-19' },
  format: 'json',
  locale: 'en-US',
  jurisdiction: 'global',
};

function freshRepo(): InMemoryEvidenceRepository {
  resetEvidenceRepository();
  resetSingleFlightLocks();
  return new InMemoryEvidenceRepository();
}

describe('Evidence normalization + hashing', () => {
  it('produces stable hashes regardless of parameter key order', () => {
    const a = normalizeEvidenceRequest({
      ...BASE_REQUEST,
      parameters: { date: '2026-08-19', region: 'mena' },
    });
    const b = normalizeEvidenceRequest({
      ...BASE_REQUEST,
      parameters: { region: 'mena', date: '2026-08-19' },
    });
    expect(createEvidenceRequestHash(a)).toBe(createEvidenceRequestHash(b));
  });

  it('changes hash when material parameters differ', () => {
    const a = normalizeEvidenceRequest({
      ...BASE_REQUEST,
      parameters: { date: '2026-08-19' },
    });
    const b = normalizeEvidenceRequest({
      ...BASE_REQUEST,
      parameters: { date: '2026-08-18' },
    });
    expect(createEvidenceRequestHash(a)).not.toBe(createEvidenceRequestHash(b));
  });

  it('detects payload changes via content hash', () => {
    const h1 = createEvidenceContentHash({ value: 1 });
    const h2 = createEvidenceContentHash({ value: 2 });
    expect(h1).not.toBe(h2);
  });

  it('normalizes query case for stable request hashes', () => {
    const lower = normalizeEvidenceRequest({ ...BASE_REQUEST, query: 'middle east oil export disruption' });
    const upper = normalizeEvidenceRequest({ ...BASE_REQUEST, query: 'MIDDLE EAST OIL EXPORT DISRUPTION' });
    expect(createEvidenceRequestHash(lower)).toBe(createEvidenceRequestHash(upper));
  });
});

describe('Evidence cache decisions', () => {
  it('returns FRESH_HIT for equivalent fresh packet', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'Middle East oil export disruption',
        observation: 'Elevated quotes',
        source: {
          providerId: 'example-provider',
          acquiredAt: new Date().toISOString(),
        },
        payload: { n: 1 },
        acquisition: {
          acquiredByAgent: 'HERMES',
          acquisitionMode: 'MOCK_X402',
          price: { amount: '0.05', currency: 'USDC' },
          paymentReference: 'mock:test',
        },
      },
      repo,
    );

    const decision = await decideEvidenceAccess(
      {
        requesterAgent: 'ECHO',
        purpose: 'world_anomaly_digest',
        independentWitnessRequired: false,
        request: BASE_REQUEST,
      },
      repo,
    );

    expect(decision.decision).toBe('FRESH_HIT');
    expect(decision.packet?.packetId).toBe(packet.packetId);
    expect(decision.requiresPayment).toBe(false);
  });

  it('returns REVALIDATE when packet is stale for current query', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    await expirePacketForFixture(packet.packetId, repo);
    const decision = await decideEvidenceAccess(
      {
        requesterAgent: 'ECHO',
        purpose: 'current',
        independentWitnessRequired: false,
        historicalOnly: false,
        request: BASE_REQUEST,
      },
      repo,
    );
    expect(decision.decision).toBe('REVALIDATE');
  });

  it('returns STALE_ALLOWED for historical reuse', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    await expirePacketForFixture(packet.packetId, repo);
    const decision = await decideEvidenceAccess(
      {
        requesterAgent: 'ECHO',
        purpose: 'historical',
        independentWitnessRequired: false,
        historicalOnly: true,
        request: BASE_REQUEST,
      },
      repo,
    );
    expect(decision.decision).toBe('STALE_ALLOWED');
  });

  it('returns LICENSE_DENIED when federation reuse is forbidden', async () => {
    const licensedRequest = {
      ...BASE_REQUEST,
      licenseScope: {
        cacheAllowed: true,
        internalReuse: true,
        federationReuse: false,
        publicPayload: true,
        publicProvenance: true,
        derivativeSummary: true,
      },
    };
    const repo = freshRepo();
    await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(licensedRequest),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    const decision = await decideEvidenceAccess(
      {
        requesterAgent: 'ECHO',
        purpose: 'test',
        independentWitnessRequired: false,
        request: licensedRequest,
      },
      repo,
    );
    expect(decision.decision).toBe('LICENSE_DENIED');
  });

  it('allows acquiring agent to reuse when federation reuse is forbidden', async () => {
    const licensedRequest = {
      ...BASE_REQUEST,
      licenseScope: {
        cacheAllowed: true,
        internalReuse: true,
        federationReuse: false,
        publicPayload: true,
        publicProvenance: true,
        derivativeSummary: true,
      },
    };
    const repo = freshRepo();
    await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(licensedRequest),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    const decision = await decideEvidenceAccess(
      {
        requesterAgent: 'HERMES',
        purpose: 'test',
        independentWitnessRequired: false,
        request: licensedRequest,
      },
      repo,
    );
    expect(decision.decision).toBe('FRESH_HIT');
  });

  it('returns INDEPENDENT_SOURCE_REQUIRED when corroboration requested', async () => {
    const repo = freshRepo();
    await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    const decision = await decideEvidenceAccess(
      {
        requesterAgent: 'ZEUS',
        purpose: 'corroboration',
        independentWitnessRequired: true,
        request: BASE_REQUEST,
      },
      repo,
    );
    expect(decision.decision).toBe('INDEPENDENT_SOURCE_REQUIRED');
  });
});

describe('Evidence reuse authorization', () => {
  it('rejects direct reuse of stale packets without historicalOnly', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    await expirePacketForFixture(packet.packetId, repo);
    const decision = await recordEvidenceReuse({
      packetId: packet.packetId,
      consumerAgent: 'ECHO',
      purpose: 'current',
      historicalOnly: false,
      repo,
    });
    expect(decision.decision).toBe('REVALIDATE');
    expect(await repo.listReuseEvents(packet.packetId)).toHaveLength(0);
  });

  it('records historical reuse through resolve-reuse for stale packets', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    await expirePacketForFixture(packet.packetId, repo);
    const decision = await resolveAndReuse(
      {
        requesterAgent: 'ECHO',
        purpose: 'historical',
        independentWitnessRequired: false,
        historicalOnly: true,
        request: BASE_REQUEST,
      },
      repo,
    );
    expect(decision.decision).toBe('STALE_ALLOWED');
    expect(await repo.listReuseEvents(packet.packetId)).toHaveLength(1);
  });

  it('increments version when refreshing a stale packet', async () => {
    const repo = freshRepo();
    const first = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs v1',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: { version: 1 },
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    await expirePacketForFixture(first.packetId, repo);
    const second = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs v2',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: { version: 2 },
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    expect(second.version).toBe(2);
    expect(second.predecessorPacketId).toBe(first.packetId);
    expect(second.packetId).not.toBe(first.packetId);
  });

  it('honors preferred packet id on first acquisition', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: {},
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
        preferredPacketId: 'MOB-EVID-C408-CUSTOM',
      },
      repo,
    );
    expect(packet.packetId).toBe('MOB-EVID-C408-CUSTOM');
  });

  it('denies stale payload reads without historicalOnly', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: { secret: true },
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    await expirePacketForFixture(packet.packetId, repo);
    const stale = await repo.findByPacketId(packet.packetId);
    const access = authorizePayloadAccess(stale!, {
      requesterAgent: 'ECHO',
      purpose: 'current',
    });
    expect(access.decision).toBe('REVALIDATE');
  });

  it('records reuse lineage on authorized fresh payload read', async () => {
    const repo = freshRepo();
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        payload: { value: 42 },
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'FREE' },
      },
      repo,
    );
    const access = authorizePayloadAccess(packet, {
      requesterAgent: 'ECHO',
      purpose: 'world_anomaly_digest',
    });
    expect(access.decision).toBe('FRESH_HIT');
    await recordEvidenceReuse({
      packetId: packet.packetId,
      consumerAgent: 'ECHO',
      purpose: 'world_anomaly_digest',
      repo,
    });
    const events = await repo.listReuseEvents(packet.packetId);
    expect(events).toHaveLength(1);
    expect(repo.getPayload(packet.packetId)).toEqual({ value: 42 });
  });
});

describe('HERMES candidate ingestion', () => {
  it('rejects mixed inference as corroborated observation', () => {
    expect(() =>
      parseHermesSubmission({
        producer: 'HERMES',
        runId: 'run-1',
        observations: [
          {
            subject: 'x',
            observation: 'y',
            claimClass: 'CORROBORATED',
            source: { providerId: 'p', acquiredAt: new Date().toISOString() },
          },
        ],
        inferences: [],
        recommendations: [],
        sources: [],
      }),
    ).toThrow(/CORROBORATED/);
  });

  it('dedupes candidate submissions by producer run and hash', async () => {
    const repo = freshRepo();
    const first = await ingestHermesCandidates(MARKET_SWEEP_FIXTURE, repo);
    const second = await ingestHermesCandidates(MARKET_SWEEP_FIXTURE, repo);
    expect(first.accepted).toHaveLength(1);
    expect(second.skipped).toHaveLength(1);
  });
});

describe('Single-flight acquisition', () => {
  it('stores one packet for concurrent identical requests', async () => {
    const repo = freshRepo();
    let acquisitions = 0;
    const hash = createEvidenceRequestHash(normalizeEvidenceRequest(BASE_REQUEST));
    const leader = async () => {
      acquisitions += 1;
      await new Promise((r) => setTimeout(r, 20));
      const packetId = repo.nextPacketId();
      const packet = {
        packetId,
        version: 1,
        requestHash: hash,
        contentHash: createEvidenceContentHash({ concurrent: true }),
        normalizedQuery: 'test',
        claimClass: 'OBSERVED' as const,
        subject: 'subject',
        observation: 'obs',
        source: { providerId: 'example-provider', acquiredAt: new Date().toISOString() },
        acquisition: { acquiredByAgent: 'HERMES', acquisitionMode: 'MOCK_X402' as const },
        license: {
          cacheAllowed: true,
          internalReuse: true,
          federationReuse: true,
          publicPayload: true,
          publicProvenance: true,
          derivativeSummary: true,
        },
        visibility: 'FEDERATION_SHARED' as const,
        freshness: {
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 86400000).toISOString(),
          status: 'FRESH' as const,
        },
        verification: {
          status: 'PROVISIONAL' as const,
          uniquePacketCount: 1,
          independentSourceCount: 1,
          conflicts: [] as string[],
        },
        createdAt: new Date().toISOString(),
      };
      await repo.insertPacket(packet, { concurrent: true });
      return packet;
    };
    const [a, b, c] = await Promise.all([
      withSingleFlight(hash, 5000, leader),
      withSingleFlight(hash, 5000, leader),
      withSingleFlight(hash, 5000, leader),
    ]);
    expect(acquisitions).toBe(1);
    expect(a.result.packetId).toBe(b.result.packetId);
    expect(b.result.packetId).toBe(c.result.packetId);
  }, 10000);
});

describe('Acceptance scenario — HERMES acquire, ECHO reuse', () => {
  it('completes market sweep story', async () => {
    const repo = freshRepo();
    await ingestHermesCandidates(MARKET_SWEEP_FIXTURE, repo);
    const observation = MARKET_SWEEP_FIXTURE.observations[0];
    const packet = await mockAcquireEvidencePacket(
      {
        request: normalizeEvidenceRequest(BASE_REQUEST),
        acquiredByAgent: 'HERMES',
        subject: observation.subject,
        observation: observation.observation,
        source: observation.source,
        payload: { observation: observation.observation },
        acquisition: {
          acquiredByAgent: 'HERMES',
          acquisitionMode: 'MOCK_X402',
          price: { amount: '0.05', currency: 'USDC' },
          paymentReference: 'mock:acceptance',
        },
      },
      repo,
    );

    const echoDecision = await decideEvidenceAccess(equivalentEchoResolveRequest(), repo);
    expect(echoDecision.decision).toBe('FRESH_HIT');

    await recordEvidenceReuse({
      packetId: packet.packetId,
      consumerAgent: 'ECHO',
      purpose: 'world_anomaly_digest',
      repo,
    });

    const events = await repo.listReuseEvents(packet.packetId);
    expect(events).toHaveLength(1);
    expect(events[0].consumerAgent).toBe('ECHO');
    expect(events[0].additionalPayment.amount).toBe('0');

    await expirePacketForFixture(packet.packetId, repo);
    const revalidate = await decideEvidenceAccess(equivalentEchoResolveRequest(), repo);
    expect(revalidate.decision).toBe('REVALIDATE');

    const original = await repo.findByPacketId(packet.packetId);
    expect(original?.observation).toBe(observation.observation);
  });
});
