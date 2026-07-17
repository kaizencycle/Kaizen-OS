import { NextResponse } from 'next/server';
import { resolveGiForTerminal } from '@/lib/integrity/resolveGi';
import { loadMicReadinessSnapshotRaw } from '@/lib/mic/loadReadinessSnapshot';
import { currentCycleId } from '@/lib/eve/cycle-engine';
import { loadTripwireState } from '@/lib/kv/store';
import { ghLoadLastKnownSnapshot } from '@/lib/github-cache';
import { getHeartbeat, getJournalHeartbeat } from '@/lib/runtime/heartbeat';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // OPT-1 (C-291): loadMicReadinessSnapshotRaw was called twice in parallel —
    // once for the raw source label and once piped into resolveGiForTerminal.
    // Call it once, then pass the result to both consumers.
    const [micRaw, tripwire] = await Promise.all([
      loadMicReadinessSnapshotRaw(),
      loadTripwireState(),
    ]);

    const gi = await resolveGiForTerminal({ micReadinessSnapshotRaw: micRaw.raw });

    const mode = typeof gi.mode === 'string' ? gi.mode : null;
    const degraded = Boolean(gi.degraded || mode === 'red' || tripwire?.elevated);

    return NextResponse.json({
      ok: true,
      fallback: false,
      cycle: currentCycleId(),
      gi: gi.gi,
      mode,
      degraded,
      tripwire: {
        count: tripwire?.tripwireCount ?? 0,
        elevated: tripwire?.elevated ?? false,
      },
      heartbeat: {
        runtime: getHeartbeat(),
        journal: getJournalHeartbeat(),
      },
      source: micRaw.source === 'none' ? 'fallback' : 'live',
      timestamp,
    }, {
      headers: {
        // OPT-01 (C-312): shell is polled every ~60s by the browser for live terminal
        // state. s-maxage=30 was causing STALE CDN responses on every other poll cycle.
        // no-store forces origin on every request; all data is KV-backed so latency is low.
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    // OPT-9 (C-321): serve last-known snapshot from KV so cold-start console
    // shows real values (GI, cycle) instead of all-dashes.
    type LastKnown = { gi?: number; cycle?: string; runtime?: string; ts?: number };
    let lastKnown = await ghLoadLastKnownSnapshot();
    if (!lastKnown?.gi) {
      const { kvGet } = await import('@/lib/kv/store');
      lastKnown = (await kvGet<LastKnown>('terminal:last-known-snapshot').catch(() => null)) ?? lastKnown;
    }
    const staleAgeS = lastKnown?.ts ? Math.round((Date.now() - lastKnown.ts) / 1000) : null;
    return NextResponse.json({
      ok: true,
      fallback: true,
      cycle: lastKnown?.cycle ?? currentCycleId(),
      gi: lastKnown?.gi ?? null,
      mode: 'yellow',
      degraded: true,
      tripwire: { count: 0, elevated: false },
      heartbeat: {
        runtime: getHeartbeat(),
        journal: getJournalHeartbeat(),
      },
      source: lastKnown?.gi != null ? 'last-known' : 'fallback',
      _stale: lastKnown?.gi != null,
      _stale_age_s: staleAgeS,
      timestamp,
    });
  }
}
