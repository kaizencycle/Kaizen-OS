import ATLASSentinel from './src/atlas-simple.js';

const atlas = new ATLASSentinel();

console.log('🤖 ATLAS Sentinel - Simple Version\n');

// Test health check
console.log('Testing health check...');
atlas.healthCheck().then(result => {
  console.log(result);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test GI score calculation
  console.log('Testing GI score calculation...');
  return atlas.calculateGIScore('system');
}).then(result => {
  console.log(result);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test memory storage
  console.log('Testing memory storage...');
  console.log(atlas.storeMemory('test_key', 'test_value'));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test memory retrieval
  console.log('Testing memory retrieval...');
  console.log(atlas.getMemory('test_key'));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test clock in
  console.log('Testing clock in...');
  console.log(atlas.clockIn(['Monitor APIs', 'Test functionality']));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test clock out
  console.log('Testing clock out...');
  console.log(atlas.clockOut(['Health check successful', 'GI score calculated'], ['None'], ['Continue monitoring']));
  
}).catch(error => {
  console.error('❌ Error:', error.message);
});
