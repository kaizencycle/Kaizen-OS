import { applySealTransition, buildReadinessFromActivities } from './readiness';
import type { NodeActivity } from './schema';
import { applyFountainEvaluation } from './fountain';
import { writeSealSnapshotIfEligible } from './sealWriter';
import { writeGenesisMintIfEnabled } from './mintGenesis';
import { writeMicReadinessSnapshot } from './readinessClient';

export type MicActivationOptions = {
  cycle?: string;
  mintThresholdGi?: number;
};

/**
 * PR #275–277 — single pipeline: readiness → (optional) seal snapshot → fountain eval → readiness snapshot → (env) genesis mint.
 * Seal + genesis ledger routes are best-effort until the ledger implements them.
 */
export async function runMicActivationPipeline(
  activities: NodeActivity[],
  options: MicActivationOptions = {}
): Promise<void> {
  if (activities.length === 0) return;

  let state = buildReadinessFromActivities(activities, {
    cycle: options.cycle,
    mintThresholdGi: options.mintThresholdGi
  });

  await writeSealSnapshotIfEligible(state);
  state = applySealTransition(state);

  state = applyFountainEvaluation(state);

  await writeMicReadinessSnapshot(state);

  await writeGenesisMintIfEnabled(state);
}
