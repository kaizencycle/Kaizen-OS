/**
 * OAA Live Card Component
 * 
 * Displays fresh data extracted from web sources with fallback handling,
 * loading states, and error recovery. Integrates with WebDataScout for
 * dynamic content in OAA lessons and dashboards.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { extract, type ScoutSchema, type ScoutResult, type ScoutConfig } from '@/lib/webDataScout';

export interface OaaLiveCardProps {
  /** URL to extract data from */
  url: string;
  /** Schema defining what fields to extract */
  schema: ScoutSchema;
  /** Configuration for the extraction */
  config?: ScoutConfig;
  /** Component to render when loading */
  loadingComponent?: React.ReactNode;
  /** Component to render when there's an error */
  errorComponent?: (error: string, retry: () => void) => React.ReactNode;
  /** Component to render when no data is available */
  emptyComponent?: React.ReactNode;
  /** Custom render function for the data */
  children?: (data: Record<string, unknown>, meta: ScoutResult['meta']) => React.ReactNode;
  /** Auto-refresh interval in seconds (0 to disable) */
  refreshInterval?: number;
  /** Whether to show refresh button */
  showRefreshButton?: boolean;
  /** CSS classes for the card container */
  className?: string;
  /** Callback when data is successfully loaded */
  onDataLoad?: (data: Record<string, unknown>, meta: ScoutResult['meta']) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

export function OaaLiveCard({
  url,
  schema,
  config = {},
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  refreshInterval = 0,
  showRefreshButton = true,
  className = '',
  onDataLoad,
  onError,
}: OaaLiveCardProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [meta, setMeta] = useState<ScoutResult['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await extract(url, schema, config);
      
      if (result.ok && result.data) {
        setData(result.data);
        setMeta(result.meta);
        setLastRefresh(new Date());
        onDataLoad?.(result.data, result.meta);
      } else {
        const errorMsg = result.error || 'Failed to extract data';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [url, schema, config, onDataLoad, onError]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchData]);

  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading fresh data...</span>
    </div>
  );

  // Default error component
  const defaultErrorComponent = (error: string, retry: () => void) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Data extraction failed</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <div className="mt-2">
            <button
              onClick={retry}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Default empty component
  const defaultEmptyComponent = (
    <div className="p-4 text-center text-gray-500">
      <p>No data available</p>
    </div>
  );

  // Default data renderer
  const defaultDataRenderer = (data: Record<string, unknown>, meta: ScoutResult['meta']) => (
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Live Data</h3>
        <div className="flex items-center space-x-2">
          {meta.cacheHit && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Cached
            </span>
          )}
          {lastRefresh && (
            <span className="text-xs text-gray-500">
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium text-gray-700 capitalize">
              {key.replace(/_/g, ' ')}:
            </span>
            <span className="text-gray-900">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
      
      {meta && (
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div>Source: {meta.url}</div>
            <div>Fetched: {new Date(meta.fetchedAt).toLocaleString()}</div>
            <div>Provider: {meta.provider}</div>
            {meta.layoutHash && (
              <div>Layout Hash: {meta.layoutHash.substring(0, 8)}...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header with refresh button */}
      {showRefreshButton && (
        <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-900">Live Data Card</h4>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-50 text-blue-800 px-2 py-1 rounded"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}

      {/* Content */}
      <div>
        {loading && (loadingComponent || defaultLoadingComponent)}
        
        {!loading && error && (errorComponent ? errorComponent(error, handleRetry) : defaultErrorComponent(error, handleRetry))}
        
        {!loading && !error && !data && (emptyComponent || defaultEmptyComponent)}
        
        {!loading && !error && data && meta && (
          children ? children(data, meta) : defaultDataRenderer(data, meta)
        )}
      </div>
    </div>
  );
}

// Predefined card components for common use cases
export function OaaLessonCard({ url, ...props }: Omit<OaaLiveCardProps, 'schema'>) {
  const schema: ScoutSchema = [
    { name: 'title', required: true, type: 'string' },
    { name: 'author', type: 'string' },
    { name: 'updated_at', type: 'string' },
    { name: 'content', type: 'string' },
  ];

  return (
    <OaaLiveCard
      url={url}
      schema={schema}
      {...props}
    />
  );
}

export function OaaStatusCard({ url, ...props }: Omit<OaaLiveCardProps, 'schema'>) {
  const schema: ScoutSchema = [
    { name: 'status', required: true, type: 'string' },
    { name: 'incidents', type: 'array' },
    { name: 'timestamp', type: 'string' },
  ];

  return (
    <OaaLiveCard
      url={url}
      schema={schema}
      refreshInterval={300} // 5 minutes
      {...props}
    />
  );
}

export function OaaCivicDataCard({ url, ...props }: Omit<OaaLiveCardProps, 'schema'>) {
  const schema: ScoutSchema = [
    { name: 'rows', type: 'array' },
    { name: 'columns', type: 'array' },
    { name: 'metadata', type: 'object' },
  ];

  return (
    <OaaLiveCard
      url={url}
      schema={schema}
      refreshInterval={3600} // 1 hour
      {...props}
    />
  );
}

export function OaaJobFeedCard({ url, ...props }: Omit<OaaLiveCardProps, 'schema'>) {
  const schema: ScoutSchema = [
    { name: 'jobs', type: 'array' },
    { name: 'total_count', type: 'number' },
    { name: 'last_updated', type: 'string' },
  ];

  return (
    <OaaLiveCard
      url={url}
      schema={schema}
      refreshInterval={1800} // 30 minutes
      {...props}
    />
  );
}

export default OaaLiveCard;