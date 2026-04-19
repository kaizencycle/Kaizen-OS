import type { MicReadinessState } from './readiness';
import { withDerivedFields } from './readiness';

/**
 * Fountain eligibility (PR #276) — policy evaluation only.
 * Does not unlock Fountain on chain; sets `fountain.eligible` for readiness + UI.
 */
export function evaluateFountainEligibility(state: MicReadinessState): boolean {
  return (
    state.gi >= state.mintThresholdGi &&
    state.sustain.status === 'satisfied' &&
    state.reserve.trancheStatus === 'sealed' &&
    state.replay.status !== 'blocked' &&
    state.quorum.status === 'satisfied'
  );
}

/**
 * Update fountain flags from eligibility. `unlocked` stays false here (Terminal/ledger owns real unlock).
 */
export function applyFountainEvaluation(state: MicReadinessState): MicReadinessState {
  const eligible = evaluateFountainEligibility(state);
  const next: MicReadinessState = {
    ...state,
    fountain: {
      locked: !eligible,
      eligible,
      unlocked: false
    }
  };
  return withDerivedFields(next);
}
