// Quick test for problematic endpoints

const baseURL = 'http://localhost:9002';

async function testProblematicEndpoints() {
  console.log('🔧 Testing Problematic API Endpoints');
  console.log('='.repeat(50));
  
  const endpoints = [
    { url: `${baseURL}/api/admin`, name: 'Admin' },
    { url: `${baseURL}/api/business`, name: 'Business' },
    { url: `${baseURL}/api/theme-api`, name: 'Theme API' },
    { url: `${baseURL}/api/payments`, name: 'Payments' },
    { url: `${baseURL}/api/services`, name: 'Services' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 ${endpoint.name}: ${endpoint.url}`);
      const response = await fetch(endpoint.url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`   ✅ JSON Response: ${typeof data}`);
      } else if (contentType.includes('text/html')) {
        console.log(`   📄 HTML Response (falling back to React app)`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

testProblematicEndpoints();
