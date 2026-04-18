import type { ProviderConfigRecord } from '@mobius/inference-schema';

const providers = new Map<string, ProviderConfigRecord>();

/** UTC date key for daily caps */
const dailyInferenceCounts = new Map<string, { day: string; count: number }>();

export function saveProvider(rec: ProviderConfigRecord): void {
  providers.set(rec.provider_id, { ...rec });
}

export function listByUser(mobius_user_id: string): ProviderConfigRecord[] {
  return [...providers.values()].filter((p) => p.mobius_user_id === mobius_user_id);
}

export function getProvider(id: string): ProviderConfigRecord | undefined {
  return providers.get(id);
}

export function utcDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns false if daily_request_cap exceeded for this provider.
 */
export function bumpDailyInferenceCount(providerId: string, cap?: number): boolean {
  if (cap == null || cap <= 0) return true;
  const day = utcDayKey();
  const key = providerId;
  let row = dailyInferenceCounts.get(key);
  if (!row || row.day !== day) {
    row = { day, count: 0 };
  }
  if (row.count >= cap) return false;
  row.count += 1;
  dailyInferenceCounts.set(key, row);
  return true;
}
