export interface HealthStatus {
  ok: boolean;
  components: Record<string, string>;
}

export interface Companion {
  id: string;
  name: string;
  tier: 'founder' | 'guardian' | 'sentinel' | 'citizen';
  gi_score: number;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

export interface GIResponse {
  score: number;
  tier: string;
  last_updated: string;
  breakdown: {
    integrity: number;
    consistency: number;
    reliability: number;
  };
}

export interface Reflection {
  id: string;
  content: string;
  created_at: string;
  gi_impact: number;
  domain_id?: string;
}

export interface DomainPreview {
  domain: string;
  config: any;
  preview_url: string;
  estimated_gi_impact: number;
}

export interface OnboardApplication {
  name: string;
  email: string;
  purpose: string;
  expected_gi_impact: number;
  domain_preference: string;
}