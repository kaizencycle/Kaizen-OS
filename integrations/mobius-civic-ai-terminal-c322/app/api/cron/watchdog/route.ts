import { NextRequest, NextResponse } from 'next/server';
import { getServiceAuthError, serviceAuthorizationHeaderValue } from '@/lib/security/serviceAuth';
import { appendAgentJournalEntry } from '@/lib/agents/journal';
import { currentCycleId } from '@/lib/eve/cycle-engine';
import { pushLedgerEntry } from '@/lib/epicon/ledgerPush';
import { kvGet, kvSet, kvDel, kvSetRawKey, KV_KEYS, isRedisAvailable, KV_TTL_SECONDS } from '@/lib/kv/store';
import { mirrorEpiconEscalationToGithub } from '@/lib/github-cache';
import { readAllSubstrateJournals } from '@/lib/substrate/github-reader';
import { evaluateTrustTripwires } from '@/lib/tripwire/trustTripwires';
import type { TrustTripwireResult, TrustTripwireSnapshot } from '@/lib/tripwire/types';

import { GET as getKvHealth } from '@/app/api/kv/health/route';
import { POST as postSeedKv } from '@/app/api/admin/seed-kv/route';
import { GET as getIntegrityStatus } from '@/app/api/integrity-status/route';
import { GET as getTripwireStatus } from '@/app/api/tripwire/status/route';
import { runEchoIngest } from '@/app/api/echo/ingest/route';
import { POST as postEpiconPromote } from '@/app/api/epicon/promote/route';

export const dynamic = 'force-dynamic';

// OPT-10 (C-321): tiered escalation — at 2,276+ failures the watchdog was logging
// the same flat "threshold breached" message since failure #10. Now escalates proportionally.
const ESCALATION_TIERS = [
  { threshold:   50, severity: 'warn'     as const, label: 'EPICON promote degraded'  },
  { threshold:  300, severity: 'error'    as const, label: 'EPICON promote stuck'     },
  { threshold:  900, severity: 'critical' as const, label: 'EPICON lane blocked'      },
  { threshold: 2000, severity: 'alert'    as const, label: 'EPICON multi-day outage'  },
] as const;

function getEscalationTier(failures: number) {
  return [...ESCALATION_TIERS].reverse().find((t) => failures >= t.threshold) ?? null;
}

function emptyTrustSnapshot(timestamp: string): TrustTripwireSnapshot {
  return {
    ok: true,
    tripwireCount: 0,
    elevated: false,
    critical: false,
    results: [],
    timestamp,
  };
}

type WatchdogActionResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

