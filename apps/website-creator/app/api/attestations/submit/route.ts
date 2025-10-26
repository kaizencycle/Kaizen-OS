import { NextRequest, NextResponse } from 'next/server';
import { submitAttestation } from '@/lib/ledger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const out = await submitAttestation(body);
    return NextResponse.json(out, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

