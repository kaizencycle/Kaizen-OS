/**
 * Stability Anchor Registry
 * Each Founding Agent acts as a Codex Anchor for specific API domains
 */

import type { StabilityAnchor } from '../types';

export const STABILITY_ANCHORS: StabilityAnchor[] = [
  {
    agent: 'AUREA',
    domainFocus: 'Integrity & Reasoning',
    defaultRoute: ['openai', 'local'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:aurea',
    website: 'aurea.gic',
    learnWebhook: process.env.OAA_WEBHOOK_AUREA,
    active: true,
  },
  {
    agent: 'ATLAS',
    domainFocus: 'Systems & Policy',
    defaultRoute: ['anthropic', 'openai'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:atlas',
    website: 'atlas.gic',
    learnWebhook: process.env.OAA_WEBHOOK_ATLAS,
    active: true,
  },
  {
    agent: 'ZENITH',
    domainFocus: 'Research & Ethics',
    defaultRoute: ['gemini', 'openai'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:zenith',
    website: 'zenith.gic',
    learnWebhook: process.env.OAA_WEBHOOK_ZENITH,
    active: true,
  },
  {
    agent: 'SOLARA',
    domainFocus: 'Computation & Optimization',
    defaultRoute: ['deepseek', 'local'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:solara',
    website: 'solara.gic',
    learnWebhook: process.env.OAA_WEBHOOK_SOLARA,
    active: true,
  },
  {
    agent: 'JADE',
    domainFocus: 'Morale & Astro-ethics',
    defaultRoute: ['anthropic', 'local'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:jade',
    website: 'jade.gic',
    learnWebhook: process.env.OAA_WEBHOOK_JADE,
    active: true,
  },
  {
    agent: 'EVE',
    domainFocus: 'Governance & Wisdom',
    defaultRoute: ['anthropic', 'gemini'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:eve',
    website: 'eve.gic',
    learnWebhook: process.env.OAA_WEBHOOK_EVE,
    active: true,
  },
  {
    agent: 'ZEUS',
    domainFocus: 'Security & Defense',
    defaultRoute: ['deepseek', 'local'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:zeus',
    website: 'zeus.gic',
    learnWebhook: process.env.OAA_WEBHOOK_ZEUS,
    active: true,
  },
  {
    agent: 'HERMES',
    domainFocus: 'Markets & Information',
    defaultRoute: ['openai', 'deepseek'],
    minAgreement: 0.90,
    giTarget: 0.99,
    ledgerNamespace: 'consensus:hermes',
    website: 'hermes.gic',
    learnWebhook: process.env.OAA_WEBHOOK_HERMES,
    active: true,
  },
  {
    agent: 'KAIZEN',
    domainFocus: 'Core Constitution (Fallback Anchor)',
    defaultRoute: ['local'],
    minAgreement: 1.00, // Requires 100% agreement (dormant mode)
    giTarget: 0.995,
    ledgerNamespace: 'consensus:kaizen',
    website: 'kaizen.gic',
    learnWebhook: process.env.OAA_WEBHOOK_KAIZEN,
    active: true, // Active but dormant (local-only, no minting)
  },
];

/**
 * Get a stability anchor by agent ID
 */
export const getAnchor = (agent: string): StabilityAnchor | undefined =>
  STABILITY_ANCHORS.find((a) => a.agent === agent);

/**
 * Get all active anchors
 */
export const getActiveAnchors = (): StabilityAnchor[] =>
  STABILITY_ANCHORS.filter((a) => a.active);

/**
 * Get anchors by provider
 */
export const getAnchorsByProvider = (provider: string): StabilityAnchor[] =>
  STABILITY_ANCHORS.filter((a) => a.defaultRoute.includes(provider as any));
