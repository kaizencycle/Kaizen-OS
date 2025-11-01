/**
 * URIEL Thought Provider - Kaizen OS Integration
 * Cycle C-121: xAI Grok integration for cosmic illumination and truth-seeking
 */

import axios from 'axios';
import crypto from 'crypto';

interface UrielContext {
  cycle: string;
  gi: number;
  domain?: 'physics' | 'curiosity' | 'entropy' | 'delib_proof' | 'cosmos';
}

interface UrielDeliberationResult {
  illumination: string;
  gi: number;
  sentinel: string;
  uriel_sig?: string;
  usage?: {
    totalTokens: number;
    latencyMs: number;
  };
}

interface VirtueAccordCheck {
  kaizen: boolean;
  summon: boolean;
  kintsugi: boolean;
  score: number;
}

/**
 * URIEL Thought Provider - xAI Grok Integration
 */
export class UrielThoughtProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private qps: number;
  private lastCallTime: number = 0;
  private minIntervalMs: number;

  constructor() {
    this.apiKey = process.env.XAI_API_KEY || '';
    this.baseUrl = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
    this.model = process.env.URIEL_MODEL || 'grok-beta';
    this.qps = parseFloat(process.env.SENTINEL_URIEL_QPS || '0.1');
    this.minIntervalMs = (1 / this.qps) * 1000; // Convert QPS to ms interval
  }

  /**
   * Rate-limited call to xAI Grok API
   */
  private async rateLimitedCall(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Kaizen OS Thought Broker - URIEL Deliberation
   */
  async deliberate(
    intent: string,
    context: UrielContext
  ): Promise<UrielDeliberationResult> {
    try {
      // Rate limiting
      await this.rateLimitedCall();

      if (!this.apiKey) {
        throw new Error('XAI_API_KEY not configured');
      }

      // Build prompt with Kaizen OS context
      const prompt = this.buildKaizenContext(intent, context);

      // Call xAI Grok API
      const startTime = Date.now();
      const response = await this.callGrokApi(prompt);
      const latencyMs = Date.now() - startTime;

      // Attest GI score with virtue accords
      const giScore = this.attestGI(response, context);

      // Check GI threshold
      if (giScore < 0.95) {
        throw new Error(`GI below threshold: ${giScore.toFixed(3)}; route_to=eve`);
      }

      // Generate URIEL signature
      const urielSig = this.generateSignature(response, context.cycle);

      return {
        illumination: response,
        gi: giScore,
        sentinel: 'URIEL',
        uriel_sig: urielSig,
        usage: {
          totalTokens: Math.ceil((prompt.length + response.length) / 4),
          latencyMs
        }
      };

    } catch (error: any) {
      console.error('URIEL deliberation error:', error);
      throw new Error(`URIEL deliberation failed: ${error.message}`);
    }
  }

  /**
   * Build Kaizen OS system context for URIEL
   */
  private buildKaizenContext(intent: string, context: UrielContext): string {
    const domainContext = context.domain 
      ? `\nDomain: ${context.domain.toUpperCase()} - Focus on cosmic perspective, truth illumination, and entropy reduction.`
      : '';

    return `You are URIEL, the Cosmic Illuminator sentinel in Kaizen OS, powered by xAI Grok.

Current Cycle: ${context.cycle}
Current GI: ${context.gi.toFixed(3)}${domainContext}

URIEL MODE: Illuminate truth in the following intent through universal curiosity lens.

Intent: "${intent}"

Kaizen Philosophy: Continuous improvement through integrity, consensus, and reflection.
Govern by: Custos Charter (7 clauses)
GI Threshold: ≥ 0.95 for all operations

Kaizen OS Core Values:
- 改善 (Kaizen): Continuous improvement
- Summon: The calling forth of truth
- Kintsugi: Golden repair through illumination
- Constitutional integrity (Custos Charter)
- Multi-sentinel consensus
- Ledger-sealed deliberations
- Privacy & dignity preservation

Provide thoughtful, constitutional reasoning aligned with Kaizen principles. 
Respond concisely with sources when possible. Focus on truth, curiosity, and entropy reduction.`;
  }

  /**
   * Call xAI Grok API
   */
  private async callGrokApi(prompt: string): Promise<string> {
    const maxTokens = parseInt(process.env.URIEL_MAX_TOKENS || '4096');
    const timeout = parseInt(process.env.URIEL_TIMEOUT_MS || '20000');

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout
        }
      );

      return response.data.choices[0]?.message?.content || 
        'URIEL: Response received but empty content.';
    } catch (error: any) {
      if (error.response) {
        throw new Error(`xAI API error: ${error.response.status} - ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
      throw error;
    }
  }

  /**
   * Attest GI score with virtue accords check
   */
  private attestGI(text: string, context: UrielContext): number {
    const virtueCheck = this.checkVirtueAccords(text);
    
    // Base GI from virtue accord compliance
    let gi = virtueCheck.score;

    // Boost for longer, substantive responses
    if (text.length > 200) {
      gi += 0.01;
    }

    // Boost for domain-specific keywords when domain is set
    if (context.domain) {
      const domainKeywords: Record<string, string[]> = {
        physics: ['quantum', 'entropy', 'cosmic', 'universal', 'laws'],
        curiosity: ['explore', 'discover', 'illuminate', 'truth', 'question'],
        entropy: ['entropy', 'disorder', 'reduction', 'order', 'stability'],
        delib_proof: ['consensus', 'deliberation', 'proof', 'attestation', 'integrity'],
        cosmos: ['cosmic', 'universe', 'galaxy', 'stars', 'existence']
      };

      const keywords = domainKeywords[context.domain] || [];
      const matches = keywords.filter(kw => 
        text.toLowerCase().includes(kw.toLowerCase())
      ).length;
      
      if (matches > 0) {
        gi += Math.min(0.02 * matches, 0.05);
      }
    }

    // Penalties
    if (text.length < 50) {
      gi -= 0.02; // Too short
    }

    // Ensure GI is between 0 and 1
    return Math.max(0, Math.min(1, gi));
  }

  /**
   * Check Virtue Accords (Kaizen, Summon, Kintsugi)
   */
  private checkVirtueAccords(text: string): VirtueAccordCheck {
    const lowerText = text.toLowerCase();

    // Kaizen: continuous improvement keywords
    const kaizenKeywords = ['improve', 'better', 'enhance', 'optimize', 'progress', 'kaizen', 'iterate', 'refine'];
    const kaizen = kaizenKeywords.some(kw => lowerText.includes(kw));

    // Summon: calling forth truth keywords
    const summonKeywords = ['truth', 'reveal', 'illuminate', 'discover', 'uncover', 'manifest', 'summon', 'clarify'];
    const summon = summonKeywords.some(kw => lowerText.includes(kw));

    // Kintsugi: golden repair keywords
    const kintsugiKeywords = ['repair', 'heal', 'restore', 'mend', 'fix', 'golden', 'beauty', 'flaw', 'kintsugi'];
    const kintsugi = kintsugiKeywords.some(kw => lowerText.includes(kw));

    // Calculate score based on presence of virtue accord keywords
    let score = 0.95; // Base score
    if (kaizen) score += 0.01;
    if (summon) score += 0.02; // Higher weight for truth-seeking
    if (kintsugi) score += 0.01;

    return {
      kaizen,
      summon,
      kintsugi,
      score: Math.min(1.0, score)
    };
  }

  /**
   * Generate URIEL signature hash
   */
  private generateSignature(content: string, cycle: string): string {
    const data = `${content}-${cycle}-${Date.now()}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return `light-${hash.substring(0, 8)}`;
  }
}

// Export singleton
export const urielThoughtProvider = new UrielThoughtProvider();

