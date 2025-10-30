import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Service routing configuration
const services = {
  'hub': process.env.HUB_BASE_URL || 'https://kaizen-os-hub.vercel.app',
  'ledger': process.env.LEDGER_BASE_URL || 'https://civic-ledger.onrender.com',
  'indexer': process.env.INDEXER_BASE_URL || 'https://gic-indexer.onrender.com',
  'eomm': process.env.EOMM_BASE_URL || 'https://eomm-api.onrender.com',
  'shield': process.env.SHIELD_BASE_URL || 'https://citizen-shield.onrender.com',
  'broker': process.env.BROKER_BASE_URL || 'https://thought-broker.onrender.com'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services),
    version: '1.0.0'
  });
});

// Service routing
Object.entries(services).forEach(([serviceName, serviceUrl]) => {
  const proxyOptions = {
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: ''
    },
    onError: (err: any, req: any, res: any) => {
      console.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: serviceName,
        timestamp: new Date().toISOString()
      });
    },
    onProxyReq: (proxyReq: any) => {
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
      services: Object.keys(services).reduce((acc, service) => {
        acc[service] = `/api/${service}`;
        return acc;
      }, {} as Record<string, string>)
    }
  });
});

// Export for Vercel serverless
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
