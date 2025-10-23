import { ShieldPolicy, PolicyConfig, PolicyCondition, PolicyAction } from './types';

export class PolicyManager {
  private policies: Map<string, ShieldPolicy> = new Map();

  addPolicy(policy: ShieldPolicy): void {
    this.policies.set(policy.id, policy);
  }

  getPolicy(id: string): ShieldPolicy | undefined {
    return this.policies.get(id);
  }

  listPolicies(enabled?: boolean): ShieldPolicy[] {
    const allPolicies = Array.from(this.policies.values());
    if (enabled === undefined) return allPolicies;
    return allPolicies.filter(policy => policy.enabled === enabled);
  }

  removePolicy(id: string): boolean {
    return this.policies.delete(id);
  }

  updatePolicy(id: string, updates: Partial<ShieldPolicy>): boolean {
    const policy = this.policies.get(id);
    if (!policy) return false;
    
    const updatedPolicy = { ...policy, ...updates, updated_at: new Date().toISOString() };
    this.policies.set(id, updatedPolicy);
    return true;
  }
}

// Default policies
export const defaultPolicies: ShieldPolicy[] = [
  {
    id: 'rate-limit-global',
    name: 'Global Rate Limit',
    type: 'rate_limit',
    services: ['*'],
    enabled: true,
    priority: 1,
    config: {
      windowMs: 900000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    conditions: [],
    actions: [
      {
        type: 'rate_limit',
        config: {
          windowMs: 900000,
          maxRequests: 100
        }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cors-policy',
    name: 'CORS Policy',
    type: 'cors',
    services: ['*'],
    enabled: true,
    priority: 2,
    config: {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    },
    conditions: [],
    actions: [
      {
        type: 'allow',
        config: {}
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'input-validation',
    name: 'Input Validation',
    type: 'validation',
    services: ['*'],
    enabled: true,
    priority: 3,
    config: {
      schema: {
        type: 'object',
        properties: {
          body: { type: 'object' },
          query: { type: 'object' },
          params: { type: 'object' }
        }
      },
      strict: false,
      coerce: true,
      removeAdditional: false
    },
    conditions: [],
    actions: [
      {
        type: 'allow',
        config: {}
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
