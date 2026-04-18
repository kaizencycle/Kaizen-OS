export const READER_PREFS_STORAGE_KEY = 'mobius-handbook-library-prefs';

export const READER_PREF_CLASSES = {
  compact: 'mobius-pref-compact',
  wide: 'mobius-pref-wide',
  tocOff: 'mobius-pref-toc-off',
  tabsStickyOff: 'mobius-pref-tabs-sticky-off',
  reduceMotion: 'mobius-pref-reduce-motion',
  proofCompact: 'mobius-pref-proof-compact',
  underlineLinks: 'mobius-pref-underline-links',
  liveBarCompact: 'mobius-pref-live-bar-compact',
  codeWrap: 'mobius-pref-code-wrap',
  focusStrong: 'mobius-pref-focus-strong',
} as const;

export type ReaderPrefId = keyof typeof READER_PREF_CLASSES;

export type ReaderPrefs = Partial<Record<ReaderPrefId, boolean>>;

export function loadReaderPrefs(): ReaderPrefs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(READER_PREFS_STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    return o && typeof o === 'object' ? (o as ReaderPrefs) : {};
  } catch {
    return {};
  }
}

export function saveReaderPrefs(prefs: ReaderPrefs) {
  try {
    window.localStorage.setItem(READER_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function applyReaderPrefsToDocument(prefs: ReaderPrefs) {
  const root = document.documentElement;
  (Object.keys(READER_PREF_CLASSES) as ReaderPrefId[]).forEach((id) => {
    const cls = READER_PREF_CLASSES[id];
    if (prefs[id]) root.classList.add(cls);
    else root.classList.remove(cls);
  });
}
