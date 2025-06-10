// Simple test to debug body parsing issue

async function testCustomerCheck() {
  console.log('🔍 Testing Customer Check Endpoint');
  console.log('='.repeat(50));
  
  try {
    console.log('Making request...');
    const response = await fetch('http://localhost:9002/api/customers/check-customer-exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        businessId: 1
      })
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('Attempting to read JSON...');
      const data = await response.json();
      console.log('✅ JSON read successfully:', data);
    } else {
      console.log('Response not OK, reading text...');
      const text = await response.text();
      console.log('Error text:', text);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Full error:', error);
  }
}

testCustomerCheck();
