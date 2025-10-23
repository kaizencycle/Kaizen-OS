/**
 * Scout Test Page
 * 
 * Interactive testing page for the WebDataScout system.
 * Allows users to test different extraction scenarios and see results.
 */

'use client';

import React, { useState } from 'react';
import { OaaLiveCard, OaaLessonCard, OaaStatusCard, OaaCivicDataCard, OaaJobFeedCard } from '@/components/OaaLiveCard';

export default function ScoutTestPage() {
  const [testUrl, setTestUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scout-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: testUrl,
          fields: [
            { name: 'title', required: true, type: 'string' },
            { name: 'body', type: 'string' },
            { name: 'userId', type: 'number' },
            { name: 'id', type: 'number' }
          ]
        })
      });
      
      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const runScenario = async (scenario: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/scout-test', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      
      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WebDataScout Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Test and experiment with the WebDataScout system
          </p>
        </div>

        {/* Test interface */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test URL
              </label>
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
            
            <button
              onClick={runTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Run Test'}
            </button>
          </div>

          {testResults && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Scenario tests */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scenario Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => runScenario('oaa-lesson')}
              disabled={loading}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 text-left"
            >
              <h3 className="font-medium text-green-900">OAA Lesson</h3>
              <p className="text-sm text-green-700 mt-1">Test lesson data extraction</p>
            </button>
            
            <button
              onClick={() => runScenario('status-intelligence')}
              disabled={loading}
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 disabled:opacity-50 text-left"
            >
              <h3 className="font-medium text-yellow-900">Status Intelligence</h3>
              <p className="text-sm text-yellow-700 mt-1">Test status monitoring</p>
            </button>
            
            <button
              onClick={() => runScenario('civic-data')}
              disabled={loading}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 text-left"
            >
              <h3 className="font-medium text-purple-900">Civic Data</h3>
              <p className="text-sm text-purple-700 mt-1">Test civic data extraction</p>
            </button>
            
            <button
              onClick={() => runScenario('job-feed')}
              disabled={loading}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 text-left"
            >
              <h3 className="font-medium text-blue-900">Job Feed</h3>
              <p className="text-sm text-blue-700 mt-1">Test job board integration</p>
            </button>
          </div>
        </div>

        {/* Live card examples */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Card Examples</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic lesson card */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Lesson Card</h3>
                <OaaLessonCard
                  url="https://jsonplaceholder.typicode.com/posts/1"
                  refreshInterval={300}
                />
              </div>

              {/* Status card */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Card</h3>
                <OaaStatusCard
                  url="https://status.render.com"
                  refreshInterval={60}
                />
              </div>

              {/* Civic data card */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Civic Data Card</h3>
                <OaaCivicDataCard
                  url="https://data.cityofchicago.org/api/views/example"
                  refreshInterval={3600}
                />
              </div>

              {/* Job feed card */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Feed Card</h3>
                <OaaJobFeedCard
                  url="https://jobs.example.com"
                  refreshInterval={1800}
                />
              </div>
            </div>
          </div>

          {/* Custom live card */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Live Card</h3>
            <OaaLiveCard
              url="https://jsonplaceholder.typicode.com/posts/1"
              schema={[
                { name: 'title', required: true, type: 'string' },
                { name: 'body', type: 'string' },
                { name: 'userId', type: 'number' }
              ]}
              refreshInterval={300}
            >
              {(data: any, meta: any) => (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">
                    {String(data.title || '')}
                  </h4>
                  <p className="text-blue-800 text-sm mb-3">
                    {String(data.body || '')}
                  </p>
                  <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>User ID: {String(data.userId || '')}</span>
                    <span>Updated: {new Date(meta.fetchedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </OaaLiveCard>
          </div>
        </div>

        {/* API documentation */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
          <div className="space-y-2 text-sm">
            <div>
              <code className="bg-white px-2 py-1 rounded">GET /api/scout-test</code>
              <span className="ml-2 text-gray-600">- Health check and cache stats</span>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded">POST /api/scout-test/extract</code>
              <span className="ml-2 text-gray-600">- Single URL extraction</span>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded">PUT /api/scout-test/batch</code>
              <span className="ml-2 text-gray-600">- Batch extraction</span>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded">DELETE /api/scout-test/cache</code>
              <span className="ml-2 text-gray-600">- Clear cache</span>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded">PATCH /api/scout-test</code>
              <span className="ml-2 text-gray-600">- Test scenarios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}