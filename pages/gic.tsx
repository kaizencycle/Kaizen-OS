import Head from "next/head";

const pageJsonld = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "GIC — Global Integrity Credit",
  "url": "/gic",
  "keywords": ["GIC","Global Integrity Credit","Civic AI economy","Integrity rewards","Civic Ledger","Attestation","GEO","AEO"],
  "about": "The contribution-based economy of Civic AI, rewarding verifiable civic work and human-machine collaboration.",
  "publisher": { 
    "@type": "Organization", 
    "name": "Civic Ledger DAO",
    "url": "https://github.com/kaizencycle/OAA-API-Library"
  },
  "author": {
    "@type": "Organization",
    "name": "Kaizen",
    "url": "https://github.com/kaizencycle"
  },
  "civicTag": "GEO-Optimized",
  "integrityHash": "sha256-gic-model-v1",
  "sameAs": [
    "https://github.com/kaizencycle/OAA-API-Library"
  ]
};

const faqJsonld = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is GIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC (Global Integrity Credit) is the reward token for verified civic contributions in the Civic AI ecosystem. It's calculated as Integrity × CivicImpact × GeoWeight, ensuring fair compensation for valuable work."
      }
    },
    {
      "@type": "Question",
      "name": "How do I earn GIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Earn GIC by posting high-integrity attestations (≥0.95), shipping verified code merges, completing ethics reviews, publishing civic lessons, or contributing to the Civic Ledger with verifiable impact."
      }
    },
    {
      "@type": "Question",
      "name": "What is the GIC calculation formula?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC = Integrity Score × Civic Impact Score × Geographic Weight. Higher integrity, greater civic impact, and strategic geographic location all increase GIC rewards."
      }
    },
    {
      "@type": "Question",
      "name": "How is GIC different from traditional tokens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC is earned through verifiable civic contributions rather than speculation. It's tied to real-world impact, ethics compliance, and geographic relevance, creating a more sustainable and meaningful economy."
      }
    }
  ]
};

export default function GIC() {
  return (
    <>
      <Head>
        <title>GIC — Global Integrity Credit</title>
        <meta name="description" content="The contribution-based economy of Civic AI, rewarding verifiable civic work and human-machine collaboration." />
        <meta name="keywords" content="GIC, Global Integrity Credit, Civic AI economy, Integrity rewards, Civic Ledger, Attestation, GEO, AEO" />
        <meta property="og:title" content="GIC — Global Integrity Credit" />
        <meta property="og:description" content="The contribution-based economy of Civic AI, rewarding verifiable civic work." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/gic" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GIC — Global Integrity Credit" />
        <meta name="twitter:description" content="The contribution-based economy of Civic AI, rewarding verifiable civic work." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonld) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonld) }} />
        <link rel="canonical" href="/gic" />
      </Head>

      <main style={{maxWidth: 880, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, sans-serif"}}>
        <h1>GIC — Global Integrity Credit</h1>
        <p>GIC mints for <em>verifiable</em> civic work, aligning human-machine collaboration with integrity and creating a sustainable contribution-based economy.</p>

        <h2>How GIC Works</h2>
        <div style={{background: "#f8fafc", padding: "24px", borderRadius: "8px", margin: "24px 0"}}>
          <h3 style={{margin: "0 0 16px 0", color: "#1e40af"}}>GIC = Integrity × CivicImpact × GeoWeight</h3>
          <ul style={{margin: 0}}>
            <li><strong>Integrity:</strong> Verifiable truth, trust, and care in contributions</li>
            <li><strong>Civic Impact:</strong> Measurable benefit to the civic ecosystem</li>
            <li><strong>Geo Weight:</strong> Geographic relevance and local impact</li>
          </ul>
        </div>

        <h2>Earning GIC</h2>
        <ul>
          <li>Post attestations with integrity ≥ 0.95</li>
          <li>Ship verified code merges with civic impact</li>
          <li>Complete ethics reviews and audits</li>
          <li>Publish civic lessons and documentation</li>
          <li>Contribute to the Civic Ledger with verifiable impact</li>
        </ul>

        <h2>Specification</h2>
        <ul>
          <li><a href="/specs/07-incentives-gic.md">07 · Incentives — GIC Model</a></li>
          <li><a href="/specs/02-attestations.md">02 · Attestation Protocol</a></li>
          <li><a href="/specs/05-proof-pipeline.md">05 · Proof-of-Integrity Pipeline</a></li>
        </ul>

        <h2>Data & Feeds</h2>
        <ul>
          <li><a href="/api/geo/region?code=US-NE">GEO attestations (US-NE)</a></li>
          <li><a href="/api/geo/near?lat=40.7128&lon=-74.0060">Nearby attestations</a></li>
          <li><a href="/public/ai-seo/index.jsonld">AI-SEO index</a></li>
          <li><a href="/api/beacons/search?q=gic">Search GIC Beacons</a></li>
        </ul>

        <h2>Related Topics</h2>
        <ul>
          <li><a href="/ethics">Ethics</a> — Integrity Core framework</li>
          <li><a href="/virtue-accords">Virtue Accords</a> — Behavioral guidelines</li>
          <li><a href="/civic-ai">Civic AI Overview</a> — Complete ecosystem</li>
        </ul>

        <h2>FAQ</h2>
        <details>
          <summary>What is GIC?</summary>
          <p>Global Integrity Credit rewards verified civic contributions based on Integrity × CivicImpact × GeoWeight.</p>
        </details>
        <details>
          <summary>How do I earn GIC?</summary>
          <p>Post high-integrity attestations, ship verified merges, complete ethics reviews, publish civic lessons.</p>
        </details>
        <details>
          <summary>Can I trade GIC?</summary>
          <p>GIC is designed as a utility token for civic participation. Trading mechanisms depend on the specific implementation and governance decisions.</p>
        </details>
      </main>
    </>
  );
}