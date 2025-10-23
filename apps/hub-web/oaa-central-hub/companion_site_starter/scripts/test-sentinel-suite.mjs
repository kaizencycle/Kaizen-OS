#!/usr/bin/env node

/**
 * Test script for Sentinel Suite implementation
 * Run with: node scripts/test-sentinel-suite.mjs
 */

import { execSync } from 'child_process';
import fetch from 'node-fetch';

const BASE_URL = process.env.HUB_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.DEV_ADMIN_TOKEN || 'dev-123';

console.log('🧪 Testing Sentinel Suite Implementation\n');

// Test helper
async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`Testing ${name}...`);
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ ${name}: OK`);
      return data;
    } else {
      console.log(`❌ ${name}: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('1. Testing Queue Statistics API');
  const stats = await testEndpoint('Queue Stats', `${BASE_URL}/api/dev/queue/stats`);
  
  if (stats) {
    console.log(`   Queue Depth: ${stats.depth}`);
    console.log(`   Waiting: ${stats.waiting}, Active: ${stats.active}`);
    console.log(`   Failed: ${stats.failed}, Completed: ${stats.completed}`);
    console.log(`   Fail Rate: ${(stats.failRate * 100).toFixed(1)}%\n`);
  }

  console.log('2. Testing Sentinel Status API');
  const status = await testEndpoint('Sentinel Status', `${BASE_URL}/api/dev/sentinel/status`);
  
  if (status) {
    console.log(`   State: ${status.state || 'unknown'}`);
    console.log(`   CI Run: ${status.run ? 'Present' : 'None'}`);
    console.log(`   PR: ${status.pr ? `#${status.pr.number}` : 'None'}\n`);
  }

  console.log('3. Testing Sentinel Vitals API');
  const vitals = await testEndpoint('Sentinel Vitals', `${BASE_URL}/api/dev/sentinel/vitals`);
  
  if (vitals) {
    console.log(`   State: ${vitals.state}`);
    console.log(`   Depth: ${vitals.depth}, Fail Rate: ${(vitals.failRate * 100).toFixed(1)}%`);
    console.log(`   Window: ${vitals.windowMin} minutes\n`);
  }

  console.log('4. Testing Queue Admin Operations (requires admin token)');
  
  // Test pause
  const pauseResult = await testEndpoint('Queue Pause', `${BASE_URL}/api/dev/queue/pause`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dev-admin-token': ADMIN_TOKEN
    }
  });

  if (pauseResult) {
    console.log(`   Pause: ${pauseResult.message}`);
  }

  // Test resume
  const resumeResult = await testEndpoint('Queue Resume', `${BASE_URL}/api/dev/queue/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dev-admin-token': ADMIN_TOKEN
    }
  });

  if (resumeResult) {
    console.log(`   Resume: ${resumeResult.message}`);
  }

  // Test retry failed
  const retryResult = await testEndpoint('Retry Failed', `${BASE_URL}/api/dev/queue/retryFailed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dev-admin-token': ADMIN_TOKEN
    }
  });

  if (retryResult) {
    console.log(`   Retry: ${retryResult.message} (${retryResult.retryCount || 0} jobs)`);
  }

  console.log('\n5. Testing Sentinel Notify Webhook');
  const notifyResult = await testEndpoint('Sentinel Notify', `${BASE_URL}/api/dev/sentinel/notify`);
  
  if (notifyResult) {
    console.log(`   State: ${notifyResult.state}`);
    console.log(`   Webhook Sent: ${notifyResult.sent ? 'Yes' : 'No'}`);
    console.log(`   Webhook URL: ${notifyResult.webhookUrl || 'Not configured'}`);
    if (notifyResult.webhookError) {
      console.log(`   Webhook Error: ${notifyResult.webhookError}`);
    }
  }

  console.log('\n6. Testing Admin Console Page');
  try {
    const pageResponse = await fetch(`${BASE_URL}/dev/queue`);
    if (pageResponse.ok) {
      console.log('✅ Admin Console: Accessible');
    } else {
      console.log(`❌ Admin Console: ${pageResponse.status} ${pageResponse.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Admin Console: ${error.message}`);
  }

  console.log('\n7. Testing Sentinel Badge Component');
  try {
    const badgeResponse = await fetch(`${BASE_URL}/dev/context`);
    if (badgeResponse.ok) {
      console.log('✅ Sentinel Badge: Accessible on /dev/context');
    } else {
      console.log(`❌ Sentinel Badge: ${badgeResponse.status} ${badgeResponse.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Sentinel Badge: ${error.message}`);
  }

  console.log('\n🎉 Sentinel Suite Test Complete!');
  console.log('\nNext Steps:');
  console.log('1. Open http://localhost:3000/dev/queue in your browser');
  console.log('2. Enter your admin token to test queue operations');
  console.log('3. Check the Sentinel badge on /dev/context');
  console.log('4. Configure LEDGER_WEBHOOK_URL to test webhook integration');
  console.log('5. Set up GitHub repository variables for automated incident reporting');
}

// Check if required environment variables are set
if (!process.env.DEV_MODE) {
  console.log('⚠️  Warning: DEV_MODE not set. Some endpoints may not work.');
}

if (!process.env.REDIS_URL) {
  console.log('⚠️  Warning: REDIS_URL not set. Queue operations will fail.');
}

// Run the tests
runTests().catch(console.error);