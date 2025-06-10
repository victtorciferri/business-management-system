// Simple focused test to identify body parsing issues

const baseURL = 'http://localhost:9002';

async function testSimpleEndpoints() {
  console.log('🔍 Testing Simple GET Endpoints');
  console.log('='.repeat(50));
  
  const getEndpoints = [
    `${baseURL}/health`,
    `${baseURL}/api/admin`,
    `${baseURL}/api/business`,
    `${baseURL}/api/themes`,
    `${baseURL}/api/theme-api`
  ];
  
  for (const url of getEndpoints) {
    try {
      const response = await fetch(url);
      const status = response.ok ? '✅' : response.status === 401 ? '🔐' : '❌';
      console.log(`${status} ${url}: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.log(`   Error: ${errorData.message || 'No error message'}`);
        } catch (e) {
          const errorText = await response.text();
          console.log(`   Error text: ${errorText.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${url}: Network error - ${error.message}`);
    }
  }
}

async function testPOSTEndpointsIndividually() {
  console.log('\n📮 Testing POST Endpoints Individually');
  console.log('='.repeat(50));
  
  // Test auth registration
  console.log('\n🔐 Testing Auth Registration:');
  try {
    const response = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        businessName: 'Test Business',
        businessSlug: 'test-business',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    try {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  // Test customer check
  console.log('\n👤 Testing Customer Check:');
  try {
    const response = await fetch(`${baseURL}/api/customers/check-customer-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        businessId: 1
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    try {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function runFocusedTests() {
  console.log('🎯 Focused API Testing - Body Parsing Investigation');
  console.log('='.repeat(70));
  
  await testSimpleEndpoints();
  await testPOSTEndpointsIndividually();
  
  console.log('\n' + '='.repeat(70));
  console.log('🏁 Focused Testing Complete');
}

runFocusedTests().catch(console.error);
