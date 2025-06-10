// Comprehensive API endpoint testing script
// Tests all routes in routes.ts and individual route files

const baseURL = 'http://localhost:9002';
const businessSlug = 'test-business';

// Test data
const testCustomer = {
  firstName: 'Test',
  lastName: 'Customer',
  email: 'test@example.com',
  phone: '1234567890'
};

const testAppointment = {
  customerId: 1,
  serviceId: 1,
  staffId: 3,
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  duration: 60,
  status: 'scheduled',
  notes: 'Test appointment'
};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const result = {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    };
    
    try {
      const data = await response.json();
      result.data = data;
    } catch (e) {
      const text = await response.text();
      result.text = text;
    }
    
    return result;
  } catch (error) {
    return {
      url,
      error: error.message,
      status: 'ERROR'
    };
  }
}

async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check Endpoint');
  console.log('='.repeat(50));
  
  const result = await makeRequest(`${baseURL}/health`);
  console.log(`Status: ${result.status} - ${result.ok ? '✅' : '❌'}`);
  if (result.data) console.log(`Response:`, result.data);
}

async function testMainAPIRoutes() {
  console.log('\n🌐 Testing Main API Routes');
  console.log('='.repeat(50));
  
  const endpoints = [
    // Admin routes
    { url: `${baseURL}/api/admin`, method: 'GET', description: 'Admin routes' },
    
    // Staff routes
    { url: `${baseURL}/api/staff?businessId=1`, method: 'GET', description: 'Staff list with business ID' },
    { url: `${baseURL}/api/staff/3/availability?businessId=1`, method: 'GET', description: 'Staff availability' },
      // Auth routes
    { url: `${baseURL}/api/auth/register`, method: 'POST', description: 'User registration', body: {
      email: 'newtest@example.com',
      password: 'password123',
      businessName: 'New Test Business',
      businessSlug: 'new-test-business',
      firstName: 'New',
      lastName: 'Test',
      username: 'newtest'
    }},
    { url: `${baseURL}/api/auth/login`, method: 'POST', description: 'User login', body: {
      email: 'test@example.com',
      password: 'password123'
    }},
    
    // Business routes
    { url: `${baseURL}/api/business`, method: 'GET', description: 'Business info' },
    
    // Appointment routes (services and appointments)
    { url: `${baseURL}/api/services`, method: 'GET', description: 'Services list' },
    { url: `${baseURL}/api/appointments`, method: 'GET', description: 'Appointments list' },
    
    // Customer routes
    { url: `${baseURL}/api/customers`, method: 'GET', description: 'Customers list' },
    { url: `${baseURL}/api/customers/check-customer-exists`, method: 'POST', description: 'Check customer exists', body: {
      email: 'customer@example.com',
      businessId: 1
    }},
    
    // Product routes
    { url: `${baseURL}/api/products`, method: 'GET', description: 'Products list' },
    
    // Shopping cart routes
    { url: `${baseURL}/api/cart`, method: 'GET', description: 'Shopping cart' },
    
    // Payment routes
    { url: `${baseURL}/api/payments`, method: 'GET', description: 'Payments list' },
    
    // Theme routes
    { url: `${baseURL}/api/themes`, method: 'GET', description: 'Themes list' },
    { url: `${baseURL}/api/theme-api`, method: 'GET', description: 'Theme API' }
  ];
  
  for (const endpoint of endpoints) {
    const options = {
      method: endpoint.method,
      ...(endpoint.body && { body: JSON.stringify(endpoint.body) })
    };
    
    const result = await makeRequest(endpoint.url, options);
    const status = result.ok ? '✅' : result.status === 401 ? '🔐' : result.status === 404 ? '🚫' : '❌';
    console.log(`${status} ${endpoint.description}: ${result.status} ${result.statusText}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.status >= 400 && result.data?.message) {
      console.log(`   Message: ${result.data.message}`);
    }
  }
}

async function testBusinessSlugAPIRoutes() {
  console.log('\n🏢 Testing Business Slug API Routes');
  console.log('='.repeat(50));
  
  // First, create a test business or use existing one
  const endpoints = [
    { url: `${baseURL}/${businessSlug}/api/services`, method: 'GET', description: 'Business services' },
    { url: `${baseURL}/${businessSlug}/api/appointments`, method: 'GET', description: 'Business appointments' },
    { url: `${baseURL}/${businessSlug}/api/customers`, method: 'GET', description: 'Business customers' },
    { url: `${baseURL}/${businessSlug}/api/staff`, method: 'GET', description: 'Business staff' },
    { url: `${baseURL}/${businessSlug}/api/products`, method: 'GET', description: 'Business products' },
    { url: `${baseURL}/${businessSlug}/api/business`, method: 'GET', description: 'Business info via slug' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.url, { method: endpoint.method });
    const status = result.ok ? '✅' : result.status === 401 ? '🔐' : result.status === 404 ? '🚫' : '❌';
    console.log(`${status} ${endpoint.description}: ${result.status} ${result.statusText}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.status >= 400 && result.data?.message) {
      console.log(`   Message: ${result.data.message}`);
    }
  }
}

