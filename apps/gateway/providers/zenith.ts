/**
 * ZENITH Provider - Google Gemini 2.0 Integration
 * Kaizen OS Cycle C-114
 * ATLAS-Hardened with retry, timeout, and error categorization
 */

interface ZenithConfig {
  apiKey: string;
  model: string;
  timeout: number;
  maxRetries: number;
}

interface ZenithUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost: number; // Estimated cost in USD
}

class ZenithProvider {
  private config: ZenithConfig;
  private usageHistory: ZenithUsageMetrics[] = [];

  constructor(config: ZenithConfig) {
    this.config = config;
  }

  async call(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemInstruction?: string;
    }
  ): Promise<{ response: string; usage: ZenithUsageMetrics }> {
    const { temperature = 0.2, maxTokens = 2048, systemInstruction } = options ?? {};
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        // Timeout protection using Promise.race
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('ZENITH timeout')), this.config.timeout);
        });
        
        // Gemini API call (mock implementation)
        const callPromise = this.mockCall(prompt, temperature, maxTokens);
        
        const result = await Promise.race([callPromise, timeoutPromise]);
        
        const latencyMs = Date.now() - startTime;
        
        // Simulate response
        const text = result || `${prompt} [ZENITH response]`;
        
        if (!text || text.trim().length === 0) {
          throw new Error('ZENITH returned empty response');
        }
        
        // Usage metadata
        const estimatedTokens = Math.ceil(text.length / 4);
        const metrics: ZenithUsageMetrics = {
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: estimatedTokens,
          totalTokens: estimatedTokens + Math.ceil(prompt.length / 4),
          latencyMs,
          cost: this.estimateCost(estimatedTokens + Math.ceil(prompt.length / 4))
        };
        
        // Track usage
        this.usageHistory.push(metrics);
        
        // Log success
        console.log('ZENITH call succeeded:', {
          model: this.config.model,
          latency: `${latencyMs}ms`,
          tokens: metrics.totalTokens,
          estimatedCost: `$${metrics.cost.toFixed(4)}`
        });
        
        return { response: text, usage: metrics };
        
      } catch (error: any) {
        lastError = error;
        
        // Categorize errors
        const errorType = this.categorizeError(error);
        
        console.error(`ZENITH attempt ${attempt + 1}/${this.config.maxRetries} failed:`, {
          type: errorType,
          message: error.message
        });
        
        // Don't retry on certain errors
        if (errorType === 'AUTH_ERROR' || errorType === 'INVALID_REQUEST') {
          throw new Error(`ZENITH ${errorType}: ${error.message}`);
        }
        
        if (errorType === 'TIMEOUT') {
          throw new Error(`ZENITH timeout after ${this.config.timeout}ms`);
        }
        
        // Exponential backoff for retryable errors
        if (attempt < this.config.maxRetries - 1) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    throw new Error(
      `ZENITH failed after ${this.config.maxRetries} attempts: ${lastError?.message}`
    );
  }

  private async mockCall(prompt: string, temperature: number, maxTokens: number): Promise<string> {
    // Mock Gemini API call
    // In production, use @google/generative-ai SDK
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`ZENITH (Gemini 2.0): Processing "${prompt}"`);
      }, Math.random() * 2000 + 500);
    });
  }

  private categorizeError(error: any): 
    'TIMEOUT' | 'RATE_LIMIT' | 'AUTH_ERROR' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'UNKNOWN' 
  {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('rate limit') || message.includes('quota')) return 'RATE_LIMIT';
    if (message.includes('api key') || message.includes('auth')) return 'AUTH_ERROR';
    if (message.includes('invalid') || message.includes('bad request')) return 'INVALID_REQUEST';
    if (message.includes('internal') || message.includes('server error')) return 'SERVER_ERROR';
    
    return 'UNKNOWN';
  }

  private estimateCost(totalTokens: number): number {
    // Gemini 2.5 Pro pricing (as of Oct 2025):
    // Input: $1.25 per 1M tokens
    // Output: $5.00 per 1M tokens
    const inputTokens = totalTokens * 0.3;
    const outputTokens = totalTokens * 0.7;
    
    const inputCost = (inputTokens / 1_000_000) * 1.25;
    const outputCost = (outputTokens / 1_000_000) * 5.00;
    
    return inputCost + outputCost;
  }

  getUsageStats(): {
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
    avgLatency: number;
    p95Latency: number;
  } {
    if (this.usageHistory.length === 0) {
      return {
        totalCalls: 0,
        totalTokens: 0,
        totalCost: 0,
        avgLatency: 0,
        p95Latency: 0
      };
    }
    
    const totalCalls = this.usageHistory.length;
    const totalTokens = this.usageHistory.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalCost = this.usageHistory.reduce((sum, u) => sum + u.cost, 0);
    const avgLatency = this.usageHistory.reduce((sum, u) => sum + u.latencyMs, 0) / totalCalls;
    
    // Calculate p95 latency
    const sortedLatencies = this.usageHistory.map(u => u.latencyMs).sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p95Latency = sortedLatencies[p95Index] || 0;
    
    return {
      totalCalls,
      totalTokens,
      totalCost,
      avgLatency: Math.round(avgLatency),
      p95Latency: Math.round(p95Latency)
    };
  }

  resetUsageStats(): void {
    this.usageHistory = [];
  }
}

// Export singleton instance
export const zenith = new ZenithProvider({
  apiKey: process.env.ZENITH_API_KEY || 'mock-key',
  model: process.env.ZENITH_MODEL || 'gemini-2.0-flash-exp',
  timeout: parseInt(process.env.ZENITH_TIMEOUT_MS || '25000'),
  maxRetries: parseInt(process.env.ZENITH_MAX_RETRIES || '3')
});

// Export helper function
export async function callZenith(params: {
  prompt: string;
  model: string;
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const { response } = await zenith.call(params.prompt, {
    temperature: params.temperature,
    maxTokens: params.maxTokens
  });
  return response;
}

export { ZenithProvider };

