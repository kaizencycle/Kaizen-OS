// Thought Broker API - Production Implementation
import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

// Local type definitions
interface UrielQuery {
  intent: string;
  gi?: number;
  context?: Record<string, unknown>;
}

interface UrielResponse {
  illumination: string;
  mii: number;
  sentinel: 'URIEL';
  timestamp: string;
  source?: 'grok-4' | 'grok-3';
}

// Note: urielDeliberate is handled by the urielRouter at /api/sentinels/uriel/query
// This function is kept for compatibility but routes are handled directly
async function urielDeliberate(query: UrielQuery): Promise<UrielResponse> {
  // For now, return a simple response - actual implementation is in the router
  // This avoids circular dependencies
  throw new Error('Use /api/sentinels/uriel/query endpoint directly');
}

import urielRouter from './sentinels/uriel';
import { initDB } from './db/client';
import { initCrypto } from './crypto/attestation';
import { authenticateAPIKey, deliberationRateLimit } from './middleware/auth';
import deliberateRouter from './routes/deliberate';
import { healthRouter } from './routes/health';
import metricsRouter from './routes/metrics';
import humanReviewRouter from './routes/humanReview';
import echoRouter from './routes/v1/echo';
import { evidenceRouter } from './routes/v1/evidence';
import dailyReflectionsRouter from './routes/v1/dailyReflections';
import rewardsRouter from './routes/rewards';

const app = express();
const PORT = process.env.PORT || 4005;

// URIEL routing configuration
const URIEL_ROUTING_CHANCE = 0.20; // 20% of eligible deliberations
const URIEL_DOMAINS = ['physics', 'curiosity', 'entropy', 'cosmos', 'delib_proof'];

// Middleware
app.use(cors());
app.use(express.json());

// Production API routes (authenticated)
app.use('/v1/deliberate', authenticateAPIKey, deliberationRateLimit, deliberateRouter);
app.use('/v1/rewards', authenticateAPIKey, rewardsRouter);
app.use('/v1/health', healthRouter);
app.use('/v1/metrics', metricsRouter);
app.use('/v1/echo', echoRouter);
app.use('/v1/evidence', authenticateAPIKey, evidenceRouter);
app.use('/v1/echo/review', humanReviewRouter);
app.use('/', dailyReflectionsRouter); // Mounts at /v1/reflections/daily

// Sentinel routes
app.use('/api/sentinels/uriel', urielRouter);

/**
 * Route deliberation based on topic and availability
 */
const ALLOWED_URIEL_TOPICS = ['physics', 'cosmos', 'curiosity', 'entropy', 'delib_proof'];
const URIEL_WEIGHT = parseFloat(process.env.SENTINEL_URIEL_WEIGHT || '0.20');

