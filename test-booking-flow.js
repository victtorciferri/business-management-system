/**
 * Test script to verify the customer portal booking flow
 * This script tests the end-to-end authentication and booking process
 */

const BASE_URL = 'http://localhost:9002';

// Test data
const testCustomer = {
  businessId: 1,
  email: 'test.customer@example.com',
  firstName: 'Test',
  lastName: 'Customer',
  phone: '555-1234'
};

const testAppointment = {
  businessId: 1,
  serviceId: 1,
  staffId: 1,
  customerId: null, // Will be set after creating customer
  date: '2025-01-15',
  time: '10:00',
  notes: 'Test appointment'
};

async function makeRequest(url, method = 'GET', body = null, headers = {}) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    }
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  console.log(`Making ${method} request to ${url}`);
  const response = await fetch(url, config);
  
  console.log(`Response: ${response.status} ${response.statusText}`);
  
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } else {
      const text = await response.text();
      console.log('Response text (first 200 chars):', text.substring(0, 200));
      return null;
    }
  } else {
    console.error(`Request failed: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error('Error response:', text.substring(0, 200));
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

async function testBookingFlow() {
  console.log('🚀 Starting customer portal booking flow test...\n');
  
  try {
    // Step 1: Test services endpoint (should work)
    console.log('📋 Step 1: Testing services endpoint...');
    const services = await makeRequest(`${BASE_URL}/api/services?businessId=1`);
    console.log(`✅ Found ${services?.length || 0} services\n`);
    
    // Step 2: Create customer access token (should work)
    console.log('🔑 Step 2: Creating customer access token...');
    const tokenResponse = await makeRequest(`${BASE_URL}/api/customers/customer-access-token`, 'POST', {
      email: testCustomer.email,
      businessId: testCustomer.businessId,
      sendEmail: false
    });
    
    if (!tokenResponse?.token) {
      throw new Error('Failed to create customer access token');
    }
    
    console.log(`✅ Created access token: ${tokenResponse.token.substring(0, 8)}...\n`);
    
    // Step 3: Test accessing customer profile with token (should work now)
    console.log('👤 Step 3: Testing customer profile access...');
    const customerProfile = await makeRequest(`${BASE_URL}/api/customers/customer-profile?token=${tokenResponse.token}`);
    
    if (customerProfile) {
      console.log(`✅ Customer profile accessible with token\n`);
    } else {
      console.log(`❌ Customer profile not accessible with token\n`);
    }
    
    // Step 4: Test appointments access without token (should fail gracefully)
    console.log('🚫 Step 4: Testing appointments endpoint without authentication (should fail gracefully)...');
    try {
      const appointmentsWithoutAuth = await makeRequest(`${BASE_URL}/api/appointments`);
      console.log(`❌ Appointments endpoint should require authentication but returned data`);
    } catch (error) {
      console.log(`✅ Appointments endpoint correctly requires authentication: ${error.message}\n`);
    }
    
    // Step 5: Create customer and appointment through public booking endpoint
    console.log('📅 Step 5: Testing public booking endpoint...');
    const bookingResponse = await makeRequest(`${BASE_URL}/api/customers/book-appointment`, 'POST', {
      ...testAppointment,
      customerEmail: testCustomer.email,
      customerFirstName: testCustomer.firstName,
      customerLastName: testCustomer.lastName,
      customerPhone: testCustomer.phone
    });
    
    if (bookingResponse) {
      console.log(`✅ Appointment booked successfully: ID ${bookingResponse.id}\n`);
    } else {
      console.log(`❌ Failed to book appointment\n`);
    }
    
    console.log('🎉 Customer portal booking flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testBookingFlow();
  }).catch(err => {
    console.log('node-fetch not available, trying with built-in fetch...');
    testBookingFlow();
  });
} else {
  // Browser environment
  window.testBookingFlow = testBookingFlow;
  console.log('Test function loaded. Run testBookingFlow() to start the test.');
}
