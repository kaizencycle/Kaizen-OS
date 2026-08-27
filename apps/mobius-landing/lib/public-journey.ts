/**
 * Canonical public surface URLs for mobius-substrate.com journey links.
 * DNS for chambers may be provisioned separately; links are forward-compatible.
 */

export const PUBLIC_JOURNEY_URLS = {
  pulse: 'https://terminal.mobius-substrate.com',
  chambers: 'https://chambers.mobius-substrate.com',
  /** Playable renderer — handbook entry until a dedicated public HIVE domain is canonical. */
  hive: 'https://handbook.mobius-substrate.com/docs/05-IMPLEMENTATION/hive/HIVE-Operator-Handbook-v0.1',
  epicon: 'https://epicon.mobius-substrate.com',
  handbook: 'https://handbook.mobius-substrate.com',
  github: 'https://github.com/kaizencycle/Mobius-Substrate',
  about: 'https://handbook.mobius-substrate.com/docs/MOBIUS',
} as const;

export const JOURNEY_LOOP = [
  'SEE',
  'UNDERSTAND',
  'SIMULATE',
  'ACT',
  'REFLECT',
  'WITNESS',
  'LEARN',
] as const;
