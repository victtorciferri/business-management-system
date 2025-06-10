// Using global fetch available in Node.js 18+

async function testCustomerPortalAPI() {
  const baseUrl = 'http://localhost:9002';
  
  console.log('Testing Customer Portal API endpoints...\n');
  
  // Test 1: Check-customer-exists endpoint
  console.log('1. Testing /customer-portal/api/customers/check-customer-exists');
  try {
    const response = await fetch(`${baseUrl}/customer-portal/api/customers/check-customer-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        businessId: 1
      })
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Check-customer-exists endpoint is working\n');
  } catch (error) {
    console.error('❌ Error testing check-customer-exists:', error.message);
  }
  
  // Test 2: Services endpoint
  console.log('2. Testing /customer-portal/api/services');
  try {
    const response = await fetch(`${baseUrl}/customer-portal/api/services?businessId=1`);
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Services endpoint is working\n');
  } catch (error) {
    console.error('❌ Error testing services:', error.message);
  }
  
  // Test 3: Staff endpoint
  console.log('3. Testing /customer-portal/api/staff');
  try {
    const response = await fetch(`${baseUrl}/customer-portal/api/staff?businessId=1`);
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Staff endpoint is working\n');
  } catch (error) {
    console.error('❌ Error testing staff:', error.message);
  }
}

testCustomerPortalAPI();
