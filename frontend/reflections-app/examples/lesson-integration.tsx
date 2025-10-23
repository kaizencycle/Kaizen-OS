/**
 * Example: OAA Lesson Integration
 * 
 * Shows how to integrate WebDataScout with OAA lessons to provide
 * dynamic, fresh content without manual scraping.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { OaaLiveCard, OaaLessonCard } from '@/components/OaaLiveCard';
import { extract, type ScoutSchema } from '@/lib/webDataScout';

// Example lesson about APIs using live data
export function ApiLessonExample() {
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract live data for the lesson
    const loadLessonData = async () => {
      try {
        // Get a real API example from JSONPlaceholder
        const result = await extract('https://jsonplaceholder.typicode.com/posts/1', [
          { name: 'title', required: true, type: 'string' },
          { name: 'body', type: 'string' },
          { name: 'userId', type: 'number' },
          { name: 'id', type: 'number' }
        ]);

        if (result.ok) {
          setLessonData(result.data);
        }
      } catch (error) {
        console.error('Failed to load lesson data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Introduction to APIs</h1>
      
      <div className="prose max-w-none">
        <h2>What is an API?</h2>
        <p>
          An API (Application Programming Interface) is a set of protocols and tools 
          for building software applications. It defines how software components should 
          interact with each other.
        </p>

        <h2>Live API Example</h2>
        <p>
          Let's look at a real API response. This data is fetched live from 
          JSONPlaceholder, a free fake API for testing:
        </p>

        {/* Live data card */}
        <OaaLiveCard
          url="https://jsonplaceholder.typicode.com/posts/1"
          schema={[
            { name: 'title', required: true, type: 'string' },
            { name: 'body', type: 'string' },
            { name: 'userId', type: 'number' },
            { name: 'id', type: 'number' }
          ]}
          refreshInterval={300} // 5 minutes
          children={(data, meta) => (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Live API Response
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Title:</span> {String(data.title || '')}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {String(data.userId || '')}
                </div>
                <div>
                  <span className="font-medium">Post ID:</span> {String(data.id || '')}
                </div>
                <div>
                  <span className="font-medium">Body:</span> {String(data.body || '')}
                </div>
              </div>
              <div className="mt-3 text-sm text-blue-700">
                <div>Source: {meta.url}</div>
                <div>Fetched: {new Date(meta.fetchedAt).toLocaleString()}</div>
                {meta.cacheHit && <div>Status: Cached</div>}
              </div>
            </div>
          )}
        />

        <h2>Understanding the Response</h2>
        <p>
          The API response above shows a typical JSON structure with:
        </p>
        <ul>
          <li><strong>id</strong>: Unique identifier for the post</li>
          <li><strong>title</strong>: The post title</li>
          <li><strong>body</strong>: The post content</li>
          <li><strong>userId</strong>: ID of the user who created the post</li>
        </ul>

        <h2>Try It Yourself</h2>
        <p>
          You can experiment with different post IDs by changing the URL in the 
          live example above. The data updates automatically every 5 minutes.
        </p>
      </div>
    </div>
  );
}

// Example lesson about web scraping using live news data
export function WebScrapingLessonExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Web Scraping with WebDataScout</h1>
      
      <div className="prose max-w-none">
        <h2>Introduction</h2>
        <p>
          Web scraping is the process of extracting data from websites. In this lesson,
          we'll learn how to use WebDataScout to extract structured data from web pages.
        </p>

        <h2>Live News Example</h2>
        <p>
          Let's extract data from a news website. This example shows how to get
          the latest headlines and article information:
        </p>

        {/* News extraction example */}
        <OaaLiveCard
          url="https://news.ycombinator.com"
          schema={[
            { name: 'title', required: true, type: 'string' },
            { name: 'stories', type: 'array' },
            { name: 'last_updated', type: 'string' }
          ]}
          refreshInterval={600} // 10 minutes
          children={(data, meta) => (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Live News Data
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Site Title:</span> {String(data.title || '')}
                </div>
                <div>
                  <span className="font-medium">Stories Count:</span> {Array.isArray(data.stories) ? String(data.stories.length) : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {String(data.last_updated || 'Unknown')}
                </div>
              </div>
              <div className="mt-3 text-sm text-green-700">
                <div>Source: {meta.url}</div>
                <div>Fetched: {new Date(meta.fetchedAt).toLocaleString()}</div>
              </div>
            </div>
          )}
        />

        <h2>Code Example</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <code>{`import { extract } from '@/lib/webDataScout';

const result = await extract('https://news.ycombinator.com', [
  { name: 'title', required: true, type: 'string' },
  { name: 'stories', type: 'array' },
  { name: 'last_updated', type: 'string' }
]);

if (result.ok) {
  console.log('Extracted data:', result.data);
} else {
  console.error('Extraction failed:', result.error);
}`}</code>
        </pre>

        <h2>Key Concepts</h2>
        <ul>
          <li><strong>Schema Definition</strong>: Define what data you want to extract</li>
          <li><strong>Error Handling</strong>: Always check the result.ok flag</li>
          <li><strong>Caching</strong>: Data is automatically cached for performance</li>
          <li><strong>PII Protection</strong>: Sensitive data is automatically redacted</li>
        </ul>
      </div>
    </div>
  );
}

// Example lesson about civic data
export function CivicDataLessonExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Civic Data and Open Government</h1>
      
      <div className="prose max-w-none">
        <h2>Introduction</h2>
        <p>
          Open government data provides transparency and enables civic engagement.
          Let's explore how to work with civic datasets using WebDataScout.
        </p>

        <h2>Live Civic Data Example</h2>
        <p>
          This example shows how to extract data from a city's open data portal:
        </p>

        {/* Civic data example */}
        <OaaCivicDataCard
          url="https://data.cityofchicago.org/api/views/example"
          children={(data: any, meta: any) => (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Live Civic Data
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Dataset:</span> Chicago Open Data
                </div>
                <div>
                  <span className="font-medium">Rows:</span> {Array.isArray(data.rows) ? data.rows.length : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Columns:</span> {Array.isArray(data.columns) ? data.columns.length : 'N/A'}
                </div>
                {data.metadata && (
                  <div>
                    <span className="font-medium">Metadata:</span> {JSON.stringify(data.metadata)}
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm text-purple-700">
                <div>Source: {meta.url}</div>
                <div>Fetched: {new Date(meta.fetchedAt).toLocaleString()}</div>
              </div>
            </div>
          )}
        />

        <h2>Benefits of Open Data</h2>
        <ul>
          <li><strong>Transparency</strong>: Citizens can see how government operates</li>
          <li><strong>Innovation</strong>: Developers can build useful applications</li>
          <li><strong>Accountability</strong>: Data helps hold officials accountable</li>
          <li><strong>Participation</strong>: Citizens can engage with their government</li>
        </ul>

        <h2>Data Quality Considerations</h2>
        <p>
          When working with civic data, consider:
        </p>
        <ul>
          <li>Data freshness and update frequency</li>
          <li>Data completeness and accuracy</li>
          <li>Privacy and PII protection</li>
          <li>Data format and structure</li>
        </ul>
      </div>
    </div>
  );
}

// Helper component for civic data cards
function OaaCivicDataCard({ url, children, ...props }: any) {
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
    >
      {children}
    </OaaLiveCard>
  );
}

export default {
  ApiLessonExample,
  WebScrapingLessonExample,
  CivicDataLessonExample,
};