// Shared types for Kaizen OS services

export interface LedgerEntry {
  id: string;
  hash: string;
  timestamp: string;
  service: string;
  action: string;
  data: Record<string, any>;
  integrity: number;
  proof: string;
}

export interface GICTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  type: 'credit' | 'debit' | 'transfer';
  description: string;
  integrity: number;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  memoryUsage: number;
  errorRate: number;
  lastCheck: string;
  uptime: number;
  integrity?: number;
}

export interface OAAIntent {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface DeliberationProof {
  id: string;
  intent: string;
  consensus: number;
  reasoning: string[];
  alternatives: string[];
  decision: string;
  confidence: number;
  timestamp: string;
  participants: string[];
}

export interface ShieldPolicy {
  id: string;
  name: string;
  type: 'rate_limit' | 'auth' | 'validation' | 'sanitization';
  config: Record<string, any>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EOMMReflection {
  id: string;
  cycle: string;
  title: string;
  content: string;
  insights: string[];
  actions: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface GICAttestation {
  hash: string;
  service: string;
  timestamp: string;
  integrity: number;
  proof: string;
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

