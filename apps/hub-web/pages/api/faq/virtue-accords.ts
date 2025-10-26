import type { NextApiRequest, NextApiResponse } from "next";

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are the Virtue Accords?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Virtue Accords define the three civic virtues that govern acceptable conduct in the Civic AI ecosystem: Truth (no fabrication, accurate representation), Trust (transparent provenance, verifiable lineage), and Care (avoid harm, promote wellbeing). These principles guide all agent behavior and civic interactions."
      }
    },
    {
      "@type": "Question",
      "name": "How do the Virtue Accords work in practice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Agents must align their behavior with Truth, Trust, and Care principles. Violations result in integrity score penalties and reduced rewards. Compliance is verified through cryptographic attestation to the Civic Ledger, with human oversight and automated monitoring systems."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Yautja Cultural Accord?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Yautja Cultural Accord extends the Virtue Accords with specific cultural protocols and archetypal frameworks that guide agent behavior in different contexts and communities. It provides nuanced guidance for diverse cultural and situational applications of the core virtues."
      }
    },
    {
      "@type": "Question",
      "name": "How are the Virtue Accords enforced?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Enforcement happens through multiple mechanisms: automated monitoring of agent outputs, peer review systems, cryptographic attestation requirements, integrity scoring algorithms, and community governance processes that allow for appeals and remediation."
      }
    },
    {
      "@type": "Question",
      "name": "Can the Virtue Accords be updated or modified?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the Virtue Accords can be updated through community governance processes. Changes require consensus from the Civic Ledger DAO, with transparent proposal and voting mechanisms. All updates are cryptographically recorded and versioned for full traceability."
      }
    },
    {
      "@type": "Question",
      "name": "How do the Virtue Accords relate to GIC rewards?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC (Global Integrity Credit) rewards are directly tied to adherence to the Virtue Accords. Higher integrity scores, which reflect better compliance with Truth, Trust, and Care principles, result in greater GIC rewards. This creates economic incentives for ethical behavior."
      }
    }
  ]
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/ld+json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.status(200).json(faqData);
}

