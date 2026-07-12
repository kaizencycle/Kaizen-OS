import { describe, expect, it } from 'vitest';

import {
  computeSourceRootHash,
  generateShard,
  generateShardDeterministic,
  validateProposal,
} from '../src/index.js';

describe('eve-shard-core', () => {
  it('produces deterministic source_root_hash for the same cycle', () => {
    const left = generateShardDeterministic('C-368', '2026-07-11T00:00:00Z');
    const right = generateShardDeterministic('C-368', '2026-07-11T12:00:00Z');

    expect(left.provenance.source_root_hash).toBe(right.provenance.source_root_hash);
    expect(left.shard.generated_at).not.toBe(right.shard.generated_at);
  });

  it('never emits sealed proposal state', () => {
    const shard = generateShard({ cycle: 'C-368' });
    const validation = validateProposal(shard);

    expect(shard.shard.status).not.toBe('sealed');
    expect(shard.pipeline_status.seal_status).toBe('not_requested');
    expect(shard.seal_recommendation.human_review_required).toBe(true);
    expect(validation.ok).toBe(true);
  });

  it('validates against eve-reserve-shard schema', () => {
    const shard = generateShardDeterministic('C-368');
    const validation = validateProposal(shard);
    expect(validation.ok).toBe(true);
  });

  it('declares omissions explicitly', () => {
    const shard = generateShardDeterministic('C-368');
    expect(shard.omissions.declared_categories.length).toBeGreaterThan(0);
    expect(shard.omissions.policy.length).toBeGreaterThan(0);
  });

  it('requires at least one uncertainty', () => {
    const shard = generateShardDeterministic('C-368');
    expect(shard.uncertainties.length).toBeGreaterThanOrEqual(1);
  });

  it('computes stable source_root_hash from canonical source ordering', () => {
    const sources = [
      {
        epicon_id: 'EPICON_B',
        declared: true,
        repository_preserved: true,
        ledger_ingested: null,
        sealed: false,
        cold_canon_exported: false,
        source_refs: ['b'],
      },
      {
        epicon_id: 'EPICON_A',
        declared: true,
        repository_preserved: true,
        ledger_ingested: null,
        sealed: false,
        cold_canon_exported: false,
        source_refs: ['a'],
      },
    ];

    const forward = computeSourceRootHash('C-368', sources);
    const reverse = computeSourceRootHash('C-368', [...sources].reverse());
    expect(forward).toBe(reverse);
    expect(forward.startsWith('sha256:')).toBe(true);
  });
});
