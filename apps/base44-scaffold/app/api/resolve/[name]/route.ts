import { NextRequest, NextResponse } from 'next/server';
import { resolveName } from '@/lib/ledger';

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const data = await resolveName(params.name);
    return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
