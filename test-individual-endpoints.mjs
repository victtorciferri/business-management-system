// Individual API endpoint testing to avoid body conflicts

const baseURL = 'http://localhost:9002';

async function testEndpointIndividually(url, method = 'GET', body = null, description = '') {
  console.log(`\n🔍 Testing: ${description || url}`);
  console.log(`   URL: ${url}`);
  console.log(`   Method: ${method}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    const status = response.ok ? '✅' : 
                  response.status === 401 ? '🔐' : 
                  response.status === 404 ? '🚫' : 
                  response.status >= 400 ? '❌' : '❓';
    
    console.log(`   ${status} Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    // Try to read response based on content type
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        if (response.ok) {
          console.log(`   ✅ JSON Response received (${typeof data})`);
          if (Array.isArray(data)) {
            console.log(`   📊 Array with ${data.length} items`);
          } else if (typeof data === 'object') {
            console.log(`   📋 Object with keys: ${Object.keys(data).join(', ')}`);
          }
        } else {
          console.log(`   ❌ Error: ${data.message || 'No error message'}`);
        }
      } catch (jsonError) {
        console.log(`   ❌ JSON Parse Error: ${jsonError.message}`);
      }
    } else if (contentType.includes('text/html')) {
      console.log(`   📄 HTML Response (likely React app fallback)`);
    } else {
      const text = await response.text();
      console.log(`   📝 Text Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
    }
    
    return {
      ok: response.ok,
      status: response.status,
      contentType
    };
    
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
    return {
      ok: false,
      error: error.message
    };
  }
}

async function runIndividualTests() {
  console.log('🚀 Individual API Endpoint Testing');
  console.log('='.repeat(70));
  console.log(`Testing server at: ${baseURL}`);
  console.log(`Test time: ${new Date().toLocaleString()}`);
  
  const tests = [
    // Health check
    { url: `${baseURL}/health`, description: 'Health Check' },
    
    // Admin routes
    { url: `${baseURL}/api/admin`, description: 'Admin Routes' },
    
    // Auth routes
    { 
      url: `${baseURL}/api/auth/register`, 
      method: 'POST', 
      body: {
        email: 'newtest@example.com',
        password: 'password123',
        businessName: 'New Test Business',
        businessSlug: 'new-test-business',
        firstName: 'New',
        lastName: 'Test',
        username: 'newtest'
      },
      description: 'Auth Registration'
    },
    
    // Business routes
    { url: `${baseURL}/api/business`, description: 'Business Info' },
    
    // Customer routes
    { url: `${baseURL}/api/customers`, description: 'Customers List' },
    { 
      url: `${baseURL}/api/customers/check-customer-exists`, 
      method: 'POST', 
      body: { email: 'test@example.com', businessId: 1 },
      description: 'Check Customer Exists'
    },
    
    // Staff routes
    { url: `${baseURL}/api/staff?businessId=1`, description: 'Staff List' },
    { url: `${baseURL}/api/staff/3/availability?businessId=1`, description: 'Staff Availability' },
    
    // Service and appointment routes
    { url: `${baseURL}/api/services`, description: 'Services List' },
    { url: `${baseURL}/api/appointments`, description: 'Appointments List' },
    
    // Product routes
    { url: `${baseURL}/api/products`, description: 'Products List' },
    
    // Theme routes
    { url: `${baseURL}/api/themes`, description: 'Themes List' },
    { url: `${baseURL}/api/theme-api`, description: 'Theme API' },
    
    // Payment routes
    { url: `${baseURL}/api/payments`, description: 'Payments List' },
    
    // Shopping cart
    { url: `${baseURL}/api/cart`, description: 'Shopping Cart' },
  ];
  
  let workingCount = 0;
  let authRequiredCount = 0;
  let errorCount = 0;
  
  for (const test of tests) {
    const result = await testEndpointIndividually(
      test.url, 
      test.method || 'GET', 
      test.body || null, 
      test.description
    );
    
    if (result.ok) {
      workingCount++;
    } else if (result.status === 401) {
      authRequiredCount++;
    } else {
      errorCount++;
    }
    
    // Small delay between tests to avoid conflicts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary:');
  console.log(`✅ Working Endpoints: ${workingCount}`);
  console.log(`🔐 Auth Required (Expected): ${authRequiredCount}`);
  console.log(`❌ Errors/Issues: ${errorCount}`);
  console.log(`📋 Total Tested: ${tests.length}`);
  console.log('\n🏁 Individual API Testing Complete');
}

runIndividualTests().catch(console.error);
