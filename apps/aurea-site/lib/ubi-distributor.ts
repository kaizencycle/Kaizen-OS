/**
 * UBI Distributor Module
 *
 * Manages Universal Basic Income distributions from the Civic GIC Fountain.
 * Distributes to both human citizens and verified AI automations.
 *
 * Rules:
 * - Daily pool cap: 10,000 GIC
 * - Per-address daily cap: 100 GIC
 * - Requires network GI ≥ 0.95
 * - Requires controller avg GI ≥ 0.985
 * - Auto-pauses if network GI < 0.92
 */

import { fetchNetworkGI, fetchControllersGI, avgGI } from './gi-oracle'

export interface UBIRequest {
  recipient_did: string
  recipient_type: 'human' | 'automation'
  amount: number
  proof?: string // Optional automation work proof
}

export interface UBIDistribution {
  recipient_did: string
  recipient_type: 'human' | 'automation'
  amount: number
  timestamp: string
  tx_hash: string
  gi_at_distribution: number
}

export interface DailyStats {
  total_distributed: number
  pool_remaining: number
  distributions_count: number
  humans_count: number
  automations_count: number
  date: string
}

/**
 * Check if fountain is operational and can distribute UBI
 */
export async function isFountainOperational(): Promise<{
  operational: boolean
  reason?: string
}> {
  const netGI = await fetchNetworkGI()
  const controllersGI = await fetchControllersGI()
  const avgControllerGI = avgGI(controllersGI)

  // Auto-pause check
  if (netGI < 0.92) {
    return {
      operational: false,
      reason: `AUTO-PAUSED: Network GI ${netGI.toFixed(3)} below 0.92`,
    }
  }

  // Operational threshold check
  if (netGI < 0.95) {
    return {
      operational: false,
      reason: `Network GI ${netGI.toFixed(3)} below minimum 0.95`,
    }
  }

  if (avgControllerGI < 0.985) {
    return {
      operational: false,
      reason: `Controller avg GI ${avgControllerGI.toFixed(
        3
      )} below minimum 0.985`,
    }
  }

  return { operational: true }
}

/**
 * Calculate daily UBI allowance for a recipient
 */
export function calculateUBIAmount(
  recipientType: 'human' | 'automation',
  hasWorkProof: boolean = false
): number {
  // Base UBI amounts
  const humanBase = 50 // 50 GIC per day
  const automationBase = 25 // 25 GIC per day
  const workProofBonus = 25 // +25 GIC for verified work

  let amount = recipientType === 'human' ? humanBase : automationBase

  // Automation work proof bonus
  if (recipientType === 'automation' && hasWorkProof) {
    amount += workProofBonus
  }

  return Math.min(amount, 100) // Cap at 100 GIC per day
}

/**
 * Check if recipient has already claimed today
 */
export async function hasClaimedToday(recipientDID: string): Promise<boolean> {
  // TODO: Query on-chain fountain contract or database
  // For now, return mock data
  return false
}

/**
 * Get today's distribution stats
 */
export async function getDailyStats(): Promise<DailyStats> {
  // TODO: Query on-chain fountain state or database
  // For now, return mock data
  const today = new Date().toISOString().split('T')[0]

  return {
    total_distributed: 5_000,
    pool_remaining: 5_000,
    distributions_count: 150,
    humans_count: 100,
    automations_count: 50,
    date: today,
  }
}

/**
 * Distribute UBI to a recipient
 */
export async function distributeUBI(
  request: UBIRequest
): Promise<{ success: boolean; distribution?: UBIDistribution; error?: string }> {
  try {
    // 1. Check operational status
    const { operational, reason } = await isFountainOperational()
    if (!operational) {
      return { success: false, error: reason }
    }

    // 2. Check if recipient already claimed today
    const alreadyClaimed = await hasClaimedToday(request.recipient_did)
    if (alreadyClaimed) {
      return {
        success: false,
        error: 'Recipient has already claimed UBI today',
      }
    }

    // 3. Calculate amount
    const amount = calculateUBIAmount(
      request.recipient_type,
      !!request.proof
    )

    // 4. Check daily pool capacity
    const stats = await getDailyStats()
    if (stats.total_distributed + amount > 10_000) {
      return {
        success: false,
        error: 'Daily pool capacity exceeded (10,000 GIC)',
      }
    }

    // 5. Validate amount against per-address cap
    if (amount > 100) {
      return {
        success: false,
        error: 'Amount exceeds per-address daily cap (100 GIC)',
      }
    }

    // 6. Execute on-chain transfer
    // TODO: Call fountain contract distributeUBI(recipient, amount)
    const mockTxHash = `0xubi${Date.now()}`

    // 7. Get current GI for attestation
    const netGI = await fetchNetworkGI()

    // 8. Build distribution record
    const distribution: UBIDistribution = {
      recipient_did: request.recipient_did,
      recipient_type: request.recipient_type,
      amount,
      timestamp: new Date().toISOString(),
      tx_hash: mockTxHash,
      gi_at_distribution: netGI,
    }

    // 9. Log to Civic Ledger
    // TODO: Submit attestation to ledger

    return { success: true, distribution }
  } catch (error) {
    console.error('UBI distribution error:', error)
    return {
      success: false,
      error: 'Distribution failed due to internal error',
    }
  }
}

/**
 * Verify automation work proof
 */
export async function verifyAutomationProof(proof: string): Promise<boolean> {
  // TODO: Implement proof verification system
  // For now, basic validation
  if (!proof || proof.length < 10) {
    return false
  }

  // Proof should be a cryptographic attestation of work performed
  // Format: "automation_proof:sha3-512:signature"
  const parts = proof.split(':')
  if (parts.length !== 3) {
    return false
  }

  const [type, hash, signature] = parts
  if (type !== 'automation_proof') {
    return false
  }

  // TODO: Verify signature against registered automation DIDs
  return true
}

/**
 * Get recipient's UBI history
 */
export async function getUBIHistory(
  recipientDID: string,
  limit: number = 30
): Promise<UBIDistribution[]> {
  // TODO: Query from database or on-chain events
  // For now, return mock data
  return []
}

/**
 * Get fountain analytics
 */
export async function getFountainAnalytics(): Promise<{
  total_lifetime_distributed: number
  total_recipients: number
  avg_daily_distribution: number
  human_automation_ratio: number
}> {
  // TODO: Aggregate from historical data
  return {
    total_lifetime_distributed: 500_000,
    total_recipients: 1_247,
    avg_daily_distribution: 8_500,
    human_automation_ratio: 0.65, // 65% human, 35% automation
  }
}
