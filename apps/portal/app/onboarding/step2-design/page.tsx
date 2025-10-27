'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Stepper } from '@/components/Stepper';

export default function Step2DesignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    domain: '',
    purpose: '',
    expectedGiImpact: 10,
    description: '',
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Store design data
      localStorage.setItem('kaizen_domain_design', JSON.stringify(formData));
      router.push('/onboarding/step3-seal');
    } catch (error) {
      console.error('Failed to save design:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const steps = ['Civic Oath', 'Design', 'Seal to Ledger', 'First Reflection'];

  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Stepper currentStep={2} totalSteps={4} steps={steps} />

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Design Your Domain</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-slate-700 mb-2">
                Domain Name *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="my-awesome-project"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-600">
                  .gic
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Choose a unique domain name for your project. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-2">
                Purpose *
              </label>
              <select
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a purpose</option>
                <option value="ai-agent">AI Agent</option>
                <option value="data-service">Data Service</option>
                <option value="governance">Governance Tool</option>
                <option value="research">Research Project</option>
                <option value="community">Community Initiative</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Describe what your domain will do and how it contributes to the ecosystem..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="expectedGiImpact" className="block text-sm font-medium text-slate-700 mb-2">
                Expected GI Impact: {formData.expectedGiImpact}
              </label>
              <input
                type="range"
                id="expectedGiImpact"
                min="1"
                max="100"
                value={formData.expectedGiImpact}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedGiImpact: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-500 mt-1">
                <span>Low (1)</span>
                <span>High (100)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Saving...' : 'Save Design & Continue'}
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