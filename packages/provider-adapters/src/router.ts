import type { MobiusInferenceRequest, MobiusInferenceResponse } from '@mobius/inference-schema';
import { postChatCompletions, buildResponse } from './openai-compatible';

const OPENAI_BASE = 'https://api.openai.com';
const OPENROUTER_BASE = 'https://openrouter.ai/api';

export interface AdapterExecuteOptions {
  request: MobiusInferenceRequest;
  apiKey: string;
  /** When provider is `local`, use this base (e.g. http://127.0.0.1:11434/v1 from ollama) */
  localBaseUrl?: string;
}

/**
 * Execute inference with primary model then optional fallbacks (same provider wire for v0.1).
 * Fallback list entries are model ids, not provider switches.
 */
export async function executeWithFallbacks(opts: AdapterExecuteOptions): Promise<MobiusInferenceResponse> {
  const { request, apiKey, localBaseUrl } = opts;
  const provider = String(request.provider).toLowerCase();
  const baseUrl =
    provider === 'openrouter'
      ? OPENROUTER_BASE
      : provider === 'local'
        ? (localBaseUrl || 'http://127.0.0.1:11434').replace(/\/v1\/?$/, '')
        : OPENAI_BASE;

  const models = [request.model, ...(request.fallbacks || [])].filter(Boolean);
  let lastErr: Error | null = null;
  const startedAll = Date.now();

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const t0 = Date.now();
    try {
      const { content, usage } = await postChatCompletions({
        baseUrl: baseUrl,
        apiKey,
        model,
        messages: request.input.map((m) => ({ role: m.role, content: m.content })),
      });
      const latency = Date.now() - t0;
      return buildResponse(
        request,
        provider,
        model,
        latency,
        content,
        usage,
        true,
        i > 0,
        i > 0 ? model : undefined
      );
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }

  const now = new Date().toISOString();
  return {
    ok: false,
    provider,
    model: request.model,
    latency_ms: Date.now() - startedAll,
    output: { role: 'assistant', content: '' },
    provenance: {
      request_id: 'req_err_' + Math.random().toString(36).slice(2, 10),
      timestamp: now,
      mobius_scope: request.scope,
      user_key_used: true,
    },
    error: lastErr ? lastErr.message : 'All models failed',
  };
}
