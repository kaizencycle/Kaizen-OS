/**
 * GET/POST /api/cron/heartbeat — refresh fleet HEARTBEAT in KV (C-286).
 *
 * Schedule: every 5 minutes (`vercel.json`). Marks all canonical agents active
 * so `/api/agents/status` does not degrade on cycle-open KV gaps.
 *
 * C-298: also advances the sustain counter using the carry-forward GI value
 * so sustain tracking ticks even on heartbeat-only cycles between sweeps.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getEveSynthesisAuthError } from '@/lib/security/serviceAuth';
import { writeFleetHeartbeatKV } from '@/lib/runtime/agent-heartbeat-kv';
import { loadGIState, loadGIStateCarry, appendGiTrend, loadGiTrend, kvDel, kvSet } from '@/lib/kv/store';
import {
  mirrorGiStateToGithub,
  mirrorGiTrendToGithub,
  mirrorHeartbeatMetaToGithub,
  mirrorLastKnownSnapshotToGithub,
} from '@/lib/github-cache';
import { updateSustainTrackingFromGi, seedSustainStateIfMissing } from '@/lib/mic/sustainTracker';
import { resolveOperatorCycleId } from '@/lib/eve/resolve-operator-cycle';

export const dynamic = 'force-dynamic';

async function run(req: NextRequest) {
  const authErr = getEveSynthesisAuthError(req);
  if (authErr) return authErr;

  const ok = await writeFleetHeartbeatKV('cron-heartbeat');
  const timestamp = new Date().toISOString();
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: 'kv_unavailable_or_write_failed', timestamp },
      { status: 503 },
    );
  }

  // C-298: advance sustain counter. Use live GI if fresh, else carry-forward.
  let sustainStatus: string | null = null;
  let sustainCycles: number | null = null;
  let gi: number | null = null;
  try {
    const cycle = await resolveOperatorCycleId().catch(() => '');
    await seedSustainStateIfMissing(cycle || undefined);

    const giState = await loadGIState();
    if (giState && typeof giState.global_integrity === 'number') {
      const ageMs = Date.now() - new Date(giState.timestamp).getTime();
      if (ageMs < 15 * 60 * 1000) gi = giState.global_integrity;
    }
    if (gi === null) {
      const carry = await loadGIStateCarry();
      if (carry && typeof carry.global_integrity === 'number') gi = carry.global_integrity;
    }

    if (gi !== null && cycle) {
      const sustain = await updateSustainTrackingFromGi(gi, cycle);
      if (sustain) {
        sustainStatus = sustain.status;
        sustainCycles = sustain.consecutiveEligibleCycles;
      }
    }
  } catch (e) {
    console.warn('[cron/heartbeat] sustain update failed:', e instanceof Error ? e.message : e);
  }

  // Append to the rolling GI trend (24-entry window, one per heartbeat cycle).
  // appendGiTrend already guards against KV unavailability — fire-and-forget.
  let giStateForMirror: Awaited<ReturnType<typeof loadGIState>> = null;
  if (gi !== null) {
    const giMode = gi >= 0.8 ? 'green' : gi >= 0.6 ? 'yellow' : 'red';
    void appendGiTrend({ gi, mode: giMode, gi_verified: false, timestamp }).catch(() => {});
    giStateForMirror = await loadGIState().catch(() => null);
  }

  // OPT-07 (C-312): bust integrity-status KV cache so next page load recomputes
  // fresh GI rather than serving a stale 60s-cached result after a heartbeat tick.
  void Promise.all([
    kvDel('cache:integrity-status'),
    kvDel('cache:lane-diagnostics'),
  ]).catch(() => {});

  // OPT-9 (C-321): persist last-known snapshot so the shell endpoint can serve
  // real values on cold start instead of all-dashes.
  if (gi !== null) {
    const cycle = await resolveOperatorCycleId().catch(() => '');
    const lastKnown = {
      gi,
      cycle: cycle || undefined,
      runtime: 'ok',
      ts: Date.now(),
    };
    void kvSet('terminal:last-known-snapshot', lastKnown, 86400).catch(() => {});
    void Promise.allSettled([
      mirrorLastKnownSnapshotToGithub(lastKnown),
      mirrorHeartbeatMetaToGithub({ cycleId: cycle || undefined, gi, timestamp }),
      giStateForMirror ? mirrorGiStateToGithub(giStateForMirror) : Promise.resolve(),
      loadGiTrend().then((trend) => mirrorGiTrendToGithub(trend)),
    ]);
  }

  return NextResponse.json({
    ok: true,
    timestamp,
    source: 'cron-heartbeat',
    sustain: sustainStatus !== null
      ? { status: sustainStatus, consecutiveEligibleCycles: sustainCycles }
      : null,
  });
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
