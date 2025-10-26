# AI SEO Engine (OAA)

Crawls OAA signals (pulses, ledger seals, memory digests), ranks them with
GIC × Virtue Accord weights, and publishes JSON-LD for machine-native discovery.

Pipeline:
1) crawler → writes `ai-seo-engine/out/crawl.json`
2) ranker  → writes `ai-seo-engine/out/ranked.json`
3) publisher → writes `public/ai-seo/index.jsonld`

Run locally:
```bash
NODE_OPTIONS=--experimental-strip-types \
node ai-seo-engine/src/crawler.mjs && \
node ai-seo-engine/src/ranker.mjs  && \
node ai-seo-engine/src/publisher.mjs

