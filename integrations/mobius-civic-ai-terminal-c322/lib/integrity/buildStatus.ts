/**
 * Shared live integrity computation for /api/integrity-status and EVE governance synthesis (C-270).
 */

import { computeGI } from '@/lib/gi/compute';
import { getGiMode } from '@/lib/gi/mode';
import type { GIMode } from '@/lib/gi/mode';
import { currentCycleId } from '@/lib/eve/cycle-engine';
import { getEchoEpicon } from '@/lib/echo/store';
import { integrityStatus } from '@/lib/mock/integrityStatus';
import { getHeartbeat } from '@/lib/runtime/heartbeat';
import { getStalenessStatus } from '@/lib/runtime/staleness';
import { scoreBatch } from '@/lib/echo/signal-engine';
import { mockAgents, mockEpicon } from '@/lib/terminal/mock';
import { getTripwireState } from '@/lib/tripwire/store';
import {
  saveGIState,
  loadGIState,
  loadGIStateCarry,
  loadGiTrend,
  isRedisAvailable,
  appendGiTrend,
  type GIState,
} from '@/lib/kv/store';

function resolveSignalQuality() {
  const epicon = getEchoEpicon();
  const isLive = epicon.length > 0;
  const items = isLive ? epicon : mockEpicon;
  const scores = scoreBatch(items).map((score) => score.signal);

  if (!isLive) {
    return { scores: scores.map((s) => s * 0.8), source: 'mock' as const };
  }
  return { scores, source: 'live' as const };
}

function resolveActiveAgentCount() {
  return mockAgents.filter((agent) => agent.heartbeatOk && agent.status !== 'idle').length;
}

function normalizeTripwireLevel(level: ReturnType<typeof getTripwireState>['level']): 'none' | 'watch' | 'elevated' {
  if (level === 'high' || level === 'triggered' || level === 'suspended' || level === 'elevated') return 'elevated';
  if (level === 'medium' || level === 'watch') return 'watch';
  return 'none';
}

function parseGIMode(value: string): GIMode | null {
  if (value === 'green' || value === 'yellow' || value === 'red') return value;
  return null;
}

function parseTerminalStatus(value: string): IntegrityPayload['terminal_status'] | null {
  if (value === 'nominal' || value === 'stressed' || value === 'critical') return value;
  return null;
}

export type IntegrityPayload = {
  cycle: string;
  timestamp: string;
  global_integrity: number;
  mode: GIMode;
  mii_baseline: number;
  mic_supply: number;
  terminal_status: 'nominal' | 'stressed' | 'critical';
  primary_driver: string;
  summary: string;
  source: 'live' | 'mock' | 'cached' | 'kv';
  kv?: boolean;
  signals: Record<string, number>;
};

/**
 * Same GI/MII posture as the integrity ribbon (including Redis cold-start cache when applicable).
 *
 * Source priority:
 *   1. Persisted GI (KV hot, then GitHub STATE CDN via loadGIState) when fresh
 *   2. KV carry-forward row when primary is stale (Redis only)
 *   3. local computation — when no durable row is usable
 */
export async function computeIntegrityPayload(): Promise<IntegrityPayload> {
  // 1. Primary: loadGIState handles KV → GitHub fallback (C-322); do not gate on isRedisAvailable()
  const cached = await loadGIState();
  const carry = isRedisAvailable() ? await loadGIStateCarry() : null;
  const pick = (() => {
      if (cached) {
        const age = Date.now() - new Date(cached.timestamp).getTime();
        const mode = parseGIMode(cached.mode);
        const terminal_status = parseTerminalStatus(cached.terminal_status);
        if (age < 15 * 60 * 1000 && mode && terminal_status) return { row: cached, source: 'kv' as const };
      }
      if (carry) {
        const cachedStale =
          cached &&
          typeof cached.global_integrity === 'number' &&
          Date.now() - new Date(cached.timestamp).getTime() >= 15 * 60 * 1000;
        const useCarry = !cached || cachedStale;
        if (useCarry) {
          const mode = parseGIMode(carry.mode);
          const terminal_status = parseTerminalStatus(carry.terminal_status);
          if (mode && terminal_status) return { row: carry, source: 'kv_carry_forward' as const };
        }
      }
      return null;
    })();
  if (pick) {
    const { row, source } = pick;
    return {
      cycle: currentCycleId(),
      timestamp: row.timestamp,
      global_integrity: row.global_integrity,
      mode: parseGIMode(row.mode)!,
      mii_baseline: integrityStatus.mii_baseline,
      mic_supply: integrityStatus.mic_supply,
      terminal_status: parseTerminalStatus(row.terminal_status)!,
      primary_driver:
        source === 'kv_carry_forward'
          ? `${row.primary_driver} (carried forward; primary gi:latest stale or missing)`
          : row.primary_driver,
      summary: 'GI reflects signal quality, freshness, tripwire stability, and active system health.',
      source: source === 'kv_carry_forward' ? 'cached' : 'kv',
      kv: true,
      signals: {
        ...row.signals,
        geopolitics: row.signals.quality,
        economy: row.signals.system,
        sentiment: row.signals.stability,
        // Weekend floor: low-activity periods (Federal Register dark, reduced news volume)
        // should not drag information below 0.6 — signal absence is nominal on weekends.
        information: [0, 6].includes(new Date().getDay())
          ? Math.max(0.6, row.signals.freshness)
          : row.signals.freshness,
      },
    };
  }

  // 2. Fallback: compute locally from in-process signals
  const freshness = getStalenessStatus(getHeartbeat());
  const tripwire = getTripwireState();
  const signalData = resolveSignalQuality();

  const effectiveFreshness =
    signalData.source === 'mock' && freshness.status === 'fresh' ? ('degraded' as const) : freshness.status;

  const computed = computeGI({
    zeusScores: signalData.scores,
    freshness: effectiveFreshness,
    tripwire: normalizeTripwireLevel(tripwire.level),
    activeAgents: resolveActiveAgentCount(),
  });

  const source: 'live' | 'mock' | 'cached' = signalData.source;

  const coldStart = signalData.source === 'mock';
  const driver = coldStart
    ? 'GI computed from baseline signals (ECHO cold-start — awaiting fresh ingest)'
    : computed.primary_driver;

  // C-322: read paths must not write gi:latest — heartbeat / gi-refresh / sweep own persistence.

  return {
    cycle: currentCycleId(),
    timestamp: computed.timestamp,
    global_integrity: computed.global_integrity,
    mode: computed.mode,
    mii_baseline: integrityStatus.mii_baseline,
    mic_supply: integrityStatus.mic_supply,
    terminal_status: computed.terminal_status,
    primary_driver: driver,
    summary: computed.summary,
    source,
    kv: false,
    signals: {
      ...computed.signals,
      geopolitics: computed.signals.quality,
      economy: computed.signals.system,
      sentiment: computed.signals.stability,
      information: computed.signals.freshness,
    },
  };
}

