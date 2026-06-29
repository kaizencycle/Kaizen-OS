/**
 * Mobius Handbook — public UX: dark-only lock, skip link, Terminal live bar,
 * announce dismiss, reader preferences (10 display customizations).
 * Runs with mobius-proof.js (proof tiles load separately).
 */
(function () {
  'use strict';

  var TERMINAL_META = 'meta[name="mobius-terminal-base"]';
  var BAR_ID = 'mobius-handbook-live-bar';
  var ANNOUNCE_KEY = 'mobius-handbook-announce-dismissed';
  var PREFS_KEY = 'mobius-handbook-prefs';
  var FORCED_SCHEME_KEY = 'mobius-handbook-scheme';

  /** @type {Record<string, string>} pref id -> body class */
  var PREF_CLASSES = {
    compact: 'mobius-pref-compact',
    wide: 'mobius-pref-wide',
    tocOff: 'mobius-pref-toc-off',
    tabsStickyOff: 'mobius-pref-tabs-sticky-off',
    reduceMotion: 'mobius-pref-reduce-motion',
    proofCompact: 'mobius-pref-proof-compact',
    underlineLinks: 'mobius-pref-underline-links',
    liveBarCompact: 'mobius-pref-live-bar-compact',
    codeWrap: 'mobius-pref-code-wrap',
    focusStrong: 'mobius-pref-focus-strong'
  };

  function terminalBase() {
    var m = document.querySelector(TERMINAL_META);
    return (m && m.getAttribute('content')) || 'https://terminal.mobius-substrate.com';
  }

  function forceDarkScheme() {
    try {
      sessionStorage.setItem(FORCED_SCHEME_KEY, 'slate');
    } catch (e) {
      /* ignore */
    }
    var inputs = document.querySelectorAll('input[name="__palette"]');
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      var val = inp.getAttribute('value') || inp.getAttribute('data-md-color-scheme');
      if (val === 'slate') {
        if (!inp.checked) {
          inp.click();
        }
        break;
      }
    }
    var palette = document.querySelector('[data-md-component="palette"]');
    if (palette) {
      palette.setAttribute('hidden', '');
      palette.style.display = 'none';
    }
  }

  function scheduleForceDark() {
    forceDarkScheme();
    requestAnimationFrame(forceDarkScheme);
    setTimeout(forceDarkScheme, 0);
    setTimeout(forceDarkScheme, 120);
  }

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return o && typeof o === 'object' ? o : {};
    } catch (e) {
      return {};
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {
      /* ignore */
    }
  }

  function applyPrefs(prefs) {
    var body = document.body;
    Object.keys(PREF_CLASSES).forEach(function (id) {
      var cls = PREF_CLASSES[id];
      if (prefs[id]) body.classList.add(cls);
      else body.classList.remove(cls);
    });
  }

  function skipLink() {
    if (document.getElementById('mobius-skip-content')) return;
    var a = document.createElement('a');
    a.id = 'mobius-skip-content';
    a.className = 'mobius-skip-link';
    a.href = '#mobius-handbook-main';
    a.textContent = 'Skip to content';
    document.body.insertBefore(a, document.body.firstChild);
    var main = document.querySelector('.md-main') || document.querySelector('main');
    if (main && !main.id) main.id = 'mobius-handbook-main';
  }

  function announceDismiss() {
    var banner = document.querySelector('.md-banner');
    if (!banner || sessionStorage.getItem(ANNOUNCE_KEY)) {
      if (banner && sessionStorage.getItem(ANNOUNCE_KEY)) {
        banner.style.display = 'none';
      }
      return;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mobius-announce-dismiss';
    btn.setAttribute('aria-label', 'Dismiss announcement');
    btn.innerHTML = '\u00d7';
    btn.addEventListener('click', function () {
      sessionStorage.setItem(ANNOUNCE_KEY, '1');
      banner.style.display = 'none';
    });
    banner.appendChild(btn);
  }

  function modeChipClass(mode) {
    var m = String(mode || '').toLowerCase();
    if (m === 'green') return 'mobius-live-bar__chip mobius-live-bar__chip--green';
    if (m === 'yellow') return 'mobius-live-bar__chip mobius-live-bar__chip--yellow';
    if (m === 'red') return 'mobius-live-bar__chip mobius-live-bar__chip--red';
    return 'mobius-live-bar__chip mobius-live-bar__chip--yellow';
  }

  function renderBar(el, html, isError) {
    el.id = BAR_ID;
    el.className = 'mobius-live-bar' + (isError ? ' mobius-live-bar--error' : '');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = html;
  }

  function fetchSnapshot(base, bypass) {
    var url = base.replace(/\/$/, '') + '/api/terminal/snapshot-lite';
    return fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: bypass ? 'no-store' : 'default'
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function buildBarHtml(base, d, isError) {
    if (isError) {
      return (
        '<span class="mobius-live-bar__label">Live</span>' +
        '<span>Snapshot unavailable (CORS or network). </span>' +
        '<a class="mobius-live-bar__link" href="' +
        escapeAttr(base + '/') +
        '" target="_blank" rel="noopener">Open Terminal</a>' +
        ' · <a class="mobius-live-bar__link" href="' +
        escapeAttr('https://github.com/kaizencycle/mobius-civic-ai-terminal') +
        '" target="_blank" rel="noopener">Terminal repo</a>' +
        '<button type="button" class="mobius-live-bar__refresh" aria-label="Retry loading live snapshot">Retry</button>'
      );
    }

    var cycle = d.cycle != null ? d.cycle : '—';
    var gi = d.gi != null ? d.gi : (d.lanes && d.lanes.integrity && d.lanes.integrity.gi);
    var mode = d.mode != null ? d.mode : (d.lanes && d.lanes.integrity && d.lanes.integrity.mode);
    var deg = !!d.degraded;
    var ts = d.timestamp ? String(d.timestamp).slice(11, 19) + 'Z' : '';

    var html =
      '<span class="mobius-live-bar__label">Live</span>' +
      '<span>Cycle <strong>' +
      escapeHtml(String(cycle)) +
      '</strong></span><span class="mobius-live-bar__sep">·</span>' +
      '<span>GI <strong>' +
      escapeHtml(gi == null ? '—' : Number(gi).toFixed(2)) +
      '</strong></span><span class="mobius-live-bar__sep">·</span>' +
      '<span class="' +
      modeChipClass(mode) +
      '">' +
      escapeHtml(String(mode || '—')) +
      '</span>';

    if (deg) {
      html += '<span class="mobius-live-bar__sep">·</span><span>degraded</span>';
    }

    if (ts) {
      html +=
        '<span class="mobius-live-bar__sep">·</span><span class="mobius-live-bar__muted" title="' +
        escapeAttr(String(d.timestamp || '')) +
        '">snapshot ' +
        escapeHtml(ts) +
        '</span>';
    }

    html +=
      '<span class="mobius-live-bar__sep">·</span>' +
      '<a class="mobius-live-bar__link" href="' +
      escapeAttr(base + '/') +
      '" target="_blank" rel="noopener">Open Terminal</a>' +
      '<span class="mobius-live-bar__sep">·</span>' +
      '<a class="mobius-live-bar__link" href="' +
      escapeAttr(base.replace(/\/$/, '') + '/api/terminal/snapshot-lite') +
      '" target="_blank" rel="noopener">View JSON</a>' +
      '<button type="button" class="mobius-live-bar__refresh" aria-label="Refresh live snapshot">Refresh</button>';

    return html;
  }

  function wireRefresh(bar, base) {
    var btn = bar.querySelector('.mobius-live-bar__refresh');
    if (!btn) return;
    btn.addEventListener('click', function () {
      btn.disabled = true;
      btn.textContent = '…';
      fetchSnapshot(base, true)
        .then(function (d) {
          renderBar(bar, buildBarHtml(base, d, false), false);
          wireRefresh(bar, base);
        })
        .catch(function () {
          renderBar(bar, buildBarHtml(base, null, true), true);
          wireRefresh(bar, base);
        });
    });
  }

  function initLiveBar() {
    var headerInner = document.querySelector('.md-header__inner');
    if (!headerInner || document.getElementById(BAR_ID)) return;

    var bar = document.createElement('div');
    var base = terminalBase().replace(/\/$/, '');

    renderBar(
      bar,
      '<span class="mobius-live-bar__label">Live</span><span>Loading Terminal snapshot…</span>' +
        '<button type="button" class="mobius-live-bar__refresh" disabled aria-label="Loading">…</button>',
      false
    );
    headerInner.appendChild(bar);

    fetchSnapshot(base, false)
      .then(function (d) {
        renderBar(bar, buildBarHtml(base, d, false), false);
        wireRefresh(bar, base);
      })
      .catch(function () {
        renderBar(bar, buildBarHtml(base, null, true), true);
        wireRefresh(bar, base);
      });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function makeSwitch(id, label, hint, checked, onChange) {
    var row = document.createElement('div');
    row.className = 'mobius-reader-panel__row';

    var labWrap = document.createElement('div');
    labWrap.className = 'mobius-reader-panel__label';

    var span = document.createElement('span');
    span.textContent = label;
    labWrap.appendChild(span);

    if (hint) {
      var h = document.createElement('span');
      h.className = 'mobius-reader-panel__hint';
      h.textContent = hint;
      labWrap.appendChild(h);
    }

    var sw = document.createElement('button');
    sw.type = 'button';
    sw.role = 'switch';
    sw.id = 'mobius-pref-' + id;
    sw.className = 'mobius-reader-panel__switch';
    sw.setAttribute('aria-checked', checked ? 'true' : 'false');
    sw.setAttribute('aria-label', label);

    sw.addEventListener('click', function () {
      var next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', next ? 'true' : 'false');
      onChange(next);
    });

    row.appendChild(labWrap);
    row.appendChild(sw);
    return { row: row, setChecked: function (v) {
      sw.setAttribute('aria-checked', v ? 'true' : 'false');
    } };
  }

  function initReaderPanel() {
    if (document.getElementById('mobius-reader-panel')) return;

    var prefs = loadPrefs();
    applyPrefs(prefs);

    var root = document.createElement('div');
    root.id = 'mobius-reader-panel';
    root.className = 'mobius-reader-panel';
    root.setAttribute('data-mobius-reader-panel', '');

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobius-reader-panel__toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'mobius-reader-sheet');
    toggle.textContent = 'Reader';

    var sheet = document.createElement('div');
    sheet.id = 'mobius-reader-sheet';
    sheet.className = 'mobius-reader-panel__sheet';
    sheet.setAttribute('role', 'region');
    sheet.setAttribute('aria-label', 'Reading preferences');
    sheet.setAttribute('hidden', '');

    var title = document.createElement('p');
    title.className = 'mobius-reader-panel__title';
    title.textContent = 'Handbook display';
    sheet.appendChild(title);

    var switches = {};

    function commit() {
      savePrefs(prefs);
      applyPrefs(prefs);
    }

    var defs = [
      { id: 'compact', label: 'Compact type', hint: 'Smaller body text, tighter lines' },
      { id: 'wide', label: 'Wide column', hint: 'More horizontal room for tables' },
      { id: 'tocOff', label: 'Hide page TOC', hint: 'Right sidebar table of contents' },
      { id: 'tabsStickyOff', label: 'Tabs not sticky', hint: 'Tabs scroll away with the page' },
      { id: 'reduceMotion', label: 'Reduce motion', hint: 'Minimal animation and transitions' },
      { id: 'proofCompact', label: 'Compact proof tiles', hint: 'Tighter live proof cards' },
      { id: 'underlineLinks', label: 'Underline links', hint: 'Clearer links in prose' },
      { id: 'liveBarCompact', label: 'Compact live bar', hint: 'Smaller Terminal strip in header' },
      { id: 'codeWrap', label: 'Wrap long code', hint: 'Avoid horizontal scroll in snippets' },
      { id: 'focusStrong', label: 'Strong focus rings', hint: 'High-contrast keyboard focus' }
    ];

    for (var j = 0; j < defs.length; j++) {
      (function (def) {
        var id = def.id;
        var ui = makeSwitch(id, def.label, def.hint, !!prefs[id], function (on) {
          if (on) prefs[id] = true;
          else delete prefs[id];
          commit();
        });
        sheet.appendChild(ui.row);
        switches[id] = ui;
      })(defs[j]);
    }

    var foot = document.createElement('div');
    foot.className = 'mobius-reader-panel__footer';
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'mobius-reader-panel__reset';
    reset.textContent = 'Reset all';
    reset.addEventListener('click', function () {
      prefs = {};
      savePrefs(prefs);
      applyPrefs(prefs);
      Object.keys(switches).forEach(function (k) {
        switches[k].setChecked(false);
      });
    });
    foot.appendChild(reset);
    sheet.appendChild(foot);

    function setOpen(open) {
      root.classList.toggle('mobius-reader-panel--open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) sheet.removeAttribute('hidden');
      else sheet.setAttribute('hidden', '');
    }

    toggle.addEventListener('click', function () {
      setOpen(!root.classList.contains('mobius-reader-panel--open'));
    });

    document.addEventListener('click', function (ev) {
      if (!root.contains(ev.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') setOpen(false);
    });

    root.appendChild(sheet);
    root.appendChild(toggle);
    document.body.appendChild(root);
  }

  function init() {
    skipLink();
    announceDismiss();
    scheduleForceDark();
    initLiveBar();
    initReaderPanel();
    document.addEventListener('DOMContentLoaded', scheduleForceDark);
    window.addEventListener('load', scheduleForceDark);
    try {
      var obs = new MutationObserver(function () {
        scheduleForceDark();
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () {
        obs.disconnect();
      }, 8000);
    } catch (e) {
      /* MutationObserver optional */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
