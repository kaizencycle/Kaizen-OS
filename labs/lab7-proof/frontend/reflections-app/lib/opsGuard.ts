/**
 * Ops Guard Integration for WebDataScout
 * 
 * Integrates with the existing Lab7 Ops Guard system for PII redaction,
 * content safety, and policy enforcement. Provides enhanced security
 * for web data extraction results.
 */

export interface PiiDetectionResult {
  hasPii: boolean;
  confidence: number;
  detectedTypes: string[];
  redactedData: Record<string, unknown>;
  warnings: string[];
}

export interface ContentSafetyResult {
  isSafe: boolean;
  confidence: number;
  detectedIssues: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PolicyEvaluationResult {
  effect: 'pass' | 'deny' | 'review';
  reasons: string[];
  confidence: number;
}

export interface OpsGuardConfig {
  enablePiiDetection: boolean;
  enableContentSafety: boolean;
  enablePolicyEvaluation: boolean;
  piiThreshold: number;
  safetyThreshold: number;
  policyEndpoint?: string;
  redactionEndpoint?: string;
}

const DEFAULT_CONFIG: Required<OpsGuardConfig> = {
  enablePiiDetection: true,
  enableContentSafety: true,
  enablePolicyEvaluation: true,
  piiThreshold: 0.2,
  safetyThreshold: 0.8,
  policyEndpoint: '/api/ops-guard/policy',
  redactionEndpoint: '/api/ops-guard/redact',
};

/**
 * Enhanced PII detection and redaction
 */
export async function detectAndRedactPii(
  data: Record<string, unknown>,
  config: Partial<OpsGuardConfig> = {}
): Promise<PiiDetectionResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Basic PII patterns
  const piiPatterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    url: /https?:\/\/[^\s]+/g,
    // Add more patterns as needed
  };

  const detectedTypes: string[] = [];
  const warnings: string[] = [];
  let confidence = 0;
  const redactedData = { ...data };

  // Scan for PII patterns
  for (const [type, pattern] of Object.entries(piiPatterns)) {
    let found = false;
    
    for (const [key, value] of Object.entries(redactedData)) {
      if (typeof value === 'string') {
        const matches = value.match(pattern);
        if (matches && matches.length > 0) {
          found = true;
          detectedTypes.push(type);
          
          // Redact the sensitive data
          redactedData[key] = value.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
          
          // Calculate confidence based on match count and context
          confidence += Math.min(matches.length * 0.1, 0.5);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively check nested objects
        const nestedResult = await detectAndRedactPii(value as Record<string, unknown>, config);
        if (nestedResult.hasPii) {
          found = true;
          detectedTypes.push(...nestedResult.detectedTypes);
          redactedData[key] = nestedResult.redactedData;
          confidence += nestedResult.confidence;
        }
      }
    }
  }

  // Check for common PII field names
  const piiFieldNames = [
    'email', 'phone', 'ssn', 'social_security', 'credit_card', 'card_number',
    'address', 'zip', 'postal', 'name', 'first_name', 'last_name', 'full_name',
    'birth_date', 'dob', 'age', 'gender', 'race', 'ethnicity'
  ];

  for (const [key, value] of Object.entries(redactedData)) {
    const lowerKey = key.toLowerCase();
    if (piiFieldNames.some(piiField => lowerKey.includes(piiField))) {
      if (!detectedTypes.includes('field_name')) {
        detectedTypes.push('field_name');
      }
      confidence += 0.3;
      
      // Redact the value
      if (typeof value === 'string') {
        redactedData[key] = `[${key.toUpperCase()}_REDACTED]`;
      } else {
        redactedData[key] = '[REDACTED]';
      }
    }
  }

  // Normalize confidence to 0-1 range
  confidence = Math.min(confidence, 1);

  // Generate warnings
  if (detectedTypes.length > 0) {
    warnings.push(`Detected PII types: ${detectedTypes.join(', ')}`);
  }
  
  if (confidence > finalConfig.piiThreshold) {
    warnings.push(`High PII confidence: ${confidence.toFixed(2)}`);
  }

  return {
    hasPii: detectedTypes.length > 0,
    confidence,
    detectedTypes: [...new Set(detectedTypes)], // Remove duplicates
    redactedData,
    warnings
  };
}

/**
 * Content safety analysis
 */
export async function analyzeContentSafety(
  data: Record<string, unknown>,
  config: Partial<OpsGuardConfig> = {}
): Promise<ContentSafetyResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Basic content safety patterns
  const safetyPatterns = {
    hate_speech: /\b(kill|murder|hate|destroy|annihilate)\b/gi,
    violence: /\b(violence|attack|assault|bomb|weapon)\b/gi,
    explicit: /\b(sex|porn|explicit|adult)\b/gi,
    spam: /\b(buy now|click here|free money|urgent)\b/gi,
  };

  const detectedIssues: string[] = [];
  let confidence = 0;

  // Scan content for safety issues
  for (const [issue, pattern] of Object.entries(safetyPatterns)) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const matches = value.match(pattern);
        if (matches && matches.length > 0) {
          detectedIssues.push(issue);
          confidence += Math.min(matches.length * 0.1, 0.3);
        }
      }
    }
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (confidence > 0.8) riskLevel = 'critical';
  else if (confidence > 0.6) riskLevel = 'high';
  else if (confidence > 0.3) riskLevel = 'medium';

  return {
    isSafe: confidence < finalConfig.safetyThreshold,
    confidence,
    detectedIssues: [...new Set(detectedIssues)],
    riskLevel
  };
}

