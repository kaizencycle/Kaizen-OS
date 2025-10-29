import { NextResponse } from 'next/server'
import { fetchNetworkGI, fetchControllersGI, avgGI } from '@/lib/gi-oracle'

/**
 * GET /api/fountain/metrics
 *
 * Returns current Fountain Wallet metrics including balance,
 * daily spend, GI scores, and operational status.
 */
export async function GET() {
  try {
    // Fetch GI metrics
    const netGI = await fetchNetworkGI()
    const controllersGI = await fetchControllersGI()
    const avgControllerGI = avgGI(controllersGI)

    // TODO: Replace with actual on-chain balance fetch
    const mockBalance = 1_000_000
    const mockDailySpend = 5_000

    // Check operational status
    const isOperational = netGI >= 0.95 && avgControllerGI >= 0.985
    const isPaused = netGI < 0.92

    const metrics = {
      wallet: 'did:gic:civic.fountain',
      balance: mockBalance,
      daily_spend: mockDailySpend,
      daily_pool_cap: 10_000,
      per_address_cap: 100,
      gi_metrics: {
        network: netGI,
        controllers: controllersGI,
        controllers_avg: avgControllerGI,
      },
      status: {
        operational: isOperational,
        paused: isPaused,
        message: isPaused
          ? 'AUTO-PAUSED: Network GI below 0.92'
          : isOperational
          ? 'OPERATIONAL'
          : 'DEGRADED: GI below threshold',
      },
      thresholds: {
        min_network_gi: 0.95,
        min_controller_avg_gi: 0.985,
        auto_pause_gi: 0.92,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Fountain metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fountain metrics' },
      { status: 500 }
    )
  }
}