async function routeDeliberation(intent: string, context?: any) {
  // Extract topics from intent (simple keyword matching)
  const topics = extractTopics(intent);
  const gi = context?.gi || 0.993;

  // Check if any URIEL domains are present and GI gate passes
  const hasUrielDomain = ALLOWED_URIEL_TOPICS.some(domain =>
    topics.some(topic => topic.toLowerCase().includes(domain))
  );

  // Route to URIEL if eligible, GI >= 0.95, and randomly selected
  if (hasUrielDomain && gi >= 0.95 && Math.random() < URIEL_WEIGHT) {
    try {
      const urielQuery: UrielQuery = {
        intent,
        gi,
        context: context || {}
      };

      const response = await urielDeliberate(urielQuery);

      return {
        id: `deliberation_uriel_${Date.now()}`,
        intent,
        consensus: response.mii,
        reasoning: [`🕯️🔥 URIEL illumination: ${response.illumination}`],
        alternatives: ['Continue with standard deliberation', 'Route to other sentinels'],
        decision: 'URIEL illumination applied',
        confidence: response.mii,
        timestamp: response.timestamp,
        participants: ['uriel'],
        sentinel: 'URIEL',
        source: response.source
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('URIEL deliberation failed, falling back to standard:', errorMessage);
      // Fall through to standard deliberation
    }
  }

  // Standard deliberation (existing logic)
  return {
    id: `deliberation_${Date.now()}`,
    intent,
    consensus: 0.95,
    reasoning: ['Standard deliberation reasoning'],
    alternatives: ['Alternative 1', 'Alternative 2'],
    decision: 'Standard decision',
    confidence: 0.9,
    timestamp: new Date().toISOString(),
    participants: ['broker-1']
  };
}

/**
 * Extract topics from intent text (simple implementation)
 */
function extractTopics(intent: string): string[] {
  const text = intent.toLowerCase();
  const topics: string[] = [];

  // Simple keyword-based topic extraction
  if (text.includes('physics') || text.includes('universe') || text.includes('quantum')) {
    topics.push('physics');
  }
  if (text.includes('curiosity') || text.includes('curious') || text.includes('explore')) {
    topics.push('curiosity');
  }
  if (text.includes('entropy') || text.includes('chaos') || text.includes('disorder')) {
    topics.push('entropy');
  }
  if (text.includes('cosmos') || text.includes('cosmic') || text.includes('universal')) {
    topics.push('cosmos');
  }
  if (text.includes('deliberation') || text.includes('consensus') || text.includes('proof')) {
    topics.push('delib_proof');
  }

  return topics;
}

// Health check endpoint
app.get('/v1/loop/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'broker-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Placeholder endpoints
app.post('/intents', (req: Request, res: Response) => {
  res.json({
    id: `intent_${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.get('/intents/:id', (req: Request, res: Response) => {
  res.json({
    id: req.params.id,
    description: 'Sample intent',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.post('/intents/:id/process', async (req: Request, res: Response) => {
  try {
    const intentId = req.params.id;
    const intentText = req.body.intent || `Intent ${intentId}`;
    const context = req.body.context || {};

    const deliberation = await routeDeliberation(intentText, context);
    res.json(deliberation);
  } catch (error) {
    console.error('Deliberation routing failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Deliberation failed',
      message: errorMessage,
      id: `deliberation_error_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/deliberations/:id', (req: Request, res: Response) => {
  res.json({
    id: req.params.id,
    intent: 'sample-intent',
    consensus: 0.95,
    reasoning: ['Sample reasoning'],
    alternatives: ['Alternative 1', 'Alternative 2'],
    decision: 'Sample decision',
    confidence: 0.9,
    timestamp: new Date().toISOString(),
    participants: ['broker-1']
  });
});

// URIEL Sentinel Endpoint - handled by urielRouter at /api/sentinels/uriel/query

// Consensus endpoint
app.post('/api/consensus/run', async (req: Request, res: Response) => {
  try {
    const { question, agents, rounds = 2, timeout_s = 20, weights = {} } = req.body;

    if (!question || !agents || !Array.isArray(agents) || agents.length === 0) {
      return res.status(400).json({
        error: 'question and agents (array) are required'
      });
    }

    // Run consensus through deliberation routing
    const context = { agents, rounds, weights };
    const deliberation = await routeDeliberation(question, context);

    // Transform to consensus format
    const votes = (agents as string[]).map(agent => ({
      agent,
      vote: deliberation.consensus >= 0.95 ? 'YES' : 'NO',
      why: deliberation.reasoning.join('; ') || deliberation.decision
    }));

    res.json({
      mii: deliberation.consensus,
      final_answer: deliberation.decision,
      votes,
      reasoning: deliberation.reasoning,
      timestamp: deliberation.timestamp
    });
  } catch (error) {
    console.error('Consensus run failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Consensus failed',
      message: errorMessage
    });
  }
});

// Sync endpoints
app.get('/sync/get_cycle_status', (_req: Request, res: Response) => {
  // Return cycle status (mock for now, integrate with actual cycle tracking)
  res.json({
    cycle_id: 'C-132',
    date_local: new Date().toISOString(),
    gi_baseline: parseFloat(process.env.GI_MIN || '0.95'),
    next_epoch_eta_sec: 86400 // 24 hours
  });
});

app.get('/api/sentinels/aurea/status', (_req: Request, res: Response) => {
  // Return AUREA snapshot (mock for now)
  res.json({
    mii: 0.999,
    epoch: 'E-561',
    last_attestation_id: 'att-latest',
    ts: new Date().toISOString()
  });
});

// Start server
async function start() {
  console.log('🔴 Initializing Thought Broker...');

  // Initialize database
  initDB();
  console.log('✅ Database initialized');

  // Initialize cryptographic keys
  await initCrypto();
  console.log('✅ Crypto initialized');

  app.listen(PORT, () => {
    console.log(`🔴 Thought Broker operational on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/v1/health`);
    console.log(`📈 Metrics: http://localhost:${PORT}/v1/metrics`);
  });
}

start().catch(error => {
  console.error('Failed to start Thought Broker:', error);
  process.exit(1);
});

export default app;


