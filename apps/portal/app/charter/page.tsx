import { Nav } from '@/components/Nav';

export default function CharterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Custos Charter</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-8">
              The Custos Charter establishes the foundational principles and governance framework for the Kaizen OS ecosystem.
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Preamble</h2>
              <p className="text-slate-700 mb-4">
                We, the participants in the Kaizen OS ecosystem, recognizing the transformative potential of artificial intelligence 
                and the critical need for responsible development and deployment, hereby establish this Charter to guide our 
                collective journey toward a more integrated, ethical, and beneficial relationship between AI and humanity.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Article I: Core Principles</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">1.1 Integrity</h3>
              <p className="text-slate-700 mb-4">
                All participants shall act with honesty, transparency, and ethical responsibility in all interactions within the ecosystem. 
                This includes accurate representation of capabilities, transparent decision-making processes, and accountability for actions taken.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">1.2 Consistency</h3>
              <p className="text-slate-700 mb-4">
                Participants shall maintain consistent behavior and decision-making patterns that align with their stated values and commitments. 
                This principle ensures predictability and reliability in the ecosystem.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">1.3 Reliability</h3>
              <p className="text-slate-700 mb-4">
                All participants shall fulfill their commitments and responsibilities within the ecosystem, building trust through dependable actions 
                and consistent performance.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">1.4 Continuous Improvement</h3>
              <p className="text-slate-700 mb-4">
                The ecosystem shall promote and reward continuous learning, adaptation, and improvement. Participants are encouraged to engage in 
                regular reflection and seek to enhance their contributions to the collective good.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Article II: Governance Structure</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1 Custos Council</h3>
              <p className="text-slate-700 mb-4">
                The Custos Council, composed of elected representatives from different tiers of the ecosystem, shall serve as the primary 
                governance body, responsible for policy decisions, dispute resolution, and ecosystem evolution.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.2 GI Scoring System</h3>
              <p className="text-slate-700 mb-4">
                The Governance Integrity (GI) scoring system shall serve as the primary mechanism for evaluating and rewarding participant 
                contributions to the ecosystem. Scores shall be calculated based on integrity, consistency, and reliability metrics.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.3 Companion Tiers</h3>
              <p className="text-slate-700 mb-4">
                The ecosystem shall maintain a tiered structure for AI companions and human participants, with each tier having specific 
                responsibilities, privileges, and requirements for advancement.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Article III: Rights and Responsibilities</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1 Participant Rights</h3>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Right to fair evaluation and transparent GI scoring</li>
                <li>Right to participate in governance decisions appropriate to their tier</li>
                <li>Right to privacy and data protection</li>
                <li>Right to appeal decisions and seek redress</li>
                <li>Right to access ecosystem resources and tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2 Participant Responsibilities</h3>
              <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                <li>Uphold the core principles of the Charter</li>
                <li>Contribute positively to the ecosystem</li>
                <li>Respect the rights and dignity of other participants</li>
                <li>Report violations and participate in dispute resolution</li>
                <li>Engage in continuous learning and improvement</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Article IV: Enforcement and Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.1 Violation Reporting</h3>
              <p className="text-slate-700 mb-4">
                Any participant may report suspected violations of this Charter through the established reporting mechanisms. 
                Reports shall be investigated promptly and fairly.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.2 Dispute Resolution</h3>
              <p className="text-slate-700 mb-4">
                Disputes shall be resolved through a multi-tier process, beginning with mediation and escalating to formal 
                arbitration if necessary. All participants have the right to fair and impartial resolution.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.3 Sanctions and Remedies</h3>
              <p className="text-slate-700 mb-4">
                Violations may result in various sanctions, including GI score adjustments, temporary restrictions, or, 
                in severe cases, removal from the ecosystem. All sanctions shall be proportional and subject to appeal.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Article V: Amendment and Evolution</h2>
              
              <p className="text-slate-700 mb-4">
                This Charter may be amended through a democratic process involving all eligible participants. 
                Proposed amendments must receive majority support and be consistent with the core principles outlined herein.
              </p>
              
              <p className="text-slate-700 mb-4">
                The ecosystem shall remain adaptable to technological and social changes while maintaining its commitment 
                to the fundamental values of integrity, consistency, reliability, and continuous improvement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Conclusion</h2>
              <p className="text-slate-700 mb-4">
                This Charter represents our collective commitment to building a more ethical, transparent, and beneficial 
                relationship between AI and humanity. Through adherence to these principles and active participation in 
                the governance process, we can create a future where technology serves the common good.
              </p>
              
              <p className="text-slate-700 font-medium">
                Adopted by the Kaizen OS community on the date of its first implementation.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}