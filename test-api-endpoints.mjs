#!/usr/bin/env node

/**
 * Test script to check various API endpoints and identify routing issues
 */

const BASE_URL = 'http://localhost:9002';

async function testEndpoint(url, description, options = {}) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    if (status >= 200 && status < 300) {
      console.log(`   ✅ Success: ${status} ${statusText}`);
      
      // Try to parse response body if it's JSON
      try {
        const data = await response.json();
        console.log(`   📦 Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (e) {
        console.log(`   📦 Response: [Non-JSON response]`);
      }
    } else {
      console.log(`   ❌ Failed: ${status} ${statusText}`);
      
      try {
        const errorData = await response.text();
        console.log(`   📦 Error: ${errorData.substring(0, 200)}...`);
      } catch (e) {
        console.log(`   📦 Error: [Could not read response]`);
      }
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing API Endpoints for Business Dashboard Issues');
  console.log('=' .repeat(60));
  
  // Test main API endpoints
  await testEndpoint(`${BASE_URL}/api/services`, 'Main Services API');
  await testEndpoint(`${BASE_URL}/api/services?businessId=1`, 'Main Services API with business ID');
  await testEndpoint(`${BASE_URL}/api/staff`, 'Main Staff API');
  await testEndpoint(`${BASE_URL}/api/staff?businessId=1`, 'Main Staff API with business ID');
  await testEndpoint(`${BASE_URL}/api/staff/3/availability`, 'Staff Availability API');
  await testEndpoint(`${BASE_URL}/api/appointments`, 'Main Appointments API');
  await testEndpoint(`${BASE_URL}/api/appointments?userId=1`, 'Main Appointments API with user ID');
  
  // Test business-specific API endpoints (using a business slug if available)
  await testEndpoint(`${BASE_URL}/test-business/api/services`, 'Business Slug Services API');
  await testEndpoint(`${BASE_URL}/test-business/api/staff`, 'Business Slug Staff API');
  await testEndpoint(`${BASE_URL}/test-business/api/appointments`, 'Business Slug Appointments API');
  
  // Test customer portal API endpoints
  await testEndpoint(`${BASE_URL}/customer-portal/api/services`, 'Customer Portal Services API');
  await testEndpoint(`${BASE_URL}/customer-portal/api/services?businessId=1`, 'Customer Portal Services API with business ID');
  await testEndpoint(`${BASE_URL}/customer-portal/api/staff`, 'Customer Portal Staff API');
  await testEndpoint(`${BASE_URL}/customer-portal/api/staff?businessId=1`, 'Customer Portal Staff API with business ID');
  
  // Test specific endpoint that might be conflicting
  await testEndpoint(`${BASE_URL}/api/customers/check-customer-exists`, 'Customer Check API (POST)', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@example.com',
      businessId: 1
    })
  });
  
  // Test current business endpoint
  await testEndpoint(`${BASE_URL}/api/current-business`, 'Current Business API');
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 API Endpoint Testing Complete');
}

runTests().catch(console.error);
