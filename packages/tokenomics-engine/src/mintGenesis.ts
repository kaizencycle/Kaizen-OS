import type { MicReadinessState } from './readiness';
import { postMicLedgerJsonBestEffort } from './ledgerMic';

const DEFAULT_GENESIS_MIC = 95;

export type MicMintGenesisV1Payload = {
  type: 'MIC_MINT_GENESIS_V1';
  cycle: string;
  gi: number;
  mintThresholdGi: number;
  amountMic: number;
  splits: {
    reserve: number;
    operator: number;
    sentinel_pool: number;
    civic_test: number;
    burn_locked: number;
  };
  readiness: Pick<
    MicReadinessState,
    'reserve' | 'sustain' | 'replay' | 'novelty' | 'quorum' | 'fountain' | 'mintReadiness'
  >;
  timestamp: string;
};

export function defaultGenesisSplits(total: number = DEFAULT_GENESIS_MIC): MicMintGenesisV1Payload['splits'] {
  return {
    reserve: 38,
    operator: 19,
    sentinel_pool: 19,
    civic_test: 9.5,
    burn_locked: 9.5
  };
}

export function buildMicMintGenesisV1Payload(
  state: MicReadinessState,
  options: { amountMic?: number; splits?: MicMintGenesisV1Payload['splits'] } = {}
): MicMintGenesisV1Payload {
  const amountMic = options.amountMic ?? DEFAULT_GENESIS_MIC;
  return {
    type: 'MIC_MINT_GENESIS_V1',
    cycle: state.cycle,
    gi: state.gi,
    mintThresholdGi: state.mintThresholdGi,
    amountMic,
    splits: options.splits ?? defaultGenesisSplits(amountMic),
    readiness: {
      reserve: state.reserve,
      sustain: state.sustain,
      replay: state.replay,
      novelty: state.novelty,
      quorum: state.quorum,
      fountain: state.fountain,
      mintReadiness: state.mintReadiness
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * PR #277 — Genesis mint attestation (env-gated, best-effort).
 * Requires `mintReadiness === 'fountain_ready'` and `MIC_GENESIS_MINT=1|true|yes`.
 */
export async function writeGenesisMintIfEnabled(state: MicReadinessState): Promise<void> {
  const flag = process.env.MIC_GENESIS_MINT;
  const enabled = flag === '1' || flag === 'true' || flag === 'yes';
  if (!enabled) return;
  if (state.mintReadiness !== 'fountain_ready') return;

  const payload = buildMicMintGenesisV1Payload(state);
  await postMicLedgerJsonBestEffort('/mic/mint/genesis', payload, 'MIC_MINT_GENESIS_V1');
}
