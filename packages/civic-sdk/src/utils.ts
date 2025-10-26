// Utility functions for Kaizen OS SDK

export function createServiceUrl(service: string, baseUrl: string): string {
  return `${baseUrl}/api/${service}`;
}

export function generateHash(data: any): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

export function validateIntegrity(gi: number, threshold = 0.90): boolean {
  return gi >= threshold;
}

export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  return date.toISOString();
}

export function calculateUptime(startTime: string): number {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  return Math.floor((now - start) / 1000); // uptime in seconds
}

export function createServiceHealth(
  service: string,
  responseTime: number,
  memoryUsage: number,
  errorRate: number,
  startTime: string
): any {
  const uptime = calculateUptime(startTime);
  const status = errorRate > 0.1 ? 'unhealthy' : responseTime > 5000 ? 'degraded' : 'healthy';
  
  return {
    service,
    status,
    responseTime,
    memoryUsage,
    errorRate,
    lastCheck: formatTimestamp(new Date()),
    uptime
  };
}

export function parseServiceConfig(config: any): Record<string, any> {
  const parsed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      // Try to parse as JSON
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        // If not JSON, keep as string
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  }
  
  return parsed;
}

export function createErrorResponse(message: string, code: string, details?: any) {
  return {
    error: {
      message,
      code,
      details,
      timestamp: formatTimestamp(new Date())
    }
  };
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}


