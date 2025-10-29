import { NextRequest, NextResponse } from 'next/server'
import {
  distributeUBI,
  getDailyStats,
  getUBIHistory,
  getFountainAnalytics,
  isFountainOperational,
} from '@/lib/ubi-distributor'

/**
 * POST /api/fountain/ubi
 *
 * Claim daily UBI from the Civic GIC Fountain.
 *
 * Body:
 * {
 *   "recipient_did": "did:gic:citizen.123",
 *   "recipient_type": "human" | "automation",
 *   "proof": "automation_proof:sha3-512:signature" // Required for automations
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient_did, recipient_type, proof } = body

    // Validate required fields
    if (!recipient_did || !recipient_type) {
      return NextResponse.json(
        { error: 'recipient_did and recipient_type are required' },
        { status: 400 }
      )
    }

    // Validate recipient type
    if (!['human', 'automation'].includes(recipient_type)) {
      return NextResponse.json(
        { error: 'recipient_type must be "human" or "automation"' },
        { status: 400 }
      )
    }

    // Automations require work proof
    if (recipient_type === 'automation' && !proof) {
      return NextResponse.json(
        { error: 'Automations must provide work proof for UBI claim' },
        { status: 400 }
      )
    }

    // Distribute UBI
    const result = await distributeUBI({
      recipient_did,
      recipient_type,
      amount: 0, // Will be calculated by distributeUBI
      proof,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      distribution: result.distribution,
      message: `UBI claimed successfully: ${result.distribution?.amount} GIC`,
    })
  } catch (error) {
    console.error('UBI claim error:', error)
    return NextResponse.json(
      { error: 'Failed to process UBI claim' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/fountain/ubi
 *
 * Query UBI distribution stats and history.
 *
 * Query params:
 * - action: "stats" | "history" | "analytics" | "status"
 * - recipient_did: (required for history)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'stats': {
        const stats = await getDailyStats()
        return NextResponse.json(stats)
      }

      case 'history': {
        const recipientDID = searchParams.get('recipient_did')
        if (!recipientDID) {
          return NextResponse.json(
            { error: 'recipient_did required for history query' },
            { status: 400 }
          )
        }
        const history = await getUBIHistory(recipientDID)
        return NextResponse.json({ recipient_did: recipientDID, history })
      }

      case 'analytics': {
        const analytics = await getFountainAnalytics()
        return NextResponse.json(analytics)
      }

      case 'status':
      default: {
        const status = await isFountainOperational()
        const stats = await getDailyStats()
        return NextResponse.json({
          ...status,
          daily_stats: stats,
        })
      }
    }
  } catch (error) {
    console.error('UBI query error:', error)
    return NextResponse.json(
      { error: 'Failed to query UBI data' },
      { status: 500 }
    )
  }
}
