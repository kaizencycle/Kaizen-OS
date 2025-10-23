import type { NextApiRequest, NextApiResponse } from "next";

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is GIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC (Global Integrity Credit) is the reward token for verified civic contributions in the Civic AI ecosystem. It's calculated as Integrity × CivicImpact × GeoWeight, ensuring fair compensation for valuable work that aligns with civic principles and geographic relevance."
      }
    },
    {
      "@type": "Question",
      "name": "How do I earn GIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Earn GIC by posting high-integrity attestations (≥0.95), shipping verified code merges, completing ethics reviews, publishing civic lessons, contributing to the Civic Ledger with verifiable impact, or participating in community governance processes."
      }
    },
    {
      "@type": "Question",
      "name": "What is the GIC calculation formula?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC = Integrity Score × Civic Impact Score × Geographic Weight. Higher integrity (adherence to Virtue Accords), greater civic impact (measurable benefit to community), and strategic geographic location all increase GIC rewards proportionally."
      }
    },
    {
      "@type": "Question",
      "name": "How is GIC different from traditional tokens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC is earned through verifiable civic contributions rather than speculation or mining. It's tied to real-world impact, ethics compliance, and geographic relevance, creating a more sustainable and meaningful economy that rewards actual value creation."
      }
    },
    {
      "@type": "Question",
      "name": "Can I trade or transfer GIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC is designed as a utility token for civic participation. Trading and transfer mechanisms depend on the specific implementation and governance decisions of the Civic Ledger DAO. The primary purpose is to incentivize and reward civic contributions."
      }
    },
    {
      "@type": "Question",
      "name": "How is GIC distributed and managed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC distribution is managed by the Civic Ledger through smart contracts and governance mechanisms. The system automatically calculates and distributes rewards based on verified contributions, with community oversight and appeal processes for disputed allocations."
      }
    },
    {
      "@type": "Question",
      "name": "What can I do with GIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GIC can be used for governance participation, accessing premium civic services, funding civic projects, participating in community decisions, and potentially trading for other assets depending on the specific implementation and governance rules."
      }
    }
  ]
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/ld+json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.status(200).json(faqData);
}