// Shield Policies - Security policies and request guards for Civic OS
export * from './policies';
export * from './guards';
export * from './middleware';
export * from './types';

import { ShieldPolicy } from './types';
import { PolicyValidator } from './guards';
import { ValidationResult } from './types';

// Main policy manager
export class ShieldPolicyManager {
  private policies: Map<string, ShieldPolicy> = new Map();
  private validators: Map<string, PolicyValidator> = new Map();

  addPolicy(policy: ShieldPolicy): void {
    this.policies.set(policy.id, policy);
    this.validators.set(policy.id, new PolicyValidator(policy));
  }

  validateRequest(service: string, request: any): ValidationResult {
    const servicePolicies = Array.from(this.policies.values())
      .filter(policy => policy.enabled && policy.services.includes(service));
    
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const policy of servicePolicies) {
      const validator = this.validators.get(policy.id);
      if (validator) {
        const result = validator.validate(request);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      actions: []
    };
  }
}
