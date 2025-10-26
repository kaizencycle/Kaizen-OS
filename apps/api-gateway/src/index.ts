import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { IntegrityMiddleware } from '@civic/integrity-core';
import { ShieldPolicyManager } from '@civic/shield-policies';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize services
const integrityMiddleware = new IntegrityMiddleware({
  logLevel: 'info',
  thresholds: {
    gi_min: parseFloat(process.env.GI_MIN || '0.90'),
    response_time_max: parseInt(process.env.RESPONSE_TIME_MAX || '5000'),
    memory_usage_max: parseInt(process.env.MEMORY_USAGE_MAX || '80'),
    error_rate_max: parseInt(process.env.ERROR_RATE_MAX || '5')
  }
});

const shieldManager = new ShieldPolicyManager();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
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
  'ledger': process.env.LEDGER_BASE_URL || 'http://localhost:4001',
  'indexer': process.env.INDEXER_BASE_URL || 'http://localhost:4002',
  'eomm': process.env.EOMM_BASE_URL || 'http://localhost:4003',
  'shield': process.env.SHIELD_BASE_URL || 'http://localhost:4004',
  'broker': process.env.BROKER_BASE_URL || 'http://localhost:4005'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services),
    version: process.env.npm_package_version || '1.0.0'
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
    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: serviceName,
        timestamp: new Date().toISOString()
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add service identification header
      proxyReq.setHeader('X-Service-Name', serviceName);
      proxyReq.setHeader('X-Gateway-Request', 'true');
    }
  };

  app.use(`/api/${serviceName}`, createProxyMiddleware(proxyOptions));
});

// Root endpoint
app.get('/', (req, res) => {
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kaizen OS API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Integrity check: http://localhost:${PORT}/api/integrity-check`);
  console.log(`🌐 Services:`);
  Object.entries(services).forEach(([name, url]) => {
    console.log(`   ${name}: http://localhost:${PORT}/api/${name} -> ${url}`);
  });
});

export default app;


