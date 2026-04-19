import type { MicReadinessState } from './readiness';
import { postMicLedgerJsonBestEffort } from './ledgerMic';

export type MicSealV1Payload = {
  type: 'MIC_SEAL_V1';
  cycle: string;
  gi: number;
  mintThresholdGi: number;
  reserve: MicReadinessState['reserve'];
  sustain: MicReadinessState['sustain'];
  replay: MicReadinessState['replay'];
  novelty: MicReadinessState['novelty'];
  quorum: MicReadinessState['quorum'];
  fountain: MicReadinessState['fountain'];
  mintReadiness: MicReadinessState['mintReadiness'];
  sealId: string;
  timestamp: string;
};

function sealIdForCycle(cycle: string): string {
  const slug = cycle.replace(/[^a-zA-Z0-9_-]+/g, '-');
  return `seal-${slug}-${Date.now()}`;
}

export function buildMicSealV1Payload(state: MicReadinessState): MicSealV1Payload {
  return {
    type: 'MIC_SEAL_V1',
    cycle: state.cycle,
    gi: state.gi,
    mintThresholdGi: state.mintThresholdGi,
    reserve: state.reserve,
    sustain: state.sustain,
    replay: state.replay,
    novelty: state.novelty,
    quorum: state.quorum,
    fountain: state.fountain,
    mintReadiness: state.mintReadiness,
    sealId: sealIdForCycle(state.cycle),
    timestamp: new Date().toISOString()
  };
}

/**
 * PR #275 — emit Seal snapshot when tranche is eligible (proxy: eligible_for_seal).
 * Best-effort POST to `/mic/seal`.
 */
export async function writeSealSnapshotIfEligible(state: MicReadinessState): Promise<void> {
  if (state.reserve.trancheStatus !== 'eligible_for_seal') return;
  const payload = buildMicSealV1Payload(state);
  await postMicLedgerJsonBestEffort('/mic/seal', payload, 'MIC_SEAL_V1');
}
