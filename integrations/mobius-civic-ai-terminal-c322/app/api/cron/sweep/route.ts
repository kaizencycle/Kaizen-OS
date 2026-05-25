/**
 * GET/POST /api/cron/sweep — full micro-sensor sweep + GI + pulse (C-287).
 * Schedule: every 10 minutes in `vercel.json`. Lighter `/api/cron/heartbeat` stays at 5m.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getEveSynthesisAuthError } from '@/lib/security/serviceAuth';
import { runMicroSweepPipeline } from '@/lib/signals/runMicroSweep';
import { currentCycleId } from '@/lib/eve/cycle-engine';
import { resolveOperatorCycleId } from '@/lib/eve/resolve-operator-cycle';
import { appendFullCouncilJournalPulse } from '@/lib/agents/sentinel-cycle-journals';
import { updateSustainTrackingFromGi } from '@/lib/mic/sustainTracker';
import { getMergedMicReadiness } from '@/lib/mic/assembleMicReadiness';
import { persistLocalMicReadinessSnapshot } from '@/lib/mic/persistReadinessKv';
import { kvGet, kvSet, kvDel, KV_KEYS } from '@/lib/kv/store';
import { mirrorZeusDisputeToGithub } from '@/lib/github-cache';

export const dynamic = 'force-dynamic';

const ZEUS_LAST_RESOLVED_KEY = 'zeus:last-resolved-status';
type ZeusSweepResult = 'pass' | 'fail' | 'inconclusive';

async function runZeusVerificationSweep(origin: string): Promise<ZeusSweepResult> {
  try {
    const res = await fetch(`${origin}/api/agents/ledger-zeus?limit=50`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.warn('[cron/sweep] ZEUS verification probe non-OK:', res.status);
      return 'inconclusive';
    }
    const body = (await res.json()) as {
      evaluated?: Array<{ zeus?: { zeus_verified?: boolean } }>;
    };
    const ev = body.evaluated;
    if (!Array.isArray(ev) || ev.length === 0) {
      return 'inconclusive';
    }
    const allPass = ev.every((row) => row.zeus?.zeus_verified === true);
    if (allPass) return 'pass';
    return 'fail';
  } catch (err) {
    console.warn('[cron/sweep] ZEUS verification error — inconclusive', err);
    return 'inconclusive';
  }
}

async function run(req: NextRequest) {
  const authErr = getEveSynthesisAuthError(req);
  if (authErr) return authErr;
  
  // C-301 FIX: Check the *write-path* substrate vars, not the public UI base URL.
  // NEXT_PUBLIC_SUBSTRATE_API_BASE is a browser-facing env used by the UI only.
  // Journal canonize and substrate writes use JOURNAL_CANON_SUBSTRATE_TARGET
  // (or SUBSTRATE_GITHUB_REPO / GITHUB_REPO_URL as fallbacks).
  const substrateWriteTarget =
    process.env.JOURNAL_CANON_SUBSTRATE_TARGET ??
    process.env.SUBSTRATE_GITHUB_REPO ??
    process.env.GITHUB_REPO_URL ??
    null;
  const substrateConfigured = Boolean(substrateWriteTarget);
  if (!substrateConfigured) {
    console.warn(
      '[cron/sweep] substrate write-path not configured: ' +
      'set JOURNAL_CANON_SUBSTRATE_TARGET (or SUBSTRATE_GITHUB_REPO / GITHUB_REPO_URL) ' +
      'to enable journal canonize and substrate attestation.',
    );
  }
  
  try {
    const data = await runMicroSweepPipeline();
    const gi = typeof data.composite === 'number' && Number.isFinite(data.composite)
      ? data.composite
      : null;

    const zeusRaw = await runZeusVerificationSweep(req.nextUrl.origin);
    let zeusResolved: ZeusSweepResult = zeusRaw;
    if (zeusRaw === 'inconclusive') {
      const prior = await kvGet<ZeusSweepResult>(ZEUS_LAST_RESOLVED_KEY);
      zeusResolved = prior ?? 'inconclusive';
    } else {
      await kvSet(ZEUS_LAST_RESOLVED_KEY, zeusRaw, 14 * 24 * 3600).catch(() => {});
    }

    let cycle: string;
    try {
      cycle = await resolveOperatorCycleId();
    } catch {
      cycle = currentCycleId();
    }

    // OPT-8 (C-321): surface ZEUS probe failures as a formal dispute in KV so
    // Sentinel can render an orange banner with cycle, message, and age.
    if (zeusRaw === 'fail') {
      const dispute = {
        cycle,
        message:
          'ZEUS verification probe returned fail. EPICON queue may be blocked; check vault/journal surface health.',
        ts: Date.now(),
      };
      void Promise.allSettled([
        kvSet('zeus:dispute:latest', dispute, 7200),
        mirrorZeusDisputeToGithub(dispute),
      ]);
    } else if (zeusRaw === 'pass') {
      const cleared = { cleared: true, ts: Date.now() };
      void Promise.allSettled([
        kvDel('zeus:dispute:latest'),
        mirrorZeusDisputeToGithub(cleared),
      ]);
    }

    // Fix 2: restore missing CURRENT_CYCLE KV key so kvHealth shows it as present
    try {
      const currentCycleKv = await kvGet<string>(KV_KEYS.CURRENT_CYCLE);
      if (!currentCycleKv) {
        await kvSet(KV_KEYS.CURRENT_CYCLE, cycle, 604800);
        console.log('[sweep] restored missing CURRENT_CYCLE:', cycle);
      }
    } catch (e) {
      console.warn('[sweep] CURRENT_CYCLE guard failed:', e instanceof Error ? e.message : e);
    }

    // C-298: advance sustain counter on every sweep — was never called before this fix.
    // updateSustainTrackingFromGi is idempotent per cycle (same cycle returns stored state).
    let sustainResult: { status?: string; consecutiveEligibleCycles?: number } | null = null;
    try {
      sustainResult = await updateSustainTrackingFromGi(gi, cycle);
    } catch (e) {
      console.warn('[cron/sweep] sustain update failed:', e instanceof Error ? e.message : e);
    }

    const council = await appendFullCouncilJournalPulse({
      cycle,
      gi,
      source: 'cron',
    });

    console.info('[cron/sweep] cycle write', { cycle, written: council.entries.length });

    // Fix 5: write rolling AGENT_JOURNAL_INDEX so the journal route's KV fallback has data
    try {
      const currentIndex = await kvGet<unknown[]>('agent:journal:index') ?? [];
      const newEntries = council.entries.map((e) => ({ ...e, _indexedAt: new Date().toISOString() }));
      const updated = [...newEntries, ...currentIndex].slice(0, 500);
      await kvSet('agent:journal:index', updated, 604800);
      console.log('[sweep] AGENT_JOURNAL_INDEX updated, total entries:', updated.length);
    } catch (e) {
      console.warn('[sweep] AGENT_JOURNAL_INDEX write failed:', e instanceof Error ? e.message : e);
    }

    // Refresh micReadiness snapshot on every sweep so updatedAt stays current.
    // Fix 6: explicitly override cycle on the merged result before persisting — prevents
    // upstream snapshot from overriding with a stale cycle.
    try {
      const mic = await getMergedMicReadiness(cycle);
      const micWithCycle = { ...mic, cycle, updatedAt: new Date().toISOString() };
      await persistLocalMicReadinessSnapshot(micWithCycle as typeof mic);
      console.log('[sweep] micReadiness snapshot written:', cycle, new Date().toISOString());
    } catch (e) {
      console.warn('[cron/sweep] micReadiness refresh failed:', e instanceof Error ? e.message : e);
    }

    // OPT-07 (C-312): bust integrity-status KV cache after sweep writes new GI.
    void Promise.all([
      kvDel('cache:integrity-status'),
      kvDel('cache:lane-diagnostics'),
    ]).catch(() => {});

    return NextResponse.json({
      ok: true,
      source: 'cron-sweep',
      timestamp: new Date().toISOString(),
      composite: data.composite,
      zeus_verification: zeusRaw,
      zeus_verification_resolved: zeusResolved,
      instrumentCount: data.instrumentCount ?? null,
      cycle,
      sustain: sustainResult
        ? {
            status: sustainResult.status,
            consecutiveEligibleCycles: sustainResult.consecutiveEligibleCycles,
          }
        : null,
      councilJournalPulse: {
        ok: council.ok,
        gi: council.gi,
        written: council.entries.length,
        agents: council.entries.map((entry) => entry.agent),
        failedAgents: council.failedAgents,
      },
      substrate_configured: substrateConfigured,
    });
  } catch (err) {
    console.error('[cron/sweep] failed:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'sweep failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
