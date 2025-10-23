/**
 * Scout Dashboard Component
 * 
 * Provides real-time monitoring and management interface for the WebDataScout system.
 * Displays SLO metrics, alerts, cache statistics, and system health.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface ScoutMetrics {
  requests_total: number;
  requests_per_minute: number;
  success_rate: number;
  average_latency: number;
  p95_latency: number;
  cache_hit_rate: number;
  pii_detections: number;
  layout_drifts: number;
  ops_guard_blocks: number;
  error_rate: number;
}

export interface ScoutAlert {
  id: string;
  name: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ScoutHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  providers: {
    scout: boolean;
    fallback: boolean;
    ops_guard: boolean;
    cache: boolean;
  };
  last_check: string;
}

export interface ScoutDashboardProps {
  refreshInterval?: number;
  showAlerts?: boolean;
  showMetrics?: boolean;
  showHealth?: boolean;
  className?: string;
}

export function ScoutDashboard({
  refreshInterval = 30,
  showAlerts = true,
  showMetrics = true,
  showHealth = true,
  className = '',
}: ScoutDashboardProps) {
  const [metrics, setMetrics] = useState<ScoutMetrics | null>(null);
  const [alerts, setAlerts] = useState<ScoutAlert[]>([]);
  const [health, setHealth] = useState<ScoutHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/scout-test');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data = await response.json();
      setMetrics(data.metrics || null);
      setHealth(data.health || null);
      setAlerts(data.alerts || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchMetrics();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, refreshInterval]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await fetch(`/api/scout-test/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await fetch('/api/scout-test/cache', { method: 'DELETE' });
      await fetchMetrics(); // Refresh metrics
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">Failed to load dashboard: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">WebDataScout Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchMetrics}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm"
          >
            Refresh
          </button>
          <button
            onClick={clearCache}
            className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Health Status */}
      {showHealth && health && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">System Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                health.status === 'healthy' ? 'bg-green-500' : 
                health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <div className="text-sm font-medium">Overall</div>
              <div className="text-xs text-gray-600 capitalize">{health.status}</div>
            </div>
            {Object.entries(health.providers).map(([name, status]) => (
              <div key={name} className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                  status ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="text-sm font-medium capitalize">{name}</div>
                <div className="text-xs text-gray-600">{status ? 'Up' : 'Down'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Success Rate"
            value={`${metrics.success_rate.toFixed(1)}%`}
            status={metrics.success_rate >= 95 ? 'good' : metrics.success_rate >= 90 ? 'warning' : 'bad'}
          />
          <MetricCard
            title="Avg Latency"
            value={`${metrics.average_latency.toFixed(2)}s`}
            status={metrics.average_latency <= 2 ? 'good' : metrics.average_latency <= 5 ? 'warning' : 'bad'}
          />
          <MetricCard
            title="P95 Latency"
            value={`${metrics.p95_latency.toFixed(2)}s`}
            status={metrics.p95_latency <= 5 ? 'good' : metrics.p95_latency <= 10 ? 'warning' : 'bad'}
          />
          <MetricCard
            title="Cache Hit Rate"
            value={`${metrics.cache_hit_rate.toFixed(1)}%`}
            status={metrics.cache_hit_rate >= 80 ? 'good' : metrics.cache_hit_rate >= 60 ? 'warning' : 'bad'}
          />
          <MetricCard
            title="Requests/min"
            value={metrics.requests_per_minute.toFixed(0)}
            status="neutral"
          />
          <MetricCard
            title="PII Detections"
            value={metrics.pii_detections.toString()}
            status={metrics.pii_detections === 0 ? 'good' : 'warning'}
          />
          <MetricCard
            title="Layout Drifts"
            value={metrics.layout_drifts.toString()}
            status={metrics.layout_drifts === 0 ? 'good' : 'warning'}
          />
          <MetricCard
            title="Ops Guard Blocks"
            value={metrics.ops_guard_blocks.toString()}
            status={metrics.ops_guard_blocks === 0 ? 'good' : 'warning'}
          />
        </div>
      )}

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {alerts.filter(alert => !alert.acknowledged).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{alert.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="ml-4 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  status 
}: { 
  title: string; 
  value: string; 
  status: 'good' | 'warning' | 'bad' | 'neutral' 
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    bad: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${statusColors[status]}`}>{value}</div>
    </div>
  );
}

export default ScoutDashboard;