import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { IntegrityMiddleware } from '@civic/integrity-core';
import { ShieldPolicyManager } from '@civic/shield-policies';

// Initialize Express app
const app = express();

// Initialize services
const integrityMiddleware = new IntegrityMiddleware({
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  thresholds: {
    gi_min: parseFloat(process.env.GI_MIN || '0.90'),
    response_time_max: parseInt(process.env.RESPONSE_TIME_MAX || '5000'),
    memory_usage_max: parseInt(process.env.MEMORY_USAGE_MAX || '80'),
    error_rate_max: parseInt(process.env.ERROR_RATE_MAX || '5')
  },
  skipPaths: ['/health', '/api/integrity-check']
});

const shieldManager = new ShieldPolicyManager();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Integrity middleware
app.use(integrityMiddleware.middleware());

// Service routing configuration
const services = {
  'hub': process.env.HUB_BASE_URL || 'http://localhost:3000',
  'ledger': process.env.LEDGER_BASE_URL || 'https://civic-protocol-core-ledger.onrender.com',
  'indexer': process.env.INDEXER_BASE_URL || 'http://localhost:4002',
  'eomm': process.env.EOMM_BASE_URL || 'http://localhost:4003',
  'shield': process.env.SHIELD_BASE_URL || 'http://localhost:4004',
  'broker': process.env.BROKER_BASE_URL || 'http://localhost:4005',
  'lab4': process.env.LAB4_BASE_URL || 'https://hive-api-2le8.onrender.com',
  'lab6': process.env.LAB6_BASE_URL || 'https://lab6-proof-api.onrender.com',
  'lab7': process.env.LAB7_BASE_URL || 'https://lab7-proof.onrender.com',
  'gic': process.env.GIC_BASE_URL || 'https://gic-indexer.onrender.com',
  'oaa': process.env.OAA_API_LIBRARY_URL || 'https://oaa-api-library.onrender.com'
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Integrity check endpoint
app.get('/api/integrity-check', integrityMiddleware.integrityCheckRoute());

// Service routing
Object.entries(services).forEach(([serviceName, serviceUrl]) => {
  const proxyOptions = {
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: ''
    },
    onError: (err: unknown, req: Request, res: Response) => {
      console.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: serviceName,
        timestamp: new Date().toISOString()
      });
    },
    onProxyReq: (proxyReq: any, req: Request, _res: Response) => {
      // Add service identification header
      proxyReq.setHeader('X-Service-Name', serviceName);
      proxyReq.setHeader('X-Gateway-Request', 'true');
      // Forward original host for proper routing
      if (req.headers.host) {
        proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
      }
    }
  };

  app.use(`/api/${serviceName}`, createProxyMiddleware(proxyOptions));
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Kaizen OS API Gateway',
    version: '1.0.0',
    description: 'Unified API gateway for Kaizen OS services',
    endpoints: {
      health: '/health',
      integrity: '/api/integrity-check',
      services: Object.keys(services).reduce((acc, service) => {
        acc[service] = `/api/${service}`;
        return acc;
      }, {} as Record<string, string>)
    }
  });
});

// Error handling middleware
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel serverless
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
