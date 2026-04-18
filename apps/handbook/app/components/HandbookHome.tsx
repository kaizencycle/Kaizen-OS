'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  READER_PREF_CLASSES,
  type ReaderPrefId,
  type ReaderPrefs,
  applyReaderPrefsToDocument,
  loadReaderPrefs,
  saveReaderPrefs,
} from '../../lib/readerPrefs';

type SnapshotResult =
  | { url: string; data: unknown }
  | { url: string; error: string };

const PREF_ROWS: { id: ReaderPrefId; label: string; hint: string }[] = [
  { id: 'compact', label: 'Compact type', hint: 'Smaller body text' },
  { id: 'wide', label: 'Wide layout', hint: 'Use full width on large screens' },
  { id: 'tocOff', label: 'Hide outline rail', hint: 'Single-column reading' },
  { id: 'tabsStickyOff', label: 'Subnav not sticky', hint: 'Quick links scroll away' },
  { id: 'reduceMotion', label: 'Reduce motion', hint: 'Minimal transitions' },
  { id: 'proofCompact', label: 'Compact snapshot', hint: 'Tighter JSON panel' },
  { id: 'underlineLinks', label: 'Underline links', hint: 'Clearer link affordance' },
  { id: 'liveBarCompact', label: 'Compact status strip', hint: 'Smaller meta row' },
  { id: 'codeWrap', label: 'Wrap long JSON lines', hint: 'Avoid horizontal scroll' },
  { id: 'focusStrong', label: 'Strong focus rings', hint: 'Keyboard emphasis' },
];

export function HandbookHome({ snapshot }: { snapshot: SnapshotResult }) {
  const [prefs, setPrefs] = useState<ReaderPrefs>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = loadReaderPrefs();
    setPrefs(initial);
    applyReaderPrefsToDocument(initial);
  }, []);

  const setPref = useCallback((id: ReaderPrefId, on: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev };
      if (on) next[id] = true;
      else delete next[id];
      saveReaderPrefs(next);
      applyReaderPrefsToDocument(next);
      return next;
    });
  }, []);

  const resetPrefs = useCallback(() => {
    const empty: ReaderPrefs = {};
    setPrefs(empty);
    saveReaderPrefs(empty);
    applyReaderPrefsToDocument(empty);
  }, []);

  const snapJson = useMemo(() => {
    if ('error' in snapshot) return null;
    try {
      return JSON.stringify(snapshot.data, null, 2);
    } catch {
      return '{}';
    }
  }, [snapshot]);

  return (
    <div className="hb-shell">
      <header className="hb-header">
        <div className="hb-header__top">
          <div className="hb-brand">
            <span className="hb-brand__mark" aria-hidden />
            <div>
              <h1 className="hb-title">Mobius Handbook Library</h1>
              <p className="hb-tagline">Level 3 — Terminal-aligned dark surface</p>
            </div>
          </div>
          <button
            type="button"
            className="hb-reader-toggle"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((o) => !o)}
          >
            Reader
          </button>
        </div>
        <nav className="hb-quick" aria-label="Quick links">
          <a href="https://kaizencycle.github.io/Mobius-Substrate/">Static handbook</a>
          <a href="https://mobius-civic-ai-terminal.vercel.app/">Live Terminal</a>
          <a href="https://github.com/kaizencycle/Mobius-Substrate">Substrate repo</a>
        </nav>
      </header>

      {panelOpen && (
        <div
          className="hb-panel-backdrop"
          role="presentation"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <aside
        className={`hb-reader-panel${panelOpen ? ' hb-reader-panel--open' : ''}`}
        aria-hidden={!panelOpen}
      >
        <div className="hb-reader-panel__head">
          <p className="hb-reader-panel__title">Display</p>
          <button type="button" className="hb-icon-btn" onClick={() => setPanelOpen(false)} aria-label="Close reader panel">
            ×
          </button>
        </div>
        <ul className="hb-pref-list">
          {PREF_ROWS.map((row) => (
            <li key={row.id} className="hb-pref-row">
              <div>
                <div className="hb-pref-label">{row.label}</div>
                <div className="hb-pref-hint">{row.hint}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={mounted ? !!prefs[row.id] : false}
                className="hb-switch"
                onClick={() => setPref(row.id, !prefs[row.id])}
              />
            </li>
          ))}
        </ul>
        <button type="button" className="hb-reset" onClick={resetPrefs}>
          Reset all
        </button>
      </aside>

      <main className="hb-main">
        <section className="hb-section">
          <h2>Overview</h2>
          <p className="hb-lead">
            Interactive shell for live Terminal state, with the static MkDocs handbook as the canonical
            publisher. This surface is dark-only to match the Terminal command line.
          </p>
        </section>

        <div className="hb-grid">
          <section className="hb-card">
            <h2>Static handbook</h2>
            <p className="hb-muted">
              Levels 1–2: proof tiles and proof-chain panels ship with the GitHub Pages build.
            </p>
            <a className="hb-cta" href="https://kaizencycle.github.io/Mobius-Substrate/">
              Open kaizencycle.github.io/Mobius-Substrate
            </a>
          </section>

          <section className="hb-card hb-card--snapshot">
            <div className="hb-card__head">
              <h2>Live snapshot-lite</h2>
              <span className={`hb-pill ${'error' in snapshot ? 'hb-pill--warn' : ''}`}>
                {'error' in snapshot ? 'Unavailable' : 'OK'}
              </span>
            </div>
            <p className="hb-muted hb-source">
              Source: <a href={snapshot.url}>{snapshot.url}</a>
            </p>
            {'error' in snapshot ? (
              <p className="hb-error">
                {snapshot.error}. Enable CORS on the Terminal for this origin when hosting.
              </p>
            ) : (
              <pre className="hb-pre">{snapJson}</pre>
            )}
          </section>
        </div>

        <section className="hb-card hb-roadmap">
          <h2>Roadmap</h2>
          <ul className="hb-muted hb-list">
            <li>Semantic search over exported doc corpus</li>
            <li>Force-directed protocol graph from claim index</li>
            <li>EPICON / Seal / daily-close timeline</li>
            <li>Optional reader accounts and tripwire hooks</li>
          </ul>
        </section>
      </main>

      <footer className="hb-footer">
        <span>Pref keys: {Object.keys(READER_PREF_CLASSES).length} toggles · persisted locally</span>
      </footer>
    </div>
  );
}