/**
 * Policy evaluation using existing Lab7 policy system
 */
export async function evaluatePolicy(
  data: Record<string, unknown>,
  sourceUrl: string,
  config: Partial<OpsGuardConfig> = {}
): Promise<PolicyEvaluationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Create a mock source object for policy evaluation
  const mockSource = {
    url: sourceUrl,
    license: 'UNKNOWN',
    tags: [],
    meta: {
      pii: 0,
      safety: 1.0,
      freshness: 1.0,
    },
    last_update: new Date(),
  };

  // Calculate PII score
  const piiResult = await detectAndRedactPii(data, config);
  mockSource.meta.pii = piiResult.confidence;

  // Calculate safety score
  const safetyResult = await analyzeContentSafety(data, config);
  mockSource.meta.safety = safetyResult.confidence;

  // Apply policy rules (simplified version of the Python policy system)
  const reasons: string[] = [];
  let effect: 'pass' | 'deny' | 'review' = 'pass';

  // Rule 1: Block high PII content
  if (mockSource.meta.pii > finalConfig.piiThreshold) {
    effect = 'deny';
    reasons.push('block-pii-leak: High PII confidence detected');
  }

  // Rule 2: Block unsafe content
  if (!safetyResult.isSafe) {
    effect = 'deny';
    reasons.push('block-unsafe-content: Content safety check failed');
  }

  // Rule 3: Review if confidence is low
  if (piiResult.confidence > 0.1 && piiResult.confidence < finalConfig.piiThreshold) {
    if (effect === 'pass') effect = 'review';
    reasons.push('review-low-confidence: PII confidence requires review');
  }

  return {
    effect,
    reasons,
    confidence: Math.max(piiResult.confidence, safetyResult.confidence)
  };
}

/**
 * Comprehensive Ops Guard processing
 */
export async function processWithOpsGuard(
  data: Record<string, unknown>,
  sourceUrl: string,
  config: Partial<OpsGuardConfig> = {}
): Promise<{
  processedData: Record<string, unknown>;
  piiResult: PiiDetectionResult;
  safetyResult: ContentSafetyResult;
  policyResult: PolicyEvaluationResult;
  shouldBlock: boolean;
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Run all checks in parallel
  const [piiResult, safetyResult, policyResult] = await Promise.all([
    finalConfig.enablePiiDetection ? detectAndRedactPii(data, config) : Promise.resolve({
      hasPii: false,
      confidence: 0,
      detectedTypes: [],
      redactedData: data,
      warnings: []
    }),
    finalConfig.enableContentSafety ? analyzeContentSafety(data, config) : Promise.resolve({
      isSafe: true,
      confidence: 0,
      detectedIssues: [],
      riskLevel: 'low' as const
    }),
    finalConfig.enablePolicyEvaluation ? evaluatePolicy(data, sourceUrl, config) : Promise.resolve({
      effect: 'pass' as const,
      reasons: [],
      confidence: 0
    })
  ]);

  // Determine if content should be blocked
  const shouldBlock = 
    policyResult.effect === 'deny' ||
    (piiResult.confidence > finalConfig.piiThreshold) ||
    (!safetyResult.isSafe && safetyResult.riskLevel === 'critical');

  return {
    processedData: piiResult.redactedData,
    piiResult,
    safetyResult,
    policyResult,
    shouldBlock
  };
}

/**
 * Integration with existing Lab7 policy system
 */
export async function callLab7PolicyEndpoint(
  data: Record<string, unknown>,
  sourceUrl: string,
  endpoint: string = '/api/ops-guard/policy'
): Promise<PolicyEvaluationResult> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          url: sourceUrl,
          license: 'UNKNOWN',
          tags: [],
          meta: data,
        },
        data
      })
    });

    if (!response.ok) {
      throw new Error(`Policy endpoint returned ${response.status}`);
    }

    const result = await response.json();
    return {
      effect: result.effect || 'review',
      reasons: result.reasons || [],
      confidence: result.confidence || 0
    };
  } catch (error) {
    console.warn('Failed to call Lab7 policy endpoint:', error);
    // Fallback to local policy evaluation
    return evaluatePolicy(data, sourceUrl);
  }
}

const opsGuard = {
  detectAndRedactPii,
  analyzeContentSafety,
  evaluatePolicy,
  processWithOpsGuard,
  callLab7PolicyEndpoint,
};

export default opsGuard;