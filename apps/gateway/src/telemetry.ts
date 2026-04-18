export interface InferenceTelemetryEvent {
  at: string;
  mobius_user_id: string;
  provider_id?: string;
  scope: string;
  ok: boolean;
  latency_ms: number;
  model?: string;
  provider?: string;
  fallback_used?: boolean;
  error?: string;
}

const events: InferenceTelemetryEvent[] = [];
const MAX = 500;

export function recordInference(ev: InferenceTelemetryEvent): void {
  events.push(ev);
  if (events.length > MAX) events.splice(0, events.length - MAX);
}

export function getTelemetrySummary(): {
  total: number;
  ok_rate: number;
  p50_latency_ms: number;
  recent_errors: number;
  by_scope: Record<string, number>;
} {
  if (events.length === 0) {
    return { total: 0, ok_rate: 1, p50_latency_ms: 0, recent_errors: 0, by_scope: {} };
  }
  const ok = events.filter((e) => e.ok).length;
  const latencies = [...events].map((e) => e.latency_ms).sort((a, b) => a - b);
  const mid = Math.floor(latencies.length / 2);
  const p50 = latencies.length % 2 ? latencies[mid] : Math.round((latencies[mid - 1] + latencies[mid]) / 2);
  const recent = events.slice(-50);
  const recentErrors = recent.filter((e) => !e.ok).length;
  const by_scope: Record<string, number> = {};
  for (const e of events) {
    by_scope[e.scope] = (by_scope[e.scope] || 0) + 1;
  }
  return {
    total: events.length,
    ok_rate: ok / events.length,
    p50_latency_ms: p50,
    recent_errors: recentErrors,
    by_scope,
  };
}

export function recentEvents(limit: number): InferenceTelemetryEvent[] {
  return events.slice(-limit);
}
