/**
 * MIC readiness — shared field model for Terminal, ledger, and policy (C-285).
 * Derives mintReadiness only; does not mint, unlock Fountain, or write Seals.
 */

import { computeReward } from './computeReward';
import type { NodeActivity } from './schema';

export type TrancheStatus = 'in_progress' | 'eligible_for_seal' | 'sealed';

export type SustainAggregateStatus = 'not_started' | 'in_progress' | 'satisfied';

export type ReplayLaneStatus = 'clear' | 'elevated' | 'blocked';

export type NoveltyLaneStatus = 'weak' | 'acceptable' | 'strong';

export type QuorumAggregateStatus = 'pending' | 'partial' | 'satisfied';

export type MintReadiness =
  | 'not_eligible'
  | 'reserve_only'
  | 'seal_ready'
  | 'quorum_pending'
  | 'fountain_ready';

export interface MicReadinessState {
  cycle: string;
  gi: number;
  mintThresholdGi: number;
  reserve: {
    inProgressBalance: number;
    trancheTarget: number;
    sealedReserveTotal: number;
    trancheStatus: TrancheStatus;
  };
  sustain: {
    consecutiveEligibleCycles: number;
    requiredCycles: number;
    status: SustainAggregateStatus;
  };
  replay: {
    repeatedContentCount: number;
    replayPressure: number;
    status: ReplayLaneStatus;
  };
  novelty: {
    noveltyScore: number;
    status: NoveltyLaneStatus;
  };
  /** Sentinel names that must attest for mint-class events; defaults in `defaultMicReadinessState`. */
  quorum: {
    required: string[];
    optional: string[];
    attested: string[];
    status: QuorumAggregateStatus;
  };
  fountain: {
    locked: boolean;
    eligible: boolean;
    unlocked: boolean;
  };
  mintReadiness: MintReadiness;
}

const DEFAULT_REQUIRED = ['ZEUS', 'ATLAS', 'JADE', 'HERMES'] as const;
const DEFAULT_OPTIONAL = ['EVE', 'AUREA'] as const;

/**
 * How many required sentinels have attested (case-insensitive match on name).
 */
export function countRequiredAttestations(required: string[], attested: string[]): number {
  const lower = new Set(attested.map((a) => a.trim().toUpperCase()));
  return required.filter((r) => lower.has(r.trim().toUpperCase())).length;
}

export function deriveQuorumStatus(required: string[], attested: string[]): QuorumAggregateStatus {
  if (required.length === 0) return 'satisfied';
  const n = countRequiredAttestations(required, attested);
  if (n === 0) return 'pending';
  if (n < required.length) return 'partial';
  return 'satisfied';
}

/**
 * Policy-aligned readiness ladder (documentation contract).
 * Not a claim that all inputs are live from Terminal yet.
 */
export function deriveMicReadiness(state: MicReadinessState): MintReadiness {
  if (state.gi < state.mintThresholdGi) return 'not_eligible';
  if (state.reserve.trancheStatus === 'in_progress') return 'reserve_only';
  if (state.sustain.status !== 'satisfied') return 'seal_ready';
  if (state.replay.status === 'blocked') return 'not_eligible';
  if (state.quorum.status !== 'satisfied') return 'quorum_pending';
  if (!state.fountain.eligible) return 'quorum_pending';
  return 'fountain_ready';
}

/** Recompute quorum.status from required/attested lists, then mintReadiness. */
export function withDerivedFields(state: MicReadinessState): MicReadinessState {
  const quorumStatus = deriveQuorumStatus(state.quorum.required, state.quorum.attested);
  const next: MicReadinessState = {
    ...state,
    quorum: {
      ...state.quorum,
      status: quorumStatus
    }
  };
  return {
    ...next,
    mintReadiness: deriveMicReadiness(next)
  };
}