function makeInternalRequest(
  origin: string,
  path: string,
  init?: { method?: string; body?: unknown },
): NextRequest {
  const headers = new Headers();
  const outboundAuth = serviceAuthorizationHeaderValue();
  if (outboundAuth) {
    headers.set('authorization', outboundAuth);
  } else {
    const candidates = [process.env.CRON_SECRET, process.env.RENDER_SCHEDULER_SECRET];
    for (const raw of candidates) {
      if (typeof raw === 'string' && raw.trim().length > 0) {
        headers.set('authorization', `Bearer ${raw.trim()}`);
        break;
      }
    }
  }
  if (init?.body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  const url = new URL(path, origin);
  return new NextRequest(url, {
    method: init?.method ?? 'GET',
    headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

async function runAction(
  fn: () => Promise<NextResponse>,
  timeoutMs = 15_000,
  retries = 1,
): Promise<WatchdogActionResult> {
  const once = async (): Promise<WatchdogActionResult> => {
    try {
      const response = await Promise.race<NextResponse>([
        fn(),
        new Promise<NextResponse>((_, reject) =>
          setTimeout(() => reject(new Error('handler_timeout')), timeoutMs),
        ),
      ]);
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      return { ok: response.ok, status: response.status, body };
    } catch (error) {
      return {
        ok: false,
        status: 500,
        body: { error: error instanceof Error ? error.message : 'Unknown handler error' },
      };
    }
  };

  let r = await once();
  if (!r.ok && retries > 0) {
    await new Promise((res) => setTimeout(res, 1000));
    r = await once();
  }
  return r;
}

export async function GET(request: NextRequest) {
  const authError = getServiceAuthError(request);
  if (authError) return authError;

  const actions: string[] = [];
  const timestamp = new Date().toISOString();
  const origin = request.nextUrl.origin;

  const kvHealth = await runAction(() => getKvHealth());
  actions.push(`kv-health:${kvHealth.ok ? 'ok' : `fail:${kvHealth.status}`}`);

  if (isRedisAvailable() && kvHealth.ok) {
    const keys = (kvHealth.body as { keys?: Record<string, boolean> } | null)?.keys;
    if (keys && !keys.TRIPWIRE_STATE && !keys.TRIPWIRE_STATE_KV) {
      const seedPayload = {
        cycleId: currentCycleId(),
        tripwireCount: 0,
        elevated: false,
        timestamp: new Date().toISOString(),
      };
      await Promise.all([
        kvSetRawKey('TRIPWIRE_STATE', JSON.stringify(seedPayload), KV_TTL_SECONDS.TRIPWIRE_STATE),
        kvSet(KV_KEYS.TRIPWIRE_STATE, seedPayload, KV_TTL_SECONDS.TRIPWIRE_STATE),
        kvSet(KV_KEYS.TRIPWIRE_STATE_KV, seedPayload, KV_TTL_SECONDS.TRIPWIRE_STATE),
      ]).catch(() => {});
      actions.push('tripwire-seed:ok');
    }
  }

  const seedRequest = makeInternalRequest(origin, '/api/admin/seed-kv', { method: 'POST' });
  const seedResult = await runAction(() => postSeedKv(seedRequest));
  actions.push(`seed-kv:${seedResult.ok ? 'ok' : `fail:${seedResult.status}`}`);

  const giResult = await runAction(() => getIntegrityStatus());
  actions.push(`integrity-status:${giResult.ok ? 'ok' : `fail:${giResult.status}`}`);

  const tripwireResult = await runAction(() => getTripwireStatus());
  actions.push(`tripwire-state:${tripwireResult.ok ? 'ok' : `fail:${tripwireResult.status}`}`);

  const echoResult = await runAction(() => runEchoIngest(), 30_000);
  actions.push(`echo-ingest:${echoResult.ok ? 'ok' : `fail:${echoResult.status}`}`);

  // OPT-10 (C-321): tiered escalation replaces flat FIX-14 threshold alert.
  const PROMOTE_FAIL_KEY = 'watchdog:promote-fail-count';
  const promoteFailCount = (await kvGet<number>(PROMOTE_FAIL_KEY)) ?? 0;
  const escalationTier = getEscalationTier(promoteFailCount);
  if (escalationTier) {
    const logFn = escalationTier.severity === 'warn' ? console.warn : console.error;
    logFn(`[watchdog] ${escalationTier.label}: ${promoteFailCount} consecutive failures (tier: ${escalationTier.severity})`, {
      failures: promoteFailCount,
      severity: escalationTier.severity,
      threshold: escalationTier.threshold,
      hint: 'Set SUBSTRATE_TOKEN in Vercel env vars to unblock EPICON promotion.',
    });
    actions.push(`promote-fail-alert:${promoteFailCount}:${escalationTier.severity}`);
    const escalation = {
      failures: promoteFailCount,
      severity: escalationTier.severity,
      label: escalationTier.label,
      ts: Date.now(),
    };
    void Promise.allSettled([
      kvSet('watchdog:epicon:escalation', escalation, 3600),
      mirrorEpiconEscalationToGithub(escalation),
    ]);
  } else if (promoteFailCount === 0) {
    const cleared = { cleared: true, ts: Date.now() };
    void Promise.allSettled([
      kvDel('watchdog:epicon:escalation'),
      mirrorEpiconEscalationToGithub(cleared),
    ]);
  }

  const promoteRequest = makeInternalRequest(origin, '/api/epicon/promote', {
    method: 'POST',
    body: { maxItems: 35 },
  });
  const promoteResult = await runAction(() => postEpiconPromote(promoteRequest), 30_000);
  actions.push(`promote:${promoteResult.ok ? 'ok' : `fail:${promoteResult.status}`}`);

  const trustSnapshot = await (async (): Promise<TrustTripwireSnapshot> => {
    try {
      const substrateJournals = await Promise.race([
        readAllSubstrateJournals(10),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('trust_journal_timeout')), 7000)),
      ]);
      const journals = Object.values(substrateJournals).flat();
      const promoteBody = promoteResult.body as Record<string, unknown> | null;
      const giBody = giResult.body as Record<string, unknown> | null;
      const epiconRows = Array.isArray(promoteBody?.items)
        ? (promoteBody.items as Array<Record<string, unknown>>)
        : Array.isArray(giBody?.entries)
          ? (giBody.entries as Array<Record<string, unknown>>)
          : [];

      const baseSnapshot = evaluateTrustTripwires({ journals, epiconRows });

      const failedActions = actions.filter((action) => action.includes('fail'));

      if (failedActions.length === 0) {
        return baseSnapshot;
      }

      const watchdogResult: TrustTripwireResult = {
        kind: 'watchdog_failed_checks',
        ok: false,
        triggered: true,
        severity: failedActions.length >= 3 ? 'critical' : 'elevated',
        score: failedActions.length >= 3 ? 0.2 : 0.55,
        message:
          failedActions.length >= 3
            ? 'WATCHDOG CRITICAL — multiple runtime checks failing'
            : 'WATCHDOG DEGRADED — runtime checks failing',
        evidence: {
          failed_checks: failedActions,
          failed_count: failedActions.length,
        },
        affectedAgents: ['ATLAS'],
        timestamp,
      };

      const results = [...baseSnapshot.results, watchdogResult];
      const critical = results.some((result) => result.triggered && result.severity === 'critical');
      const tripwireCount = results.filter((result) => result.triggered).length;

      return {
        ok: tripwireCount === 0,
        elevated: tripwireCount > 0,
        critical,
        tripwireCount,
        results,
        timestamp,
      };
    } catch (error) {
      console.error('[watchdog] trust tripwire evaluation failed:', error instanceof Error ? error.message : error);
      return emptyTrustSnapshot(new Date().toISOString());
    }
  })();

  await Promise.all([
    kvSet(KV_KEYS.TRIPWIRE_STATE, trustSnapshot, KV_TTL_SECONDS.TRIPWIRE_STATE),
    kvSet(KV_KEYS.TRIPWIRE_STATE_KV, trustSnapshot, KV_TTL_SECONDS.TRIPWIRE_STATE),
    kvSetRawKey('TRUST_TRIPWIRE_STATE', JSON.stringify(trustSnapshot), KV_TTL_SECONDS.TRIPWIRE_STATE),
  ]).catch(() => {});
  actions.push(`trust-tripwire:${trustSnapshot.ok ? 'ok' : trustSnapshot.critical ? 'fail:critical' : 'fail:elevated'}`);

  const logResult = {
    seeded: seedResult.body,
    gi: giResult.body,
    kvHealth: kvHealth.body,
    timestamp,
    source: 'watchdog',
  };
  console.info('[watchdog] daily run', logResult);

  const failed = actions.filter((action) => action.includes('fail')).length;

  void pushLedgerEntry({
    id: `watchdog-${currentCycleId()}-${Date.now()}`,
    timestamp,
    author: 'ATLAS',
    title: `Watchdog: ${actions.length} checks, ${failed} failed`,
    type: 'epicon',
    severity: failed === 0 ? 'nominal' : 'elevated',
    source: 'kv-ledger',
    tags: ['watchdog', 'cron', currentCycleId()],
    verified: false,
    category: 'heartbeat',
    status: 'committed',
    agentOrigin: 'ATLAS',
  }).catch(() => {});

  void appendAgentJournalEntry({
    agent: 'ATLAS',
    cycle: currentCycleId(),
    observation: `Sentinel watchdog ran checks: ${actions.join(', ')}.`,
    inference: failed === 0
      ? 'System integrity checks passed in this cycle.'
      : `${failed} watchdog checks failed and require operator review.`,
    recommendation: failed === 0
      ? 'Continue scheduled watch cadence.'
      : 'Inspect failed watchdog actions and confirm CRON_SECRET / KV health before next run.',
    confidence: failed === 0 ? 0.9 : 0.62,
    derivedFrom: ['watchdog:kv-health', 'watchdog:seed-kv', 'watchdog:integrity-status', `watchdog:run:${timestamp}`],
    relatedAgents: ['DAEDALUS', 'ZEUS'],
    status: 'committed',
    category: failed === 0 ? 'observation' : 'alert',
    severity: failed === 0 ? 'nominal' : 'elevated',
  }).catch((err) => {
    console.error('[watchdog] ATLAS journal append failed:', err instanceof Error ? err.message : err);
  });

  if (trustSnapshot.elevated) {
    void appendAgentJournalEntry({
      agent: 'ATLAS',
      cycle: currentCycleId(),
      observation: `Trust tripwires triggered: ${trustSnapshot.results.filter((result) => result.triggered).map((result) => result.kind).join(', ')}.`,
      inference: trustSnapshot.critical
        ? 'Trust posture is critically degraded and requires immediate operator attention.'
        : 'Trust posture is elevated; monitor affected agents and verification quality.',
      recommendation: trustSnapshot.critical
        ? 'Pause high-risk promotion decisions and inspect provenance/timeline violations before continuing.'
        : 'Review trust tripwire panel and increase verification rigor on upcoming promotions.',
      confidence: trustSnapshot.critical ? 0.52 : 0.68,
      derivedFrom: ['watchdog:trust-tripwire', `watchdog:run:${timestamp}`],
      relatedAgents: ['ZEUS', 'EVE'],
      status: 'committed',
      category: 'alert',
      severity: trustSnapshot.critical ? 'critical' : 'elevated',
    }).catch((err) => {
      console.error('[watchdog] trust journal append failed:', err instanceof Error ? err.message : err);
    });
  }

  return NextResponse.json({
    ok: failed === 0,
    actions,
    timestamp,
    trust_tripwire_elevated: trustSnapshot.elevated,
    trust_tripwire_critical: trustSnapshot.critical,
  });
}
