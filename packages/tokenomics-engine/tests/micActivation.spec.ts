import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { runMicActivationPipeline } from '../src/micActivation';
import type { NodeActivity } from '../src/schema';
import { evaluateFountainEligibility, applyFountainEvaluation } from '../src/fountain';
import { defaultMicReadinessState } from '../src/readiness';

describe('evaluateFountainEligibility', () => {
  it('is true only when all gates pass', () => {
    const ok = defaultMicReadinessState({
      gi: 0.98,
      mintThresholdGi: 0.95,
      reserve: { trancheStatus: 'sealed', inProgressBalance: 0, trancheTarget: 50, sealedReserveTotal: 50 },
      sustain: { consecutiveEligibleCycles: 5, requiredCycles: 5, status: 'satisfied' },
      replay: { status: 'clear', replayPressure: 0, repeatedContentCount: 0 },
      quorum: {
        required: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        optional: ['EVE'],
        attested: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        status: 'satisfied'
      }
    });
    expect(evaluateFountainEligibility(ok)).toBe(true);

    const bad = defaultMicReadinessState({
      gi: 0.98,
      reserve: { trancheStatus: 'in_progress', inProgressBalance: 10, trancheTarget: 50, sealedReserveTotal: 0 },
      sustain: { status: 'satisfied', consecutiveEligibleCycles: 5, requiredCycles: 5 }
    });
    expect(evaluateFountainEligibility(bad)).toBe(false);
  });
});

describe('applyFountainEvaluation', () => {
  it('sets eligible when evaluate returns true', () => {
    const s = defaultMicReadinessState({
      gi: 0.98,
      mintThresholdGi: 0.95,
      reserve: { trancheStatus: 'sealed', inProgressBalance: 0, trancheTarget: 50, sealedReserveTotal: 50 },
      sustain: { consecutiveEligibleCycles: 5, requiredCycles: 5, status: 'satisfied' },
      quorum: {
        required: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        optional: [],
        attested: ['ZEUS', 'ATLAS', 'JADE', 'HERMES'],
        status: 'satisfied'
      }
    });
    const out = applyFountainEvaluation(s);
    expect(out.fountain.eligible).toBe(true);
    expect(out.fountain.locked).toBe(false);
    expect(out.mintReadiness).toBe('fountain_ready');
  });
});

describe('runMicActivationPipeline', () => {
  const hiActivity = (): NodeActivity => ({
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
  });

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: async () => ''
        } as Response)
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.MIC_SUSTAIN_CYCLES;
    delete process.env.MIC_QUORUM_ATTESTED;
    delete process.env.MIC_GENESIS_MINT;
  });

  it('POSTs seal, readiness, and genesis when env gates allow', async () => {
    process.env.MIC_SUSTAIN_CYCLES = '5';
    process.env.MIC_QUORUM_ATTESTED = 'ZEUS,ATLAS,JADE,HERMES';
    process.env.MIC_GENESIS_MINT = '1';

    await runMicActivationPipeline([hiActivity()], { cycle: 'C-285', mintThresholdGi: 0.95 });

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0] as string);
    expect(calls.some((u) => u.includes('/mic/seal'))).toBe(true);
    expect(calls.some((u) => u.includes('/mic/readiness'))).toBe(true);
    expect(calls.some((u) => u.includes('/mic/mint/genesis'))).toBe(true);
  });

  it('does not POST genesis when MIC_GENESIS_MINT is unset', async () => {
    process.env.MIC_SUSTAIN_CYCLES = '5';
    process.env.MIC_QUORUM_ATTESTED = 'ZEUS,ATLAS,JADE,HERMES';

    await runMicActivationPipeline([hiActivity()]);

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0] as string);
    expect(calls.some((u) => u.includes('/mic/mint/genesis'))).toBe(false);
  });
});
