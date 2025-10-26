import { ShieldPolicy, ValidationResult, PolicyCondition } from './types';

export class PolicyValidator {
  private policy: ShieldPolicy;

  constructor(policy: ShieldPolicy) {
    this.policy = policy;
  }

  validate(request: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const actions: any[] = [];

    // Check conditions
    for (const condition of this.policy.conditions) {
      if (!this.evaluateCondition(condition, request)) {
        errors.push(`Condition failed: ${condition.field} ${condition.operator} ${condition.value}`);
      }
    }

    // Apply policy-specific validation
    switch (this.policy.type) {
      case 'rate_limit':
        this.validateRateLimit(request, errors, warnings);
        break;
      case 'auth':
        this.validateAuth(request, errors, warnings);
        break;
      case 'validation':
        this.validateInput(request, errors, warnings);
        break;
      case 'sanitization':
        this.validateSanitization(request, errors, warnings);
        break;
      case 'cors':
        this.validateCORS(request, errors, warnings);
        break;
      case 'security':
        this.validateSecurity(request, errors, warnings);
        break;
    }

    // Collect actions
    if (errors.length === 0) {
      actions.push(...this.policy.actions);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      actions
    };
  }

  private evaluateCondition(condition: PolicyCondition, request: any): boolean {
    const fieldValue = this.getFieldValue(request, condition.field);
    const { operator, value, case_sensitive = true } = condition;

    if (fieldValue === undefined) return false;

    const compareValue = case_sensitive ? fieldValue : fieldValue.toString().toLowerCase();
    const compareTarget = case_sensitive ? value : value.toString().toLowerCase();

    switch (operator) {
      case 'equals':
        return compareValue === compareTarget;
      case 'not_equals':
        return compareValue !== compareTarget;
      case 'contains':
        return compareValue.toString().includes(compareTarget.toString());
      case 'not_contains':
        return !compareValue.toString().includes(compareTarget.toString());
      case 'matches':
        return new RegExp(compareTarget.toString()).test(compareValue.toString());
      case 'not_matches':
        return !new RegExp(compareTarget.toString()).test(compareValue.toString());
      case 'greater_than':
        return Number(compareValue) > Number(compareTarget);
      case 'less_than':
        return Number(compareValue) < Number(compareTarget);
      case 'in':
        return Array.isArray(compareTarget) && compareTarget.includes(compareValue);
      case 'not_in':
        return Array.isArray(compareTarget) && !compareTarget.includes(compareValue);
      default:
        return false;
    }
  }

  private getFieldValue(request: any, field: string): any {
    const parts = field.split('.');
    let value = request;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private validateRateLimit(request: any, errors: string[], warnings: string[]): void {
    // Rate limiting validation would be implemented here
    // This is a simplified version
    const config = this.policy.config;
    if (config.windowMs && config.maxRequests) {
      // In a real implementation, you'd check against a rate limiter store
      warnings.push('Rate limiting validation not fully implemented');
    }
  }

  private validateAuth(request: any, errors: string[], warnings: string[]): void {
    const config = this.policy.config;
    
    if (config.required) {
      const authHeader = request.headers?.authorization;
      if (!authHeader) {
        errors.push('Authorization header is required');
        return;
      }

      if (config.tokenValidation) {
        // In a real implementation, you'd validate the JWT token
        if (!authHeader.startsWith('Bearer ')) {
          errors.push('Invalid authorization format');
        }
      }

      if (config.roles && config.roles.length > 0) {
        // In a real implementation, you'd check user roles
        warnings.push('Role validation not fully implemented');
      }
    }
  }

  private validateInput(request: any, errors: string[], warnings: string[]): void {
    const config = this.policy.config;
    
    if (config.schema) {
      // In a real implementation, you'd use a JSON schema validator like Ajv
      warnings.push('JSON schema validation not fully implemented');
    }
  }

  private validateSanitization(request: any, errors: string[], warnings: string[]): void {
    const config = this.policy.config;
    
    if (config.fields && config.fields.length > 0) {
      for (const field of config.fields) {
        const value = this.getFieldValue(request, field);
        if (value && typeof value === 'string') {
          // Basic XSS prevention
          if (value.includes('<script>') || value.includes('javascript:')) {
            errors.push(`Potentially malicious content detected in field: ${field}`);
          }
        }
      }
    }
  }

  private validateCORS(request: any, errors: string[], warnings: string[]): void {
    const origin = request.headers?.origin;
    const method = request.method;
    
    if (origin) {
      const config = this.policy.config;
      if (config.origin !== true && config.origin !== '*' && !config.origin.includes(origin)) {
        errors.push(`CORS: Origin ${origin} not allowed`);
      }
    }

    if (method && this.policy.config.methods && !this.policy.config.methods.includes(method)) {
      errors.push(`CORS: Method ${method} not allowed`);
    }
  }

  private validateSecurity(request: any, errors: string[], warnings: string[]): void {
    const config = this.policy.config;
    
    if (config.headers) {
      for (const header of config.headers) {
        const headerValue = request.headers?.[header.name.toLowerCase()];
        if (!headerValue) {
          errors.push(`Required security header missing: ${header.name}`);
        }
      }
    }
  }
}


