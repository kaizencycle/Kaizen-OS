import React from 'react';
import { StatusIndicatorProps } from '../types';

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'medium',
  showLabel = true,
  className = ''
}) => {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'w-2 h-2';
      case 'large': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  const getTextSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          label: 'Healthy'
        };
      case 'degraded':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          label: 'Degraded'
        };
      case 'unhealthy':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          label: 'Unhealthy'
        };
      default:
        return {
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${getSizeClasses(size)} ${config.color} rounded-full`}></div>
      {showLabel && (
        <span className={`ml-2 ${getTextSizeClasses(size)} font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
