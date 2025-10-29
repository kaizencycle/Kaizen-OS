/**
 * Core types for the Codex-Agentic Federation
 * Multi-LLM routing and consensus system for Kaizen OS
 */

export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'local';

export type FoundingAgent =
  | 'AUREA'   // Integrity & Reasoning
  | 'ATLAS'   // Systems & Policy
  | 'ZENITH'  // Research & Ethics
  | 'SOLARA'  // Computation & Optimization
  | 'JADE'    // Morale & Astro-ethics
  | 'EVE'     // Governance & Wisdom
  | 'ZEUS'    // Security & Defense
  | 'HERMES'  // Markets & Information
  | 'KAIZEN'; // Core Constitution (Dormant)

export interface StabilityAnchor {
  agent: FoundingAgent;
  domainFocus: string;
  defaultRoute: ProviderId[];
  minAgreement: number;           // e.g., 0.90 (90% agreement threshold)
  giTarget: number;               // e.g., 0.99 (target GI score)
  ledgerNamespace: string;        // e.g., "consensus:aurea"
  website: string;                // e.g., "aurea.gic"
  learnWebhook?: string;          // OAA Hub webhook URL
  active: boolean;                // Agent is active and can participate
}

export interface CodexRequest {
  agent: FoundingAgent;
  input: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeoutMs?: number;
  tags?: string[];                // e.g., ["consensus", "oaa", "eval"]
}

export interface CodexVote {
  provider: ProviderId;
  output: string;
  usage?: {
    prompt: number;
    completion: number;
  };
  meta?: Record<string, unknown>;
}

export interface DelibProof {
  agreement: number;              // 0..1 (proportion of votes in agreement)
  votes: CodexVote[];
  winner: CodexVote;              // The winning vote/output
  traceId: string;                // Unique identifier for ledger attestation
  giScore: number;                // 0..1 (Governance Integrity score)
  timestamp: string;              // ISO timestamp
}

export interface ProviderAdapter {
  name: ProviderId;
  chat(req: CodexRequest, signal?: AbortSignal): Promise<CodexVote>;
}

export interface LedgerAttestation {
  namespace: string;
  traceId: string;
  agent: string;
  agreement: number;
  giScore: number;
  providers: string[];
  timestamp?: string;
}

export interface OAALearnPayload {
  agent: string;
  traceId: string;
  input: string;
  output: string;
  agreement: number;
  giScore: number;
  timestamp?: string;
}
