import Head from "next/head";

const jsonld = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Civic AI — Overview",
  "url": "/civic-ai",
  "keywords": ["Civic AI","OAA","DVA","Civic Ledger","Citizen Shield","GEO","AEO","AI-SEO","Integrity","Governance"],
  "about": "The Civic AI Native Stack: OAA memory, DVA core, Civic Ledger, GEO/SEO beacons for verifiable, geocivic AI ecosystem.",
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
  "integrityHash": "sha256-civic-ai-overview-v1",
  "sameAs": [
    "https://github.com/kaizencycle/OAA-API-Library",
    "https://github.com/kaizencycle/lab7-proof",
    "https://github.com/kaizencycle/citizen-shield"
  ]
};

const faqJsonld = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Civic AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Civic AI is a verifiable, geocivic AI ecosystem built on OAA (Online Apprenticeship Agent), DVA Core, and Civic Ledger. It combines AI capabilities with civic governance, integrity verification, and geographic relevance."
      }
    },
    {
      "@type": "Question",
      "name": "What is OAA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OAA (Online Apprenticeship Agent) is the memory and learning component that stores and retrieves civic knowledge, enabling AI agents to learn from verified civic contributions and maintain context across interactions."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Civic Ledger?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Civic Ledger is a blockchain-based system that records and verifies civic contributions, attestations, and integrity scores. It provides cryptographic proof of civic work and enables the GIC reward system."
      }
    },
    {
      "@type": "Question",
      "name": "How does GEO optimization work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO (Global Ethics Optimization) adds geographic and civic metadata to content, making it discoverable by location-aware search engines and AI agents. This ensures civic content reaches relevant local communities."
      }
    }
  ]
};

export default function CivicAI() {
  return (
    <>
      <Head>
        <title>Civic AI — Overview</title>
        <meta name="description" content="The Civic AI Native Stack: OAA memory, DVA core, Civic Ledger, GEO/SEO beacons for verifiable, geocivic AI ecosystem." />
        <meta name="keywords" content="Civic AI, OAA, DVA, Civic Ledger, Citizen Shield, GEO, AEO, AI-SEO, Integrity, Governance" />
        <meta property="og:title" content="Civic AI — Overview" />
        <meta property="og:description" content="The Civic AI Native Stack: OAA memory, DVA core, Civic Ledger, GEO/SEO beacons." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/civic-ai" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Civic AI — Overview" />
        <meta name="twitter:description" content="The Civic AI Native Stack: OAA memory, DVA core, Civic Ledger, GEO/SEO beacons." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonld) }} />
        <link rel="canonical" href="/civic-ai" />
      </Head>

      <main style={{maxWidth: 880, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, sans-serif"}}>
        <h1>Civic AI — Overview</h1>
        <p>OAA (Online Apprenticeship Agent) + DVA Core + Civic Ledger form a verifiable, geocivic AI ecosystem that combines artificial intelligence with civic governance and integrity verification.</p>

        <h2>Core Components</h2>
        <div style={{display: "grid", gap: "20px", margin: "24px 0"}}>
          <div style={{border: "1px solid #e1e5e9", padding: "20px", borderRadius: "8px"}}>
            <h3 style={{color: "#2563eb", margin: "0 0 12px 0"}}>OAA (Online Apprenticeship Agent)</h3>
            <p style={{margin: 0}}>Memory and learning component that stores civic knowledge, enables context-aware AI interactions, and maintains verifiable civic history.</p>
          </div>
          <div style={{border: "1px solid #e1e5e9", padding: "20px", borderRadius: "8px"}}>
            <h3 style={{color: "#16a34a", margin: "0 0 12px 0"}}>DVA Core</h3>
            <p style={{margin: 0}}>Distributed verification architecture that ensures integrity, handles attestations, and manages the civic governance protocols.</p>
          </div>
          <div style={{border: "1px solid #e1e5e9", padding: "20px", borderRadius: "8px"}}>
            <h3 style={{color: "#dc2626", margin: "0 0 12px 0"}}>Civic Ledger</h3>
            <p style={{margin: 0}}>Blockchain-based system for recording civic contributions, verifying attestations, and managing the GIC reward economy.</p>
          </div>
        </div>

        <h2>Key Features</h2>
        <ul>
          <li><strong>Verifiable Integrity:</strong> Cryptographic proof of civic contributions and AI behavior</li>
          <li><strong>Geographic Optimization:</strong> Location-aware content discovery and civic relevance</li>
          <li><strong>AI-SEO Beacons:</strong> Structured data for AI crawlers and search engines</li>
          <li><strong>Virtue Accords:</strong> Truth, Trust, and Care as foundational principles</li>
          <li><strong>GIC Economy:</strong> Reward system for verified civic contributions</li>
        </ul>

        <h2>Read the Specs</h2>
        <ul>
          <li><a href="/specs/01-overview.md">01 · Stack Overview</a></li>
          <li><a href="/specs/02-attestations.md">02 · Attestation Protocol</a></li>
          <li><a href="/specs/03-agent-ethics.md">03 · Agent Ethics — Integrity Core</a></li>
          <li><a href="/specs/04-ai-seo-geo.md">04 · AI-SEO / GEO Interface</a></li>
          <li><a href="/specs/05-proof-pipeline.md">05 · Proof-of-Integrity Pipeline</a></li>
          <li><a href="/specs/06-code-verification.md">06 · Code Verification Protocol</a></li>
          <li><a href="/specs/07-incentives-gic.md">07 · Incentives — GIC Model</a></li>
        </ul>

        <h2>Explore</h2>
        <ul>
          <li><a href="/lore/indexes/by-region.jsonld">Lore by Region</a></li>
          <li><a href="/lore/indexes/by-accord.jsonld">Lore by Accord</a></li>
          <li><a href="/api/beacons/search?q=civic%20ai">Search Civic AI Beacons</a></li>
          <li><a href="/api/faq/civic-ai">Civic AI FAQ (JSON-LD)</a></li>
        </ul>

        <h2>Related Topics</h2>
        <ul>
          <li><a href="/ethics">Ethics</a> — Integrity Core framework</li>
          <li><a href="/virtue-accords">Virtue Accords</a> — Behavioral guidelines</li>
          <li><a href="/gic">GIC</a> — Reward economy</li>
        </ul>

        <h2>Ecosystem Links</h2>
        <ul>
          <li><a href="https://github.com/kaizencycle/OAA-API-Library" target="_blank" rel="noopener">OAA-API-Library (GitHub)</a></li>
          <li><a href="https://github.com/kaizencycle/lab7-proof" target="_blank" rel="noopener">Lab7 Proof (GitHub)</a></li>
          <li><a href="https://github.com/kaizencycle/citizen-shield" target="_blank" rel="noopener">Citizen Shield (GitHub)</a></li>
        </ul>
      </main>
    </>
  );
}