/** Defaults for tests and stubs; override any slice. */
export function defaultMicReadinessState(
  overrides: Partial<MicReadinessState> & {
    reserve?: Partial<MicReadinessState['reserve']>;
    sustain?: Partial<MicReadinessState['sustain']>;
    replay?: Partial<MicReadinessState['replay']>;
    novelty?: Partial<MicReadinessState['novelty']>;
    quorum?: Partial<MicReadinessState['quorum']>;
    fountain?: Partial<MicReadinessState['fountain']>;
  } = {}
): MicReadinessState {
  const base: MicReadinessState = {
    cycle: overrides.cycle ?? 'C-285',
    gi: overrides.gi ?? 0.74,
    mintThresholdGi: overrides.mintThresholdGi ?? 0.95,
    reserve: {
      inProgressBalance: 0,
      trancheTarget: 50,
      sealedReserveTotal: 0,
      trancheStatus: 'in_progress',
      ...overrides.reserve
    },
    sustain: {
      consecutiveEligibleCycles: 0,
      requiredCycles: 5,
      status: 'not_started',
      ...overrides.sustain
    },
    replay: {
      repeatedContentCount: 0,
      replayPressure: 0,
      status: 'clear',
      ...overrides.replay
    },
    novelty: {
      noveltyScore: 0.5,
      status: 'acceptable',
      ...overrides.novelty
    },
    quorum: {
      required: [...DEFAULT_REQUIRED],
      optional: [...DEFAULT_OPTIONAL],
      attested: [],
      status: 'pending',
      ...overrides.quorum
    },
    fountain: {
      locked: true,
      eligible: false,
      unlocked: false,
      ...overrides.fountain
    },
    mintReadiness: 'not_eligible'
  };
  return withDerivedFields(base);
}

/**
 * After a Seal snapshot is emitted, treat the tranche as sealed for downstream fountain/mint gates.
 * (Ledger remains source of truth when wired; this advances the in-memory readiness object.)
 */
export function applySealTransition(state: MicReadinessState): MicReadinessState {
  if (state.reserve.trancheStatus !== 'eligible_for_seal') return state;
  const next: MicReadinessState = {
    ...state,
    reserve: {
      ...state.reserve,
      trancheStatus: 'sealed',
      inProgressBalance: 0,
      sealedReserveTotal: state.reserve.sealedReserveTotal + state.reserve.trancheTarget
    }
  };
  return withDerivedFields(next);
}

const TRANCHE_TARGET_UNITS = 50;

/**
 * Build a readiness snapshot from ledger activities + reward engine (proxy fields).
 * Reserve `inProgressBalance` uses summed provisional MIC as a **bookkeeping signal** until
 * Vault `in_progress_balance` is wired from Terminal.
 */
export function buildReadinessFromActivities(
  activities: NodeActivity[],
  options: { cycle?: string; mintThresholdGi?: number } = {}
): MicReadinessState {
  const cycle = options.cycle ?? process.env.MOBIUS_CYCLE ?? 'C-285';
  const mintThresholdGi = options.mintThresholdGi ?? 0.95;
  const sustainCyclesEnv = process.env.MIC_SUSTAIN_CYCLES;
  const sustainCyclesParsed =
    sustainCyclesEnv != null && sustainCyclesEnv !== '' ? parseInt(sustainCyclesEnv, 10) : NaN;
  const stubSustainCycles = Number.isFinite(sustainCyclesParsed) ? sustainCyclesParsed : 0;

  const attestRaw = process.env.MIC_QUORUM_ATTESTED;
  const stubAttested =
    attestRaw && attestRaw.trim() !== ''
      ? attestRaw.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      : [];

  let giSum = 0;
  let micProxy = 0;
  for (const a of activities) {
    giSum += a.gi;
    const r = computeReward(a, {
      sentinelCount: a.sentinelCount,
      isNewKnowledge: a.isNewKnowledge,
      correctedDrift: a.correctedDrift
    });
    micProxy += r.mic;
  }
  const n = activities.length;
  const gi = n > 0 ? giSum / n : 0;

  let trancheStatus: TrancheStatus = 'in_progress';
  if (micProxy >= TRANCHE_TARGET_UNITS) trancheStatus = 'eligible_for_seal';

  let sustainStatus: SustainAggregateStatus = 'not_started';
  if (gi >= mintThresholdGi) {
    if (stubSustainCycles >= 5) sustainStatus = 'satisfied';
    else sustainStatus = 'in_progress';
  }

  const base: MicReadinessState = {
    cycle,
    gi,
    mintThresholdGi,
    reserve: {
      inProgressBalance: micProxy,
      trancheTarget: TRANCHE_TARGET_UNITS,
      sealedReserveTotal: 0,
      trancheStatus
    },
    sustain: {
      consecutiveEligibleCycles: stubSustainCycles,
      requiredCycles: 5,
      status: sustainStatus
    },
    replay: {
      repeatedContentCount: 0,
      replayPressure: 0,
      status: 'clear'
    },
    novelty: {
      noveltyScore: 0.5,
      status: 'acceptable'
    },
    quorum: {
      required: [...DEFAULT_REQUIRED],
      optional: [...DEFAULT_OPTIONAL],
      attested: stubAttested,
      status: 'pending'
    },
    fountain: {
      locked: true,
      eligible: false,
      unlocked: false
    },
    mintReadiness: 'not_eligible'
  };
  return withDerivedFields(base);
}
