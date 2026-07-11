import { classifySources, inferShardStatus } from './classify.js';
import { resolveCycleBundle } from './fixtures/c368.js';
import {
  GENERATOR_VERSION,
  allocateShardId,
  computeSourceRootHash,
  normalizeCycleSegment,
} from './provenance.js';
import type { CycleShardBundle, EveReserveShard, GenerateShardOptions } from './types.js';

function defaultBundleForCycle(cycle: string): CycleShardBundle {
  const normalized = normalizeCycleSegment(cycle);
  return {
    cycle: normalized,
    repositories: ['kaizencycle/Mobius-Substrate'],
    epicon_ids: [],
    intent: {
      original: `Cycle ${normalized} intent not yet indexed in eve-shard-core fixtures.`,
      final: `Awaiting explicit EPICON bundle for ${normalized}.`,
      drift_detected: false,
      drift_notes: [],
    },
    sources: [],
    consequential_actions: [],
    ethical_assessment: {
      affected_parties: ['Federation operators'],
      rights_or_values: ['integrity', 'transparency'],
      improvements: [],
      risks: ['Insufficient source material for compression'],
      mitigations: ['Attach explicit EPICON bundle before proposal'],
      unresolved_concerns: [`No fixture bundle for ${normalized}`],
    },
    uncertainties: [
      {
        claim: `Cycle ${normalized} EPICON set is complete`,
        reason: 'No indexed bundle in compiler fixtures',
        required_verification: 'Provide explicit epicon_ids and source refs',
      },
    ],
    omissions: {
      policy: 'No consequential actions compressed without indexed sources',
      declared_categories: ['unindexed cycle events'],
    },
    cycle_outcome: {
      completed: [],
      pending: [`Index ${normalized} EPICON sources`],
      failed: [],
      remediated: [],
    },
    seal_recommendation: {
      recommendation: 'do_not_seal',
      proposed_tier: 'EP-3',
      rationale: 'Compiler lacks indexed sources for this cycle.',
    },
    dissent: {
      present: false,
      records: [],
    },
  };
}

export function compressCycleBundle(
  options: GenerateShardOptions,
): EveReserveShard {
  const cycle = normalizeCycleSegment(options.cycle);
  const bundle = resolveCycleBundle(cycle, options.bundle) ?? defaultBundleForCycle(cycle);
  const sourceStatus = classifySources(bundle.sources);
  const shardStatus = inferShardStatus(sourceStatus);
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const shardSequence = options.shardSequence ?? 1;

  return {
    schema_version: '0.1',
    shard: {
      id: allocateShardId(cycle, shardSequence),
      cycle,
      status: shardStatus,
      generated_by: 'EVE',
      generated_at: generatedAt,
    },
    scope: {
      repositories: [...bundle.repositories],
      epicon_ids: [...bundle.epicon_ids],
      time_window: bundle.time_window,
    },
    source_status: sourceStatus,
    intent: {
      original: bundle.intent.original,
      final: bundle.intent.final,
      drift_detected: bundle.intent.drift_detected,
      drift_notes: bundle.intent.drift_notes ?? [],
    },
    consequential_actions: bundle.consequential_actions.map((action: CycleShardBundle['consequential_actions'][number]) => ({ ...action })),
    ethical_assessment: {
      affected_parties: [...bundle.ethical_assessment.affected_parties],
      rights_or_values: [...bundle.ethical_assessment.rights_or_values],
      improvements: [...bundle.ethical_assessment.improvements],
      risks: [...bundle.ethical_assessment.risks],
      mitigations: [...bundle.ethical_assessment.mitigations],
      unresolved_concerns: [...bundle.ethical_assessment.unresolved_concerns],
    },
    dissent: {
      present: bundle.dissent?.present ?? false,
      records: bundle.dissent?.records ? [...bundle.dissent.records] : [],
    },
    uncertainties: bundle.uncertainties.map((item: CycleShardBundle['uncertainties'][number]) => ({ ...item })),
    omissions: {
      policy: bundle.omissions.policy,
      declared_categories: [...bundle.omissions.declared_categories],
    },
    cycle_outcome: {
      completed: [...bundle.cycle_outcome.completed],
      pending: [...bundle.cycle_outcome.pending],
      failed: [...bundle.cycle_outcome.failed],
      remediated: [...bundle.cycle_outcome.remediated],
    },
    seal_recommendation: {
      recommendation: bundle.seal_recommendation.recommendation,
      proposed_tier: bundle.seal_recommendation.proposed_tier,
      rationale: bundle.seal_recommendation.rationale,
      human_review_required: true,
    },
    verification: {
      atlas: 'pending',
      zeus: 'pending',
      aurea: 'pending',
      jade: 'pending',
      human: 'pending',
    },
    provenance: {
      manifest_hash: '',
      source_root_hash: computeSourceRootHash(cycle, bundle.sources),
      generator_version: options.generatorVersion ?? GENERATOR_VERSION,
    },
    pipeline_status: {
      seal_status: 'not_requested',
      ledger_status: 'not_ingested',
    },
  };
}
