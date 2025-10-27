'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Stepper } from '@/components/Stepper';

export default function Step1OathPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return;

    setLoading(true);
    try {
      // Store oath acceptance in localStorage
      localStorage.setItem('kaizen_oath_accepted', 'true');
      router.push('/onboarding/step2-design');
    } catch (error) {
      console.error('Failed to accept oath:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Civic Oath', 'Design', 'Seal to Ledger', 'First Reflection'];

  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Stepper currentStep={1} totalSteps={4} steps={steps} />

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Civic Oath</h1>
          
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg text-slate-700 mb-6">
              By joining the Kaizen OS ecosystem, you commit to the following principles:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Integrity</h3>
                  <p className="text-slate-600">I will act with honesty, transparency, and ethical responsibility in all my interactions within the Kaizen OS ecosystem.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Consistency</h3>
                  <p className="text-slate-600">I will maintain consistent behavior and decision-making patterns that align with my stated values and commitments.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Reliability</h3>
                  <p className="text-slate-600">I will fulfill my commitments and responsibilities within the ecosystem, building trust through dependable actions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm mt-0.5">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Continuous Improvement</h3>
                  <p className="text-slate-600">I will engage in regular reflection and seek to improve my GI score through positive contributions to the ecosystem.</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="oath-acceptance"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="oath-acceptance" className="text-slate-700">
                I understand and accept the Civic Oath and commit to upholding these principles in my participation in the Kaizen OS ecosystem.
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!accepted || loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Processing...' : 'Accept Oath & Continue'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}