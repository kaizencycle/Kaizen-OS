// Types for Shield Policies package

export interface ShieldPolicy {
  id: string;
  name: string;
  type: 'rate_limit' | 'auth' | 'validation' | 'sanitization' | 'cors' | 'security';
  services: string[];
  enabled: boolean;
  priority: number;
  config: PolicyConfig;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  created_at: string;
  updated_at: string;
}

export interface PolicyConfig {
  [key: string]: any;
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'matches' | 'not_matches' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  case_sensitive?: boolean;
}

export interface PolicyAction {
  type: 'allow' | 'deny' | 'log' | 'sanitize' | 'transform' | 'rate_limit';
  config: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  actions: PolicyAction[];
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface AuthConfig {
  required: boolean;
  methods: string[];
  roles?: string[];
  permissions?: string[];
  tokenValidation?: boolean;
}

export interface ValidationConfig {
  schema: any; // JSON Schema
  strict?: boolean;
  coerce?: boolean;
  removeAdditional?: boolean;
}

export interface SanitizationConfig {
  fields: string[];
  methods: ('escape' | 'strip' | 'normalize' | 'validate')[];
  options?: any;
}

export interface CORSConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge?: number;
}

export interface SecurityConfig {
  headers: SecurityHeader[];
  csp?: ContentSecurityPolicy;
  hsts?: HSTSConfig;
}

export interface SecurityHeader {
  name: string;
  value: string;
  condition?: PolicyCondition;
}

export interface ContentSecurityPolicy {
  directives: { [key: string]: string[] };
  reportOnly?: boolean;
}

export interface HSTSConfig {
  maxAge: number;
  includeSubDomains?: boolean;
  preload?: boolean;
}


