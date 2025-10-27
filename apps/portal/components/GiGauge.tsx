'use client';
import { GIResponse } from '@/lib/types';

interface GiGaugeProps {
  gi: GIResponse;
}

export function GiGauge({ gi }: GiGaugeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Your GI Score</h3>
      
      <div className="flex items-center justify-center mb-6">
        <div className={`w-32 h-32 rounded-full ${getScoreBg(gi.score)} flex items-center justify-center`}>
          <span className={`text-3xl font-bold ${getScoreColor(gi.score)}`}>
            {gi.score}
          </span>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-sm text-slate-600">Tier: <span className="font-medium">{gi.tier}</span></p>
        <p className="text-xs text-slate-500">Last updated: {new Date(gi.last_updated).toLocaleDateString()}</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Integrity</span>
          <span className="font-medium">{gi.breakdown.integrity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Consistency</span>
          <span className="font-medium">{gi.breakdown.consistency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Reliability</span>
          <span className="font-medium">{gi.breakdown.reliability}</span>
        </div>
      </div>
    </div>
  );
}