'use client';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { CompanionCard } from '@/components/CompanionCard';
import { api } from '@/lib/api';
import { Companion } from '@/lib/types';

export default function CompanionsPage() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanions = async () => {
      try {
        const data = await api.companions();
        setCompanions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companions');
      } finally {
        setLoading(false);
      }
    };

    loadCompanions();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Nav />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
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
            <h2 className="text-lg font-semibold text-red-800 mb-2">Companions Unavailable</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const companionsByTier = companions.reduce((acc, companion) => {
    if (!acc[companion.tier]) {
      acc[companion.tier] = [];
    }
    acc[companion.tier].push(companion);
    return acc;
  }, {} as Record<string, Companion[]>);

  const tierOrder = ['founder', 'guardian', 'sentinel', 'citizen'];
  const tierNames = {
    founder: 'Founders',
    guardian: 'Guardians',
    sentinel: 'Sentinels',
    citizen: 'Citizens'
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Companions</h1>
          <p className="text-xl text-slate-600">
            Meet the AI companions that power the Kaizen OS ecosystem
          </p>
        </div>

        {tierOrder.map((tier) => {
          const tierCompanions = companionsByTier[tier] || [];
          if (tierCompanions.length === 0) return null;

          return (
            <div key={tier} className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 capitalize">
                {tierNames[tier as keyof typeof tierNames]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tierCompanions.map((companion) => (
                  <CompanionCard key={companion.id} companion={companion} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}