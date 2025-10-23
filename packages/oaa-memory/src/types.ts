// Types for OAA Memory package

export interface OAAIntent {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  tags: string[];
  requirements: OAARequirement[];
  constraints: OAAConstraint[];
  success_criteria: string[];
  timeline: OAATimeline;
  resources: OAAResource[];
  dependencies: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OAARequirement {
  id: string;
  description: string;
  type: 'functional' | 'non-functional' | 'technical' | 'business';
  priority: 'must' | 'should' | 'could' | 'wont';
  acceptance_criteria: string[];
  test_cases: string[];
}

export interface OAAConstraint {
  id: string;
  type: 'time' | 'budget' | 'resource' | 'technical' | 'compliance';
  description: string;
  value: string | number;
  unit?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface OAATimeline {
  start_date: string;
  end_date: string;
  milestones: OAAMilestone[];
  phases: OAAPhase[];
}

export interface OAAMilestone {
  id: string;
  name: string;
  date: string;
  description: string;
  deliverables: string[];
  success_criteria: string[];
}

export interface OAAPhase {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description: string;
  activities: string[];
  deliverables: string[];
}

export interface OAAResource {
  id: string;
  type: 'human' | 'technical' | 'financial' | 'material';
  name: string;
  description: string;
  quantity: number;
  unit: string;
  cost?: number;
  availability: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface OAAMemory {
  intents: OAAIntent[];
  templates: OAATemplate[];
  patterns: OAAPattern[];
  schemas: OAASchema[];
}

export interface OAATemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: Partial<OAAIntent>;
  required_fields: string[];
  optional_fields: string[];
  examples: OAAIntent[];
}

export interface OAAPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  pattern: string;
  examples: string[];
  usage_count: number;
}

export interface OAASchema {
  id: string;
  name: string;
  version: string;
  schema: any; // JSON Schema
  description: string;
  created_at: string;
  updated_at: string;
}
