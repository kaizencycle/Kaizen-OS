#!/usr/bin/env node

const crypto = require('crypto');

// Test the publish queue system
async function testPublishQueue() {
  console.log('🧪 Testing Publish Queue System...\n');

  const baseUrl = 'http://localhost:3000';
  const gatewayUrl = 'http://localhost:8787';
  
  // Test data
  const testData = {
    markdown: '# Test Post\n\nThis is a test post for the publish queue system.',
    integrityHex: '0x' + crypto.randomBytes(32).toString('hex')
  };

  try {
    // 1. Test publish endpoint
    console.log('1️⃣ Testing publish endpoint...');
    const publishRes = await fetch(`${baseUrl}/api/posts/publish?companion=jade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (!publishRes.ok) {
      throw new Error(`Publish failed: ${publishRes.status} ${publishRes.statusText}`);
    }
    
    const publishData = await publishRes.json();
    console.log('✅ Publish successful:', publishData);
    
    // 2. Wait a moment for worker to process
    console.log('\n2️⃣ Waiting for worker to process job...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Test gateway resolve (should show warmed: true if cache was warmed)
    console.log('3️⃣ Testing gateway resolve...');
    const resolveRes = await fetch(`${gatewayUrl}/resolve/jade`);
    
    if (!resolveRes.ok) {
      console.log('⚠️  Gateway resolve failed (expected if no on-chain data):', resolveRes.status);
    } else {
      const resolveData = await resolveRes.json();
      console.log('✅ Gateway resolve:', resolveData);
    }
    
    // 4. Test gateway health
    console.log('\n4️⃣ Testing gateway health...');
    const healthRes = await fetch(`${gatewayUrl}/`);
    const healthData = await healthRes.json();
    console.log('✅ Gateway health:', healthData);
    
    console.log('\n🎉 Test completed! Check worker logs for job processing details.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure all services are running:');
    console.log('   - Redis: docker run -p 6379:6379 redis:7-alpine');
    console.log('   - Worker: node -r esbuild-register workers/publishWorker.ts');
    console.log('   - Gateway: cd services/gic_gateway_service && npm run dev');
    console.log('   - Hub: cd companion_site_starter && npm run dev');
  }
}

// Run test if called directly
if (require.main === module) {
  testPublishQueue();
}

module.exports = { testPublishQueue };