async function testCustomerPortalAPIRoutes() {
  console.log('\n👥 Testing Customer Portal API Routes');
  console.log('='.repeat(50));
  
  const endpoints = [
    { url: `${baseURL}/customer-portal/api/services?businessId=1`, method: 'GET', description: 'Customer portal services' },
    { url: `${baseURL}/customer-portal/api/staff?businessId=1`, method: 'GET', description: 'Customer portal staff' },
    { url: `${baseURL}/customer-portal/api/staff/3/availability?businessId=1`, method: 'GET', description: 'Customer portal staff availability' },
    { url: `${baseURL}/customer-portal/api/customers/check-customer-exists`, method: 'POST', description: 'Customer portal check customer', body: {
      email: 'customer@example.com',
      businessId: 1
    }},
    { url: `${baseURL}/customer-portal/api/zero-friction-lookup`, method: 'POST', description: 'Zero friction lookup', body: {
      email: 'customer@example.com',
      businessId: 1
    }}
  ];
  
  for (const endpoint of endpoints) {
    const options = {
      method: endpoint.method,
      ...(endpoint.body && { body: JSON.stringify(endpoint.body) })
    };
    
    const result = await makeRequest(endpoint.url, options);
    const status = result.ok ? '✅' : result.status === 401 ? '🔐' : result.status === 404 ? '🚫' : '❌';
    console.log(`${status} ${endpoint.description}: ${result.status} ${result.statusText}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.status >= 400 && result.data?.message) {
      console.log(`   Message: ${result.data.message}`);
    }
  }
}

async function testDebugRoutes() {
  console.log('\n🐛 Testing Debug Routes (Development Only)');
  console.log('='.repeat(50));
  
  if (process.env.NODE_ENV !== 'development') {
    console.log('⏭️ Skipping debug routes (not in development mode)');
    return;
  }
  
  const endpoints = [
    { url: `${baseURL}/api/debug`, method: 'GET', description: 'Debug routes' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.url, { method: endpoint.method });
    const status = result.ok ? '✅' : result.status === 401 ? '🔐' : result.status === 404 ? '🚫' : '❌';
    console.log(`${status} ${endpoint.description}: ${result.status} ${result.statusText}`);
  }
}

async function testStaticFiles() {
  console.log('\n📁 Testing Static File Serving');
  console.log('='.repeat(50));
  
  const endpoints = [
    { url: `${baseURL}/uploads/`, method: 'GET', description: 'Uploads directory' },
    { url: `${baseURL}/`, method: 'GET', description: 'Root path (should redirect or serve React)' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.url, { method: endpoint.method });
    const status = result.ok ? '✅' : result.status === 404 ? '🚫' : result.status >= 300 && result.status < 400 ? '🔄' : '❌';
    console.log(`${status} ${endpoint.description}: ${result.status} ${result.statusText}`);
  }
}

async function runAllTests() {
  console.log('🚀 Comprehensive API Endpoint Testing');
  console.log('='.repeat(70));
  console.log(`Testing server at: ${baseURL}`);
  console.log(`Test time: ${new Date().toLocaleString()}`);
  
  await testHealthCheck();
  await testMainAPIRoutes();
  await testBusinessSlugAPIRoutes();
  await testCustomerPortalAPIRoutes();
  await testDebugRoutes();
  await testStaticFiles();
  
  console.log('\n' + '='.repeat(70));
  console.log('🏁 API Endpoint Testing Complete');
  console.log('\nLegend:');
  console.log('✅ - Working correctly');
  console.log('🔐 - Authentication required (expected)');
  console.log('🚫 - Not found (may be expected)');
  console.log('🔄 - Redirect (expected for some routes)');
  console.log('❌ - Error (needs investigation)');
}

// Run the tests
runAllTests().catch(console.error);
