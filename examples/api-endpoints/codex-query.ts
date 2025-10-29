/**
 * Example API Endpoint: Codex Query
 * POST /api/codex/query
 *
 * Execute a single agent deliberation using the Codex-Agentic system
 *
 * Usage in Next.js:
 * - Place in: pages/api/codex/query.ts
 * - Or: app/api/codex/query/route.ts (App Router)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { codexDeliberate } from '@kaizen/codex-agentic';
import type { CodexRequest, DelibProof } from '@kaizen/codex-agentic';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DelibProof | { error: string }>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    const body = req.body as Partial<CodexRequest>;

    // Validate required fields
    if (!body.agent) {
      return res.status(400).json({ error: 'Missing required field: agent' });
    }
    if (!body.input) {
      return res.status(400).json({ error: 'Missing required field: input' });
    }

    // Optional: Verify agent matches the site
    const siteAgent = process.env.AGENT_ID || process.env.NEXT_PUBLIC_AGENT_ID;
    if (siteAgent && body.agent !== siteAgent) {
      return res.status(403).json({
        error: `This site can only process requests for ${siteAgent}`
      });
    }

    // Execute deliberation
    console.log(`[API] Codex query for ${body.agent}: ${body.input.substring(0, 50)}...`);

    const proof = await codexDeliberate({
      agent: body.agent,
      input: body.input,
      context: body.context,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      tags: body.tags,
    });

    // Return DelibProof
    return res.status(200).json(proof);

  } catch (error: any) {
    console.error('[API] Codex query error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error'
    });
  }
}

// Example curl usage:
// curl -X POST http://localhost:3000/api/codex/query \
//   -H "Content-Type: application/json" \
//   -d '{"agent":"AUREA","input":"Explain the 90-day GIC epoch cycle"}'
