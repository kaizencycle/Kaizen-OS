import { ThoughtMessage } from './types.js';

// Safety guardrails for content filtering
export class SafetyGuards {
  private static readonly DANGEROUS_PATTERNS = [
    /rm\s+-rf/gi,
    /sudo\s+/gi,
    /chmod\s+777/gi,
    /eval\s*\(/gi,
    /exec\s*\(/gi,
    /system\s*\(/gi,
    /shell_exec/gi,
    /passthru/gi,
    /proc_open/gi,
    /popen/gi,
    /curl\s+.*-X\s+POST/gi,
    /wget\s+.*--post-data/gi,
  ];

  private static readonly SECRET_PATTERNS = [
    /password\s*=\s*["'][^"']+["']/gi,
    /api[_-]?key\s*=\s*["'][^"']+["']/gi,
    /secret\s*=\s*["'][^"']+["']/gi,
    /token\s*=\s*["'][^"']+["']/gi,
    /bearer\s+[a-zA-Z0-9._-]+/gi,
    /sk-[a-zA-Z0-9]{20,}/gi, // OpenAI API keys
    /[a-zA-Z0-9]{32,}/gi, // Generic long tokens
  ];

  static validateMessage(message: ThoughtMessage): { valid: boolean; reason?: string } {
    const content = message.content;

    // Check for dangerous operations
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        return { valid: false, reason: 'Dangerous operation detected' };
      }
    }

    // Check for secrets (log warning but don't block)
    for (const pattern of this.SECRET_PATTERNS) {
      if (pattern.test(content)) {
        console.warn(`Potential secret detected in message from ${message.from}`);
        // Redact the secret
        message.content = content.replace(pattern, '[REDACTED]');
      }
    }

    return { valid: true };
  }

  static sanitizeForLogging(content: string): string {
    let sanitized = content;
    
    // Remove secrets
    for (const pattern of this.SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    // Truncate very long content
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000) + '... [TRUNCATED]';
    }

    return sanitized;
  }

  static validateConsensus(consensus: any): { valid: boolean; reason?: string } {
    if (!consensus) {
      return { valid: false, reason: 'No consensus provided' };
    }

    if (!consensus.summary || consensus.summary.length < 10) {
      return { valid: false, reason: 'Consensus summary too short' };
    }

    if (consensus.score < 0.5) {
      return { valid: false, reason: 'Consensus score too low' };
    }

    if (!consensus.citations || consensus.citations.length === 0) {
      return { valid: false, reason: 'No citations provided' };
    }

    return { valid: true };
  }
}
