import { HandbookHome } from './components/HandbookHome';

async function fetchSnapshot() {
  const base =
    process.env.NEXT_PUBLIC_TERMINAL_BASE?.replace(/\/$/, '') ||
    'https://mobius-civic-ai-terminal.vercel.app';
  const url = `${base}/api/terminal/snapshot-lite`;
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return { url, error: `HTTP ${res.status}` };
    const json = await res.json();
    return { url, data: json };
  } catch (e) {
    return { url, error: e instanceof Error ? e.message : 'fetch failed' };
  }
}

export default async function HomePage() {
  const snap = await fetchSnapshot();
  return <HandbookHome snapshot={snap} />;
}
