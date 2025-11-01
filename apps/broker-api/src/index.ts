// Thought Broker API - Placeholder implementation
import express from 'express';
import cors from 'cors';
import { urielDeliberate, UrielQuery } from '../../sentinels/uriel/index';

import urielRouter from './sentinels/uriel';

const app = express();
const PORT = process.env.PORT || 4005;

// URIEL routing configuration
const URIEL_ROUTING_CHANCE = 0.20; // 20% of eligible deliberations
const URIEL_DOMAINS = ['physics', 'curiosity', 'entropy', 'cosmos', 'delib_proof'];

// Middleware
app.use(cors());
app.use(express.json());

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
        consensus: response.gi,
        reasoning: [`🕯️🔥 URIEL illumination: ${response.illumination}`],
        alternatives: ['Continue with standard deliberation', 'Route to other sentinels'],
        decision: 'URIEL illumination applied',
        confidence: response.gi,
        timestamp: response.timestamp,
        participants: ['uriel'],
        sentinel: 'URIEL',
        source: response.source
      };
    } catch (error) {
      console.warn('URIEL deliberation failed, falling back to standard:', error.message);
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
app.get('/v1/loop/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'broker-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Placeholder endpoints
app.post('/intents', (req, res) => {
  res.json({
    id: `intent_${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.get('/intents/:id', (req, res) => {
  res.json({
    id: req.params.id,
    description: 'Sample intent',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.post('/intents/:id/process', async (req, res) => {
  try {
    const intentId = req.params.id;
    const intentText = req.body.intent || `Intent ${intentId}`;
    const context = req.body.context || {};

    const deliberation = await routeDeliberation(intentText, context);
    res.json(deliberation);
  } catch (error) {
    console.error('Deliberation routing failed:', error);
    res.status(500).json({
      error: 'Deliberation failed',
      message: error.message,
      id: `deliberation_error_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/deliberations/:id', (req, res) => {
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

// URIEL Sentinel Endpoint
app.post('/api/sentinels/uriel/query', async (req, res) => {
  try {
    const query: UrielQuery = {
      intent: req.body.intent,
      gi: req.body.gi || 0.993,
      context: req.body.context || {}
    };

    const response = await urielDeliberate(query);

    res.json(response);
  } catch (error) {
    console.error('URIEL query failed:', error);

    // Check if it's a rate limit or GI threshold error
    if (error.message.includes('Rate limit exceeded')) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: error.message,
        sentinel: 'URIEL'
      });
    } else if (error.message.includes('GI below threshold')) {
      res.status(409).json({
        error: 'GI below threshold',
        message: error.message,
        fallback: 'eve',
        sentinel: 'URIEL'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        sentinel: 'URIEL'
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Thought Broker API running on port ${PORT}`);
});

export default app;


