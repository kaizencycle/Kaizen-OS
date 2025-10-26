// Types for Kaizen OS Integrity Core

export interface IntegrityChecks {
  responseTime: number; // milliseconds
  memoryUsage: number; // percentage (0-100)
  errorRate: number; // percentage (0-100)
  uptime: number; // seconds
  throughput: number; // requests per second
  latency: number; // milliseconds
  availability: number; // percentage (0-100)
}

export interface IntegrityResult {
  service: string;
  gi: number; // Governance Integrity score (0-1)
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: IntegrityChecks;
  recommendations: string[];
}

export interface IntegrityThresholds {
  gi_min: number; // minimum GI score (default: 0.90)
  response_time_max: number; // max response time in ms (default: 5000)
  memory_usage_max: number; // max memory usage % (default: 80)
  error_rate_max: number; // max error rate % (default: 5)
  uptime_min: number; // min uptime in seconds (default: 3600)
  availability_min: number; // min availability % (default: 99)
}

export interface HealthCheckConfig {
  interval: number; // check interval in ms
  timeout: number; // timeout in ms
  retries: number; // number of retries
  thresholds: IntegrityThresholds;
}

export interface ServiceMetrics {
  service: string;
  timestamp: string;
  checks: IntegrityChecks;
  gi: number;
  status: string;
}


