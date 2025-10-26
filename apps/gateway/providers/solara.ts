/**
 * SOLARA (DeepSeek R1) Provider Adapter
 * Cost-efficient reasoning companion for Civic OS
 * 
 * Features:
 * - Timeout protection (default 20s)
 * - Exponential backoff retry (3 attempts)
 * - Constitutional validation compatible
 * - Full audit trail support
 */

import fetch from 'node-fetch';
import { setTimeout } from 'timers/promises';

export interface SolaraConfig {
  prompt: string;
  model: string;
  apiKey: string;
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
  temperature?: number;
}

export class SolaraProvider {
  constructor(
    private apiKey: string,
    private model: string = 'deepseek-r1',
    private timeoutMs: number = 20000,
    private maxRetries: number = 3
  ) {}

  async call(config: SolaraConfig): Promise<string> {
    const { prompt, temperature = 0.2, maxTokens = 1024 } = config;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`🤖 SOLARA: Attempt ${attempt + 1}/${this.maxRetries}`);
        
        // Timeout protection
        const controller = new AbortController();
        const timeoutId = setTimeout(this.timeoutMs, () => controller.abort());
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
            stream: false  // Explicit non-streaming for consistency
          }),
          signal: controller.signal as any
        });
        
        clearTimeout(timeoutId as any);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`SOLARA API error (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          throw new Error('SOLARA returned empty response');
        }
        
        // Log usage for monitoring
        console.log('✅ SOLARA call succeeded:', {
          model: this.model,
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
          cost: `~$${(data.usage?.total_tokens || 0) * 0.00001}` // $0.01 per 1K tokens
        });
        
        return content;
        
      } catch (error: any) {
        lastError = error;
        console.error(`❌ SOLARA attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.name === 'AbortError') {
          throw new Error(`SOLARA timeout after ${this.timeoutMs}ms`);
        }
        
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying SOLARA in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`SOLARA failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }
}

// Export singleton instance
export function createSolaraProvider(): SolaraProvider {
  return new SolaraProvider(
    process.env.SOLARA_API_KEY!,
    process.env.SOLARA_MODEL || 'deepseek-r1',
    parseInt(process.env.SOLARA_TIMEOUT_MS || '20000'),
    parseInt(process.env.SOLARA_MAX_RETRIES || '3')
  );
}

