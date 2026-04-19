import type { MicReadinessState } from './readiness';
import { postMicLedgerJsonBestEffort } from './ledgerMic';
import { chainRecord } from './chainHash';

const DEFAULT_GENESIS_MIC = 95;

/** Body before `previous_hash` is injected by `chainRecord`. */
export type MicMintGenesisV1Body = {
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

export type MicMintGenesisV1Payload = MicMintGenesisV1Body & {
  previous_hash: string | null;
};

export function defaultGenesisSplits(total: number = DEFAULT_GENESIS_MIC): MicMintGenesisV1Body['splits'] {
  return {
    reserve: 38,
    operator: 19,
    sentinel_pool: 19,
    civic_test: 9.5,
    burn_locked: 9.5
  };
}

export function buildMicMintGenesisV1Body(
  state: MicReadinessState,
  options: { amountMic?: number; splits?: MicMintGenesisV1Body['splits'] } = {}
): MicMintGenesisV1Body {
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

  const body = buildMicMintGenesisV1Body(state);
  const prevRaw = process.env.MIC_GENESIS_PREVIOUS_HASH;
  const previousHash =
    prevRaw && prevRaw.trim() !== '' ? prevRaw.trim() : null;
  const { payload, hash } = chainRecord(body, previousHash);
  await postMicLedgerJsonBestEffort(
    '/mic/mint/genesis',
    { ...payload, hash, hash_algorithm: 'sha256' },
    'MIC_MINT_GENESIS_V1'
  );
}
