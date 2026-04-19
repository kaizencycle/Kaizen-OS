import { computeReward } from './computeReward';
import { fetchLedgerActivities, writeRewardAttestation } from './ledgerClient';
import { buildReadinessFromActivities } from './readiness';
import { writeMicReadinessSnapshot } from './readinessClient';

function shouldEmitReadinessSnapshot(): boolean {
  const v = process.env.MIC_READINESS_SNAPSHOT;
  return v === '1' || v === 'true' || v === 'yes';
}

export async function runPayoutCron() {
  const activities = await fetchLedgerActivities();
  const results = activities.map(activity =>
    computeReward(activity, {
      sentinelCount: activity.sentinelCount,
      isNewKnowledge: activity.isNewKnowledge,
      correctedDrift: activity.correctedDrift
    })
  );

  for (const result of results) {
    await writeRewardAttestation(result);
  }

  if (shouldEmitReadinessSnapshot() && activities.length > 0) {
    const readiness = buildReadinessFromActivities(activities);
    await writeMicReadinessSnapshot(readiness);
  }

  return results;
}

if (require.main === module) {
  runPayoutCron()
    .then(results => {
      console.log(`[tokenomics-engine] Processed ${results.length} reward entries`);
    })
    .catch(error => {
      console.error('[tokenomics-engine] Payout cron failed:', error);
      process.exitCode = 1;
    });
}
