/**
 * Mobius KV — Upstash Redis Persistence Layer
 *
 * Provides durable key-value storage that survives Vercel cold starts.
 * Uses Upstash Redis via HTTP REST (no TCP connections needed).
 *
 * Design:
 *   - Cache-through: read from Redis first, fall back to in-memory
 *   - Write-through: write to both Redis and in-memory simultaneously
 *   - Graceful degradation: if Redis is unavailable, system continues
 *     with in-memory-only behavior (same as before this integration)
 *   - All values are JSON-serialized automatically
 *   - TTL support for automatic expiration
 *
 * Required env vars (set in Vercel project settings):
 *   UPSTASH_REDIS_REST_URL   — Upstash REST endpoint (or KV_REST_API_URL from Vercel KV)
 *   UPSTASH_REDIS_REST_TOKEN — Upstash REST auth token (or KV_REST_API_TOKEN)
 *
 * Optional secondary Redis (TCP `redis://` or `rediss://`):
 *   REDIS_URL — classic Redis URL; health-checked via `/api/kv/health` as `backup_redis`
 *   MOBIUS_KV_BACKUP_MIRROR — mirror continuity-critical keys only (see `lib/kv/backupMirrorPolicy.ts`) when `REDIS_URL` set
 *     (defaults to enabled unless explicitly `false`)
 *   MOBIUS_KV_READ_FALLBACK — read from backup when primary GET misses or errors (defaults on when `REDIS_URL` set)
 *
 *   OAA KV bridge (C-286) — warm tier on Render when Upstash hits monthly limits:
 *   OAA_API_BASE_URL (or OAA_API_BASE / NEXT_PUBLIC_OAA_API_URL) + KV_BRIDGE_SECRET
 *
 * Free tier: 500K commands/month — bridge absorbs writes / serves reads when primary fails.
 *
 * CC0 Public Domain
 */

import { Redis } from '@upstash/redis';
import { getGiMode } from '@/lib/gi/mode';
import {
  backupPrefixedGet,
  backupRawGet,
  getBackupRedisHealth,
  scheduleBackupMirrorPrefixedKey,
  scheduleBackupMirrorRawDel,
  scheduleBackupMirrorRawKey,
} from '@/lib/kv/backup-redis';
import { KV_TTL_SECONDS } from '@/lib/kv/kv-ttl';
import {
  isKvCapacityOrTransportError,
  kvBridgeConfigured,
  kvBridgeReadForPrefixedKey,
  kvBridgeReadForRawKey,
  kvBridgeReadVaultComposite,
  kvBridgeWrite,
  kvBridgeWriteVaultSnapshot,
  scheduleKvBridgeDualWrite,
  scheduleKvBridgeMirrorPrefixed,
  scheduleKvBridgeMirrorRaw,
} from '@/lib/kv/kvBridgeClient';
import {
  prefixedRedisKeyToBridgeSymbol,
  rawRedisKeyToBridgeSymbol,
  VAULT_BRIDGE_SYMBOL,
} from '@/lib/kv/kvBridgeKeys';

export { KV_TTL_SECONDS };

const VAULT_BALANCE_LOGICAL = 'vault:global:balance';
const VAULT_META_LOGICAL = 'vault:global:meta';

function isVaultBalanceOrMetaKey(key: string): boolean {
  return key === VAULT_BALANCE_LOGICAL || key === VAULT_META_LOGICAL;
}

// ── Redis client (lazy singleton) ────────────────────────────

let _redis: Redis | null = null;
let _redisAvailable: boolean | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    _redisAvailable = false;
    return null;
  }

  try {
    _redis = new Redis({ url, token });
    _redisAvailable = true;
    return _redis;
  } catch {
    _redisAvailable = false;
    return null;
  }
}

/**
 * Check if Redis is configured and available.
 */
export function isRedisAvailable(): boolean {
  if (_redisAvailable !== null) return _redisAvailable;
  getRedis();
  return _redisAvailable ?? false;
}

// ── Key prefix (namespace all Mobius keys) ───────────────────

const PREFIX = 'mobius:';

function prefixKey(key: string): string {
  return `${PREFIX}${key}`;
}

