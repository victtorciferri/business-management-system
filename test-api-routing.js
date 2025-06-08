// Test script to verify API routing with business slug
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:9002';
const BUSINESS_SLUG = 'salonelegante';
const BUSINESS_ID = 1;

async function testApiEndpoints() {
  console.log('Testing API endpoints with business slug routing...\n');

  // Test 1: Services endpoint
  try {
    console.log('1. Testing services endpoint...');
    const servicesUrl = `${BASE_URL}/${BUSINESS_SLUG}/api/services?businessId=${BUSINESS_ID}`;
    console.log(`   URL: ${servicesUrl}`);
    
    const servicesResponse = await fetch(servicesUrl);
    console.log(`   Status: ${servicesResponse.status}`);
    
    if (servicesResponse.ok) {
      const services = await servicesResponse.json();
      console.log(`   ✅ Services loaded: ${services.length} services found`);
      services.forEach(service => {
        console.log(`      - ${service.name} ($${service.price})`);
      });
    } else {
      console.log(`   ❌ Services failed: ${servicesResponse.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Services error: ${error.message}`);
  }

  console.log();

  // Test 2: Staff endpoint
  try {
    console.log('2. Testing staff endpoint...');
    const staffUrl = `${BASE_URL}/${BUSINESS_SLUG}/api/staff?businessId=${BUSINESS_ID}`;
    console.log(`   URL: ${staffUrl}`);
    
    const staffResponse = await fetch(staffUrl);
    console.log(`   Status: ${staffResponse.status}`);
    
    if (staffResponse.ok) {
      const staff = await staffResponse.json();
      console.log(`   ✅ Staff loaded: ${staff.length} staff members found`);
      staff.forEach(member => {
        console.log(`      - ${member.username} (ID: ${member.id})`);
      });
    } else {
      console.log(`   ❌ Staff failed: ${staffResponse.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Staff error: ${error.message}`);
  }

  console.log();

  // Test 3: Check customer exists endpoint
  try {
    console.log('3. Testing check customer exists endpoint...');
    const checkCustomerUrl = `${BASE_URL}/${BUSINESS_SLUG}/api/customers/check-customer-exists`;
    console.log(`   URL: ${checkCustomerUrl}`);
    
    const checkCustomerResponse = await fetch(checkCustomerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        businessId: BUSINESS_ID
      })
    });
    
    console.log(`   Status: ${checkCustomerResponse.status}`);
    
    if (checkCustomerResponse.ok) {
      const result = await checkCustomerResponse.json();
      console.log(`   ✅ Check customer endpoint working`);
      console.log(`      Customer exists: ${result.exists}`);
    } else {
      console.log(`   ❌ Check customer failed: ${checkCustomerResponse.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Check customer error: ${error.message}`);
  }

  console.log();

  // Test 4: Compare with old routing (should fail)
  try {
    console.log('4. Testing old routing (should fail)...');
    const oldServicesUrl = `${BASE_URL}/api/services?businessId=${BUSINESS_ID}`;
    console.log(`   URL: ${oldServicesUrl}`);
    
    const oldServicesResponse = await fetch(oldServicesUrl);
    console.log(`   Status: ${oldServicesResponse.status}`);
    
    if (oldServicesResponse.ok) {
      console.log(`   ⚠️  Old routing still works (unexpected)`);
    } else {
      console.log(`   ✅ Old routing properly blocked: ${oldServicesResponse.statusText}`);
    }
  } catch (error) {
    console.log(`   ✅ Old routing properly blocked: ${error.message}`);
  }

  console.log('\nTest completed!');
}

// Run the tests
testApiEndpoints().catch(console.error);
