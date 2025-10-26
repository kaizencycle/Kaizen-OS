import { IntegrityChecks, IntegrityResult, IntegrityThresholds } from './types';

export class IntegrityChecker {
  private defaultThresholds: IntegrityThresholds = {
    gi_min: 0.90,
    response_time_max: 5000,
    memory_usage_max: 80,
    error_rate_max: 5,
    uptime_min: 3600,
    availability_min: 99
  };

  evaluateStatus(gi: number, checks: IntegrityChecks, thresholds?: Partial<IntegrityThresholds>): 'healthy' | 'degraded' | 'unhealthy' {
    const config = { ...this.defaultThresholds, ...thresholds };
    
    // Critical failures
    if (gi < 0.5 || checks.errorRate > 20 || checks.availability < 90) {
      return 'unhealthy';
    }
    
    // Degraded conditions
    if (gi < config.gi_min || 
        checks.responseTime > config.response_time_max || 
        checks.memoryUsage > config.memory_usage_max ||
        checks.errorRate > config.error_rate_max ||
        checks.availability < config.availability_min) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  getRecommendations(gi: number, checks: IntegrityChecks): string[] {
    const recommendations: string[] = [];
    
    if (checks.responseTime > 5000) {
      recommendations.push('Response time is high - consider optimizing database queries or adding caching');
    }
    
    if (checks.memoryUsage > 80) {
      recommendations.push('Memory usage is high - consider implementing memory optimization or scaling');
    }
    
    if (checks.errorRate > 5) {
      recommendations.push('Error rate is elevated - investigate error logs and improve error handling');
    }
    
    if (checks.uptime < 3600) {
      recommendations.push('Service uptime is low - check for stability issues and implement health checks');
    }
    
    if (checks.throughput < 10) {
      recommendations.push('Throughput is low - consider performance optimization or load balancing');
    }
    
    if (checks.latency > 2000) {
      recommendations.push('Latency is high - optimize network calls and reduce processing time');
    }
    
    if (checks.availability < 99) {
      recommendations.push('Availability is below target - implement redundancy and failover mechanisms');
    }
    
    if (gi < 0.90) {
      recommendations.push('Overall integrity is below threshold - review all metrics and implement improvements');
    }
    
    return recommendations;
  }

  createHealthReport(service: string, checks: IntegrityChecks, gi: number): {
    service: string;
    timestamp: string;
    gi: number;
    status: string;
    checks: IntegrityChecks;
    recommendations: string[];
  } {
    const status = this.evaluateStatus(gi, checks);
    const recommendations = this.getRecommendations(gi, checks);
    
    return {
      service,
      timestamp: new Date().toISOString(),
      gi,
      status,
      checks,
      recommendations
    };
  }
}


