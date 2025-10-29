/**
 * Example API Endpoint: Discourse Round
 * POST /api/discourse/round
 *
 * Execute a council-wide deliberation across all active Founding Agents
 *
 * Usage in Next.js:
 * - Place in: pages/api/discourse/round.ts
 * - Or: app/api/discourse/round/route.ts (App Router)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { councilDeliberate } from '@kaizen/codex-agentic';

interface DiscourseRequest {
  input: string;
}

interface DiscourseResult {
  councilAgreement: number;
  giAvg: number;
  results: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DiscourseResult | { error: string }>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    const { input } = req.body as DiscourseRequest;

    // Validate
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid field: input' });
    }

    if (input.length < 10) {
      return res.status(400).json({ error: 'Input too short (minimum 10 characters)' });
    }

    // Optional: Rate limiting check
    // TODO: Implement rate limiting for discourse rounds (expensive operation)

    // Execute council deliberation
    console.log(`[API] Council round: ${input.substring(0, 50)}...`);

    const result = await councilDeliberate(input);

    console.log(
      `[API] Council complete: agreement=${result.councilAgreement.toFixed(2)}, ` +
      `gi=${result.giAvg.toFixed(3)}`
    );

    // Return result
    return res.status(200).json(result);

  } catch (error: any) {
    console.error('[API] Discourse round error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error'
    });
  }
}

// Example curl usage:
// curl -X POST http://localhost:3000/api/discourse/round \
//   -H "Content-Type: application/json" \
//   -d '{"input":"Should we raise the minimum agreement threshold to 0.92?"}'
