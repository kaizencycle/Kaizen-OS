'use client';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { GiGauge } from '@/components/GiGauge';
import { CompanionCard } from '@/components/CompanionCard';
import { api } from '@/lib/api';
import { getJWT } from '@/lib/auth';
import { GIResponse, Companion, Reflection } from '@/lib/types';

export default function DashboardPage() {
  const [gi, setGi] = useState<GIResponse | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const jwt = getJWT();
        
        // Load companions (public)
        const companionsData = await api.companions();
        setCompanions(companionsData);
        
        // Load user data if authenticated
        if (jwt) {
          try {
            const [giData, reflectionsData] = await Promise.all([
              api.meGI(jwt),
              api.reflections.list(jwt)
            ]);
            setGi(giData);
            setReflections(reflectionsData);
          } catch (authError) {
            console.warn('Auth data unavailable:', authError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Nav />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Nav />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Dashboard Unavailable</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {gi && (
            <div className="lg:col-span-1">
              <GiGauge gi={gi} />
            </div>
          )}
          
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Reflections</h2>
            {reflections.length > 0 ? (
              <div className="space-y-4">
                {reflections.slice(0, 3).map((reflection) => (
                  <div key={reflection.id} className="bg-white rounded-lg border border-slate-200 p-4">
                    <p className="text-slate-700 mb-2">{reflection.content}</p>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>GI Impact: +{reflection.gi_impact}</span>
                      <span>{new Date(reflection.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-100 rounded-lg p-8 text-center">
                <p className="text-slate-600">No reflections yet. Start your journey!</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Available Companions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((companion) => (
              <CompanionCard key={companion.id} companion={companion} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}