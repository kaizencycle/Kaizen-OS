import { Router, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { GICalculator, IntegrityChecks } from '@civic/integrity-core';

const router = Router();

const XAI_API_BASE_URL = process.env.XAI_API_BASE_URL || 'https://api.x.ai/v1';
const XAI_API_KEY = process.env.XAI_API_KEY;
const DEFAULT_MODEL = process.env.SENTINEL_URIEL_MODEL || 'grok-4';
const DEFAULT_MAX_TOKENS = Number(process.env.SENTINEL_URIEL_MAX_TOKENS || 4096);
const SENTINEL_GI_MIN = Number(process.env.SENTINEL_URIEL_GI_MIN || process.env.GI_MIN || 0.95);
const REQUEST_TIMEOUT = Number(process.env.SENTINEL_URIEL_TIMEOUT_MS || 20000);
const QPS_LIMIT = Number(process.env.SENTINEL_URIEL_QPS || 0.1);

const calculator = new GICalculator();

let lastInvocationAt = 0;

interface UrielRequestBody {
  intent?: string;
  context?: Record<string, unknown>;
  gi?: number;
  model?: string;
  maxTokens?: number;
}

interface XaiChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function ensureRateLimit(): number | null {
  if (QPS_LIMIT <= 0) {
    return null;
  }

  const intervalMs = 1000 / QPS_LIMIT;
  const now = Date.now();

  if (now - lastInvocationAt < intervalMs) {
    return Math.ceil(intervalMs - (now - lastInvocationAt));
  }

  lastInvocationAt = now;
  return null;
}

function buildGiFromMetrics(durationMs: number): number {
  const checks: IntegrityChecks = {
    responseTime: Math.min(durationMs, 5000),
    latency: Math.min(durationMs, 5000),
    memoryUsage: 35,
    errorRate: 0,
    uptime: 7200,
    throughput: 60,
    availability: 99.5
  };

  const giRaw = calculator.calculateGI(checks);
  return Number(giRaw.toFixed(3));
}

router.post('/query', async (req: Request, res: Response) => {
  const { intent, gi: reportedGi, model, maxTokens }: UrielRequestBody = req.body || {};

  if (!intent || typeof intent !== 'string' || intent.trim().length === 0) {
    return res.status(400).json({ error: 'intent is required' });
  }

  if (!XAI_API_KEY) {
    return res.status(503).json({ error: 'URIEL unavailable: missing XAI_API_KEY' });
  }

  const retryAfterMs = ensureRateLimit();
  if (retryAfterMs !== null) {
    return res.status(429).json({
      error: 'URIEL rate limit exceeded',
      retryAfterMs
    });
  }

  const prompt = `URIEL MODE: Illuminate truth in "${intent}". Current GI=${(reportedGi ?? 0.993).toFixed(3)}. Respond concisely and cite public sources when available.`;

  const completionModel = model || DEFAULT_MODEL;
  const tokens = Math.min(Math.max(Number(maxTokens) || DEFAULT_MAX_TOKENS, 1), DEFAULT_MAX_TOKENS);

  try {
    const startedAt = Date.now();
    const { data } = await axios.post<XaiChatCompletion>(
      `${XAI_API_BASE_URL}/chat/completions`,
      {
        model: completionModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: tokens
      },
      {
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: REQUEST_TIMEOUT
      }
    );

    const durationMs = Date.now() - startedAt;
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(502).json({ error: 'xAI response missing content' });
    }

    const giScore = buildGiFromMetrics(durationMs);

    if (giScore < SENTINEL_GI_MIN) {
      return res.status(409).json({
        error: `GI below threshold: ${giScore.toFixed(3)}`,
        route_to: 'EVE'
      });
    }

    return res.json({
      sentinel: 'URIEL',
      illumination: content,
      gi: giScore,
      latencyMs: durationMs,
      model: completionModel
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return res.status(axiosError.response.status).json({
        error: 'xAI request failed',
        details: axiosError.response.data
      });
    }

    if (axiosError.request) {
      return res.status(504).json({
        error: 'No response received from xAI',
        details: axiosError.message
      });
    }

    return res.status(500).json({
      error: 'Unexpected error contacting xAI',
      details: axiosError.message
    });
  }
});

export default router;

