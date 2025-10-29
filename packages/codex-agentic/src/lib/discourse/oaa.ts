/**
 * OAA Hub Discourse Layer
 * Enables agents to learn and share knowledge via the OAA Hub
 */

import type { OAALearnPayload } from '../../types';

/**
 * Send a learning payload to the OAA Hub
 * This teaches the OAA about successful deliberations
 */
export async function oaaLearn(webhookUrl: string, payload: OAALearnPayload): Promise<void> {
  if (!webhookUrl) {
    console.warn('[OAA] No webhook URL provided, skipping learning');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`OAA webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log(`[OAA] Learning payload sent to ${payload.agent}`);
  } catch (error) {
    // Log but don't throw - learning is optional
    console.error('[OAA] Learning error:', error);
  }
}

/**
 * Query the OAA Hub for relevant knowledge
 */
export async function oaaQuery(query: string, agent: string): Promise<any> {
  const oaaBase = process.env.OAA_API_BASE;

  if (!oaaBase) {
    console.warn('[OAA] OAA_API_BASE not set, skipping query');
    return null;
  }

  try {
    const response = await fetch(`${oaaBase}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, agent }),
    });

    if (!response.ok) {
      console.error(`[OAA] Query failed: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[OAA] Query error:', error);
    return null;
  }
}

/**
 * Check if an agent has opted into OAA learning
 */
export function hasOAAConsent(agent: string): boolean {
  const consentVar = `OAA_CONSENT_${agent.toUpperCase()}`;
  return process.env[consentVar] === 'true';
}
