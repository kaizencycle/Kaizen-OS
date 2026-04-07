import React from 'react';
import type { TerminalState } from '@/src/lib/terminal-bridge';

const DOMAIN_ORDER = [
  'civic',
  'environ',
  'financial',
  'narrative',
  'infrastructure',
  'institutional',
] as const;

const DOMAIN_LABEL: Record<(typeof DOMAIN_ORDER)[number], string> = {
  civic: 'CIVIC',
  environ: 'ENVIRON',
  financial: 'FINANCIAL',
  narrative: 'NARRATIVE',
  infrastructure: 'INFRASTR',
  institutional: 'INSTITUTIONAL',
};

const TERMINAL_URL = 'https://mobius-civic-ai-terminal.vercel.app/terminal' as const;

function scoreTone(score: number): string {
  if (score >= 0.8) return 'text-emerald-600';
  if (score >= 0.65) return 'text-amber-600';
  return 'text-rose-600';
}

interface WorldSignalStripProps {
  terminalState: TerminalState | null;
}

export const WorldSignalStrip: React.FC<WorldSignalStripProps> = ({ terminalState }) => {
  return (
    <div className="flex-none border-b border-stone-200 bg-stone-50/80 px-3 sm:px-6 py-2">
      <p className="font-mono text-[10px] sm:text-xs text-stone-600 leading-relaxed tracking-tight">
        {DOMAIN_ORDER.map((key, i) => {
          const row = terminalState?.sentiment[key];
          const score = row?.score ?? null;
          const label = DOMAIN_LABEL[key];
          const tone = score !== null ? scoreTone(score) : 'text-stone-400';
          const shown = score !== null ? score.toFixed(2) : '—';
          return (
            <span key={key}>
              {i > 0 ? <span className="text-stone-400"> · </span> : null}
              <span className="text-stone-500">{label}</span>{' '}
              <span className={tone}>{shown}</span>
            </span>
          );
        })}
      </p>
      <a
        href={TERMINAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-[10px] text-stone-500 hover:text-stone-700 underline-offset-2 hover:underline font-mono"
      >
        Live world signal · Mobius Terminal →
      </a>
    </div>
  );
};
