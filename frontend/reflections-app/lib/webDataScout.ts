/**
 * WebDataScout - Web data extraction wrapper for Lab7 OAA system
 * 
 * Integrates with external web scraping services (parse.bot, etc.) to extract
 * structured data from web pages for use in OAA lessons, civic data indexing,
 * and operational intelligence.
 * 
 * Architecture integration:
 * - Planner (Jade) → decides what URL + fields are needed
 * - I/O (Hermes) → calls WebDataScout.extract({ url, schema })
 * - Executor (Zeus) → post-process (clean, validate, cache)
 * - Reviewer (Eve) → approves deltas; logs to Command Ledger III and Ops Logs
 */

export type ScoutSchema = { 
  name: string; 
  selector?: string; 
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  transform?: (value: any) => any;
}[];

export type ScoutResult = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
  meta: { 
    url: string; 
    fetchedAt: string; 
    layoutHash?: string; 
    provider: string;
    retryCount?: number;
    cacheHit?: boolean;
  };
};

export type ScoutConfig = {
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  cacheTtlSeconds?: number;
  enablePiiRedaction?: boolean;
  enableLayoutDriftDetection?: boolean;
  fallbackEndpoint?: string;
  opsGuardConfig?: OpsGuardConfig;
};

const DEFAULT_CONFIG: Required<ScoutConfig> = {
  timeoutMs: 20_000,
  retryCount: 2,
  retryDelayMs: 1200,
  cacheTtlSeconds: 3600,
  enablePiiRedaction: true,
  enableLayoutDriftDetection: true,
  fallbackEndpoint: '',
  opsGuardConfig: {
    piiThreshold: 0.8,
    safetyThreshold: 0.7,
    enablePiiDetection: true,
    enableContentSafety: true,
    enablePolicyEvaluation: true,
  },
};

// Global cache interface (can be replaced with Redis, etc.)
interface CacheInterface {
  get(key: string): Promise<ScoutResult | null>;
  set(key: string, value: ScoutResult, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Simple in-memory cache implementation
class MemoryCache implements CacheInterface {
  private cache = new Map<string, { value: ScoutResult; expires: number }>();

  async get(key: string): Promise<ScoutResult | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return { ...item.value, meta: { ...item.value.meta, cacheHit: true } };
  }

  async set(key: string, value: ScoutResult, ttl: number = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

// Global cache instance
const cache: CacheInterface = new MemoryCache();

/**
 * Calculate layout hash for drift detection
 */
function calculateLayoutHash(html: string): string {
  // Simple hash based on DOM structure (can be enhanced)
  const cleanHtml = html
    .replace(/\s+/g, ' ')
    .replace(/<!--.*?-->/g, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '');
  
  // Simple hash function (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < cleanHtml.length; i++) {
    const char = cleanHtml.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

import { processWithOpsGuard, type OpsGuardConfig } from './opsGuard';

/**
 * Enhanced PII redaction using Ops Guard integration
 */
async function redactPii(data: Record<string, unknown>, sourceUrl: string, config: OpsGuardConfig = {
  enablePiiDetection: true,
  enableContentSafety: true,
  enablePolicyEvaluation: true,
  piiThreshold: 0.8,
  safetyThreshold: 0.7,
}): Promise<Record<string, unknown>> {
  try {
    const result = await processWithOpsGuard(data, sourceUrl, config);
    
    // Log warnings if any
    if (result.piiResult.warnings.length > 0) {
      console.warn('PII warnings:', result.piiResult.warnings);
    }
    
    if (result.safetyResult.detectedIssues.length > 0) {
      console.warn('Safety issues detected:', result.safetyResult.detectedIssues);
    }
    
    if (result.policyResult.reasons.length > 0) {
      console.warn('Policy evaluation reasons:', result.policyResult.reasons);
    }
    
    return result.processedData;
  } catch (error) {
    console.warn('Ops Guard processing failed, using fallback redaction:', error);
    
    // Fallback to simple redaction
    const redacted = { ...data };
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    
    for (const [key, value] of Object.entries(redacted)) {
      if (typeof value === 'string') {
        redacted[key] = value
          .replace(emailRegex, '[EMAIL_REDACTED]')
          .replace(phoneRegex, '[PHONE_REDACTED]');
      }
    }
    
    return redacted;
  }
}

/**
 * Call the web scraping provider
 */
async function callProvider(
  url: string, 
  fields: ScoutSchema, 
  config: Required<ScoutConfig>
): Promise<ScoutResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const endpoint = process.env.SCOUT_ENDPOINT || process.env.NEXT_PUBLIC_SCOUT_ENDPOINT;
    if (!endpoint) {
      throw new Error('SCOUT_ENDPOINT not configured');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.SCOUT_API_KEY || process.env.NEXT_PUBLIC_SCOUT_API_KEY || '',
        'User-Agent': 'Lab7-WebDataScout/1.0',
      },
      body: JSON.stringify({ 
        url, 
        fields,
        options: {
          timeout: config.timeoutMs,
          enableLayoutDriftDetection: config.enableLayoutDriftDetection,
        }
      }),
      signal: controller.signal,
    });

    const json = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      return {
        ok: false,
        error: json.error || response.statusText || 'provider_error',
        meta: {
          url,
          fetchedAt: new Date().toISOString(),
          provider: 'scout',
        }
      };
    }

