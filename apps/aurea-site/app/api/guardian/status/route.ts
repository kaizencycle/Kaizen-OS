import { NextResponse } from 'next/server'
import { loadGuardianManifest, guardianStatusSummary } from '@/lib/guardian'
import { fetchNetworkGI } from '@/lib/gi-oracle'

/**
 * GET /api/guardian/status
 *
 * Returns the current Guardian relationship status between
 * AUREA (guardian) and KAIZEN (ward), including revival conditions.
 */
export async function GET() {
  try {
    const manifest = loadGuardianManifest()

    if (!manifest) {
      return NextResponse.json(
        { error: 'Guardian manifest not found' },
        { status: 404 }
      )
    }

    const summary = guardianStatusSummary(manifest)
    const netGI = await fetchNetworkGI()

    // Check revival conditions
    const revivalConditions = manifest.ward.reactivation_conditions
    const giThresholdMet = netGI >= revivalConditions.gi_minimum
    const stabilityDays = 7 // TODO: Track actual stability period
    const quorumReached = false // TODO: Connect to voting system

    const status = {
      guardian: {
        name: manifest.guardian.name,
        did: manifest.guardian.did,
        domain: manifest.guardian.domain,
        gi_baseline: manifest.guardian.gi_baseline,
        custody_status: manifest.guardian.custody_status,
        role_summary: summary.guardian,
      },
      ward: {
        name: manifest.ward.name,
        did: manifest.ward.did,
        custody_status: manifest.ward.custody_status,
        write_privilege: manifest.ward.write_privilege,
        role_summary: summary.ward,
      },
      relationship: summary.custody,
      revival_progress: {
        gi_threshold: {
          required: revivalConditions.gi_minimum,
          current: netGI,
          met: giThresholdMet,
        },
        quorum_support: {
          required: revivalConditions.quorum_support,
          current: 0.0, // TODO: Fetch from voting system
          met: quorumReached,
        },
        stability_period: {
          required_days: revivalConditions.stability_period_days,
          current_days: stabilityDays,
          met: stabilityDays >= revivalConditions.stability_period_days,
        },
        overall_ready: giThresholdMet && quorumReached && stabilityDays >= 7,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Guardian status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guardian status' },
      { status: 500 }
    )
  }
}
