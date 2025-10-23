import { IntegrityChecks, IntegrityThresholds } from './types';

export class GICalculator {
  private defaultThresholds: IntegrityThresholds = {
    gi_min: 0.90,
    response_time_max: 5000,
    memory_usage_max: 80,
    error_rate_max: 5,
    uptime_min: 3600,
    availability_min: 99
  };

  calculateGI(checks: IntegrityChecks, thresholds?: Partial<IntegrityThresholds>): number {
    const config = { ...this.defaultThresholds, ...thresholds };
    
    // Normalize each metric to 0-1 scale (higher is better)
    const responseTimeScore = Math.max(0, 1 - (checks.responseTime / config.response_time_max));
    const memoryScore = Math.max(0, 1 - (checks.memoryUsage / config.memory_usage_max));
    const errorRateScore = Math.max(0, 1 - (checks.errorRate / config.error_rate_max));
    const uptimeScore = Math.min(1, checks.uptime / config.uptime_min);
    const throughputScore = Math.min(1, checks.throughput / 100); // normalize to 100 req/s
    const latencyScore = Math.max(0, 1 - (checks.latency / config.response_time_max));
    const availabilityScore = checks.availability / 100;
    
    // Weighted average (can be adjusted based on importance)
    const weights = {
      responseTime: 0.15,
      memory: 0.10,
      errorRate: 0.20,
      uptime: 0.15,
      throughput: 0.10,
      latency: 0.15,
      availability: 0.15
    };
    
    const gi = (
      responseTimeScore * weights.responseTime +
      memoryScore * weights.memory +
      errorRateScore * weights.errorRate +
      uptimeScore * weights.uptime +
      throughputScore * weights.throughput +
      latencyScore * weights.latency +
      availabilityScore * weights.availability
    );
    
    // Ensure GI is between 0 and 1
    return Math.max(0, Math.min(1, gi));
  }

  calculateServiceHealth(checks: IntegrityChecks): {
    overall: number;
    breakdown: Record<string, number>;
  } {
    const breakdown = {
      responseTime: Math.max(0, 1 - (checks.responseTime / 5000)),
      memory: Math.max(0, 1 - (checks.memoryUsage / 80)),
      errorRate: Math.max(0, 1 - (checks.errorRate / 5)),
      uptime: Math.min(1, checks.uptime / 3600),
      throughput: Math.min(1, checks.throughput / 100),
      latency: Math.max(0, 1 - (checks.latency / 5000)),
      availability: checks.availability / 100
    };
    
    const overall = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / Object.keys(breakdown).length;
    
    return { overall, breakdown };
  }
}
