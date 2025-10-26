// Test script for CivicOSHub integration
import { CivicOSHub } from './src/CivicOSHub';

async function testCivicOSHub() {
  console.log('🚀 Testing Kaizen OS Hub Integration...\n');

  const hub = new CivicOSHub();

  // Test 1: Health Check
  console.log('1. Testing service health...');
  try {
    const health = await hub.healthCheck();
    console.log('✅ Health Check Results:');
    Object.entries(health).forEach(([service, status]) => {
      console.log(`   ${service}: ${status ? '✅ Healthy' : '❌ Unhealthy'}`);
    });
  } catch (error) {
    console.log('❌ Health check failed:', error);
  }

  console.log('\n2. Testing citizen creation flow...');
  
  try {
    // Test citizen creation
    const identity = await hub.createCitizen(
      'testuser',
      'I want to join Kaizen OS and contribute to the digital renaissance'
    );
    
    console.log('✅ Citizen Created Successfully!');
    console.log('   Username:', identity.username);
    console.log('   Domain:', identity.domain);
    console.log('   Public Key:', identity.publicKey);
    console.log('   GIC Balance:', identity.gicBalance);
    console.log('   GI Score:', identity.giScore);
    
  } catch (error) {
    console.log('❌ Citizen creation failed:', error);
  }

  console.log('\n3. Testing individual service methods...');
  
  try {
    // Test Lab7 status
    console.log('   Testing Lab7 status...');
    const lab7Status = await fetch('https://lab7-proof.onrender.com/');
    const lab7Data = await lab7Status.json() as { service: string; version: string };
    console.log(`   ✅ Lab7: ${lab7Data.service} v${lab7Data.version}`);
  } catch (error) {
    console.log('   ❌ Lab7: Connection failed');
  }

  try {
    // Test Lab4 status
    console.log('   Testing Lab4 status...');
    const lab4Status = await fetch('https://hive-api-2le8.onrender.com/');
    const lab4Data = await lab4Status.json() as { status: string; version: string };
    console.log(`   ✅ Lab4: ${lab4Data.status} v${lab4Data.version}`);
  } catch (error) {
    console.log('   ❌ Lab4: Connection failed');
  }

  console.log('\n🎉 Kaizen OS Hub Integration Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Deploy the missing APIs (Lab6, OAA, Ledger, GIC Indexer)');
  console.log('   2. Start the GIC Gateway service');
  console.log('   3. Start the .gic Registry service');
  console.log('   4. Test the complete citizen creation flow');
}

// Run the test
testCivicOSHub().catch(console.error);


