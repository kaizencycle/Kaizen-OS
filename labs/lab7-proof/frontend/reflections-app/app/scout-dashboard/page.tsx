/**
 * Scout Dashboard Page
 * 
 * Main dashboard for monitoring and managing the WebDataScout system.
 * Provides real-time metrics, alerts, and system health information.
 */

'use client';

import React from 'react';
import ScoutDashboard from '@/components/ScoutDashboard';
import { StatusMonitoringDashboard, RealTimeStatusMonitor, EchoBridgeIntegration } from '@/examples/status-monitoring';

export default function ScoutDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WebDataScout Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and manage web data extraction across your Lab7 OAA system
          </p>
        </div>

        {/* Main dashboard */}
        <div className="mb-12">
          <ScoutDashboard
            refreshInterval={30}
            showAlerts={true}
            showMetrics={true}
            showHealth={true}
            className="mb-8"
          />
        </div>

        {/* Status monitoring */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Service Status Monitoring
          </h2>
          <StatusMonitoringDashboard />
        </div>

        {/* Real-time monitoring */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Real-time Incident Monitoring
          </h2>
          <RealTimeStatusMonitor />
        </div>

        {/* Echo Bridge integration */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Echo Bridge Sentinel Integration
          </h2>
          <EchoBridgeIntegration />
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/api/scout-test"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-medium text-blue-900">API Health Check</h4>
              <p className="text-sm text-blue-700 mt-1">Check system health and cache stats</p>
            </a>
            
            <a
              href="/api/scout-test?scenario=oaa-lesson"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h4 className="font-medium text-green-900">Test OAA Lesson</h4>
              <p className="text-sm text-green-700 mt-1">Test lesson data extraction</p>
            </a>
            
            <a
              href="/api/scout-test?scenario=status-intelligence"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <h4 className="font-medium text-yellow-900">Test Status Check</h4>
              <p className="text-sm text-yellow-700 mt-1">Test status monitoring</p>
            </a>
          </div>
        </div>

        {/* Documentation links */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Getting Started</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="#quick-start" className="text-blue-600 hover:text-blue-800">Quick Start Guide</a></li>
                <li>• <a href="#api-reference" className="text-blue-600 hover:text-blue-800">API Reference</a></li>
                <li>• <a href="#configuration" className="text-blue-600 hover:text-blue-800">Configuration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Use Cases</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="#oaa-lessons" className="text-blue-600 hover:text-blue-800">OAA Lessons</a></li>
                <li>• <a href="#status-monitoring" className="text-blue-600 hover:text-blue-800">Status Monitoring</a></li>
                <li>• <a href="#civic-data" className="text-blue-600 hover:text-blue-800">Civic Data</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}