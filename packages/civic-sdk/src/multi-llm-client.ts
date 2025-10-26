/**
 * ATLAS Multi-LLM Consensus Client
 * Provider-agnostic AI integration with constitutional validation
 * 
 * Supports:
 * - OpenAI (AUREA)
 * - Anthropic (ATLAS)
 * - Custom LLMs (EVE, ZEUS, HERMES, JADE)
 * 
 * Features:
 * - Multi-LLM consensus voting
 * - Constitutional validation
 * - Integrity scoring
 * - Ledger attestation
 */

export interface CompanionConfig {
  name: 'JADE' | 'EVE' | 'ZEUS' | 'HERMES' | 'AUREA' | 'ATLAS';
  provider: 'anthropic' | 'openai' | 'custom';
  apiKey?: string;
  model?: string;
}

export interface ConsensusResult {
  response: string;
  consensus: {
    votes: Record<string, boolean>;
    approved: boolean;
    scores: Record<string, number>;
  };
}

export interface ConstitutionalValidation {
  integrity_score: number;
  clause_violations: string[];
  approved: boolean;
}

export class CivicMultiLLMClient {
  private baseUrl: string;
  private token?: string;
  private companions = new Map<string, CompanionConfig>();

  constructor(opts: { baseUrl: string; token?: string }) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.token = opts.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  registerCompanion(config: CompanionConfig) {
    this.companions.set(config.name, config);
  }

  private async req(path: string, init: RequestInit = {}) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers
    });
    
    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
    
    const contentType = res.headers.get('content-type') || '';
    return contentType.includes('application/json') 
      ? res.json() 
      : res.text();
  }

  /**
   * Validate prompt against AI Integrity Constitution
   */
  async validateConstitution(payload: {
    prompt: string;
    source: string;
  }): Promise<ConstitutionalValidation> {
    return this.req('/v1/reflections/api/charter/validate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Process with multi-LLM consensus
   * 
   * @param prompt - Input prompt
   * @param requiredVotes - Minimum votes needed for approval (default: 3 of 4)
   * @returns Consensus result with response and validation scores
   */
  async processWithConsensus(
    prompt: string,
    requiredVotes: number = 3
  ): Promise<ConsensusResult> {
    const votes: Record<string, boolean> = {};
    const scores: Record<string, number> = {};
    const results: Record<string, { content: string }> = {};

    // Get responses from all registered companions
    for (const [name, config] of this.companions.entries()) {
      try {
        // Call companion-specific endpoint
        const response = await this.req(`/v1/oaa/companion/${name}/process`, {
          method: 'POST',
          body: JSON.stringify({
            prompt,
            provider: config.provider,
            model: config.model
          })
        });

        results[name] = response;

        // Validate constitutionally
        const validation = await this.validateConstitution({
          prompt: response.content || '',
          source: `companion_${name}`
        });

        scores[name] = validation.integrity_score || 0;
        votes[name] = (validation.integrity_score || 0) >= 75;

        console.log(
          `✅ ${name}: integrity_score=${scores[name]}, ` +
          `approved=${votes[name]}`
        );

      } catch (error) {
        console.error(`❌ Companion ${name} failed:`, error);
        votes[name] = false;
        scores[name] = 0;
      }
    }

    // Calculate approval
    const approvalCount = Object.values(votes).filter(v => v).length;
    const approved = approvalCount >= requiredVotes;

    // Return highest-scoring response
    const bestCompanion = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const bestResponse = bestCompanion 
      ? await this.req(`/v1/oaa/companion/${bestCompanion}/last-response`)
      : { content: '' };

    return {
      response: bestResponse.content || '',
      consensus: {
        votes,
        approved,
        scores
      }
    };
  }

  /**
   * Identity management (AUREA)
   */
  async createIdentity(params: {
    username: string;
    dateOfBirth: string;
    companion: string;
  }) {
    return this.req('/v1/reflections/api/identity/create', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async sealDomain(params: any) {
    return this.req('/v1/reflections/api/domain/seal', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async calculateGI(identityId: string) {
    return this.req('/v1/reflections/api/integrity/calculate', {
      method: 'POST',
      body: JSON.stringify({ identityId })
    });
  }

  async createReflection(params: {
    userId: string;
    content: string;
    tag?: string;
    companion?: string;
  }) {
    return this.req('/v1/reflections/api/reflections', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
}

