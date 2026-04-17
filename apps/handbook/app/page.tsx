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

  return (
    <main>
      <h1>Mobius Handbook Library</h1>
      <p className="lead">
        Level 3 shell: live Terminal preview, links to the static handbook on GitHub Pages, and room
        for graph search and timelines. MkDocs remains the canonical markdown publisher; this app adds
        interactivity that does not belong in a static build.
      </p>

      <div className="grid">
        <div className="card">
          <h2>Static handbook (MkDocs)</h2>
          <p className="muted">
            Levels 1–2: <code>&lt;mobius-proof&gt;</code> widgets and proof-chain panels ship with the site.
          </p>
          <p>
            <a href="https://kaizencycle.github.io/Mobius-Substrate/">kaizencycle.github.io/Mobius-Substrate</a>
          </p>
        </div>

        <div className="card">
          <h2>Live snapshot-lite</h2>
          <p className="muted">
            Source: <a href={snap.url}>{snap.url}</a>
          </p>
          {'error' in snap && snap.error ? (
            <p className="error">Unavailable: {snap.error}. Set CORS on the Terminal for this origin.</p>
          ) : (
            <pre>{JSON.stringify('data' in snap ? snap.data : {}, null, 2)}</pre>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Roadmap (this app)</h2>
        <ul className="muted">
          <li>Semantic search over exported doc corpus</li>
          <li>Force-directed protocol graph from claim index</li>
          <li>EPICON / Seal / daily-close timeline</li>
          <li>Optional reader accounts + tripwire hooks (PAW / Shell)</li>
        </ul>
      </div>
    </main>
  );
}