export async function getLiveIntegritySnapshot(): Promise<{ global_integrity: number; mii_baseline: number }> {
  const p = await computeIntegrityPayload();
  return { global_integrity: p.global_integrity, mii_baseline: p.mii_baseline };
}

/**
 * Recompute GI from in-process heartbeat + ECHO store and persist to KV (C-280 cron).
 * Bypasses KV read cache so freshness signal updates on a schedule.
 *
 * OPT-06 (C-296): GI hysteresis — rise immediately, fall only after 3 consecutive
 * below-threshold readings. Prevents single bad freshness polls from dropping GI
 * from 0.71 to 0.61 in one tick (observed 00:45 UTC swing this cycle).
 */
export async function recomputeAndSaveGIState(): Promise<GIState | null> {
  if (!isRedisAvailable()) return null;

  const freshness = getStalenessStatus(getHeartbeat());
  const tripwire = getTripwireState();
  const signalData = resolveSignalQuality();

  const effectiveFreshness =
    signalData.source === 'mock' && freshness.status === 'fresh' ? ('degraded' as const) : freshness.status;

  const computed = computeGI({
    zeusScores: signalData.scores,
    freshness: effectiveFreshness,
    tripwire: normalizeTripwireLevel(tripwire.level),
    activeAgents: resolveActiveAgentCount(),
  });

  const source: 'live' | 'mock' | 'cached' = signalData.source;
  const coldStartCron = signalData.source === 'mock';
  const driver = coldStartCron
    ? 'GI computed from baseline signals (ECHO cold-start — awaiting fresh ingest)'
    : computed.primary_driver;

  // Hysteresis: read previous GI from the primary gi:latest key (not carry-forward which
  // only refreshes hourly). P1 fix: using the carry key caused stale reads that reset
  // gi_drop_count on consecutive runs, preventing drops from ever accumulating to 3.
  const prev = await loadGIState();
  let finalGi = computed.global_integrity;
  let hysteresisDropCount = 0;
  if (prev && typeof prev.global_integrity === 'number') {
    const prevGi = prev.global_integrity;
    if (computed.global_integrity < prevGi) {
      const existingCount: number =
        typeof (prev as GIState & { gi_drop_count?: number }).gi_drop_count === 'number'
          ? ((prev as GIState & { gi_drop_count?: number }).gi_drop_count ?? 0)
          : 0;
      hysteresisDropCount = existingCount + 1;
      if (hysteresisDropCount < 3) {
        // Not enough consecutive drops — keep previous GI value
        finalGi = prevGi;
      }
    }
  }

  const finalMode = getGiMode(finalGi);
  // P1 fix: align terminal_status thresholds with getGiMode (0.8/0.6) not 0.7/0.5
  // to avoid contradictory states (e.g. GI 0.75 = mode:yellow but status:nominal).
  const finalTerminalStatus: GIState['terminal_status'] =
    finalMode === 'green' ? 'nominal' : finalMode === 'yellow' ? 'stressed' : 'critical';

  const giState: GIState & { gi_drop_count?: number } = {
    global_integrity: Number(finalGi.toFixed(4)),
    mode: finalMode,
    terminal_status: finalTerminalStatus,
    primary_driver: hysteresisDropCount > 0 && hysteresisDropCount < 3
      ? `${driver} (hysteresis: drop ${hysteresisDropCount}/3)`
      : driver,
    source,
    gi_write_source: 'integrity',
    signals: computed.signals,
    gi_verified: computed.gi_verified,
    gi_verification_method: computed.gi_verification_method,
    timestamp: computed.timestamp,
    ...(hysteresisDropCount > 0 ? { gi_drop_count: hysteresisDropCount } : {}),
  };
  await saveGIState(giState as GIState);
  void appendGiTrend({ gi: Number(finalGi.toFixed(4)), mode: finalMode, gi_verified: computed.gi_verified, timestamp: computed.timestamp }).catch(() => {});
  const { mirrorGiStateToGithub, mirrorGiTrendToGithub } = await import('@/lib/github-cache');
  void mirrorGiStateToGithub(giState as GIState);
  const trend = await loadGiTrend();
  void mirrorGiTrendToGithub(trend);
  return giState as GIState;
}
