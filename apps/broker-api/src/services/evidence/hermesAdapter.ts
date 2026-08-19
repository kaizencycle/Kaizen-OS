import { createHash } from 'crypto';
import type { EvidencePacket, HermesCandidateSubmission } from './types';
import {
  DEFAULT_FEDERATION_LICENSE,
  HermesCandidateSubmissionSchema,
} from './types';
import {
  buildNormalizedQueryLabel,
  createEvidenceContentHash,
  createEvidenceRequestHash,
  normalizeEvidenceRequest,
} from './normalization';
import type { EvidenceRepository } from './repository';
import { defaultVisibilityFor } from './licensePolicy';

export function parseHermesSubmission(input: unknown): HermesCandidateSubmission {
  const parsed = HermesCandidateSubmissionSchema.parse(input);
  if (parsed.inferences.length > 0 || parsed.recommendations.length > 0) {
    // Inferences/recommendations are journal material — allowed in payload but not promoted.
  }
  for (const obs of parsed.observations) {
    if (obs.claimClass === 'INFERRED' || obs.claimClass === 'CORROBORATED') {
      throw new Error('HERMES cannot submit INFERRED or CORROBORATED claim classes.');
    }
  }
  return parsed;
}

export function candidateIdempotencyKey(
  producer: string,
  runId: string,
  observation: HermesCandidateSubmission['observations'][number],
): string {
  const hash = createHash('sha256')
    .update(
      JSON.stringify({
        producer,
        runId,
        subject: observation.subject,
        observation: observation.observation,
        providerId: observation.source.providerId,
      }),
      'utf8',
    )
    .digest('hex');
  return `${producer}:${runId}:${hash.slice(0, 16)}`;
}

export function observationToCandidatePacketDraft(input: {
  submission: HermesCandidateSubmission;
  observation: HermesCandidateSubmission['observations'][number];
  resourceClass?: string;
  parameters?: Record<string, string | number | boolean | null>;
}): {
  requestHash: string;
  normalizedQuery: string;
  subject: string;
  observation: string;
  contentHash: string;
  license: typeof DEFAULT_FEDERATION_LICENSE;
  visibility: ReturnType<typeof defaultVisibilityFor>;
} {
  const normalized = normalizeEvidenceRequest({
    providerId: input.observation.source.providerId,
    resourceClass: input.resourceClass ?? 'hermes_observation',
    query: input.observation.subject,
    parameters: input.parameters ?? { runId: input.submission.runId },
    format: 'json',
    locale: 'en-us',
    jurisdiction: input.observation.source.location?.jurisdiction ?? 'global',
    licenseScope: input.observation.license ?? DEFAULT_FEDERATION_LICENSE,
  });
  const payload = {
    observation: input.observation.observation,
    runId: input.submission.runId,
    producer: input.submission.producer,
  };
  return {
    requestHash: createEvidenceRequestHash(normalized),
    normalizedQuery: buildNormalizedQueryLabel(normalized),
    subject: input.observation.subject,
    observation: input.observation.observation,
    contentHash: createEvidenceContentHash(payload),
    license: input.observation.license ?? DEFAULT_FEDERATION_LICENSE,
    visibility: defaultVisibilityFor(input.observation.visibility),
  };
}

export async function ingestHermesCandidates(
  input: unknown,
  repo: EvidenceRepository,
): Promise<{ accepted: string[]; skipped: string[]; errors: string[] }> {
  const submission = parseHermesSubmission(input);
  const accepted: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const observation of submission.observations) {
    try {
      const key = candidateIdempotencyKey(submission.producer, submission.runId, observation);
      const existingId = await repo.findCandidateIdempotency(key);
      if (existingId) {
        skipped.push(existingId);
        continue;
      }
      const draft = observationToCandidatePacketDraft({ submission, observation });
      accepted.push(draft.requestHash);
      await repo.recordCandidateIdempotency(key, draft.requestHash);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return { accepted, skipped, errors };
}

/** Market sweep fixture for acceptance scenario */
export const MARKET_SWEEP_FIXTURE: HermesCandidateSubmission = {
  producer: 'HERMES',
  runId: 'HERMES-C408-MARKET-SWEEP',
  observations: [
    {
      subject: 'Middle East oil export disruption',
      observation: 'Elevated shipping insurance quotes reported across Hormuz-adjacent lanes.',
      claimClass: 'OBSERVED',
      source: {
        providerId: 'example-provider',
        sourceUrl: 'https://example.invalid/market/hormuz',
        acquiredAt: new Date().toISOString(),
        eventTime: '2026-08-19T00:00:00.000Z',
        location: { jurisdiction: 'global' },
      },
    },
  ],
  inferences: [
    { note: 'Possible supply compression if transit fees persist — journal only' },
  ],
  recommendations: [],
  sources: [{ id: 'example-provider', type: 'market_feed' }],
};

export function equivalentEchoResolveRequest() {
  return {
    requesterAgent: 'ECHO',
    purpose: 'world_anomaly_digest',
    independentWitnessRequired: false,
    historicalOnly: false,
    request: {
      providerId: 'example-provider',
      resourceClass: 'market_search',
      query: 'middle east oil export disruption',
      parameters: { date: '2026-08-19' },
      format: 'json',
      locale: 'en-US',
      jurisdiction: 'global',
    },
  };
}

export type { EvidencePacket };
