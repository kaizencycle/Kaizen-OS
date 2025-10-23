import { Request, Response, NextFunction } from 'express';
import { ShieldPolicy, ValidationResult } from './types';
import { PolicyValidator } from './guards';

export class ShieldMiddleware {
  private validators: Map<string, PolicyValidator> = new Map();

  constructor(policies: ShieldPolicy[] = []) {
    policies.forEach(policy => {
      if (policy.enabled) {
        this.validators.set(policy.id, new PolicyValidator(policy));
      }
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const actions: any[] = [];

      // Run all validators
      for (const [policyId, validator] of this.validators) {
        const result = validator.validate(req);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        actions.push(...result.actions);
      }

      // If there are errors, deny the request
      if (errors.length > 0) {
        return res.status(403).json({
          error: 'Request blocked by security policy',
          errors,
          warnings,
          timestamp: new Date().toISOString()
        });
      }

      // Add warnings to response headers if any
      if (warnings.length > 0) {
        res.setHeader('X-Shield-Warnings', warnings.join('; '));
      }

      // Apply actions
      this.applyActions(req, res, actions);

      next();
    };
  }

  private applyActions(req: Request, res: Response, actions: any[]): void {
    for (const action of actions) {
      switch (action.type) {
        case 'allow':
          // Request is allowed, continue
          break;
        case 'deny':
          // This should have been caught by the validator
          break;
        case 'log':
          console.log(`[Shield] Policy action: ${action.type}`, {
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString(),
            config: action.config
          });
          break;
        case 'sanitize':
          this.sanitizeRequest(req, action.config);
          break;
        case 'transform':
          this.transformRequest(req, action.config);
          break;
        case 'rate_limit':
          // Rate limiting would be applied here
          break;
      }
    }
  }

  private sanitizeRequest(req: Request, config: any): void {
    if (config.fields && Array.isArray(config.fields)) {
      for (const field of config.fields) {
        const value = this.getFieldValue(req, field);
        if (value && typeof value === 'string') {
          const sanitized = this.sanitizeString(value, config.methods || ['escape']);
          this.setFieldValue(req, field, sanitized);
        }
      }
    }
  }

  private sanitizeString(input: string, methods: string[]): string {
    let output = input;
    
    for (const method of methods) {
      switch (method) {
        case 'escape':
          output = output
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
          break;
        case 'strip':
          output = output.replace(/<[^>]*>/g, '');
          break;
        case 'normalize':
          output = output.normalize('NFC');
          break;
        case 'validate':
          // Additional validation could be added here
          break;
      }
    }
    
    return output;
  }

  private transformRequest(req: Request, config: any): void {
    // Request transformation logic would go here
    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        req.headers[key] = value as string;
      }
    }
  }

  private getFieldValue(obj: any, field: string): any {
    const parts = field.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private setFieldValue(obj: any, field: string, value: any): void {
    const parts = field.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  // Express route for policy management
  policyManagementRoute() {
    return (req: Request, res: Response) => {
      const action = req.params.action;
      
      switch (action) {
        case 'list':
          res.json({
            policies: Array.from(this.validators.keys()),
            count: this.validators.size
          });
          break;
        case 'status':
          res.json({
            active: this.validators.size,
            timestamp: new Date().toISOString()
          });
          break;
        default:
          res.status(404).json({
            error: 'Unknown action',
            available: ['list', 'status']
          });
      }
    };
  }
}
