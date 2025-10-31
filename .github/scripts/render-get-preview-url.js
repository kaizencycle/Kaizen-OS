#!/usr/bin/env node

/**
 * Best-effort Render GraphQL query for PR Preview URL.
 * If your account uses a different endpoint/schema, adjust the query below.
 */

const https = require('https');

const API = 'https://api.render.com/v1/graphql';
const TOKEN = process.env.RENDER_API_KEY;
const SERVICE_ID = process.env.RENDER_SERVICE_ID;
const PR_NUMBER = process.env.PR_NUMBER;
const BRANCH = process.env.BRANCH;

if (!TOKEN || !SERVICE_ID) {
  console.error('Missing RENDER_API_KEY or RENDER_SERVICE_ID');
  process.exit(1);
}

const query = `
query PreviewURLs($serviceId: ID!) {
  service(id: $serviceId) {
    id
    name
    previewEnvironments {
      pullRequestId
      branch
      url
      updatedAt
      status
    }
  }
}
`;

const body = JSON.stringify({ query, variables: { serviceId: SERVICE_ID } });

const req = https.request(API, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  let data = '';
  res.on('data', c => (data += c));
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.errors) {
        console.error('Render GraphQL error:', JSON.stringify(json.errors));
        process.exit(1);
      }
      const envs = json?.data?.service?.previewEnvironments || [];
      // Prefer exact PR match, then branch, then latest healthy
      let pick =
        envs.find(e => String(e.pullRequestId) === String(PR_NUMBER) && e.status === 'live') ||
        envs.find(e => e.branch === BRANCH && e.status === 'live') ||
        envs.sort((a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt))
            .find(e => e.status === 'live');

      if (!pick?.url) {
        console.error('No live Render preview URL found for this PR/branch.');
        process.exit(1);
      }

      process.stdout.write(pick.url.trim());
    } catch (e) {
      console.error('Failed parsing Render response:', e);
      process.exit(1);
    }
  });
});

req.on('error', err => {
  console.error('Request error:', err);
  process.exit(1);
});

req.write(body);
req.end();

