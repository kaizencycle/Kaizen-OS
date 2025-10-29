/**
 * Example API Endpoint: GI Stream
 * GET /api/gi/stream
 *
 * Server-Sent Events (SSE) stream for real-time Governance Integrity metrics
 *
 * Usage in Next.js:
 * - Place in: pages/api/gi/stream.ts
 * - Or: app/api/gi/stream/route.ts (App Router)
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Disable body parsing for SSE
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method not allowed');
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

  // Helper to send SSE message
  const send = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial hello
  send('hello', {
    message: 'Connected to GI stream',
    timestamp: new Date().toISOString(),
  });

  // Heartbeat interval (every 5 seconds)
  const heartbeatInterval = setInterval(() => {
    // TODO: Fetch real GI metrics from ledger or monitoring service
    const mockGI = 0.99 - Math.random() * 0.02; // 0.97-0.99 range

    send('heartbeat', {
      gi: parseFloat(mockGI.toFixed(3)),
      timestamp: new Date().toISOString(),
    });
  }, 5000);

  // TODO: Subscribe to real-time GI updates from:
  // - Civic Ledger attestation stream
  // - Codex deliberation events
  // - Consensus Chamber updates

  // Example: Send GI update on deliberation
  const mockDeliberationInterval = setInterval(() => {
    if (Math.random() > 0.8) { // 20% chance per interval
      send('deliberation', {
        agent: ['AUREA', 'ATLAS', 'ZENITH'][Math.floor(Math.random() * 3)],
        agreement: parseFloat((0.85 + Math.random() * 0.15).toFixed(2)),
        gi: parseFloat((0.95 + Math.random() * 0.05).toFixed(3)),
        timestamp: new Date().toISOString(),
      });
    }
  }, 10000);

  // Cleanup on client disconnect
  req.on('close', () => {
    console.log('[SSE] Client disconnected from GI stream');
    clearInterval(heartbeatInterval);
    clearInterval(mockDeliberationInterval);
    res.end();
  });
}

// Example client usage (JavaScript):
/*
const eventSource = new EventSource('/api/gi/stream');

eventSource.addEventListener('hello', (e) => {
  console.log('Connected:', JSON.parse(e.data));
});

eventSource.addEventListener('heartbeat', (e) => {
  const { gi, timestamp } = JSON.parse(e.data);
  console.log(`GI: ${gi} at ${timestamp}`);
});

eventSource.addEventListener('deliberation', (e) => {
  const { agent, agreement, gi } = JSON.parse(e.data);
  console.log(`${agent} deliberation: agreement=${agreement}, gi=${gi}`);
});

// Cleanup
eventSource.close();
*/
