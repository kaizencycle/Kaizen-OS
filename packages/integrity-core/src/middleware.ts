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

      // Store start time for later use
      (req as any).integrityStartTime = startTime;
      (req as any).integrityStartMemory = startMemory;

      next();
    };
  }

  // Express route for integrity check endpoint
  integrityCheckRoute() {
    return (req: Request, res: Response) => {
      const calculator = new GICalculator();
      const checker = new IntegrityChecker();
      
      const checks: IntegrityChecks = {
        responseTime: 0, // would be calculated from recent requests
        memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
        errorRate: 0, // would be calculated from recent requests
        uptime: process.uptime(),
        throughput: 0, // would be calculated from recent requests
        latency: 0, // would be calculated from recent requests
        availability: 100 // would be calculated from recent requests
      };

      const gi = calculator.calculateGI(checks, this.options.thresholds);
      const status = checker.evaluateStatus(gi, checks, this.options.thresholds);
      const recommendations = checker.getRecommendations(gi, checks);

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


