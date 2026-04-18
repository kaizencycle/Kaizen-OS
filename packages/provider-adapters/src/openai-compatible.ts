import type { MobiusInferenceRequest, MobiusInferenceResponse } from '@mobius/inference-schema';

export interface ChatCompletionParams {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
}

function randomId(): string {
  return 'req_' + Math.random().toString(36).slice(2, 14);
}

/**
 * OpenAI-compatible chat completions POST (OpenAI, OpenRouter, local vLLM, etc.)
 */
export async function postChatCompletions(
  params: ChatCompletionParams
): Promise<{ content: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }>
{
  const url = params.baseUrl.replace(/\/$/, '') + '/v1/chat/completions';
  const started = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + params.apiKey,
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
    }),
  });
  const latency = Date.now() - started;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Provider HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  const content = data.choices?.[0]?.message?.content ?? '';
  return { content, usage: data.usage };
}

export function buildResponse(
  request: MobiusInferenceRequest,
  provider: string,
  model: string,
  latencyMs: number,
  content: string,
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined,
  userKeyUsed: boolean,
  fallbackUsed?: boolean,
  fallbackModel?: string
): MobiusInferenceResponse {
  const now = new Date().toISOString();
  return {
    ok: true,
    provider,
    model,
    latency_ms: latencyMs,
    usage,
    output: { role: 'assistant', content },
    provenance: {
      request_id: randomId(),
      timestamp: now,
      mobius_scope: request.scope,
      user_key_used: userKeyUsed,
      fallback_used: fallbackUsed,
      fallback_model: fallbackModel,
    },
  };
}
