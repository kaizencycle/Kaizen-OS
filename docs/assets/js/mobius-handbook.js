/**
 * Mobius Handbook — public UX: skip link, Terminal live bar in header
 * Runs with mobius-proof.js (proof tiles load separately).
 */
(function () {
  'use strict';

  var TERMINAL_META = 'meta[name="mobius-terminal-base"]';
  var BAR_ID = 'mobius-handbook-live-bar';

  function terminalBase() {
    var m = document.querySelector(TERMINAL_META);
    return (m && m.getAttribute('content')) || 'https://mobius-civic-ai-terminal.vercel.app';
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

  function formatMode(mode, degraded) {
    if (!mode) return '—';
    var s = String(mode);
    if (degraded) s += ' (degraded)';
    return s;
  }

  function renderBar(el, text, isError) {
    el.id = BAR_ID;
    el.className = 'mobius-live-bar' + (isError ? ' mobius-live-bar--error' : '');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = text;
  }

  function initLiveBar() {
    var headerInner = document.querySelector('.md-header__inner');
    if (!headerInner || document.getElementBy(BAR_ID)) return;

    var bar = document.createElement('div');
    renderBar(
      bar,
      '<span class="mobius-live-bar__label">Live</span><span>Loading Terminal snapshot…</span>',
      false
    );
    headerInner.appendChild(bar);

    var base = terminalBase().replace(/\/$/, '');
    var url = base + '/api/terminal/snapshot-lite';

    fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
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
          '<span>' +
          escapeHtml(formatMode(mode, deg)) +
          '</span>';

        if (ts) {
          html +=
            '<span class="mobius-live-bar__sep">·</span><span class="mobius-live-bar__muted">snapshot ' +
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
          escapeAttr(url) +
          '" target="_blank" rel="noopener">View JSON</a>';

        renderBar(bar, html, false);
      })
      .catch(function () {
        renderBar(
          bar,
          '<span class="mobius-live-bar__label">Live</span>' +
            '<span>Snapshot unavailable (CORS or network). </span>' +
            '<a class="mobius-live-bar__link" href="' +
            escapeAttr(base + '/') +
            '" target="_blank" rel="noopener">Open Terminal</a>' +
            ' · <a class="mobius-live-bar__link" href="' +
            escapeAttr('https://github.com/kaizencycle/mobius-civic-ai-terminal') +
            '" target="_blank" rel="noopener">Terminal repo</a>',
          true
        );
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

  function init() {
    skipLink();
    initLiveBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
