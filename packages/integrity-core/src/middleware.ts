import { Request, Response, NextFunction } from 'express';
import { IntegrityChecks, IntegrityThresholds } from './types';
import { GICalculator } from './gi-calculator';
import { IntegrityChecker } from './integrity-checker';

export interface IntegrityMiddlewareOptions {
  thresholds?: Partial<IntegrityThresholds>;
  skipPaths?: string[];
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export class IntegrityMiddleware {
  private calculator: GICalculator;
  private checker: IntegrityChecker;
  private options: IntegrityMiddlewareOptions;

  constructor(options: IntegrityMiddlewareOptions = {}) {
    this.calculator = new GICalculator();
    this.checker = new IntegrityChecker();
    this.options = {
      skipPaths: ['/healthz', '/metrics'],
      logLevel: 'info',
      ...options
    };
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip integrity checks for certain paths
      if (this.options.skipPaths?.includes(req.path)) {
        return next();
      }

      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      // Override res.end to capture response metrics
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const endTime = Date.now();
        const endMemory = process.memoryUsage();
        
        // Calculate metrics
        const responseTime = endTime - startTime;
        const memoryUsage = (endMemory.heapUsed / endMemory.heapTotal) * 100;
        
        // Create integrity checks object
        const checks: IntegrityChecks = {
          responseTime,
          memoryUsage,
          errorRate: res.statusCode >= 400 ? 1 : 0, // simplified error rate
          uptime: process.uptime(),
          throughput: 1, // simplified - would need more sophisticated tracking
          latency: responseTime,
          availability: res.statusCode < 500 ? 100 : 0
        };

        // Calculate GI and status
        const gi = this.calculator.calculateGI(checks, this.options.thresholds);
        const status = this.checker.evaluateStatus(gi, checks, this.options.thresholds);

        // Log if needed
        if (this.options.logLevel === 'debug' || status !== 'healthy') {
          console.log(`[Integrity] ${req.path} - GI: ${gi.toFixed(3)}, Status: ${status}, ResponseTime: ${responseTime}ms`);
        }

        // Add integrity headers
        res.setHeader('X-Integrity-GI', gi.toFixed(3));
        res.setHeader('X-Integrity-Status', status);
        res.setHeader('X-Response-Time', responseTime.toString());

        // Call original end
        originalEnd.call(this, chunk, encoding);
      }.bind(res);

      next();
    };
  }

  // Express route for integrity check endpoint
  integrityCheckRoute() {
    return (req: Request, res: Response) => {
      const checks: IntegrityChecks = {
        responseTime: 0, // would be calculated from recent requests
        memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
        errorRate: 0, // would be calculated from recent requests
        uptime: process.uptime(),
        throughput: 0, // would be calculated from recent requests
        latency: 0, // would be calculated from recent requests
        availability: 100 // would be calculated from recent requests
      };

      const gi = this.calculator.calculateGI(checks, this.options.thresholds);
      const status = this.checker.evaluateStatus(gi, checks, this.options.thresholds);
      const recommendations = this.checker.getRecommendations(gi, checks);

      res.json({
        service: process.env.SERVICE_NAME || 'unknown',
        gi,
        status,
        timestamp: new Date().toISOString(),
        checks,
        recommendations
      });
    };
  }
}
