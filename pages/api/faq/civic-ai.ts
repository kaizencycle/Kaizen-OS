import type { NextApiRequest, NextApiResponse } from "next";

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Civic AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Civic AI is a verifiable, geocivic AI ecosystem built on OAA (Online Apprenticeship Agent), DVA Core, and Civic Ledger. It combines AI capabilities with civic governance, integrity verification, and geographic relevance to create a more ethical and community-focused AI system."
      }
    },
    {
      "@type": "Question",
      "name": "What is OAA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OAA (Online Apprenticeship Agent) is the memory and learning component that stores and retrieves civic knowledge, enabling AI agents to learn from verified civic contributions and maintain context across interactions while adhering to ethical principles."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Civic Ledger?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Civic Ledger is a blockchain-based system that records and verifies civic contributions, attestations, and integrity scores. It provides cryptographic proof of civic work, enables the GIC reward system, and ensures transparency and accountability in the ecosystem."
      }
    },
    {
      "@type": "Question",
      "name": "How does GEO optimization work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO (Global Ethics Optimization) adds geographic and civic metadata to content, making it discoverable by location-aware search engines and AI agents. This ensures civic content reaches relevant local communities and maintains geographic relevance in the global civic network."
      }
    },
    {
      "@type": "Question",
      "name": "What is AEO and AI-SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AEO (AI Engine Optimization) and AI-SEO optimize content for AI crawlers and search engines using structured data (JSON-LD), semantic markup, and civic metadata. This makes the Civic AI ecosystem discoverable and understandable by both human and AI systems."
      }
    },
    {
      "@type": "Question",
      "name": "How does Civic AI ensure ethical behavior?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Civic AI ensures ethical behavior through the Virtue Accords (Truth, Trust, Care), cryptographic attestation, integrity scoring, community governance, and automated monitoring systems that verify compliance and provide transparency in all AI interactions."
      }
    },
    {
      "@type": "Question",
      "name": "What is the relationship between Civic AI and traditional AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Civic AI extends traditional AI with civic governance, ethical frameworks, and community accountability. It's designed to work alongside existing AI systems while adding layers of verification, geographic relevance, and civic contribution tracking to create more responsible and community-focused AI."
      }
    },
    {
      "@type": "Question",
      "name": "How can I participate in the Civic AI ecosystem?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can participate by contributing verified content, participating in governance, developing civic applications, maintaining high integrity scores, earning GIC through civic contributions, and helping to build the community infrastructure that supports ethical AI development."
      }
    }
  ]
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/ld+json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.status(200).json(faqData);
}