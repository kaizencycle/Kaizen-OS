import { Companion } from '@/lib/types';

interface CompanionCardProps {
  companion: Companion;
}

export function CompanionCard({ companion }: CompanionCardProps) {
  const tierColors = {
    founder: 'bg-purple-100 text-purple-800 border-purple-200',
    guardian: 'bg-blue-100 text-blue-800 border-blue-200',
    sentinel: 'bg-green-100 text-green-800 border-green-200',
    citizen: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-slate-100 text-slate-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{companion.name}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${tierColors[companion.tier]}`}>
            {companion.tier}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[companion.status]}`}>
            {companion.status}
          </span>
        </div>
      </div>
      
      <p className="text-slate-600 mb-4">{companion.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">GI Score:</span>
          <span className="font-semibold text-indigo-600">{companion.gi_score}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700">Capabilities:</h4>
        <div className="flex flex-wrap gap-1">
          {companion.capabilities.map((capability, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}