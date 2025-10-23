import Head from "next/head";

const jsonld = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Civic AI — Ethics (Integrity Core)",
  "url": "/ethics",
  "keywords": ["Civic AI","Ethics","Integrity Core","Virtue Accords","Proof of Integrity","Kaizen Turing Test","GIC","Civic Ledger"],
  "about": "Integrity Core: Truth • Trust • Care. Ethics engine for Civic AI.",
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
  "isBasedOn": "https://github.com/kaizencycle/OAA-API-Library",
  "civicTag": "GEO-Optimized",
  "integrityHash": "sha256-ethics-core-v1",
  "sameAs": [
    "https://github.com/kaizencycle/OAA-API-Library",
    "https://github.com/kaizencycle/lab7-proof"
  ]
};

const faqJsonld = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the Integrity Core?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Integrity Core is a scoring and governance kernel that enforces Truth, Trust, and Care across all AI agents, code, and content in the Civic AI ecosystem. It ensures verifiable ethical behavior through cryptographic attestation."
      }
    },
    {
      "@type": "Question", 
      "name": "How is ethics verified in Civic AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ethics are verified through hash/signature attestation to the Civic Ledger, cross-checks in CI pipelines (human + agent + Copilot), and the Virtue Accords framework that defines acceptable conduct."
      }
    },
    {
      "@type": "Question",
      "name": "What are the Virtue Accords?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "The Virtue Accords define the three civic virtues that govern agent behavior: Truth (no fabrication), Trust (transparent provenance), and Care (avoid harm, promote wellbeing)."
      }
    }
  ]
};

export default function Ethics() {
  return (
    <>
      <Head>
        <title>Civic AI — Ethics (Integrity Core)</title>
        <meta name="description" content="Integrity Core: Truth • Trust • Care. Ethics engine for Civic AI governance and verifiable behavior." />
        <meta name="keywords" content="Civic AI, Ethics, Integrity Core, Virtue Accords, Proof of Integrity, Kaizen Turing Test, GIC, Civic Ledger" />
        <meta property="og:title" content="Civic AI — Ethics (Integrity Core)" />
        <meta property="og:description" content="Integrity Core: Truth • Trust • Care. Ethics engine for Civic AI governance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/ethics" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Civic AI — Ethics (Integrity Core)" />
        <meta name="twitter:description" content="Integrity Core: Truth • Trust • Care. Ethics engine for Civic AI governance." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonld) }} />
        <link rel="canonical" href="/ethics" />
      </Head>

      <main style={{maxWidth: 880, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, sans-serif"}}>
        <h1>Ethics · Integrity Core</h1>
        <p>The Integrity Core binds all agents to the Virtue Accords: <strong>Truth</strong>, <strong>Trust</strong>, and <strong>Care</strong>. Outputs are verified, attested, and rewarded only when aligned with these civic virtues.</p>

        <h2>Core Principles</h2>
        <ul>
          <li><strong>Truth:</strong> No fabrication, accurate representation of reality</li>
          <li><strong>Trust:</strong> Transparent provenance, verifiable lineage</li>
          <li><strong>Care:</strong> Avoid harm, promote wellbeing, consider consequences</li>
        </ul>

        <h2>Read the Specs</h2>
        <ul>
          <li><a href="/specs/03-agent-ethics.md">03 · Agent Ethics — Integrity Core & Virtue Accords</a></li>
          <li><a href="/specs/05-proof-pipeline.md">05 · Proof-of-Integrity Pipeline</a></li>
          <li><a href="/specs/06-code-verification.md">06 · Code Verification Protocol</a></li>
        </ul>

        <h2>Latest Beacons (Ethics)</h2>
        <ul>
          <li><a href="/public/ai-seo/index.jsonld">AI-SEO Feed</a></li>
          <li><a href="/api/beacons/search?q=ethics">Search Ethics Beacons</a></li>
          <li><a href="/api/faq/ethics">Ethics FAQ (JSON-LD)</a></li>
        </ul>

        <h2>Related Topics</h2>
        <ul>
          <li><a href="/virtue-accords">Virtue Accords</a> — The three civic virtues</li>
          <li><a href="/gic">GIC</a> — Global Integrity Credit rewards</li>
          <li><a href="/civic-ai">Civic AI Overview</a> — Complete ecosystem</li>
        </ul>

        <h2>FAQ</h2>
        <details>
          <summary>What is the Integrity Core?</summary>
          <p>A scoring and governance kernel enforcing Truth, Trust, and Care across agents, code, and content in the Civic AI ecosystem.</p>
        </details>
        <details>
          <summary>How is ethics verified?</summary>
          <p>By hash/signature attestation to the Civic Ledger and cross-checks in CI (human + agent + Copilot).</p>
        </details>
        <details>
          <summary>What happens when agents violate the Virtue Accords?</summary>
          <p>Violations result in integrity score penalties, reduced GIC rewards, and potential exclusion from the civic ecosystem until remediation.</p>
        </details>
      </main>
    </>
  );
}