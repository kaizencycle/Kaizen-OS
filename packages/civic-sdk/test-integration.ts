// Test script to verify Civic SDK integration with live APIs
import { CivicOSGateway, Lab7Client, Lab4Client, Lab6Client, OAAAPIClient, CivicLedgerClient, GICIndexerClient } from './src/index';

async function testCivicSDK() {
  console.log('🚀 Testing Civic OS SDK Integration...\n');

  // Test individual clients
  console.log('1. Testing individual API clients...');
  
  try {
    const lab7 = new Lab7Client();
    const health = await lab7.getHealth();
    console.log('✅ Lab7 (OAA Hub):', health.status);
  } catch (error) {
    console.log('❌ Lab7 (OAA Hub):', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    const lab4 = new Lab4Client();
    const health = await lab4.getHealth();
    console.log('✅ Lab4 (E.O.M.M.):', health.status);
  } catch (error) {
    console.log('❌ Lab4 (E.O.M.M.):', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    const lab6 = new Lab6Client();
    const health = await lab6.getHealth();
    console.log('✅ Lab6 (Citizen Shield):', health.status);
  } catch (error) {
    console.log('❌ Lab6 (Citizen Shield):', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    const oaa = new OAAAPIClient();
    const health = await oaa.getHealth();
    console.log('✅ OAA API Library:', health.status);
  } catch (error) {
    console.log('❌ OAA API Library:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    const ledger = new CivicLedgerClient();
    const health = await ledger.getHealth();
    console.log('✅ Civic Ledger:', health.status);
  } catch (error) {
    console.log('❌ Civic Ledger:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    const gic = new GICIndexerClient();
    const health = await gic.getHealth();
    console.log('✅ GIC Indexer:', health.status);
  } catch (error) {
    console.log('❌ GIC Indexer:', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n2. Testing Civic OS Gateway...');

  try {
    const gateway = new CivicOSGateway();
    const systemHealth = await gateway.getSystemHealth();
    console.log('✅ System Health:', systemHealth.overall);
    console.log('   GI Score:', systemHealth.giScore.toFixed(3));
    console.log('   Healthy Services:', systemHealth.services.filter(s => s.status === 'healthy').length);
  } catch (error) {
    console.log('❌ System Health:', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n3. Testing citizen creation flow...');

  try {
    const gateway = new CivicOSGateway();
    const result = await gateway.createCitizen(
      'I want to become a .gic citizen and contribute to Civic OS',
      'testuser'
    );
    
    if (result.success) {
      console.log('✅ Citizen Creation Success!');
      console.log('   Username:', result.identity.username);
      console.log('   .gic Domain:', result.identity.gicDomain);
      console.log('   GIC Balance:', result.identity.gicBalance);
      console.log('   GI Score:', result.identity.giScore.toFixed(3));
    } else {
      console.log('❌ Citizen Creation Failed:', result.errors);
    }
  } catch (error) {
    console.log('❌ Citizen Creation Error:', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n🎉 Civic SDK Integration Test Complete!');
}

// Run the test
testCivicSDK().catch(console.error);
