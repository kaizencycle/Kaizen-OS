export { classifySources, inferShardStatus } from './classify.js';
export type { SourceStatusSummary } from './classify.js';
export { compressCycleBundle } from './compress.js';
export { C368_BUNDLE, listKnownCycles, resolveCycleBundle } from './fixtures/c368.js';
export { generateShard, generateShardDeterministic } from './generate.js';
export {
  GENERATOR_VERSION,
  allocateShardId,
  computeSourceRootHash,
  normalizeCycleSegment,
} from './provenance.js';
export type {
  ConsequentialActionInput,
  ConsequentialActionStatus,
  CycleShardBundle,
  EpiconSourceRecord,
  EveReserveShard,
  GenerateShardOptions,
  ReviewAgent,
  ReviewVerdict,
  SealRecommendation,
  ShardPipelineStatus,
} from './types.js';
export {
  assertProposalSafe,
  validateProposal,
  validateShardDocument,
} from './validate.js';
export type { ValidationResult } from './validate.js';