// ── Core operations ──────────────────────────────────────────

/**
 * Get a value from Redis. Returns null if not found or Redis unavailable.
 */
export async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const fullKey = prefixKey(key);

  if (!redis) {
    const fb = await backupPrefixedGet<T>(key);
    if (fb !== null) return fb;
    if (kvBridgeConfigured()) {
      if (isVaultBalanceOrMetaKey(key)) {
        const comp = await kvBridgeReadVaultComposite<T, unknown>();
        if (!comp) return null;
        return (key === VAULT_BALANCE_LOGICAL ? comp.balance : (comp.meta as T)) ?? null;
      }
      return kvBridgeReadForPrefixedKey<T>(fullKey);
    }
    return null;
  }

  try {
    const value = await redis.get<T>(fullKey);
    if (value !== null && value !== undefined) return value;
    const fb = await backupPrefixedGet<T>(key);
    if (fb !== null) return fb;
    if (kvBridgeConfigured()) {
      if (isVaultBalanceOrMetaKey(key)) {
        const comp = await kvBridgeReadVaultComposite<T, unknown>();
        if (!comp) return null;
        return (key === VAULT_BALANCE_LOGICAL ? comp.balance : (comp.meta as T)) ?? null;
      }
      const bridgedMiss = await kvBridgeReadForPrefixedKey<T>(fullKey);
      if (bridgedMiss !== null) return bridgedMiss;
    }
    return null;
  } catch (err) {
    console.warn(`[mobius-kv] GET ${key} failed:`, err instanceof Error ? err.message : err);
    const fb = await backupPrefixedGet<T>(key);
    if (fb !== null) return fb;
    if (kvBridgeConfigured() && isKvCapacityOrTransportError(err)) {
      if (isVaultBalanceOrMetaKey(key)) {
        const comp = await kvBridgeReadVaultComposite<T, unknown>();
        if (!comp) return null;
        return (key === VAULT_BALANCE_LOGICAL ? comp.balance : (comp.meta as T)) ?? null;
      }
      const bridged = await kvBridgeReadForPrefixedKey<T>(fullKey);
      if (bridged !== null) return bridged;
    }
    return null;
  }
}

/** Read Redis key exactly as given (no `mobius:` prefix). */
export async function kvGetRaw<T>(rawKey: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) {
    const fb = await backupRawGet<T>(rawKey);
    if (fb !== null) return fb;
    return kvBridgeConfigured() ? kvBridgeReadForRawKey<T>(rawKey) : null;
  }
  try {
    const value = await redis.get<T>(rawKey);
    if (value !== null && value !== undefined) return value;
    const fb = await backupRawGet<T>(rawKey);
    if (fb !== null) return fb;
    if (kvBridgeConfigured()) {
      const bridged = await kvBridgeReadForRawKey<T>(rawKey);
      if (bridged !== null) return bridged;
    }
    return null;
  } catch (err) {
    console.warn(`[mobius-kv] GET raw ${rawKey} failed:`, err instanceof Error ? err.message : err);
    const fb = await backupRawGet<T>(rawKey);
    if (fb !== null) return fb;
    if (kvBridgeConfigured() && isKvCapacityOrTransportError(err)) {
      const b = await kvBridgeReadForRawKey<T>(rawKey);
      if (b !== null) return b;
    }
    return null;
  }
}

/**
 * Set a value in Redis.
 * @param ttlSeconds — optional TTL in seconds (default: no expiry)
 */
