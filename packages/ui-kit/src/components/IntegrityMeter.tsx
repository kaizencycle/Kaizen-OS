import React from 'react';
import { IntegrityMeterProps } from '../types';

const IntegrityMeter: React.FC<IntegrityMeterProps> = ({
  value,
  max = 1,
  thresholds = { warning: 0.7, critical: 0.5 },
  label,
  showValue = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColor = (val: number) => {
    if (val >= thresholds.warning * 100) return 'bg-green-500';
    if (val >= thresholds.critical * 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatus = (val: number) => {
    if (val >= thresholds.warning * 100) return 'Excellent';
    if (val >= thresholds.critical * 100) return 'Good';
    return 'Needs Attention';
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValue && (
            <span className="text-sm font-medium text-gray-900">
              {value.toFixed(2)} / {max.toFixed(2)}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        {/* Threshold markers */}
        <div className="absolute top-0 left-0 w-full h-3 pointer-events-none">
          <div
            className="absolute top-0 w-0.5 h-3 bg-yellow-400 opacity-60"
            style={{ left: `${thresholds.warning * 100}%` }}
          ></div>
          <div
            className="absolute top-0 w-0.5 h-3 bg-red-400 opacity-60"
            style={{ left: `${thresholds.critical * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs font-medium ${
          percentage >= thresholds.warning * 100 ? 'text-green-600' :
          percentage >= thresholds.critical * 100 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {getStatus(percentage)}
        </span>
        
        <div className="flex space-x-4 text-xs text-gray-500">
          <span>Warning: {(thresholds.warning * 100).toFixed(0)}%</span>
          <span>Critical: {(thresholds.critical * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default IntegrityMeter;
