import type { NextApiRequest, NextApiResponse } from "next";

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the Integrity Core?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Integrity Core is a scoring and governance kernel that enforces Truth, Trust, and Care across all AI agents, code, and content in the Civic AI ecosystem. It ensures verifiable ethical behavior through cryptographic attestation and provides the foundation for the Virtue Accords framework."
      }
    },
    {
      "@type": "Question",
      "name": "How is ethics verified in Civic AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ethics are verified through multiple layers: hash/signature attestation to the Civic Ledger, cross-checks in CI pipelines (human + agent + Copilot), compliance with the Virtue Accords framework, and cryptographic proof of integrity for all contributions and outputs."
      }
    },
    {
      "@type": "Question",
      "name": "What are the Virtue Accords?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Virtue Accords define the three civic virtues that govern agent behavior: Truth (no fabrication, accurate representation), Trust (transparent provenance, verifiable lineage), and Care (avoid harm, promote wellbeing, consider consequences). These form the ethical foundation of the Civic AI ecosystem."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when agents violate the Virtue Accords?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Violations result in integrity score penalties, reduced GIC rewards, and potential exclusion from the civic ecosystem until remediation. The system is designed to encourage self-correction and learning while maintaining high ethical standards."
      }
    },
    {
      "@type": "Question",
      "name": "How does the Integrity Core integrate with AI systems?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Integrity Core provides APIs and protocols that AI systems can integrate to verify their outputs, attest to their behavior, and maintain compliance with civic standards. It works alongside existing AI frameworks to add ethical governance layers."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Kaizen Turing Test?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Kaizen Turing Test is a framework for evaluating AI systems based on their ability to demonstrate continuous improvement, ethical behavior, and civic contribution rather than just mimicking human responses. It focuses on verifiable progress and positive impact."
      }
    }
  ]
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/ld+json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.status(200).json(faqData);
}