export async function kvSet<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    if (!kvBridgeConfigured()) return false;
    if (isVaultBalanceOrMetaKey(key)) {
      return kvSetVaultViaBridgeOnly(key, value, ttlSeconds);
    }
    const symbol = prefixedRedisKeyToBridgeSymbol(prefixKey(key));
    if (!symbol || symbol === VAULT_BRIDGE_SYMBOL) return false;
    return kvBridgeWrite(symbol, value, ttlSeconds);
  }

  try {
    const fullKey = prefixKey(key);
    if (ttlSeconds) {
      await redis.set(fullKey, value, { ex: ttlSeconds });
    } else {
      await redis.set(fullKey, value);
    }
    scheduleBackupMirrorPrefixedKey(fullKey, value, ttlSeconds);
    if (isVaultBalanceOrMetaKey(key)) {
      void mirrorVaultCompositeToOaaBridge();
    } else {
      scheduleKvBridgeMirrorPrefixed(fullKey, value, ttlSeconds);
    }
    return true;
  } catch (err) {
    console.warn(`[mobius-kv] SET ${key} failed:`, err instanceof Error ? err.message : err);
    if (kvBridgeConfigured() && isKvCapacityOrTransportError(err)) {
      if (isVaultBalanceOrMetaKey(key)) {
        return kvSetVaultViaBridgeOnly(key, value, ttlSeconds);
      }
      const symbol = prefixedRedisKeyToBridgeSymbol(prefixKey(key));
      if (!symbol || symbol === VAULT_BRIDGE_SYMBOL) return false;
      return kvBridgeWrite(symbol, value, ttlSeconds);
    }
    return false;
  }
}

/** When only one vault field is written to the bridge, merge with the other field from the last composite snapshot. */
async function kvSetVaultViaBridgeOnly(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<boolean> {
  const comp = await kvBridgeReadVaultComposite<unknown, unknown>();
  const balance = key === VAULT_BALANCE_LOGICAL ? value : (comp?.balance ?? null);
  const meta = key === VAULT_META_LOGICAL ? value : (comp?.meta ?? null);
  return kvBridgeWriteVaultSnapshot(balance, meta, ttlSeconds);
}

/** After a successful primary vault row write, mirror `{ balance, meta }` to OAA (one allowlist slot). */
async function mirrorVaultCompositeToOaaBridge(): Promise<void> {
  if (!kvBridgeConfigured()) return;
  const redis = getRedis();
  if (!redis) return;
  try {
    const balance = await redis.get<number>(prefixKey(VAULT_BALANCE_LOGICAL));
    const meta = await redis.get<unknown>(prefixKey(VAULT_META_LOGICAL));
    void kvBridgeWriteVaultSnapshot(balance, meta).catch(() => {});
  } catch {
    /* non-fatal */
  }
}

/**
 * Set a value at the exact Redis key (no `mobius:` prefix). For legacy keys like `TRIPWIRE_STATE`.
 */
export async function kvSetRawKey<T>(rawKey: string, value: T, ttlSeconds?: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    if (!kvBridgeConfigured()) return false;
    const sym = rawRedisKeyToBridgeSymbol(rawKey);
    if (!sym) return false;
    return kvBridgeWrite(sym, value, ttlSeconds);
  }
  try {
    if (ttlSeconds) {
      await redis.set(rawKey, value, { ex: ttlSeconds });
    } else {
      await redis.set(rawKey, value);
    }
    scheduleBackupMirrorRawKey(rawKey, value, ttlSeconds);
    scheduleKvBridgeMirrorRaw(rawKey, value, ttlSeconds);
    return true;
  } catch (err) {
    console.warn(`[mobius-kv] SET raw ${rawKey} failed:`, err instanceof Error ? err.message : err);
    if (kvBridgeConfigured() && isKvCapacityOrTransportError(err)) {
      const sym = rawRedisKeyToBridgeSymbol(rawKey);
      if (!sym) return false;
      return kvBridgeWrite(sym, value, ttlSeconds);
    }
    return false;
  }
}

/**
 * Delete a key from Redis.
 */
