/**
 * Mobius Handbook — public UX: skip link, Terminal live bar, announce dismiss
 * Runs with mobius-proof.js (proof tiles load separately).
 */
(function () {
  'use strict';

  var TERMINAL_META = 'meta[name="mobius-terminal-base"]';
  var BAR_ID = 'mobius-handbook-live-bar';
  var ANNOUNCE_KEY = 'mobius-handbook-announce-dismissed';

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

  function init() {
    skipLink();
    announceDismiss();
    initLiveBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
