import { z } from 'zod';

export const EvidenceClaimClassSchema = z.enum([
  'OBSERVED',
  'REPORTED',
  'CORROBORATED',
  'DISPUTED',
  'INFERRED',
  'PREDICTED',
  'UNKNOWN',
]);

export const EvidenceCacheDecisionSchema = z.enum([
  'FRESH_HIT',
  'STALE_ALLOWED',
  'REVALIDATE',
  'NEW_ACQUISITION',
  'LICENSE_DENIED',
  'INDEPENDENT_SOURCE_REQUIRED',
]);

export const EvidenceVisibilitySchema = z.enum([
  'PUBLIC_COMMONS',
  'FEDERATION_SHARED',
  'PRIVATE_SCOPED',
]);

export const EvidenceLicenseScopeSchema = z.object({
  cacheAllowed: z.boolean(),
  internalReuse: z.boolean(),
  federationReuse: z.boolean(),
  publicPayload: z.boolean(),
  publicProvenance: z.boolean(),
  derivativeSummary: z.boolean(),
  expiresAt: z.string().nullable().optional(),
});

export const EvidenceSourceSchema = z.object({
  providerId: z.string().min(1),
  sourceUrl: z.string().optional(),
  sourceRecordId: z.string().optional(),
  publisherId: z.string().optional(),
  acquiredAt: z.string().datetime(),
  eventTime: z.string().datetime().nullable().optional(),
  reportingTime: z.string().datetime().nullable().optional(),
  location: z
    .object({
      label: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      jurisdiction: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export const EvidenceAcquisitionSchema = z.object({
  acquiredByAgent: z.string().min(1),
  humanPrincipalId: z.string().nullable().optional(),
  delegationPolicyId: z.string().nullable().optional(),
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
});

export const EvidencePacketSchema = z.object({
  packetId: z.string().min(1),
  version: z.number().int().positive(),
  requestHash: z.string().length(64),
  contentHash: z.string().length(64),
  normalizedQuery: z.string().min(1),
  claimClass: EvidenceClaimClassSchema,
  subject: z.string().min(1),
  observation: z.string().min(1),
  source: EvidenceSourceSchema,
  acquisition: EvidenceAcquisitionSchema,
  license: EvidenceLicenseScopeSchema,
  visibility: EvidenceVisibilitySchema,
  freshness: z.object({
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime().nullable().optional(),
    status: z.enum(['FRESH', 'STALE', 'SUPERSEDED', 'DISPUTED']),
  }),
  verification: z.object({
    status: z.enum(['PROVISIONAL', 'CORROBORATED', 'DISPUTED']),
    uniquePacketCount: z.number().int().nonnegative(),
    independentSourceCount: z.number().int().positive(),
    conflicts: z.array(z.string()),
  }),
  createdAt: z.string().datetime(),
  payloadRef: z.string().optional(),
  predecessorPacketId: z.string().nullable().optional(),
});

export const EvidenceReuseEventSchema = z.object({
  eventId: z.string().min(1),
  packetId: z.string().min(1),
  consumerAgent: z.string().min(1),
  operatorScope: z.string().nullable().optional(),
  purpose: z.string().min(1),
  accessMode: z.enum(['CACHE_REUSE', 'HISTORICAL_REUSE']),
  freshnessAtAccess: z.enum(['FRESH', 'STALE']),
  reusedAt: z.string().datetime(),
  additionalPayment: z.object({
    amount: z.literal('0'),
    currency: z.string(),
  }),
});

export const NormalizedEvidenceRequestSchema = z.object({
  providerId: z.string().min(1),
  resourceClass: z.string().min(1),
  query: z.string().min(1),
  parameters: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])),
  format: z.string().min(1),
  locale: z.string().min(1),
  jurisdiction: z.string().min(1),
  licenseScope: EvidenceLicenseScopeSchema.optional(),
});

export const EvidenceResolveInputSchema = z.object({
  requesterAgent: z.string().min(1),
  purpose: z.string().min(1),
  independentWitnessRequired: z.boolean().default(false),
  historicalOnly: z.boolean().optional().default(false),
  request: NormalizedEvidenceRequestSchema,
});

export const HermesCandidateSubmissionSchema = z.object({
  producer: z.literal('HERMES'),
  runId: z.string().min(1),
  observations: z.array(
    z.object({
      subject: z.string().min(1),
      observation: z.string().min(1),
      claimClass: EvidenceClaimClassSchema.optional(),
      source: EvidenceSourceSchema,
      license: EvidenceLicenseScopeSchema.optional(),
      visibility: EvidenceVisibilitySchema.optional(),
    }),
  ),
  inferences: z.array(z.record(z.unknown())).default([]),
  recommendations: z.array(z.record(z.unknown())).default([]),
  sources: z.array(z.record(z.unknown())).default([]),
});

export type EvidenceClaimClass = z.infer<typeof EvidenceClaimClassSchema>;
export type EvidenceCacheDecision = z.infer<typeof EvidenceCacheDecisionSchema>;
export type EvidenceVisibility = z.infer<typeof EvidenceVisibilitySchema>;
export type EvidenceLicenseScope = z.infer<typeof EvidenceLicenseScopeSchema>;
export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;
export type EvidenceAcquisition = z.infer<typeof EvidenceAcquisitionSchema>;
export type EvidencePacket = z.infer<typeof EvidencePacketSchema>;
export type EvidenceReuseEvent = z.infer<typeof EvidenceReuseEventSchema>;
export type NormalizedEvidenceRequest = z.infer<typeof NormalizedEvidenceRequestSchema>;
export type EvidenceResolveInput = z.infer<typeof EvidenceResolveInputSchema>;
export type EvidenceResolveParams = Omit<EvidenceResolveInput, 'historicalOnly'> & {
  historicalOnly?: boolean;
};
export type HermesCandidateSubmission = z.infer<typeof HermesCandidateSubmissionSchema>;

export interface EvidenceAccessDecision {
  decision: EvidenceCacheDecision;
  packet?: EvidencePacket;
  reason: string;
  requiresPayment: boolean;
}

export interface EvidencePacketSummary extends EvidencePacket {
  readerCount: number;
  reuseCount: number;
  totalPaidAmount?: string;
  totalPaidCurrency?: string;
}

export const DEFAULT_FEDERATION_LICENSE: EvidenceLicenseScope = {
  cacheAllowed: true,
  internalReuse: true,
  federationReuse: true,
  publicPayload: false,
  publicProvenance: true,
  derivativeSummary: true,
  expiresAt: null,
};
