import React from 'react';
import { GIBadgeProps } from '../types';

const GIBadge: React.FC<GIBadgeProps> = ({
  gi,
  size = 'medium',
  showValue = true,
  className = ''
}) => {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'px-2 py-1 text-xs';
      case 'large': return 'px-4 py-2 text-lg';
      default: return 'px-3 py-1 text-sm';
    }
  };

  const getColorClasses = (gi: number) => {
    if (gi >= 0.95) return 'bg-green-100 text-green-800 border-green-200';
    if (gi >= 0.90) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (gi >= 0.80) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = (gi: number) => {
    if (gi >= 0.95) return 'EXCELLENT';
    if (gi >= 0.90) return 'GOOD';
    if (gi >= 0.80) return 'FAIR';
    return 'POOR';
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${getSizeClasses(size)}
        ${getColorClasses(gi)}
        ${className}
      `}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
      {showValue && (
        <span className="mr-1">
          {(gi * 100).toFixed(1)}%
        </span>
      )}
      <span>{getStatusText(gi)}</span>
    </span>
  );
};

export default GIBadge;
