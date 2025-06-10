#!/usr/bin/env node

/**
 * Test specific API endpoints that should now be working
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
        console.log(`   📦 Response: ${JSON.stringify(data).substring(0, 150)}...`);
        return data;
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
  console.log('🚀 Testing Fixed API Endpoints');
  console.log('=' .repeat(50));
  
  // Test staff availability with businessId (should now work)
  console.log('\n🔧 Testing Staff Availability with Business Context:');
  await testEndpoint(`${BASE_URL}/api/staff/3/availability?businessId=1`, 'Staff Availability with Business ID');
  
  // Test customer portal staff API (should not show passwords)
  console.log('\n👥 Testing Customer Portal APIs:');
  const staffData = await testEndpoint(`${BASE_URL}/customer-portal/api/staff?businessId=1`, 'Customer Portal Staff API');
  
  if (staffData && staffData.length > 0) {
    if (staffData[0].password) {
      console.log('   ⚠️  WARNING: Password field is still exposed!');
    } else {
      console.log('   ✅ Good: No password field exposed');
    }
  }
  
  // Test new customer portal staff availability endpoint
  await testEndpoint(`${BASE_URL}/customer-portal/api/staff/3/availability?businessId=1`, 'Customer Portal Staff Availability');
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Fixed API Endpoint Testing Complete');
}

runTests().catch(console.error);
