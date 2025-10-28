/**
 * GIC API Integration Utilities
 *
 * Provides functions to interact with:
 * - GIC Indexer (token operations)
 * - Civic Ledger (domain registration, attestation)
 * - Citizen Shield (GI validation)
 */

// API Base URLs (from environment)
const getApiBase = (service: 'gic' | 'ledger' | 'shield' | 'lab4') => {
  const bases = {
    gic: process.env.NEXT_PUBLIC_GIC_BASE || 'https://gic-indexer.onrender.com',
    ledger: process.env.NEXT_PUBLIC_LEDGER_BASE || 'https://civic-protocol-core-ledger.onrender.com',
    shield: process.env.NEXT_PUBLIC_LAB6_BASE || 'https://lab6-proof-api.onrender.com',
    lab4: process.env.NEXT_PUBLIC_LAB4_BASE || 'https://hive-api-2le8.onrender.com'
  };
  return bases[service];
};

// Types
export type GICDomain = {
  domain: string;
  owner: string;
  agent_id: string;
  gi_score: number;
  registered_at: string;
  tx_id: string;
  block_number: number;
};

export type GICMint = {
  amount: string;
  recipient: string;
  purpose: string;
  minted_at: string;
  tx_id: string;
  block_number: number;
};

export type GICBalance = {
  address: string;
  balance: string;
  last_ubi: string;
};

export type ConstitutionalCheck = {
  clause_1_human_dignity: boolean;
  clause_2_transparency: boolean;
  clause_3_equity: boolean;
  clause_4_safety: boolean;
  clause_5_privacy: boolean;
  clause_6_civic_integrity: boolean;
  clause_7_environment: boolean;
  overall_score: number;
  passed: boolean;
};

// ============================================================================
// DOMAIN OPERATIONS
// ============================================================================

/**
 * Register a .gic domain
 */
export async function registerGICDomain(params: {
  domain: string;
  owner: string;
  agent_id: string;
}): Promise<{ success: boolean; data?: GICDomain; error?: string }> {
  try {
    // 1. Validate GI score first
    const giValidation = await validateGIScore(params.agent_id);
    if (!giValidation.success || !giValidation.data?.passed) {
      return {
        success: false,
        error: `GI score validation failed: ${giValidation.data?.overall_score || 0} < 0.95`
      };
    }

    // 2. Register domain on ledger
    const ledgerBase = getApiBase('ledger');
    const response = await fetch(`${ledgerBase}/api/v1/domain/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: params.domain,
        owner: params.owner,
        agent_id: params.agent_id,
        gi_score: giValidation.data.overall_score,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Registration failed: ${error}` };
    }

    const data: GICDomain = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Domain registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a .gic domain is available
 */
export async function checkDomainAvailability(domain: string): Promise<{
  available: boolean;
  owner?: string;
}> {
  try {
    const ledgerBase = getApiBase('ledger');
    const response = await fetch(`${ledgerBase}/api/v1/domain/check/${domain}`);

    if (response.status === 404) {
      return { available: true };
    }

    if (response.ok) {
      const data = await response.json();
      return {
        available: false,
        owner: data.owner
      };
    }

    return { available: false };
  } catch (error) {
    console.error('Domain availability check error:', error);
    return { available: false };
  }
}

// ============================================================================
// TOKEN OPERATIONS
// ============================================================================

/**
 * Mint GIC tokens
 */
export async function mintGICTokens(params: {
  amount: number;
  recipient: string;
  purpose: string;
}): Promise<{ success: boolean; data?: GICMint; error?: string }> {
  try {
    // 1. Validate GI score
    const giValidation = await validateGIScore(params.recipient);
    if (!giValidation.success || !giValidation.data?.passed) {
      return {
        success: false,
        error: `GI score validation failed: ${giValidation.data?.overall_score || 0} < 0.95`
      };
    }

    // 2. Mint tokens on ledger
    const ledgerBase = getApiBase('ledger');
    const response = await fetch(`${ledgerBase}/api/v1/token/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: params.amount.toString(),
        recipient: params.recipient,
        purpose: params.purpose,
        gi_score: giValidation.data.overall_score,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Minting failed: ${error}` };
    }

    const data: GICMint = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Token minting error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get GIC token balance for an address
 */
export async function getGICBalance(address: string): Promise<{
  success: boolean;
  data?: GICBalance;
  error?: string;
}> {
  try {
    const gicBase = getApiBase('gic');
    const response = await fetch(`${gicBase}/api/v1/gic/balance/${address}`);

    if (!response.ok) {
      return { success: false, error: 'Balance not found' };
    }

    const data: GICBalance = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Balance fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// GI VALIDATION
// ============================================================================

/**
 * Validate GI score for an agent
 */
export async function validateGIScore(agent_id: string): Promise<{
  success: boolean;
  data?: ConstitutionalCheck;
  error?: string;
}> {
  try {
    const shieldBase = getApiBase('shield');
    const response = await fetch(`${shieldBase}/api/v1/shield/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id,
        action: 'token_operation',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      return { success: false, error: 'GI validation failed' };
    }

    const data: ConstitutionalCheck = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('GI validation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// MOCK MODE (for development/testing)
// ============================================================================

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_API === 'true';

/**
 * Mock domain registration (for testing)
 */
function mockRegisterDomain(params: {
  domain: string;
  owner: string;
  agent_id: string;
}): GICDomain {
  return {
    domain: params.domain,
    owner: params.owner,
    agent_id: params.agent_id,
    gi_score: 0.993,
    registered_at: new Date().toISOString(),
    tx_id: `0x${Math.random().toString(16).slice(2, 18)}`,
    block_number: Math.floor(Math.random() * 100000) + 1
  };
}

/**
 * Mock token minting (for testing)
 */
function mockMintTokens(params: {
  amount: number;
  recipient: string;
  purpose: string;
}): GICMint {
  return {
    amount: params.amount.toString(),
    recipient: params.recipient,
    purpose: params.purpose,
    minted_at: new Date().toISOString(),
    tx_id: `0x${Math.random().toString(16).slice(2, 18)}`,
    block_number: Math.floor(Math.random() * 100000) + 1
  };
}

/**
 * Mock GI validation (for testing)
 */
function mockValidateGI(agent_id: string): ConstitutionalCheck {
  return {
    clause_1_human_dignity: true,
    clause_2_transparency: true,
    clause_3_equity: true,
    clause_4_safety: true,
    clause_5_privacy: true,
    clause_6_civic_integrity: true,
    clause_7_environment: true,
    overall_score: 0.993,
    passed: true
  };
}

// Export mock mode flag
export { MOCK_MODE };
