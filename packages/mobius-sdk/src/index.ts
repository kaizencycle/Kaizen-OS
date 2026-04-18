import type { MobiusInferenceRequest, MobiusInferenceResponse, ProviderConfigRecord } from '@mobius/inference-schema';

export type { MobiusInferenceRequest, MobiusInferenceResponse, ProviderConfigRecord } from '@mobius/inference-schema';

export interface MobiusClientOptions {
  baseUrl: string;
  /** Bearer token for gateway (e.g. MOBIUS_GATEWAY_BEARER) */
  token?: string;
}

export class MobiusClient {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(opts: MobiusClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.token = opts.token;
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) {
      h.Authorization = 'Bearer ' + this.token;
    }
    return h;
  }

  async infer(body: MobiusInferenceRequest & { mobius_user_id: string; provider_id?: string }): Promise<MobiusInferenceResponse> {
    const res = await fetch(this.baseUrl + '/v1/inference', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as MobiusInferenceResponse & { error?: string };
    if (!res.ok) {
      throw new Error(json.error || 'Inference failed: ' + res.status);
    }
    return json;
  }

  async registerProvider(body: {
    mobius_user_id: string;
    provider: string;
    label: string;
    api_key: string;
    default_model: string;
    allowed_models: string[];
    scopes: string[];
    budget?: { monthly_usd_cap?: number; daily_request_cap?: number };
  }): Promise<{ provider: ProviderConfigRecord }> {
    const res = await fetch(this.baseUrl + '/v1/providers', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { provider?: ProviderConfigRecord; error?: string };
    if (!res.ok) {
      throw new Error(json.error || 'Register failed: ' + res.status);
    }
    if (!json.provider) throw new Error('Invalid response');
    return { provider: json.provider };
  }

  async listProviders(mobius_user_id: string): Promise<{ providers: ProviderConfigRecord[] }> {
    const url = new URL(this.baseUrl + '/v1/providers');
    url.searchParams.set('mobius_user_id', mobius_user_id);
    const res = await fetch(url.toString(), { headers: this.headers() });
    const json = (await res.json()) as { providers?: ProviderConfigRecord[]; error?: string };
    if (!res.ok) throw new Error(json.error || 'List failed: ' + res.status);
    return { providers: json.providers || [] };
  }

  async testProvider(providerId: string, mobius_user_id: string): Promise<{ ok: boolean; latency_ms?: number; error?: string }> {
    const res = await fetch(this.baseUrl + '/v1/providers/' + encodeURIComponent(providerId) + '/test', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ mobius_user_id }),
    });
    const json = (await res.json()) as { ok?: boolean; latency_ms?: number; error?: string };
    if (!res.ok) throw new Error(json.error || 'Probe failed: ' + res.status);
    return { ok: !!json.ok, latency_ms: json.latency_ms, error: json.error };
  }
}
