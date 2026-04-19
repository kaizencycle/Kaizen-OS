import type { MicReadinessState } from './readiness';
import { postMicLedgerJsonBestEffort } from './ledgerMic';
import { withHash } from './hash';

export type MicReadinessV1Payload = {
  type: 'MIC_READINESS_V1';
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
  timestamp: string;
};

export function toMicReadinessV1Payload(state: MicReadinessState): MicReadinessV1Payload {
  return {
    type: 'MIC_READINESS_V1',
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
    timestamp: new Date().toISOString()
  };
}

/**
 * POST readiness snapshot to ledger (`/mic/readiness`).
 * Best-effort: logs and swallows errors so reward cron is not blocked if the route is absent.
 */
export async function writeMicReadinessSnapshot(state: MicReadinessState): Promise<void> {
  const base = toMicReadinessV1Payload(state);
  const { payload, hash } = withHash(base);
  await postMicLedgerJsonBestEffort(
    '/mic/readiness',
    { ...payload, hash, hash_algorithm: 'sha256' },
    'MIC_READINESS_V1'
  );
}

/**
 * Reserved for future GET support; returns null until ledger exposes the route.
 */
export async function fetchMicReadinessSnapshot(_cycle: string): Promise<MicReadinessV1Payload | null> {
  void _cycle;
  return null;
}
