'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Stepper } from '@/components/Stepper';
import { api } from '@/lib/api';
import { getJWT } from '@/lib/auth';

export default function Step4ReflectPage() {
  const router = useRouter();
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sealedDomain, setSealedDomain] = useState<any>(null);

  useEffect(() => {
    const savedDomain = localStorage.getItem('kaizen_sealed_domain');
    if (savedDomain) {
      setSealedDomain(JSON.parse(savedDomain));
    } else {
      router.push('/onboarding/step3-seal');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    setLoading(true);
    
    try {
      const jwt = getJWT();
      if (!jwt) {
        throw new Error('Authentication required for reflection');
      }

      await api.reflections.create(jwt, {
        content: reflection,
        domain_id: sealedDomain?.domain,
      });

      setCompleted(true);
      
      // Clear onboarding data
      localStorage.removeItem('kaizen_oath_accepted');
      localStorage.removeItem('kaizen_domain_design');
      localStorage.removeItem('kaizen_sealed_domain');
      
    } catch (error) {
      console.error('Failed to create reflection:', error);
      alert('Failed to create reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Civic Oath', 'Design', 'Seal to Ledger', 'First Reflection'];

  if (completed) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Nav />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Stepper currentStep={4} totalSteps={4} steps={steps} />

          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Onboarding Complete!</h1>
            <p className="text-xl text-slate-600 mb-8">
              Welcome to the Kaizen OS ecosystem. Your domain has been sealed and your first reflection recorded.
            </p>

            {sealedDomain && (
              <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Sealed Domain</h2>
                <div className="space-y-2">
                  <div><span className="font-medium">Domain:</span> {sealedDomain.domain}</div>
                  <div><span className="font-medium">Sealed at:</span> {new Date(sealedDomain.sealed_at).toLocaleString()}</div>
                  {sealedDomain.tx_hash && (
                    <div><span className="font-medium">Transaction:</span> <code className="text-sm bg-slate-200 px-2 py-1 rounded">{sealedDomain.tx_hash}</code></div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/companions')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Explore Companions
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!sealedDomain) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Nav />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Stepper currentStep={4} totalSteps={4} steps={steps} />

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">First Reflection</h1>
          
          <div className="mb-8">
            <p className="text-lg text-slate-700 mb-4">
              Record your first reflection on joining the Kaizen OS ecosystem. This will help establish your initial GI score.
            </p>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Reflection Prompts</h3>
              <ul className="text-slate-600 space-y-1">
                <li>• What motivated you to join the Kaizen OS ecosystem?</li>
                <li>• How do you plan to contribute to the community?</li>
                <li>• What are your goals for your .gic domain?</li>
                <li>• How do you envision AI and humans working together?</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="reflection" className="block text-sm font-medium text-slate-700 mb-2">
                Your Reflection *
              </label>
              <textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={8}
                placeholder="Share your thoughts on joining the Kaizen OS ecosystem..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="mt-1 text-sm text-slate-500">
                Minimum 50 characters. This reflection will be recorded and contribute to your GI score.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || reflection.trim().length < 50}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Recording Reflection...' : 'Complete Onboarding'}
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