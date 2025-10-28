import { NextResponse } from 'next/server';

// Single authority for cycle math/override.
// For now we hardcode to C-118 and allow ENV override.
// Later: compute from ledger or Command Ledger service.
export async function GET() {
  const cycle = process.env.KAIZEN_CURRENT_CYCLE ?? 'C-118';
  const gi    = Number(process.env.KAIZEN_GI_BASELINE ?? '0.993');
  const room  = 'Consensus Chamber';

  return NextResponse.json({
    cycle,
    gi,
    room,
    timestamp: new Date().toISOString()
  });
}

// POST endpoint to update cycle (requires authentication in production)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Add authentication/authorization
    // TODO: Validate against ledger
    // TODO: Emit consensus.session.opened event

    const { cycle, gi, room } = body;

    // In production, this would update a database/ledger
    // For now, we just echo back

    return NextResponse.json({
      success: true,
      cycle: cycle ?? process.env.KAIZEN_CURRENT_CYCLE ?? 'C-118',
      gi: gi ?? Number(process.env.KAIZEN_GI_BASELINE ?? '0.993'),
      room: room ?? 'Consensus Chamber',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
