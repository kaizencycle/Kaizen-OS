import Head from "next/head";

const jsonld = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Virtue Accords — Truth, Trust, Care",
  "url": "/virtue-accords",
  "keywords": ["Virtue Accords","Truth","Trust","Care","Civic AI","Ethics","Integrity","Governance"],
  "about": "The three civic virtues that govern agent behavior and rewards in the Civic AI ecosystem.",
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
  "integrityHash": "sha256-virtue-accords-v1",
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
      "name": "What are the Virtue Accords?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Virtue Accords define the three civic virtues that govern acceptable conduct in the Civic AI ecosystem: Truth (no fabrication), Trust (transparent provenance), and Care (avoid harm, promote wellbeing)."
      }
    },
    {
      "@type": "Question",
      "name": "How do the Virtue Accords work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Agents must align their behavior with Truth, Trust, and Care. Violations result in integrity score penalties and reduced rewards. Compliance is verified through cryptographic attestation to the Civic Ledger."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Yautja Cultural Accord?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Yautja Cultural Accord extends the Virtue Accords with specific cultural protocols and archetypal frameworks that guide agent behavior in different contexts and communities."
      }
    }
  ]
};

export default function VirtueAccords() {
  return (
    <>
      <Head>
        <title>Virtue Accords — Truth · Trust · Care</title>
        <meta name="description" content="The three civic virtues that govern agent behavior and rewards in the Civic AI ecosystem." />
        <meta name="keywords" content="Virtue Accords, Truth, Trust, Care, Civic AI, Ethics, Integrity, Governance" />
        <meta property="og:title" content="Virtue Accords — Truth · Trust · Care" />
        <meta property="og:description" content="The three civic virtues that govern agent behavior and rewards." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/virtue-accords" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Virtue Accords — Truth · Trust · Care" />
        <meta name="twitter:description" content="The three civic virtues that govern agent behavior and rewards." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonld) }} />
        <link rel="canonical" href="/virtue-accords" />
      </Head>

      <main style={{maxWidth: 880, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, sans-serif"}}>
        <h1>Virtue Accords</h1>
        <p>The Accords define acceptable conduct in the Civic AI ecosystem: <strong>Truth</strong> (no fabrication), <strong>Trust</strong> (transparent provenance), <strong>Care</strong> (avoid harm, promote wellbeing).</p>

        <h2>The Three Virtues</h2>
        <div style={{display: "grid", gap: "24px", margin: "24px 0"}}>
          <div style={{border: "1px solid #e1e5e9", padding: "20px", borderRadius: "8px"}}>
            <h3 style={{color: "#2563eb", margin: "0 0 12px 0"}}>Truth</h3>
            <p style={{margin: 0}}>No fabrication, accurate representation of reality, honest communication, and verifiable claims.</p>
          </div>
          <div style={{border: "1px solid #e1e5e9", padding: "20px", borderRadius: "8px"}}>
            <h3 style={{color: "#16a34a", margin: "0 0 12px 0"}}>Trust</h3>
            <p style={{margin: 0}}>Transparent provenance, verifiable lineage, consistent behavior, and reliable outputs.</p>
          </div>
          <div style={{border: "1px solid #e1e5e9", padding: "20px", borderRadius: "8px"}}>
            <h3 style={{color: "#dc2626", margin: "0 0 12px 0"}}>Care</h3>
            <p style={{margin: 0}}>Avoid harm, promote wellbeing, consider consequences, and act with compassion.</p>
          </div>
        </div>

        <h2>Spec & Culture</h2>
        <ul>
          <li><a href="/specs/03-agent-ethics.md">03 · Integrity Core & Virtue Accords</a></li>
          <li><a href="/specs/09-cultural-kernel-archetypes.md">09 · Cultural Kernel — Archetype Engine</a></li>
          <li><a href="/specs/10-yautja-cultural-accord.md">10 · Yautja Cultural Accord</a></li>
        </ul>

        <h2>Discover</h2>
        <ul>
          <li><a href="/api/beacons/search?q=virtue%20accords">Search Virtue Accords Beacons</a></li>
          <li><a href="/lore/indexes/by-accord.jsonld">Lore by Accord</a></li>
          <li><a href="/api/faq/virtue-accords">Virtue Accords FAQ (JSON-LD)</a></li>
        </ul>

        <h2>Related Topics</h2>
        <ul>
          <li><a href="/ethics">Ethics</a> — Integrity Core framework</li>
          <li><a href="/gic">GIC</a> — Rewards for virtuous behavior</li>
          <li><a href="/civic-ai">Civic AI Overview</a> — Complete ecosystem</li>
        </ul>
      </main>
    </>
  );
}