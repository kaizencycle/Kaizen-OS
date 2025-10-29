import { NextRequest, NextResponse } from 'next/server'
import { buildFountainAttestation } from '@/lib/fountain-attestor'

/**
 * POST /api/fountain/attest
 *
 * Submits a Fountain Wallet attestation to the Civic Ledger.
 *
 * Required: AUREA attestation key signature
 * Optional: ZEUS co-signature for transparency
 *
 * Body:
 * {
 *   "attester_did": "did:gic:aurea",
 *   "signature": "ed25519:...",
 *   "cosigner_did": "did:gic:zeus", // optional
 *   "cosigner_signature": "ed25519:..." // optional
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { attester_did, signature, cosigner_did, cosigner_signature } = body

    // Validate attester
    if (attester_did !== 'did:gic:aurea') {
      return NextResponse.json(
        { error: 'Only AUREA can submit fountain attestations' },
        { status: 403 }
      )
    }

    // TODO: Verify Ed25519 signature
    if (!signature) {
      return NextResponse.json(
        { error: 'Attestation signature required' },
        { status: 400 }
      )
    }

    // Build attestation record
    const attestation = await buildFountainAttestation()

    // Add attestor info
    const fullAttestation = {
      ...attestation,
      attestation_type: 'fountain_heartbeat',
      attester_did,
      signature,
      cosigner_did: cosigner_did || null,
      cosigner_signature: cosigner_signature || null,
      dual_attested: !!(cosigner_did && cosigner_signature),
    }

    // TODO: Submit to Civic Ledger
    const ledgerApiBase = process.env.LEDGER_API_BASE
    if (ledgerApiBase) {
      // const response = await fetch(`${ledgerApiBase}/attestations`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(fullAttestation),
      // })
      // const result = await response.json()
      // return NextResponse.json({ success: true, ledger_tx: result.tx_hash })
    }

    // Return mock response for now
    return NextResponse.json({
      success: true,
      attestation: fullAttestation,
      ledger_tx: `0xmock${Date.now()}`,
      message: 'Attestation recorded (mock mode)',
    })
  } catch (error) {
    console.error('Fountain attestation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit attestation' },
      { status: 500 }
    )
  }
}
