import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  decideEvidenceAccess,
  mockAcquireEvidencePacket,
  recordEvidenceReuse,
  resolveAndReuse,
  summarizePacket,
} from '../../services/evidence/cacheBroker';
import { ingestHermesCandidates, MARKET_SWEEP_FIXTURE } from '../../services/evidence/hermesAdapter';
import {
  getEvidenceRepository,
  type InMemoryEvidenceRepository,
} from '../../services/evidence/repository';
import { publicMetadataOnly, canReusePayload } from '../../services/evidence/licensePolicy';
import {
  EvidenceResolveInputSchema,
  HermesCandidateSubmissionSchema,
  NormalizedEvidenceRequestSchema,
} from '../../services/evidence/types';
import { normalizeEvidenceRequest } from '../../services/evidence/normalization';

export const evidenceRouter = Router();

const MockAcquireSchema = z.object({
  request: NormalizedEvidenceRequestSchema,
  acquiredByAgent: z.string().min(1),
  subject: z.string().min(1),
  observation: z.string().min(1),
  source: z.object({
    providerId: z.string().min(1),
    sourceUrl: z.string().optional(),
    sourceRecordId: z.string().optional(),
    publisherId: z.string().optional(),
    acquiredAt: z.string().datetime(),
    eventTime: z.string().datetime().nullable().optional(),
    reportingTime: z.string().datetime().nullable().optional(),
  }),
  payload: z.unknown(),
  acquisition: z.object({
    acquiredByAgent: z.string().min(1),
    acquisitionMode: z.enum(['FREE', 'MANUAL_RECEIPT', 'MOCK_X402']),
    price: z
      .object({
        amount: z.string(),
        currency: z.string(),
        network: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    paymentReference: z.string().nullable().optional(),
  }),
  ttlHours: z.number().positive().optional(),
});

const ReuseSchema = z.object({
  consumerAgent: z.string().min(1),
  purpose: z.string().min(1),
  historicalOnly: z.boolean().optional(),
  operatorScope: z.string().nullable().optional(),
});

function handleError(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ ok: false, error: 'validation_failed', details: err.flatten() });
    return;
  }
  if (err instanceof Error && err.message.includes('HERMES cannot')) {
    res.status(400).json({ ok: false, error: err.message });
    return;
  }
  next(err);
}

evidenceRouter.post('/resolve', async (req, res, next) => {
  try {
    const input = EvidenceResolveInputSchema.parse(req.body);
    const decision = await decideEvidenceAccess(input);
    res.json({
      ok: true,
      decision: decision.decision,
      requiresPayment: decision.requiresPayment,
      reason: decision.reason,
      packet: decision.packet
        ? publicMetadataOnly(decision.packet)
        : undefined,
    });
  } catch (err) {
    handleError(err, req, res, next);
  }
});

evidenceRouter.post('/resolve-reuse', async (req, res, next) => {
  try {
    const input = EvidenceResolveInputSchema.parse(req.body);
    const decision = await resolveAndReuse(input);
    res.json({
      ok: true,
      decision: decision.decision,
      requiresPayment: decision.requiresPayment,
      reason: decision.reason,
      packet: decision.packet ? publicMetadataOnly(decision.packet) : undefined,
    });
  } catch (err) {
    handleError(err, req, res, next);
  }
});

evidenceRouter.post('/candidates', async (req, res, next) => {
  try {
    HermesCandidateSubmissionSchema.parse(req.body);
    const repo = getEvidenceRepository();
    const result = await ingestHermesCandidates(req.body, repo);
    res.status(result.errors.length > 0 && result.accepted.length === 0 ? 400 : 200).json({
      ok: result.errors.length === 0,
      ...result,
    });
  } catch (err) {
    handleError(err, req, res, next);
  }
});

evidenceRouter.post('/packets/:packetId/mock-acquire', async (req, res, next) => {
  try {
    const body = MockAcquireSchema.parse(req.body);
    const packet = await mockAcquireEvidencePacket({
      request: normalizeEvidenceRequest(body.request),
      acquiredByAgent: body.acquiredByAgent,
      subject: body.subject,
      observation: body.observation,
      source: body.source,
      payload: body.payload,
      acquisition: {
        ...body.acquisition,
        acquiredByAgent: body.acquisition.acquiredByAgent,
      },
      ttlHours: body.ttlHours,
      preferredPacketId: req.params.packetId,
    });
    res.status(201).json({
      ok: true,
      simulated: body.acquisition.acquisitionMode === 'MOCK_X402',
      packet,
    });
  } catch (err) {
    handleError(err, req, res, next);
  }
});