    return {
      ok: true,
      data: json.data,
      meta: {
        url,
        fetchedAt: new Date().toISOString(),
        layoutHash: json.layoutHash,
        provider: 'scout',
      }
    };

  } catch (error: any) {
    return {
      ok: false,
      error: error.name === 'AbortError' ? 'timeout' : error.message || 'network_error',
      meta: {
        url,
        fetchedAt: new Date().toISOString(),
        provider: 'scout',
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Validate extracted data against schema
 */
function validateSchema(data: Record<string, unknown>, fields: ScoutSchema): string | null {
  for (const field of fields) {
    if (field.required && !(field.name in data)) {
      return `missing_required_field:${field.name}`;
    }
    
    if (field.name in data) {
      const value = data[field.name];
      
      // Type validation
      if (field.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== field.type) {
          return `type_mismatch:${field.name}, expected ${field.type}, got ${actualType}`;
        }
      }
      
      // Transform if specified
      if (field.transform && typeof field.transform === 'function') {
        try {
          data[field.name] = field.transform(value);
        } catch (error) {
          return `transform_error:${field.name}, ${error}`;
        }
      }
    }
  }
  
  return null;
}

/**
 * Main extraction function
 */
export async function extract(
  url: string, 
  fields: ScoutSchema, 
  config: ScoutConfig = {}
): Promise<ScoutResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // 1) Cache check
  const cacheKey = `scout:${url}:${JSON.stringify(fields)}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 2) Primary attempt with retries
  let result: ScoutResult = { 
    ok: false, 
    error: 'no_attempts', 
    meta: { url, fetchedAt: new Date().toISOString(), provider: 'scout' } 
  };

  for (let attempt = 0; attempt <= finalConfig.retryCount; attempt++) {
    result = await callProvider(url, fields, finalConfig);
    
    if (result.ok) break;
    
    if (attempt < finalConfig.retryCount) {
      await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelayMs));
    }
  }

  // 3) Fallback provider if available
  if (!result.ok && finalConfig.fallbackEndpoint) {
    // TODO: Implement fallback provider call
    // This would call an alternative scraping service
  }

  // 4) Schema validation
  if (result.ok && result.data) {
    const validationError = validateSchema(result.data, fields);
    if (validationError) {
      return {
        ok: false,
        error: validationError,
        meta: result.meta
      };
    }
  }

  // 5) PII redaction and Ops Guard processing
  if (result.ok && result.data && finalConfig.enablePiiRedaction) {
    try {
      result.data = await redactPii(result.data, url, finalConfig.opsGuardConfig);
    } catch (error) {
      console.warn('PII redaction failed:', error);
      // Continue without redaction rather than failing
    }
  }

  // 6) Store in cache
  if (result.ok) {
    await cache.set(cacheKey, result, finalConfig.cacheTtlSeconds);
  }

  return result;
}

/**
 * Batch extraction for multiple URLs
 */
export async function extractBatch(
  requests: Array<{ url: string; fields: ScoutSchema; config?: ScoutConfig }>
): Promise<ScoutResult[]> {
  const results = await Promise.allSettled(
    requests.map(req => extract(req.url, req.fields, req.config))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        ok: false,
        error: result.reason?.message || 'batch_error',
        meta: {
          url: requests[index].url,
          fetchedAt: new Date().toISOString(),
          provider: 'scout',
        }
      };
    }
  });
}

/**
 * Clear cache for a specific URL or all cache
 */
export async function clearCache(url?: string): Promise<void> {
  if (url) {
    // Clear specific URL cache entries
    const keys = Array.from((cache as MemoryCache)['cache'].keys());
    const urlKeys = keys.filter(key => key.includes(`scout:${url}:`));
    await Promise.all(urlKeys.map(key => cache.delete(key)));
  } else {
    // Clear all cache
    (cache as MemoryCache)['cache'].clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  const memoryCache = cache as MemoryCache;
  const keys = Array.from(memoryCache['cache'].keys());
  return {
    size: keys.length,
    keys: keys.slice(0, 10) // Return first 10 keys for debugging
  };
}

// Export types for external use
export type { CacheInterface };
export type { OpsGuardConfig } from './opsGuard';