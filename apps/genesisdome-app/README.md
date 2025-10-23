
# GenesisDome.org — Site Starter

Static, PWA-ready starter for GenesisDome.org. Includes:
- Landing page with Cycle 0 Sigil
- Pages: HIVE, KTT, Ledger, Contributors, Join
- Embedded PDFs (Declaration, Charter, Microbiome brief, Testament)
- PWA manifest + service worker (offline-first)
- Netlify security headers, sitemap & robots.txt

## Deploy Options

### Cloudflare Pages
1) Push these files to a Git repo.
2) Create a Pages project → Framework: None → Build: _None_ (static).
3) Set custom domain: `genesisdome.org` (add CNAME/AAAA to Cloudflare).

### Vercel
1) Import repo → Framework: Other → Output Directory: `/`.
2) Add domain `genesisdome.org` → follow DNS steps.

### Netlify
1) Drag-and-drop folder or connect repo.
2) Add domain `genesisdome.org`.
3) `_headers` already sets strong security defaults.

### GitHub Pages
1) Put files in `docs/` or root → enable Pages.
2) Create `CNAME` file containing `genesisdome.org`.

## Local
- Serve statically (any server). Service worker caches core assets.

## Next Steps
- Hook Ledger explorer (when live).
- Add blog/changelog for Festivals.
- Add newsletter capture.
- Swap placeholders with live links as they canonize.