export async function kvDel(key: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  try {
    const fullKey = prefixKey(key);
    await redis.del(fullKey);
    scheduleBackupMirrorRawDel(fullKey);
    return true;
  } catch (err) {
    console.warn(`[mobius-kv] DEL ${key} failed:`, err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Check if a key exists in Redis.
 */
export async function kvExists(key: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  try {
    const result = await redis.exists(prefixKey(key));
    return result === 1;
  } catch {
    return false;
  }
}

/**
 * Returns the Redis type of a raw key ('string', 'list', 'hash', 'none', etc.)
 * Returns 'unavailable' if Redis is not configured.
 */
export async function kvTypeRaw(rawKey: string): Promise<string> {
  const redis = getRedis();
  if (!redis) return 'unavailable';
  try {
    return await redis.type(rawKey);
  } catch {
    return 'error';
  }
}

/**
 * Returns the Redis type of a prefixed Mobius key.
 */
export async function kvType(key: string): Promise<string> {
  return kvTypeRaw(prefixKey(key));
}

/**
 * Safe GET that catches WRONGTYPE errors (key stored as list but read as string).
 * Returns null instead of throwing. Use for keys that may have been written as
 * different types across cycle boundaries.
 */
export async function safeGet<T>(key: string): Promise<T | null> {
  try {
    return await kvGet<T>(key);
  } catch (err) {
    if (err instanceof Error && err.message.includes('WRONGTYPE')) {
      console.warn(`[mobius-kv] safeGet: key ${key} has wrong type, returning null`);
      return null;
    }
    throw err;
  }
}

/**
 * Safe raw GET with WRONGTYPE guard.
 */
export async function safeGetRaw<T>(rawKey: string): Promise<T | null> {
  try {
    return await kvGetRaw<T>(rawKey);
  } catch (err) {
    if (err instanceof Error && err.message.includes('WRONGTYPE')) {
      console.warn(`[mobius-kv] safeGetRaw: key ${rawKey} has wrong type, returning null`);
      return null;
    }
    throw err;
  }
}

/** LPUSH + LTRIM on a prefixed list (e.g. readiness feed). Returns false if Redis unavailable. */
export async function kvLpushCapped(key: string, value: string, maxLen: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const cap = Math.max(1, Math.floor(maxLen));
  try {
    const fullKey = prefixKey(key);
    await redis.lpush(fullKey, value);
    await redis.ltrim(fullKey, 0, cap - 1);
    return true;
  } catch (err) {
    console.warn(`[mobius-kv] LPUSH ${key} failed:`, err instanceof Error ? err.message : err);
    return false;
  }
}

/** Read up to `count` elements from a list key (prefixed with `mobius:`). */
export async function kvLrange<T = unknown>(key: string, start: number, stop: number): Promise<T[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const result = await redis.lrange<T>(prefixKey(key), start, stop);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

// ── Mobius-specific compound operations ──────────────────────

/**
 * Key constants for Mobius state
 */
export const KV_KEYS = {
  /** Substrate tokenomics-engine MIC_READINESS_V1 snapshot (canonical when present) */
  MIC_READINESS_SNAPSHOT: 'mic:readiness:snapshot',
  /** Rolling feed of posted readiness snapshots (newest-first, capped in writer) */
  MIC_READINESS_FEED: 'mic:readiness:feed',
  /** Last signal snapshot from micro-agents */
  SIGNAL_SNAPSHOT: 'signals:latest',
  /** Last GI computation result */
  GI_STATE: 'gi:latest',
  /** Last successful GI row (long TTL) — C-286 carry-forward when primary TTL expires */
  GI_STATE_CARRY: 'gi:latest_carry',
  /** v1 vault cumulative balance (prefixed mobius:…) */
  VAULT_GLOBAL_BALANCE: 'vault:global:balance',
  /** v1 vault meta row */
  VAULT_GLOBAL_META: 'vault:global:meta',
  /** Operator cycle hint (written by heartbeat cron) */
  CURRENT_CYCLE: 'operator:current_cycle',
  /** ECHO store state (epicon, ledger, alerts) */
  ECHO_STATE: 'echo:state',
  /**
   * ECHO ingest heartbeat — mirrors legacy `ECHO_STATE` string key checks in ops tooling.
   * Written alongside `echo:state` on each ingest.
   */
  ECHO_STATE_KV: 'echo:kv:heartbeat',
  /** Tripwire state */
  TRIPWIRE_STATE: 'tripwire:state',
  /** Tripwire heartbeat for KV key-exists diagnostics (mirrors legacy TRIPWIRE_STATE string key) */
  TRIPWIRE_STATE_KV: 'tripwire:kv:heartbeat',
  /** Last heartbeat timestamp */
  HEARTBEAT: 'heartbeat:last',
  /** Last ingest timestamp */
  LAST_INGEST: 'ingest:last',
  /** High-frequency system pulse — updated on every micro sweep and journal write */
  SYSTEM_PULSE: 'system:pulse',
  /** Short-circuit hot ledger API after repeated timeouts (C-286) */
  LEDGER_CIRCUIT_OPEN: 'ledger:circuit_open',
  /** MIC sustain cycle counter (C-287) */
  MIC_SUSTAIN_STATE: 'mic:sustain:state',
  /** MIC replay pressure envelope — ingest duplicate bumps, time-decayed (C-287) */
  MIC_REPLAY_PRESSURE: 'mic:replay:pressure',
  /** Substrate attestation retry queue — seal_ids whose substrate write failed at finalization */
  SUBSTRATE_RETRY_QUEUE: 'vault:substrate:retry_queue',
  /** Rolling list of last 48 GI readings for trend analysis (newest-first, capped at 48) */
  GI_TREND: 'gi:trend',
} as const;

// ── Signal snapshot persistence ──────────────────────────────

export type SignalSnapshot = {
  composite: number;
  anomalies: number;
  allSignals: Array<{
    agentName: string;
    source: string;
    value: number;
    label: string;
    severity: string;
    timestamp?: string;
  }>;
  timestamp: string;
  healthy: boolean;
  /** C-287 — stable hash of instrument values for dedupe writes */
  signal_hash?: string;
  /** When true, composite/instruments unchanged vs prior hash; `checkedAt` may be newer than `timestamp` */
  unchanged?: boolean;
  checkedAt?: string;
};

/**
 * Save the latest signal snapshot to Redis.
 * TTL: 2 hours — survives between visitor-triggered sweeps during low traffic.
 * Freshness is tracked via the embedded timestamp, not TTL expiry.
 */
function hashSignalValues(snapshot: SignalSnapshot): string {
  const stable = (snapshot.allSignals ?? [])
    .map((s) => `${s.agentName}:${Number(s.value).toFixed(3)}`)
    .sort()
    .join('|');
  let h = 0;
  for (let i = 0; i < stable.length; i += 1) {
    h = (Math.imul(31, h) + stable.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Persists signal snapshot; skips full rewrite when instrument values match prior hash (O2).
 */
export async function saveSignalSnapshot(snapshot: SignalSnapshot): Promise<void> {
  const signalHash = hashSignalValues(snapshot);
  const prev = await loadSignalSnapshot();
  if (prev?.signal_hash === signalHash && prev.signal_hash) {
    const light: SignalSnapshot = {
      ...prev,
      checkedAt: new Date().toISOString(),
      unchanged: true,
      signal_hash: signalHash,
    };
    await kvSet(KV_KEYS.SIGNAL_SNAPSHOT, light, KV_TTL_SECONDS.SIGNAL_SNAPSHOT);
    scheduleKvBridgeDualWrite('SIGNAL_SNAPSHOT', light, KV_TTL_SECONDS.SIGNAL_SNAPSHOT, 'c287-dual-write');
    return;
  }
  const full: SignalSnapshot = {
    ...snapshot,
    signal_hash: signalHash,
    unchanged: false,
    checkedAt: snapshot.timestamp,
  };
  await kvSet(KV_KEYS.SIGNAL_SNAPSHOT, full, KV_TTL_SECONDS.SIGNAL_SNAPSHOT);
  scheduleKvBridgeDualWrite('SIGNAL_SNAPSHOT', full, KV_TTL_SECONDS.SIGNAL_SNAPSHOT, 'c287-dual-write');
}

/**
 * Load the latest signal snapshot from Redis.
 */
export async function loadSignalSnapshot(): Promise<SignalSnapshot | null> {
  return kvGet<SignalSnapshot>(KV_KEYS.SIGNAL_SNAPSHOT);
}

// ── GI state persistence ─────────────────────────────────────

export type GIState = {
  global_integrity: number;
  mode: string;
  terminal_status: string;
  primary_driver: string;
  source: 'live' | 'mock' | 'cached';
  /** When set to `micro_sweep`, shorter KV freshness window applies in `resolveGiForTerminal`. */
  gi_write_source?: 'micro_sweep' | 'integrity';
  signals: {
    quality: number;
    freshness: number;
    stability: number;
    system: number;
  };
  /** True when ≥3 independent signal values agree within ±0.1 band (C-298). */
  gi_verified?: boolean;
  /** Describes how gi_verified was determined (e.g. "multi-source-consensus(3/4)"). */
  gi_verification_method?: string;
  timestamp: string;
};

export type GITrendEntry = {
  gi: number;
  mode: string;
  gi_verified: boolean;
  timestamp: string;
};

/**
 * Save the latest GI state. TTL: see `KV_TTL_SECONDS.GI_STATE` (C-286 extended for cycle-open).
 */
export async function saveGIState(state: GIState): Promise<void> {
  await kvSet(KV_KEYS.GI_STATE, state, KV_TTL_SECONDS.GI_STATE);
  // Carry-forward row: long TTL DR path — hourly cadence by default to cut KV writes (override with MOBIUS_KV_GI_CARRY_ALWAYS=true).
  const alwaysCarry = process.env.MOBIUS_KV_GI_CARRY_ALWAYS?.trim().toLowerCase() === 'true';
  const fiveMinSlot = Math.floor(Date.now() / 300_000);
  const hourlyCarryTick = fiveMinSlot % 12 === 0;
  if (alwaysCarry || hourlyCarryTick) {
    await kvSet(KV_KEYS.GI_STATE_CARRY, state, 604800);
  }
  scheduleKvBridgeDualWrite('GI_STATE', state, KV_TTL_SECONDS.GI_STATE, 'c287-dual-write');
}

/**
 * After micro-agent sweep: align `GI_STATE.global_integrity` with composite so MIC readiness
 * and KV-backed surfaces are not 5–15 minutes behind live sweep (C-286 close).
 * Preserves non-quality signal dimensions from the last full integrity row when present.
 */
export async function saveGiStateFromMicroSweep(args: {
  composite: number;
  signalQuality: number;
  /** When caller already loaded `gi:latest` (e.g. MGET bundle), avoids an extra GET. */
  preloadedGi?: GIState | null;
  /** gi_verified from computeGI — carried through so sweep writes retain verification status. */
  gi_verified?: boolean;
  gi_verification_method?: string;
}): Promise<void> {
  const gi = Math.max(0, Math.min(1, args.composite));
  const mode = getGiMode(gi);
  const terminal_status: GIState['terminal_status'] =
    mode === 'green' ? 'nominal' : mode === 'yellow' ? 'stressed' : 'critical';
  const prev = args.preloadedGi !== undefined ? args.preloadedGi : await loadGIState();
  const q = Math.max(0, Math.min(1, args.signalQuality));
  const timestamp = new Date().toISOString();
  // Sweep just ran — freshness resets to 1.0. This prevents stale carry-forward values
  // from locking freshness/information signals at 0.3 indefinitely after a stale period.
  // Decay from 1.0 is handled by the score window in buildStatus; a running sweep is fresh.
  const state: GIState = {
    global_integrity: Number(gi.toFixed(3)),
    mode,
    terminal_status,
    primary_driver:
      'GI global_integrity aligned to micro-sensor composite after sweep (freshness/stability from last full pass)',
    source: 'live',
    gi_write_source: 'micro_sweep',
    signals: {
      quality: Number(q.toFixed(3)),
      freshness: 1.0,
      stability: prev?.signals.stability ?? 0.5,
      system: prev?.signals.system ?? 0.5,
    },
    gi_verified: args.gi_verified,
    gi_verification_method: args.gi_verification_method,
    timestamp,
  };
  await saveGIState(state);
  void appendGiTrend({ gi: Number(gi.toFixed(3)), mode, gi_verified: args.gi_verified ?? false, timestamp }).catch(() => {});
  const { mirrorGiStateToGithub, mirrorGiTrendToGithub } = await import('@/lib/github-cache');
  void mirrorGiStateToGithub(state);
  const trend = await loadGiTrend();
  void mirrorGiTrendToGithub(trend);
}

/**
 * Load the last-known GI state — KV hot cache first, GitHub CDN fallback (C-322).
 */
export async function loadGIState(): Promise<GIState | null> {
  try {
    const hot = await kvGet<GIState>(KV_KEYS.GI_STATE);
    if (hot) return hot;
  } catch {
    /* KV suspended or unreachable */
  }
  const { ghLoadGiState } = await import('@/lib/github-cache');
  return ghLoadGiState();
}

/** Long-TTL duplicate of last `saveGIState` write — for cycle-open / KV primary expiry. */
export async function loadGIStateCarry(): Promise<GIState | null> {
  return kvGet<GIState>(KV_KEYS.GI_STATE_CARRY);
}

/**
 * Append a GI reading to the rolling trend list (newest-first, capped at 48 entries ≈ 8h at 10-min cadence).
 * Skips write if Redis is unavailable. Non-blocking — callers should fire-and-forget.
 */
export async function appendGiTrend(entry: GITrendEntry): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    const prev = (await kvGet<GITrendEntry[]>(KV_KEYS.GI_TREND)) ?? [];
    const updated = [entry, ...prev].slice(0, 48);
    // 24h TTL — trend is diagnostic; can regenerate on next sweep
    await kvSet(KV_KEYS.GI_TREND, updated, 86400);
  } catch {
    // non-fatal
  }
}

/** Load the GI trend list — KV first, GitHub CDN fallback (C-322). */
export async function loadGiTrend(): Promise<GITrendEntry[]> {
  try {
    const hot = await kvGet<GITrendEntry[]>(KV_KEYS.GI_TREND);
    if (hot?.length) return hot;
  } catch {
    /* KV suspended */
  }
  const { ghLoadGiTrend } = await import('@/lib/github-cache');
  return ghLoadGiTrend();
}

// ── ECHO state persistence ───────────────────────────────────

export type EchoKVState = {
  lastIngest: string | null;
  cycleId: string;
  totalIngested: number;
  healthy: boolean;
  epiconCount: number;
  ledgerCount: number;
  alertCount: number;
  dedupRate?: number;
  timestamp: string;
};

/**
 * Save ECHO store summary. TTL: 2 hours (matches /api/cron/echo-ingest cadence).
 */
export async function saveEchoState(state: EchoKVState): Promise<void> {
  await kvSet(KV_KEYS.ECHO_STATE, state, KV_TTL_SECONDS.ECHO_STATE);
}

/**
 * Load ECHO store summary.
 */
export async function loadEchoState(): Promise<EchoKVState | null> {
  return kvGet<EchoKVState>(KV_KEYS.ECHO_STATE);
}

// ── Tripwire state persistence ───────────────────────────────

export type TripwireKVState = {
  cycleId: string;
  tripwireCount: number;
  elevated: boolean;
  timestamp: string;
};

/**
 * Save tripwire state. TTL: 30 minutes.
 */
let _lastTripwireSemanticJson: string | null = null;

export async function saveTripwireState(state: TripwireKVState): Promise<void> {
  // Dedupe on semantic fields only — callers often pass a fresh `timestamp` per poll.
  const semantic = JSON.stringify({
    cycleId: state.cycleId,
    tripwireCount: state.tripwireCount,
    elevated: state.elevated,
  });
  if (_lastTripwireSemanticJson === semantic) {
    return;
  }
  _lastTripwireSemanticJson = semantic;
  await kvSet(KV_KEYS.TRIPWIRE_STATE, state, KV_TTL_SECONDS.TRIPWIRE_STATE);
}

/**
 * Load tripwire state.
 */
function applyTripwireDecayInPlace(state: TripwireKVState): TripwireKVState {
  if (!state.elevated) return state;
  const ts = new Date(state.timestamp).getTime();
  if (!Number.isFinite(ts)) return state;
  const hours = (Date.now() - ts) / (1000 * 60 * 60);
  if (hours <= 2) return state;
  return {
    ...state,
    elevated: false,
    tripwireCount: 0,
    timestamp: new Date().toISOString(),
  };
}

export async function loadTripwireState(): Promise<TripwireKVState | null> {
  const row = await kvGet<TripwireKVState>(KV_KEYS.TRIPWIRE_STATE);
  if (!row) return null;
  const decayed = applyTripwireDecayInPlace(row);
  if (decayed.elevated !== row.elevated) {
    void saveTripwireState(decayed).catch(() => {});
    return decayed;
  }
  return row;
}

// ── Health check ─────────────────────────────────────────────

/**
 * Check Redis health and return diagnostic info.
 */
export type KvInspectKeyRow = {
  key: string;
  type: string;
  ttlSeconds: number | null;
  sample: unknown;
};

/**
 * Operator debug: list Redis keys matching pattern and sample values.
 * Uses raw Redis key names (includes `mobius:` prefix where writers use `kvSet`).
 */
export async function kvInspectSamples(pattern: string, limit: number): Promise<{
  ok: boolean;
  error: string | null;
  totalMatched: number;
  keys: KvInspectKeyRow[];
}> {
  const redis = getRedis();
  if (!redis) {
    return { ok: false, error: 'Redis unavailable or not configured', totalMatched: 0, keys: [] };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePattern = pattern.trim() || '*';

  try {
    // Use SCAN instead of KEYS — Upstash rejects KEYS on large namespaces
    const matched: string[] = [];
    let cursor = 0;
    do {
      const [nextCursor, batch] = await redis.scan(cursor, { match: safePattern, count: 100 });
      matched.push(...batch);
      cursor = Number(nextCursor);
      if (matched.length >= safeLimit * 4) break; // guard: stop early, we only need safeLimit rows
    } while (cursor !== 0);
    const totalMatched = matched.length;
    const slice = matched.slice(0, safeLimit);
    const keys: KvInspectKeyRow[] = [];

    for (const key of slice) {
      const t = await redis.type(key);
      let ttlSeconds: number | null = null;
      try {
        const ttl = await redis.ttl(key);
        ttlSeconds = ttl === undefined || ttl === null ? null : ttl;
      } catch {
        ttlSeconds = null;
      }

      let sample: unknown = null;
      try {
        if (t === 'string') {
          sample = await redis.get(key);
        } else if (t === 'list') {
          sample = await redis.lrange(key, 0, 4);
        } else if (t === 'hash') {
          sample = await redis.hgetall(key);
        } else if (t === 'zset') {
          sample = await redis.zrange(key, 0, 4, { withScores: true });
        } else {
          sample = { note: `unsupported type: ${t}` };
        }
      } catch (err) {
        sample = { error: err instanceof Error ? err.message : 'read failed' };
      }

      keys.push({ key, type: t, ttlSeconds, sample });
    }

    return { ok: true, error: null, totalMatched, keys };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'keys scan failed',
      totalMatched: 0,
      keys: [],
    };
  }
}

/** Atomically increment a raw key's float value via INCRBYFLOAT. Returns new value or null. */
export async function kvIncrByFloatRaw(rawKey: string, delta: number): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.incrbyfloat(rawKey, delta);
  } catch (err) {
    console.warn(`[mobius-kv] INCRBYFLOAT ${rawKey} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Atomically increment a raw key's integer value via INCRBY. Returns new value or null. */
export async function kvIncrByRaw(rawKey: string, delta: number): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.incrby(rawKey, delta);
  } catch (err) {
    console.warn(`[mobius-kv] INCRBY ${rawKey} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Set TTL on a raw key without changing its value. */
export async function kvExpireRaw(rawKey: string, ttlSeconds: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.expire(rawKey, ttlSeconds);
  } catch {
    /* non-fatal */
  }
}

export async function kvHealth(): Promise<{
  available: boolean;
  configured: boolean;
  latencyMs: number | null;
  error: string | null;
  backup_redis: Awaited<ReturnType<typeof getBackupRedisHealth>>;
}> {
  const configured = !!(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );

  const backup_redis = await getBackupRedisHealth();

  if (!configured) {
    return {
      available: false,
      configured: false,
      latencyMs: null,
      error: 'Env vars not set',
      backup_redis,
    };
  }

  const redis = getRedis();
  if (!redis) {
    return {
      available: false,
      configured: true,
      latencyMs: null,
      error: 'Redis client init failed',
      backup_redis,
    };
  }

  try {
    const start = Date.now();
    await redis.ping();
    const latencyMs = Date.now() - start;
    return { available: true, configured: true, latencyMs, error: null, backup_redis };
  } catch (err) {
    return {
      available: false,
      configured: true,
      latencyMs: null,
      error: err instanceof Error ? err.message : 'Unknown error',
      backup_redis,
    };
  }
}
