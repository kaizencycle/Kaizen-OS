/**
 * @mobius/inference-schema — normalized inference + provider config (C-285 draft)
 */

export type InferenceRole = 'system' | 'user' | 'assistant';

export interface InferenceMessage {
  role: InferenceRole;
  content: string;
}

export interface MobiusInferenceContext {
  cycle?: string;
  agent?: string;
  attach_to_journal?: boolean;
  write_provenance?: boolean;
}

/** Normalized inference request (MobiusSDK API). */
export interface MobiusInferenceRequest {
  task: string;
  input: InferenceMessage[];
  provider: string;
  model: string;
  fallbacks?: string[];
  scope: string;
  mobius_context?: MobiusInferenceContext;
}

export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface InferenceProvenance {
  request_id: string;
  timestamp: string;
  mobius_scope: string;
  user_key_used: boolean;
  fallback_used?: boolean;
  fallback_model?: string;
}

export interface MobiusInferenceResponse {
  ok: boolean;
  provider: string;
  model: string;
  latency_ms: number;
  usage?: TokenUsage;
  output: {
    role: 'assistant';
    content: string;
  };
  provenance: InferenceProvenance;
  error?: string;
}

export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'local';

export interface ProviderBudget {
  monthly_usd_cap?: number;
  daily_request_cap?: number;
}

export interface ProviderConfigRecord {
  provider_id: string;
  mobius_user_id: string;
  provider: ProviderName | string;
  label: string;
  /** Encrypted blob id / reference — never raw key */
  api_key_ref: string;
  default_model: string;
  allowed_models: string[];
  budget?: ProviderBudget;
  scopes: string[];
  status: 'active' | 'revoked' | 'disabled';
  created_at: string;
  updated_at: string;
}

export const INFERENCE_SCOPES = [
  'chat',
  'journal',
  'oaa',
  'builder',
  'research',
  'terminal_read',
  'terminal_admin',
  'agent_runtime',
] as const;

export type InferenceScope = (typeof INFERENCE_SCOPES)[number];
