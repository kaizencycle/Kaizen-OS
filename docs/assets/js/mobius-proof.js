/**
 * Mobius Handbook — Level 1 live proof + Level 2 proof-chain + Level 3 graph stub
 * Vanilla JS, no dependencies. Safe if Terminal is unreachable.
 */
(function () {
  'use strict';

  var DEFAULT_TERMINAL = 'https://mobius-civic-ai-terminal.vercel.app';
  var CACHE_PREFIX = 'mobius-proof:';
  var CACHE_TTL_MS = 45 * 1000;
  var FETCH_TIMEOUT_MS = 8000;

  function getDocsRoot() {
    var el = document.currentScript;
    if (!el) {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.indexOf('mobius-proof.js') !== -1) {
          el = scripts[i];
          break;
        }
      }
    }
    if (el && el.src) {
      return el.src.replace(/\/assets\/js\/mobius-proof\.js(\?.*)?$/, '');
    }
    return '';
  }

  function getTerminalBase() {
    var meta = document.querySelector('meta[name="mobius-terminal-base"]');
    if (meta && meta.getAttribute('content')) return meta.getAttribute('content').replace(/\/$/, '');
    return DEFAULT_TERMINAL;
  }

  function endpointUrl(kind, terminalBase) {
    var t = terminalBase.replace(/\/$/, '');
    switch (kind) {
      case 'snapshot-lite':
        return t + '/api/terminal/snapshot-lite';
      case 'vault-status':
        return t + '/api/vault/status';
      case 'vault-seal':
        return t + '/api/vault/seal';
      case 'agents-status':
        return t + '/api/agents/status';
      default:
        return t + '/api/terminal/snapshot-lite';
    }
  }

  function getPath(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      var p = parts[i];
      var m = /^(\d+)$/.exec(p);
      if (m && Array.isArray(cur)) cur = cur[parseInt(m[1], 10)];
      else if (Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else return undefined;
    }
    return cur;
  }

  /** Map handbook paths to live snapshot-lite / vault shapes (Terminal C-284). */
  function resolveValue(data, path, endpoint) {
    if (!path) return undefined;
    var direct = getPath(data, path);
    if (direct !== undefined) return direct;

    if (endpoint === 'snapshot-lite' || endpoint === 'terminal' || endpoint === 'snapshot') {
      if (path === 'integrity.gi' || path === 'lanes.integrity.gi') {
        if (data.gi != null) return data.gi;
        return getPath(data, 'lanes.integrity.gi');
      }
      if (path === 'integrity.mode' || path === 'lanes.integrity.mode') {
        if (data.mode != null) return data.mode;
        return getPath(data, 'lanes.integrity.mode');
      }
      if (path === 'lanes.signals.composite') return getPath(data, 'lanes.signals.composite');
      if (path === 'lanes.pulse.composite') return getPath(data, 'lanes.pulse.composite');
    }

    return undefined;
  }

  function formatValue(v) {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  function cacheGet(url) {
    try {
      var raw = sessionStorage.getItem(CACHE_PREFIX + url);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (Date.now() - o.t > CACHE_TTL_MS) return null;
      return o.data;
    } catch (e) {
      return null;
    }
  }

  function cacheSet(url, data) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + url, JSON.stringify({ t: Date.now(), data: data }));
    } catch (e) { /* ignore */ }
  }

  function fetchJson(url, options) {
    var opts = options || {};
    var bypassCache = !!opts.bypassCache;

    if (!bypassCache) {
      var cached = cacheGet(url);
      if (cached !== null) return Promise.resolve(cached);
    }

    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, FETCH_TIMEOUT_MS);

    return fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: bypassCache ? 'no-store' : 'default',
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!bypassCache) cacheSet(url, data);
        return data;
      })
      .catch(function (err) {
        clearTimeout(timer);
        throw err;
      });
  }

  function renderCard(host, opts) {
    if (!host.id) {
      host.id = 'mobius-proof-' + Math.random().toString(36).slice(2, 11);
    }
    var rawId = host.id + '-raw';

    var label = opts.label || opts.path || 'Live';
    var value = opts.value;
    var url = opts.url;
    var err = opts.error;
    var loading = !!opts.loading;
    var fetchedAt = new Date().toISOString();

    var badgeClass = 'mobius-proof-card__badge';
    var badgeText = 'LIVE';
    if (loading) {
      badgeClass += ' mobius-proof-card__badge--muted';
      badgeText = 'LOAD';
    } else if (err) {
      badgeClass += ' mobius-proof-card__badge--error';
      badgeText = 'UNAVAILABLE';
    }

    var cardClass = 'mobius-proof-card' + (loading ? ' mobius-proof-card--loading' : '');
    var valueHtml = loading
      ? '\u00a0'
      : err
        ? escapeHtml(err)
        : escapeHtml(formatValue(value));

    var copyText = '';
    if (!loading && !err && value !== undefined && value !== null) {
      copyText = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }

    host.innerHTML =
      '<div class="' +
      cardClass +
      '" role="region" aria-busy="' +
      (loading ? 'true' : 'false') +
      '" aria-label="Live proof: ' +
      escapeAttr(label) +
      '">' +
      '<div class="mobius-proof-card__header">' +
      '<span>' +
      escapeHtml(label) +
      '</span>' +
      '<span class="' +
      badgeClass +
      '">' +
      badgeText +
      '</span>' +
      '</div>' +
      '<div class="mobius-proof-card__value">' +
      valueHtml +
      '</div>' +
      (!loading && copyText && copyText.length < 8000
        ? '<button type="button" class="mobius-proof-copy" aria-label="Copy value to clipboard">Copy value</button>'
        : '') +
      '<div class="mobius-proof-card__meta">' +
      'Source: <a href="' +
      escapeAttr(url) +
      '" target="_blank" rel="noopener">' +
      escapeHtml(url) +
      '</a>' +
      ' · fetched ' +
      escapeHtml(fetchedAt.slice(11, 19)) +
      'Z' +
      '</div>' +
      (opts.rawJson && !err && !loading
        ? '<div class="mobius-proof-expand" tabindex="0" role="button" aria-expanded="false" aria-controls="' +
          escapeAttr(rawId) +
          '">View raw JSON</div>' +
          '<pre id="' +
          escapeAttr(rawId) +
          '" class="mobius-proof-raw" aria-hidden="true">' +
          escapeHtml(opts.rawJson) +
          '</pre>'
        : '') +
      '</div>';

    var card = host.querySelector('.mobius-proof-card');
    if (card && opts.rawJson && !err && !loading) {
      var exp = card.querySelector('.mobius-proof-expand');
      var raw = card.querySelector('.mobius-proof-raw');
      if (exp && raw) {
        exp.setAttribute('aria-controls', rawId);
        function toggle() {
          var open = raw.classList.toggle('is-open');
          raw.setAttribute('aria-hidden', open ? 'false' : 'true');
          exp.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        exp.addEventListener('click', toggle);
        exp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      }
    }

    var copyBtn = host.querySelector('.mobius-proof-copy');
    if (copyBtn && copyText && navigator.clipboard && navigator.clipboard.writeText) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(copyText).then(
          function () {
            copyBtn.textContent = 'Copied';
            copyBtn.classList.add('mobius-proof-copy--done');
            setTimeout(function () {
              copyBtn.textContent = 'Copy value';
              copyBtn.classList.remove('mobius-proof-copy--done');
            }, 2000);
          },
          function () {
            copyBtn.textContent = 'Copy failed';
          }
        );
      });
    }
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

  function upgradeProofEl(el) {
    var endpoint = (el.getAttribute('endpoint') || 'snapshot-lite').toLowerCase().replace(/_/g, '-');
    if (endpoint === 'terminal' || endpoint === 'snapshot') endpoint = 'snapshot-lite';

    var path = el.getAttribute('path') || el.getAttribute('field') || '';
    var label = el.getAttribute('label') || path || 'Live state';
    var terminal = (el.getAttribute('terminal') || getTerminalBase()).replace(/\/$/, '');
    var url = endpointUrl(endpoint, terminal);

    renderCard(el, { label: label, value: null, url: url, error: null, loading: true });
    fetchJson(url)
      .then(function (data) {
        var v = path ? resolveValue(data, path, endpoint) : data;
        renderCard(el, {
          label: label,
          value: v,
          url: url,
          error: null,
          rawJson: JSON.stringify(data, null, 2)
        });
      })
      .catch(function (e) {
        renderCard(el, {
          label: label,
          value: null,
          url: url,
          error: 'Live state unavailable (' + (e.message || 'network') + '). See protocol doc for canonical definition.'
        });
      });
  }

  function loadManifest(docsRoot) {
    var url = (docsRoot || '') + '/assets/data/handbook-claim-index.json';
    return fetchJson(url, { bypassCache: true }).catch(function () {
      return null;
    });
  }

  function renderChainPanel(panel, claim, terminalBase) {
    var protocolUrl = claim.protocol_doc_url || '';
    var apiUrl = (claim.live_endpoint && claim.live_endpoint.path)
      ? endpointUrl(claim.live_endpoint.kind || 'snapshot-lite', terminalBase)
      : endpointUrl('snapshot-lite', terminalBase);
    var sealPath = claim.archive_artifact_pattern || '';
    var repo = 'https://github.com/kaizencycle/Mobius-Substrate';

    panel.innerHTML =
      '<dl>' +
      '<dt>Canonical protocol</dt><dd>' +
      (protocolUrl
        ? '<a href="' + escapeAttr(protocolUrl) + '">' + escapeHtml(protocolUrl) + '</a>'
        : '—') +
      '</dd>' +
      '<dt>EPICON</dt><dd>' + escapeHtml((claim.epicon_ids || []).join(', ') || '—') + '</dd>' +
      '<dt>Live API (hot truth)</dt><dd><a href="' + escapeAttr(apiUrl) + '" target="_blank" rel="noopener">' + escapeHtml(apiUrl) + '</a></dd>' +
      '<dt>Cold archive (git)</dt><dd>' +
      (sealPath ? '<code>' + escapeHtml(sealPath) + '</code> in <a href="' + escapeAttr(repo) + '">Mobius-Substrate</a>' : '—') +
      '</dd>' +
      '<dt>Doc you are reading</dt><dd><a href="' + escapeAttr(window.location.href) + '">This page</a> (see site footer / Git for commit)</dd>' +
      '</dl>' +
      '<p class="mobius-proof-graph"><strong>Protocol mesh</strong> (read-only): live snapshot and docs cross-link the same claims. Full graph UI lives in the <code>apps/handbook</code> app (Level 3).</p>';
  }

  function initProofChains(docsRoot, terminalBase) {
    loadManifest(docsRoot).then(function (manifest) {
      if (!manifest || !manifest.claims) return;
      var byId = {};
      manifest.claims.forEach(function (c) {
        byId[c.id] = c;
      });

      document.querySelectorAll('.mobius-proof-chain').forEach(function (wrap) {
        var id = wrap.getAttribute('data-claim-id');
        if (!id || !byId[id]) return;
        var claim = byId[id];
        var toggle = wrap.querySelector('.mobius-proof-chain__toggle');
        var panel = wrap.querySelector('.mobius-proof-chain__panel');
        if (!toggle || !panel) return;

        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', function () {
          var open = panel.classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
          if (open && !panel.getAttribute('data-rendered')) {
            renderChainPanel(panel, claim, terminalBase);
            panel.setAttribute('data-rendered', '1');
          }
        });
      });
    });
  }

  function initGraphStub(docsRoot) {
    var host = document.querySelector('.mobius-proof-mesh-graph');
    if (!host) return;
    loadManifest(docsRoot).then(function (manifest) {
      if (!manifest || !manifest.edges || !manifest.nodes) {
        host.innerHTML = '<p>Mesh index not loaded.</p>';
        return;
      }
      var w = 640;
      var h = 200;
      var nodes = manifest.nodes;
      var n = nodes.length;
      var cx = w / 2;
      var r = Math.min(w, h) * 0.35;
      var svg =
        '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" aria-label="Protocol mesh preview">' +
        '<defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity="0.5"/></marker></defs>';
      for (var i = 0; i < n; i++) {
        var angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        var x = cx + r * Math.cos(angle);
        var y = h / 2 + r * Math.sin(angle);
        var node = nodes[i];
        svg +=
          '<circle cx="' + x + '" cy="' + y + '" r="10" fill="teal" opacity="0.85">' +
          '<title>' + escapeHtml(node.label || node.id) + '</title></circle>' +
          '<text x="' + x + '" y="' + (y + 24) + '" text-anchor="middle" font-size="11">' +
          escapeHtml((node.label || node.id).slice(0, 14)) +
          '</text>';
      }
      svg += '</svg>';
      host.innerHTML = svg + '<p style="margin:0.5rem 0 0;font-size:0.75rem">Nodes: ' + n + '. Edges: ' + manifest.edges.length + '. Interactive graph: run <code>apps/handbook</code>.</p>';
    });
  }

  function init() {
    var docsRoot = getDocsRoot();
    var terminalBase = getTerminalBase();

    document.querySelectorAll('mobius-proof').forEach(upgradeProofEl);
    initProofChains(docsRoot, terminalBase);
    initGraphStub(docsRoot);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
