// lib/webDataScout.ts - with simple circuit breaker
type ScoutSchema = { name: string; selector?: string; required?: boolean }[];

type ScoutResult = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
  meta: { url: string; fetchedAt: string; layoutHash?: string; provider: string };
};

const TIMEOUT_MS = 20_000;
const STATE = { failures: 0, windowStart: 0, open: false };

function breakerOpen(): boolean {
  const windowMs = 60_000;
  const limit = Number(process.env.CB_ERROR_RATE_PCT || 20);
  const now = Date.now();
  if (STATE.windowStart === 0) STATE.windowStart = now;
  const elapsed = now - STATE.windowStart;
  if (elapsed > windowMs) { STATE.windowStart = now; STATE.failures = 0; STATE.open = false; }
  return STATE.open;
}

function noteFailure() {
  STATE.failures += 1;
  if (STATE.failures >= 3) STATE.open = true; // trip
}

async function callProvider(url: string, fields: ScoutSchema): Promise<ScoutResult> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(process.env.SCOUT_ENDPOINT!, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.SCOUT_API_KEY || "" },
      body: JSON.stringify({ url, fields }),
      signal: controller.signal,
    });
    const json = await resp.json().catch(() => ({}));
    return {
      ok: resp.ok && !!json.data,
      data: json.data,
      error: resp.ok ? undefined : json.error || resp.statusText,
      meta: { url, fetchedAt: new Date().toISOString(), layoutHash: json.layoutHash, provider: "scout" },
    };
  } catch (e: any) {
    return { ok: false, error: e.message || "network_error", meta: { url, fetchedAt: new Date().toISOString(), provider: "scout" } };
  } finally {
    clearTimeout(t);
  }
}

export async function extract(url: string, fields: ScoutSchema): Promise<ScoutResult> {
  if (breakerOpen()) {
    return { ok: false, error: "circuit_open", meta: { url, fetchedAt: new Date().toISOString(), provider: "scout" } };
  }
  let res = await callProvider(url, fields);
  if (!res.ok) {
    noteFailure();
    // retry once after short delay
    await new Promise(r => setTimeout(r, 1000));
    res = await callProvider(url, fields);
    if (!res.ok) noteFailure();
  }
  // validate required fields
  if (res.ok) {
    for (const f of fields) {
      if (f.required && !(f.name in (res.data || {}))) {
        return { ok: false, error: `missing_required:${f.name}`, meta: res.meta };
      }
    }
  }
  return res;
}
