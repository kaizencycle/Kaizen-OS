import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Stepper } from '@/components/Stepper';

export default function OnboardingPage() {
  const steps = ['Civic Oath', 'Design', 'Seal to Ledger', 'First Reflection'];
  
  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Create your .gic domain</h1>
          <p className="text-xl text-slate-600">
            Follow these steps to establish your presence in the Kaizen OS ecosystem
          </p>
        </div>

        <Stepper currentStep={1} totalSteps={4} steps={steps} />

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Onboarding Steps</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  <Link href="/onboarding/step1-oath" className="text-indigo-600 hover:text-indigo-700">
                    Civic Oath
                  </Link>
                </h3>
                <p className="text-slate-600">
                  Commit to the principles of integrity, transparency, and responsible AI development.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  <Link href="/onboarding/step2-design" className="text-indigo-600 hover:text-indigo-700">
                    Design
                  </Link>
                </h3>
                <p className="text-slate-600">
                  Configure your domain settings, purpose, and expected GI impact.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  <Link href="/onboarding/step3-seal" className="text-indigo-600 hover:text-indigo-700">
                    Seal to Ledger
                  </Link>
                </h3>
                <p className="text-slate-600">
                  Publish your domain configuration to the immutable ledger.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  <Link href="/onboarding/step4-reflect" className="text-indigo-600 hover:text-indigo-700">
                    First Reflection
                  </Link>
                </h3>
                <p className="text-slate-600">
                  Record your first reflection and begin building your GI score.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link
              href="/onboarding/step1-oath"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Start Onboarding
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}