'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Stepper } from '@/components/Stepper';
import { api } from '@/lib/api';
import { getJWT } from '@/lib/auth';

export default function Step3SealPage() {
  const router = useRouter();
  const [designData, setDesignData] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedDesign = localStorage.getItem('kaizen_domain_design');
    if (savedDesign) {
      setDesignData(JSON.parse(savedDesign));
    } else {
      router.push('/onboarding/step2-design');
    }
  }, [router]);

  const handlePreview = async () => {
    if (!designData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const jwt = getJWT();
      if (!jwt) {
        throw new Error('Authentication required for preview');
      }
      
      const previewData = await api.domains.preview(jwt, {
        domain: designData.domain,
        purpose: designData.purpose,
        description: designData.description,
        expected_gi_impact: designData.expectedGiImpact,
        tags: designData.tags,
      });
      
      setPreview(previewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview domain');
    } finally {
      setLoading(false);
    }
  };

  const handleSeal = async () => {
    if (!designData || !preview) return;
    
    setSealing(true);
    setError(null);
    
    try {
      const jwt = getJWT();
      if (!jwt) {
        throw new Error('Authentication required for sealing');
      }
      
      const result = await api.domains.seal(jwt, {
        domain: designData.domain,
        purpose: designData.purpose,
        description: designData.description,
        expected_gi_impact: designData.expectedGiImpact,
        tags: designData.tags,
      });
      
      if (result.success) {
        // Store sealed domain info
        localStorage.setItem('kaizen_sealed_domain', JSON.stringify({
          domain: result.domain,
          tx_hash: result.tx_hash,
          sealed_at: new Date().toISOString(),
        }));
        
        router.push('/onboarding/step4-reflect');
      } else {
        throw new Error('Failed to seal domain');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seal domain');
    } finally {
      setSealing(false);
    }
  };

  const steps = ['Civic Oath', 'Design', 'Seal to Ledger', 'First Reflection'];

  if (!designData) {
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
        <Stepper currentStep={3} totalSteps={4} steps={steps} />

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Seal to Ledger</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Domain Configuration</h2>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div><span className="font-medium">Domain:</span> {designData.domain}.gic</div>
              <div><span className="font-medium">Purpose:</span> {designData.purpose}</div>
              <div><span className="font-medium">Description:</span> {designData.description}</div>
              <div><span className="font-medium">Expected GI Impact:</span> {designData.expectedGiImpact}</div>
              <div><span className="font-medium">Tags:</span> {designData.tags.join(', ') || 'None'}</div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!preview ? (
            <div className="space-y-4">
              <p className="text-slate-700">
                Preview your domain configuration before sealing it to the immutable ledger.
              </p>
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Generating Preview...' : 'Preview Domain'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Preview Generated Successfully</h3>
                <div className="text-green-700">
                  <p><strong>Domain:</strong> {preview.domain}</p>
                  <p><strong>Preview URL:</strong> <a href={preview.preview_url} target="_blank" rel="noopener noreferrer" className="underline">{preview.preview_url}</a></p>
                  <p><strong>Estimated GI Impact:</strong> +{preview.estimated_gi_impact}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
                <p className="text-amber-700">
                  Once sealed, your domain configuration will be permanently recorded on the ledger. 
                  This action cannot be undone. Make sure all information is correct before proceeding.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSeal}
                  disabled={sealing}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {sealing ? 'Sealing to Ledger...' : 'Seal Domain'}
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Regenerate Preview
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Back to Design
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}