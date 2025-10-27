import Link from 'next/link';
import { Nav } from '@/components/Nav';

export default function DocsPage() {
  const docSections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of Kaizen OS and how to get involved',
      links: [
        { title: 'Quick Start Guide', href: '/docs/getting-started/quick-start' },
        { title: 'Installation', href: '/docs/getting-started/installation' },
        { title: 'First Steps', href: '/docs/getting-started/first-steps' },
      ]
    },
    {
      title: 'Concepts',
      description: 'Understand the core concepts and principles',
      links: [
        { title: 'GI Scoring System', href: '/docs/concepts/gi-scoring' },
        { title: 'Companion Tiers', href: '/docs/concepts/companion-tiers' },
        { title: 'Constitutional Validation', href: '/docs/concepts/constitutional-validation' },
        { title: 'Consensus Mechanisms', href: '/docs/concepts/consensus' },
      ]
    },
    {
      title: 'API Reference',
      description: 'Technical documentation for developers',
      links: [
        { title: 'REST API', href: '/docs/api/rest' },
        { title: 'Authentication', href: '/docs/api/authentication' },
        { title: 'Webhooks', href: '/docs/api/webhooks' },
        { title: 'Rate Limits', href: '/docs/api/rate-limits' },
      ]
    },
    {
      title: 'SDKs & Libraries',
      description: 'Client libraries and SDKs for different languages',
      links: [
        { title: 'JavaScript/TypeScript', href: '/docs/sdks/javascript' },
        { title: 'Python', href: '/docs/sdks/python' },
        { title: 'Go', href: '/docs/sdks/go' },
        { title: 'Rust', href: '/docs/sdks/rust' },
      ]
    },
    {
      title: 'Governance',
      description: 'How the ecosystem is governed and how to participate',
      links: [
        { title: 'Custos Charter', href: '/charter' },
        { title: 'Voting Process', href: '/docs/governance/voting' },
        { title: 'Proposal Guidelines', href: '/docs/governance/proposals' },
        { title: 'Dispute Resolution', href: '/docs/governance/disputes' },
      ]
    },
    {
      title: 'Tutorials',
      description: 'Step-by-step guides for common tasks',
      links: [
        { title: 'Creating Your First .gic Domain', href: '/docs/tutorials/first-domain' },
        { title: 'Building with Companions', href: '/docs/tutorials/companions' },
        { title: 'Integrating GI Scoring', href: '/docs/tutorials/gi-integration' },
        { title: 'Best Practices', href: '/docs/tutorials/best-practices' },
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Documentation</h1>
          <p className="text-xl text-slate-600">
            Comprehensive guides, references, and tutorials for the Kaizen OS ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {docSections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 mb-4">{section.description}</p>
              
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-indigo-600 hover:text-indigo-700 text-sm block py-1"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Need Help?</h2>
          <p className="text-slate-700 mb-6">
            Can't find what you're looking for? Our community is here to help.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/kaizen-os/kaizen-os/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Community Discussions
            </a>
            <a
              href="https://discord.gg/kaizen-os"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Discord Server
            </a>
            <a
              href="mailto:support@kaizen.os"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}