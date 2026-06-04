/**
 * Cron: POST /api/epicon/promote every night at 00:30 UTC.
 *
 * Vercel crons can only fire GET requests. This GET handler internally
 * fans out to POST /api/epicon/promote with { maxItems: 5 } so the
 * promotion engine runs on a schedule without requiring manual trigger.
 *
 * Auth: getEveSynthesisAuthError — allows Vercel platform cron headers
 * to bypass Bearer check (same pattern as /api/eve/cycle-synthesize).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getEveSynthesisAuthError, serviceAuthorizationHeaderValue, normalizeServiceSecretMaterial } from '@/lib/security/serviceAuth';
import { kvSet, kvGet } from '@/lib/kv/store';
import { mirrorPromotionRunToGithub } from '@/lib/github-cache';

const PROMOTE_FAIL_KEY = 'watchdog:promote-fail-count';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = getEveSynthesisAuthError(request);
  if (authError) return authError;

  const origin = request.nextUrl.origin;
  // C-314 T-03: /api/epicon/promote compares normalized SUBSTRATE_TOKEN / CRON_SECRET material
  // (see normalizeServiceSecretMaterial) so env may include optional Bearer prefix or quotes.
  // /api/epicon/promote accepts either SUBSTRATE_TOKEN or CRON_SECRET — fast-fail only when
  // neither is present, since both are valid auth paths for the promote endpoint (C-319).
  const substrateMat = normalizeServiceSecretMaterial(process.env.SUBSTRATE_TOKEN);
  const cronMat = normalizeServiceSecretMaterial(process.env.CRON_SECRET);
  if (substrateMat === null && cronMat === null) {
    console.error('[cron/promote] Neither SUBSTRATE_TOKEN nor CRON_SECRET configured — skipping promote run. Set at least one in Vercel env vars.');
    return NextResponse.json(
      {
        ok: false,
        error: 'NO_PROMOTE_AUTH_TOKEN',
        hint: 'Set SUBSTRATE_TOKEN or CRON_SECRET in Vercel environment variables and redeploy',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
  const authHeader =
    substrateMat !== null
      ? `Bearer ${substrateMat}`
      : cronMat !== null
        ? `Bearer ${cronMat}`
        : serviceAuthorizationHeaderValue();

  if (!authHeader) {
    console.warn(
      '[promote] skipped: no SUBSTRATE_TOKEN, CRON_SECRET, or outbound service bearer — configure env to run scheduled promotion',
    );
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        reason: 'no_promote_auth_material',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  try {
    // FIX-507-02: write heartbeat unconditionally so promotion-status never shows stale
    // when the promote fetch times out or returns a transient non-OK (Render cold-start).
    const runAt = new Date().toISOString();
    void Promise.allSettled([
      kvSet('LAST_PROMOTION_RUN_AT', runAt, 7 * 24 * 3600),
      mirrorPromotionRunToGithub({ runAt }),
    ]);

    const res = await fetch(new URL('/api/epicon/promote', origin), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-cron': '1',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ maxItems: 35 }),
      cache: 'no-store',
      signal: AbortSignal.timeout(25_000),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`[promote] /api/epicon/promote returned ${res.status} — check SUBSTRATE_TOKEN env var`);
      if (res.status === 401) {
        // C-332 OPT-3: log only token length+presence, never character material.
        const rawToken = authHeader ?? '';
        const tokenBody = rawToken.replace(/^Bearer /, '');
        console.error(`[promote] 401 received — auth token len=${tokenBody.length} present=${tokenBody.length > 0}`);
        const failCount = ((await kvGet<number>(PROMOTE_FAIL_KEY)) ?? 0) + 1;
        await kvSet(PROMOTE_FAIL_KEY, failCount, 86400).catch(() => {});
      }
    } else {
      console.log(`[promote] epicon promote ok @ ${process.env.CURRENT_CYCLE ?? 'C-305'}`);
      await kvSet(PROMOTE_FAIL_KEY, 0, 86400).catch(() => {});
    }

    return NextResponse.json({
      ok: res.ok,
      promotion: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Promotion cron failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
