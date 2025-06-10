// Test to debug route matching

async function testAPIRouteMatching() {
  console.log('🔍 Testing API Route Matching');
  console.log('='.repeat(50));
  
  const endpoints = [
    'http://localhost:9002/api/customers',
    'http://localhost:9002/api/customers/check-customer-exists'
  ];
  
  for (const url of endpoints) {
    console.log(`\n🔄 Testing: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: url.includes('check-customer-exists') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        ...(url.includes('check-customer-exists') && {
          body: JSON.stringify({
            email: 'test@example.com',
            businessId: 1
          })
        })
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log('✅ JSON Response:', data);
      } else if (contentType?.includes('text/html')) {
        const html = await response.text();
        console.log('📄 HTML Response (first 100 chars):', html.substring(0, 100));
      } else {
        const text = await response.text();
        console.log('📝 Text Response:', text.substring(0, 200));
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

testAPIRouteMatching();
