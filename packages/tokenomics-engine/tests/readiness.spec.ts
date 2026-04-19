import { describe, expect, it } from 'vitest';
import {
  buildReadinessFromActivities,
  countRequiredAttestations,
  defaultMicReadinessState,
  deriveMicReadiness,
  deriveQuorumStatus,
  withDerivedFields
} from '../src/readiness';
import type { NodeActivity } from '../src/schema';

describe('deriveQuorumStatus', () => {
  it('returns satisfied when all required are attested (case insensitive)', () => {
    expect(
      deriveQuorumStatus(['ZEUS', 'ATLAS'], ['zeus', 'atlas'])
    ).toBe('satisfied');
  });

  it('returns partial when some attested', () => {
    expect(deriveQuorumStatus(['ZEUS', 'ATLAS', 'JADE'], ['ZEUS'])).toBe('partial');
  });

  it('returns pending when none attested', () => {
    expect(deriveQuorumStatus(['ZEUS'], [])).toBe('pending');
  });
});

describe('countRequiredAttestations', () => {
  it('counts matches only', () => {
    expect(countRequiredAttestations(['ZEUS', 'HERMES'], ['ZEUS', 'EVE'])).toBe(1);
  });
});

describe('deriveMicReadiness', () => {
  it('returns not_eligible when GI below threshold', () => {
    const s = defaultMicReadinessState({ gi: 0.9, mintThresholdGi: 0.95 });
    expect(deriveMicReadiness(s)).toBe('not_eligible');
  });

  it('returns reserve_only when tranche still in progress', () => {
    const s = defaultMicReadinessState({
      gi: 0.96,
      mintThresholdGi: 0.95,
      reserve: { trancheStatus: 'in_progress', inProgressBalance: 12, trancheTarget: 50, sealedReserveTotal: 0 }
    });
    expect(deriveMicReadiness(s)).toBe('reserve_only');
  });

  it('returns seal_ready when sustain not satisfied', () => {
    const s = defaultMicReadinessState({
      gi: 0.96,
      reserve: { trancheStatus: 'eligible_for_seal', inProgressBalance: 50, trancheTarget: 50, sealedReserveTotal: 0 },
      sustain: { consecutiveEligibleCycles: 2, requiredCycles: 5, status: 'in_progress' }
    });
    expect(deriveMicReadiness(s)).toBe('seal_ready');
  });

  it('returns not_eligible when replay blocked after sustain gate', () => {
    const s = defaultMicReadinessState({
      gi: 0.96,
      reserve: { trancheStatus: 'sealed', inProgressBalance: 0, trancheTarget: 50, sealedReserveTotal: 50 },
      sustain: { consecutiveEligibleCycles: 5, requiredCycles: 5, status: 'satisfied' },
      replay: { status: 'blocked', replayPressure: 1, repeatedContentCount: 99 }
    });
    expect(deriveMicReadiness(s)).toBe('not_eligible');
  });

  it('returns quorum_pending when quorum partial', () => {
    const s = defaultMicReadinessState({
      gi: 0.96,
      reserve: { trancheStatus: 'sealed', inProgressBalance: 0, trancheTarget: 50, sealedReserveTotal: 50 },
      sustain: { consecutiveEligibleCycles: 5, requiredCycles: 5, status: 'satisfied' },
      replay: { status: 'clear', replayPressure: 0, repeatedContentCount: 0 },
      quorum: {
        required: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        optional: ['EVE'],
        attested: ['ZEUS', 'ATLAS'],
        status: 'partial'
      }
    });
    expect(deriveMicReadiness(s)).toBe('quorum_pending');
  });

  it('returns fountain_ready when all gates pass', () => {
    const s = defaultMicReadinessState({
      gi: 0.98,
      reserve: { trancheStatus: 'sealed', inProgressBalance: 0, trancheTarget: 50, sealedReserveTotal: 50 },
      sustain: { consecutiveEligibleCycles: 5, requiredCycles: 5, status: 'satisfied' },
      replay: { status: 'clear', replayPressure: 0, repeatedContentCount: 0 },
      quorum: {
        required: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        optional: ['EVE'],
        attested: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        status: 'satisfied'
      },
      fountain: { locked: false, eligible: true, unlocked: false }
    });
    expect(deriveMicReadiness(s)).toBe('fountain_ready');
  });
});

describe('buildReadinessFromActivities', () => {
  it('aggregates GI and marks eligible_for_seal when summed MIC proxy crosses tranche', () => {
    const hi: NodeActivity = {
      nodeId: 'n1',
      gi: 0.98,
      integrityWork: 100,
      humanIntent: 0,
      coordinationValue: 0,
      resilienceWork: 0,
      timestamp: new Date().toISOString(),
      sentinelCount: 3,
      isNewKnowledge: true,
      correctedDrift: true
    };
    const state = buildReadinessFromActivities([hi], { cycle: 'C-285', mintThresholdGi: 0.95 });
    expect(state.gi).toBe(0.98);
    expect(state.reserve.inProgressBalance).toBeGreaterThan(50);
    expect(state.reserve.trancheStatus).toBe('eligible_for_seal');
  });
});

describe('withDerivedFields', () => {
  it('derives quorum status and mintReadiness from attested list', () => {
    const raw = defaultMicReadinessState({
      gi: 0.98,
      reserve: { trancheStatus: 'sealed', inProgressBalance: 0, trancheTarget: 50, sealedReserveTotal: 50 },
      sustain: { consecutiveEligibleCycles: 5, requiredCycles: 5, status: 'satisfied' },
      replay: { status: 'clear', replayPressure: 0, repeatedContentCount: 0 },
      quorum: {
        required: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        optional: ['EVE'],
        attested: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        status: 'pending'
      },
      fountain: { locked: true, eligible: true, unlocked: false }
    });
    const out = withDerivedFields(raw);
    expect(out.quorum.status).toBe('satisfied');
    expect(out.mintReadiness).toBe('fountain_ready');
  });
});
