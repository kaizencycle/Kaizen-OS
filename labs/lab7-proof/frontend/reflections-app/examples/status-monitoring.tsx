/**
 * Example: Status Monitoring Integration
 * 
 * Shows how to use WebDataScout for operational intelligence,
 * monitoring service status, and incident management.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { OaaLiveCard, OaaStatusCard } from '@/components/OaaLiveCard';
import { extract, extractBatch, type ScoutSchema } from '@/lib/webDataScout';

// Status monitoring dashboard
export function StatusMonitoringDashboard() {
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatusData = async () => {
      try {
        // Monitor multiple services
        const results = await extractBatch([
          {
            url: 'https://status.render.com',
            fields: [
              { name: 'status', required: true, type: 'string' },
              { name: 'incidents', type: 'array' },
              { name: 'timestamp', type: 'string' }
            ]
          },
          {
            url: 'https://www.githubstatus.com',
            fields: [
              { name: 'status', required: true, type: 'string' },
              { name: 'components', type: 'array' },
              { name: 'incidents', type: 'array' }
            ]
          },
          {
            url: 'https://status.aws.amazon.com',
            fields: [
              { name: 'status', required: true, type: 'string' },
              { name: 'services', type: 'array' },
              { name: 'last_updated', type: 'string' }
            ]
          }
        ]);

        setStatusData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadStatusData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadStatusData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">Failed to load status data: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Service Status Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statusData.map((result, index) => (
          <StatusCard key={index} result={result} />
        ))}
      </div>
    </div>
  );
}

// Individual status card component
function StatusCard({ result }: { result: any }) {
  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('operational') || lowerStatus.includes('good')) {
      return 'bg-green-500';
    } else if (lowerStatus.includes('degraded') || lowerStatus.includes('warning')) {
      return 'bg-yellow-500';
    } else if (lowerStatus.includes('down') || lowerStatus.includes('error')) {
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  const getServiceName = (url: string) => {
    if (url.includes('render.com')) return 'Render';
    if (url.includes('githubstatus.com')) return 'GitHub';
    if (url.includes('aws.amazon.com')) return 'AWS';
    return 'Unknown Service';
  };

  if (!result.ok) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <h3 className="font-semibold text-red-900">
            {getServiceName(result.meta.url)}
          </h3>
        </div>
        <p className="text-red-700 text-sm">Status check failed: {result.error}</p>
      </div>
    );
  }

  const status = result.data?.status || 'Unknown';
  const incidents = result.data?.incidents || [];
  const components = result.data?.components || [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status)}`}></div>
        <h3 className="font-semibold text-gray-900">
          {getServiceName(result.meta.url)}
        </h3>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">Status:</span>
          <span className={`ml-2 text-sm font-medium ${
            getStatusColor(status) === 'bg-green-500' ? 'text-green-700' :
            getStatusColor(status) === 'bg-yellow-500' ? 'text-yellow-700' :
            getStatusColor(status) === 'bg-red-500' ? 'text-red-700' : 'text-gray-700'
          }`}>
            {status}
          </span>
        </div>
        
        {incidents.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600">Incidents:</span>
            <span className="ml-2 text-sm text-red-600">{incidents.length}</span>
          </div>
        )}
        
        {components.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600">Components:</span>
            <span className="ml-2 text-sm text-gray-700">{components.length}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Source: {result.meta.url}</div>
          <div>Last checked: {new Date(result.meta.fetchedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// Real-time status monitoring with alerts
export function RealTimeStatusMonitor() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const checkForIncidents = async () => {
      try {
        // Check for incidents across multiple services
        const results = await extractBatch([
          {
            url: 'https://status.render.com',
            fields: [
              { name: 'incidents', type: 'array' },
              { name: 'status', type: 'string' }
            ]
          },
          {
            url: 'https://www.githubstatus.com',
            fields: [
              { name: 'incidents', type: 'array' },
              { name: 'status', type: 'string' }
            ]
          }
        ]);

        // Process incidents
        const newAlerts: any[] = [];
        results.forEach((result, index) => {
          if (result.ok && result.data?.incidents) {
            const incidents = result.data.incidents;
            if (Array.isArray(incidents)) {
              incidents.forEach((incident: any) => {
              newAlerts.push({
                id: `${index}-${incident.id || Date.now()}`,
                service: result.meta.url,
                incident,
                timestamp: new Date().toISOString(),
                severity: 'warning'
              });
            });
            }
          }
        });

        setAlerts(newAlerts);
      } catch (error) {
        console.error('Failed to check for incidents:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkForIncidents, 60 * 1000);
    checkForIncidents(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Real-time Incident Monitoring</h2>
      
      {alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800">All systems operational</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-900">Incident Detected</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Service: {alert.service}
                  </p>
                  <p className="text-sm text-yellow-700">
                    Time: {new Date(alert.timestamp).toLocaleString()}
                  </p>
                  {alert.incident && (
                    <div className="mt-2 text-sm text-yellow-800">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(alert.incident, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Integration with Echo Bridge Sentinel
export function EchoBridgeIntegration() {
  const [sentinelData, setSentinelData] = useState<any>(null);

  useEffect(() => {
    const sendToEchoBridge = async () => {
      try {
        // Extract status data
        const result = await extract('https://status.render.com', [
          { name: 'status', required: true, type: 'string' },
          { name: 'incidents', type: 'array' },
          { name: 'timestamp', type: 'string' }
        ]);

        if (result.ok) {
          // Send to Echo Bridge Sentinel
          const sentinelPayload = {
            service: 'render',
            status: result.data?.status || 'unknown',
            incidents: result.data?.incidents || [],
            timestamp: new Date().toISOString(),
            source: 'web-data-scout',
            metadata: {
              url: result.meta.url,
              fetchedAt: result.meta.fetchedAt,
              provider: result.meta.provider
            }
          };

          // In a real implementation, this would call your Echo Bridge API
          console.log('Sending to Echo Bridge Sentinel:', sentinelPayload);
          
          // Simulate API call
          setSentinelData(sentinelPayload);
        }
      } catch (error) {
        console.error('Failed to send to Echo Bridge:', error);
      }
    };

    sendToEchoBridge();
    
    // Send updates every 5 minutes
    const interval = setInterval(sendToEchoBridge, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Echo Bridge Sentinel Integration</h2>
      
      {sentinelData ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Last Sentinel Update</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Service:</span> {sentinelData.service}
            </div>
            <div>
              <span className="font-medium">Status:</span> {sentinelData.status}
            </div>
            <div>
              <span className="font-medium">Incidents:</span> {sentinelData.incidents.length}
            </div>
            <div>
              <span className="font-medium">Timestamp:</span> {new Date(sentinelData.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-700">
            <div>Source: {sentinelData.metadata.url}</div>
            <div>Provider: {sentinelData.metadata.provider}</div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No data sent to Echo Bridge yet...</div>
      )}
    </div>
  );
}

export default {
  StatusMonitoringDashboard,
  RealTimeStatusMonitor,
  EchoBridgeIntegration,
};