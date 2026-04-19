import type { MicReadinessState } from './readiness';

const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL || 'https://ledger.mobius';

async function postJson(url: string, body: unknown): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ledger readiness write failed: ${response.status} ${text}`);
  }
}

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
  const url = `${LEDGER_BASE_URL.replace(/\/$/, '')}/mic/readiness`;
  const payload = toMicReadinessV1Payload(state);
  try {
    await postJson(url, payload);
  } catch (error) {
    console.warn('[tokenomics-engine] MIC readiness snapshot not persisted:', error);
  }
}

/**
 * Reserved for future GET support; returns null until ledger exposes the route.
 */
export async function fetchMicReadinessSnapshot(_cycle: string): Promise<MicReadinessV1Payload | null> {
  void _cycle;
  return null;
}
