// Civic OS SDK - Shared API clients and types
export * from './clients';
export * from './types';
export * from './utils';
export * from './civic-os-gateway';
export * from './CivicOSHub';
export * from './constitution';

// Re-export common types
export interface CivicService {
  name: string;
  baseUrl: string;
  healthCheck: string;
  version: string;
}

export interface IntegrityCheck {
  service: string;
  gi: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}

export interface GICAttestation {
  hash: string;
  service: string;
  timestamp: string;
  integrity: number;
  proof: string;
}
