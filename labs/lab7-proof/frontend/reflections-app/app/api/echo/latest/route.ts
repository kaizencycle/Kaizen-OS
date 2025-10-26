import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const LOG_DIR = process.env.ECHO_LOG_DIR || 'echo_logs';

export async function GET() {
  try {
    const dir = path.resolve(process.cwd(), LOG_DIR);
    const files = (await fs.readdir(dir)).filter(f => f.startsWith('echo_') && f.endsWith('.json'));
    if (!files.length) return NextResponse.json({ error: 'No echo pulses found' }, { status: 404 });
    const latest = files.sort().at(-1)!; // lexicographic timestamp-friendly names
    const data = await fs.readFile(path.join(dir, latest), 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'read error' }, { status: 500 });
  }
}