evidenceRouter.post('/packets/:packetId/reuse', async (req, res, next) => {
  try {
    const body = ReuseSchema.parse(req.body);
    const decision = await recordEvidenceReuse({
      packetId: req.params.packetId,
      consumerAgent: body.consumerAgent,
      purpose: body.purpose,
      historicalOnly: body.historicalOnly,
      operatorScope: body.operatorScope,
    });
    res.json({
      ok: decision.decision === 'FRESH_HIT' || decision.decision === 'STALE_ALLOWED',
      decision: decision.decision,
      requiresPayment: decision.requiresPayment,
      reason: decision.reason,
      packet: decision.packet ? publicMetadataOnly(decision.packet) : undefined,
    });
  } catch (err) {
    handleError(err, req, res, next);
  }
});

evidenceRouter.get('/packets/:packetId', async (req, res, next) => {
  try {
    const repo = getEvidenceRepository();
    const includePayload = req.query.includePayload === 'true';
    const requesterAgent =
      typeof req.query.requesterAgent === 'string' ? req.query.requesterAgent.trim() : '';
    const purpose = typeof req.query.purpose === 'string' ? req.query.purpose.trim() : '';
    const packet = await repo.findByPacketId(req.params.packetId);
    if (!packet) {
      res.status(404).json({ ok: false, error: 'packet_not_found' });
      return;
    }
    const reuseAuth =
      requesterAgent && purpose
        ? canReusePayload(packet, requesterAgent, purpose)
        : { allowed: false, reason: 'requesterAgent and purpose required for authorized payload access' };
    const mayReadPayload =
      includePayload &&
      (packet.license.publicPayload || reuseAuth.allowed);
    const reuseEvents = await repo.listReuseEvents(packet.packetId);
    const summary = summarizePacket(packet, reuseEvents);
    const memRepo = repo as InMemoryEvidenceRepository;
    const payload = mayReadPayload ? memRepo.getPayload?.(packet.packetId) : undefined;
    res.json({
      ok: true,
      packet:
        includePayload && mayReadPayload ? packet : publicMetadataOnly(packet),
      payload,
      reuseEvents,
      summary,
    });
  } catch (err) {
    next(err);
  }
});

evidenceRouter.get('/packets', async (req, res, next) => {
  try {
    const repo = getEvidenceRepository();
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const packets = await repo.listPackets(limit);
    const enriched = await Promise.all(
      packets.map(async (packet) => {
        const reuseEvents = await repo.listReuseEvents(packet.packetId);
        return {
          ...publicMetadataOnly(packet),
          summary: summarizePacket(packet, reuseEvents),
        };
      }),
    );
    res.json({ ok: true, packets: enriched, count: enriched.length });
  } catch (err) {
    next(err);
  }
});

evidenceRouter.post('/demo/market-sweep-fixture', async (_req, res, next) => {
  try {
    const repo = getEvidenceRepository();
    await ingestHermesCandidates(MARKET_SWEEP_FIXTURE, repo);
    const observation = MARKET_SWEEP_FIXTURE.observations[0];
    const packet = await mockAcquireEvidencePacket({
      request: normalizeEvidenceRequest({
        providerId: 'example-provider',
        resourceClass: 'market_search',
        query: 'middle east oil export disruption',
        parameters: { date: '2026-08-19' },
        format: 'json',
        locale: 'en-US',
        jurisdiction: 'global',
      }),
      acquiredByAgent: 'HERMES',
      subject: observation.subject,
      observation: observation.observation,
      source: observation.source,
      payload: { observation: observation.observation, fixture: true },
      acquisition: {
        acquiredByAgent: 'HERMES',
        acquisitionMode: 'MOCK_X402',
        price: { amount: '0.05', currency: 'USDC', network: null },
        paymentReference: `mock:${Date.now()}`,
      },
    }, repo);
    res.status(201).json({ ok: true, packet, fixture: 'MARKET_SWEEP' });
  } catch (err) {
    next(err);
  }
});
