import React from 'react';
import { ProofCardProps } from '../types';

const ProofCard: React.FC<ProofCardProps> = ({
  title,
  description,
  status,
  integrity,
  timestamp,
  metadata,
  onAction,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIntegrityColor = (gi: number) => {
    if (gi >= 0.9) return 'text-green-600';
    if (gi >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.toUpperCase()}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Integrity:</span>
          <span className={`font-semibold ${getIntegrityColor(integrity)}`}>
            {(integrity * 100).toFixed(1)}%
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(timestamp).toLocaleString()}
        </span>
      </div>
      
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata</h4>
          <div className="bg-gray-50 rounded p-3">
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {onAction && (
        <div className="flex space-x-2">
          <button
            onClick={() => onAction('view')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Details
          </button>
          <button
            onClick={() => onAction('verify')}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Verify
          </button>
        </div>
      )}
    </div>
  );
};

export default ProofCard;
